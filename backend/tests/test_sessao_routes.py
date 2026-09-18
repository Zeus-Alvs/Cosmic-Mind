from main import app

def test_sessao_routes_are_registered():
    paths = app.openapi()["paths"]

    assert "/api/jogo/gerar-pin/{id_jogador}" in paths
    assert "/api/game-login" in paths