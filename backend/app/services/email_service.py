import resend
from app.core.config import settings
from typing import Dict, List
import datetime
import uuid
from fastapi.concurrency import run_in_threadpool

# Configure Resend
resend.api_key = settings.RESEND_API_KEY

def format_list_items(items: List[str]) -> str:
    """Helper to format list items into HTML <li> tags."""
    if not items:
        return "<li>None identified</li>"
    return "".join(f"<li style='margin-bottom: 5px;'>{item}</li>" for item in items)

async def send_resume_feedback_email(to_email: str, analysis: Dict, job_role: str):
    """Generates a detailed HTML email and sends it using Resend API."""
    
    # Extract data safely with defaults
    ats_score = analysis.get("ats_score", 0)
    summary = analysis.get("summary", "No summary provided.")
    missing_keywords = analysis.get("missing_keywords", [])
    detailed_strengths = analysis.get("detailed_strengths", [])
    detailed_improvements = analysis.get("detailed_improvements", [])
    improvement_plan = analysis.get("improvement_plan", [])
    motivational_quote = analysis.get("motivational_quote", "Your potential is limitless.")
    
    email_uid = str(uuid.uuid4())[:8]
    current_year = datetime.datetime.now().year

    # HTML Template
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>CareerSync Analysis</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    </head>
    <body style="font-family: 'Inter', sans-serif; line-height: 1.6; margin: 0; padding: 0; width: 100%; background-color: #f8fafc; color: #0f172a;">
        <center style="width: 100%; table-layout: fixed; background-color: #f8fafc; padding-bottom: 40px;">
            <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                    <td align="center" style="padding: 20px 0; background-color: #f8fafc;">
                        <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" 
                               style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin: 0 auto;">
                            <tr>
                                <td style="padding: 40px 30px; text-align: left;">
                                    
                                    <!-- Header -->
                                    <div style="text-align: center; margin-bottom: 30px;">
                                        <h1 style="font-family: 'Playfair Display', serif; color: #c5a059; font-size: 32px; margin: 0; letter-spacing: 2px; text-transform: uppercase;">CareerSync</h1>
                                        <p style="color: #64748b; font-size: 10px; margin-top: 5px; letter-spacing: 3px; text-transform: uppercase;">Executive Performance Report</p>
                                        <div style="width: 30px; height: 1px; background: #c5a059; margin: 15px auto;"></div>
                                    </div>

                                    <!-- ATS Score Section -->
                                    <div style="text-align: center; margin-bottom: 40px; background: #f1f5f9; padding: 40px 20px; border-radius: 20px; border: 1px solid #e2e8f0;">
                                        <p style="margin: 0 0 10px 0; font-size: 10px; color: #c5a059; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">ATS Compatibility Score</p>
                                        
                                        <div style="margin: 20px 0;">
                                            <span style="font-size: 80px; font-weight: 700; font-family: 'Playfair Display', serif; color: #0f172a; line-height: 1;">{ats_score}</span>
                                            <span style="font-size: 30px; color: #c5a059; vertical-align: top;">%</span>
                                        </div>

                                        <p style="color: #475569; font-size: 14px; font-style: italic; margin: 20px auto 0; max-width: 90%; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                                            "{summary}"
                                        </p>
                                    </div>

                                    <!-- Strengths -->
                                    <div style="margin-bottom: 30px;">
                                        <h3 style="font-family: 'Playfair Display', serif; color: #c5a059; font-size: 16px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Proven Strengths</h3>
                                        <ul style="padding-left: 0; list-style-type: none; color: #334155; font-size: 13px; margin: 0;">
                                            {''.join(f"<li style='margin-bottom: 10px; padding-left: 15px; border-left: 2px solid #c5a059;'>{item}</li>" for item in detailed_strengths)}
                                        </ul>
                                    </div>

                                    <!-- Refinement -->
                                    <div style="margin-bottom: 30px;">
                                        <h3 style="font-family: 'Playfair Display', serif; color: #c5a059; font-size: 16px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Areas for Refinement</h3>
                                        <ul style="padding-left: 0; list-style-type: none; color: #334155; font-size: 13px; margin: 0;">
                                            {''.join(f"<li style='margin-bottom: 10px; padding-left: 15px; border-left: 2px solid #64748b;'>{item}</li>" for item in detailed_improvements)}
                                        </ul>
                                    </div>

                                    <!-- Tech Arch -->
                                    <div style="margin-bottom: 30px;">
                                         <h3 style="font-family: 'Playfair Display', serif; color: #c5a059; font-size: 16px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Technical Architecture</h3>
                                         <div style="text-align: left;">
                                            {''.join(f"<span style='display: inline-block; background: #e2e8f0; border: 1px solid #cbd5e1; padding: 5px 10px; border-radius: 4px; font-size: 10px; color: #475569; font-weight: 500; margin: 3px;'>{k}</span>" for k in missing_keywords)}
                                        </div>
                                    </div>

                                    <!-- Action Plan -->
                                     <div style="margin-bottom: 40px;">
                                         <h3 style="font-family: 'Playfair Display', serif; color: #c5a059; font-size: 16px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Strategic Action Plan</h3>
                                         <div style="background: #f1f5f9; padding: 20px; border-radius: 10px; border: 1px solid #cbd5e1;">
                                            <ul style="padding-left: 0; list-style-type: none; font-size: 13px; margin: 0; color: #334155;">
                                                {''.join(f"<li style='margin-bottom: 10px; padding-left: 15px; border-left: 2px solid #c5a059;'>{item}</li>" for item in improvement_plan)}
                                            </ul>
                                         </div>
                                    </div>

                                    <!-- Footer -->
                                    <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 30px;">
                                        <p style="font-family: 'Playfair Display', serif; font-size: 14px; font-style: italic; color: #c5a059; margin-bottom: 25px;">{motivational_quote}</p>
                                        
                                        <div style="margin-bottom: 20px;">
                                            <a href="https://github.com/rajibmaharana8" style="text-decoration: none; margin: 0 10px; display: inline-block;">
                                                <span style="font-size: 10px; color: #64748b; font-weight: 600; letter-spacing: 1px;">GITHUB</span>
                                            </a>
                                             <a href="https://www.linkedin.com/in/rajib-kumar-maharana-8933632ab/" style="text-decoration: none; margin: 0 10px; display: inline-block;">
                                                <span style="font-size: 10px; color: #64748b; font-weight: 600; letter-spacing: 1px;">LINKEDIN</span>
                                            </a>
                                        </div>
                                        
                                        <p style="font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Created by : Rajib Kumar Maharana | {current_year} </p>
                                        
                                        <!-- Invisible unique ID to prevent Gmail clipping -->
                                        <div style="display:none; opacity:0; font-size:1px; color:transparent; height:0; max-height:0; overflow:hidden;">
                                            Ref ID: {email_uid}
                                        </div>
                                    </div>

                                </td>
                            </tr>
                        </table>
                    
                    </td>
                </tr>
            </table>
        </center>
    </body>
    </html>
    """

    def send_call():
        try:
            print(f"DEBUG: Resend API Key length: {len(settings.RESEND_API_KEY) if settings.RESEND_API_KEY else 0}")
            print(f"DEBUG: Attempting to send email via Resend to {to_email}...")
            
            # Final safety check for from_email
            from_email = settings.MAIL_FROM if settings.MAIL_FROM and "@" in settings.MAIL_FROM else "onboarding@resend.dev"
            
            params = {
                "from": f"CareerSync <{from_email}>",
                "to": [to_email],
                "subject": f"Executive Portfolio Analysis: {job_role}",
                "html": html_content,
            }

            email = resend.Emails.send(params)
            print(f"DEBUG: SUCCESS! Email sent via Resend. Response ID: {email.get('id') if isinstance(email, dict) else 'Unknown'}")
            return email
            
        except Exception as e:
            print(f"DEBUG: ERROR in Resend API call: {str(e)}")
            # Specifically log if it's the "onboarding domain" restriction
            if "onboarding@resend.dev" in str(e) or "403" in str(e):
                print("HINT: If you catch a 403 error, ensure you are sending to YOUR registered Resend email address (the one you used to sign up).")
            raise e

    # Run the blocking Resend call in a background threadpool
    await run_in_threadpool(send_call)
