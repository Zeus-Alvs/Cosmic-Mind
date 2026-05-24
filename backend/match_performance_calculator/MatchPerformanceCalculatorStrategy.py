from abc import ABC, abstractmethod
from typing import Tuple
from models import PartidaParaPersistirModel

class MatchPerformanceCalculatorStrategy(ABC):
    @abstractmethod
    def calcular_pontuacao(self, match: PartidaParaPersistirModel) -> Tuple[int, int]:
        """
        This method calculates the score and number of stars based on the match performance.
        It receives a PartidaParaPersistirModel object and returns a tuple containing the score and the number of stars.

        Args:
            match (PartidaParaPersistirModel): Information about the match.

        Returns:
            Tuple[int, int]: A tuple containing the score and the number of stars.
        """
        pass
