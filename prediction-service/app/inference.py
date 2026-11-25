import io
import numpy as np
import onnxruntime as ort
from PIL import Image

DISPLAY_NAMES = [
    "Melanocytic nevus",
    "Melanoma",
    "Benign keratosis",
    "Basal cell carcinoma",
    "Actinic keratosis",
    "Vascular lesion",
    "Dermatofibroma",
]
HIGH_RISK_CLASSES = {"Melanoma", "Basal cell carcinoma", "Actinic keratosis"}
IMG_SIZE = 260
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def load_ensemble(onnx_path: str = "skin_lesion_ensemble.onnx", providers=None) -> dict:
    """Load the unified 3-model ONNX ensemble once at backend startup."""
    if providers is None:
        available = ort.get_available_providers()
        providers = ["CUDAExecutionProvider", "CPUExecutionProvider"] if "CUDAExecutionProvider" in available else ["CPUExecutionProvider"]

    session = ort.InferenceSession(onnx_path, providers=providers)
    input_name = session.get_inputs()[0].name
    output_name = session.get_outputs()[0].name

    return {
        "session": session,
        "input_name": input_name,
        "output_name": output_name,
    }


def _preprocess(image_input) -> np.ndarray:
    """Convert path, bytes, or PIL Image to NCHW float32 normalized tensor."""
    if isinstance(image_input, Image.Image):
        img = image_input.convert("RGB")
    elif isinstance(image_input, (bytes, bytearray)):
        img = Image.open(io.BytesIO(image_input)).convert("RGB")
    else:
        img = Image.open(image_input).convert("RGB")

    resampling = Image.Resampling.BILINEAR if hasattr(Image, "Resampling") else Image.BILINEAR
    img = img.resize((IMG_SIZE, IMG_SIZE), resampling)
    arr = np.asarray(img, dtype=np.float32) / 255.0
    arr = (arr - IMAGENET_MEAN) / IMAGENET_STD
    return np.transpose(arr, (2, 0, 1))[None, ...].astype(np.float32)


def predict(image_input, bundle: dict, use_tta: bool = True, uncertainty_threshold: float = 0.50) -> dict:
    """
    Predict skin lesion class using ONNX Runtime (no PyTorch required in production).
    Returns JSON matching the frontend/FastAPI API contract.
    """
    x = _preprocess(image_input)

    if use_tta:
        batch = np.concatenate([
            x,
            x[:, :, :, ::-1],
            x[:, :, ::-1, :],
            x[:, :, ::-1, ::-1],
        ], axis=0).astype(np.float32)
    else:
        batch = x

    probs = bundle["session"].run(
        [bundle["output_name"]],
        {bundle["input_name"]: batch},
    )[0].mean(axis=0)

    all_types = {
        DISPLAY_NAMES[i]: round(float(probs[i]), 4)
        for i in range(len(DISPLAY_NAMES))
    }
    all_types = dict(sorted(all_types.items(), key=lambda item: item[1], reverse=True))

    top_type, confidence = next(iter(all_types.items()))
    risk = "high" if top_type in HIGH_RISK_CLASSES else "low"

    return {
        "top_type": top_type,
        "confidence": confidence,
        "risk": risk,
        "uncertain": bool(confidence < uncertainty_threshold),
        "all_types": all_types,
    }
