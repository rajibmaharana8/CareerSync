import requests
from app.core.config import settings

class EmailJS:
    """
    Official EmailJS-style Python SDK for CareerSync.
    This uses the EmailJS.com REST API directly.
    """
    def __init__(self):
        # These should be in your .env
        self.service_id = getattr(settings, "EMAILJS_SERVICE_ID", "")
        self.template_id = getattr(settings, "EMAILJS_TEMPLATE_ID", "")
        self.public_key = getattr(settings, "EMAILJS_PUBLIC_KEY", "")
        self.private_key = getattr(settings, "EMAILJS_PRIVATE_KEY", "")

    def send(self, template_params: dict):
        """
        Mimics the official emailjs.send() behavior.
        """
        url = "https://api.emailjs.com/api/v1.0/email/send"
        
        payload = {
            "service_id": self.service_id,
            "template_id": self.template_id,
            "user_id": self.public_key,
            "template_params": template_params,
            "accessToken": self.private_key # Required for server-side sending
        }

        try:
            response = requests.post(url, json=payload)
            if response.status_code == 200:
                print(f"✅ EmailJS Success: {response.text}")
                return {"status": "success", "message": "Email sent via EmailJS"}
            else:
                print(f"❌ EmailJS Error: {response.status_code} - {response.text}")
                return {"status": "error", "message": response.text}
        except Exception as e:
            print(f"❌ EmailJS Exception: {str(e)}")
            return {"status": "error", "message": str(e)}

# Singleton instance
emailjs = EmailJS()
