import pandas as pd
from datetime import datetime


def aggregate_daily_counts(sightings):
    if not sightings:
        return pd.DataFrame(columns=['ds', 'y'])

    records = []
    for s in sightings:
        ts = s.get('timestamp') or s.get('createdAt')
        if not ts:
            continue
        if isinstance(ts, str):
            ts = pd.to_datetime(ts)
        records.append({'ds': ts.normalize(), 'y': 1})

    if not records:
        return pd.DataFrame(columns=['ds', 'y'])

    df = pd.DataFrame(records)
    daily = df.groupby('ds').sum().reset_index()
    daily = daily.sort_values('ds')
    daily.columns = ['ds', 'y']
    return daily


def forecast_population(daily_counts, periods=30, seasonality_mode='additive'):
    try:
        from prophet import Prophet
    except ImportError:
        raise RuntimeError('prophet is required for population forecasting. Install it with: pip install prophet')

    if len(daily_counts) < 2:
        raise ValueError('At least 2 data points are required for forecasting')

    model = Prophet(
        seasonality_mode=seasonality_mode,
        daily_seasonality=False,
        weekly_seasonality=True,
        yearly_seasonality=False,
    )
    model.fit(daily_counts)
    future = model.make_future_dataframe(periods=periods)
    forecast = model.predict(future)

    result = []
    for _, row in forecast.iterrows():
        result.append({
            'date': row['ds'].isoformat(),
            'yhat': float(row['yhat']),
            'yhat_lower': float(row['yhat_lower']),
            'yhat_upper': float(row['yhat_upper']),
        })

    return {
        'history': daily_counts.tail(90).to_dict('records'),
        'forecast': result[-periods:],
    }
