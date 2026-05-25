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

players = [
    {
        'apelido': 'Alice',
        'planetas': ['netuno', 'urano'],
        'partidas': [
            {
                'missionId': 'netuno_alpha',
                'pontuacao_final': 150,
                'metricas_cognitivas': {
                    'acertos': 15,
                    'erros': 3,
                    'tempo_medio_reacao_ms': 260,
                    'habilidade_foco': 'Agilidade'
                }
            },
            {
                'missionId': 'urano_beta',
                'pontuacao_final': 210,
                'metricas_cognitivas': {
                    'acertos': 21,
                    'erros': 4,
                    'tempo_medio_reacao_ms': 240,
                    'habilidade_foco': 'Memorização'
                }
            }
        ]
    },
    {
        'apelido': 'Bruno',
        'planetas': ['saturno', 'jupiter'],
        'partidas': [
            {
                'missionId': 'saturno_alpha',
                'pontuacao_final': 90,
                'metricas_cognitivas': {
                    'acertos': 9,
                    'erros': 6,
                    'tempo_medio_reacao_ms': 320,
                    'habilidade_foco': 'Lógica'
                }
            },
            {
                'missionId': 'jupiter_beta',
                'pontuacao_final': 130,
                'metricas_cognitivas': {
                    'acertos': 13,
                    'erros': 5,
                    'tempo_medio_reacao_ms': 310,
                    'habilidade_foco': 'Concentração'
                }
            }
        ]
    },
    {
        'apelido': 'Carla',
        'planetas': ['marte', 'venus'],
        'partidas': [
            {
                'missionId': 'marte_alpha',
                'pontuacao_final': 260,
                'metricas_cognitivas': {
                    'acertos': 26,
                    'erros': 2,
                    'tempo_medio_reacao_ms': 200,
                    'habilidade_foco': 'Leitura'
                }
            },
            {
                'missionId': 'venus_beta',
                'pontuacao_final': 280,
                'metricas_cognitivas': {
                    'acertos': 28,
                    'erros': 1,
                    'tempo_medio_reacao_ms': 190,
                    'habilidade_foco': 'Interpretação'
                }
            }
        ]
    }
]

now = datetime.now(timezone.utc)

for p in players:
    jogador = db['jogador'].find_one({'apelido': p['apelido']})
    if not jogador:
        print(f"Jogador {p['apelido']} não encontrado, pulando.")
        continue
    jid = jogador['_id']
    print(f"Atualizando jogador {p['apelido']} (id={jid})")

    db['jogador'].update_one({'_id': jid}, {'$set': {'planetas_desbloqueados': p['planetas']}})
    print(f" - planetas setados: {p['planetas']}")

    rem = db['partidas'].delete_many({'id_jogador': jid})
    print(f" - partidas removidas: {rem.deleted_count}")

    inserted = []
    for i, partida in enumerate(p['partidas']):
        partida_doc = {
            'id_jogador': jid,
            'missionId': partida['missionId'],
            'pontuacao_final': partida['pontuacao_final'],
            'metricas_cognitivas': partida['metricas_cognitivas'],
            'iniciado_em': now - timedelta(days=(i+1)),
            'finalizado_em': now - timedelta(days=(i+1), minutes=-5)
        }
        res = db['partidas'].insert_one(partida_doc)
        inserted.append(str(res.inserted_id))
        print(f" - inserida partida {partida['missionId']} -> {res.inserted_id}")

    print(f"Atualização concluída para {p['apelido']}: {len(inserted)} partidas inseridas\n")

print('Todas atualizações concluídas.')
