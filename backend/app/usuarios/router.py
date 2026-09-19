from fastapi import APIRouter, Depends

from app.auth.service import definir_crp
from app.core.dependencies import get_current_user
from app.usuarios.service import (
    atualizar_perfil,
    cancelar_troca_email,
    confirmar_novo_email,
    redefinir_senha,
    solicitar_recuperacao,
    trocar_senha,
    deletar_conta,
)
from models import (
    ConfirmarEmail,
    DefinirCRP,
    DeletarContaRequest,
    EsqueciSenha,
    RedefinirSenha,
    TrocarSenha,
    UsuarioUpdate,
)

router = APIRouter(tags=["conta"])

@router.put("/api/conta/atualizar/{email_usuario}")
def atualizar_perfil_route(
    email_usuario: str,
    dados: UsuarioUpdate,
    current_user: dict = Depends(get_current_user),
):
    return atualizar_perfil(email_usuario, dados, current_user)

@router.put("/api/conta/senha/{email_usuario}")
def trocar_senha_route(
    email_usuario: str,
    dados: TrocarSenha,
    current_user: dict = Depends(get_current_user),
):
    return trocar_senha(email_usuario, dados, current_user)

@router.delete("/api/conta/deletar/{email_usuario}")
def deletar_conta_route(
    email_usuario: str,
    payload: DeletarContaRequest,
    current_user: dict = Depends(get_current_user),
):
    return deletar_conta(email_usuario, payload, current_user)

@router.post("/api/auth/esqueci-senha")
def solicitar_recuperacao_route(dados: EsqueciSenha):
    return solicitar_recuperacao(dados)

@router.post("/api/auth/redefinir-senha")
def redefinir_senha_route(dados: RedefinirSenha):
    return redefinir_senha(dados)

@router.post("/api/conta/confirmar-email")
def confirmar_novo_email_route(dados: ConfirmarEmail):
    return confirmar_novo_email(dados)

@router.post("/api/conta/cancelar-troca-email")
def cancelar_troca_email_route(dados: EsqueciSenha):
    return cancelar_troca_email(dados)

@router.post("/api/conta/crp")
def definir_crp_route(dados: DefinirCRP, current_user: dict = Depends(get_current_user)):
    return definir_crp(dados, current_user)