from fastapi import Depends, Header, HTTPException, status

from app.core.database import sessoes, usuarios
from app.core.security import decode_token


def get_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token ausente.",
        )

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Formato de autorização inválido.",
        )

    return token


def get_current_user(
    authorization: str | None = Header(default=None),
):
    token = get_bearer_token(authorization)

    sessao = sessoes.find_one({"token_acesso": token})

    if not sessao or not sessao.get("id_usuario"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão inválida ou expirada.",
        )

    usuario = usuarios.find_one({"_id": sessao["id_usuario"]})

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado.",
        )

    return usuario


def require_especialista(usuario=Depends(get_current_user)):
    if usuario.get("tipo_perfil") != "especialista":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a especialistas.",
        )

    return usuario