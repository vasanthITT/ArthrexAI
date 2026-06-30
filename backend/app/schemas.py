"""
Arthrex AI — Pydantic Schemas (Request & Response models)
"""
import re
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, EmailStr, field_validator, model_validator


# ── Password policy ───────────────────────────────────────────────────────────
PASSWORD_POLICY = (
    "Password must be at least 8 characters and include: "
    "one uppercase letter, one lowercase letter, one digit, "
    "and one special character (!@#$%^&*)"
)


def validate_password(password: str) -> str:
    """Enforce password policy — raises ValueError on failure."""
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter.")
    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter.")
    if not re.search(r"\d", password):
        raise ValueError("Password must contain at least one digit.")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise ValueError("Password must contain at least one special character.")
    return password


# ── AUTH ──────────────────────────────────────────────────────────────────────
class SignupRequest(BaseModel):
    name:     str
    email:    EmailStr
    password: str
    country:  str = "+91"
    phone:    str = ""

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name cannot be empty.")
        return v.strip()

    @field_validator("phone")
    @classmethod
    def phone_valid(cls, v: str) -> str:
        digits = re.sub(r"\D", "", v)
        if v and (len(digits) < 6 or len(digits) > 15):
            raise ValueError("Phone must be 6–15 digits.")
        return v

    @field_validator("password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        return validate_password(v)


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class AuthResponse(BaseModel):
    success: bool
    name:    str
    email:   str
    role:    str
    token:   str


# ── USERS / SIGNUPS ───────────────────────────────────────────────────────────
class UserOut(BaseModel):
    id:         int
    name:       str
    email:      str
    country:    Optional[str] = ""
    phone:      Optional[str] = ""
    role:       str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ── ENROLLMENTS ───────────────────────────────────────────────────────────────
class EnrollmentCreate(BaseModel):
    name:      str
    email:     EmailStr
    phone:     str = ""
    course:    str
    courseId:  str = ""

    @field_validator("name", "course")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field cannot be empty.")
        return v.strip()


class EnrollmentUpdate(BaseModel):
    status: str  # "approved" | "rejected" | "pending"

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str) -> str:
        if v not in ("pending", "approved", "rejected"):
            raise ValueError("Status must be pending, approved, or rejected.")
        return v


class EnrollmentOut(BaseModel):
    id:         int
    name:       Optional[str] = ""
    email:      Optional[str] = ""
    phone:      Optional[str] = ""
    course:     Optional[str] = ""
    course_id:  Optional[str] = ""
    status:     str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ── MASTERCLASSES ─────────────────────────────────────────────────────────────
class MasterclassCreate(BaseModel):
    title:       str
    tag:         str = "AI & ML"
    instructor:  str = ""
    description: str = ""
    schedule:    str          # ISO datetime string e.g. "2025-08-10T10:00"
    duration:    str = "2 hrs"
    link:        str = ""
    rating:      float = 4.9
    thumb:       str = ""
    videoUrl:    str = ""

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Title is required.")
        return v.strip()

    @field_validator("schedule")
    @classmethod
    def schedule_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Schedule date & time is required.")
        return v


class MasterclassOut(BaseModel):
    id:          int
    title:       str
    tag:         Optional[str] = ""
    instructor:  Optional[str] = ""
    description: Optional[str] = ""
    schedule:    Optional[str] = ""
    duration:    Optional[str] = ""
    link:        Optional[str] = ""
    rating:      Optional[float] = 4.9
    thumb:       Optional[str] = ""
    video_url:   Optional[str] = ""
    created_at:  Optional[datetime] = None

    model_config = {"from_attributes": True}


# ── LIVE CLASSES ──────────────────────────────────────────────────────────────
class LiveClassCreate(BaseModel):
    title:       str
    tag:         str = "AI & ML"
    instructor:  str = ""
    description: str = ""
    schedule:    str        # "YYYY-MM-DDTHH:MM"
    startTime:   str = ""
    endTime:     str = ""
    duration:    str = "2 hrs"
    joinLink:    str = ""
    link:        str = ""
    thumb:       str = ""

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Title is required.")
        return v.strip()


class LiveClassOut(BaseModel):
    id:          int
    title:       Optional[str] = ""
    tag:         Optional[str] = ""
    instructor:  Optional[str] = ""
    description: Optional[str] = ""
    schedule:    Optional[str] = ""
    date:        Optional[str] = ""
    start_time:  Optional[str] = ""
    end_time:    Optional[str] = ""
    duration:    Optional[str] = ""
    join_link:   Optional[str] = ""
    link:        Optional[str] = ""
    joinLink:    Optional[str] = ""
    startTime:   Optional[str] = ""
    endTime:     Optional[str] = ""
    thumb:       Optional[str] = ""
    created_at:  Optional[datetime] = None

    model_config = {"from_attributes": True}

    def model_post_init(self, __context: Any) -> None:
        # Expose camelCase aliases for frontend compatibility
        self.link     = self.join_link or ""
        self.joinLink = self.join_link or ""
        self.startTime = self.start_time or ""
        self.endTime   = self.end_time or ""
        if not self.schedule and self.date and self.start_time:
            self.schedule = f"{self.date}T{self.start_time}"


# ── LMS ───────────────────────────────────────────────────────────────────────
class LMSCourseCreate(BaseModel):
    name:     str
    category: str = ""
    duration: str = "Self-paced"

    model_config = {"extra": "allow"}  # allow topics/modules/etc.


class LMSCourseOut(BaseModel):
    id:       str
    name:     str
    category: Optional[str] = ""
    duration: Optional[str] = ""

    model_config = {"from_attributes": True, "extra": "allow"}


# ── MASTERCLASS REGISTRATION ──────────────────────────────────────────────────
class MCRegCreate(BaseModel):
    mcId:             str
    name:             str
    email:            EmailStr
    phone:            str = ""
    country:          str = ""
    masterclassTitle: str = ""


class MCRegOut(BaseModel):
    id:            int
    mc_id:         str
    name:          Optional[str] = ""
    email:         Optional[str] = ""
    phone:         Optional[str] = ""
    country:       Optional[str] = ""
    mc_title:      Optional[str] = ""
    registered_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
