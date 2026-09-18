from app.core.database import db


def find_session_by_token(token: str):
    return db["sessao"].find_one({"token_acesso": token})


def find_jogador_by_id(jogador_id):
    return db["jogador"].find_one({"_id": jogador_id})


def insert_partida(partida_data: dict):
    return db["partidas"].insert_one(partida_data)


def update_jogador(jogador_id, changes: dict):
    return db["jogador"].update_one({"_id": jogador_id}, changes)


def find_planetas_do_jogador(jogador_id):
    jogador = db["jogador"].find_one({"_id": jogador_id})
    if not jogador:
        return []
    return jogador.get("planetas_desbloqueados", [])
