# Product Requirements Document
## Wildlife Conservation Platform (Codename: **ConserveOS**)

| | |
|---|---|
| **Document Type** | Production-Grade PRD |
| **Version** | 1.0 |
| **Status** | Locked — Developer must follow this document exactly. No feature additions or scope changes without an explicit written update from the Product Owner. |
| **Platform** | Web only (no mobile app in this phase) |
| **Stack** | MERN (MongoDB, Express, React, Node.js) + Python (FastAPI) for ML |

---

## 1. Purpose & Vision

Build a single, unified web platform that consolidates the core software-solvable problems of wildlife conservation: species monitoring, citizen science, anti-poaching reporting, human-wildlife conflict (HWC) management, rescue/rehab tracking, habitat monitoring, and predictive analytics — powered by real, working AI/ML models trained or integrated using genuinely available free/open resources.

**Non-negotiable ground rules for the developer:**
1. **No hardware/IoT.** Nothing in this PRD depends on physical sensors, drones, thermal cameras, ESP32/LoRaWAN devices, or any external hardware. Every feature must work from a browser and standard file/image/audio uploads.
2. **No mocked ML.** Every ML feature listed as "In Scope" must be a real, trained/integrated model producing genuine inference results — not hardcoded/simulated responses. If a feature cannot be built with real, freely accessible data/models, it is explicitly marked **Out of Scope** below and must not be built as a fake stand-in.
3. **No mobile development.** React (web) only. React Native, PWA installability, etc. are out of scope for this phase.
4. **No deployment work.** Local development environment only (localhost, Docker optional for local parity). CI/CD, cloud hosting, and production deployment are out of scope until a future PRD revision.
5. Code must be **modular, layered, and maintainable** — no monolithic files, no business logic in route handlers, no inline DB queries in controllers.

---

## 2. Scope Summary

### 2.1 In Scope (Software Modules)
- Authentication & Role-Based Access Control (RBAC)
- Species Catalog (reference database)
- Citizen Sighting Reports (geo-tagged, photo-backed)
- Community Verification of Sightings
- Interactive Map (Leaflet) with layered data
- Anti-Poaching Anonymous Tip/SOS Reporting
- Human-Wildlife Conflict (HWC) Logging + Geofenced Alerting
- Rescue & Rehabilitation Case Management
- Notifications (in-app, email, SMS/WhatsApp via Twilio)
- Admin Panel (moderation, user management, content management)
- Analytics Dashboards
- Movement/Corridor Visualization (via imported/open GPS telemetry data)

### 2.2 In Scope (AI/ML Modules — Feasibility-Verified, see Section 3)
- Species Image Identification
- Camera-Trap Batch Image Triage (empty-frame filtering + species tagging)
- Bioacoustic Species Identification (bird/amphibian calls)
- Acoustic Threat Detection (gunshot/chainsaw clip classification)
- Satellite-Based Habitat/Deforestation & NDVI Monitoring
- Predictive Poaching Hotspot Mapping (based on real reported incident data)
- Population Trend Forecasting (based on real accumulated sighting data)
- Anomaly Detection on Sighting/Population Data
- Illegal Wildlife Trade Text Scanner (NLP, admin-reviewed queue — see legal caveat in 3.9)

### 2.3 Explicitly Out of Scope
| Feature | Reason |
|---|---|
| Individual biometric re-identification (tiger stripes, zebra coats, whale flukes) | No free, production-grade open dataset/model exists for arbitrary species. Would require months of curated dataset creation per species. Not feasible as a real, non-mocked feature within this project. |
| Footprint/track image classification | No sufficient free labeled dataset of animal tracks exists publicly. Cannot be built as a genuine production model. |
| Thermal/night-vision detection | Requires thermal camera hardware input; explicitly excluded per hardware-free constraint. |
| Live continuous audio stream monitoring (24/7 field mics) | Requires persistent hardware audio capture pipeline (edge device). Re-scoped as **clip-based upload/browser-recording detection** instead (see Section 3.4). |
| Drone live feed analytics | Hardware-dependent. Excluded. |
| Mobile native app / offline-first PWA sync | Explicitly excluded — web only, this phase. |
| Cloud deployment, CI/CD, autoscaling | Excluded — local development only, this phase. |

---

## 3. AI/ML Feasibility Assessment

