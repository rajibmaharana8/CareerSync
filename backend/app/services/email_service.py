from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings
from typing import Dict, List
import datetime

# Email Configuration
import socket

def get_ipv4_address(hostname: str) -> str:
    try:
        # Resolve to IPv4 (AF_INET)
        ip = socket.gethostbyname(hostname)
        print(f"DEBUG: Resolved {hostname} to {ip}")
        return ip
    except Exception as e:
        print(f"DEBUG: Failed to resolve {hostname}: {e}")
        return hostname

# Email Configuration
# Resolving IP to valid IPv4 to avoid Render IPv6 Timeouts
smtp_host = get_ipv4_address("smtp.gmail.com")

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=587,
    MAIL_SERVER=smtp_host,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

def format_list_items(items: List[str]) -> str:
    """Helper to format list items into HTML <li> tags."""
    if not items:
        return "<li>None identified</li>"
    return "".join(f"<li style='margin-bottom: 5px;'>{item}</li>" for item in items)

import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi.concurrency import run_in_threadpool

# Remove fastapi_mail imports if no longer needed for other things, 
# or keep them if used elsewhere. For this function, we don't need them.

async def send_resume_feedback_email(to_email: str, analysis: Dict, job_role: str):
    """Generates a detailed HTML email and sends it using standard smtplib."""
    
    # Extract data safely with defaults
    ats_score = analysis.get("ats_score", 0)
    summary = analysis.get("summary", "No summary provided.")
    missing_keywords = analysis.get("missing_keywords", [])
    detailed_strengths = analysis.get("detailed_strengths", [])
    detailed_improvements = analysis.get("detailed_improvements", [])
    improvement_plan = analysis.get("improvement_plan", [])
    motivational_quote = analysis.get("motivational_quote", "Your potential is limitless.")
    
    # Generate unique ID
    import uuid
    email_uid = str(uuid.uuid4())[:8]
    current_year = datetime.datetime.now().year

    # HTML Template (Reused)
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>CareerSync Analysis</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <!-- Styles preserved from previous version -->
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

    def send_sync():
        try:
            print(f"DEBUG: Connecting to {settings.MAIL_SERVER} on port 465 (SSL)...")
            
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"Executive Report: {job_role} Portfolio Analysis"
            msg["From"] = settings.MAIL_FROM
            msg["To"] = to_email

            msg.attach(MIMEText(html_content, "html"))

            # Create secure SSL context
            context = ssl.create_default_context()
            
            # Use SMTP_SSL for Port 465
            with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context, timeout=30) as server:
                print("DEBUG: Connected. Logging in...")
                server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
                print("DEBUG: Logged in. Sending mail...")
                server.send_message(msg)
                print("DEBUG: Email sent successfully via smtplib!")
                
        except Exception as e:
            print(f"❌ Custom SMTP Error: {str(e)}")
            raise e

    # Run blocking SMTP call in a thread to avoid blocking asyncio loop
    await run_in_threadpool(send_sync)