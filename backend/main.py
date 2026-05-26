from fastapi import FastAPI, HTTPException, status, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from models import *
import smtplib
import secrets
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
from datetime import datetime as dt_cls, timedelta, timezone, datetime
import jwt
from match_performance_calculator.MatchPerformanceCalculator import MatchPerformanceCalculator
import random
import string


load_dotenv()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
app = FastAPI(title="Cosmic Mind API")

JWT_SECRET = os.getenv("JWT_SECRET", secrets.token_hex(32))
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 2

def gerar_jwt(id_jogador: str):
    payload = {
        'id_jogador': id_jogador,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://85.31.63.53:7485",
        "https://cosmic-mind-fatec.vercel.app/"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URL = os.getenv("MONGO_URL")
client = MongoClient(MONGO_URL)
db = client["cosmic_mind_db"]
colecao_usuarios = db["usuario"]
colecao_partidas = db["partidas"]


# rota não utilizada --- Nenhuma página do frontend
@app.get("/")
def read_root():
    return {"status": "A API do Cosmic Mind está viva!"}

def criar_notificacao(id_destino: ObjectId, tipo: str, titulo: str, descricao: str, link_to: str = None):
    """Insere uma notificação individual no banco de dados."""
    db["notificacao"].insert_one({
        "id_usuario_destino": ObjectId(id_destino),
        "type": tipo,
        "title": titulo,
        "description": descricao,
        "isLink": bool(link_to),
        "linkTo": link_to,
        "lida": False,
        "criado_em": datetime.utcnow()
    })

def notificar_rede_do_jogador(id_jogador: ObjectId, tipo: str, titulo: str, descricao: str, link_to: str = None):
    """Encontra responsáveis e especialistas vinculados ao jogador e notifica todos."""
    usuarios_interessados = colecao_usuarios.find({"jogadores_vinculados": id_jogador})
    for usuario in usuarios_interessados:
        criar_notificacao(usuario["_id"], tipo, titulo, descricao, link_to)


# rota em uso --- /register
@app.post("/api/cadastrar", response_model=UsuarioRetorno, status_code=status.HTTP_201_CREATED)
def cadastrar_usuario(novo_usuario: UsuarioCadastro):
    usuario_existente = colecao_usuarios.find_one({"email": novo_usuario.email})
    if usuario_existente:
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado.")

    usuario_dict = novo_usuario.model_dump()
    usuario_dict["senha"] = pwd_context.hash(novo_usuario.senha)
    usuario_dict["criado_em"] = datetime.now(timezone.utc)
    usuario_dict["avatar"] = 1
    
    if usuario_dict.get('tipo_perfil') == 'especialista':
        crm_val = usuario_dict.get('crm')
        if not crm_val:
            raise HTTPException(status_code=400, detail="O campo CRM é obrigatório para especialistas.")
        usuario_dict['crp_especialista'] = crm_val
        usuario_dict['clinica'] = usuario_dict.get('clinica')
        usuario_dict['ocupacao'] = usuario_dict.get('ocupacao')
        usuario_dict.pop('crm', None)     
    
    resultado = colecao_usuarios.insert_one(usuario_dict)

    return UsuarioRetorno(
        id = str(resultado.inserted_id),
        nome = usuario_dict["nome"],
        email = usuario_dict["email"],
        tipo_perfil = usuario_dict["tipo_perfil"],
        avatar = usuario_dict.get("avatar", 1),
        crm = usuario_dict.get("crp_especialista") or usuario_dict.get('crm'),
        clinica = usuario_dict.get("clinica"),
        ocupacao = usuario_dict.get("ocupacao")
    )

# rota em uso --- /login
@app.post("/api/login", response_model=UsuarioRetorno, status_code=status.HTTP_200_OK)
def login_usuario(credenciais: UsuarioLogin):
    usuario_banco = colecao_usuarios.find_one({"email": credenciais.email})
    if not usuario_banco or not pwd_context.verify(credenciais.senha, usuario_banco["senha"]):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

    token_jwt = gerar_jwt(str(usuario_banco["_id"]))
    expira = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)

    db["sessao"].insert_one({
        "token_acesso": token_jwt,
        "id_usuario": str(usuario_banco["_id"]),
        "expira_em": expira
    })

    return {
        "id": str(usuario_banco["_id"]),
        "nome": usuario_banco["nome"],
        "email": usuario_banco["email"],
        "tipo_perfil": usuario_banco["tipo_perfil"],
        "email_pendente": usuario_banco.get("email_pendente"),
        "avatar": usuario_banco.get("avatar", 1),
        "token_acesso": token_jwt
    }

# rota em uso --- /account
@app.put("/api/conta/atualizar/{email_usuario}")
def atualizar_perfil(email_usuario: str, dados: UsuarioUpdate):
    usuario = colecao_usuarios.find_one({"email": email_usuario})
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    campos_para_atualizar = {k: v for k, v in dados.dict(exclude_none=True).items()}
    if not campos_para_atualizar:
        return {"message": "Nenhum dado para atualizar."}

    mensagem_retorno = "Perfil atualizado com sucesso!"

    if "email" in campos_para_atualizar and campos_para_atualizar["email"] != email_usuario:
        novo_email = campos_para_atualizar["email"]

        if colecao_usuarios.find_one({"email": novo_email}):
            raise HTTPException(status_code=400, detail="Este e-mail já está em uso.")

        token_confirmacao = secrets.token_hex(20)

        colecao_usuarios.update_one(
            {"email": email_usuario},
            {"$set": {"email_pendente": novo_email, "token_troca_email": token_confirmacao}}
        )

        enviar_email_troca_email(novo_email, token_confirmacao)

        del campos_para_atualizar["email"]

        mensagem_retorno = "Dados salvos! Um link de verificação foi enviado para o seu novo e-mail."

    if campos_para_atualizar:
        colecao_usuarios.update_one(
            {"email": email_usuario},
            {"$set": campos_para_atualizar}
        )

    return {"message": mensagem_retorno, "email_trocado": "pendente" if "email" not in campos_para_atualizar else "nao"}

