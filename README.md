# CareerSync 🚀

CareerSync is a comprehensive, AI-powered platform designed to streamline your career journey. From analyzing your resume to preparing for interviews and finding the perfect job, CareerSync provides the tools you need to succeed.

## ✨ Features

*   **📄 AI Resume Analyzer**: Upload your resume (PDF) and get detailed feedback, ATS score, and improvement suggestions using Google Gemini AI.
*   **🤖 Interview Preparation**: Practice answering interview questions with AI-generated feedback to boost your confidence.
*   **🔍 Job Search**: Find relevant job openings tailored to your profile (Integration pending/in-progress).
*   **📧 Email Reports**: Receive detailed analysis reports directly in your inbox.

## 🛠️ Tech Stack

### Frontend
*   **React** (Vite)
*   **React Router** for navigation
*   **Axios** for API requests
*   **CSS/Styled Components** (Standard CSS or styling libraries)

### Backend
*   **FastAPI**: High-performance web framework for building APIs.
*   **PostgreSQL** & **SQLAlchemy**: Robust database management.
*   **LangChain** & **Google Gemini**: Powering the AI features.
*   **PyMuPDF**: For extracting text from PDF resumes.
*   **FastAPI-Mail**: For sending email notifications.
*   **Pydantic**: Data validation and settings management.

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   Python 3.8+
*   Node.js & npm
*   PostgreSQL installed and running
*   Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/rajibmaharana8/CareerSync.git
cd CareerSync
```

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd backend
```

Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Set up Environment Variables:
Create a `.env` file in the `backend` directory and add the following keys:
```env
DATABASE_URL=postgresql://user:password@localhost/dbname
GOOGLE_API_KEY=your_google_api_key
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
MAIL_FROM=your_email
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
SECRET_KEY=your_secret_key
# Add other necessary keys
```

Run the backend server:
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`.

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd ../frontend
```

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```
The application will run at `http://localhost:5173` (default Vite port).

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.