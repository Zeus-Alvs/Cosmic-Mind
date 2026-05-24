from abc import ABC, abstractmethod
from typing import Tuple, Dict, Any
from models import PartidaParaPersistirModel

class MatchPerformanceCalculatorStrategy(ABC):
    @abstractmethod
    def calcular_pontuacao(self, match: PartidaParaPersistirModel) -> Tuple[int, int, Dict[str, Any]]:
        """
        This method calculates the score, stars and cognitive metrics based on the match performance.
        It receives a PartidaParaPersistirModel object and returns a tuple containing the score, the number of stars and the cognitive metrics dictionary.

        Args:
            match (PartidaParaPersistirModel): Information about the match.

        Returns:
            Tuple[int, int, Dict[str, Any]]: A tuple containing the score, the number of stars and the cognitive metrics.
        """
        pass
