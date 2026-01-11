import axios from 'axios';

// Point to your Backend URL (Use Env Var for Vercel/Render)
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

// --- RESUME ANALYZER APIs ---
export const analyzeResume = async (file, email, jobRole) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);
    formData.append("job_role", jobRole);

    const response = await axios.post(`${API_URL}/resume/analyze`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const sendResultsEmail = async (resumeId) => {
    const response = await axios.post(`${API_URL}/resume/send-email/${resumeId}`);
    return response.data;
};

// --- JOB SEARCH APIs ---

export const manualJobSearch = async (role, location, experience, timeRange, platforms) => {
    // Construct query parameters
    const params = new URLSearchParams({
        role: role,
        location: location || "Remote",
    });
    if (experience) params.append("experience", experience);
    if (timeRange) params.append("time_range", timeRange);
    if (platforms && platforms.length > 0) {
        params.append("platforms", platforms.join(","));
    }

    const response = await axios.get(`${API_URL}/jobs/manual-search?${params.toString()}`);
    return response.data;
};

export const searchJobsByResume = async (file, location, timeRange) => {
    const formData = new FormData();
    formData.append("file", file);

    // Add params to URL
    let url = `${API_URL}/jobs/search-by-resume?location=${location || "Remote"}`;
    if (timeRange) url += `&time_range=${timeRange}`;

    const response = await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const saveJob = async (jobData) => {
    const response = await axios.post(`${API_URL}/jobs/save`, jobData);
    return response.data;
};

export const getSavedJobs = async (email) => {
    const response = await axios.get(`${API_URL}/jobs/saved/${email}`);
    return response.data;
};

export const removeSavedJob = async (jobId) => {
    const response = await axios.delete(`${API_URL}/jobs/saved/${jobId}`);
    return response.data;
};

// --- INTERVIEW APIS ---

export const startInterview = async (email, jobRole, difficulty) => {
    const response = await axios.post(`${API_URL}/interview/start`, {
        user_email: email,
        job_role: jobRole,
        difficulty: difficulty
    });
    return response.data; // Returns { session_id, message }
};

export const sendChatMessage = async (sessionId, userAnswer) => {
    const response = await axios.post(`${API_URL}/interview/chat`, {
        session_id: sessionId,
        user_answer: userAnswer
    });
    return response.data; // Returns { message } (The AI's reply)
};
