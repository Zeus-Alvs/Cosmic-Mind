from app.core.database import db


def find_session_by_pin(code: str):
    return db["sessao"].find_one({"codigo_pin": code})


def find_session_by_token(token: str):
    return db["sessao"].find_one({"token_acesso": token})


def insert_session(payload: dict):
    return db["sessao"].insert_one(payload)


def update_session(query: dict, changes: dict):
    return db["sessao"].update_one(query, changes)


# Backward-compatible aliases used by older references.
find_sessao_by_pin = find_session_by_pin
find_sessao_by_token = find_session_by_token