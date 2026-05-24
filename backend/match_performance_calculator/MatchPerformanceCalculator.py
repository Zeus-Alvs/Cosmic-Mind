from typing import Tuple
from models import PartidaParaPersistirModel

class MatchPerformanceCalculator:
    def __init__(self):
        self.strategies = {}

    def calcular_pontuacao(self, match: PartidaParaPersistirModel) -> Tuple[int, int]:
        strategy = self.strategies.get(match.missionId)
        if not strategy:
            # Caso não encontre a estratégia para o missionId, retorna 0, 0 por padrão
            return 0, 0
            
        return strategy.calcular_pontuacao(match)