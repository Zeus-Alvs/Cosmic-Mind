from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.jogadores.service import (
    atualizar_jogador,
    criar_jogador,
    desconectar_jogador,
    excluir_jogador,
    listar_jogadores,
)
from models import ExcluirJogador, JogadorCadastro, JogadorUpdate

router = APIRouter(tags=["jogadores"])

@router.post("/api/jogadores/{id_usuario}")
def criar_jogador_route(
    id_usuario: str,
    dados: JogadorCadastro,
    current_user: dict = Depends(get_current_user),
):
    return criar_jogador(id_usuario, dados, current_user)

@router.get("/api/jogadores/{id_usuario}")
def listar_jogadores_route(
    id_usuario: str,
    current_user: dict = Depends(get_current_user),
):
    return listar_jogadores(id_usuario, current_user)

@router.post("/api/jogadores/{id_jogador}/desconectar")
def desconectar_jogador_route(
    id_jogador: str,
    current_user: dict = Depends(get_current_user),
):
    return desconectar_jogador(id_jogador, current_user)

@router.put("/api/jogadores/{id_jogador}")
def atualizar_jogador_route(
    id_jogador: str,
    dados: JogadorUpdate,
    current_user: dict = Depends(get_current_user),
):
    return atualizar_jogador(id_jogador, dados, current_user)

@router.delete("/api/jogadores/{id_usuario}/{id_jogador}")
def excluir_jogador_route(
    id_usuario: str,
    id_jogador: str,
    payload: ExcluirJogador,
    current_user: dict = Depends(get_current_user),
):
    return excluir_jogador(id_usuario, id_jogador, payload, current_user)