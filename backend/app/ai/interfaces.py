from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple

class BaseRiceDiseaseModel(ABC):
    @abstractmethod
    def predict(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Runs inference on image bytes.
        Returns dictionary containing:
        - is_rice_plant: bool
        - condition: str (Disease name or Healthy or Unknown)
        - confidence: float (0.0 to 1.0)
        - severity: str (Low, Moderate, High, Unknown)
        - affected_area_percentage: float (0.0 to 100.0)
        - model_version: str
        - is_demo: bool
        - expert_review_required: bool
        """
        pass
