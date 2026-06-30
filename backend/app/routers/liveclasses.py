"""Live Classes router — /api/liveclasses"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import LiveClass
from app.schemas import LiveClassCreate, LiveClassOut
from app.auth import get_admin_user

router = APIRouter(prefix="/api/liveclasses", tags=["liveclasses"])


@router.get("", response_model=List[LiveClassOut])
def get_liveclasses(db: Session = Depends(get_db)):
    classes = db.query(LiveClass).order_by(LiveClass.id.desc()).all()
    result = []
    for lc in classes:
        out = LiveClassOut.model_validate(lc)
        # Build schedule from date+start_time if missing
        if not out.schedule and lc.date and lc.start_time:
            out.schedule = f"{lc.date}T{lc.start_time}"
        result.append(out)
    return result


@router.post("", response_model=dict)
def add_liveclass(data: LiveClassCreate, db: Session = Depends(get_db), _: dict = Depends(get_admin_user)):
    # Parse date and start_time from schedule if not provided
    date_val   = data.schedule.split("T")[0] if "T" in data.schedule else data.schedule
    start_time = data.schedule.split("T")[1] if "T" in data.schedule else data.startTime

    lc = LiveClass(
        title=data.title, tag=data.tag, instructor=data.instructor,
        description=data.description, schedule=data.schedule,
        date=date_val, start_time=start_time, end_time=data.endTime,
        duration=data.duration, join_link=data.joinLink or data.link,
        thumb=data.thumb,
    )
    db.add(lc)
    db.commit()
    db.refresh(lc)
    return {"success": True, "id": lc.id}


@router.delete("/{lid}")
def delete_liveclass(lid: int, db: Session = Depends(get_db), _: dict = Depends(get_admin_user)):
    lc = db.query(LiveClass).filter_by(id=lid).first()
    if lc:
        db.delete(lc)
        db.commit()
    return {"success": True}
