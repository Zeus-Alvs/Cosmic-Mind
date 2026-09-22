from main import app
from app.usuarios.service import (
    cancelar_troca_email,
    confirmar_novo_email,
    redefinir_senha,
    solicitar_recuperacao,
)


def test_account_routes_are_registered():
    paths = app.openapi()["paths"]

    assert "/api/conta/atualizar/{email_usuario}" in paths
    assert "/api/conta/senha/{email_usuario}" in paths
    assert "/api/conta/deletar/{email_usuario}" in paths


def test_auth_routes_are_registered():
    paths = app.openapi()["paths"]

    assert "/api/login" in paths
    assert "/api/cadastrar" in paths


def test_account_recovery_services_exist():
    assert callable(solicitar_recuperacao)
    assert callable(redefinir_senha)
    assert callable(confirmar_novo_email)
    assert callable(cancelar_troca_email)
