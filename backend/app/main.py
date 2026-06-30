"""
Arthrex AI — FastAPI Main Application
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

load_dotenv()

from app.database import engine
from app.models import Base
from app.routers import auth, signups, enrollments, masterclasses, liveclasses, lms, upload


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    # Ensure uploads directory exists
    uploads_dir = os.path.join(os.path.dirname(__file__), "..", "static", "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    print("✅ Database tables ready")
    yield


app = FastAPI(
    title="Arthrex AI API",
    description="Backend API for Arthrex AI Learning Platform",
    version="2.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Serve uploaded images as static files ─────────────────────────────────────
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(signups.router)
app.include_router(enrollments.router)
app.include_router(masterclasses.router)
app.include_router(liveclasses.router)
app.include_router(lms.router)
app.include_router(upload.router)


@app.get("/")
def root():
    return {"message": "Arthrex AI API v2.0 — Running ✅", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
