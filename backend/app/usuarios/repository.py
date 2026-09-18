from app.core.database import db, usuarios

def find_user_by_email(email: str):
    return usuarios.find_one({"email": email})


def find_user_by_id(user_id):
    return usuarios.find_one({"_id": user_id})


def update_user_by_email(email: str, changes: dict):
    return usuarios.update_one({"email": email}, {"$set": changes})


def update_user_by_id(user_id, changes: dict):
    return usuarios.update_one({"_id": user_id}, {"$set": changes})


def delete_user_by_email(email: str):
    return usuarios.delete_one({"email": email})


def delete_user_sessions(user_id):
    return db["sessao"].delete_many({"id_usuario": str(user_id)})


def delete_user_players(user_ids):
    if not user_ids:
        return None
    return db["jogador"].delete_many({"_id": {"$in": user_ids}})