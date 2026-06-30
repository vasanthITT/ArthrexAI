"""
Arthrex AI — SQLAlchemy Models (PostgreSQL)
"""
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(120), nullable=False)
    email      = Column(String(255), unique=True, nullable=False, index=True)
    password   = Column(String(255), nullable=False)  # bcrypt hash
    country    = Column(String(10), default="+91")
    phone      = Column(String(20), default="")
    role       = Column(String(20), default="user")   # "user" | "admin"
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Enrollment(Base):
    __tablename__ = "enrollments"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(120))
    email      = Column(String(255), index=True)
    phone      = Column(String(30))
    course     = Column(String(255))
    course_id  = Column(String(100), default="")
    status     = Column(String(20), default="pending")  # pending | approved | rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class LMSCourse(Base):
    __tablename__ = "lms_courses"

    id         = Column(String(100), primary_key=True)
    name       = Column(String(255), nullable=False)
    category   = Column(String(100))
    duration   = Column(String(50))
    data       = Column(Text, default="{}")  # JSON blob for topics/modules
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Masterclass(Base):
    __tablename__ = "masterclasses"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(255))
    tag         = Column(String(100))
    instructor  = Column(String(120))
    description = Column(Text)
    schedule    = Column(String(50))   # ISO datetime string
    duration    = Column(String(50))
    link        = Column(Text)
    rating      = Column(Float, default=4.9)
    thumb       = Column(Text)
    video_url   = Column(Text)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())


class LiveClass(Base):
    __tablename__ = "live_classes"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(255))
    tag         = Column(String(100))
    instructor  = Column(String(120))
    description = Column(Text)
    schedule    = Column(String(50))   # ISO datetime string
    date        = Column(String(20))
    start_time  = Column(String(10))
    end_time    = Column(String(10))
    duration    = Column(String(50))
    join_link   = Column(Text)
    thumb       = Column(Text)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())


class MCRegistration(Base):
    __tablename__ = "mc_registrations"

    id            = Column(Integer, primary_key=True, index=True)
    mc_id         = Column(String(20), index=True)
    name          = Column(String(120))
    email         = Column(String(255))
    phone         = Column(String(30))
    country       = Column(String(100))
    mc_title      = Column(String(255))
    registered_at = Column(DateTime(timezone=True), server_default=func.now())
