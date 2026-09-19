from bson import ObjectId

from app.core.database import db, usuarios


def find_user_by_id(user_id):
    return usuarios.find_one({"_id": user_id})


def find_jogador_by_codigo(codigo: str):
    return db["jogador"].find_one({"codigo_vinculo": codigo.strip().upper()})


def find_jogador_by_id(jogador_id):
    return db["jogador"].find_one({"_id": jogador_id})


def find_pending_request(especialista_id, jogador_id):
    return db["solicitacoes_vinculo"].find_one({
        "id_especialista": especialista_id,
        "id_jogador": jogador_id,
        "status": "pendente",
    })


def insert_request(data: dict):
    return db["solicitacoes_vinculo"].insert_one(data)


def find_requests_by_player_ids(player_ids, status=None):
    query = {"id_jogador": {"$in": player_ids}}
    if status:
        query["status"] = status
    return list(db["solicitacoes_vinculo"].find(query))


def find_request_by_id(id_solicitacao):
    return db["solicitacoes_vinculo"].find_one({"_id": ObjectId(id_solicitacao)})


def update_request(id_solicitacao, changes: dict):
    return db["solicitacoes_vinculo"].update_one({"_id": ObjectId(id_solicitacao)}, {"$set": changes})


def delete_request(id_solicitacao):
    return db["solicitacoes_vinculo"].delete_one({"_id": ObjectId(id_solicitacao)})


def add_player_to_user(user_id, player_id):
    return usuarios.update_one(
        {"_id": user_id},
        {"$addToSet": {"jogadores_vinculados": player_id}},
    )


def remove_player_from_user(user_id, player_id):
    return usuarios.update_one(
        {"_id": user_id},
        {"$pull": {"jogadores_vinculados": player_id}},
    )


def find_notifications_for_user(user_id):
    return list(db["notificacao"].find({"id_usuario_destino": user_id}).sort("criado_em", -1).limit(50))


def insert_notification(data: dict):
    return db["notificacao"].insert_one(data)
