import io
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models
from torchvision import transforms
from PIL import Image

class SkinLesionClassifier_B4(nn.Module):
    def __init__(self, num_classes: int = 7, dropout_rate: float = 0.4):
        super().__init__()
        self.backbone = models.efficientnet_b4(weights=None)
        in_features = self.backbone.classifier[1].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(p=dropout_rate),
            nn.Linear(in_features, 256),
            nn.ReLU(),
            nn.Dropout(p=dropout_rate / 2),
            nn.Linear(256, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x)

class SkinLesionClassifier_ConvNeXt(nn.Module):
    def __init__(self, num_classes: int = 7, dropout_rate: float = 0.4):
        super().__init__()
        self.backbone = models.convnext_tiny(weights=None)
        in_features = self.backbone.classifier[2].in_features
        self.backbone.classifier[2] = nn.Sequential(
            nn.Dropout(p=dropout_rate),
            nn.Linear(in_features, 256),
            nn.GELU(),
            nn.Dropout(p=dropout_rate / 2),
            nn.Linear(256, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x)

class SkinLesionClassifier_DenseNet201(nn.Module):
    def __init__(self, num_classes: int = 7, dropout_rate: float = 0.4):
        super().__init__()
        self.backbone = models.densenet201(weights=None)
        in_features = self.backbone.classifier.in_features
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(p=dropout_rate),
            nn.Linear(in_features, 256),
            nn.ReLU(),
            nn.Dropout(p=dropout_rate / 2),
            nn.Linear(256, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x)

def load_ensemble(ckpt_path: str = "skin_lesion_ensemble_final.pth", device: torch.device = None):
    """Load the 3-model skin lesion ensemble once at backend startup."""
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    ckpt = torch.load(ckpt_path, map_location=device, weights_only=False)
    num_classes = len(ckpt["label_map"])

    m_b4 = SkinLesionClassifier_B4(num_classes=num_classes).to(device).eval()
    m_conv = SkinLesionClassifier_ConvNeXt(num_classes=num_classes).to(device).eval()
    m_dense = SkinLesionClassifier_DenseNet201(num_classes=num_classes).to(device).eval()

    m_b4.load_state_dict(ckpt["b4_state_dict"])
    m_conv.load_state_dict(ckpt["convnext_state_dict"])
    m_dense.load_state_dict(ckpt["densenet_state_dict"])

    img_size = ckpt.get("img_size", 260)
    preprocess = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225]),
    ])

    return {
        "models": [m_b4, m_conv, m_dense],
        "weights": ckpt["weights"],
        "label_map": ckpt["label_map"],
        "display_names": ckpt["display_names"],
        "high_risk_classes": set(ckpt["high_risk_classes"]),
        "preprocess": preprocess,
        "device": device,
    }

def predict(image_input, bundle: dict, use_tta: bool = True, uncertainty_threshold: float = 0.50) -> dict:
    """
    Predict skin lesion class from a file path, raw bytes, or PIL Image.
    Returns JSON matching the frontend/FastAPI API contract.
    """
    if isinstance(image_input, Image.Image):
        img = image_input.convert("RGB")
    elif isinstance(image_input, (bytes, bytearray)):
        img = Image.open(io.BytesIO(image_input)).convert("RGB")
    else:
        img = Image.open(image_input).convert("RGB")

    device = bundle["device"]
    x = bundle["preprocess"](img).unsqueeze(0).to(device)

    # Batch 4-Flip TTA together so inference stays fast
    if use_tta:
        batch = torch.cat([
            x,
            torch.flip(x, dims=[3]),
            torch.flip(x, dims=[2]),
            torch.flip(x, dims=[2, 3]),
        ], dim=0)
    else:
        batch = x

    with torch.no_grad():
        total_probs = None
        for model, w in zip(bundle["models"], bundle["weights"]):
            probs = F.softmax(model(batch).float(), dim=1).mean(dim=0)
            total_probs = probs * w if total_probs is None else total_probs + probs * w

    probs_np = total_probs.cpu().numpy()
    idx_to_short = {v: k for k, v in bundle["label_map"].items()}
    display_names = bundle["display_names"]

    all_types = {
        display_names[idx_to_short[i]]: round(float(probs_np[i]), 4)
        for i in range(len(probs_np))
    }
    all_types = dict(sorted(all_types.items(), key=lambda item: item[1], reverse=True))

    top_type, confidence = next(iter(all_types.items()))
    risk = "high" if top_type in bundle["high_risk_classes"] else "low"

    return {
        "top_type": top_type,
        "confidence": confidence,
        "risk": risk,
        "uncertain": bool(confidence < uncertainty_threshold),
        "all_types": all_types,
    }
