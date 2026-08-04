# ML Service Contract

## Base URL

```
http://localhost:8000
```

## Health Check

```
GET /health
```

Response:

```json
{
  "status": "ok",
  "service": "canopy-ml-service"
}
```

## Standard Request/Response Shape

Every ML endpoint accepts a JSON body (or multipart/form-data for file uploads) and returns:

```json
{
  "success": true,
  "data": { ... },
  "model_version": "string",
  "processing_time_ms": 123
}
```

On error:

```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": null
}
```

## Endpoints

| Method | Route | Input | Output |
|--------|-------|-------|--------|
| POST | `/predict/species-image` | multipart: `file` (image) | `{ species, confidence, alternatives[] }` |
| POST | `/predict/camera-trap` | multipart: `file` (image) | `{ label, confidence }` (animal/person/vehicle/blank) |
| POST | `/predict/bioacoustic` | multipart: `file` (audio) | `{ species, confidence, segments[] }` |
| POST | `/predict/threat-audio` | multipart: `file` (audio) | `{ threat, confidence, category }` |
| POST | `/predict/habitat-ndvi` | JSON: `{ bbox, start_date, end_date }` | `{ ndvi_summary, change }` |
| POST | `/predict/poaching-hotspots` | JSON: `{ bbox, region }` | `{ geojson: FeatureCollection }` |
| POST | `/predict/population-forecast` | JSON: `{ species_id, region, years }` | `{ forecast[], confidence_intervals[] }` |
| POST | `/predict/anomalies` | JSON: `{ species_id, region, window_days }` | `{ anomalies[], type }` |
| POST | `/predict/trade-scan` | JSON: `{ text, sources[] }` | `{ flags[], confidence }` |
| POST | `/predict/movement-corridors` | JSON: `{ species_id, dataset_source }` | `{ geojson: FeatureCollection }` |

## Server-Side Integration

The Node.js server calls these endpoints via `server/src/services/mlService.js`. Controllers should call the service layer, never call the ml-service directly from a route handler.

## Client-Side Integration

The client never calls the ml-service directly. All ML requests flow through:

```
Client → Server (/api/ml/*) → ML Service (/predict/*)
```

## Timeout Policy

All ML calls from the server use a 120-second timeout. Long-running inference (e.g., batch camera-trap) should return `202 Accepted` with a job ID if it exceeds this window.
