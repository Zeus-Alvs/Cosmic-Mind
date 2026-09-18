from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.sessao.service import gerar_pin_jogo, game_login
from models import GameLoginRequest

router = APIRouter(tags=["sessao"])

@router.post("/api/jogo/gerar-pin/{id_jogador}")
def gerar_pin_jogo_route(
    id_jogador: str,
    current_user: dict = Depends(get_current_user),
):
    return gerar_pin_jogo(id_jogador, current_user)

@router.post("/api/game-login")
def game_login_route(dados: GameLoginRequest):
    return game_login(dados)