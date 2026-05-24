from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import os
from datetime import datetime, timezone, timedelta

load_dotenv()
MONGO_URL = os.getenv('MONGO_URL') or 'mongodb://localhost:27017'
print('Using MONGO_URL:', MONGO_URL)
client = MongoClient(MONGO_URL)
db = client['cosmic_mind_db']

# Desired percentages per player (values 0-100)
players_skills = {
    'Alice': {
        'Agilidade': 80,
        'Lógica': 70,
        'Memorização': 60,
        'Leitura': 50,
        'Interpretação': 40,
        'Concentração': 30
    },
    'Bruno': {
        'Agilidade': 50,
        'Lógica': 60,
        'Memorização': 70,
        'Leitura': 80,
        'Interpretação': 40,
        'Concentração': 30
    },
    'Carla': {
        'Agilidade': 30,
        'Lógica': 40,
        'Memorização': 50,
        'Leitura': 60,
        'Interpretação': 70,
        'Concentração': 80
    }
}

now = datetime.now(timezone.utc)

for nome, skills in players_skills.items():
    jogador = db['jogador'].find_one({'apelido': nome})
    if not jogador:
        print(f"Jogador {nome} não encontrado, pulando.")
        continue
    jid = jogador['_id']
    print(f"Inserindo partidas de habilidade para {nome} (id={jid})")

    # For clarity, do not remove previous partidas; append skill-specific partidas
    for abil, pct in skills.items():
        total = 10
        acertos = int(round((pct / 100.0) * total))
        if acertos < 1:
            acertos = 1
        erros = total - acertos
        partida_doc = {
            'id_jogador': jid,
            'missionId': f'skill_{abil.lower()}_{pct}',
            'pontuacao_final': pct * 3,
            'metricas_cognitivas': {
                'acertos': acertos,
                'erros': erros,
                'tempo_medio_reacao_ms': max(100, 400 - pct),
                'habilidade_foco': abil
            },
            'iniciado_em': now - timedelta(minutes=5),
            'finalizado_em': now - timedelta(minutes=1)
        }
        res = db['partidas'].insert_one(partida_doc)
        print(f" - inserida partida {partida_doc['missionId']} => id {res.inserted_id} (pct ~ {pct}%)")

print('Inserção das partidas por habilidade finalizada.')
