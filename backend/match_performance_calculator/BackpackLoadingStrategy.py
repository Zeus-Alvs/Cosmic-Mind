from .MatchPerformanceCalculatorStrategy import MatchPerformanceCalculatorStrategy
from models import PartidaParaPersistirModel
from typing import Tuple, Dict, Any

class BackpackLoadingStrategy(MatchPerformanceCalculatorStrategy):
    def calcular_pontuacao(self, match: PartidaParaPersistirModel) -> Tuple[int, int, Dict[str, Any]]:
        metadata = match.metadata
        essential = metadata.get("EssentialEquipmentsLoaded", 0)
        non_essential = metadata.get("NonEssentialEquipmentsLoaded", 0)
        time_remaining = metadata.get("TimeRemaining", 0.0)
        time_spent = metadata.get("TimeSpent", 0.0)
        
        score, stars = 0, 0

        # Condições de derrota: timer esgotou, ou 3 não essenciais, ou menos de 3 essenciais no fim do jogo
        if not (essential < 3 or non_essential >= 3 or time_remaining <= 0):
            # Condições de vitória
            score = 1000
            
            # Bônus por tempo restante (ex: 10 pontos por segundo restante)
            score += int(time_remaining * 10)
            
            # Penalidade por itens não essenciais (ex: 100 pontos por erro)
            score -= (non_essential * 100)
            
            score = max(0, score)
            
            # Cálculo de estrelas baseado nos erros (não essenciais) e tempo gasto
            if non_essential == 0 and time_spent <= 30:
                stars = 3
            elif non_essential <= 1 and time_spent <= 45:
                stars = 2
            else:
                stars = 1

        tempo_medio = 0
        if essential + non_essential > 0:
            tempo_medio = (time_spent * 1000) / (essential + non_essential)

        metricas_cognitivas = {
            "acertos": essential,
            "erros": non_essential,
            "tempo_medio_reacao_ms": int(tempo_medio),
            "habilidade_foco": "Lógica"
        }
            
        return score, stars, metricas_cognitivas
