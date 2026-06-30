"""Signups router — /api/signups (admin only)"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserOut
from app.auth import get_admin_user

router = APIRouter(prefix="/api/signups", tags=["signups"])


@router.get("", response_model=List[UserOut])
def get_signups(db: Session = Depends(get_db), _: dict = Depends(get_admin_user)):
    return db.query(User).filter_by(role="user").order_by(User.id.desc()).all()


@router.delete("/{uid}")
def delete_signup(uid: int, db: Session = Depends(get_db), _: dict = Depends(get_admin_user)):
    user = db.query(User).filter_by(id=uid, role="user").first()
    if user:
        db.delete(user)
        db.commit()
    return {"success": True}
