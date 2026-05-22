from fastapi import FastAPI, HTTPException, status, Header
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
from datetime import datetime as dt_cls, timedelta, timezone


load_dotenv()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
app = FastAPI(title="Cosmic Mind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://85.31.63.53:7485"
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

@app.get("/")
def read_root():
    return {"status": "A API do Cosmic Mind está viva!"}


@app.post("/api/cadastrar", response_model=UsuarioRetorno, status_code=status.HTTP_201_CREATED)
def cadastrar_usuario(novo_usuario: UsuarioCadastro):
    usuario_existente = colecao_usuarios.find_one({"email": novo_usuario.email})
    if usuario_existente:
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado.")

    usuario_dict = novo_usuario.dict()
    usuario_dict["senha"] = pwd_context.hash(novo_usuario.senha)
    usuario_dict["criado_em"] = datetime.now(timezone.utc)
    usuario_dict["avatar"] = 1
    
    resultado = colecao_usuarios.insert_one(usuario_dict)
    
    return UsuarioRetorno(
        id=str(resultado.inserted_id),
        nome=usuario_dict["nome"],
        email=usuario_dict["email"],
        tipo_perfil=usuario_dict["tipo_perfil"],
        avatar=usuario_dict.get("avatar", 1)
    )

@app.post("/api/login", response_model=UsuarioRetorno, status_code=status.HTTP_200_OK)
def login_usuario(credenciais: UsuarioLogin):

    usuario_banco = colecao_usuarios.find_one({"email": credenciais.email})
    

    if not usuario_banco or not pwd_context.verify(credenciais.senha, usuario_banco["senha"]):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")
    
    return UsuarioRetorno(
        id=str(usuario_banco["_id"]),
        nome=usuario_banco["nome"],
        email=usuario_banco["email"],
        tipo_perfil=usuario_banco["tipo_perfil"],
        email_pendente=usuario_banco.get("email_pendente"),
        avatar=usuario_banco.get("avatar", 1)
    )

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


@app.post("/api/jogadores/{id_usuario}")
def criar_jogador(id_usuario: str, dados: JogadorCadastro):
    novo_jogador = {
        "apelido": dados.apelido,
        "data_nascimento": dados.data_nascimento,
        "foto_perfil": dados.foto_perfil,
        "preferencias_jogo": {"volume_musica": 50, "daltonismo_modo": False},
        "planetas_desbloqueados": [],
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

    return {"message": "Jogador criado!", "id_jogador": str(id_novo_jogador)}


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
            "nome": jogador.get("apelido", "Jogador"),
            "foto_perfil": jogador.get("foto_perfil", 1),
            "progresso": 0, 
            "tempoUso": "0 horas",
            "nivelFase": "1 - Mercúrio",
            "pontuacao": 0
        })

    return resultado

@app.post("/api/jogadores/{id_jogador}/desconectar")
def desconectar_jogador(id_jogador: str):
    sessao = db["sessao"].find_one({"id_jogador": id_jogador})
    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada.")
    
    db["sessao"].update_one(
        {"id_jogador": id_jogador},
        {"$set": {"expira_em": datetime.now(timezone.utc)}}
    )
    return {"message": "Dispositivos desconectados com sucesso."}

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



@app.post("/api/jogo/gerar-pin/{id_jogador}")
def gerar_pin_jogo(id_jogador: str):

    pin_gerado = str(random.randint(0, 999999)).zfill(6)
    tempo_expiracao = datetime.now(timezone.utc) + timedelta(minutes=10)

    nova_sessao = {
        "codigo_pin": pin_gerado,
        "id_jogador": id_jogador,
        "token_acesso": None, 
        "criado_em": datetime.now(timezone.utc),
        "expira_em": tempo_expiracao
    }

    db["sessao"].insert_one(nova_sessao)

    return {
        "mensagem": "PIN gerado com sucesso!", 
        "pin": pin_gerado, 
        "expira_em": tempo_expiracao
    }

@app.post("/game-login")
def game_login(dados: GameLoginRequest):
    sessao = db["sessao"].find_one({"codigo_pin": dados.code})

    if not sessao:
        raise HTTPException(status_code=401, detail="Código inválido ou expirado.")


    if datetime.utcnow() > sessao["expira_em"]:
        raise HTTPException(status_code=401, detail="Código expirado.")


    nova_expiracao = datetime.now(timezone.utc) + timedelta(hours=2)
    db["sessao"].update_one(
        {"_id": sessao["_id"]},
        {"$set": {
            "token_acesso": dados.code,
            "expira_em": nova_expiracao
        }}
    )

    return {"accessToken": dados.code}

@app.post("/api/partidas/salvar")
def salvar_partida(partida: PartidaModel, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token de acesso ausente.")
    token = authorization.replace('Bearer ', '')
    # Buscar sessão pelo token
    sessao = db["sessao"].find_one({"token_acesso": token})
    if not sessao:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado.")
    # Converter string para ObjectId se necessário
    partida_dict = partida.dict()
    partida_dict["id_jogador"] = ObjectId(sessao["id_jogador"])

    # Inserir no banco
    resultado = colecao_partidas.insert_one(partida_dict)
    return {
        "message": "Partida salva com sucesso!",
        "id_partida": str(resultado.inserted_id)
    }

try:
    db["sessao"].create_index("expira_em", expireAfterSeconds=0)
except Exception:
    pass  
