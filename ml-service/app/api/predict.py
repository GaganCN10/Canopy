from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok", "service": "canopy-ml-service"}


@router.post("/predict/species-image")
async def predict_species_image():
    return {"success": False, "message": "Not implemented yet"}


@router.post("/predict/camera-trap")
async def triage_camera_trap():
    return {"success": False, "message": "Not implemented yet"}


@router.post("/predict/bioacoustic")
async def predict_bioacoustic():
    return {"success": False, "message": "Not implemented yet"}


@router.post("/predict/threat-audio")
async def predict_threat_audio():
    return {"success": False, "message": "Not implemented yet"}


@router.post("/predict/habitat-ndvi")
async def predict_habitat_ndvi():
    return {"success": False, "message": "Not implemented yet"}


@router.post("/predict/poaching-hotspots")
async def predict_poaching_hotspots():
    return {"success": False, "message": "Not implemented yet"}


@router.post("/predict/population-forecast")
async def predict_population_forecast():
    return {"success": False, "message": "Not implemented yet"}


@router.post("/predict/anomalies")
async def predict_anomalies():
    return {"success": False, "message": "Not implemented yet"}


@router.post("/predict/trade-scan")
async def predict_trade_scan():
    return {"success": False, "message": "Not implemented yet"}


@router.post("/predict/movement-corridors")
async def predict_movement_corridors():
    return {"success": False, "message": "Not implemented yet"}
