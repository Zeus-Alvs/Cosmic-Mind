from typing import Tuple
from models import PartidaParaPersistirModel
from .BackpackLoadingStrategy import BackpackLoadingStrategy

class MatchPerformanceCalculator:
    def __init__(self):
        self.strategies = {
            "72ce71b2dec599547b9de77be9419227": BackpackLoadingStrategy()
        }

    def calcular_pontuacao(self, match: PartidaParaPersistirModel) -> Tuple[int, int]:
        strategy = self.strategies.get(match.missionId)
        if not strategy:
            # Caso não encontre a estratégia para o missionId, retorna 0, 0 e vazio por padrão
            return 0, 0, {}
            
        return strategy.calcular_pontuacao(match)