# rota em uso --- /account
@app.put("/api/conta/senha/{email_usuario}")
def trocar_senha(email_usuario: str, dados: TrocarSenha):
    usuario = colecao_usuarios.find_one({"email": email_usuario})
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    senha_correta = pwd_context.verify(dados.senha_atual, usuario["senha"])
    if not senha_correta:
        raise HTTPException(status_code=400, detail="A senha atual está incorreta.")

    nova_senha_hash = pwd_context.hash(dados.nova_senha)

    colecao_usuarios.update_one(
        {"email": email_usuario},
        {"$set": {"senha": nova_senha_hash}}
    )

    return {"message": "Senha alterada com segurança!"}

def enviar_email_recuperacao(email_destino: str, token: str):
    remetente = os.getenv("EMAIL_REMETENTE")
    senha = os.getenv("EMAIL_SENHA")

    link_recuperacao = f"http://localhost:3000/reset-password?token={token}"

    msg = MIMEMultipart()
    msg['From'] = remetente
    msg['To'] = email_destino
    msg['Subject'] = "Cosmic Mind - Recuperação de Senha"

    corpo = f"""
    Olá!

    Recebemos um pedido para redefinir a senha da sua conta no Cosmic Mind.
    Se foi você, clique no link abaixo para criar uma nova senha:

    {link_recuperacao}

    Este link é válido por apenas 1 hora.
    Se não foi você, apenas ignore este e-mail.
    """
    msg.attach(MIMEText(corpo, 'plain'))

    try:

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(remetente, senha)
        server.send_message(msg)
        server.quit()
        print("E-mail enviado com sucesso!")
    except Exception as e:
        print(f"Erro ao enviar e-mail: {e}")

