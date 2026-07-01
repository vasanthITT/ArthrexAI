"""
Arthrex AI — Sample Data Seeder
Seeds admin user, sample enrollments, masterclasses, and live classes.
Run: python -m app.seed
"""
import os, json
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

from app.database import SessionLocal, engine
from app.models import Base, User, Enrollment, Masterclass, LiveClass, LMSCourse, MCRegistration
from app.auth import hash_password


def seed():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ── Admin + Demo Users ─────────────────────────────────────────────────
        existing_admin = db.query(User).filter_by(email="admin@arthrex.ai").first()
        if not existing_admin:
            db.add(User(
                name="Admin",
                email="admin@arthrex.ai",
                password=hash_password("Admin@1234"),   # Meets password policy
                role="admin",
                country="+91",
                phone="9999999999"
            ))
            print("[OK] Admin user created  (admin@arthrex.ai / Admin@1234)")

        demo_users = [
            {"name": "Arjun Kumar",   "email": "arjun@demo.com",  "phone": "9876543210", "country": "+91"},
            {"name": "Sara Ramos",    "email": "sara@demo.com",   "phone": "9876543211", "country": "+1"},
            {"name": "Mike Johnson",  "email": "mike@demo.com",   "phone": "9876543212", "country": "+44"},
            {"name": "Priya Nair",    "email": "priya@demo.com",  "phone": "9876543213", "country": "+91"},
            {"name": "Rahul Sharma",  "email": "rahul@demo.com",  "phone": "9876543214", "country": "+91"},
        ]
        for u in demo_users:
            if not db.query(User).filter_by(email=u["email"]).first():
                db.add(User(
                    name=u["name"], email=u["email"],
                    password=hash_password("Demo@1234"),
                    role="user", country=u["country"], phone=u["phone"]
                ))
        print("[OK] Demo users seeded")

        # ── Sample Enrollments ─────────────────────────────────────────────────
        sample_enrollments = [
            {"name": "Arjun Kumar",  "email": "arjun@demo.com",  "phone": "9876543210", "course": "Professional Agentic AI Engineer",         "status": "approved"},
            {"name": "Sara Ramos",   "email": "sara@demo.com",   "phone": "9876543211", "course": "Professional Generative AI Engineer",       "status": "approved"},
            {"name": "Mike Johnson", "email": "mike@demo.com",   "phone": "9876543212", "course": "Data Science with Machine Learning",        "status": "pending"},
            {"name": "Priya Nair",   "email": "priya@demo.com",  "phone": "9876543213", "course": "Python for AI & Analytics",                 "status": "pending"},
            {"name": "Rahul Sharma", "email": "rahul@demo.com",  "phone": "9876543214", "course": "Advanced GPT Engineering",                  "status": "rejected"},
            {"name": "Arjun Kumar",  "email": "arjun@demo.com",  "phone": "9876543210", "course": "Deep Learning & NLP",                       "status": "approved"},
        ]
        for e in sample_enrollments:
            exists = db.query(Enrollment).filter_by(email=e["email"], course=e["course"]).first()
            if not exists:
                db.add(Enrollment(**e))
        print("[OK] Sample enrollments seeded")

        # ── Sample Masterclasses ───────────────────────────────────────────────
        now = datetime.now()
        sample_masterclasses = [
            {
                "title": "Introduction to Agentic AI — Live Free Session",
                "tag": "Agentic AI",
                "instructor": "Dr. Priya Menon",
                "description": "Learn the fundamentals of Agentic AI systems, tool use, and autonomous decision making. No prior experience required.",
                "schedule": (now + timedelta(days=2, hours=3)).strftime("%Y-%m-%dT%H:%M"),
                "duration": "2 hrs",
                "link": "https://meet.google.com/sample-link-1",
                "rating": 4.9,
            },
            {
                "title": "RAG Systems from Scratch — Free Masterclass",
                "tag": "Generative AI",
                "instructor": "Rajesh Iyer",
                "description": "Build production-ready RAG systems using LangChain, ChromaDB, and OpenAI APIs. Walk away with a working project.",
                "schedule": (now + timedelta(days=5, hours=6)).strftime("%Y-%m-%dT%H:%M"),
                "duration": "2.5 hrs",
                "link": "https://meet.google.com/sample-link-2",
                "rating": 5.0,
            },
            {
                "title": "Python for AI Beginners — Weekend Bootcamp",
                "tag": "Programming",
                "instructor": "Anitha Suresh",
                "description": "Start your AI journey with Python. Cover data types, pandas, numpy, and your first ML model in one weekend session.",
                "schedule": (now + timedelta(days=7, hours=2)).strftime("%Y-%m-%dT%H:%M"),
                "duration": "3 hrs",
                "link": "",
                "rating": 4.8,
            },
            {
                "title": "LangGraph Multi-Agent Workflows",
                "tag": "Agentic AI",
                "instructor": "Dr. Vikram Nair",
                "description": "Deep dive into LangGraph — build stateful, multi-agent workflows for enterprise AI applications.",
                "schedule": (now - timedelta(days=1)).strftime("%Y-%m-%dT%H:%M"),  # ended
                "duration": "2 hrs",
                "link": "",
                "rating": 4.9,
            },
        ]
        for mc in sample_masterclasses:
            if not db.query(Masterclass).filter_by(title=mc["title"]).first():
                db.add(Masterclass(**mc))
        print("[OK] Sample masterclasses seeded")

        # ── Sample Live Classes ────────────────────────────────────────────────
        sample_live_classes = [
            {
                "title": "AWS Bedrock Agents — Live Q&A Session",
                "tag": "Cloud Based",
                "instructor": "Karthik Raj",
                "description": "Live session covering AWS Bedrock Agents, knowledge bases, and guardrails. Bring your questions!",
                "schedule": (now + timedelta(hours=4)).strftime("%Y-%m-%dT%H:%M"),
                "date": (now + timedelta(hours=4)).strftime("%Y-%m-%d"),
                "start_time": (now + timedelta(hours=4)).strftime("%H:%M"),
                "end_time": (now + timedelta(hours=6)).strftime("%H:%M"),
                "duration": "2 hrs",
                "join_link": "https://zoom.us/sample-live-1",
            },
            {
                "title": "Fine-Tuning LLMs with LoRA — Live Coding",
                "tag": "Generative AI",
                "instructor": "Dr. Priya Menon",
                "description": "Watch live fine-tuning of a Llama model using LoRA on a free GPU. Code along session.",
                "schedule": (now + timedelta(days=3, hours=5)).strftime("%Y-%m-%dT%H:%M"),
                "date": (now + timedelta(days=3)).strftime("%Y-%m-%d"),
                "start_time": (now + timedelta(days=3, hours=5)).strftime("%H:%M"),
                "end_time": (now + timedelta(days=3, hours=7)).strftime("%H:%M"),
                "duration": "2 hrs",
                "join_link": "https://zoom.us/sample-live-2",
            },
            {
                "title": "Data Analytics with Power BI — Live Demo",
                "tag": "Data Analytics",
                "instructor": "Swetha Krishnan",
                "description": "Build a real business dashboard from scratch in Power BI — live, step by step.",
                "schedule": (now + timedelta(days=6, hours=8)).strftime("%Y-%m-%dT%H:%M"),
                "date": (now + timedelta(days=6)).strftime("%Y-%m-%d"),
                "start_time": (now + timedelta(days=6, hours=8)).strftime("%H:%M"),
                "end_time": (now + timedelta(days=6, hours=10)).strftime("%H:%M"),
                "duration": "2 hrs",
                "join_link": "https://zoom.us/sample-live-3",
            },
        ]
        for lc in sample_live_classes:
            if not db.query(LiveClass).filter_by(title=lc["title"]).first():
                db.add(LiveClass(**lc))
        print("[OK] Sample live classes seeded")

        # ── Sample LMS Courses ─────────────────────────────────────────────────
        sample_lms = [
            {
                "id": "course_agentic_pro",
                "name": "Professional Agentic AI Engineer",
                "category": "Agentic AI",
                "duration": "6 Months",
                "data": json.dumps({
                    "topics": [
                        {
                            "title": "Module 1 — Foundations of Agentic AI",
                            "lessons": [
                                {"title": "What is Agentic AI?", "type": "video", "duration": "45 min"},
                                {"title": "Agent Architectures Overview", "type": "video", "duration": "60 min"},
                                {"title": "Tool Use & Function Calling", "type": "video", "duration": "75 min"},
                                {"title": "Quiz — Foundations", "type": "quiz"},
                            ]
                        },
                        {
                            "title": "Module 2 — LangChain & LangGraph",
                            "lessons": [
                                {"title": "LangChain Core Concepts", "type": "video", "duration": "90 min"},
                                {"title": "Building Your First Agent", "type": "video", "duration": "120 min"},
                                {"title": "LangGraph for Stateful Agents", "type": "video", "duration": "90 min"},
                                {"title": "Assignment — Build a Research Agent", "type": "assignment"},
                            ]
                        },
                    ],
                    "quizzes": [{"title": "Mid-term Quiz", "questions": 20}],
                    "assignments": [{"title": "Build a Multi-Tool AI Agent", "deadline": "Week 4"}],
                    "projects": [{"title": "Capstone: Enterprise AI Agent", "deadline": "Month 6"}],
                    "resources": [{"title": "LangGraph Docs", "url": "https://langchain-ai.github.io/langgraph/"}],
                })
            },
            {
                "id": "course_genai_pro",
                "name": "Professional Generative AI Engineer",
                "category": "Generative AI",
                "duration": "6 Months",
                "data": json.dumps({
                    "topics": [
                        {
                            "title": "Module 1 — LLM Foundations",
                            "lessons": [
                                {"title": "How LLMs Work", "type": "video", "duration": "60 min"},
                                {"title": "Prompt Engineering Basics", "type": "video", "duration": "45 min"},
                                {"title": "OpenAI API Deep Dive", "type": "video", "duration": "90 min"},
                            ]
                        },
                        {
                            "title": "Module 2 — RAG Systems",
                            "lessons": [
                                {"title": "Vector Databases Explained", "type": "video", "duration": "60 min"},
                                {"title": "Building RAG from Scratch", "type": "video", "duration": "120 min"},
                                {"title": "Production RAG Architecture", "type": "video", "duration": "90 min"},
                                {"title": "Assignment — Build a RAG Chatbot", "type": "assignment"},
                            ]
                        },
                    ],
                    "projects": [{"title": "Capstone: AI-Powered SaaS App", "deadline": "Month 6"}],
                })
            },
        ]
        for lc in sample_lms:
            if not db.query(LMSCourse).filter_by(id=lc["id"]).first():
                db.add(LMSCourse(**lc))
        print("[OK] Sample LMS courses seeded")

        # ── Sample MC Registrations ────────────────────────────────────────────
        sample_mc_regs = [
            {"mc_id": "1", "name": "Arjun Kumar",  "email": "arjun@demo.com",  "phone": "9876543210", "country": "India"},
            {"mc_id": "1", "name": "Priya Nair",   "email": "priya@demo.com",  "phone": "9876543213", "country": "India"},
            {"mc_id": "2", "name": "Mike Johnson",  "email": "mike@demo.com",   "phone": "9876543212", "country": "UK"},
            {"mc_id": "2", "name": "Sara Ramos",    "email": "sara@demo.com",   "phone": "9876543211", "country": "USA"},
            {"mc_id": "3", "name": "Rahul Sharma",  "email": "rahul@demo.com",  "phone": "9876543214", "country": "India"},
        ]
        for r in sample_mc_regs:
            exists = db.query(MCRegistration).filter_by(mc_id=r["mc_id"], email=r["email"]).first()
            if not exists:
                db.add(MCRegistration(mc_title="Sample Masterclass", **r))
        print("[OK] Sample MC registrations seeded")

        db.commit()
        print("\nAll sample data seeded successfully!")
        print("\nLogin credentials:")
        print("   Admin  -> admin@arthrex.ai  / Admin@1234")
        print("   Demo   -> arjun@demo.com    / Demo@1234")
        print("   (Password policy: min 8 chars, upper+lower+digit+special)")

    except Exception as e:
        db.rollback()
        print(f"Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
