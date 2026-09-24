from datetime import datetime

from bson import ObjectId
from fastapi import HTTPException

from app.core.database import db, usuarios
from app.vinculos.repository import (
    add_player_to_user,
    delete_request,
    find_jogador_by_codigo,
    find_jogador_by_id,
    find_notifications_for_user,
    find_pending_request,
    find_request_by_id,
    find_requests_by_player_ids,
    find_user_by_id,
    insert_notification,
    insert_request,
    remove_player_from_user,
    update_request,
)
from models import ResponderVinculo, SolicitarVinculo


def criar_notificacao(id_destino, tipo: str, titulo: str, descricao: str, link_to: str = None):
    insert_notification({
        "id_usuario_destino": id_destino,
        "type": tipo,
        "title": titulo,
        "description": descricao,
        "isLink": bool(link_to),
        "linkTo": link_to,
        "lida": False,
        "criado_em": datetime.utcnow(),
    })


def notificar_rede_do_jogador(id_jogador, tipo: str, titulo: str, descricao: str, link_to: str = None):
    """Encontra responsáveis e especialistas vinculados ao jogador e notifica todos."""
    if isinstance(id_jogador, str):
        id_jogador = ObjectId(id_jogador)
        
    usuarios_interessados = usuarios.find({"jogadores_vinculados": id_jogador})
    for usuario in usuarios_interessados:
        criar_notificacao(usuario["_id"], tipo, titulo, descricao, link_to)


def solicitar_vinculo(dados: SolicitarVinculo, current_user: dict):
    if current_user.get("tipo_perfil") != "especialista":
        raise HTTPException(status_code=403, detail="Apenas especialistas podem solicitar vínculos.")

    codigo_limpo = dados.codigo_vinculo.strip().upper()
    jogador = find_jogador_by_codigo(codigo_limpo)

    if not jogador:
        raise HTTPException(status_code=404, detail="Paciente não encontrado com este código.")

    id_jogador_obj = jogador["_id"]

    if id_jogador_obj in current_user.get("jogadores_vinculados", []):
        raise HTTPException(status_code=400, detail="Você já acompanha este paciente.")

    solicitacao_existente = find_pending_request(current_user["_id"], id_jogador_obj)
    if solicitacao_existente:
        raise HTTPException(status_code=400, detail="Você já enviou uma solicitação para este paciente.")

    insert_request({
        "id_especialista": current_user["_id"],
        "id_jogador": id_jogador_obj,
        "status": "pendente",
        "criado_em": datetime.utcnow(),
    })

    responsavel = usuarios.find_one({
        "jogadores_vinculados": id_jogador_obj,
        "tipo_perfil": "responsavel",
    })

    if responsavel:
        criar_notificacao(
            id_destino=responsavel["_id"],
            tipo="solicitacao",
            titulo="Nova Solicitação de Acompanhamento",
            descricao=f"O especialista {current_user['nome']} deseja visualizar o desempenho de {jogador['apelido']}.",
            link_to="/requests",
        )

    return {"message": "Solicitação enviada com sucesso ao responsável!"}


def listar_solicitacoes_pendentes(current_user: dict):
    if current_user.get("tipo_perfil") != "responsavel":
        raise HTTPException(status_code=403, detail="Apenas responsáveis podem gerenciar solicitações.")

    jogadores_do_responsavel = current_user.get("jogadores_vinculados", [])
    if not jogadores_do_responsavel:
        return []

    solicitacoes = find_requests_by_player_ids(jogadores_do_responsavel, status="pendente")
    resultado = []
    for sol in solicitacoes:
        especialista = find_user_by_id(sol["id_especialista"])
        jogador = find_jogador_by_id(sol["id_jogador"])
        resultado.append({
            "id_solicitacao": str(sol["_id"]),
            "nome_especialista": especialista["nome"] if especialista else "Especialista Desconhecido",
            "foto_especialista": especialista.get("avatar", 1) if especialista else 1,
            "nome_jogador": jogador["apelido"] if jogador else "Criança Desconhecida",
            "foto_jogador": jogador.get("foto_perfil", 1) if jogador else 1,
            "id_jogador": str(sol["id_jogador"]),
        })
    return resultado


def responder_solicitacao(dados: ResponderVinculo, current_user: dict):
    if current_user.get("tipo_perfil") != "responsavel":
        raise HTTPException(status_code=403, detail="Apenas responsáveis podem aprovar vínculos.")

    try:
        id_sol_obj = ObjectId(dados.id_solicitacao)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de solicitação inválido.")

    solicitacao = db["solicitacoes_vinculo"].find_one({"_id": id_sol_obj, "status": "pendente"})
    if not solicitacao:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada ou já respondida.")

    if solicitacao["id_jogador"] not in current_user.get("jogadores_vinculados", []):
        raise HTTPException(status_code=403, detail="Você não tem permissão sobre este jogador.")

    if dados.acao == "aprovar":
        update_request(str(id_sol_obj), {"status": "aprovado"})
        add_player_to_user(solicitacao["id_especialista"], solicitacao["id_jogador"])

        jogador_alvo = find_jogador_by_id(solicitacao["id_jogador"])
        nome_jogador = jogador_alvo.get("apelido", "o paciente") if jogador_alvo else "o paciente"

        criar_notificacao(
            id_destino=solicitacao["id_especialista"],
            tipo="solicitacao",
            titulo="Vínculo Aprovado!",
            descricao=f"Seu pedido para acompanhar {nome_jogador} foi aprovado. Você já pode visualizar o relatório de desempenho.",
            link_to="/performance",
        )

        return {"message": "Vínculo aprovado! O especialista agora pode acompanhar o desempenho."}

    if dados.acao == "rejeitar":
        update_request(str(id_sol_obj), {"status": "rejeitado"})
        return {"message": "Solicitação rejeitada."}

    raise HTTPException(status_code=400, detail="Ação inválida. Use 'aprovar' ou 'rejeitar'.")


