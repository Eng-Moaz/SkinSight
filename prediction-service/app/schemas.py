from typing import Dict

from pydantic import BaseModel


class PredictionResponse(BaseModel):
    top_type: str
    confidence: float
    risk: str  # "high" or "low"
    uncertain: bool = False  # True when the top score is below the threshold in inference.py
    all_types: Dict[str, float]
