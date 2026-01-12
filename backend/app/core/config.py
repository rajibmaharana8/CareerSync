from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareerSync"
    
    # Secrets from .env
    DATABASE_URL: str
    GOOGLE_API_KEY: str
    SERPAPI_KEY: str = ""
    
    # Email Config
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    RESEND_API_KEY: str = ""
    BREVO_API_KEY: str = ""
    
    # EmailJS Config (New)
    EMAILJS_SERVICE_ID: str = ""
    EMAILJS_TEMPLATE_ID: str = ""
    EMAILJS_PUBLIC_KEY: str = ""
    EMAILJS_PRIVATE_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore" 

settings = Settings()