"""Masterclasses router — /api/masterclasses"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Masterclass, MCRegistration
from app.schemas import MasterclassCreate, MasterclassOut, MCRegCreate, MCRegOut
from app.auth import get_admin_user

router = APIRouter(tags=["masterclasses"])


# ── Masterclasses ─────────────────────────────────────────────────────────────
@router.get("/api/masterclasses", response_model=List[MasterclassOut])
def get_masterclasses(db: Session = Depends(get_db)):
    return db.query(Masterclass).order_by(Masterclass.id.desc()).all()


@router.post("/api/masterclasses", response_model=dict)
def add_masterclass(data: MasterclassCreate, db: Session = Depends(get_db), _: dict = Depends(get_admin_user)):
    mc = Masterclass(
        title=data.title, tag=data.tag, instructor=data.instructor,
        description=data.description, schedule=data.schedule, duration=data.duration,
        link=data.link, rating=data.rating, thumb=data.thumb, video_url=data.videoUrl,
    )
    db.add(mc)
    db.commit()
    db.refresh(mc)
    return {"success": True, "id": mc.id}


@router.put("/api/masterclasses/{mid}", response_model=dict)
def update_masterclass(mid: int, data: MasterclassCreate, db: Session = Depends(get_db), _: dict = Depends(get_admin_user)):
    mc = db.query(Masterclass).filter_by(id=mid).first()
    if not mc:
        raise HTTPException(status_code=404, detail="Masterclass not found.")
    mc.title       = data.title
    mc.tag         = data.tag
    mc.instructor  = data.instructor
    mc.description = data.description
    mc.schedule    = data.schedule
    mc.duration    = data.duration
    mc.link        = data.link
    mc.rating      = data.rating
    mc.thumb       = data.thumb
    mc.video_url   = data.videoUrl
    db.commit()
    return {"success": True}


@router.delete("/api/masterclasses/{mid}")
def delete_masterclass(mid: int, db: Session = Depends(get_db), _: dict = Depends(get_admin_user)):
    mc = db.query(Masterclass).filter_by(id=mid).first()
    if mc:
        db.delete(mc)
        db.commit()
    return {"success": True}


# ── Masterclass Registrations ─────────────────────────────────────────────────
@router.post("/api/masterclass-registrations", response_model=dict)
def register_for_masterclass(data: MCRegCreate, db: Session = Depends(get_db)):
    # Prevent duplicate registration
    exists = db.query(MCRegistration).filter_by(mc_id=str(data.mcId), email=data.email).first()
    if not exists:
        reg = MCRegistration(
            mc_id=str(data.mcId), name=data.name, email=data.email,
            phone=data.phone, country=data.country, mc_title=data.masterclassTitle,
        )
        db.add(reg)
        db.commit()
    return {"success": True}


@router.get("/api/masterclass-registrations/{mc_id}", response_model=List[MCRegOut])
def get_mc_registrations(mc_id: str, db: Session = Depends(get_db), _: dict = Depends(get_admin_user)):
    return db.query(MCRegistration).filter_by(mc_id=mc_id).order_by(MCRegistration.id.desc()).all()
