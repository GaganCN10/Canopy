import sys
import pytest
import numpy as np
from unittest.mock import patch, MagicMock
from app.models.ndvi_model import find_sentinel2_tiles, compute_ndvi, get_ndvi_for_tile

sys.modules.setdefault("rasterio", MagicMock())
sys.modules.setdefault("rasterio.warp", MagicMock())


def test_find_sentinel2_tiles_success():
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "features": [{"id": "tile1", "properties": {"eo:cloud_cover": 10}}]
    }
    mock_response.raise_for_status.return_value = None

    with patch("app.models.ndvi_model.requests.get", return_value=mock_response) as mock_get:
        tiles = find_sentinel2_tiles(
            [10.0, 20.0, 11.0, 21.0],
            "2024-01-01",
            "2024-01-31",
            max_cloud_cover=20,
        )
        assert len(tiles) == 1
        assert tiles[0]["id"] == "tile1"
        mock_get.assert_called_once()
        _, kwargs = mock_get.call_args
        assert kwargs["params"]["collections"] == ["sentinel-2-l2a"]
        assert kwargs["params"]["bbox"] == [10.0, 20.0, 11.0, 21.0]
        assert kwargs["params"]["query"]["eo:cloud_cover"] == {"lte": 20}


def test_find_sentinel2_tiles_http_error():
    from requests.exceptions import HTTPError

    mock_response = MagicMock()
    mock_response.raise_for_status.side_effect = HTTPError("404 Not Found")

    with patch("app.models.ndvi_model.requests.get", return_value=mock_response):
        with pytest.raises(HTTPError):
            find_sentinel2_tiles([10.0, 20.0, 11.0, 21.0], "2024-01-01", "2024-01-31")


def test_find_sentinel2_tiles_request_exception():
    import requests

    with patch(
        "app.models.ndvi_model.requests.get",
        side_effect=requests.RequestException("Connection refused"),
    ):
        with pytest.raises(requests.RequestException):
            find_sentinel2_tiles([10.0, 20.0, 11.0, 21.0], "2024-01-01", "2024-01-31")


def test_compute_ndvi_no_tiles():
    with patch("app.models.ndvi_model.find_sentinel2_tiles", return_value=[]):
        result = compute_ndvi([10.0, 20.0, 11.0, 21.0], "2024-01-01", "2024-01-31")
    assert result["success"] is True
    assert result["data"]["tile_count"] == 0
    assert result["data"]["summary"] is None
    assert "No Sentinel-2 tiles found" in result["data"]["message"]


def test_compute_ndvi_tiles_no_valid_summary():
    mock_tile = {"assets": {"B04": {"href": "http://example.com/red.tif"}}}

    with patch("app.models.ndvi_model.find_sentinel2_tiles", return_value=[mock_tile]):
        with patch("app.models.ndvi_model.get_ndvi_for_tile", return_value=None):
            result = compute_ndvi(
                [10.0, 20.0, 11.0, 21.0], "2024-01-01", "2024-01-31"
            )
    assert result["success"] is True
    assert result["data"]["summary"] is None
    assert result["data"]["tile_count"] == 1
    assert "Could not compute NDVI" in result["data"]["message"]


def test_compute_ndvi_success():
    mock_tile = {
        "assets": {
            "B04": {"href": "http://example.com/red.tif"},
            "B08": {"href": "http://example.com/nir.tif"},
        }
    }
    mock_summary = {
        "mean": 0.5,
        "min": 0.1,
        "max": 0.9,
        "std": 0.2,
        "median": 0.5,
        "valid_pixels": 100,
        "total_pixels": 200,
    }

    with patch("app.models.ndvi_model.find_sentinel2_tiles", return_value=[mock_tile]):
        with patch(
            "app.models.ndvi_model.get_ndvi_for_tile", return_value=mock_summary
        ):
            result = compute_ndvi(
                [10.0, 20.0, 11.0, 21.0], "2024-01-01", "2024-01-31"
            )
    assert result["success"] is True
    assert result["data"]["summary"]["mean"] == 0.5
    assert result["data"]["summary"]["min"] == 0.1
    assert result["data"]["summary"]["max"] == 0.9
    assert result["data"]["tile_count"] == 1
    assert result["data"]["bbox"] == [10.0, 20.0, 11.0, 21.0]


def test_compute_ndvi_multiple_tiles():
    mock_tile = {
        "assets": {
            "B04": {"href": "http://example.com/red.tif"},
            "B08": {"href": "http://example.com/nir.tif"},
        }
    }
    mock_summary1 = {
        "mean": 0.4,
        "min": 0.0,
        "max": 0.8,
        "std": 0.2,
        "median": 0.4,
        "valid_pixels": 100,
        "total_pixels": 200,
    }
    mock_summary2 = {
        "mean": 0.6,
        "min": 0.2,
        "max": 1.0,
        "std": 0.2,
        "median": 0.6,
        "valid_pixels": 150,
        "total_pixels": 300,
    }

    with patch(
        "app.models.ndvi_model.find_sentinel2_tiles",
        return_value=[mock_tile, mock_tile],
    ):
        with patch(
            "app.models.ndvi_model.get_ndvi_for_tile",
            side_effect=[mock_summary1, mock_summary2],
        ):
            result = compute_ndvi(
                [10.0, 20.0, 11.0, 21.0], "2024-01-01", "2024-01-31"
            )
    assert result["success"] is True
    assert result["data"]["tile_count"] == 2
    assert result["data"]["summary"]["mean"] == pytest.approx(0.5)


def test_get_ndvi_for_tile_no_bands():
    tile = {"assets": {}}
    assert get_ndvi_for_tile(tile) is None


def test_get_ndvi_for_tile_missing_red_band():
    tile = {"assets": {"B08": {"href": "http://example.com/nir.tif"}}}
    assert get_ndvi_for_tile(tile) is None


def test_get_ndvi_for_tile_runtime_error_without_rasterio():
    tile = {
        "assets": {
            "B04": {"href": "http://example.com/red.tif"},
            "B08": {"href": "http://example.com/nir.tif"},
        }
    }
    with patch.dict(sys.modules, {"rasterio": None, "rasterio.warp": None}):
        with pytest.raises(RuntimeError, match="rasterio is required"):
            get_ndvi_for_tile(tile)
