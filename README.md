# Canopy — Wildlife Conservation Platform

Monorepo for Canopy, built with React (Vite), Node.js + Express, and Python (FastAPI) for ML.

## Structure

- `client/` — React frontend (Vite + Redux Toolkit + Tailwind + Leaflet)
- `server/` — Node.js + Express backend (MongoDB + Socket.IO)
- `ml-service/` — Python FastAPI microservice for ML inference

## Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB (local instance)
- Redis (local instance)

## Setup

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all

# Start all services (client, server, ml-service)
npm run dev
```

## Environment

Copy `.env.example` to `.env` at the root and fill in your local values.

## License

Proprietary — Canopy Conservation Platform
