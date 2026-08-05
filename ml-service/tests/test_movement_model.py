import pytest
from app.models.movement_model import (
    parse_gpx,
    parse_csv,
    trajectory_to_geojson,
    parse_movement_file,
)


VALID_GPX = """<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="test" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Test Track</name>
    <trkseg>
      <trkpt lat="1.0" lon="2.0">
        <time>2024-01-01T00:00:00Z</time>
      </trkpt>
      <trkpt lat="1.1" lon="2.1">
        <time>2024-01-01T01:00:00Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>"""

VALID_GPX_WAYPOINTS = """<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="test" xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="1.0" lon="2.0">
    <time>2024-01-01T00:00:00Z</time>
  </wpt>
  <wpt lat="1.1" lon="2.1">
    <time>2024-01-01T01:00:00Z</time>
  </wpt>
</gpx>"""

VALID_CSV = """latitude,longitude,timestamp
1.0,2.0,2024-01-01T00:00:00Z
1.1,2.1,2024-01-01T01:00:00Z
1.2,2.2,2024-01-01T02:00:00Z
"""

CSV_ALTERNATE_COLUMNS = """latitude,longitude,Timestamp
1.0,2.0,2024-01-01T00:00:00Z
1.1,2.1,2024-01-01T01:00:00Z
"""


def test_parse_gpx_valid():
    points = parse_gpx(VALID_GPX)
    assert len(points) == 2
    assert points[0]["lat"] == 1.0
    assert points[0]["lon"] == 2.0
    assert points[0]["time"] == "2024-01-01T00:00:00Z"
    assert points[1]["lat"] == 1.1
    assert points[1]["lon"] == 2.1


def test_parse_gpx_waypoints_only():
    points = parse_gpx(VALID_GPX_WAYPOINTS)
    assert len(points) == 2
    assert points[0]["lat"] == 1.0
    assert points[0]["lon"] == 2.0


def test_parse_gpx_invalid_xml():
    with pytest.raises(ValueError, match="Invalid GPX file"):
        parse_gpx("not valid xml")


def test_parse_gpx_no_points():
    empty_gpx = """<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="test" xmlns="http://www.topografix.com/GPX/1/1">
</gpx>"""
    points = parse_gpx(empty_gpx)
    assert points == []


def test_parse_csv_valid():
    points = parse_csv(VALID_CSV)
    assert len(points) == 3
    assert points[0]["lat"] == 1.0
    assert points[0]["lon"] == 2.0
    assert points[0]["time"] == "2024-01-01T00:00:00Z"


def test_parse_csv_alternate_columns():
    points = parse_csv(CSV_ALTERNATE_COLUMNS)
    assert len(points) == 2
    assert points[0]["lat"] == 1.0
    assert points[0]["lon"] == 2.0
    assert points[0]["time"] == "2024-01-01T00:00:00Z"


def test_parse_csv_invalid_rows():
    csv = """latitude,longitude
not_a_number,2.0
1.0,not_a_number
"""
    points = parse_csv(csv)
    assert points == []


def test_parse_csv_empty():
    points = parse_csv("")
    assert points == []


def test_trajectory_to_geojson_empty():
    result = trajectory_to_geojson([])
    assert result["type"] == "FeatureCollection"
    assert result["features"] == []


def test_trajectory_to_geojson_with_points():
    points = [
        {"lat": 1.0, "lon": 2.0, "time": "2024-01-01T00:00:00Z"},
        {"lat": 1.1, "lon": 2.1, "time": "2024-01-01T01:00:00Z"},
    ]
    result = trajectory_to_geojson(points)
    assert result["type"] == "FeatureCollection"
    assert len(result["features"]) == 1
    assert result["features"][0]["type"] == "Feature"
    assert result["features"][0]["geometry"]["type"] == "LineString"
    assert result["features"][0]["geometry"]["coordinates"] == [[2.0, 1.0], [2.1, 1.1]]
    assert result["features"][0]["properties"]["point_count"] == 2
    assert result["features"][0]["properties"]["start_time"] == "2024-01-01T00:00:00Z"
    assert result["features"][0]["properties"]["end_time"] == "2024-01-01T01:00:00Z"


def test_trajectory_to_geojson_without_time():
    points = [{"lat": 1.0, "lon": 2.0}]
    result = trajectory_to_geojson(points)
    assert result["features"][0]["properties"]["point_count"] == 1
    assert "start_time" not in result["features"][0]["properties"]


def test_parse_movement_file_gpx():
    result = parse_movement_file(VALID_GPX, "track.gpx")
    assert result["type"] == "FeatureCollection"
    assert len(result["features"]) == 1
    assert result["features"][0]["properties"]["point_count"] == 2


def test_parse_movement_file_csv():
    result = parse_movement_file(VALID_CSV, "track.csv")
    assert result["type"] == "FeatureCollection"
    assert len(result["features"]) == 1
    assert result["features"][0]["properties"]["point_count"] == 3


def test_parse_movement_file_unsupported_format():
    with pytest.raises(ValueError, match="Unsupported file format"):
        parse_movement_file("some content", "track.txt")


def test_parse_movement_file_no_valid_points():
    with pytest.raises(ValueError, match="No valid GPS points found"):
        parse_movement_file("no,valid,points", "track.csv")
