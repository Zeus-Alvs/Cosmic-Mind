import random
from datetime import datetime, timedelta, timezone

from bson import ObjectId
from fastapi import HTTPException

from app.core.security import create_player_token
from app.sessao.repository import (
    find_session_by_pin,
    find_session_by_token,
    insert_session,
    update_session,
)
from models import GameLoginRequest


def gerar_pin_jogo(id_jogador: str, current_user: dict):
    if ObjectId(id_jogador) not in current_user.get("jogadores_vinculados", []):
        raise HTTPException(
            status_code=403,
            detail="Você não tem permissão para gerar PIN para este jogador.",
        )

    pin_gerado = str(random.randint(0, 999999)).zfill(6)
    tempo_expiracao = datetime.now(timezone.utc) + timedelta(minutes=10)

    insert_session({
        "codigo_pin": pin_gerado,
        "id_jogador": id_jogador,
        "criado_em": datetime.now(timezone.utc),
        "expira_em": tempo_expiracao,
    })

    return {
        "mensagem": "PIN gerado com sucesso!",
        "pin": pin_gerado,
        "expira_em": tempo_expiracao,
    }


def game_login(dados: GameLoginRequest):
    sessao = find_session_by_pin(dados.code)

    if not sessao:
        raise HTTPException(status_code=401, detail="Código inválido ou expirado.")

    if datetime.utcnow() > sessao["expira_em"]:
        raise HTTPException(status_code=401, detail="Código expirado.")

    token_jwt = create_player_token(sessao["id_jogador"])
    nova_expiracao = datetime.now(timezone.utc) + timedelta(hours=2)

    update_session(
        {"_id": sessao["_id"]},
        {
            "$set": {
                "token_acesso": token_jwt,
                "expira_em": nova_expiracao,
            }
        },
    )

    return {"accessToken": token_jwt}