from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
import pprint

load_dotenv()
MONGO_URL = os.getenv('MONGO_URL') or 'mongodb://localhost:27017'
print('Using MONGO_URL:', MONGO_URL)
client = MongoClient(MONGO_URL)
db = client['cosmic_mind_db']

def create_players():
    jogadores = []
    sample = [
        {'apelido': 'Alice', 'planetas_desbloqueados': ['netuno', 'urano']},
        {'apelido': 'Bruno', 'planetas_desbloqueados': ['saturno', 'jupiter']},
        {'apelido': 'Carla', 'planetas_desbloqueados': ['marte', 'terra']},
    ]

    for s in sample:
        jogador = {
            'apelido': s['apelido'],
            'data_nascimento': '2015-01-01',
            'foto_perfil': 1,
            'preferencias_jogo': {'volume_musica': 50, 'daltonismo_modo': False},
            'planetas_desbloqueados': s['planetas_desbloqueados'],
            'melhores_pontuacoes': [],
            'pets_desbloqueados': [],
            'conquistas_obtidas': []
        }
        res = db['jogador'].insert_one(jogador)
        jogadores.append(str(res.inserted_id))
        print(f"Inserted jogador {s['apelido']} with id {res.inserted_id}")
    return jogadores

def create_partidas_for_players(jogador_ids):
    partidas_ids = []
    now = datetime.utcnow()
    for jid in jogador_ids:
        for i in range(2):
            partida = {
                'id_jogador': ObjectId(jid),
                'missionId': f'mission_{i+1}',
                'pontuacao_final': 100*(i+1),
                'metricas_cognitivas': {
                    'acertos': 10*(i+1),
                    'erros': 2*(i+1),
                    'tempo_medio_reacao_ms': 300 - (i*20),
                    'habilidade_foco': ['Agilidade','Lógica','Memorização','Leitura','Interpretação','Concentração'][i % 6]
                },
                'iniciado_em': now - timedelta(days=(i+1)),
                'finalizado_em': now - timedelta(days=(i+1), minutes=-5)
            }
            res = db['partidas'].insert_one(partida)
            partidas_ids.append(str(res.inserted_id))
            print(f"Inserted partida for jogador {jid} -> {res.inserted_id}")
    return partidas_ids

def create_test_session(token='testtoken', id_jogador=None):
    exp = datetime.utcnow() + timedelta(hours=2)
    sess = {
        'token_acesso': token,
        'id_jogador': id_jogador if id_jogador else '',
        'criado_em': datetime.utcnow(),
        'expira_em': exp
    }
    res = db['sessao'].insert_one(sess)
    print('Inserted sessao with id', res.inserted_id)
    return str(res.inserted_id)

if __name__ == '__main__':
    pprint.pprint('Seeding database with test jogadores and partidas...')
    jogadores = create_players()
    partidas = create_partidas_for_players(jogadores)
    create_test_session(token='testtoken', id_jogador=jogadores[0])
    print('\nSummary:')
    print('jogadores ids:', jogadores)
    print('partidas ids:', partidas)
    print('\nDone.')
