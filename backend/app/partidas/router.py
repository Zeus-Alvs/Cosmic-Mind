from fastapi import APIRouter, Depends, Header

from app.core.dependencies import require_especialista
from app.partidas.service import (
    atualizar_progresso,
    melhores_pontuacoes,
    planetas_desbloqueados,
    listar_todos_jogadores,
    salvar_partida,
)
from models import AtualizarProgressoRequest, MelhorPartidaModel, PartidaParaPersistirModel

router = APIRouter(tags=["partidas"])

@router.post("/api/partidas/salvar", response_model=MelhorPartidaModel)
def salvar_partida_route(
    partida: PartidaParaPersistirModel,
    authorization: str | None = Header(default=None),
):
    return salvar_partida(partida, authorization)

@router.get("/api/planetas")
def planetas_desbloqueados_route(authorization: str | None = Header(default=None)):
    return planetas_desbloqueados(authorization)

@router.get("/api/planetas/{planetId}/melhores-pontuacoes")
def melhores_pontuacoes_route(
    planetId: str,
    authorization: str | None = Header(default=None),
):
    return melhores_pontuacoes(planetId, authorization)

@router.put("/api/progresso/jogador/update")
def atualizar_progresso_route(
    update_data: AtualizarProgressoRequest,
    authorization: str | None = Header(default=None),
):
    return atualizar_progresso(update_data, authorization)

@router.get("/api/jogadores")
def listar_todos_jogadores_route(_: dict = Depends(require_especialista)):
    return listar_todos_jogadores(_)
