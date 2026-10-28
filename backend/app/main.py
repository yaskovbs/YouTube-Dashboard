"""FastAPI entry point.

Run with:  uvicorn app.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routes import router

app = FastAPI(title="YouTube Analytics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root() -> dict:
    return {"message": "YouTube Analytics API", "docs": "/docs"}
