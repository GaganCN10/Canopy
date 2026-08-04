import torch
import torch.nn as nn
from torchvision import transforms
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights
from pathlib import Path
import json
import numpy as np

MODEL_DIR = Path(__file__).resolve().parents[2] / "models"
MODEL_PATH = MODEL_DIR / "camera_trap_classifier_best.pth"
CLASSES_PATH = MODEL_DIR / "camera_trap_classes.json"

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

_transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

_class_names = None
_model = None


def _load_classes():
    global _class_names
    if _class_names is None and CLASSES_PATH.exists():
        with open(CLASSES_PATH, "r") as f:
            _class_names = json.load(f)
    return _class_names


def _load_model():
    global _model
    if _model is not None:
        return _model
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Camera trap classifier model not found at {MODEL_PATH}")
    model = efficientnet_b0(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, 4)
    state = torch.load(MODEL_PATH, map_location=DEVICE)
    model.load_state_dict(state)
    model.to(DEVICE)
    model.eval()
    _model = model
    return model


def preprocess_image(pil_image):
    tensor = _transform(pil_image).unsqueeze(0).to(DEVICE)
    return tensor


def predict(pil_image, top_k=4):
    model = _load_model()
    class_names = _load_classes()
    if class_names is None:
        raise RuntimeError("Class names mapping not found")

    tensor = preprocess_image(pil_image)
    with torch.no_grad():
        logits = model(tensor)
        probs = torch.softmax(logits, dim=1).cpu().numpy()[0]

    top_indices = np.argsort(probs)[::-1][:top_k]
    predictions = []
    for idx in top_indices:
        predictions.append({
            "label": class_names[idx],
            "confidence": float(probs[idx]),
        })
    return predictions
