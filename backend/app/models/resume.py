from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class ResumeAnalysis(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    job_role = Column(String, nullable=False)

    # AI Analysis Results
    ats_score = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # We store the raw text extracted from PDF
    raw_text = Column(Text, nullable=True)     
    
    analysis_json = Column(JSON, nullable=True) # Full AI output