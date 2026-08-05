import pytest
import numpy as np
from app.models.anomaly_model import rolling_zscore, detect_anomalies


def test_rolling_zscore_short_series():
    series = [1.0, 2.0, 3.0]
    result = rolling_zscore(series, window=7)
    assert len(result) == 3
    for i, entry in enumerate(result):
        assert entry["index"] == i
        assert entry["value"] == series[i]
        assert entry["z_score"] is None
        assert entry["is_anomaly"] is False


def test_rolling_zscore_no_anomalies():
    series = [10.0, 11.0, 10.0, 11.0, 10.0, 11.0, 10.0]
    result = rolling_zscore(series, window=3, threshold=2.0)
    assert len(result) == len(series)
    assert all(not entry["is_anomaly"] for entry in result)


def test_rolling_zscore_detects_spike():
    series = [10.0, 11.0, 12.0, 11.0, 10.0, 9.0, 50.0]
    result = rolling_zscore(series, window=5, threshold=2.0)
    assert result[-1]["is_anomaly"] is True
    assert result[-1]["direction"] == "spike"
    assert result[-1]["z_score"] > 2.0


def test_rolling_zscore_detects_drop():
    series = [100.0, 90.0, 80.0, 70.0, 60.0, 50.0, 1.0]
    result = rolling_zscore(series, window=5, threshold=2.0)
    assert result[-1]["is_anomaly"] is True
    assert result[-1]["direction"] == "drop"
    assert result[-1]["z_score"] < -2.0


def test_rolling_zscore_zero_std():
    series = [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0]
    result = rolling_zscore(series, window=5, threshold=2.0)
    assert len(result) == 7
    for i, entry in enumerate(result):
        if i < 4:
            assert entry["z_score"] is None
            assert entry["is_anomaly"] is False
        else:
            assert entry["z_score"] == 0.0
            assert entry["is_anomaly"] is False


def test_detect_anomalies_empty_time_series():
    result = detect_anomalies([])
    assert result["anomalies"] == []
    assert result["total_points"] == 0


def test_detect_anomalies_short_time_series():
    result = detect_anomalies([{"date": "2024-01-01", "value": 1.0}])
    assert result["anomalies"] == []
    assert result["total_points"] == 1


def test_detect_anomalies_success():
    time_series = [
        {"date": "2024-01-%02d" % i, "value": 10.0 if i % 2 == 0 else 12.0}
        for i in range(1, 11)
    ]
    time_series.append({"date": "2024-01-11", "value": 100.0})
    result = detect_anomalies(time_series, window=5, threshold=2.0)
    assert len(result["anomalies"]) > 0
    assert result["total_points"] == 11
    assert result["window"] == 5
    assert result["threshold"] == 2.0
    last_anomaly = result["anomalies"][-1]
    assert last_anomaly["direction"] == "spike"


def test_detect_anomalies_min_anomalies_cap():
    time_series = [
        {"date": "2024-01-%02d" % i, "value": 100.0 if i == 10 else 10.0}
        for i in range(1, 12)
    ]
    result = detect_anomalies(time_series, window=3, threshold=2.0, min_anomalies=1)
    assert len(result["anomalies"]) <= 21


def test_rolling_zscore_window_boundary():
    series = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0]
    result = rolling_zscore(series, window=5, threshold=2.0)
    assert result[0]["is_anomaly"] is False
    assert result[3]["is_anomaly"] is False
    assert result[4]["z_score"] is not None
