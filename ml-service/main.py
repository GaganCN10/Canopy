from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import predict

app = FastAPI(
    title="Canopy ML Service",
    description="Machine learning microservice for wildlife conservation inference.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, tags=["predict"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "canopy-ml-service"}
