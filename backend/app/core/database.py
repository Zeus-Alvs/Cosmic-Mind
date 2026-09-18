from pymongo import MongoClient
from app.core.config import MONGO_URL

client = MongoClient(MONGO_URL)
db = client["cosmic_mind_db"]

usuarios = db["usuario"]
partidas = db["partidas"]
jogadores = db["jogador"]
sessoes = db["sessao"]
notificacoes = db["notificacao"]
solicitacoes = db["solicitacoes_vinculo"]

sessoes.create_index("expira_em", expireAfterSeconds=0)
usuarios.create_index("email")
jogadores.create_index("codigo_vinculo")
partidas.create_index("id_jogador")