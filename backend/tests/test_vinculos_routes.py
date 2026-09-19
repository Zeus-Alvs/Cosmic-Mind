from main import app
from app.vinculos.service import (
    buscar_jogador_por_codigo,
    cancelar_vinculo,
    listar_pacientes_especialista,
    listar_solicitacoes_pendentes,
    listar_vinculos_aprovados,
    meus_vinculos_especialista,
    responder_solicitacao,
    solicitar_vinculo,
)


def test_vinculos_routes_are_registered():
    paths = app.openapi()["paths"]

    assert "/api/vinculo/solicitar" in paths
    assert "/api/vinculo/pendentes" in paths
    assert "/api/vinculo/responder" in paths
    assert "/api/jogadores/buscar/{codigo}" in paths
    assert "/api/vinculo/meus-vinculos" in paths
    assert "/api/vinculo/meus-pacientes" in paths
    assert "/api/vinculo/aprovados" in paths
    assert "/api/vinculo/cancelar/{id_solicitacao}" in paths
    assert "/api/notificacoes" in paths


def test_vinculos_service_functions_exist():
    assert callable(solicitar_vinculo)
    assert callable(listar_solicitacoes_pendentes)
    assert callable(responder_solicitacao)
    assert callable(buscar_jogador_por_codigo)
    assert callable(meus_vinculos_especialista)
    assert callable(listar_pacientes_especialista)
    assert callable(listar_vinculos_aprovados)
    assert callable(cancelar_vinculo)
