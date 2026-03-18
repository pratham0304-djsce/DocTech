"""
Medical Image Analysis Service
==============================
Uses PyTorch and torchvision to process medical images (X-rays, MRIs, CTs)
and perform a forward pass through a DenseNet121 classification model.
"""

from __future__ import annotations

import io
import torch  # type: ignore[import]
import torch.nn as nn  # type: ignore[import]
from PIL import Image  # type: ignore[import]

# ─────────────────────────────────────────────────────────────────────────────
# Device
# ─────────────────────────────────────────────────────────────────────────────
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ─────────────────────────────────────────────────────────────────────────────
# Lazy model loading — avoids downloading weights on startup
# ─────────────────────────────────────────────────────────────────────────────
_MODEL = None


def _get_model():  # type: ignore[return]
    global _MODEL
    if _MODEL is not None:
        return _MODEL
    try:
        from torchvision.models import densenet121, DenseNet121_Weights  # type: ignore[import]
        model = densenet121(weights=DenseNet121_Weights.DEFAULT)
        # 3-class mock: 0=Normal, 1=Pneumonia, 2=Pleural Effusion
        model.classifier = nn.Linear(model.classifier.in_features, 3)
        model = model.to(device)
        model.eval()
        _MODEL = model
        return _MODEL
    except Exception as exc:
        raise RuntimeError(f"Failed to load model: {exc}") from exc


CLASS_LABELS: dict[int, str] = {
    0: "No Significant Findings",
    1: "Pneumonia / Opacity",
    2: "Pleural Effusion",
}

# ─────────────────────────────────────────────────────────────────────────────
# Preprocessing — pure torchvision (no MONAI dependency)
# ─────────────────────────────────────────────────────────────────────────────

def _preprocess(pil_image: Image.Image) -> torch.Tensor:  # type: ignore[return]
    """Convert PIL image → normalised tensor (1, 3, 224, 224)."""
    from torchvision import transforms  # type: ignore[import]

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225]),
    ])
    tensor = transform(pil_image)            # (3, 224, 224)
    return tensor.unsqueeze(0).to(device)    # (1, 3, 224, 224)


def _detect_modality(filename: str) -> str:
    fn = filename.lower()
    if "mri" in fn:
        return "MRI"
    if "ct" in fn or "scan" in fn:
        return "CT Scan"
    return "X-ray"

# ─────────────────────────────────────────────────────────────────────────────
# Main inference function
# ─────────────────────────────────────────────────────────────────────────────

def analyze_medical_image(file_bytes: bytes, filename: str) -> dict:
    """
    1. Load raw bytes as PIL image.
    2. Apply torchvision preprocessing.
    3. Forward pass through DenseNet121.
    4. Return structured finding dict.
    """
    try:
        img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        tensor = _preprocess(img)
        model = _get_model()

        with torch.no_grad():
            outputs = model(tensor)
            probs = torch.nn.functional.softmax(outputs, dim=1)[0]
            top_prob, top_idx = torch.max(probs, 0)

            confidence: float = round(float(top_prob.item()), 3)
            class_idx: int = int(top_idx.item())
            finding = CLASS_LABELS.get(class_idx, "Unknown Finding")

        modality = _detect_modality(filename)

        return {
            "possible_findings": [finding] if class_idx != 0 else [],
            "confidence_score": confidence,
            "modality_detected": modality,
            "status": "success",
            "message": "Analysis complete. Note: placeholder model — not for clinical use.",
        }

    except Exception as exc:
        print(f"[Image Analysis Error] {type(exc).__name__}: {exc}")
        return {
            "possible_findings": [],
            "confidence_score": 0.0,
            "modality_detected": "Unknown",
            "status": "error",
            "message": f"Failed to analyze image: {exc}",
        }
