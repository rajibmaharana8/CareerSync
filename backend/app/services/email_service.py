from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings
from typing import Dict, List
import datetime

# Email Configuration
conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
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

async def send_resume_feedback_email(to_email: str, analysis: Dict, job_role: str):
    """Generates a detailed HTML email and sends it."""
    
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

    # HTML Template
    # Changes:
    # 1. Wrapped in <center> and used Table-based layout for strict centering.
    # 2. Reverted text colors to Gold (#c5a059) as requested.
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <meta name="x-apple-disable-message-reformatting">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <title>CareerSync Analysis</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
            :root {{
                color-scheme: light dark;
                supported-color-schemes: light dark;
            }}
            
            body {{ margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
            
            /* Dark Mode Overrides */
            @media (prefers-color-scheme: dark) {{
                .body-bg {{ background-color: #0c111d !important; color: #f8fafc !important; }}
                .main-card {{ background-color: #0c111d !important; border-color: #334155 !important; box-shadow: 0 25px 50px rgba(0,0,0,0.5) !important; }}
                
                /* Keep Gold Text in Dark Mode */
                .h1-title, .ats-label, .ats-pct, .section-head, .quote, .strength-mark, .plan-item, .footer-link span {{ 
                    color: #c5a059 !important; 
                }}
                
                .subtitle, .ats-desc, .footer-text, .improve-mark {{ color: #94a3b8 !important; }}
                .divider, .strength-mark, .plan-item {{ background-color: #c5a059 !important; border-color: #c5a059 !important; }}
                
                .ats-box {{ background-color: #151b28 !important; border-color: #c5a059 !important; }}
                .ats-val {{ color: #f8fafc !important; }}
                
                .section-head {{ border-bottom-color: #334155 !important; }}
                .list-item {{ color: #e2e8f0 !important; }}
                
                .tag {{ background-color: #1e293b !important; border-color: #334155 !important; color: #e2e8f0 !important; }}
                .plan-box {{ background-color: #151b28 !important; border-color: #334155 !important; }}
                
                .footer-border {{ border-top-color: #334155 !important; }}
                .social-icon {{ filter: invert(0) !important; }}
            }}
            
            [data-ogsc] .body-bg {{ background-color: #0c111d !important; color: #f8fafc !important; }}
            
            /* Ensure centering on wrappers */
            .wrapper-table {{ width: 100%; border-spacing: 0; }}
            .content-table {{ width: 100%; max-width: 600px; border-spacing: 0; margin: 0 auto; }}
        </style>
    </head>
    <body class="body-bg" style="font-family: 'Inter', sans-serif; line-height: 1.6; margin: 0; padding: 0; width: 100%; background-color: #f8fafc; color: #0f172a;">
        <!-- Center Tag for old email clients -->
        <center style="width: 100%; table-layout: fixed; background-color: #f8fafc; padding-bottom: 40px;" class="body-bg">
            
            <table class="wrapper-table" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                    <td class="body-bg" align="center" style="padding: 20px 0; background-color: #f8fafc;">
                        
                        <!-- Main Content Container Table -->
                        <table class="content-table main-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center" 
                               style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin: 0 auto;">
                            <tr>
                                <td style="padding: 40px 30px; text-align: left;">
                                    
                                    <!-- Header -->
                                    <div style="text-align: center; margin-bottom: 30px;">
                                        <h1 class="h1-title" style="font-family: 'Playfair Display', serif; color: #c5a059; font-size: 32px; margin: 0; letter-spacing: 2px; text-transform: uppercase;">CareerSync</h1>
                                        <p class="subtitle" style="color: #64748b; font-size: 10px; margin-top: 5px; letter-spacing: 3px; text-transform: uppercase;">Executive Performance Report</p>
                                        <div class="divider" style="width: 30px; height: 1px; background: #c5a059; margin: 15px auto;"></div>
                                    </div>

                                    <!-- ATS Score Section -->
                                    <div class="ats-box" style="text-align: center; margin-bottom: 40px; background: #f1f5f9; padding: 40px 20px; border-radius: 20px; border: 1px solid #e2e8f0;">
                                        <p class="ats-label" style="margin: 0 0 10px 0; font-size: 10px; color: #c5a059; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">ATS Compatibility Score</p>
                                        
                                        <div style="margin: 20px 0;">
                                            <span class="ats-val" style="font-size: 80px; font-weight: 700; font-family: 'Playfair Display', serif; color: #0f172a; line-height: 1;">{ats_score}</span>
                                            <span class="ats-pct" style="font-size: 30px; color: #c5a059; vertical-align: top;">%</span>
                                        </div>

                                        <p class="ats-desc" style="color: #475569; font-size: 14px; font-style: italic; margin: 20px auto 0; max-width: 90%; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                                            "{summary}"
                                        </p>
                                    </div>

                                    <!-- Strengths -->
                                    <div style="margin-bottom: 30px;">
                                        <h3 class="section-head" style="font-family: 'Playfair Display', serif; color: #c5a059; font-size: 16px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Proven Strengths</h3>
                                        <ul style="padding-left: 0; list-style-type: none; color: #334155; font-size: 13px; margin: 0;">
                                            {''.join(f"<li class='list-item strength-mark' style='margin-bottom: 10px; padding-left: 15px; border-left: 2px solid #c5a059;'>{item}</li>" for item in detailed_strengths)}
                                        </ul>
                                    </div>

                                    <!-- Refinement -->
                                    <div style="margin-bottom: 30px;">
                                        <h3 class="section-head" style="font-family: 'Playfair Display', serif; color: #c5a059; font-size: 16px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Areas for Refinement</h3>
                                        <ul style="padding-left: 0; list-style-type: none; color: #334155; font-size: 13px; margin: 0;">
                                            {''.join(f"<li class='list-item improve-mark' style='margin-bottom: 10px; padding-left: 15px; border-left: 2px solid #64748b;'>{item}</li>" for item in detailed_improvements)}
                                        </ul>
                                    </div>

                                    <!-- Tech Arch -->
                                    <div style="margin-bottom: 30px;">
                                         <h3 class="section-head" style="font-family: 'Playfair Display', serif; color: #c5a059; font-size: 16px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Technical Architecture</h3>
                                         <div style="text-align: left;">
                                            {''.join(f"<span class='tag' style='display: inline-block; background: #e2e8f0; border: 1px solid #cbd5e1; padding: 5px 10px; border-radius: 4px; font-size: 10px; color: #475569; font-weight: 500; margin: 3px;'>{k}</span>" for k in missing_keywords)}
                                        </div>
                                    </div>

                                    <!-- Action Plan -->
                                     <div style="margin-bottom: 40px;">
                                         <h3 class="section-head" style="font-family: 'Playfair Display', serif; color: #c5a059; font-size: 16px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Strategic Action Plan</h3>
                                         <div class="plan-box" style="background: #f1f5f9; padding: 20px; border-radius: 10px; border: 1px solid #cbd5e1;">
                                            <ul style="padding-left: 0; list-style-type: none; font-size: 13px; margin: 0; color: #334155;">
                                                {''.join(f"<li class='plan-item' style='margin-bottom: 10px; padding-left: 15px; border-left: 2px solid #c5a059;'>{item}</li>" for item in improvement_plan)}
                                            </ul>
                                         </div>
                                    </div>

                                    <!-- Footer -->
                                    <div class="footer-border" style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 30px;">
                                        <p class="quote" style="font-family: 'Playfair Display', serif; font-size: 14px; font-style: italic; color: #c5a059; margin-bottom: 25px;">{motivational_quote}</p>
                                        
                                        <div style="margin-bottom: 20px;">
                                            <a href="https://github.com/rajibmaharana8" class="footer-link" style="text-decoration: none; margin: 0 10px; display: inline-block;">
                                                <img class="social-icon" src="https://img.icons8.com/ios-filled/50/000000/github.png" width="20" height="20" alt="GitHub" style="vertical-align: middle; margin-right: 5px; filter: invert(0);">
                                                <span class="footer-text" style="font-size: 10px; color: #64748b; font-weight: 600; letter-spacing: 1px;">GITHUB</span>
                                            </a>
                                             <a href="https://www.linkedin.com/in/rajib-kumar-maharana-8933632ab/" class="footer-link" style="text-decoration: none; margin: 0 10px; display: inline-block;">
                                                <img class="social-icon" src="https://img.icons8.com/ios-filled/50/000000/linkedin.png" width="20" height="20" alt="LinkedIn" style="vertical-align: middle; margin-right: 5px; filter: invert(0);">
                                                <span class="footer-text" style="font-size: 10px; color: #64748b; font-weight: 600; letter-spacing: 1px;">LINKEDIN</span>
                                            </a>
                                        </div>
                                        
                                        <p class="footer-text" style="font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Created by : Rajib Kumar Maharana | {current_year} </p>
                                        
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

    message = MessageSchema(
        subject=f"Executive Report: {job_role} Portfolio Analysis",
        recipients=[to_email],
        body=html_content,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        print(f"DEBUG: Attempting to send email to {to_email}...")
        await fm.send_message(message)
        print(f"DEBUG: Email sent successfully!")
    except Exception as e:
        print(f"DEBUG: Failed to send email: {str(e)}")
        import traceback
        traceback.print_exc()