from datetime import timedelta
from fastapi import HTTPException, status

from app.auth import repository
from app.core.config import utc_now
from app.core.security import (
    create_user_token,
    hash_password,
    verify_password
)
from models import UsuarioCadastro, UsuarioRetorno

def register(new_user: UsuarioCadastro) -> UsuarioRetorno:
    if repository.find_user_by_email(new_user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-mail já cadastrado."
        )

    user_data = new_user.model_dump()
    user_data["senha"] = hash_password(user_data["senha"])
    user_data["criado_em"] = utc_now()
    user_data["avatar"] = 1

    if user_data.get("tipo_perfil") == "especialista":
        crm = user_data.get("crm")

        if not crm:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CRM é obrigatório para especialistas."
            )

        user_data["crp_especialista"] = crm
        user_data.pop("crm", None)

    result = repository.create_user(user_data)

    return UsuarioRetorno(
        id=str(result.inserted_id),
        nome=user_data["nome"],
        email=user_data["email"],
        tipo_perfil=user_data["tipo_perfil"],
        avatar=user_data.get("avatar", 1),
        crm=user_data.get("crp_especialista") or user_data.get("crm"),
        clinica=user_data.get("clinica"),
        ocupacao=user_data.get("ocupacao")
    )
    
def login(email: str, password: str):
    usuario = repository.find_user_by_email(email)

    if not usuario or not verify_password(password, usuario["senha"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou Senha inválidos."
        )
    
    token = create_user_token(str(usuario["_id"]))
    expiration = utc_now() + timedelta(hours=2)

    repository.create_session(
        usuario["_id"], 
        token, 
        expiration
    )

    return {
        "id": str(usuario["_id"]),
        "nome": usuario["nome"],
        "email": usuario["email"],
        "tipo_perfil": usuario["tipo_perfil"],
        "avatar": usuario.get("avatar", 1),
        "token_acesso": token
    }