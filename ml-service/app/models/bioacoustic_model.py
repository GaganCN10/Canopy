import numpy as np
from pathlib import Path

try:
    import birdnet_analyzer.analyze as birdnet_analyze
    BIRDNET_AVAILABLE = True
except Exception:
    BIRDNET_AVAILABLE = False

MODEL_DIR = Path(__file__).resolve().parents[2] / "models"
SPECIES_LIST_PATH = MODEL_DIR / "bioacoustic_species.txt"


def _load_species_list():
    if SPECIES_LIST_PATH.exists():
        return [line.strip() for line in SPECIES_LIST_PATH.read_text().splitlines() if line.strip()]
    return []


def predict_audio(audio_path, min_confidence=0.1):
    if not BIRDNET_AVAILABLE:
        raise RuntimeError("BirdNET is not installed. Install birdnet-analyzer to enable bioacoustic prediction.")

    species_list = _load_species_list()
    if not species_list:
        raise RuntimeError("Species list not found. Create models/bioacoustic_species.txt with target species.")

    audio_path = str(audio_path)
    try:
        result = birdnet_analyze.analyze_audio(
            audio_path,
            species_list=species_list,
            min_confidence=min_confidence,
        )
    except Exception as exc:
        raise RuntimeError(f"BirdNET inference failed: {exc}") from exc

    segments = []
    if isinstance(result, dict):
        raw_segments = result.get("segments") or result.get("predictions") or []
    elif isinstance(result, list):
        raw_segments = result
    else:
        raw_segments = []

    for seg in raw_segments:
        if not isinstance(seg, dict):
            continue
        name = seg.get("species") or seg.get("common_name") or seg.get("label")
        confidence = seg.get("confidence") or seg.get("score") or 0.0
        start = seg.get("start") or seg.get("start_time") or 0.0
        end = seg.get("end") or seg.get("end_time") or 0.0
        if not name:
            continue
        segments.append({
            "species": str(name),
            "confidence": float(confidence),
            "start": float(start),
            "end": float(end),
        })

    segments.sort(key=lambda x: x["confidence"], reverse=True)
    return segments
