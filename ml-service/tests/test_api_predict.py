import io
import os
import sys
from unittest.mock import patch, MagicMock
from PIL import Image
import pytest
import numpy as np

from starlette.testclient import TestClient

from main import app

sys.modules.setdefault("soundfile", MagicMock())


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def _create_test_png_bytes():
    img = Image.new("RGB", (10, 10), color="red")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["service"] == "canopy-ml-service"


def test_species_image_success(client):
    image_bytes = _create_test_png_bytes()
    mock_predictions = [{"species": "tiger", "confidence": 0.9}]

    with patch("app.api.predict.predict_species", return_value=mock_predictions):
        response = client.post(
            "/species-image",
            files={"file": ("test.png", image_bytes, "image/png")},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["predictions"] == mock_predictions


def test_species_image_invalid_image(client):
    response = client.post(
        "/species-image",
        files={"file": ("test.png", b"not an image", "image/png")},
    )
    assert response.status_code == 500


def test_camera_trap_success(client):
    image_bytes = _create_test_png_bytes()
    mock_predictions = [
        {"label": "animal", "confidence": 0.9},
        {"label": "blank", "confidence": 0.1},
    ]

    with patch(
        "app.api.predict.predict_camera_trap", return_value=mock_predictions
    ):
        response = client.post(
            "/camera-trap",
            files={"file": ("trap.png", image_bytes, "image/png")},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["label"] == "animal"
    assert data["data"]["confidence"] == 0.9
    assert len(data["data"]["predictions"]) == 2


def test_bioacoustic_success(client):
    mock_segments = [
        {"species": "sparrow", "confidence": 0.8, "start": 0.0, "end": 1.0},
    ]

    with patch(
        "app.api.predict.predict_bioacoustic_audio", return_value=mock_segments
    ):
        response = client.post(
            "/bioacoustic",
            files={"file": ("test.wav", b"fake audio data", "audio/wav")},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["segments"] == mock_segments
    assert data["data"]["top_prediction"] == mock_segments[0]


def test_bioacoustic_no_segments(client):
    with patch("app.api.predict.predict_bioacoustic_audio", return_value=[]):
        response = client.post(
            "/bioacoustic",
            files={"file": ("test.wav", b"fake audio data", "audio/wav")},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["top_prediction"] is None


def test_threat_audio_success(client):
    from unittest.mock import MagicMock

    mock_audio = np.zeros(16000, dtype=np.float32)
    mock_results = [{"label": "gunshot", "confidence": 0.9}]

    with patch("soundfile.read", return_value=(mock_audio, 16000)):
        with patch(
            "app.api.predict.predict_threat_audio",
            new=MagicMock(return_value=mock_results),
        ):
            response = client.post(
                "/threat-audio",
                files={"file": ("threat.wav", b"fake audio data", "audio/wav")},
            )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["label"] == "gunshot"
    assert data["data"]["confidence"] == 0.9


def test_threat_audio_no_results(client):
    from unittest.mock import MagicMock

    mock_audio = np.zeros(16000, dtype=np.float32)

    with patch("soundfile.read", return_value=(mock_audio, 16000)):
        with patch(
            "app.api.predict.predict_threat_audio",
            new=MagicMock(return_value=[]),
        ):
            response = client.post(
                "/threat-audio",
                files={"file": ("threat.wav", b"fake audio data", "audio/wav")},
            )
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["label"] == "non_threat"
    assert data["data"]["confidence"] == 0.0


def test_habitat_ndvi_success(client):
    mock_result = {
        "success": True,
        "data": {
            "summary": {"mean": 0.5, "min": 0.1, "max": 0.9},
            "tile_count": 2,
            "date_range": {"start": "2024-01-01", "end": "2024-01-31"},
            "bbox": [10.0, 20.0, 11.0, 21.0],
        },
    }

    with patch("app.api.predict.compute_ndvi", return_value=mock_result):
        response = client.post(
            "/habitat-ndvi",
            json={
                "bbox": [10.0, 20.0, 11.0, 21.0],
                "start_date": "2024-01-01",
                "end_date": "2024-01-31",
                "max_cloud_cover": 20,
            },
        )
    assert response.status_code == 200
    assert response.json() == mock_result


def test_habitat_ndvi_missing_bbox(client):
    response = client.post(
        "/habitat-ndvi",
        json={"start_date": "2024-01-01", "end_date": "2024-01-31"},
    )
    assert response.status_code == 400
    assert "bbox" in response.json()["detail"]


def test_habitat_ndvi_missing_dates(client):
    response = client.post(
        "/habitat-ndvi",
        json={"bbox": [10.0, 20.0, 11.0, 21.0]},
    )
    assert response.status_code == 400


def test_habitat_ndvi_invalid_bbox(client):
    response = client.post(
        "/habitat-ndvi",
        json={
            "bbox": [10.0, 20.0],
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
        },
    )
    assert response.status_code == 400
    assert "bbox must be" in response.json()["detail"]


def test_poaching_hotspots_success(client):
    mock_geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [2.0, 1.0]},
                "properties": {"intensity": 0.8},
            }
        ],
    }

    with patch(
        "app.api.predict.compute_hotspots", return_value=mock_geojson
    ):
        response = client.post(
            "/poaching-hotspots",
            json={
                "points": [
                    {"lat": 1.0, "lon": 2.0},
                    {"lat": 1.1, "lon": 2.1},
                ],
                "bandwidth": 0.5,
                "grid_size": 50,
            },
        )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["feature_count"] == 1
    assert data["data"]["point_count"] == 2


def test_poaching_hotspots_insufficient_points(client):
    response = client.post(
        "/poaching-hotspots", json={"points": [{"lat": 1.0, "lon": 2.0}]}
    )
    assert response.status_code == 400
    assert "At least 2 points" in response.json()["detail"]


