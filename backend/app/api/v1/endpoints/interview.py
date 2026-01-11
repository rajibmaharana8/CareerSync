from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.interview import InterviewSession
from app.services.interview_service import generate_interview_response
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# --- Schemas ---
class StartInterviewRequest(BaseModel):
    user_email: str
    job_role: str
    difficulty: str = "Medium"

class ChatRequest(BaseModel):
    session_id: int
    user_answer: str

# --- Endpoints ---

@router.post("/start")
async def start_interview(request: StartInterviewRequest, db: Session = Depends(get_db)):
    """
    Creates a new session and generates the first question.
    """
    try:
        # Create empty session
        new_session = InterviewSession(
            user_email=request.user_email,
            job_role=request.job_role,
            difficulty=request.difficulty,
            history=[]
        )
        db.add(new_session)
        db.commit()
        db.refresh(new_session)

        # Generate first question (History is empty)
        try:
            ai_response = await generate_interview_response([], request.job_role, request.difficulty)
        except Exception as ai_err:
            print(f"ERROR: AI Generation Failed: {str(ai_err)}")
            raise HTTPException(status_code=500, detail=f"AI Agent failed: {str(ai_err)}")
        
        # Update History
        new_history = [{"role": "ai", "content": ai_response}]
        new_session.history = new_history
        
        # Use flag_modified so SQLAlchemy knows the JSON changed
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(new_session, "history")
        
        db.commit()

        return {"session_id": new_session.id, "message": ai_response}
    except Exception as e:
        print(f"ERROR starting interview: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat")
async def chat_interview(request: ChatRequest, db: Session = Depends(get_db)):
    """
    User sends an answer -> AI evaluates -> AI asks next Q.
    """
    # 1. Get Session
    session = db.query(InterviewSession).filter(InterviewSession.id == request.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # 2. Append User Answer to History
    current_history = list(session.history) # Copy list
    current_history.append({"role": "user", "content": request.user_answer})
    
    # 3. Generate AI Response
    ai_response_text = await generate_interview_response(
        current_history, 
        session.job_role, 
        session.difficulty
    )
    
    # 4. Append AI Response to History
    current_history.append({"role": "ai", "content": ai_response_text})
    
    # 5. Save to DB
    session.history = current_history
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(session, "history")
    
    db.commit()

    return {"message": ai_response_text}

@router.get("/history/{session_id}")
def get_history(session_id: int, db: Session = Depends(get_db)):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session.history
