import numpy as np
from sklearn.neighbors import KernelDensity


def compute_hotspots(points, bandwidth=0.5, grid_size=50, min_intensity=0.05):
    if not points or len(points) < 2:
        return []

    coords = np.array([[float(p['lat']), float(p['lon'])] for p in points])
    min_lat, max_lat = coords[:, 0].min(), coords[:, 0].max()
    min_lon, max_lon = coords[:, 1].min(), coords[:, 1].max()

    if max_lat - min_lat < 1e-4 or max_lon - min_lon < 1e-4:
        return []

    lat_grid = np.linspace(min_lat, max_lat, grid_size)
    lon_grid = np.linspace(min_lon, max_lon, grid_size)
    grid_lat, grid_lon = np.meshgrid(lat_grid, lon_grid)
    grid_points = np.column_stack([grid_lat.ravel(), grid_lon.ravel()])

    kde = KernelDensity(bandwidth=bandwidth, metric='euclidean')
    kde.fit(coords)
    log_density = kde.score_samples(grid_points)
    density = np.exp(log_density)

    max_density = float(density.max()) if density.max() > 0 else 1.0
    if max_density == 0:
        return []

    features = []
    for lat, lon, d in zip(grid_lat.ravel(), grid_lon.ravel(), density):
        intensity = float(d / max_density)
        if intensity >= min_intensity:
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(lon), float(lat)],
                },
                "properties": {
                    "intensity": intensity,
                    "weight": float(d),
                },
            })

    return {
        "type": "FeatureCollection",
        "features": features,
    }


def summarize_hotspots(feature_collection, top_n=10):
    if not feature_collection or not feature_collection.get("features"):
        return []
    sorted_features = sorted(
        feature_collection["features"],
        key=lambda f: f["properties"]["intensity"],
        reverse=True,
    )
    return [
        {
            "coordinates": f["geometry"]["coordinates"],
            "intensity": f["properties"]["intensity"],
        }
        for f in sorted_features[:top_n]
    ]
