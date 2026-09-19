from fastapi import APIRouter, Depends, Header

from app.core.dependencies import get_current_user, require_especialista
from app.vinculos.service import (
    buscar_jogador_por_codigo,
    cancelar_vinculo,
    listar_notificacoes,
    listar_pacientes_especialista,
    listar_solicitacoes_pendentes,
    listar_vinculos_aprovados,
    meus_vinculos_especialista,
    responder_solicitacao,
    solicitar_vinculo,
)
from models import ResponderVinculo, SolicitarVinculo

router = APIRouter(tags=["vinculos"])

@router.post("/api/vinculo/solicitar")
def solicitar_vinculo_route(
    dados: SolicitarVinculo,
    current_user: dict = Depends(get_current_user),
):
    return solicitar_vinculo(dados, current_user)

@router.get("/api/vinculo/pendentes")
def listar_solicitacoes_pendentes_route(current_user: dict = Depends(get_current_user)):
    return listar_solicitacoes_pendentes(current_user)

@router.post("/api/vinculo/responder")
def responder_solicitacao_route(
    dados: ResponderVinculo,
    current_user: dict = Depends(get_current_user),
):
    return responder_solicitacao(dados, current_user)

@router.get("/api/jogadores/buscar/{codigo}")
def buscar_jogador_por_codigo_route(
    codigo: str,
    current_user: dict = Depends(get_current_user),
):
    return buscar_jogador_por_codigo(codigo, current_user)

@router.get("/api/vinculo/meus-vinculos")
def meus_vinculos_especialista_route(current_user: dict = Depends(get_current_user)):
    return meus_vinculos_especialista(current_user)

@router.get("/api/vinculo/meus-pacientes")
def listar_pacientes_especialista_route(current_user: dict = Depends(get_current_user)):
    return listar_pacientes_especialista(current_user)

@router.get("/api/vinculo/aprovados")
def listar_vinculos_aprovados_route(current_user: dict = Depends(get_current_user)):
    return listar_vinculos_aprovados(current_user)

@router.delete("/api/vinculo/cancelar/{id_solicitacao}")
def cancelar_vinculo_route(
    id_solicitacao: str,
    current_user: dict = Depends(get_current_user),
):
    return cancelar_vinculo(id_solicitacao, current_user)

@router.get("/api/notificacoes")
def listar_notificacoes_route(current_user: dict = Depends(get_current_user)):
    return listar_notificacoes(current_user)
