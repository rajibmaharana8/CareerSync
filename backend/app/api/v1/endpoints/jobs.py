from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.job_search_service import search_jobs_google
from app.services.resume_service import extract_text_from_pdf, extract_search_params_from_resume
from app.models.job import SavedJob
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# --- Response Model ---
class JobResult(BaseModel):
    title: str
    company_name: str
    location: str
    apply_link: str
    platform: str
    posted_at: Optional[str] = None
    thumbnail: Optional[str] = None
    is_verified: Optional[bool] = False

# ==========================================
# SECTION 1: MANUAL SEARCH
# ==========================================
@router.get("/manual-search", response_model=List[JobResult])
def manual_job_search(
    role: str = Query(..., description="Job Role e.g. Python Developer"),
    location: str = Query("Remote", description="Location"),
    experience: str = Query(None, description="e.g. 'Entry Level', '3 years'"),
    time_range: str = Query(None, description="today, 3days, week, month"),
    platforms: str = Query(None, description="Comma separated platforms")
):
    """
    User manually enters details. Backend builds the query string.
    """
    # Build a smart query string for Google Jobs
    # Example: "Python Developer Entry Level Remote"
    search_query = f"{role}"
    if experience:
        search_query += f" {experience}"
    
    print(f"Executing Manual Search: {search_query} in {location} for platforms: {platforms}")
    results = search_jobs_google(search_query, location, time_range, platforms)
    return results


# ==========================================
# SECTION 2: SEARCH BY RESUME SCAN
# ==========================================
@router.post("/search-by-resume", response_model=List[JobResult])
async def search_jobs_by_resume(
    file: UploadFile = File(...),
    location: str = Query("Remote", description="Preferred Location"),
    time_range: str = Query(None, description="today, 3days, week, month") # <--- NEW
):
    """
    Uploads a resume -> AI extracts role/skills -> Auto-searches jobs.
    Does NOT save the resume to DB (Stateless search).
    """
    # 1. Validate PDF
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    
    # 2. Extract Text
    content = await file.read()
    text = await extract_text_from_pdf(content)
    
    # 3. AI Extraction (Specialized for Search)
    params = await extract_search_params_from_resume(text)
    
    # 4. Construct Query from AI Findings
    # params returns: {'role': 'Backend Dev', 'experience_level': 'Entry Level', 'skills': ['Python']}
    
    role = params.get("role", "Software Engineer")
    exp = params.get("experience_level", "")
    skills = " ".join(params.get("skills", [])[:2]) # Take top 2 skills
    
    search_query = f"{role} {skills} {exp}".strip()
    
    print(f"AI Auto-Search Query: {search_query}")
    
    # 5. Search
    results = search_jobs_google(search_query, location, time_range)
    return results


# ==========================================
# SECTION 3: SAVED JOBS (Common)
# ==========================================
class JobSaveRequest(BaseModel):
    user_email: str
    title: str
    company_name: str
    location: str
    apply_link: str
    platform: str

@router.post("/save")
def save_job(job: JobSaveRequest, db: Session = Depends(get_db)):
    existing = db.query(SavedJob).filter(
        SavedJob.user_email == job.user_email, 
        SavedJob.title == job.title, 
        SavedJob.company_name == job.company_name
    ).first()
    
    if existing:
        return {"message": "Job already saved"}

    new_job = SavedJob(**job.dict())
    db.add(new_job)
    db.commit()
    return {"message": "Job saved successfully"}

@router.get("/saved/{user_email}")
def get_saved_jobs(user_email: str, db: Session = Depends(get_db)):
    return db.query(SavedJob).filter(SavedJob.user_email == user_email).all()

@router.delete("/saved/{job_id}")
def delete_saved_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(SavedJob).filter(SavedJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"message": "Job removed successfully"}