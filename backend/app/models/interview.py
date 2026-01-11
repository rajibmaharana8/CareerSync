from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    job_role = Column(String)
    difficulty = Column(String) # "Easy", "Medium", "Hard"
    
    # Stores list of messages: [{"role": "ai", "content": "..."}, {"role": "user", "content": "..."}]
    history = Column(JSON, default=[]) 
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())