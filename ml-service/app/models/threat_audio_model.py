import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from pathlib import Path

try:
    import yamnet
    YAMNET_AVAILABLE = True
except Exception:
    YAMNET_AVAILABLE = False

MODEL_DIR = Path(__file__).resolve().parents[2] / "models"
MODEL_PATH = MODEL_DIR / "threat_audio_classifier_best.pth"
CLASSES_PATH = MODEL_DIR / "threat_audio_classes.json"

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

_class_names = None
_model = None


def _load_classes():
    global _class_names
    if _class_names is None and CLASSES_PATH.exists():
        import json
        with open(CLASSES_PATH, "r") as f:
            _class_names = json.load(f)
    return _class_names


def _build_model(num_classes=2):
    if YAMNET_AVAILABLE:
        class ThreatAudioClassifier(nn.Module):
            def __init__(self, num_classes=2):
                super().__init__()
                self.yamnet = yamnet.yamnet()
                self.classifier = nn.Linear(1024, num_classes)

            def forward(self, x):
                embeddings, _ = self.yamnet(x)
                embeddings = torch.mean(embeddings, dim=0, keepdim=True)
                logits = self.classifier(embeddings)
                return logits
        return ThreatAudioClassifier(num_classes)
    else:
        class SimpleAudioClassifier(nn.Module):
            def __init__(self, num_classes=2):
                super().__init__()
                self.conv1 = nn.Conv1d(1, 64, kernel_size=3, stride=2)
                self.conv2 = nn.Conv1d(64, 128, kernel_size=3, stride=2)
                self.pool = nn.AdaptiveAvgPool1d(1)
                self.fc = nn.Linear(128, num_classes)

            def forward(self, x):
                x = x.unsqueeze(1)
                x = F.relu(self.conv1(x))
                x = F.relu(self.conv2(x))
                x = self.pool(x).squeeze(-1)
                logits = self.fc(x)
                return logits
        return SimpleAudioClassifier(num_classes)


def _load_model():
    global _model
    if _model is not None:
        return _model
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Threat audio classifier model not found at {MODEL_PATH}")
    model = _build_model(num_classes=2)
    state = torch.load(MODEL_PATH, map_location=DEVICE)
    model.load_state_dict(state)
    model.to(DEVICE)
    model.eval()
    _model = model
    return model


def preprocess_audio(audio_waveform, sample_rate=16000):
    if audio_waveform.dtype != np.float32:
        audio_waveform = audio_waveform.astype(np.float32)
    if np.max(np.abs(audio_waveform)) > 1.0:
        audio_waveform = audio_waveform / 32768.0
    if sample_rate != 16000:
        import librosa
        audio_waveform = librosa.resample(audio_waveform, orig_sr=sample_rate, target_sr=16000)
    if len(audio_waveform) < 15600:
        audio_waveform = np.pad(audio_waveform, (0, 15600 - len(audio_waveform)), mode="constant")
    else:
        audio_waveform = audio_waveform[:15600]
    return torch.from_numpy(audio_waveform).float().to(DEVICE)


def predict(audio_waveform, sample_rate=16000):
    model = _load_model()
    class_names = _load_classes()
    if class_names is None:
        raise RuntimeError("Class names mapping not found")

    tensor = preprocess_audio(audio_waveform, sample_rate)
    with torch.no_grad():
        logits = model(tensor.unsqueeze(0))
        probs = F.softmax(logits, dim=1).cpu().numpy()[0]

    predictions = []
    for idx, prob in enumerate(probs):
        label = class_names[idx] if idx < len(class_names) else str(idx)
        predictions.append({
            "label": label,
            "confidence": float(prob),
        })
    predictions.sort(key=lambda x: x["confidence"], reverse=True)
    return predictions
