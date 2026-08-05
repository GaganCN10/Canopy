import csv
import io
import json
from xml.etree import ElementTree as ET


def parse_gpx(content: str):
    try:
        root = ET.fromstring(content)
    except ET.ParseError as e:
        raise ValueError(f'Invalid GPX file: {e}')

    ns = {'gpx': 'http://www.topografix.com/GPX/1/1'}
    points = []

    for trk in root.findall('.//gpx:trk', ns):
        for trkseg in trk.findall('.//gpx:trkseg', ns):
            for trkpt in trkseg.findall('gpx:trkpt', ns):
                lat = trkpt.get('lat')
                lon = trkpt.get('lon')
                time_el = trkpt.find('gpx:time', ns)
                time = time_el.text if time_el is not None and time_el.text else None
                if lat and lon:
                    points.append({
                        'lat': float(lat),
                        'lon': float(lon),
                        'time': time,
                    })

    if not points:
        for trkpt in root.findall('.//gpx:wpt', ns):
            lat = trkpt.get('lat')
            lon = trkpt.get('lon')
            time_el = trkpt.find('gpx:time', ns)
            time = time_el.text if time_el is not None and time_el.text else None
            if lat and lon:
                points.append({
                    'lat': float(lat),
                    'lon': float(lon),
                    'time': time,
                })

    return points


def parse_csv(content: str):
    points = []
    reader = csv.DictReader(io.StringIO(content))
    for row in reader:
        lat = row.get('latitude') or row.get('lat') or row.get('Latitude') or row.get('Lat')
        lon = row.get('longitude') or row.get('lon') or row.get('Longitude') or row.get('Lng')
        time = row.get('timestamp') or row.get('time') or row.get('date') or row.get('Timestamp')
        if lat and lon:
            try:
                points.append({
                    'lat': float(lat),
                    'lon': float(lon),
                    'time': time,
                })
            except (ValueError, TypeError):
                continue
    return points


def trajectory_to_geojson(points):
    if not points:
        return {'type': 'FeatureCollection', 'features': []}

    coordinates = [[p['lon'], p['lat']] for p in points]
    properties = {}
    if points and points[0].get('time'):
        properties['start_time'] = points[0]['time']
        properties['end_time'] = points[-1]['time']
    properties['point_count'] = len(points)

    return {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'LineString',
                    'coordinates': coordinates,
                },
                'properties': properties,
            }
        ],
    }


def parse_movement_file(content: str, filename: str):
    name = filename.lower()
    if name.endswith('.gpx'):
        points = parse_gpx(content)
    elif name.endswith('.csv'):
        points = parse_csv(content)
    else:
        raise ValueError('Unsupported file format. Use GPX or CSV.')

    if not points:
        raise ValueError('No valid GPS points found in file')

    return trajectory_to_geojson(points)
