from app.emailjs import emailjs
from typing import Dict
from fastapi.concurrency import run_in_threadpool
import datetime

async def send_resume_feedback_email(to_email: str, analysis: Dict, job_role: str):
    """
    Sends the resume feedback report using the OFFICIAL EmailJS REST API.
    Prepares data for the Premium HTML Template.
    """
    
    # Extract and format list items as HTML fragments for the premium template
    strengths_html = "".join(f"<li style='margin-bottom: 10px; padding-left: 15px; border-left: 2px solid #c5a059;'>{item}</li>" for item in analysis.get("detailed_strengths", []))
    improvements_html = "".join(f"<li style='margin-bottom: 10px; padding-left: 15px; border-left: 2px solid #64748b;'>{item}</li>" for item in analysis.get("detailed_improvements", []))
    plan_html = "".join(f"<li style='margin-bottom: 10px; padding-left: 15px; border-left: 2px solid #c5a059;'>{item}</li>" for item in analysis.get("improvement_plan", []))

    template_params = {
        "to_email": to_email,
        "job_role": job_role,
        "ats_score": analysis.get("ats_score", 0),
        "summary": analysis.get("summary", "Analysis complete."),
        "strengths": strengths_html or "<li>No specific strengths identified.</li>",
        "improvements": improvements_html or "<li>No specific improvements identified.</li>",
        "plan": plan_html or "<li>Continue refining your application.</li>",
        "quote": analysis.get("motivational_quote", "Your potential is limitless."),
        "current_year": datetime.datetime.now().year
    }

    def send_worker():
        print(f"DEBUG: Triggering Official EmailJS for {to_email}...")
        return emailjs.send(template_params)

    result = await run_in_threadpool(send_worker)
    return result

async def test_resend_connection():
    try:
        test_params = {
            "to_email": "test@example.com",
            "job_role": "Software Engineer",
            "ats_score": 85,
            "summary": "This is a test of the premium template.",
            "strengths": "<li style='border-left: 2px solid #c5a059; padding-left: 15px;'>Professional Header</li>",
            "improvements": "<li style='border-left: 2px solid #64748b; padding-left: 15px;'>More Keywords</li>",
            "plan": "<li style='border-left: 2px solid #c5a059; padding-left: 15px;'>Update Skills</li>",
            "quote": "Success is a journey.",
            "current_year": 2026
        }
        return emailjs.send(test_params)
    except Exception as e:
        print(f"Test failed: {e}")
        return None
