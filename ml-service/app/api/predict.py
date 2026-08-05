from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io
from app.models.species_model import predict as predict_species
from app.models.camera_trap_model import predict as predict_camera_trap
from app.models.bioacoustic_model import predict_audio as predict_bioacoustic_audio
from app.models.threat_audio_model import predict as predict_threat_audio
from app.models.ndvi_model import compute_ndvi
from app.models.hotspot_model import compute_hotspots
from app.models.forecast_model import aggregate_daily_counts, forecast_population
from app.models.anomaly_model import detect_anomalies
from app.models.movement_model import parse_movement_file
from app.models.trade_scanner_model import scan_text
from pathlib import Path
import os
import tempfile
import numpy as np

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok", "service": "canopy-ml-service"}


@router.post("/species-image")
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


@router.post("/camera-trap")
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


@router.post("/bioacoustic")
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


@router.post("/threat-audio")
async def predict_threat_audio(file: UploadFile = File(...)):
    try:
        import soundfile as sf
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


@router.post("/habitat-ndvi")
async def predict_habitat_ndvi(payload: dict):
    try:
        bbox = payload.get("bbox")
        start_date = payload.get("start_date")
        end_date = payload.get("end_date")
        max_cloud_cover = payload.get("max_cloud_cover", 20)

        if not bbox or not start_date or not end_date:
            raise HTTPException(status_code=400, detail="bbox, start_date, and end_date are required")

        if not isinstance(bbox, list) or len(bbox) != 4:
            raise HTTPException(status_code=400, detail="bbox must be [min_lon, min_lat, max_lon, max_lat]")

        result = compute_ndvi(bbox, start_date, end_date, max_cloud_cover)
        return result
    except HTTPException:
        raise
    except RuntimeError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/poaching-hotspots")
async def predict_poaching_hotspots(payload: dict):
    try:
        points = payload.get("points", [])
        bandwidth = float(payload.get("bandwidth", 0.5))
        grid_size = int(payload.get("grid_size", 50))

        if not isinstance(points, list) or len(points) < 2:
            raise HTTPException(status_code=400, detail="At least 2 points are required for hotspot computation")

        for p in points:
            if "lat" not in p or "lon" not in p:
                raise HTTPException(status_code=400, detail="Each point must have lat and lon")

        geojson = compute_hotspots(points, bandwidth=bandwidth, grid_size=grid_size)
        feature_count = len(geojson.get("features", [])) if isinstance(geojson, dict) else 0
        return {
            "success": True,
            "data": {
                "geojson": geojson,
                "point_count": len(points),
                "feature_count": feature_count,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/population-forecast")
async def predict_population_forecast(payload: dict):
    try:
        sightings = payload.get("sightings", [])
        periods = int(payload.get("periods", 30))
        seasonality_mode = payload.get("seasonality_mode", "additive")

        if not isinstance(sightings, list) or len(sightings) < 2:
            raise HTTPException(status_code=400, detail="At least 2 sightings are required for forecasting")

        daily_counts = aggregate_daily_counts(sightings)
        if len(daily_counts) < 2:
            raise HTTPException(status_code=400, detail="Insufficient dated sightings for forecasting")

        result = forecast_population(daily_counts, periods=periods, seasonality_mode=seasonality_mode)
        return {
            "success": True,
            "data": result,
        }
    except HTTPException:
        raise
    except RuntimeError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/anomalies")
async def predict_anomalies(payload: dict):
    try:
        time_series = payload.get("time_series", [])
        window = int(payload.get("window", 7))
        threshold = float(payload.get("threshold", 2.0))

        if not isinstance(time_series, list) or len(time_series) < 2:
            raise HTTPException(status_code=400, detail="At least 2 time series points are required")

        result = detect_anomalies(time_series, window=window, threshold=threshold)
        return {
            "success": True,
            "data": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/movement-corridors")
async def predict_movement_corridors(file: UploadFile = File(...)):
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="File is required")

        contents = await file.read()
        text = contents.decode('utf-8', errors='ignore')
        geojson = parse_movement_file(text, file.filename)
        return {
            "success": True,
            "data": {
                "geojson": geojson,
                "filename": file.filename,
                "point_count": geojson.get("features", [{}])[0].get("properties", {}).get("point_count", 0),
            },
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/trade-scan")
async def predict_trade_scan(payload: dict):
    try:
        text = payload.get("text", "")
        source = payload.get("source", "")

        if not text or not text.strip():
            raise HTTPException(status_code=400, detail="text is required")

        result = scan_text(text, source=source)
        return {
            "success": True,
            "data": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
