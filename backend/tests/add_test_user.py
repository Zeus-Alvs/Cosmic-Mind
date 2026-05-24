from pymongo import MongoClient
from dotenv import load_dotenv
import os
from passlib.context import CryptContext
from datetime import datetime, timezone

load_dotenv()
MONGO_URL = os.getenv('MONGO_URL') or 'mongodb://localhost:27017'
print('Using MONGO_URL:', MONGO_URL)
client = MongoClient(MONGO_URL)
db = client['cosmic_mind_db']

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
senha_hash = pwd_context.hash('senha_de_teste123')

usuario = {
    'nome': 'Especialista Teste',
    'email': 'esp@test.local',
    'senha': senha_hash,
    'tipo_perfil': 'especialista',
    'criado_em': datetime.now(timezone.utc),
    'avatar': 1
}
res = db['usuario'].insert_one(usuario)
print('Inserted usuario id', res.inserted_id)

update = db['sessao'].update_one({'token_acesso': 'testtoken'}, {'$set': {'id_usuario': str(res.inserted_id)}})
print('Updated sessions matched:', update.matched_count)
print('Done')
