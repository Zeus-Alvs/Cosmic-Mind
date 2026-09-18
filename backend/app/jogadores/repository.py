from datetime import datetime

from bson import ObjectId
from app.core.database import db, usuarios


def find_user_by_id(user_id):
    return usuarios.find_one({"_id": user_id})


def find_jogador_by_id(jogador_id):
    return db["jogador"].find_one({"_id": jogador_id})


def insert_jogador(jogador_data: dict):
    return db["jogador"].insert_one(jogador_data)


def add_jogador_ao_usuario(id_usuario: ObjectId, id_jogador: ObjectId):
    return usuarios.update_one(
        {"_id": id_usuario},
        {"$push": {"jogadores_vinculados": id_jogador}},
    )


def remove_jogador_do_usuario(id_usuario: ObjectId, id_jogador: ObjectId):
    return usuarios.update_one(
        {"_id": id_usuario},
        {"$pull": {"jogadores_vinculados": id_jogador}},
    )


def find_jogadores_by_ids(ids_jogadores):
    if not ids_jogadores:
        return []
    return db["jogador"].find({"_id": {"$in": ids_jogadores}})


def update_jogador_by_id(jogador_id: ObjectId, changes: dict):
    return db["jogador"].update_one({"_id": jogador_id}, {"$set": changes})


def delete_jogador(jogador_id: ObjectId):
    return db["jogador"].delete_one({"_id": jogador_id})


def update_sessao_expiration(id_jogador: str, expires_at: datetime):
    return db["sessao"].update_one(
        {"id_jogador": id_jogador},
        {"$set": {"expira_em": expires_at}},
    )