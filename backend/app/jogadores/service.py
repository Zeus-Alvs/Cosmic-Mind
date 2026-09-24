from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException
from passlib.context import CryptContext

from app.core.database import db
from app.jogadores.repository import (
    add_jogador_ao_usuario,
    delete_jogador,
    find_jogador_by_id,
    find_jogadores_by_ids,
    find_user_by_id,
    insert_jogador,
    remove_jogador_do_usuario,
    update_jogador_by_id,
    update_sessao_expiration,
)
from app.vinculos.service import notificar_rede_do_jogador
from models import ExcluirJogador, JogadorCadastro, JogadorUpdate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def gerar_codigo_unico():
    import random
    import string

    caracteres = string.ascii_uppercase + string.digits
    while True:
        codigo = "".join(random.choices(caracteres, k=6))
        if not db["jogador"].find_one({"codigo_vinculo": codigo}):
            return codigo


def criar_jogador(id_usuario: str, dados: JogadorCadastro, current_user: dict):
    if str(current_user["_id"]) != id_usuario:
        raise HTTPException(status_code=403, detail="Você não tem permissão para adicionar jogadores a este usuário.")

    novo_jogador = {
        "codigo_vinculo": gerar_codigo_unico(),
        "apelido": dados.apelido,
        "data_nascimento": dados.data_nascimento,
        "foto_perfil": dados.foto_perfil,
        "preferencias_jogo": {"volume_musica": 50, "daltonismo_modo": False},
        "planetas_desbloqueados": ["57b6d77617cbdc1499b06cab3d9f650e"],
        "melhores_pontuacoes": [],
        "pets_desbloqueados": [],
        "conquistas_obtidas": [],
    }

    resultado = insert_jogador(novo_jogador)
    id_novo_jogador = resultado.inserted_id

    add_jogador_ao_usuario(ObjectId(id_usuario), id_novo_jogador)

    from app.vinculos.service import criar_notificacao
    criar_notificacao(
        id_destino=ObjectId(id_usuario),
        tipo="info",
        titulo="Novo Perfil Criado",
        descricao=f"O perfil do jogador {dados.apelido} foi criado e vinculado à sua conta com sucesso.",
        link_to="/performance"
    )

    return {
        "message": "Jogador criado com sucesso.",
        "id": str(id_novo_jogador),
        "id_jogador": str(id_novo_jogador),
    }


def listar_jogadores(id_usuario: str, current_user: dict):
    if str(current_user["_id"]) != id_usuario:
        raise HTTPException(status_code=403, detail="Você não tem permissão para listar jogadores deste usuário.")

    usuario = find_user_by_id(ObjectId(id_usuario))
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    ids_jogadores = usuario.get("jogadores_vinculados", [])
    jogadores_banco = list(find_jogadores_by_ids(ids_jogadores))

    resultado = []
    for jogador in jogadores_banco:
        id_jogador = str(jogador["_id"])
        resultado.append({
            "id": id_jogador,
            "id_jogador": id_jogador,
            "codigo_vinculo": jogador.get("codigo_vinculo"),
            "nome": jogador.get("apelido", "Jogador"),
            "foto_perfil": jogador.get("foto_perfil", 1),
            "progresso": 0,
            "tempoUso": "0 Horas",
            "nivelFase": "1 - Mercúrio",
            "pontuacao": 0,
        })

    return resultado


def desconectar_jogador(id_jogador: str, current_user: dict):
    if ObjectId(id_jogador) not in current_user.get("jogadores_vinculados", []):
        raise HTTPException(status_code=403, detail="Você não tem permissão sobre este jogador.")

    sessao = db["sessao"].find_one({"id_jogador": id_jogador})
    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada.")

    update_sessao_expiration(id_jogador, datetime.now(timezone.utc))

    try:
        id_jogador_obj = ObjectId(id_jogador)
        jogador = db["jogador"].find_one({"_id": id_jogador_obj})
        nome_jogador = jogador.get("apelido", "O paciente") if jogador else "O paciente"

        notificar_rede_do_jogador(
            id_jogador=id_jogador_obj,
            tipo="pausa",
            titulo="Sessão Encerrada",
            descricao=f"A conexão do jogo de {nome_jogador} foi encerrada pelo painel.",
            link_to=None
        )
    except Exception as e:
        print(f"Erro ao enviar notificação de desconexão: {e}")

    return {"message": "Dispositivos desconectados com sucesso."}


def atualizar_jogador(id_jogador: str, dados: JogadorUpdate, current_user: dict):
    if ObjectId(id_jogador) not in current_user.get("jogadores_vinculados", []):
        raise HTTPException(status_code=403, detail="Você não tem permissão para alterar este jogador.")

    campos_para_atualizar = {k: v for k, v in dados.model_dump(exclude_none=True).items()}
    if not campos_para_atualizar:
        return {"message": "Nenhum dado para atualizar."}

    resultado = update_jogador_by_id(ObjectId(id_jogador), campos_para_atualizar)
    if resultado.matched_count == 0:
        raise HTTPException(status_code=404, detail="Jogador não encontrado.")

    return {"message": "Jogador atualizado com sucesso!"}


def excluir_jogador(id_usuario: str, id_jogador: str, payload: ExcluirJogador, current_user: dict):
    if str(current_user["_id"]) != id_usuario:
        raise HTTPException(status_code=403, detail="Você não tem permissão para deletar jogadores deste usuário.")

    usuario = find_user_by_id(ObjectId(id_usuario))
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    if not pwd_context.verify(payload.senha, usuario["senha"]):
        raise HTTPException(status_code=400, detail="Senha incorreta.")

    remove_jogador_do_usuario(ObjectId(id_usuario), ObjectId(id_jogador))

    resultado = delete_jogador(ObjectId(id_jogador))
    if resultado.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Jogador não encontrado.")

    db["sessao"].delete_many({"id_jogador": id_jogador})

    return {"message": "Jogador excluído permanentemente."}