def test_poaching_hotspots_missing_lat_lon(client):
    response = client.post(
        "/poaching-hotspots",
        json={"points": [{"lat": 1.0}, {"lat": 1.1, "lon": 2.1}]},
    )
    assert response.status_code == 400
    assert "lat and lon" in response.json()["detail"]


def test_population_forecast_success(client):
    import pandas as pd

    mock_result = {
        "history": [{"ds": "2024-01-01", "y": 1}],
        "forecast": [
            {"date": "2024-02-01", "yhat": 2.0, "yhat_lower": 1.0, "yhat_upper": 3.0}
        ],
    }

    dates = pd.date_range("2024-01-01", periods=10, freq="D")
    daily_counts = pd.DataFrame({"ds": dates, "y": range(10)})

    with patch(
        "app.api.predict.aggregate_daily_counts",
        return_value=daily_counts,
    ):
        with patch(
            "app.api.predict.forecast_population", return_value=mock_result
        ):
            response = client.post(
                "/population-forecast",
                json={
                    "sightings": [
                        {"timestamp": "2024-01-01"},
                        {"timestamp": "2024-01-02"},
                    ],
                    "periods": 5,
                },
            )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"] == mock_result


def test_population_forecast_insufficient_sightings(client):
    response = client.post(
        "/population-forecast", json={"sightings": [{"timestamp": "2024-01-01"}]}
    )
    assert response.status_code == 400
    assert "At least 2 sightings" in response.json()["detail"]


def test_population_forecast_non_list_sightings(client):
    response = client.post(
        "/population-forecast", json={"sightings": "not a list"}
    )
    assert response.status_code == 400


def test_anomalies_success(client):
    mock_result = {
        "anomalies": [
            {"date": "2024-01-10", "value": 50.0, "z_score": 3.0, "direction": "spike"}
        ],
        "total_points": 10,
        "window": 7,
        "threshold": 2.0,
    }

    with patch("app.api.predict.detect_anomalies", return_value=mock_result):
        response = client.post(
            "/anomalies",
            json={
                "time_series": [
                    {"date": f"2024-01-{i:02d}", "value": float(i)} for i in range(1, 11)
                ]
            },
        )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"] == mock_result


def test_anomalies_insufficient_points(client):
    response = client.post(
        "/anomalies", json={"time_series": [{"date": "2024-01-01", "value": 1.0}]}
    )
    assert response.status_code == 400
    assert "At least 2 time series points" in response.json()["detail"]


def test_anomalies_non_list(client):
    response = client.post("/anomalies", json={"time_series": "not a list"})
    assert response.status_code == 400


def test_movement_corridors_gpx(client):
    gpx_content = """<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="test" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <trkseg>
      <trkpt lat="1.0" lon="2.0"><time>2024-01-01T00:00:00Z</time></trkpt>
      <trkpt lat="1.1" lon="2.1"><time>2024-01-01T01:00:00Z</time></trkpt>
    </trkseg>
  </trk>
</gpx>"""
    mock_geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[2.0, 1.0], [2.1, 1.1]],
                },
                "properties": {"point_count": 2},
            }
        ],
    }

    with patch(
        "app.api.predict.parse_movement_file", return_value=mock_geojson
    ):
        response = client.post(
            "/movement-corridors",
            files={
                "file": ("track.gpx", gpx_content.encode("utf-8"), "application/gpx+xml")
            },
        )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["geojson"] == mock_geojson
    assert data["data"]["point_count"] == 2


def test_movement_corridors_csv(client):
    csv_content = "latitude,longitude\n1.0,2.0\n1.1,2.1\n"
    mock_geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[2.0, 1.0], [2.1, 1.1]],
                },
                "properties": {"point_count": 2},
            }
        ],
    }

    with patch(
        "app.api.predict.parse_movement_file", return_value=mock_geojson
    ):
        response = client.post(
            "/movement-corridors",
            files={"file": ("track.csv", csv_content.encode("utf-8"), "text/csv")},
        )
    assert response.status_code == 200
    assert response.json()["success"] is True


def test_movement_corridors_no_filename(client):
    response = client.post(
        "/movement-corridors",
        files={"file": ("", b"content", "text/plain")},
    )
    assert response.status_code in (400, 422)


def test_movement_corridors_unsupported_format(client):
    response = client.post(
        "/movement-corridors",
        files={"file": ("track.txt", b"some content", "text/plain")},
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]


def test_trade_scan_flagged(client):
    mock_result = {
        "is_flagged": True,
        "confidence": 0.8,
        "matched_keywords": ["ivory"],
        "text_length": 10,
        "source": "web",
    }

    with patch("app.api.predict.scan_text", return_value=mock_result):
        response = client.post("/trade-scan", json={"text": "ivory for sale", "source": "web"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"] == mock_result


def test_trade_scan_clean_text(client):
    mock_result = {
        "is_flagged": False,
        "confidence": 0.3,
        "matched_keywords": [],
        "text_length": 20,
        "source": "web",
    }

    with patch("app.api.predict.scan_text", return_value=mock_result):
        response = client.post(
            "/trade-scan", json={"text": "Normal text about conservation", "source": "web"}
        )
    assert response.status_code == 200
    assert response.json()["data"]["is_flagged"] is False


def test_trade_scan_empty_text(client):
    response = client.post("/trade-scan", json={"text": ""})
    assert response.status_code == 400
    assert "text is required" in response.json()["detail"]


def test_trade_scan_whitespace_text(client):
    response = client.post("/trade-scan", json={"text": "   "})
    assert response.status_code == 400


def test_trade_scan_missing_text(client):
    response = client.post("/trade-scan", json={})
    assert response.status_code == 400