Every ML feature was evaluated against: (a) availability of a genuinely free, legally usable dataset or pretrained model, (b) whether it can be integrated as real inference (not simulated), and (c) reasonable buildability by a solo/small team.

### 3.1 Species Image Identification — ✅ Feasible
- **Approach:** Transfer learning on top of a pretrained CNN (MobileNetV2/EfficientNet-B0 via PyTorch/TensorFlow) fine-tuned on a curated subset of free datasets.
- **Data sources:** iNaturalist open dataset/competition data (free, CC-licensed), GBIF occurrence + image data (free, open API).
- **Scope control:** Project will target a **defined regional species list** (developer + product owner to finalize list in Phase 18), not "all species on Earth" — this keeps the dataset and model realistically trainable.
- **Verdict:** Production-buildable as a real classifier.

### 3.2 Camera-Trap Batch Triage — ✅ Feasible
- **Approach:** Use **MegaDetector** (Microsoft/PyTorch, free, open-source, purpose-built and widely used in real conservation projects) to detect "animal / person / vehicle / blank" in camera-trap images, then route "animal" detections through the Species Identification model (3.1) for species tagging.
- **Verdict:** This is a genuinely production-grade, real-world-proven approach. Highly feasible.

### 3.3 Bioacoustic Species ID — ✅ Feasible
- **Approach:** Use **BirdNET**-style architecture/embeddings (open-source, free, trained on Xeno-canto data) for bird call identification; Xeno-canto's public API provides free labeled audio for extension/fine-tuning.
- **Verdict:** Feasible and genuinely production-grade for birds/select taxa. Scope limited to taxa with real open audio data (primarily birds; amphibians only if a suitable free dataset is confirmed during Phase 20).

