from fastapi import APIRouter, UploadFile, File, Form, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.resume import ResumeAnalysis
from app.services.resume_service import extract_text_from_pdf, analyze_resume_with_llm
from app.services.email_service import send_resume_feedback_email

router = APIRouter()

@router.post("/analyze")
async def analyze_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    email: str = Form(...),
    job_role: str = Form(...),
    db: Session = Depends(get_db)
):
    # 1. Validate PDF
    print(f"DEBUG: Starting analysis for {email} - Job Role: {job_role}")
    if file.content_type != "application/pdf":
        print(f"DEBUG: Invalid file type: {file.content_type}")
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    
    # 2. Process
    content = await file.read()
    print(f"DEBUG: File read, size: {len(content)} bytes")
    try:
        text = await extract_text_from_pdf(content)
        print(f"DEBUG: Text extracted, length: {len(text)} characters")
        if not text.strip():
             print("DEBUG: Extracted text is empty!")
             raise HTTPException(status_code=400, detail="Could not extract text from this PDF. It might be an image-only PDF.")
    except Exception as e:
        print(f"DEBUG: Error extracting text: {str(e)}")
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")
    
    # 3. Analyze
    try:
        print("DEBUG: Calling Gemini API for analysis...")
        analysis = await analyze_resume_with_llm(text, job_role)
        print(f"DEBUG: Analysis Object Type: {type(analysis)}")
        print(f"DEBUG: Analysis Keys: {analysis.keys()}")
        print(f"DEBUG: ATS Score Found: {analysis.get('ats_score')}")
    except Exception as e:
        print(f"DEBUG: Error during LLM analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI Analysis failed: {str(e)}")
    
    # 4. Save to DB
    try:
        db_resume = ResumeAnalysis(
            email=email,
            job_role=job_role,
            raw_text=text,
            ats_score=analysis.get("ats_score", 0),
            analysis_json=analysis
        )
        db.add(db_resume)
        db.commit()
        db.refresh(db_resume)
        print(f"DEBUG: Saved to DB with ID: {db_resume.id}")
        
        # AUTOMATIC EMAIL TRIGGER
        print(f"DEBUG: Adding background task to send email to {email}")
        background_tasks.add_task(
            send_resume_feedback_email,
            to_email=email,
            analysis=analysis,
            job_role=job_role
        )
        
    except Exception as e:
        print(f"DEBUG: Error saving to DB: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database save failed: {str(e)}")

    # 5. Return immediate result (User sees this on screen)
    return {
        "id": db_resume.id,
        "ats_score": db_resume.ats_score,
        "analysis_json": analysis,
        "message": "Analysis complete."
    }

@router.post("/send-email/{resume_id}")
async def trigger_email(
    resume_id: int, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    # Fetch from DB
    resume = db.query(ResumeAnalysis).filter(ResumeAnalysis.id == resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
        
    # Send Email in Background
    background_tasks.add_task(
        send_resume_feedback_email,
        to_email=resume.email,
        analysis=resume.analysis_json,
        job_role=resume.job_role
    )
    
    return {"message": "Email is being sent!"}