def enviar_email_troca_email(email_novo: str, token: str):
    remetente = os.getenv("EMAIL_REMETENTE")
    senha = os.getenv("EMAIL_SENHA")

    link_confirmacao = f"http://localhost:3000/confirmar-email?token={token}"

    msg = MIMEMultipart()
    msg['From'] = remetente
    msg['To'] = email_novo
    msg['Subject'] = "Cosmic Mind - Confirmação de Novo E-mail"

    corpo = f"""Olá!

    Você solicitou a alteração do seu e-mail de acesso no Cosmic Mind.
    Para confirmar este novo e-mail, clique no link abaixo:

    {link_confirmacao}

    Se você não solicitou essa mudança, ignore este e-mail e sua conta continuará segura.
    """
    msg.attach(MIMEText(corpo, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(remetente, senha)
        server.send_message(msg)
        server.quit()
        print(f"E-mail de verificação enviado para {email_novo}")
    except Exception as e:
        print(f"Erro ao enviar e-mail: {e}")

# rota em uso --- /remember-password
@app.post("/api/auth/esqueci-senha")
def solicitar_recuperacao(dados: EsqueciSenha):
    usuario = colecao_usuarios.find_one({"email": dados.email})

    if not usuario:
        return {"message": "Se o e-mail existir, um link de recuperação será enviado."}

    token_seguro = secrets.token_hex(20)

    expiracao = datetime.utcnow() + timedelta(hours=1)

    colecao_usuarios.update_one(
        {"email": dados.email},
        {"$set": {"reset_token": token_seguro, "reset_expiracao": expiracao}}
    )

    enviar_email_recuperacao(dados.email, token_seguro)

    return {"message": "Se o e-mail existir, um link de recuperação será enviado."}

# rota em uso --- /reset-password
@app.post("/api/auth/redefinir-senha")
def redefinir_senha(dados: RedefinirSenha):
    usuario = colecao_usuarios.find_one({
        "reset_token": dados.token,
        "reset_expiracao": {"$gt": datetime.utcnow()}
    })

    if not usuario:
        raise HTTPException(status_code=400, detail="Token inválido ou expirado.")

    nova_senha_hash = pwd_context.hash(dados.nova_senha)

    colecao_usuarios.update_one(
        {"_id": usuario["_id"]},
        {
            "$set": {"senha": nova_senha_hash},
            "$unset": {"reset_token": "", "reset_expiracao": ""} 
        }
    )

    return {"message": "Senha redefinida com sucesso! Você já pode fazer login."}

# rota em uso --- /confirmar-email
@app.post("/api/conta/confirmar-email")
def confirmar_novo_email(dados: ConfirmarEmail):
    usuario = colecao_usuarios.find_one({"token_troca_email": dados.token})

    if not usuario or "email_pendente" not in usuario:
        raise HTTPException(status_code=400, detail="Token inválido ou expirado.")

    novo_email = usuario["email_pendente"]

    colecao_usuarios.update_one(
        {"_id": usuario["_id"]},
        {
            "$set": {"email": novo_email},
            "$unset": {"email_pendente": "", "token_troca_email": ""}
        }
    )

    return {"message": "Seu e-mail foi atualizado com sucesso!"}

# rota em uso --- /account
@app.post("/api/conta/cancelar-troca-email")
def cancelar_troca_email(dados: EsqueciSenha):
    usuario = colecao_usuarios.find_one({"email": dados.email})
    if not usuario:
        raise HTTPException(status_code=400, detail="Usuário não encontrado.")

    colecao_usuarios.update_one(
        {"email": dados.email},
        {"$unset": {"email_pendente": "", "token_troca_email": ""}}
    )

    return {"message": "Troca de e-mail cancelada no banco de dados."}

# rota em uso --- /account
@app.post("/api/conta/crp")
def definir_crp(dados: DefinirCRP):
    usuario = colecao_usuarios.find_one({"email": dados.email})
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    colecao_usuarios.update_one(
        {"email": dados.email},
        {"$set": {"crp_especialista": dados.crp}}
    )
    return {"message": "CRP atualizado com sucesso"}

# rota em uso --- /account
@app.delete("/api/conta/deletar/{email_usuario}")
def deletar_conta(email_usuario: str, payload: DeletarContaRequest):
    usuario = colecao_usuarios.find_one({"email": email_usuario})
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    senha_correta = pwd_context.verify(payload.senha, usuario["senha"])
    if not senha_correta:
        raise HTTPException(status_code=401, detail="Senha incorreta. A exclusão foi cancelada.")

    if "jogadores_vinculados" in usuario and usuario["jogadores_vinculados"]:
        db["jogador"].delete_many({"_id": {"$in": usuario["jogadores_vinculados"]}})

    colecao_usuarios.delete_one({"email": email_usuario})

    db["sessao"].delete_many({"id_usuario": str(usuario["_id"])})

    return {"message": "Sua conta e todos os dados vinculados foram excluídos com sucesso."}

def gerar_codigo_unico():
    caracteres = string.ascii_uppercase + string.digits
    while True:
        codigo = ''.join(random.choices(caracteres, k=6))

        if not db["jogador"].find_one({"codigo_vinculo": codigo}):
            return codigo

# rota em uso --- /manager (Responsável)
@app.post("/api/jogadores/{id_usuario}")
def criar_jogador(id_usuario: str, dados: JogadorCadastro):

    codigo_amigo = gerar_codigo_unico()

    novo_jogador = {
        "codigo_vinculo": codigo_amigo,
        "apelido": dados.apelido,
        "data_nascimento": dados.data_nascimento,
        "foto_perfil": dados.foto_perfil,
        "preferencias_jogo": {"volume_musica": 50, "daltonismo_modo": False},
        "planetas_desbloqueados": ["57b6d77617cbdc1499b06cab3d9f650e"],
        "melhores_pontuacoes": [],
        "pets_desbloqueados": [],
        "conquistas_obtidas": []
    }

    resultado = db["jogador"].insert_one(novo_jogador)
    id_novo_jogador = resultado.inserted_id

    colecao_usuarios.update_one(
        {"_id": ObjectId(id_usuario)},
        {"$push": {"jogadores_vinculados": id_novo_jogador}}
    )

    # GATILHO DE NOTIFICAÇÃO
    criar_notificacao(
        id_destino=ObjectId(id_usuario),
        tipo="info",
        titulo="Novo Perfil Criado",
        descricao=f"O perfil do jogador {dados.apelido} foi criado e vinculado à sua conta com sucesso.",
        link_to="/performance"
    )

    return {"message": "Jogador criado!", "id_jogador": str(id_novo_jogador)}

# rota em uso --- /edit, /manager, /performance
@app.get("/api/jogadores/{id_usuario}")
def listar_jogadores(id_usuario: str):
    usuario = colecao_usuarios.find_one({"_id": ObjectId(id_usuario)})
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    ids_jogadores = usuario.get("jogadores_vinculados", [])

    jogadores_banco = list(db["jogador"].find({"_id": {"$in": ids_jogadores}}))

    resultado = []
    for jogador in jogadores_banco:
        resultado.append({
            "id": str(jogador["_id"]),
            "codigo_vinculo": jogador.get("codigo_vinculo"),
            "nome": jogador.get("apelido", "Jogador"),
            "foto_perfil": jogador.get("foto_perfil", 1),
            "progresso": 0, 
            "tempoUso": "0 horas",
            "nivelFase": "1 - Mercúrio",
            "pontuacao": 0
        })

    return resultado

# rota em uso --- /edit
@app.post("/api/jogadores/{id_jogador}/desconectar")
def desconectar_jogador(id_jogador: str):
    sessao = db["sessao"].find_one({"id_jogador": id_jogador})
    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada.")

    db["sessao"].update_one(
        {"id_jogador": id_jogador},
        {"$set": {"expira_em": datetime.now(timezone.utc)}}
    )

    #GATILHO DE NOTIFICAÇÃO: SESSÃO ENCERRADA
    try:
        id_jogador_obj = ObjectId(id_jogador)
        jogador = db["jogador"].find_one({"_id": id_jogador_obj})
        nome_jogador = jogador.get("apelido", "O paciente") if jogador else "O paciente"

        notificar_rede_do_jogador(
            id_jogador=id_jogador_obj,
            tipo="pausa", # Usa o ícone de raio laranja do frontend
            titulo="Sessão Encerrada",
            descricao=f"A conexão do jogo de {nome_jogador} foi encerrada pelo painel.",
            link_to=None
        )
    except Exception as e:
        print(f"Erro ao enviar notificação de desconexão: {e}")

    return {"message": "Dispositivos desconectados com sucesso."}

# rota em uso --- /edit
@app.put("/api/jogadores/{id_jogador}")
def atualizar_jogador(id_jogador: str, dados: JogadorUpdate):
    campos_para_atualizar = {k: v for k, v in dados.dict(exclude_none=True).items()}
    if not campos_para_atualizar:
        return {"message": "Nenhum dado para atualizar."}

    resultado = db["jogador"].update_one(
        {"_id": ObjectId(id_jogador)},
        {"$set": campos_para_atualizar}
    )
    if resultado.matched_count == 0:
        raise HTTPException(status_code=404, detail="Jogador não encontrado.")
    return {"message": "Jogador atualizado com sucesso!"}

# rota em uso --- /edit
@app.delete("/api/jogadores/{id_usuario}/{id_jogador}")
def excluir_jogador(id_usuario: str, id_jogador: str, payload: ExcluirJogador):
    usuario = colecao_usuarios.find_one({"_id": ObjectId(id_usuario)})
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    senha_correta = pwd_context.verify(payload.senha, usuario["senha"])
    if not senha_correta:
        raise HTTPException(status_code=400, detail="Senha incorreta.")

    colecao_usuarios.update_one(
        {"_id": ObjectId(id_usuario)},
        {"$pull": {"jogadores_vinculados": ObjectId(id_jogador)}}
    )

    resultado = db["jogador"].delete_one({"_id": ObjectId(id_jogador)})
    if resultado.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Jogador não encontrado.")

    db["sessao"].delete_many({"id_jogador": id_jogador})

    return {"message": "Jogador excluído permanentemente."}

# rota em uso --- /manager (Responsável)
@app.post("/api/jogo/gerar-pin/{id_jogador}")
def gerar_pin_jogo(id_jogador: str):
    pin_gerado = str(random.randint(0, 999999)).zfill(6)
    tempo_expiracao = datetime.now(timezone.utc) + timedelta(minutes=10)

    nova_sessao = {
        "codigo_pin": pin_gerado,
        "id_jogador": id_jogador,
        "criado_em": datetime.now(timezone.utc),
        "expira_em": tempo_expiracao
    }

    db["sessao"].insert_one(nova_sessao)

    return {
        "mensagem": "PIN gerado com sucesso!", 
        "pin": pin_gerado, 
        "expira_em": tempo_expiracao
    }

# rota não utilizada no frontend --- Usada pelo jogo
@app.post("/api/game-login")
def game_login(dados: GameLoginRequest):
    sessao = db["sessao"].find_one({"codigo_pin": dados.code})

    if not sessao:
        raise HTTPException(status_code=401, detail="Código inválido ou expirado.")

    if datetime.utcnow() > sessao["expira_em"]:
        raise HTTPException(status_code=401, detail="Código expirado.")

    token_jwt = gerar_jwt(sessao["id_jogador"])
    nova_expiracao = datetime.now(timezone.utc) + timedelta(hours=2)
    db["sessao"].update_one(
        {"_id": sessao["_id"]},
        {"$set": {
            "token_acesso": token_jwt,
            "expira_em": nova_expiracao
        }}
    )
    
    #GATILHO DE NOTIFICAÇÃO: JOGADOR ONLINE
    try:
        id_jogador_obj = ObjectId(sessao["id_jogador"])
        jogador = db["jogador"].find_one({"_id": id_jogador_obj})
        nome_jogador = jogador.get("apelido", "O paciente") if jogador else "O paciente"

        notificar_rede_do_jogador(
            id_jogador=id_jogador_obj,
            tipo="novidade", # Usa o ícone de estrelinha roxa do frontend
            titulo="Jogador Conectado!",
            descricao=f"{nome_jogador} acabou de entrar no Cosmic Mind e iniciou uma sessão de jogo.",
            link_to="/performance"
        )
    except Exception as e:
        print(f"Erro ao enviar notificação de login: {e}")

    return {"accessToken": token_jwt}

calculator = MatchPerformanceCalculator()

# rota não utilizada no frontend --- Usada pelo jogo
@app.post("/api/partidas/salvar", response_model=MelhorPartidaModel)
def salvar_partida(partida: PartidaParaPersistirModel, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token de acesso ausente.")
    token = authorization.replace('Bearer ', '')

    sessao = db["sessao"].find_one({"token_acesso": token})
    if not sessao:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado.")

    id_jogador = ObjectId(sessao["id_jogador"])


    pontuacao, estrelas, metricas_cognitivas = calculator.calcular_pontuacao(partida)


    partida_para_salvar = PartidaParaPersistirComPontuacaoModel(
        missionId=partida.missionId,
        planetId=partida.planetId,
        iniciado_em=partida.start_time,
        finalizado_em=partida.end_time,
        pontuacao_final=pontuacao,
        metricas_cognitivas=metricas_cognitivas
    )

    partida_dict = partida_para_salvar.dict()
    partida_dict["id_jogador"] = id_jogador


    colecao_partidas.insert_one(partida_dict)


    jogador = db["jogador"].find_one({"_id": id_jogador})
    melhores_pontuacoes = jogador.get("melhores_pontuacoes", [])
    
    registro_atual = next((p for p in melhores_pontuacoes if p.get("missionId") == partida.missionId), None)
    
    novo_registro = {
        "missionId": partida.missionId,
        "planetId": partida.planetId,
        "score": pontuacao,
        "starsEarned": estrelas
    }
    
    registro_retornado = novo_registro

    if not registro_atual:

        db["jogador"].update_one(
            {"_id": id_jogador},
            {"$push": {"melhores_pontuacoes": novo_registro}}
        )
    else:
      
        if pontuacao > registro_atual.get("score", 0):

            db["jogador"].update_one(
                {"_id": id_jogador, "melhores_pontuacoes.missionId": partida.missionId},
                {"$set": {
                    "melhores_pontuacoes.$.score": pontuacao,
                    "melhores_pontuacoes.$.starsEarned": estrelas
                }}
            )
        else:
            registro_retornado = registro_atual

    # GATILHO DE NOTIFICAÇÃO
    notificar_rede_do_jogador(
        id_jogador=id_jogador,
        tipo="conquista" if pontuacao > 1000 else "info", # Muda o tipo/ícone baseado no desempenho
        titulo="Desempenho Brilhante!" if pontuacao > 1000 else "Partida Finalizada",
        descricao=f"A partida no planeta {partida.planetId} foi concluída com {pontuacao} pontos e {estrelas} estrelas.",
        link_to="/performance"
    )

    return MelhorPartidaModel(**registro_retornado)


#rota não utilizada --- Nenhuma

@app.get("/api/planetas")
def planetas_desbloqueados(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token de acesso ausente.")
    token = authorization.replace('Bearer ', '')

    sessao = db["sessao"].find_one({"token_acesso": token})
    if not sessao:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado.")

    id_jogador = ObjectId(sessao["id_jogador"])
    jogador = db["jogador"].find_one({"_id": id_jogador})

    return jogador["planetas_desbloqueados"]


# rota não utilizada --- Nenhuma
@app.get("/api/planetas/{planetId}/melhores-pontuacoes")
def melhores_pontuacoes(planetId: str, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token de acesso ausente.")
    token = authorization.replace('Bearer ', '')

    sessao = db["sessao"].find_one({"token_acesso": token})
    if not sessao:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado.")

    jogador = db["jogador"].find_one({"_id": ObjectId(sessao["id_jogador"])})

    return [item for item in jogador.get("melhores_pontuacoes", []) if item.get("planetId") == planetId]
    
# rota não utilizada --- Nenhuma
@app.put('/api/progresso/jogador/update')
def atualizar_progresso(update_data: AtualizarProgressoRequest, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token de acesso ausente.")

    token = authorization.replace('Bearer ', '')
    sessao = db["sessao"].find_one({"token_acesso": token})
    if not sessao:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado.")
    id_jogador = ObjectId(sessao["id_jogador"])

    if update_data.tipo == 'planeta':
        db["jogador"].update_one(
            {"_id": id_jogador},
            {"$push": {"planetasDesbloqueados": update_data.valor}}
        )

        #GATILHO DE NOTIFICAÇÃO
        notificar_rede_do_jogador(
            id_jogador=id_jogador,
            tipo="novidade",
            titulo="Nova Fase Desbloqueada!",
            descricao="O jogador avançou de nível e desbloqueou um novo planeta para explorar.",
            link_to="/performance"
        )

    elif update_data.tipo == 'pontuacao':
        existente = db["jogador"].find_one({
            "_id": id_jogador,
            "melhoresPontuacoes.missionId": update_data.missionId
        })
        if existente:
            db["jogador"].update_one(
                {"_id": id_jogador, "melhoresPontuacoes.missionId": update_data.missionId},
                {"$set": {
                    "melhoresPontuacoes.$.score": update_data.score,
                    "melhoresPontuacoes.$.starsEarned": update_data.starsEarned
                }}
            )
        else:
            db["jogador"].update_one(
                {"_id": id_jogador},
                {"$push": {"melhoresPontuacoes": {
                    "missionId": update_data.missionId,
                    "score": update_data.score,
                    "starsEarned": update_data.starsEarned
                }}}
            )
    elif update_data.tipo == 'pet':
        db["jogador"].update_one(
            {"_id": id_jogador},
            {"$push": {"petsDesbloqueados": ObjectId(update_data.item_id)}}
        )
    elif update_data.tipo == 'conquista':
        db["jogador"].update_one(
            {"_id": id_jogador},
            {"$push": {"conquistasObtidas": ObjectId(update_data.item_id)}}
        )
    elif update_data.tipo == 'preferencias':
        prefs = {}
        if update_data.volumeMusica is not None:
            prefs["preferenciasJogo.volumeMusica"] = update_data.volumeMusica
        if update_data.daltonismoModo is not None:
            prefs["preferenciasJogo.daltonismoModo"] = update_data.daltonismoModo
        if prefs:
            db["jogador"].update_one(
                {"_id": id_jogador},
                {"$set": prefs}
            )
    return {"message": "Progresso atualizado com sucesso!"}

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token ausente.")
    token = authorization.replace("Bearer ", "")
    sessao = db["sessao"].find_one({"token_acesso": token})
    if not sessao:
        raise HTTPException(status_code=401, detail="Sessão inválida ou expirada.")
    exp = sessao.get("expira_em")
    if exp and datetime.utcnow() > exp:
        raise HTTPException(status_code=401, detail="Sessão expirada.")
    usuario = colecao_usuarios.find_one({"_id": ObjectId(sessao.get("id_usuario"))})
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuário não encontrado.")
    return usuario

def require_especialista(usuario = Depends(get_current_user)):
    if usuario.get("tipo_perfil") != "especialista":
        raise HTTPException(status_code=403, detail="Acesso restrito a especialistas.")
    return usuario

# rota não utilizada --- Nenhuma
@app.get("/api/jogadores")
def listar_todos_jogadores(_: dict = Depends(require_especialista)):
    jogadores = list(db["jogador"].find())
    return [{'id': str(j['_id']), 'nome': j.get('apelido', 'Jogador')} for j in jogadores]

# rota em uso --- /performance

@app.get("/api/estatisticas/{id_jogador}")
def obter_estatisticas(id_jogador: str, planetId: str = None, current_user: dict = Depends(get_current_user)):

    if current_user.get("tipo_perfil") == "responsavel":
        vinculos = current_user.get("jogadores_vinculados", [])
        if ObjectId(id_jogador) not in vinculos and id_jogador not in [str(v) for v in vinculos]:
            raise HTTPException(status_code=403, detail="Você não tem permissão para ver esse jogador.")

    if not id_jogador:
        raise HTTPException(status_code=400, detail="ID de jogador inválido.")

    try:
        jogador_obj_id = ObjectId(id_jogador)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de jogador inválido.")

    jogador = db["jogador"].find_one({"_id": jogador_obj_id})
    if not jogador:
        raise HTTPException(status_code=404, detail="Jogador não encontrado.")

    # 👇 A MÁGICA ACONTECE AQUI: Filtramos pelo planeta se o Front-end pedir! 👇
    filtro_partida = {"id_jogador": jogador_obj_id}
    if planetId:
        filtro_partida["planetId"] = planetId

    partidas = list(colecao_partidas.find(filtro_partida))

    if not partidas:
        return {
            "id_jogador": id_jogador,
            "nome_jogador": jogador.get("apelido", "Jogador"),
            "foto_perfil": jogador.get("foto_perfil", 1),
            "planetas_liberados": jogador.get("planetas_desbloqueados", []),
            "total_partidas": 0,
            "total_acertos": 0,
            "total_erros": 0,
            "media_tempo_reacao_ms": 0,
            "pontuacao_maxima": 0,
            "evolucao_por_missao": [],
            "habilidades": {
                "Agilidade": 0, "Lógica": 0, "Memorização": 0,
                "Leitura": 0, "Interpretação": 0, "Concentração": 0
            }
        }

    total_acertos = sum(p["metricas_cognitivas"]["acertos"] for p in partidas)
    total_erros   = sum(p["metricas_cognitivas"]["erros"]   for p in partidas)

    tempos = [p["metricas_cognitivas"]["tempo_medio_reacao_ms"] for p in partidas]
    media_tempo = round(sum(tempos) / len(tempos)) if tempos else 0

    pontuacao_maxima = max((p["pontuacao_final"] for p in partidas), default=0)

    evolucao = []
    for p in partidas:
        evolucao.append({
            "missionId":      p.get("missionId", ""),
            "pontuacao":      p.get("pontuacao_final", 0),
            "acertos":        p["metricas_cognitivas"]["acertos"],
            "erros":          p["metricas_cognitivas"]["erros"],
            "tempo_reacao_ms": p["metricas_cognitivas"]["tempo_medio_reacao_ms"],
            "data":           p.get("finalizado_em", "").isoformat() if hasattr(p.get("finalizado_em", ""), "isoformat") else str(p.get("finalizado_em", ""))
        })

    mapa_habilidades: dict = {}
    for p in partidas:
        habilidade = p["metricas_cognitivas"].get("habilidade_foco", "")
        acertos    = p["metricas_cognitivas"]["acertos"]
        erros      = p["metricas_cognitivas"]["erros"]
        total      = acertos + erros
        if not habilidade or total == 0:
            continue
        taxa = round((acertos / total) * 100)
        if habilidade not in mapa_habilidades:
            mapa_habilidades[habilidade] = []
        mapa_habilidades[habilidade].append(taxa)

    habilidades_medias = {h: round(sum(v) / len(v)) for h, v in mapa_habilidades.items()}
    habilidades_padrao = ["Agilidade", "Lógica", "Memorização", "Leitura", "Interpretação", "Concentração"]
    habilidades_final = {h: habilidades_medias.get(h, 0) for h in habilidades_padrao}

    return {
        "id_jogador":          id_jogador,
        "nome_jogador":        jogador.get("apelido", "Jogador"),
        "foto_perfil":         jogador.get("foto_perfil", 1),
        "planetas_liberados":  jogador.get("planetas_desbloqueados", []),
        "total_partidas":      len(partidas),
        "total_acertos":       total_acertos,
        "total_erros":         total_erros,
        "media_tempo_reacao_ms": media_tempo,
        "pontuacao_maxima":    pontuacao_maxima,
        "evolucao_por_missao": evolucao,
        "habilidades":         habilidades_final
    }

# rota em uso --- /requests 
@app.post("/api/vinculo/solicitar")
def solicitar_vinculo(dados: SolicitarVinculo, current_user: dict = Depends(get_current_user)):
    if current_user.get("tipo_perfil") != "especialista":
        raise HTTPException(status_code=403, detail="Apenas especialistas podem solicitar vínculos.")

    codigo_limpo = dados.codigo_vinculo.strip().upper()
    jogador = db["jogador"].find_one({"codigo_vinculo": codigo_limpo})

    if not jogador:
        raise HTTPException(status_code=404, detail="Paciente não encontrado com este código.")

    id_jogador_obj = jogador["_id"]

    if id_jogador_obj in current_user.get("jogadores_vinculados", []):
        raise HTTPException(status_code=400, detail="Você já acompanha este paciente.")

    solicitacao_existente = db["solicitacoes_vinculo"].find_one({
        "id_especialista": current_user["_id"],
        "id_jogador": id_jogador_obj,
        "status": "pendente"
    })

    if solicitacao_existente:
        raise HTTPException(status_code=400, detail="Você já enviou uma solicitação para este paciente.")

    db["solicitacoes_vinculo"].insert_one({
        "id_especialista": current_user["_id"],
        "id_jogador": id_jogador_obj,
        "status": "pendente",
        "criado_em": datetime.utcnow()
    })

    #GATILHO DE NOTIFICAÇÃO
    responsavel = colecao_usuarios.find_one({
        "jogadores_vinculados": id_jogador_obj,
        "tipo_perfil": "responsavel"
    })
    
    if responsavel:
        criar_notificacao(
            id_destino=responsavel["_id"],
            tipo="solicitacao",
            titulo="Nova Solicitação de Acompanhamento",
            descricao=f"O especialista {current_user['nome']} deseja visualizar o desempenho de {jogador['apelido']}.",
            link_to="/requests"
        )
    
    return {"message": "Solicitação enviada com sucesso ao responsável!"}

# rota em uso --- /requests
@app.get("/api/vinculo/pendentes")
def listar_solicitacoes_pendentes(current_user: dict = Depends(get_current_user)):
    if current_user.get("tipo_perfil") != "responsavel":
        raise HTTPException(status_code=403, detail="Apenas responsáveis podem gerenciar solicitações.")

    jogadores_do_responsavel = current_user.get("jogadores_vinculados", [])
    if not jogadores_do_responsavel:
        return []

    solicitacoes = list(db["solicitacoes_vinculo"].find({
        "id_jogador": {"$in": jogadores_do_responsavel},
        "status": "pendente"
    }))

    resultado = []
    for sol in solicitacoes:
        especialista = colecao_usuarios.find_one({"_id": sol["id_especialista"]})
        jogador = db["jogador"].find_one({"_id": sol["id_jogador"]})

        resultado.append({
            "id_solicitacao": str(sol["_id"]),
            "nome_especialista": especialista["nome"] if especialista else "Especialista Desconhecido",
            "foto_especialista": especialista.get("avatar", 1) if especialista else 1,
            "nome_jogador": jogador["apelido"] if jogador else "Criança Desconhecida",
            "foto_jogador": jogador.get("foto_perfil", 1) if jogador else 1,
            "id_jogador": str(sol["id_jogador"])
        })

    return resultado

# rota em uso --- /requests
@app.post("/api/vinculo/responder")
def responder_solicitacao(dados: ResponderVinculo, current_user: dict = Depends(get_current_user)):
    if current_user.get("tipo_perfil") != "responsavel":
        raise HTTPException(status_code=403, detail="Apenas responsáveis podem aprovar vínculos.")

    try:
        id_sol_obj = ObjectId(dados.id_solicitacao)
    except:
        raise HTTPException(status_code=400, detail="ID de solicitação inválido.")

    solicitacao = db["solicitacoes_vinculo"].find_one({"_id": id_sol_obj, "status": "pendente"})
    if not solicitacao:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada ou já respondida.")

    if solicitacao["id_jogador"] not in current_user.get("jogadores_vinculados", []):
        raise HTTPException(status_code=403, detail="Você não tem permissão sobre este jogador.")

    if dados.acao == "aprovar":

        db["solicitacoes_vinculo"].update_one({"_id": id_sol_obj}, {"$set": {"status": "aprovado"}})

        colecao_usuarios.update_one(
            {"_id": solicitacao["id_especialista"]},
            {"$addToSet": {"jogadores_vinculados": solicitacao["id_jogador"]}}
        )

        #GATILHO DE NOTIFICAÇÃO
        jogador_alvo = db["jogador"].find_one({"_id": solicitacao["id_jogador"]})
        nome_jogador = jogador_alvo.get("apelido", "o paciente") if jogador_alvo else "o paciente"
        
        criar_notificacao(
            id_destino=solicitacao["id_especialista"],
            tipo="solicitacao",
            titulo="Vínculo Aprovado!",
            descricao=f"Seu pedido para acompanhar {nome_jogador} foi aprovado. Você já pode visualizar o relatório de desempenho.",
            link_to="/performance"
        )

        return {"message": "Vínculo aprovado! O especialista agora pode acompanhar o desempenho."}

    elif dados.acao == "rejeitar":
        db["solicitacoes_vinculo"].update_one({"_id": id_sol_obj}, {"$set": {"status": "rejeitado"}})
        return {"message": "Solicitação rejeitada."}

    else:
        raise HTTPException(status_code=400, detail="Ação inválida. Use 'aprovar' ou 'rejeitar'.")

# rota em uso --- /requests
@app.get("/api/jogadores/buscar/{codigo}")
def buscar_jogador_por_codigo(codigo: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("tipo_perfil") != "especialista":
        raise HTTPException(status_code=403, detail="Acesso negado.")

    jogador = db["jogador"].find_one({"codigo_vinculo": codigo.strip().upper()})
    if not jogador:
        raise HTTPException(status_code=404, detail="Jogador não encontrado.")

    return {
        "codigo_vinculo": jogador.get("codigo_vinculo"),
        "apelido": jogador.get("apelido"),
        "foto_perfil": jogador.get("foto_perfil", 1)
    }

# rota em uso --- /requests
@app.get("/api/vinculo/meus-vinculos")
def meus_vinculos_especialista(current_user: dict = Depends(get_current_user)):
    if current_user.get("tipo_perfil") != "especialista":
        raise HTTPException(status_code=403, detail="Acesso negado.")

    solicitacoes = list(db["solicitacoes_vinculo"].find({"id_especialista": current_user["_id"]}))

    resultado = []
    for sol in solicitacoes:
        jogador = db["jogador"].find_one({"_id": sol["id_jogador"]})
        if jogador:
            resultado.append({
                "id_solicitacao": str(sol["_id"]),
                "nome_jogador": jogador.get("apelido", "Paciente"),
                "foto_jogador": jogador.get("foto_perfil", 1),
                "codigo_vinculo": jogador.get("codigo_vinculo", ""),
                "status": sol["status"]
            })
    return resultado

# rota em uso --- /manager
@app.get("/api/vinculo/meus-pacientes")
def listar_pacientes_especialista(current_user: dict = Depends(get_current_user)):
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
            "pontuacao": 0
        })
    return resultado

# rota em uso --- /requests
@app.get("/api/vinculo/aprovados")
def listar_vinculos_aprovados(current_user: dict = Depends(get_current_user)):
    if current_user.get("tipo_perfil") != "responsavel":
        raise HTTPException(status_code=403, detail="Acesso negado.")

    jogadores_do_responsavel = current_user.get("jogadores_vinculados", [])
    if not jogadores_do_responsavel:
        return []

    solicitacoes = list(db["solicitacoes_vinculo"].find({
        "id_jogador": {"$in": jogadores_do_responsavel},
        "status": "aprovado"
    }))

    resultado = []
    for sol in solicitacoes:
        especialista = colecao_usuarios.find_one({"_id": sol["id_especialista"]})
        jogador = db["jogador"].find_one({"_id": sol["id_jogador"]})

        resultado.append({
            "id_solicitacao": str(sol["_id"]),
            "nome_especialista": especialista["nome"] if especialista else "Especialista",
            "foto_especialista": especialista.get("avatar", 1) if especialista else 1,
            "nome_jogador": jogador["apelido"] if jogador else "Criança",
            "foto_jogador": jogador.get("foto_perfil", 1) if jogador else 1,
            "id_jogador": str(sol["id_jogador"])
        })
    return resultado

# rota em uso --- /requests
@app.delete("/api/vinculo/cancelar/{id_solicitacao}")
def cancelar_vinculo(id_solicitacao: str, current_user: dict = Depends(get_current_user)):
    try:
        id_sol_obj = ObjectId(id_solicitacao)
    except:
        raise HTTPException(status_code=400, detail="ID inválido.")

    solicitacao = db["solicitacoes_vinculo"].find_one({"_id": id_sol_obj})
    if not solicitacao:
        raise HTTPException(status_code=404, detail="Vínculo não encontrado.")

    is_dono_especialista = solicitacao["id_especialista"] == current_user["_id"]
    is_dono_responsavel = solicitacao["id_jogador"] in current_user.get("jogadores_vinculados", [])

    if not (is_dono_especialista or is_dono_responsavel):
        raise HTTPException(status_code=403, detail="Você não tem permissão para apagar este vínculo.")

    if solicitacao["status"] == "aprovado":
        colecao_usuarios.update_one(
            {"_id": solicitacao["id_especialista"]},
            {"$pull": {"jogadores_vinculados": solicitacao["id_jogador"]}}
        )

    db["solicitacoes_vinculo"].delete_one({"_id": id_sol_obj})

    return {"message": "Vínculo removido com sucesso."}

# rota em uso --- /notificacoes
@app.get("/api/notificacoes")
def listar_notificacoes(current_user: dict = Depends(get_current_user)):
    # Busca notificações direcionadas ao usuário logado, do mais recente para o mais antigo (limite de 50)
    notificacoes = list(db["notificacao"].find(
        {"id_usuario_destino": current_user["_id"]}
    ).sort("criado_em", -1).limit(50))
    
    resultado = []
    for notif in notificacoes:
        criado_em = notif.get("criado_em")
        resultado.append({
            "id": str(notif["_id"]),
            "type": notif.get("type", "info"),
            "title": notif.get("title", ""),
            "description": notif.get("description", ""),
            "createdAt": criado_em.isoformat() if hasattr(criado_em, 'isoformat') else str(criado_em),
            "isLink": notif.get("isLink", False),
            "linkTo": notif.get("linkTo", "")
        })
        
    return resultado

try:
    db["sessao"].create_index("expira_em", expireAfterSeconds=0)
except Exception:
    pass