### 3.4 Acoustic Threat Detection — ✅ Feasible (re-scoped)
- **Approach:** Fine-tune a lightweight audio classifier (YAMNet embeddings + shallow classifier) using **AudioSet** (Google, free, labeled YouTube audio event dataset which includes gunshot and chainsaw/tool categories) and/or **ESC-50**/**UrbanSound8K** (free).
- **Scope correction:** Re-scoped from "always-on live field monitoring" (hardware-dependent) to **on-demand clip analysis**: user records via browser mic or uploads an audio clip → backend runs classifier → returns threat probability + flags for review.
- **Verdict:** Feasible as a real, non-mocked feature within the corrected scope.

### 3.5 Satellite Habitat/Deforestation & NDVI — ✅ Feasible
- **Approach:** Integrate **Sentinel Hub** (Copernicus/ESA Sentinel-2 imagery, free tier available) or **Google Earth Engine** (free for research/nonprofit use) to compute NDVI over a selected area/time range and visualize forest cover change.
- **Verdict:** Real satellite data, real computation — fully feasible, no mocking required.

### 3.6 Predictive Poaching Hotspot Mapping — ✅ Feasible
- **Approach:** Kernel Density Estimation (KDE) / spatial clustering computed on **real data the platform itself collects** (anti-poaching tip reports + verified sighting data with location/time). This is not a pretrained model — it is genuine statistical computation on live application data.
- **Caveat:** Output quality is proportional to data volume collected over time — this is disclosed as expected behavior, not a flaw.
- **Verdict:** Feasible, fully real, no external dataset dependency.

### 3.7 Population Trend Forecasting — ✅ Feasible
- **Approach:** Time-series forecasting (Facebook Prophet or statsmodels ARIMA) run on the platform's own accumulated sighting/count data per species/region.
- **Verdict:** Feasible, genuinely computed, not mocked. Same data-volume caveat as 3.6 applies.

### 3.8 Anomaly Detection on Sighting Data — ✅ Feasible
- **Approach:** Statistical anomaly detection (Isolation Forest / z-score on rolling counts) on real sighting frequency data to flag sudden drops (possible local extinction/mass mortality signal) or spikes.
- **Verdict:** Feasible, real computation.

### 3.9 Illegal Wildlife Trade Text Scanner — ⚠️ Feasible with Legal Caveat
- **Approach:** NLP keyword + classifier-based scanning (spaCy/transformers) of **publicly accessible, developer-configured web pages** (not private/authenticated social media scraping) for wildlife trafficking-indicative listings.
- **Legal caveat (mandatory disclosure):** Scraping third-party platforms may violate their Terms of Service. This feature must be built as an **admin-configured, human-review-queue system** — it flags potential matches for manual review, it does **not** autonomously scrape social media platforms or take automated action. Developer must restrict initial scope to a small set of explicitly public, scraping-permitted sources (e.g., open marketplace listings, public forums with permissive robots.txt), confirmed individually before implementation in Phase 28.
- **Verdict:** Feasible as a real, working feature under the above constraints. Not to be built as unrestricted social media scraping.

### 3.10 Movement/Corridor Visualization — ✅ Feasible
- **Approach:** Accept user-imported GPS telemetry (CSV/GPX upload) and/or pull real, free, open collar-tracking datasets from **Movebank** (public API, free) to visualize migration/movement on the map.
- **Verdict:** Feasible — real data, real visualization, no hardware collar required from the platform itself.

---

## 4. System Architecture

### 4.1 Repository Structure (Monorepo)

```
conserveos/
├── client/                 # React web app
│   ├── src/
│   │   ├── api/             # Axios instances, API call modules (per resource)
│   │   ├── assets/
│   │   ├── components/      # Reusable, dumb UI components
│   │   ├── features/        # Feature-sliced modules (auth, sightings, map, admin, etc.)
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── store/            # Redux Toolkit slices (or Context, per Section 5 decision)
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
│
├── server/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/           # DB connection, env loader, constants
│   │   ├── controllers/      # Request/response handling only
│   │   ├── services/         # Business logic (calls models, calls ml-service)
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/
│   │   ├── middlewares/      # auth, error handler, validation, RBAC guard
│   │   ├── validators/        # Joi/Zod schemas
│   │   ├── utils/
│   │   ├── jobs/              # BullMQ background jobs
│   │   └── app.js
│   ├── tests/
│   └── package.json
│
├── ml-service/              # Python FastAPI microservice
│   ├── app/
│   │   ├── api/               # FastAPI routers per ML feature
│   │   ├── models/            # Model loading/inference wrappers
│   │   ├── services/          # Preprocessing, postprocessing logic
│   │   ├── schemas/           # Pydantic request/response models
│   │   ├── core/              # Config, settings
│   │   ├── ml_models/         # Saved model weights (gitignored, downloaded via script)
│   │   └── main.py
│   ├── training/               # Standalone training scripts/notebooks (not runtime code)
│   ├── requirements.txt
│   └── tests/
│
├── docs/                     # Architecture docs, API docs, ADRs
├── .env.example
├── docker-compose.yml         # Optional, for local parity only — no deployment config
└── README.md
```

### 4.2 Service Communication
- **Client ↔ Server:** REST (JSON) over HTTPS in dev via localhost; WebSockets (Socket.IO) for real-time notifications/alerts only.
- **Server ↔ ML-Service:** REST (JSON) — server acts as the sole gateway; the client never calls ml-service directly.
- **Server ↔ MongoDB:** Mongoose ODM.

---

## 5. Tech Stack (Strict — Do Not Substitute Without Approval)

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Redux Toolkit, React Router, Tailwind CSS, Leaflet.js + React-Leaflet, Axios, Recharts |
| Backend | Node.js, Express.js, Mongoose, JWT (jsonwebtoken), bcrypt, Joi (validation), Multer (uploads), Socket.IO |
| Database | MongoDB (with 2dsphere geospatial indexes), GridFS for media storage (local dev) |
| Background Jobs | Redis + BullMQ |
| ML Service | Python 3.11+, FastAPI, Uvicorn, PyTorch, torchvision, OpenCV, Librosa, scikit-learn, Prophet, spaCy |
| Notifications | Nodemailer (email), Twilio (SMS/WhatsApp sandbox — free trial tier) |
| Testing | Jest + Supertest (server), React Testing Library (client), Pytest (ml-service) |
| Dev Tooling | ESLint, Prettier, Husky (pre-commit), dotenv |

---

## 6. User Roles & Permissions

| Role | Permissions |
|---|---|
| **Public/Visitor** | View public dashboards, species catalog, submit sighting reports (as guest or registered) |
| **Citizen/Volunteer** | All Public + submit verified sightings, vote on community verification, submit HWC logs |
| **Ranger/Field Staff** | All Citizen + submit anti-poaching tips with elevated priority, manage patrol-relevant data |
| **Researcher/NGO** | All Citizen + access raw dataset export, view analytics dashboards, corridor/movement data |
| **Rescue Center Staff** | Manage rescue/rehab case records for their center |
| **Admin** | Full access: user management, content moderation, species catalog management, system configuration |

---

## 7. Functional Requirements by Module

*(Detailed field-level schemas and API contracts to be finalized in each module's dedicated phase — this section defines the required capabilities only.)*

1. **Auth Module** — Register, login, JWT access/refresh tokens, password reset, role assignment (admin-controlled), protected route middleware.
2. **Species Catalog** — CRUD (admin), public read, fields: name, scientific name, conservation status, description, images, region.
3. **Sighting Reports** — Create (geo-tagged, photo, species, notes, timestamp), list/filter by species/region/date, community verification voting, status (pending/verified/rejected).
4. **Map Module** — Layered Leaflet map: sightings, poaching hotspots (role-gated), HWC incidents, habitat/NDVI overlay, corridors. Sensitive/endangered species locations must be generalized (rounded coordinates) for non-privileged roles.
5. **Anti-Poaching Tips** — Anonymous submission (no auth required), optional evidence upload, admin/ranger review queue, status tracking.
6. **HWC Module** — Log conflict incident (location, type, loss description, photo), geofence zone management (admin-defined boundaries), alert trigger when a verified sighting/report falls inside a geofence.
7. **Rescue & Rehab** — Case intake form, medical/treatment log entries, status (in care/released/deceased), center-scoped access.
8. **Notifications** — In-app (Socket.IO), email (Nodemailer), SMS/WhatsApp (Twilio) — triggered by geofence alerts, tip status changes, verification results.
9. **Admin Panel** — User management (role assignment, ban/unban), moderation queues (sightings, tips), species catalog management, geofence zone management.
10. **Analytics Dashboard** — Aggregated charts: sightings over time, species distribution, regional activity, verification stats.
11. **ML-Backed Modules** — Per Section 3, integrated in later phases as described.

---

## 8. Non-Functional Requirements

- **Modularity:** Feature-sliced frontend architecture; layered backend (controller → service → model); ml-service organized by feature router.
- **Code Quality:** ESLint + Prettier enforced via Husky pre-commit hook. No console.log left in committed code (use a logger — e.g., Winston/Pino on server).
- **Validation:** All API inputs validated (Joi on server, Pydantic on ml-service) — no unvalidated data reaches the database or model.
- **Error Handling:** Centralized error-handling middleware on Express; consistent error response shape across all services.
- **Testing:** Minimum unit test coverage on services/controllers for each backend module; ml-service inference endpoints must have at least one integration test per model.
- **Security:** Passwords hashed (bcrypt), JWT secrets in `.env`, rate limiting on public endpoints (anti-poaching tips, auth), input sanitization against NoSQL injection.
- **Documentation:** Every module ships with a `README.md` in its folder explaining purpose and API contract; root `docs/` maintains overall architecture and an updated API reference.
- **No Deployment Artifacts Required This Phase:** `docker-compose.yml` is permitted for local multi-service convenience only — not a deployment deliverable.

---

## 9. Development Phases (Task-Level, Sequential)

> **Rule:** Each phase must be fully completed and demonstrably working (per its Definition of Done) before the next phase begins. No skipping ahead into ML phases before the corresponding backend/frontend foundation exists.

### PHASE 0 — Monorepo & Tooling Setup
- Initialize root repo with `client/`, `server/`, `ml-service/` folders exactly as per Section 4.1.
- Set up ESLint, Prettier, Husky, `.env.example`, `.gitignore` at root and per-service.
- Initialize `client` with Vite + React, Tailwind config.
- Initialize `server` with Express skeleton, folder structure per 4.1.
- Initialize `ml-service` with FastAPI skeleton, folder structure per 4.1.
- **DoD:** All three services boot independently (`npm run dev` / `uvicorn main:app --reload`) and print a health message.

### PHASE 1 — Backend Core Infrastructure
- MongoDB connection setup (`config/db.js`), env-based config loader.
- Centralized error-handling middleware.
- Base response utility (consistent success/error JSON shape).
- Logging setup (Winston/Pino).
- **DoD:** Server connects to local MongoDB; hitting an undefined route returns a standardized error JSON.

### PHASE 2 — Authentication & RBAC (Backend)
- User model (Mongoose) with roles enum per Section 6.
- Register/login/refresh-token endpoints, bcrypt password hashing, JWT issuing.
- `authMiddleware` (verify token) and `roleGuard` (RBAC) middlewares.
- Input validation (Joi) for all auth routes.
- **DoD:** Postman/automated test suite proves register → login → access a protected role-gated route works and fails correctly when unauthorized.

### PHASE 3 — Frontend Foundation
- React Router setup, base layout (navbar, footer, protected route wrapper).
- Redux Toolkit store setup with an `authSlice`.
- Tailwind design tokens/base styling setup.
- Axios instance with interceptor for JWT attachment + refresh handling.
- **DoD:** App boots, routes render, no console errors, Tailwind styles apply.

### PHASE 4 — Auth UI
- Register, Login, Forgot/Reset Password pages.
- Client-side form validation, error display, auth state persistence (secure storage of token).
- Role-based route protection on the frontend.
- **DoD:** A user can register, log in, stay logged in on refresh, and be blocked from admin-only routes in the UI.

### PHASE 5 — User Profile & Admin User Management (Backend)
- Profile CRUD endpoints (self-service).
- Admin endpoints: list users, change role, ban/unban.
- **DoD:** Admin can change another user's role via API; non-admins receive 403.

### PHASE 6 — User Profile & Admin User Management (Frontend)
- Profile page (view/edit own info).
- Admin → Users table with role change/ban controls.
- **DoD:** Full user management flow works end-to-end through the UI.

### PHASE 7 — Species Catalog (Backend)
- Species Mongoose schema (per Section 7.2).
- CRUD endpoints, admin-only write, public read.
- Image upload handling for species reference photos (Multer + GridFS).
- **DoD:** Admin can create/edit/delete species with images; public GET works without auth.

### PHASE 8 — Species Catalog (Frontend)
- Public species catalog listing + detail page.
- Admin species management UI (create/edit/delete form).
- **DoD:** Full species CRUD usable via UI by admin; public catalog browsable by anyone.

### PHASE 9 — Sighting Reports (Backend)
- Sighting Mongoose schema with GeoJSON `location` field + 2dsphere index.
- Create/list/filter (by species, region, date range, status) endpoints.
- Photo upload handling for sightings.
- Community verification voting endpoint (upvote/downvote → status transitions).
- **DoD:** Sightings can be created with geolocation + photo, filtered via query params, and voted on.

### PHASE 10 — Sighting Reports (Frontend)
- "Report a Sighting" form (species select, photo upload, location picker on map, notes).
- Sightings list/feed with filters.
- Verification voting UI on each sighting card.
- **DoD:** A logged-in user can submit a sighting with a real photo and location and see it appear in the feed; others can vote on it.

### PHASE 11 — Interactive Map Module
- Leaflet map integration with marker clustering.
- Layer toggle system (sightings layer live; other layers stubbed for later phases with a "coming in Phase X" state — **not fake data**, simply hidden/disabled toggles).
- Coordinate generalization logic for sensitive/endangered species markers shown to non-privileged roles.
- **DoD:** Map renders real sighting data as clustered markers; toggling layers works; sensitive species show generalized location to public role.

### PHASE 12 — Anti-Poaching Tip Reporting (Backend)
- Tip schema (anonymous-allowed), evidence upload, status workflow (new/under review/actioned/closed).
- Rate limiting on this public endpoint.
- Ranger/Admin review endpoints.
- **DoD:** Anonymous tip submission works without auth; rangers/admins can update status via a protected endpoint.

### PHASE 13 — Anti-Poaching Tip Reporting (Frontend)
- Public anonymous tip form (no login required).
- Ranger/Admin review queue UI.
- **DoD:** Full tip lifecycle demonstrable end-to-end through the UI.

### PHASE 14 — HWC Module (Backend)
- HWC incident schema, geofence zone schema (admin-defined polygon via GeoJSON).
- Geofence-breach detection logic (server-side, using turf.js) triggered on new verified sighting/report creation.
- **DoD:** Creating a sighting inside an admin-defined geofence triggers a detectable server-side event (verified via logs/tests).

### PHASE 15 — HWC Module (Frontend) + Notification System
- HWC incident logging form (farmers/community).
- Admin geofence zone drawing tool on the map (Leaflet Draw).
- Socket.IO in-app notification bell + toast on geofence breach.
- Email notification via Nodemailer on breach (real SMTP, e.g., free-tier Mailtrap/Gmail app password for dev).
- SMS/WhatsApp via Twilio sandbox (free trial credentials) on breach.
- **DoD:** Drawing a geofence, then creating a sighting inside it, triggers a real in-app + email notification (and SMS/WhatsApp if configured).

### PHASE 16 — Rescue & Rehab Case Management (Backend + Frontend)
- Case schema (intake, treatment log entries, status), center-scoped access via RBAC.
- Intake form UI, case dashboard UI (filter by status/center).
- **DoD:** Rescue staff role can create and update a case end-to-end through the UI, scoped to their center.

### PHASE 17 — Analytics Dashboard (Backend + Frontend)
- Aggregation endpoints (MongoDB aggregation pipeline): sightings over time, species distribution, regional heatcount, verification stats.
- Recharts-based dashboard UI consuming these endpoints.
- **DoD:** Dashboard renders real aggregated charts from live database data (not placeholder numbers).

### PHASE 18 — ML-Service Bootstrap & Node↔Python Contract
- FastAPI service skeleton finalized: health-check route, standardized request/response schema (Pydantic) shared pattern for all future ML endpoints.
- Node.js `mlService` client module (Axios wrapper) in `server/src/services/`.
- Finalize the target regional species list for Phase 19 (developer + product owner decision, documented in `docs/`).
- **DoD:** Server can call `ml-service`'s health-check endpoint and receive a valid response; contract pattern documented in `docs/`.

### PHASE 19 — ML Feature: Species Image Identification
- Acquire/prepare dataset (iNaturalist/GBIF subset for the finalized species list).
- Train/fine-tune classifier (MobileNetV2/EfficientNet transfer learning) — training scripts live in `ml-service/training/`, not runtime code.
- Build FastAPI inference endpoint (`/predict/species-image`).
- Integrate into sighting creation flow: uploaded photo → server calls ml-service → suggested species pre-fills the sighting form (user can confirm/override).
- **DoD:** Uploading a real photo of a species from the trained list returns a genuine model prediction with confidence score, surfaced in the UI.

### PHASE 20 — ML Feature: Camera-Trap Batch Triage
- Integrate MegaDetector (pretrained weights) into ml-service.
- New endpoint: batch image upload → per-image classification (animal/person/vehicle/blank) → for "animal" results, chain into Phase 19's species classifier.
- Frontend: "Camera Trap Upload" page (bulk upload, results table with thumbnails + tags, filter out blanks).
- **DoD:** A folder of real camera-trap-style images, when bulk-uploaded, is correctly triaged with blanks filtered and animals tagged.

### PHASE 21 — ML Feature: Bioacoustic Species ID
- Integrate BirdNET-style pretrained model/embeddings into ml-service.
- Endpoint: audio upload → species prediction with confidence + timestamp segments.
- Frontend: audio upload UI (file upload; browser mic recording optional stretch), results display.
- **DoD:** A real bird call audio clip returns a genuine species prediction.

### PHASE 22 — ML Feature: Acoustic Threat Detection
- Fine-tune YAMNet-embedding classifier on AudioSet/ESC-50/UrbanSound8K subset for gunshot/chainsaw categories.
- Endpoint: audio clip → threat probability + category.
- Frontend: "Report Threat Sound" upload flow; high-confidence detections auto-create a flagged entry in the Anti-Poaching review queue (Phase 12/13).
- **DoD:** A real gunshot/chainsaw sample clip is correctly flagged; a real birdsong/ambient clip is correctly not flagged.

### PHASE 23 — ML Feature: Satellite Habitat/NDVI Monitoring
- Integrate Sentinel Hub (or Google Earth Engine) API in ml-service for NDVI computation over a user-selected bounding box + date range.
- Endpoint: region + date range → NDVI raster/summary + change-over-time value.
- Frontend: Habitat Monitoring page — draw/select region on map, view NDVI overlay and trend chart.
- **DoD:** Selecting a real region returns real, currently-computed NDVI data from actual satellite imagery (not a static image).

### PHASE 24 — ML Feature: Predictive Poaching Hotspot Mapping
- Backend/ml-service: KDE computation over real anti-poaching tip + verified sighting location data.
- Endpoint: region → hotspot heatmap data (GeoJSON).
- Frontend: Heatmap layer on the map (role-gated to Ranger/Admin/Researcher).
- **DoD:** As real tip/sighting data accumulates in the dev database, the heatmap output visibly reflects it.

### PHASE 25 — ML Feature: Population Trend Forecasting
- Prophet/ARIMA model run on real per-species sighting counts over time (ml-service endpoint, on-demand computation — no persistent training required per request).
- Frontend: forecast chart on species detail page / analytics dashboard.
- **DoD:** Given real historical sighting data in the dev DB, the endpoint returns a genuine forecast with confidence interval.

### PHASE 26 — ML Feature: Anomaly Detection
- Isolation Forest / rolling z-score computation on sighting frequency data per species/region.
- Endpoint + admin dashboard alert card: "Unusual drop/spike detected for [species] in [region]."
- **DoD:** Seeding the dev DB with an artificially sparse period for a species (real data, just a deliberate test scenario — not mocked output) triggers a genuine anomaly flag.

### PHASE 27 — ML Feature: Movement/Corridor Visualization
- Movebank public API integration (real open GPS telemetry datasets) + CSV/GPX manual import option.
- Endpoint: parse/normalize telemetry → GeoJSON trajectory.
- Frontend: Corridor map layer showing real movement paths, filterable by species/dataset.
- **DoD:** A real Movebank dataset or uploaded GPX file renders as an actual animated/static trajectory on the map.

### PHASE 28 — ML Feature: Illegal Wildlife Trade Text Scanner
- Confirm and document (in `docs/`) the specific, ToS-permissive public sources to scan, per the legal caveat in Section 3.9.
- NLP classifier (spaCy/transformer-based) for trafficking-indicative text.
- Admin-only review queue UI (flagged listing → approve/dismiss, never auto-action).
- **DoD:** Scanning the approved source list produces real flagged results in the review queue; no autonomous action is taken on any flag.

### PHASE 29 — Cross-Module Integration Pass
- Wire all ML results into their respective UI surfaces consistently (loading states, error states, confidence display conventions).
- Ensure RBAC is correctly enforced across every new ML-backed route.
- Full click-through regression pass across all modules.
- **DoD:** A single test user journey (register → report sighting with real species ID → verify → view on map → check dashboard → admin reviews tip) works with zero broken links or console errors.

### PHASE 30 — Testing & QA Hardening
- Backend: Jest/Supertest coverage for all controllers/services.
- ml-service: Pytest coverage for all inference endpoints (using real sample inputs).
- Frontend: React Testing Library coverage for critical flows (auth, sighting submission, admin actions).
- Manual QA checklist execution across all roles.
- **DoD:** Test suites pass in all three services; documented QA checklist signed off.

### PHASE 31 — Documentation & Developer Handover
- Root `README.md`: setup instructions for all three services (env vars, run commands, model weight download scripts).
- `docs/architecture.md`: final architecture diagram + data flow.
- `docs/api-reference.md`: full endpoint documentation (all three services).
- Per-module README files finalized.
- **DoD:** A new developer can clone the repo and, following only the README, get all three services running locally and understand the codebase structure without further explanation.

---

## 10. Data Sources Reference (Free, Legally Usable)

| Source | Used For | Access |
|---|---|---|
| iNaturalist Open Data | Species image training | Free, CC-licensed bulk data |
| GBIF | Species occurrence + images | Free open API |
| Xeno-canto | Bird audio | Free open API |
| AudioSet (Google) | Gunshot/chainsaw audio events | Free, via YouTube clip references |
| ESC-50 / UrbanSound8K | Environmental sound classification | Free download |
| Sentinel Hub / Copernicus | Satellite NDVI/deforestation imagery | Free tier |
| Google Earth Engine | Alternative satellite analysis | Free for research/nonprofit |
| Movebank | GPS telemetry/movement data | Free public API |
| MegaDetector (Microsoft/CameraTrapAI) | Camera trap image triage | Free, open-source pretrained weights |

---

## 11. Explicit Instructions to Developer

1. Build phases strictly in order. Do not begin any Phase 18+ (ML) work before all of Phases 0–17 are complete and demoable.
2. Do not introduce any feature, page, or endpoint not listed in this document without written confirmation from the Product Owner.
3. Do not mock any ML inference. If a real model/dataset cannot be sourced for a listed feature at implementation time, stop and flag it back to the Product Owner rather than substituting fake output.
4. Do not begin any deployment, containerization-for-production, or cloud configuration work — local development only.
5. Do not build any mobile-specific code (React Native, PWA manifest/service worker) in this phase.
6. Keep all business logic out of route/controller files — controllers call services, services contain logic.
7. Every completed phase must be demonstrated (screenshot/recording or live walkthrough) against its Definition of Done before moving on.

---

*End of Document — Version 1.0*
