from main import app
from app.partidas.service import salvar_partida, atualizar_progresso


def test_partidas_routes_are_registered():
    paths = app.openapi()["paths"]

    assert "/api/partidas/salvar" in paths
    assert "/api/progresso/jogador/update" in paths
    assert "/api/planetas" in paths
    assert "/api/planetas/{planetId}/melhores-pontuacoes" in paths


def test_partidas_service_functions_exist():
    assert callable(salvar_partida)
    assert callable(atualizar_progresso)
