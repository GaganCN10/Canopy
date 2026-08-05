import sys
import pytest
import pandas as pd
from datetime import datetime
from unittest.mock import patch, MagicMock
from app.models.forecast_model import aggregate_daily_counts, forecast_population

sys.modules.setdefault("prophet", MagicMock())


def test_aggregate_daily_counts_empty():
    df = aggregate_daily_counts([])
    assert list(df.columns) == ["ds", "y"]
    assert len(df) == 0


def test_aggregate_daily_counts_with_timestamp():
    sightings = [
        {"timestamp": "2024-01-01T10:00:00"},
        {"timestamp": "2024-01-01T15:00:00"},
        {"timestamp": "2024-01-02T10:00:00"},
    ]
    df = aggregate_daily_counts(sightings)
    assert len(df) == 2
    assert list(df["y"]) == [2, 1]
    assert df["ds"].iloc[0].date() == pd.to_datetime("2024-01-01").date()


def test_aggregate_daily_counts_with_created_at():
    sightings = [
        {"createdAt": "2024-01-01T10:00:00"},
        {"createdAt": "2024-01-01T15:00:00"},
    ]
    df = aggregate_daily_counts(sightings)
    assert len(df) == 1
    assert df["y"].iloc[0] == 2


def test_aggregate_daily_counts_no_timestamps():
    sightings = [{"value": 1}, {"value": 2}]
    df = aggregate_daily_counts(sightings)
    assert len(df) == 0


def test_aggregate_daily_counts_mixed_timestamps():
    sightings = [
        {"timestamp": "2024-01-01T10:00:00"},
        {"createdAt": "2024-01-01T15:00:00"},
        {"timestamp": "2024-01-02T10:00:00"},
    ]
    df = aggregate_daily_counts(sightings)
    assert len(df) == 2
    assert df["y"].iloc[0] == 2
    assert df["y"].iloc[1] == 1


def test_forecast_population_insufficient_data():
    with pytest.raises(ValueError, match="At least 2 data points"):
        forecast_population(pd.DataFrame({"ds": pd.DatetimeIndex([]), "y": []}))


def test_forecast_population_success():
    dates = pd.date_range("2024-01-01", periods=10, freq="D")
    daily_counts = pd.DataFrame({"ds": dates, "y": range(10)})

    future_dates = pd.date_range("2024-01-11", periods=5, freq="D")
    mock_forecast_df = pd.DataFrame(
        {
            "ds": list(dates) + list(future_dates),
            "yhat": list(range(10)) + list(range(10, 15)),
            "yhat_lower": list(range(10)) + list(range(10, 15)),
            "yhat_upper": list(range(10)) + list(range(10, 15)),
        }
    )

    with patch("prophet.Prophet") as MockProphet:
        mock_model = MockProphet.return_value
        mock_model.predict.return_value = mock_forecast_df
        result = forecast_population(daily_counts, periods=5)

    assert "history" in result
    assert "forecast" in result
    assert len(result["forecast"]) == 5
    assert len(result["history"]) <= 10


def test_forecast_population_custom_periods():
    dates = pd.date_range("2024-01-01", periods=10, freq="D")
    daily_counts = pd.DataFrame({"ds": dates, "y": range(10)})

    future_dates = pd.date_range("2024-01-11", periods=7, freq="D")
    mock_forecast_df = pd.DataFrame(
        {
            "ds": list(dates) + list(future_dates),
            "yhat": list(range(10)) + list(range(10, 17)),
            "yhat_lower": list(range(10)) + list(range(10, 17)),
            "yhat_upper": list(range(10)) + list(range(10, 17)),
        }
    )

    with patch("prophet.Prophet") as MockProphet:
        mock_model = MockProphet.return_value
        mock_model.predict.return_value = mock_forecast_df
        result = forecast_population(daily_counts, periods=7)

    assert len(result["forecast"]) == 7
    MockProphet.assert_called_once_with(
        seasonality_mode="additive",
        daily_seasonality=False,
        weekly_seasonality=True,
        yearly_seasonality=False,
    )
    mock_model.fit.assert_called_once_with(daily_counts)


def test_forecast_population_prophet_import_error():
    dates = pd.date_range("2024-01-01", periods=10, freq="D")
    daily_counts = pd.DataFrame({"ds": dates, "y": range(10)})

    prophet_mock = sys.modules.pop("prophet", None)
    try:
        with pytest.raises(RuntimeError, match="prophet is required"):
            forecast_population(daily_counts)
    finally:
        if prophet_mock is not None:
            sys.modules["prophet"] = prophet_mock
