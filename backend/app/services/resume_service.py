import fitz  # PyMuPDF
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings
import json
import re

# Initialize Gemini
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    google_api_key=settings.GOOGLE_API_KEY,
    temperature=0.3
)

async def extract_text_from_pdf(file_content: bytes) -> str:
    """Read PDF bytes and return text."""
    doc = fitz.open(stream=file_content, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

async def analyze_resume_with_llm(resume_text: str, job_role: str) -> dict:
    """Analyzes resume using Gemini and returns JSON with strength/weakness & structure analysis."""
    
    template = """
    Act as a Senior Recruiter specializing in Entry-Level and University Hiring. 
    Analyze this resume for a Fresher/Junior position as a "{job_role}".
    
    SCORING RULES FOR FRESHERS:
    1. 'ats_score': (Integer 0-100). Focus on POTENTIAL and FOUNDATION.
       - 80-100: Exceptional fresher (High-quality projects, strong internships, relevant tech stack).
       - 60-79: Solid foundational skills (Standard academic projects, clear learning path).
       - <60: Lacks hands-on projects, poor skill clarity, or bad formatting.
    2. Do NOT penalize for lack of "years of industry experience". Instead, reward for "Project Complexity" and "Skill Relevance".

    CONTENT GUIDELINES (FRESHER FOCUS):
    - 'summary': 2-3 sophisticated sentences summarizing their technical unique value proposition.
    
    REQUIRED DATA STRUCTURE:
    - 'brief_strengths': Exactly 3 professional points. Each point must be strictly approx 10 words. (FOR WEB DISPLAY).
    - 'brief_improvements': Exactly 3 growth areas. Each point must be strictly approx 10 words. (FOR WEB DISPLAY).
    
    - 'detailed_strengths': Exactly 5 high-impact professional points. Each point must be detailed and analytical (18-20 words). (FOR EMAIL REPORT).
    - 'detailed_improvements': Exactly 5 strategic growth areas. Each point must be detailed and explanatory (18-20 words). (FOR EMAIL REPORT).
    
    - 'missing_keywords': Exactly 6-8 foundational + modern tools.
    - 'improvement_plan': 4-5 specific strategic career steps.
    - 'motivational_quote': A high-caliber, short inspiring quote (10-15 words).

    SCORING REMINDER: Base scores on POTENTIAL and PROJECT COMPLEXITY for a Fresher role. 
    80+ = Industry ready, 60-79 = Strong foundation, <60 = Needs major project work.

    Return a valid JSON object ONLY. No markdown or code blocks.

    Return a valid JSON object ONLY. No markdown.

    Resume Text:
    {resume_text}
    """
    
    prompt = PromptTemplate(template=template, input_variables=["job_role", "resume_text"])
    chain = prompt | llm
    
    try:
        response = await chain.ainvoke({"job_role": job_role, "resume_text": resume_text})
        raw_content = response.content.strip()
    except Exception as e:
        print(f"DEBUG: Gemini API call failed: {str(e)}")
        if "429" in str(e):
            return {
                "ats_score": 0,
                "strong_points": [],
                "weak_areas": [],
                "missing_keywords": [],
                "formatting_issues": ["API Quota Exceeded"],
                "structure_feedback": "Please try again later.",
                "improvement_plan": ["Wait 60 seconds and try again."],
                "summary": "Quota exhausted."
            }
        raise e
    
    # Clean up response to ensure valid JSON
    content = raw_content
    content = re.sub(r"```json|```", "", content).strip()
    try:
        start_idx = content.find('{')
        end_idx = content.rfind('}')
        if start_idx != -1 and end_idx != -1:
            content = content[start_idx:end_idx+1]
    except:
        pass
    
    try:
        parsed_json = json.loads(content)
        return parsed_json
    except json.JSONDecodeError:
        # Fallback
        return {
            "ats_score": 0,
            "strong_points": ["Review your PDF formatting"],
            "weak_areas": [],
            "missing_keywords": [],
            "formatting_issues": ["AI Response Error"],
            "structure_feedback": "Check content order.",
            "improvement_plan": ["Contact support or try another PDF."],
            "summary": "Analysis parsing failed."
        }

async def extract_search_params_from_resume(resume_text: str) -> dict:
    """
    Scans a resume specifically to generate Job Search parameters.
    Does NOT calculate ATS score.
    """
    template = """
    Act as a Job Search Assistant. Read the following resume text and extract the best parameters to search for a new job.
    
    Return a strictly valid JSON object with these keys:
    1. "role": (The most suitable job title for this candidate, e.g., "Senior Backend Engineer")
    2. "experience_level": (e.g., "Entry Level", "Mid Level", "Senior", or "Internship")
    3. "skills": (Top 3 most relevant technical skills for search)
    4. "years_of_experience": (Total years of experience as an integer, e.g., 2)
    
    Resume Text:
    {resume_text}
    """
    
    prompt = PromptTemplate(template=template, input_variables=["resume_text"])
    chain = prompt | llm
    
    response = await chain.ainvoke({"resume_text": resume_text})
    
    content = response.content.strip()
    content = re.sub(r"```json|```", "", content)
    
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "role": "Software Engineer", 
            "experience_level": "Entry Level", 
            "skills": [],
            "years_of_experience": 0
        }