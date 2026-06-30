"""Enrollments router — /api/enrollments"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Enrollment
from app.schemas import EnrollmentCreate, EnrollmentUpdate, EnrollmentOut
from app.auth import get_admin_user

router = APIRouter(prefix="/api/enrollments", tags=["enrollments"])


@router.get("", response_model=List[EnrollmentOut])
def get_enrollments(db: Session = Depends(get_db), _: dict = Depends(get_admin_user)):
    return db.query(Enrollment).order_by(Enrollment.id.desc()).all()


@router.post("", response_model=dict)
def add_enrollment(data: EnrollmentCreate, db: Session = Depends(get_db)):
    # Prevent duplicate enrollment
    exists = db.query(Enrollment).filter_by(email=data.email, course=data.course).first()
    if exists:
        raise HTTPException(status_code=409, detail="Already enrolled in this course.")
    enrollment = Enrollment(
        name=data.name,
        email=data.email,
        phone=data.phone,
        course=data.course,
        course_id=data.courseId,
        status="pending",
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return {"success": True, "id": enrollment.id}


@router.patch("/{eid}")
def update_enrollment(eid: int, data: EnrollmentUpdate, db: Session = Depends(get_db), _: dict = Depends(get_admin_user)):
    e = db.query(Enrollment).filter_by(id=eid).first()
    if not e:
        raise HTTPException(status_code=404, detail="Enrollment not found.")
    e.status = data.status
    db.commit()
    return {"success": True}


@router.delete("/{eid}")
def delete_enrollment(eid: int, db: Session = Depends(get_db), _: dict = Depends(get_admin_user)):
    e = db.query(Enrollment).filter_by(id=eid).first()
    if e:
        db.delete(e)
        db.commit()
    return {"success": True}
