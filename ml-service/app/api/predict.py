from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io
from app.models.species_model import predict as predict_species
from app.models.camera_trap_model import predict as predict_camera_trap
from app.models.bioacoustic_model import predict_audio as predict_bioacoustic_audio
from app.models.threat_audio_model import predict as predict_threat_audio
from pathlib import Path
import os
import tempfile
import soundfile as sf
import numpy as np

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok", "service": "canopy-ml-service"}


@router.post("/predict/species-image")
async def predict_species_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        results = predict_species(image, top_k=3)
        return {
            "success": True,
            "data": {
                "predictions": results,
            },
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=f"Model not available: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict/camera-trap")
async def triage_camera_trap(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        results = predict_camera_trap(image, top_k=4)
        top = results[0] if results else {"label": "blank", "confidence": 0.0}
        return {
            "success": True,
            "data": {
                "label": top["label"],
                "confidence": top["confidence"],
                "predictions": results,
            },
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=f"Model not available: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict/bioacoustic")
async def predict_bioacoustic(file: UploadFile = File(...)):
    try:
        suffix = os.path.splitext(file.filename or "audio.wav")[1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        try:
            segments = predict_bioacoustic_audio(tmp_path)
            top = segments[0] if segments else None
            return {
                "success": True,
                "data": {
                    "top_prediction": top,
                    "segments": segments,
                },
            }
        finally:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=f"Model not available: {e}")
    except RuntimeError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict/threat-audio")
async def predict_threat_audio(file: UploadFile = File(...)):
    try:
        suffix = os.path.splitext(file.filename or "audio.wav")[1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        try:
            y, sr = sf.read(tmp_path)
            if y.ndim > 1:
                y = np.mean(y, axis=1)
            results = predict_threat_audio(y, sample_rate=sr)
            top = results[0] if results else {"label": "non_threat", "confidence": 0.0}
            return {
                "success": True,
                "data": {
                    "label": top["label"],
                    "confidence": top["confidence"],
                    "predictions": results,
                },
            }
        finally:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=f"Model not available: {e}")
    except RuntimeError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict/habitat-ndvi")
async def predict_habitat_ndvi():
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/predict/poaching-hotspots")
async def predict_poaching_hotspots():
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/predict/population-forecast")
async def predict_population_forecast():
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/predict/anomalies")
async def predict_anomalies():
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/predict/trade-scan")
async def predict_trade_scan():
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/predict/movement-corridors")
async def predict_movement_corridors():
    raise HTTPException(status_code=501, detail="Not implemented yet")
