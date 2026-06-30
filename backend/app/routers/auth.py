"""Auth router — /api/auth/signup & /api/auth/login"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import SignupRequest, LoginRequest, AuthResponse
from app.auth import hash_password, verify_password, create_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter_by(email=data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered.")
    user = User(
        name=data.name.strip(),
        email=data.email.lower(),
        password=hash_password(data.password),
        country=data.country,
        phone=data.phone,
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_token({"sub": user.email, "role": user.role, "name": user.name})
    return AuthResponse(success=True, name=user.name, email=user.email, role=user.role, token=token)


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=data.email.lower()).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_token({"sub": user.email, "role": user.role, "name": user.name})
    return AuthResponse(success=True, name=user.name, email=user.email, role=user.role, token=token)
