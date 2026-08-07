# Canopy — API Reference

Base URL for backend: `http://localhost:5000/api`
Base URL for ML service: `http://localhost:8000`

All backend endpoints require authentication unless noted. Include the access token in the `Authorization: Bearer <token>` header.

---

## Authentication

### Register

```http
POST /api/auth/register
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "securepass",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

### Login

```http
POST /api/auth/login
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "securepass"
}
```

Returns `accessToken` and `refreshToken`.

### Refresh Token

```http
POST /api/auth/refresh
```

Request body:
```json
{
  "refreshToken": "<refresh_token>"
}
```

### Logout

```http
POST /api/auth/logout
```

Headers: `Authorization: Bearer <access_token>`

---

## Users

### Get Current User

```http
GET /api/users/me
```

### Update Profile

```http
PATCH /api/users/me
```

Headers: `Authorization: Bearer <token>`

---

## Species

### List Species

```http
GET /api/species?page=1&limit=20&search=elephant
```

### Get Species by ID

```http
GET /api/species/:id
```

---

## Sightings

### List Sightings

```http
GET /api/sightings?page=1&limit=20&species=<id>&status=verified&startDate=2025-01-01&endDate=2025-12-31&bbox=<min_lon>,<min_lat>,<max_lon>,<max_lat>
```

### Create Sighting

```http
POST /api/sightings
Content-Type: multipart/form-data

species: <species_id>
notes: "Sighted near river"
location: { "type": "Point", "coordinates": [77.0, 10.0] }
images: <file upload>
```

### Vote on Sighting

```http
POST /api/sightings/:id/vote
Body: { "vote": "upvote" }
```

---

## Tips (Anti-Poaching)

### Submit Tip

```http
POST /api/tips
Body: {
  "title": "Suspicious activity",
  "description": "Heard chainsaw sounds...",
  "location": { "type": "Point", "coordinates": [77.0, 10.0] },
  "isAnonymous": true
}
```

### List Tips (Ranger/Admin)

```http
GET /api/tips?status=new&page=1&limit=20
```

### Update Tip Status

```http
PATCH /api/tips/:id/status
Body: { "status": "under_review", "reviewNotes": "Dispatching ranger" }
```

---

## Human-Wildlife Conflict (HWC)

### Report HWC

```http
POST /api/hwc
Body: {
  "type": "crop_raiding",
  "description": "Elephant entered farm...",
  "location": { "type": "Point", "coordinates": [77.0, 10.0] }
}
```

### Get Geofence Zones

```http
GET /api/hwc/geofences
```

---

## Rescue & Rehabilitation

### Create Rescue Case

```http
POST /api/rescue
Body: {
  "species": "<species_id>",
  "description": "Injured elephant found...",
  "location": { "type": "Point", "coordinates": [77.0, 10.0] }
}
```

### List Rescue Cases

```http
GET /api/rescue
```

---

## Missions

### List Missions

```http
GET /api/missions
```

### Create Mission

```http
POST /api/missions
Body: {
  "title": "Cubbon Park cleanup",
  "description": "Weekly cleanup drive...",
  "topic": "cleanup",
  "locationType": "on-site"
}
```

### Join Mission

```http
POST /api/missions/:id/join
```

---

## Articles

### List Articles

```http
GET /api/articles
```

### Create Article

```http
POST /api/articles
Body: {
  "title": "Understanding Elephant Corridors",
  "slug": "elephant-corridors",
  "content": "...",
  "published": true
}
```

---

## Analytics

### Dashboard Summary

```http
GET /api/analytics/summary
```

### Sightings Over Time

```http
GET /api/analytics/sightings-over-time?days=30
```

### Species Distribution

```http
GET /api/analytics/species-distribution
```

### Verification Stats

```http
GET /api/analytics/verification-stats
```

---

## Notifications

### List Notifications

```http
GET /api/notifications?limit=20&page=1
```

### Mark All as Read

```http
POST /api/notifications/read-all
```

---

## ML Endpoints (via Server Proxy)

All ML endpoints are proxied through the backend at `/api/ml/*` and require authentication. Some endpoints require specific roles (ranger, admin, researcher).

### Species Image Identification

```http
POST /api/ml/species-predict
Content-Type: multipart/form-data
Body: file=<image>
```

### Camera Trap Triage

```http
POST /api/ml/camera-trap
Content-Type: multipart/form-data
Body: file=<image>
```

### Bioacoustic Identification

```http
POST /api/ml/bioacoustic
Content-Type: multipart/form-data
Body: file=<audio>
```

### Threat Audio Detection

```http
POST /api/ml/threat-audio
Content-Type: multipart/form-data
Body: file=<audio>
```

### Habitat NDVI

```http
POST /api/ml/habitat-ndvi
Body: {
  "bbox": [min_lon, min_lat, max_lon, max_lat],
  "start_date": "2025-01-01",
  "end_date": "2025-01-31",
  "max_cloud_cover": 20
}
```

### Poaching Hotspots (Ranger/Admin/Researcher)

```http
POST /api/ml/poaching-hotspots
Body: {
  "points": [{ "lat": 10.0, "lon": 77.0 }, ...],
  "bandwidth": 0.5,
  "grid_size": 50
}
```

### Population Forecast

```http
POST /api/ml/population-forecast
Body: {
  "speciesId": "<species_id>",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "periods": 30
}
```

### Anomaly Detection (Admin/Researcher)

```http
POST /api/ml/anomalies
Body: {
  "speciesId": "<species_id>",
  "bbox": [min_lon, min_lat, max_lon, max_lat],
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "window": 7,
  "threshold": 2.0
}
```

### Movement Corridors

```http
POST /api/ml/movement-corridors
Content-Type: multipart/form-data
Body: file=<gpx_or_csv>
```

### Trade Text Scan

```http
POST /api/trade-scan/scan
Body: {
  "text": "ivory tusk for sale",
  "source": "manual"
}
```

### Trade Flags (Admin)

```http
GET /api/trade-scan/flags?status=pending&page=1&limit=20
PATCH /api/trade-scan/flags/:id
Body: { "status": "approved", "reviewNotes": "Confirmed" }
```

---

## ML Service Direct Endpoints

The ML service also exposes its endpoints directly at `http://localhost:8000` (without the `/api/ml` prefix) for internal use:

- `POST /species-image` — Species image classification
- `POST /camera-trap` — Camera trap triage
- `POST /bioacoustic` — Bioacoustic species ID
- `POST /threat-audio` — Threat audio detection
- `POST /habitat-ndvi` — NDVI computation
- `POST /poaching-hotspots` — KDE hotspot computation
- `POST /population-forecast` — Prophet forecasting
- `POST /anomalies` — Rolling z-score anomaly detection
- `POST /movement-corridors` — GPX/CSV trajectory parsing
- `POST /trade-scan` — Wildlife trade text scanning

Interactive docs available at `http://localhost:8000/docs` when the ML service is running.

---

## Error Responses

All endpoints return errors in a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE" // optional
}
```

Common HTTP status codes:
- `400` — Bad request / validation error
- `401` — Missing or invalid access token
- `403` — Insufficient permissions
- `404` — Resource not found
- `429` — Rate limit exceeded
- `500` — Internal server error
- `501` — Feature not yet implemented (ML endpoints pending data/models)
