from main import app
from app.jogadores.service import (
    atualizar_jogador,
    desconectar_jogador,
    excluir_jogador,
)


def test_jogadores_routes_are_registered():
    paths = app.openapi()["paths"]

    assert "/api/jogadores/{id_usuario}" in paths
    assert "/api/jogadores/{id_jogador}/desconectar" in paths
    assert "/api/jogadores/{id_jogador}" in paths
    assert "/api/jogadores/{id_usuario}/{id_jogador}" in paths


def test_jogadores_service_functions_exist():
    assert callable(desconectar_jogador)
    assert callable(atualizar_jogador)
    assert callable(excluir_jogador)