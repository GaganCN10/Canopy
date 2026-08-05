import pytest
import numpy as np
from app.models.hotspot_model import compute_hotspots, summarize_hotspots


def test_compute_hotspots_empty_points():
    assert compute_hotspots([]) == []


def test_compute_hotspots_single_point():
    assert compute_hotspots([{"lat": 1.0, "lon": 2.0}]) == []


def test_compute_hotspots_two_points_minimal_spread():
    points = [{"lat": 1.0, "lon": 2.0}, {"lat": 1.0, "lon": 2.0}]
    assert compute_hotspots(points) == []


def test_compute_hotspots_success():
    points = [
        {"lat": 1.0, "lon": 2.0},
        {"lat": 1.1, "lon": 2.1},
        {"lat": 1.2, "lon": 2.2},
        {"lat": 1.05, "lon": 2.05},
    ]
    result = compute_hotspots(points, bandwidth=0.5, grid_size=10, min_intensity=0.0)
    assert result["type"] == "FeatureCollection"
    assert "features" in result
    assert len(result["features"]) > 0
    for feature in result["features"]:
        assert feature["type"] == "Feature"
        assert feature["geometry"]["type"] == "Point"
        assert "coordinates" in feature["geometry"]
        assert "properties" in feature
        assert "intensity" in feature["properties"]
        assert feature["properties"]["intensity"] >= 0.0


def test_compute_hotspots_min_intensity_filter():
    points = [
        {"lat": 1.0, "lon": 2.0},
        {"lat": 1.1, "lon": 2.1},
        {"lat": 1.2, "lon": 2.2},
    ]
    result = compute_hotspots(points, bandwidth=0.5, grid_size=10, min_intensity=0.9)
    assert result["type"] == "FeatureCollection"
    for feature in result["features"]:
        assert feature["properties"]["intensity"] >= 0.9


def test_summarize_hotspots_empty_input():
    assert summarize_hotspots({}) == []
    assert summarize_hotspots({"features": []}) == []
    assert summarize_hotspots(None) == []


def test_summarize_hotspots_success():
    fc = {
        "features": [
            {
                "geometry": {"coordinates": [2.0, 1.0]},
                "properties": {"intensity": 0.8},
            },
            {
                "geometry": {"coordinates": [2.1, 1.1]},
                "properties": {"intensity": 0.5},
            },
            {
                "geometry": {"coordinates": [2.2, 1.2]},
                "properties": {"intensity": 0.3},
            },
        ]
    }
    result = summarize_hotspots(fc, top_n=2)
    assert len(result) == 2
    assert result[0]["intensity"] == 0.8
    assert result[1]["intensity"] == 0.5
    assert result[0]["coordinates"] == [2.0, 1.0]
    assert result[1]["coordinates"] == [2.1, 1.1]


def test_summarize_hotspots_top_n():
    fc = {
        "features": [
            {"geometry": {"coordinates": [2.0, 1.0]}, "properties": {"intensity": 0.8}},
            {"geometry": {"coordinates": [2.1, 1.1]}, "properties": {"intensity": 0.5}},
            {"geometry": {"coordinates": [2.2, 1.2]}, "properties": {"intensity": 0.3}},
        ]
    }
    result = summarize_hotspots(fc, top_n=1)
    assert len(result) == 1
    assert result[0]["intensity"] == 0.8
