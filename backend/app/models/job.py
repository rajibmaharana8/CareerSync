from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    title = Column(String)
    company_name = Column(String)
    location = Column(String)
    apply_link = Column(String)
    platform = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
