from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from models import UsuarioCadastro, UsuarioLogin, UsuarioRetorno, UsuarioUpdate, TrocarSenha, EsqueciSenha, RedefinirSenha, ConfirmarEmail
import smtplib
import secrets
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta


load_dotenv()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
app = FastAPI(title="Cosmic Mind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Conectando ao Banco
MONGO_URL = os.getenv("MONGO_URL")
client = MongoClient(MONGO_URL)
db = client["cosmic_mind_db"]
colecao_usuarios = db["usuarios"]

@app.get("/")
def read_root():
    return {"status": "A API do Cosmic Mind está viva!"}

# --- ROTA DE CADASTRO ---
@app.post("/api/cadastrar", response_model=UsuarioRetorno, status_code=status.HTTP_201_CREATED)
def cadastrar_usuario(novo_usuario: UsuarioCadastro):
    # 1. Verifica se o e-mail já existe no banco
    usuario_existente = colecao_usuarios.find_one({"email": novo_usuario.email})
    if usuario_existente:
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado.")

    # 2. Transforma o molde em um dicionário que o MongoDB entende
    usuario_dict = novo_usuario.dict()
    usuario_dict["senha"] = pwd_context.hash(novo_usuario.senha)
    resultado = colecao_usuarios.insert_one(usuario_dict)
    
    # 4. Monta a resposta para devolver ao Front-end (escondendo a senha!)
    return UsuarioRetorno(
        id=str(resultado.inserted_id),
        nome=usuario_dict["nome"],
        email=usuario_dict["email"],
        tipo_perfil=usuario_dict["tipo_perfil"]
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
        email_pendente=usuario_banco.get("email_pendente")
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

    # --- A MÁGICA DA SEGURANÇA ACONTECE AQUI ---
    if "email" in campos_para_atualizar and campos_para_atualizar["email"] != email_usuario:
        novo_email = campos_para_atualizar["email"]
        
        # 1. Verifica se algum espertinho já está usando esse e-mail
        if colecao_usuarios.find_one({"email": novo_email}):
            raise HTTPException(status_code=400, detail="Este e-mail já está em uso.")

        # 2. Gera o Token de verificação
        token_confirmacao = secrets.token_hex(20)

        # 3. Salva o e-mail novo como PENDENTE, não como oficial!
        colecao_usuarios.update_one(
            {"email": email_usuario},
            {"$set": {"email_pendente": novo_email, "token_troca_email": token_confirmacao}}
        )

        # 4. Dispara o e-mail para a nova caixa de entrada do cara
        enviar_email_troca_email(novo_email, token_confirmacao)

        # 5. Remove o e-mail dos campos normais para NÃO atualizar direto no banco agora
        del campos_para_atualizar["email"]
        
        mensagem_retorno = "Dados salvos! Um link de verificação foi enviado para o seu novo e-mail."

    # Se sobrou algo para atualizar (como Nome, Avatar, Registro), atualiza na hora
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

    # 1. Verifica se a senha atual digitada está correta
    senha_correta = pwd_context.verify(dados.senha_atual, usuario["senha"])
    if not senha_correta:
        raise HTTPException(status_code=400, detail="A senha atual está incorreta.")

    # 2. Criptografa a nova senha
    nova_senha_hash = pwd_context.hash(dados.nova_senha)

    # 3. Salva no banco de dados
    colecao_usuarios.update_one(
        {"email": email_usuario},
        {"$set": {"senha": nova_senha_hash}}
    )

    return {"message": "Senha alterada com segurança!"}

def enviar_email_recuperacao(email_destino: str, token: str):
    remetente = os.getenv("EMAIL_REMETENTE")
    senha = os.getenv("EMAIL_SENHA")
    
    # O link que vai levar o usuário de volta para o Next.js
    link_recuperacao = f"http://localhost:3000/reset-password?token={token}"

    msg = MIMEMultipart()
    msg['From'] = remetente
    msg['To'] = email_destino
    msg['Subject'] = "Cosmic Mind - Recuperação de Senha"

    # Corpo do E-mail (Você pode estilizar com HTML se quiser depois!)
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
        # Conecta no servidor do Google e envia
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
    
    # Este é o link que o usuário vai clicar para confirmar que o e-mail é dele
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
    
    # REGRA DE SEGURANÇA BANCÁRIA: Mesmo que o email não exista, 
    # retornamos sucesso para que hackers não fiquem testando quais emails existem na base.
    if not usuario:
        return {"message": "Se o e-mail existir, um link de recuperação será enviado."}

    # 1. Gera um Token aleatório e super seguro de 40 caracteres
    token_seguro = secrets.token_hex(20)
    
    # 2. Define que o token expira em 1 hora
    expiracao = datetime.utcnow() + timedelta(hours=1)

    # 3. Salva o token temporário no documento desse usuário no MongoDB
    colecao_usuarios.update_one(
        {"email": dados.email},
        {"$set": {"reset_token": token_seguro, "reset_expiracao": expiracao}}
    )

    # 4. Envia o e-mail
    enviar_email_recuperacao(dados.email, token_seguro)

    return {"message": "Se o e-mail existir, um link de recuperação será enviado."}


@app.post("/api/auth/redefinir-senha")
def redefinir_senha(dados: RedefinirSenha):
    # 1. Procura qual usuário é o dono desse Token e se ainda está no prazo
    usuario = colecao_usuarios.find_one({
        "reset_token": dados.token,
        "reset_expiracao": {"$gt": datetime.utcnow()} # Verifica se a expiração é MAIOR que a hora atual
    })

    if not usuario:
        raise HTTPException(status_code=400, detail="Token inválido ou expirado.")

    # 2. Criptografa a nova senha escolhida
    nova_senha_hash = pwd_context.hash(dados.nova_senha)

    # 3. Atualiza a senha no banco e DELETA o token (para não ser usado de novo)
    colecao_usuarios.update_one(
        {"_id": usuario["_id"]},
        {
            "$set": {"senha": nova_senha_hash},
            "$unset": {"reset_token": "", "reset_expiracao": ""} # O $unset remove as colunas do MongoDB
        }
    )

    return {"message": "Senha redefinida com sucesso! Você já pode fazer login."}


@app.post("/api/conta/confirmar-email")
def confirmar_novo_email(dados: ConfirmarEmail):
    # Procura quem é o dono desse token
    usuario = colecao_usuarios.find_one({"token_troca_email": dados.token})
    
    if not usuario or "email_pendente" not in usuario:
        raise HTTPException(status_code=400, detail="Token inválido ou expirado.")

    novo_email = usuario["email_pendente"]

    # Agora sim! Substitui o email antigo pelo novo e apaga os dados pendentes
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
