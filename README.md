# CareerSync: AI-Powered Career Assistant

> **Optimize your resume, find your dream job, and ace the interview—all in one place.**

CareerSync is a full-stack AI application designed to streamline the entire job search lifecycle. It leverages Google's **Gemini LLM** to provide intelligent resume analysis, automated job matching, and realistic AI mock interviews.

---

## Features

### 1. AI Resume Analyzer
* **ATS Scoring:** Upload your PDF resume to get a match score (0-100%) against a specific job description.
* **Detailed Feedback:** Receive AI-generated insights on missing keywords, formatting errors, and structural improvements.
* **Email Reports:** Automatically sends a detailed analysis report to your email.

### 2. Smart Job Search
* **Manual Search:** Search for jobs by Role, Location, and Experience with advanced time filters (Past 24h, Week, Month).
* **Powered by SerpAPI:** Fetches real-time job listings from across the web via Google Jobs integration.
* **Rich Job Details:** View salaries, job types, and direct application links.

### 3. AI Mock Interviewer
* **Context-Aware Chat:** An interactive AI agent acts as a technical interviewer based on your target role and difficulty level.
* **Real-Time Feedback:** Get immediate ratings and constructive criticism on your answers.
* **Session History:** Review past interview transcripts to track your progress.

---

## Tech Stack

### Frontend
* **React.js (Vite):** Fast and modern UI library.
* **React Router:** For seamless navigation between modules.
* **Axios:** For handling API requests.
* **CSS / Tailwind:** Modern styling for a responsive design.

### Backend
* **FastAPI (Python):** High-performance web framework for APIs.
* **LangChain:** Orchestrates the AI logic and chat history.
* **Google Gemini (1.5 Flash):** The LLM powering the intelligence.
* **PostgreSQL:** Robust relational database for storing saved jobs and interview sessions (via `psycopg2`).
* **SerpAPI:** Fetches real-time job listings.
* **PyMuPDF:** Efficient PDF text extraction for resume analysis.
* **FastAPI-Mail:** Handles automated email notifications.

---

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
* Node.js & npm installed
* Python 3.9+ installed
* PostgreSQL service running

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
# Database
DATABASE_URL=postgresql://user:password@localhost/dbname

# AI & Search
GOOGLE_API_KEY=your_google_api_key
SERPAPI_KEY=your_serpapi_key

# Email Service
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_email
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
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
The application will run at `http://localhost:5173`.

---

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License.