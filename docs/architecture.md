# Canopy — Architecture Documentation

## 1. High-Level Overview

Canopy is a three-tier web platform for wildlife conservation:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Server    │────▶│  ML Service │
│  (React)    │◀────│  (Express)  │◀────│  (FastAPI)  │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │   MongoDB   │
                    └─────────────┘
```

- **Client** (`client/`): React SPA with Redux Toolkit, React Router, Tailwind CSS, Leaflet maps, Recharts analytics.
- **Server** (`server/`): Express REST API with JWT auth, role-based access control, file uploads, Socket.IO notifications, BullMQ background jobs.
- **ML Service** (`ml-service/`): FastAPI microservice wrapping real ML models and data-processing pipelines.
- **Data stores**: MongoDB (primary), Redis (optional, for BullMQ), local filesystem uploads.

## 2. Directory Structure

```
canopy/
├── client/
│   ├── src/
│   │   ├── api/                # Axios instances and API modules
│   │   ├── assets/             # Images, fonts
│   │   ├── components/         # Reusable UI components
│   │   ├── features/           # Feature-sliced modules (auth, sightings, map, admin, ml)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── layouts/            # Main layout, auth layout
│   │   ├── pages/              # Route-level page components
│   │   ├── routes/             # Route definitions
│   │   ├── store/              # Redux slices
│   │   └── utils/              # Client utilities
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/             # DB connection, env loader
│   │   ├── controllers/        # Request/response handlers
│   │   ├── middlewares/         # Auth, RBAC, validation, upload, error handling
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # Express route definitions
│   │   ├── services/           # Business logic
│   │   ├── utils/              # Logger, email, notifications, response helpers
│   │   ├── validators/         # Joi schemas
│   │   ├── scripts/            # DB seed scripts
│   │   └── app.js              # Express app factory
│   ├── tests/                  # Backend tests (planned)
│   └── package.json
├── ml-service/
│   ├── app/
│   │   ├── api/                # FastAPI routers
│   │   ├── models/             # Inference wrappers and data-processing models
│   │   └── main.py             # FastAPI app entrypoint
│   ├── tests/                  # Pytest suite
│   ├── requirements.txt
│   └── main.py
├── docs/
│   ├── Canopy_PRD.md           # Product requirements document
│   ├── architecture.md         # This file
│   └── api-reference.md        # Endpoint documentation
└── package.json                # Root workspace config
```

## 3. Data Flow

### Authentication

1. User submits credentials to `POST /api/auth/login`.
2. Server validates credentials, creates a JWT access token + refresh token, stores a hashed session in MongoDB.
3. Client stores tokens in `localStorage` and attaches the access token in the `Authorization: Bearer` header for subsequent requests.
4. Protected routes use `authMiddleware` to verify the token and load the user from the database.

### ML Inference Flow

1. Client uploads an image/audio/file or submits a JSON payload to a server ML endpoint (e.g., `POST /api/ml/species-predict`).
2. Server validates the request (auth, file type, size) and forwards the payload to the ML service via axios.
3. ML service runs the real model or data-processing pipeline and returns structured JSON.
4. Server translates the ML response into the platform's response envelope and returns it to the client.
5. For certain high-confidence threat detections, the server may create a Tip and send a notification automatically.

### Notification Flow

1. Server emits events via Socket.IO to user-specific rooms.
2. Client listens for `notification` events and updates the notification dropdown in real time.
3. Optional email/SMS notifications are sent via Nodemailer/Twilio when configured.

## 4. Key Design Decisions

- **No hardware dependency**: All features work from standard browser uploads; no IoT devices required.
- **No mocked ML**: Every ML feature uses a real model or real computation on real data. If a model cannot be sourced, the endpoint returns 501.
- **Local development only**: No cloud deployment, CI/CD, or containerization in this phase.
- **Layered architecture**: Routes → controllers → services → models. Business logic lives in services, not controllers.
- **Role-based access**: Six roles — `public`, `citizen`, `ranger`, `researcher`, `rescue`, `admin` — enforced via `roleGuard` middleware.

## 5. External Dependencies

| Dependency | Purpose |
|---|---|
| MongoDB | Primary data store |
| Redis | BullMQ job queue (optional for local dev) |
| Planetary Computer STAC | Sentinel-2 satellite tiles for NDVI |
| Movebank (future) | GPS telemetry datasets for movement corridors |
| Xeno-canto / AudioSet | Audio training data references for bioacoustic and threat audio models |

## 6. Security Considerations

- JWT access tokens expire in 15 minutes; refresh tokens in 7 days.
- Sessions are stored server-side and can be revoked.
- Refresh tokens are blacklisted on logout.
- File uploads are validated for type and size (max 5–20 MB depending on endpoint).
- Express MongoDB sanitize and Helmet are enabled.
- Rate limiting is applied globally.
