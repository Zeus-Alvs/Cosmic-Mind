from app.core.database import sessoes, usuarios

def find_user_by_email(email: str):
    return usuarios.find_one({"email": email})

def create_user(user_data: dict):
    return usuarios.insert_one(user_data)

def create_session(user_id, token: str, expires_at):
    sessoes.insert_one({
        "token_acesso": token,
        "id_usuario": user_id,
        "expira_em": expires_at
    })