def buscar_jogador_por_codigo(codigo: str, current_user: dict):
    if current_user.get("tipo_perfil") != "especialista":
        raise HTTPException(status_code=403, detail="Acesso negado.")

    jogador = find_jogador_by_codigo(codigo)
    if not jogador:
        raise HTTPException(status_code=404, detail="Jogador não encontrado.")

    return {
        "codigo_vinculo": jogador.get("codigo_vinculo"),
        "apelido": jogador.get("apelido"),
        "foto_perfil": jogador.get("foto_perfil", 1),
    }


def meus_vinculos_especialista(current_user: dict):
    if current_user.get("tipo_perfil") != "especialista":
        raise HTTPException(status_code=403, detail="Acesso negado.")

    solicitacoes = list(db["solicitacoes_vinculo"].find({"id_especialista": current_user["_id"]}))
    resultado = []
    for sol in solicitacoes:
        jogador = find_jogador_by_id(sol["id_jogador"])
        if jogador:
            resultado.append({
                "id_solicitacao": str(sol["_id"]),
                "nome_jogador": jogador.get("apelido", "Paciente"),
                "foto_jogador": jogador.get("foto_perfil", 1),
                "codigo_vinculo": jogador.get("codigo_vinculo", ""),
                "status": sol["status"],
            })
    return resultado


def listar_pacientes_especialista(current_user: dict):
    if current_user.get("tipo_perfil") != "especialista":
        raise HTTPException(status_code=403, detail="Acesso negado.")

    ids_jogadores = current_user.get("jogadores_vinculados", [])
    jogadores_banco = list(db["jogador"].find({"_id": {"$in": ids_jogadores}}))

    resultado = []
    for jogador in jogadores_banco:
        resultado.append({
            "id": str(jogador["_id"]),
            "nome": jogador.get("apelido", "Paciente"),
            "foto_perfil": jogador.get("foto_perfil", 1),
            "codigo_vinculo": jogador.get("codigo_vinculo", ""),
            "progresso": 0,
            "tempoUso": "0 horas",
            "nivelFase": "1 - Mercúrio",
            "pontuacao": 0,
        })
    return resultado


def listar_vinculos_aprovados(current_user: dict):
    if current_user.get("tipo_perfil") != "responsavel":
        raise HTTPException(status_code=403, detail="Acesso negado.")

    jogadores_do_responsavel = current_user.get("jogadores_vinculados", [])
    if not jogadores_do_responsavel:
        return []

    solicitacoes = find_requests_by_player_ids(jogadores_do_responsavel, status="aprovado")
    resultado = []
    for sol in solicitacoes:
        especialista = find_user_by_id(sol["id_especialista"])
        jogador = find_jogador_by_id(sol["id_jogador"])
        resultado.append({
            "id_solicitacao": str(sol["_id"]),
            "nome_especialista": especialista["nome"] if especialista else "Especialista",
            "foto_especialista": especialista.get("avatar", 1) if especialista else 1,
            "nome_jogador": jogador["apelido"] if jogador else "Criança",
            "foto_jogador": jogador.get("foto_perfil", 1) if jogador else 1,
            "id_jogador": str(sol["id_jogador"]),
        })
    return resultado


def cancelar_vinculo(id_solicitacao: str, current_user: dict):
    try:
        solicitacao = find_request_by_id(id_solicitacao)
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido.")

    if not solicitacao:
        raise HTTPException(status_code=404, detail="Vínculo não encontrado.")

    is_dono_especialista = solicitacao["id_especialista"] == current_user["_id"]
    is_dono_responsavel = solicitacao["id_jogador"] in current_user.get("jogadores_vinculados", [])

    if not (is_dono_especialista or is_dono_responsavel):
        raise HTTPException(status_code=403, detail="Você não tem permissão para apagar este vínculo.")

    if solicitacao["status"] == "aprovado":
        remove_player_from_user(solicitacao["id_especialista"], solicitacao["id_jogador"])

    delete_request(id_solicitacao)
    return {"message": "Vínculo removido com sucesso."}


def listar_notificacoes(current_user: dict):
    notificacoes = find_notifications_for_user(current_user["_id"])
    resultado = []
    for notif in notificacoes:
        criado_em = notif.get("criado_em")
        resultado.append({
            "id": str(notif["_id"]),
            "type": notif.get("type", "info"),
            "title": notif.get("title", ""),
            "description": notif.get("description", ""),
            "createdAt": criado_em.isoformat() if hasattr(criado_em, "isoformat") else str(criado_em),
            "isLink": notif.get("isLink", False),
            "linkTo": notif.get("linkTo", ""),
        })
    return resultado
