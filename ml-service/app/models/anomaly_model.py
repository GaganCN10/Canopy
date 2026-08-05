import numpy as np


def rolling_zscore(series, window=7, threshold=2.0):
    if len(series) < window:
        return [{'index': i, 'value': v, 'z_score': None, 'is_anomaly': False} for i, v in enumerate(series)]

    result = []
    for i in range(len(series)):
        if i < window - 1:
            result.append({'index': i, 'value': series[i], 'z_score': None, 'is_anomaly': False})
            continue

        window_data = series[i - window + 1: i + 1]
        mean = np.mean(window_data[:-1])
        std = np.std(window_data[:-1], ddof=0)

        if std < 1e-6:
            z = 0.0
        else:
            z = (series[i] - mean) / std

        is_anomaly = abs(z) >= threshold
        result.append({
            'index': i,
            'value': series[i],
            'z_score': float(z),
            'is_anomaly': bool(is_anomaly),
            'direction': 'spike' if z > 0 else 'drop',
        })

    return result


def detect_anomalies(time_series, window=7, threshold=2.0, min_anomalies=1):
    if not time_series or len(time_series) < 2:
        return {'anomalies': [], 'total_points': len(time_series)}

    values = [float(point.get('value', 0)) for point in time_series]
    results = rolling_zscore(values, window=window, threshold=threshold)

    anomalies = []
    for i, res in enumerate(results):
        if res['is_anomaly']:
            anomalies.append({
                'date': time_series[i].get('date'),
                'value': res['value'],
                'z_score': res['z_score'],
                'direction': res['direction'],
            })

    return {
        'anomalies': anomalies[:min_anomalies + 20],
        'total_points': len(time_series),
        'window': window,
        'threshold': threshold,
    }
