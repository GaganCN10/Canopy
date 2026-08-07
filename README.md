# Canopy — Wildlife Conservation Platform

Monorepo for Canopy, built with React (Vite), Node.js + Express, and Python (FastAPI) for ML inference.

## Structure

- `client/` — React frontend (Vite + Redux Toolkit + Tailwind + Leaflet + Recharts)
- `server/` — Node.js + Express backend (MongoDB + Socket.IO + JWT auth)
- `ml-service/` — Python FastAPI microservice for ML inference (species ID, acoustic threat detection, NDVI, etc.)
- `docs/` — Architecture, API reference, and product requirements

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- MongoDB (local instance or Atlas connection string)
- Redis (local instance, optional — required for BullMQ background jobs)
- Git

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url> canopy
cd canopy
npm run install:all
```

### 2. Configure environment

Copy `.env.example` to `.env` at the repo root and adjust values if needed.

Server environment variables (`.env` in `server/` or at root):

```env
MONGODB_URI=mongodb://localhost:27017/canopy
PORT=5000
NODE_ENV=development
JWT_ACCESS_SECRET=change_me_access_secret
JWT_REFRESH_SECRET=change_me_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
REDIS_URL=redis://localhost:6379
ML_SERVICE_URL=http://localhost:8000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

ML service environment variables (optional, in `ml-service/.env` or at root):

```env
# Optional: override Planetary Computer or Movebank endpoints here
```

### 3. Start services

Open three terminal windows:

```bash
# Terminal 1 — ML service
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — Backend server
cd server
npm install
npm run dev

# Terminal 3 — Frontend client
cd client
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 4. Seed initial data (optional)

```bash
cd server
npm run seed:species
```

## Running Tests

```bash
# Client tests (Vitest)
cd client
npm test

# ML service tests (pytest)
cd ml-service
pytest tests/ -v
```

## Available Scripts

### Client (`client/`)

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm test` | Run Vitest test suite |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

### Server (`server/`)

| Script | Description |
|---|---|
| `npm run dev` | Start nodemon dev server |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

### ML Service (`ml-service/`)

| Script | Description |
|---|---|
| `uvicorn main:app --reload --port 8000` | Start FastAPI dev server |
| `pytest tests/ -v` | Run pytest suite |

#### Training ML Models

The `training/` directory contains dataset preparation and training scripts for the PyTorch-based classifiers.

```bash
cd ml-service

# 1. Prepare camera trap dataset (synthetic or download real images)
python training/prepare_camera_trap_dataset.py

# 2. Train camera trap classifier (EfficientNet-B0, 4 classes)
python training/train_camera_trap.py
# Output: models/camera_trap_classifier_best.pth, models/camera_trap_classes.json

# 3. Prepare threat audio dataset (synthetic or download real audio)
python training/prepare_threat_audio_dataset.py

# 4. Train threat audio classifier (1D CNN or YAMNet, 2 classes)
python training/train_threat_audio.py
# Output: models/threat_audio_classifier_best.pth, models/threat_audio_classes.json
```

Replace the synthetic dataset preparation scripts with real data downloads for production use.

## Project Status

All phases complete (27–35). All ML model weights are trained and present in `ml-service/models/`.

- Phase 27: NDVI habitat monitoring (Sentinel-2 via Planetary Computer)
- Phase 28: Poaching hotspot detection (KDE on tips + sightings)
- Phase 29: Population forecasting (Prophet)
- Phase 30: Anomaly detection (rolling z-score)
- Phase 31: Movement corridors (GPX/CSV parsing to GeoJSON)
- Phase 32: Trade scanner (keyword classification + admin review queue)
- Phase 33: Integration pass (all routes, controllers, services, frontend pages wired)
- Phase 34: Tests — client (40 Vitest) + ML service (92 pytest) passing; server-side Jest/Supertest blocked by Jest 29 ESM mocking limitations (documented)
- Phase 35: Documentation — README, architecture.md, api-reference.md complete
- Phase 36: Model training — species, camera trap, and threat audio classifiers trained and verified

See `docs/Canopy_PRD.md` for the full product requirements document.

## License

Proprietary — Canopy Conservation Platform
