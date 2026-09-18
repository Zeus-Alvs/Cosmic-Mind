import os
import secrets
import smtplib
from datetime import timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import HTTPException
from passlib.context import CryptContext

from app.core.config import utc_now
from app.core.database import db, usuarios
from app.usuarios.repository import (
    delete_user_by_email,
    delete_user_players,
    delete_user_sessions,
    find_user_by_email,
    update_user_by_email,
)
from models import (
    ConfirmarEmail,
    DeletarContaRequest,
    EsqueciSenha,
    RedefinirSenha,
    TrocarSenha,
    UsuarioUpdate,
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def enviar_email_recuperacao(email_destino: str, token: str):
    remetente = os.getenv("EMAIL_REMETENTE")
    senha = os.getenv("EMAIL_SENHA")

    link_recuperacao = f"http://localhost:3000/reset-password?token={token}"

    msg = MIMEMultipart()
    msg["From"] = remetente
    msg["To"] = email_destino
    msg["Subject"] = "Cosmic Mind - Recuperação de Senha"

    corpo = f"""
    Olá!

    Recebemos um pedido para redefinir a senha da sua conta no Cosmic Mind.
    Se foi você, clique no link abaixo para criar uma nova senha:

    {link_recuperacao}

    Este link é válido por apenas 1 hora.
    Se não foi você, apenas ignore este e-mail.
    """
    msg.attach(MIMEText(corpo, "plain"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
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
    msg["From"] = remetente
    msg["To"] = email_novo
    msg["Subject"] = "Cosmic Mind - Confirmação de Novo E-mail"

    corpo = f"""Olá!

    Você solicitou a alteração do seu e-mail de acesso no Cosmic Mind.
    Para confirmar este novo e-mail, clique no link abaixo:

    {link_confirmacao}

    Se você não solicitou essa mudança, ignore este e-mail e sua conta continuará segura.
    """
    msg.attach(MIMEText(corpo, "plain"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(remetente, senha)
        server.send_message(msg)
        server.quit()
        print(f"E-mail de verificação enviado para {email_novo}")
    except Exception as e:
        print(f"Erro ao enviar e-mail: {e}")


def atualizar_perfil(email_usuario: str, dados: UsuarioUpdate, current_user: dict):
    if current_user["email"] != email_usuario:
        raise HTTPException(status_code=403, detail="Você não tem permissão para alterar esta conta.")

    usuario = find_user_by_email(email_usuario)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    campos_para_atualizar = {k: v for k, v in dados.model_dump(exclude_none=True).items()}
    if not campos_para_atualizar:
        return {"message": "Nenhum dado para atualizar."}

    mensagem_retorno = "Perfil atualizado com sucesso!"

    if "email" in campos_para_atualizar and campos_para_atualizar["email"] != email_usuario:
        novo_email = str(campos_para_atualizar["email"])

        if find_user_by_email(novo_email):
            raise HTTPException(status_code=400, detail="Este e-mail já está em uso.")

        token_confirmacao = secrets.token_hex(20)

        update_user_by_email(
            email_usuario,
            {
                "email_pendente": novo_email,
                "token_troca_email": token_confirmacao,
            },
        )

        enviar_email_troca_email(novo_email, token_confirmacao)

        del campos_para_atualizar["email"]
        mensagem_retorno = "Dados salvos! Um link de verificação foi enviado para o seu novo e-mail."

    if campos_para_atualizar:
        update_user_by_email(email_usuario, campos_para_atualizar)

    return {
        "message": mensagem_retorno,
        "email_trocado": "pendente" if "email" not in campos_para_atualizar else "nao",
    }


def trocar_senha(email_usuario: str, dados: TrocarSenha, current_user: dict):
    if current_user["email"] != email_usuario:
        raise HTTPException(status_code=403, detail="Você não tem permissão para alterar a senha desta conta.")

    usuario = find_user_by_email(email_usuario)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    if not pwd_context.verify(dados.senha_atual, usuario["senha"]):
        raise HTTPException(status_code=400, detail="A senha atual está incorreta.")

    update_user_by_email(email_usuario, {"senha": pwd_context.hash(dados.nova_senha)})

    return {"message": "Senha alterada com segurança!"}


def deletar_conta(email_usuario: str, payload: DeletarContaRequest, current_user: dict):
    if current_user["email"] != email_usuario:
        raise HTTPException(status_code=403, detail="Você não tem permissão para deletar esta conta.")

    usuario = find_user_by_email(email_usuario)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    if not pwd_context.verify(payload.senha, usuario["senha"]):
        raise HTTPException(status_code=401, detail="Senha incorreta. A exclusão foi cancelada.")

    jogadores_vinculados = usuario.get("jogadores_vinculados", [])
    if jogadores_vinculados:
        delete_user_players([j for j in jogadores_vinculados if j is not None])

    delete_user_by_email(email_usuario)
    delete_user_sessions(usuario["_id"])

    return {"message": "Sua conta e todos os dados vinculados foram excluídos com sucesso."}


def solicitar_recuperacao(dados: EsqueciSenha):
    usuario = find_user_by_email(str(dados.email))

    if not usuario:
        return {"message": "Se o e-mail existir, um link de recuperação será enviado."}

    token_seguro = secrets.token_hex(20)
    expiracao = utc_now() + timedelta(hours=1)

    usuarios.update_one(
        {"email": str(dados.email)},
        {"$set": {"reset_token": token_seguro, "reset_expiracao": expiracao}},
    )

    enviar_email_recuperacao(str(dados.email), token_seguro)

    return {"message": "Se o e-mail existir, um link de recuperação será enviado."}


def redefinir_senha(dados: RedefinirSenha):
    usuario = usuarios.find_one({
        "reset_token": dados.token,
        "reset_expiracao": {"$gt": utc_now()},
    })

    if not usuario:
        raise HTTPException(status_code=400, detail="Token inválido ou expirado.")

    nova_senha_hash = pwd_context.hash(dados.nova_senha)

    usuarios.update_one(
        {"_id": usuario["_id"]},
        {
            "$set": {"senha": nova_senha_hash},
            "$unset": {"reset_token": "", "reset_expiracao": ""},
        },
    )

    return {"message": "Senha redefinida com sucesso! Você já pode fazer login."}


def confirmar_novo_email(dados: ConfirmarEmail):
    usuario = usuarios.find_one({"token_troca_email": dados.token})

    if not usuario or "email_pendente" not in usuario:
        raise HTTPException(status_code=400, detail="Token inválido ou expirado.")

    novo_email = usuario["email_pendente"]

    usuarios.update_one(
        {"_id": usuario["_id"]},
        {
            "$set": {"email": novo_email},
            "$unset": {"email_pendente": "", "token_troca_email": ""},
        },
    )

    return {"message": "Seu e-mail foi atualizado com sucesso!"}


def cancelar_troca_email(dados: EsqueciSenha):
    usuario = find_user_by_email(str(dados.email))
    if not usuario:
        raise HTTPException(status_code=400, detail="Usuário não encontrado.")

    usuarios.update_one(
        {"email": str(dados.email)},
        {"$unset": {"email_pendente": "", "token_troca_email": ""}},
    )

    return {"message": "Troca de e-mail cancelada no banco de dados."}