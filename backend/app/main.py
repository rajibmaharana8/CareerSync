from fastapi import FastAPI
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.endpoints import resume, jobs, interview
from app.models.job import SavedJob  # Ensure model is registered before create_all
from app.models.interview import InterviewSession  # Ensure interview model is registered

from fastapi.middleware.cors import CORSMiddleware

# Create Tables with Error Handling
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"❌ Database Connection Error: {e}")
    if "Network is unreachable" in str(e):
        print("\n⚠️  RENDER/SUPABASE CONFIGURATION ISSUE DETECTED ⚠️")
        print("It appears you are connecting to Supabase via IPv6, which Render does not fully support.")
        print("👉 SOLUTION: Update your DATABASE_URL in Render to use the 'Connection Pooler' string.")
        print("   Shape: postgresql://[user]:[pass]@[aws-region].pooler.supabase.com:6543/[db]")
        print("   Find it in: Supabase Dashboard > Project Settings > Database > Connection String > Pooler\n")
    raise e

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
 