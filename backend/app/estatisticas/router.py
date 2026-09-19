from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.estatisticas.service import obter_estatisticas

router = APIRouter(tags=["estatisticas"])


@router.get("/api/estatisticas/{id_jogador}")
def obter_estatisticas_route(
    id_jogador: str,
    planetId: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    return obter_estatisticas(id_jogador, planetId, current_user)
