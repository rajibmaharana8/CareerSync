from fastapi import FastAPI
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.endpoints import resume, jobs, interview
from app.models.job import SavedJob  # Ensure model is registered before create_all
from app.models.interview import InterviewSession  # Ensure interview model is registered

from fastapi.middleware.cors import CORSMiddleware

# Create Tables in Supabase (Automatic Migration)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CareerSync API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(resume.router, prefix="/api/v1/resume", tags=["Resume"])
app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["Jobs"])
app.include_router(interview.router, prefix="/api/v1/interview", tags=["Interview"])

@app.get("/")
def root():
    return {"message": "CareerSync Backend Running 🚀"}
 