"""Fake predictions for local development when the .onnx file is not downloaded yet.
Only used when USE_FAKE_MODEL=true. Never used by default."""
import random

from PIL import Image

NAMES = [
    "Melanocytic nevus",
    "Melanoma",
    "Benign keratosis",
    "Basal cell carcinoma",
    "Actinic keratosis",
    "Vascular lesion",
    "Dermatofibroma",
]
HIGH_RISK = {"Melanoma", "Basal cell carcinoma", "Actinic keratosis"}


def fake_predict(image: Image.Image) -> dict:
    rng = random.Random(image.width * 31 + image.height)
    raw = [rng.random() ** 3 for _ in NAMES]
    total = sum(raw)
    probs = {n: round(v / total, 4) for n, v in zip(NAMES, raw)}
    probs = dict(sorted(probs.items(), key=lambda kv: kv[1], reverse=True))
    top, conf = next(iter(probs.items()))
    return {
        "top_type": top,
        "confidence": conf,
        "risk": "high" if top in HIGH_RISK else "low",
        "uncertain": conf < 0.5,
        "all_types": probs,
    }
