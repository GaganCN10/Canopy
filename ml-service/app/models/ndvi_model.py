import requests
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta

PLANETARY_COMPUTER_API = "https://planetarycomputer.microsoft.com/api/stac/v1"
SENTINEL2_COLLECTION = "sentinel-2-l2a"

HEADERS = {"Accept": "application/json"}


def find_sentinel2_tiles(bbox, start_date, end_date, max_cloud_cover=20):
    min_lon, min_lat, max_lon, max_lat = bbox
    search_params = {
        "collections": [SENTINEL2_COLLECTION],
        "bbox": [min_lon, min_lat, max_lon, max_lat],
        "datetime": f"{start_date}/{end_date}",
        "limit": 10,
        "query": {
            "eo:cloud_cover": {"lte": max_cloud_cover},
        },
    }

    resp = requests.get(PLANETARY_COMPUTER_API, params=search_params, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    return data.get("features", [])


def get_ndvi_for_tile(tile_url):
    try:
        import rasterio
    except ImportError:
        raise RuntimeError("rasterio is required for NDVI computation. Install it with: pip install rasterio")

    import rasterio.warp

    red_band_url = None
    nir_band_url = None

    for asset_key, asset in tile_url.get("assets", {}).items():
        if "B04" in asset_key and red_band_url is None:
            red_band_url = asset.get("href")
        elif "B08" in asset_key and nir_band_url is None:
            nir_band_url = asset.get("href")

    if not red_band_url or not nir_band_url:
        return None

    with rasterio.open(red_band_url) as red_src:
        red = red_src.read(1).astype(np.float32)
        profile = red_src.profile

    with rasterio.open(nir_band_url) as nir_src:
        nir = nir_src.read(1).astype(np.float32)

    ndvi = np.zeros_like(red)
    mask = (red + nir) > 0
    ndvi[mask] = (nir[mask] - red[mask]) / (nir[mask] + red[mask])
    ndvi = np.clip(ndvi, -1, 1)

    valid_mask = mask & (ndvi >= -1) & (ndvi <= 1)
    ndvi_values = ndvi[valid_mask]

    if ndvi_values.size == 0:
        return None

    return {
        "mean": float(np.mean(ndvi_values)),
        "min": float(np.min(ndvi_values)),
        "max": float(np.max(ndvi_values)),
        "std": float(np.std(ndvi_values)),
        "median": float(np.median(ndvi_values)),
        "valid_pixels": int(ndvi_values.size),
        "total_pixels": int(red.size),
    }


def compute_ndvi(bbox, start_date, end_date, max_cloud_cover=20):
    tiles = find_sentinel2_tiles(bbox, start_date, end_date, max_cloud_cover)
    if not tiles:
        return {
            "success": True,
            "data": {
                "summary": None,
                "tile_count": 0,
                "message": "No Sentinel-2 tiles found for the selected region and date range.",
            },
        }

    summaries = []
    for tile in tiles[:3]:
        summary = get_ndvi_for_tile(tile)
        if summary:
            summaries.append(summary)

    if not summaries:
        return {
            "success": True,
            "data": {
                "summary": None,
                "tile_count": len(tiles),
                "message": "Could not compute NDVI from available tiles.",
            },
        }

    combined = {
        "mean": float(np.mean([s["mean"] for s in summaries])),
        "min": float(np.min([s["min"] for s in summaries])),
        "max": float(np.max([s["max"] for s in summaries])),
        "std": float(np.mean([s["std"] for s in summaries])),
        "median": float(np.median([s["median"] for s in summaries])),
        "valid_pixels": int(np.sum([s["valid_pixels"] for s in summaries])),
        "total_pixels": int(np.sum([s["total_pixels"] for s in summaries])),
    }

    return {
        "success": True,
        "data": {
            "summary": combined,
            "tile_count": len(tiles),
            "date_range": {"start": start_date, "end": end_date},
            "bbox": bbox,
        },
    }
