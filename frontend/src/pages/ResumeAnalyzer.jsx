import React, { useState } from 'react';
import { analyzeResume, sendResultsEmail } from '../services/api';

const POPULAR_ROLES = [
    "Software Engineer",
    "Data Scientist",
    "Product Manager",
    "AI/ML Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "UI/UX Designer",
    "Business Analyst",
    "Marketing Manager",
    "Other"
];

const ResumeAnalyzer = () => {
    const [file, setFile] = useState(null);
    const [email, setEmail] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [customRole, setCustomRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [emailStatus, setEmailStatus] = useState("");

    const handleAnalyze = async (e) => {
        e.preventDefault();
        const finalJobRole = selectedRole === "Other" ? customRole : selectedRole;

        if (!file || !email || !finalJobRole) {
            alert("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const data = await analyzeResume(file, email, finalJobRole);
            setResult(data);
        } catch (error) {
            console.error(error);
            alert("Analysis failed. Please check your API quota or backend connectivity.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = async () => {
        if (!result?.id) return;
        try {
            await sendResultsEmail(result.id);
            setEmailStatus("Report successfully delivered to your inbox.");
        } catch (error) {
            setEmailStatus("Failed to send email. Please try again.");
        }
    };

    const Loader = () => (
        <div className="loading-container">
            <div className="scanner-box">
                <div style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    PDF DATA<br />SCANNING...<br />KEYWORDS...<br />ATS_V2...
                </div>
            </div>
            <div className="loading-text">Decrypting Your Expertise...</div>
        </div>
    );

    const ScoreCircle = ({ score }) => {
        const size = 140;
        const center = size / 2; // 70
        const radius = 60; // Visual radius
        const stroke = 8;
        const normalizedRadius = radius - stroke; // Radius correction for stroke
        const circumference = normalizedRadius * 2 * Math.PI;
        const strokeDashoffset = circumference - (score / 100) * circumference;

        return (
            <div className="score-circle-container">
                <svg className="score-circle-svg" viewBox={`0 0 ${size} ${size}`}>
                    <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="var(--primary)" />
                            <stop offset="100%" stopColor="#d4af37" />
                        </linearGradient>
                    </defs>
                    <circle
                        className="score-circle-bg"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={center}
                        cy={center}
                    />
                    <circle
                        className="score-circle-progress"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset }}
                        r={normalizedRadius}
                        cx={center}
                        cy={center}
                    />
                </svg>
                <div className="score-text serif-title">{score}</div>
            </div>
        );
    };

    return (
        <div className="analyzer-wrapper">

            {loading ? (
                <div className="step-card">
                    <Loader />
                </div>
            ) : !result ? (
                <form onSubmit={handleAnalyze} className="stepped-form">
                    {/* Step 01: Upload */}
                    <div className="step-card">
                        <span className="step-number">STEP 01. UPLOAD</span>
                        <h2 className="step-title serif-title">Initialize Resume Scan</h2>
                        <div className="upload-zone" onClick={() => document.getElementById('resume-upload').click()}>
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '15px' }}>
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                            </svg>
                            <p style={{ color: file ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '0.95rem' }}>
                                {file ? file.name : 'Choose a professional PDF'}
                            </p>
                            <input id="resume-upload" type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} required />
                        </div>
                    </div>

                    {/* Step 02: Details */}
                    <div className="step-card">
                        <span className="step-number">STEP 02. TARGETING</span>
                        <h2 className="step-title serif-title">Target Role & Distribution</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="secure-input-wrapper">
                                <input
                                    type="email"
                                    className="input-field"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your professional email"
                                    required
                                />
                            </div>

                            <select
                                className="input-field"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                required
                            >
                                <option value="" disabled hidden>Select Your Domain</option>
                                {POPULAR_ROLES.map((role) => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>

                            {selectedRole === "Other" && (
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. Senior Frontend Developer"
                                    value={customRole}
                                    onChange={(e) => setCustomRole(e.target.value)}
                                    required
                                />
                            )}
                        </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <button type="submit" disabled={loading} className="pill-button">
                            {loading ? "PROCESSING..." : "PROCESS RESUME"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="result-flow">
                    <div className="step-card" style={{ textAlign: 'center' }}>
                        <span className="step-number">EXECUTIVE SUMMARY</span>
                        <h2 className="step-title serif-title">Analytical Performance Results</h2>

                        <ScoreCircle score={result.ats_score} />

                        <div className="section-divider"></div>

                        <div className="report-grid" style={{ textAlign: 'left', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px' }}>
                            <div className="report-card">
                                <h3 className="serif-title" style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800' }}>Strengths</h3>
                                <ul style={{ fontSize: '0.9rem', paddingLeft: '0', listStyleType: 'none', color: 'var(--text-main)' }}>
                                    {(result.analysis_json?.brief_strengths || []).map((pt, i) => (
                                        <li key={i} style={{ marginBottom: '12px', paddingLeft: '15px', borderLeft: '2px solid var(--primary)', lineHeight: '1.5' }}>{pt}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="report-card">
                                <h3 className="serif-title" style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800' }}>Refinements</h3>
                                <ul style={{ fontSize: '0.9rem', paddingLeft: '0', listStyleType: 'none', color: 'var(--text-main)' }}>
                                    {(result.analysis_json?.brief_improvements || []).map((pt, i) => (
                                        <li key={i} style={{ marginBottom: '12px', paddingLeft: '15px', borderLeft: '2px solid var(--secondary)', lineHeight: '1.5' }}>{pt}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="section-divider"></div>

                        <div style={{ textAlign: 'left' }}>
                            <h3 className="serif-title" style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800', textAlign: 'center' }}>Strategic Roadmap</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                                {(result.analysis_json?.missing_keywords || []).map((k, i) => (
                                    <span key={i} className="tag" style={{ background: 'var(--glass-bg)', color: 'var(--primary)', border: '1px solid var(--border)', padding: '6px 15px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '600' }}>{k}</span>
                                ))}
                            </div>
                        </div>

                        {result.ats_score === 0 && (
                            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--tag-danger)', borderRadius: '12px', fontSize: '0.85rem', color: '#ef4444' }}>
                                <strong>Notice:</strong> Score 0 usually indicates a parsing error or empty PDF content. Please ensure your PDF contains searchable text.
                            </div>
                        )}

                        <div style={{ marginTop: '40px', fontStyle: 'italic', color: 'var(--primary)', fontSize: '1rem', maxWidth: '450px', margin: '40px auto', opacity: 0.9 }}>
                            "{result.analysis_json?.motivational_quote || "Your potential is limitless."}"
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                            <button onClick={handleSendEmail} className="pill-button">
                                RE-SEND DETAILED REPORT
                            </button>
                        </div>

                        {emailStatus && (
                            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                                <p style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.8rem', letterSpacing: '1px' }}>
                                    {emailStatus.toUpperCase()}
                                </p>
                            </div>
                        )}

                        <div style={{ textAlign: 'center' }}>
                            <button onClick={() => setResult(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', marginTop: '20px', cursor: 'pointer', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}>
                                NEW ANALYSIS
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default ResumeAnalyzer;