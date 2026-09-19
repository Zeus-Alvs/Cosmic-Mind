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

for collection, index_name, kwargs in (
    (sessoes, "expira_em", {"expireAfterSeconds": 0}),
    (usuarios, "email", {}),
    (jogadores, "codigo_vinculo", {}),
    (partidas, "id_jogador", {}),
):
    if hasattr(collection, "create_index"):
        try:
            collection.create_index(index_name, **kwargs)
        except Exception:
            pass