"""LMS router — /api/lms"""
import json
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import LMSCourse
from app.auth import get_admin_user

router = APIRouter(prefix="/api/lms", tags=["lms"])


@router.get("", response_model=Dict[str, Any])
def get_lms(db: Session = Depends(get_db)):
    courses = db.query(LMSCourse).all()
    result = {}
    for c in courses:
        extra = json.loads(c.data or "{}")
        result[c.id] = {"name": c.name, "category": c.category, "duration": c.duration, **extra}
    return result


@router.put("/{course_id}")
def save_lms_course(course_id: str, data: Dict[str, Any], db: Session = Depends(get_db), _: dict = Depends(get_admin_user)):
    name     = data.get("name", "")
    category = data.get("category", "")
    duration = data.get("duration", "")
    extra    = {k: v for k, v in data.items() if k not in ("name", "category", "duration")}

    course = db.query(LMSCourse).filter_by(id=course_id).first()
    if course:
        course.name     = name
        course.category = category
        course.duration = duration
        course.data     = json.dumps(extra)
    else:
        db.add(LMSCourse(id=course_id, name=name, category=category, duration=duration, data=json.dumps(extra)))
    db.commit()
    return {"success": True}


@router.delete("/{course_id}")
def delete_lms_course(course_id: str, db: Session = Depends(get_db), _: dict = Depends(get_admin_user)):
    course = db.query(LMSCourse).filter_by(id=course_id).first()
    if course:
        db.delete(course)
        db.commit()
    return {"success": True}
