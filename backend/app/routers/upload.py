"""Image Upload router — /api/upload"""
import os, uuid, shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from app.auth import get_admin_user

router = APIRouter(prefix="/api/upload", tags=["upload"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "static", "uploads")
ALLOWED    = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"}
MAX_BYTES  = 5 * 1024 * 1024   # 5 MB


@router.post("")
async def upload_image(
    file: UploadFile = File(...),
    _: dict = Depends(get_admin_user),
):
    if file.content_type not in ALLOWED:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, GIF, WebP or SVG allowed.")

    # Read and size-check
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File must be under 5 MB.")

    # Save with a unique name
    ext      = os.path.splitext(file.filename or "img")[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    dest = os.path.join(UPLOAD_DIR, filename)
    with open(dest, "wb") as f:
        f.write(data)

    # Return the public URL (served by FastAPI StaticFiles)
    return JSONResponse({"url": f"/static/uploads/{filename}", "filename": filename})
