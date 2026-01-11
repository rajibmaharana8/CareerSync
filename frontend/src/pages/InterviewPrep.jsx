import React, { useState, useRef, useEffect } from 'react';
import { startInterview, sendChatMessage } from '../services/api';

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

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const InterviewPrep = () => {
    // Session State
    const [step, setStep] = useState(1); // 1 = Setup, 2 = Chat
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Form Inputs
    const [email, setEmail] = useState("");
    const [jobRole, setJobRole] = useState("");
    const [customRole, setCustomRole] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");

    // Chat State
    const [messages, setMessages] = useState([]); // Array of { sender: 'ai'|'user', text: '' }
    const [input, setInput] = useState("");
    const [showEndModal, setShowEndModal] = useState(false);

    // Auto-scroll to bottom
    const chatEndRef = useRef(null);
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load email from localStorage
    useEffect(() => {
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail) setEmail(storedEmail);
    }, []);

    // --- HANDLERS ---

    const handleStart = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            localStorage.setItem('userEmail', email);
            const finalJobRole = jobRole === "Other" ? customRole : jobRole;
            const data = await startInterview(email, finalJobRole, difficulty);
            setSessionId(data.session_id);
            setMessages([{ sender: 'ai', text: data.message }]);
            setStep(2); // Move to Chat Screen
        } catch (error) {
            console.error(error);
            alert("Failed to start interview. Please check your backend connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userText = input;
        setInput(""); // Clear input

        // Add User Message immediately
        setMessages(prev => [...prev, { sender: 'user', text: userText }]);
        setLoading(true);

        try {
            const data = await sendChatMessage(sessionId, userText);
            // Add AI Response
            setMessages(prev => [...prev, { sender: 'ai', text: data.message }]);
        } catch (error) {
            console.error(error);
            alert("Error sending message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleEndSession = () => {
        setStep(1);
        setShowEndModal(false);
        setSessionId(null);
        setMessages([]);
    };

    // --- MODAL COMPONENTS ---
    const EndSessionModal = () => {
        if (!showEndModal) return null;

        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
            }}>
                <div className="step-card" style={{ maxWidth: '450px', width: '100%', margin: 0, textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
                    <h2 className="serif-title" style={{ fontSize: '1.8rem', marginBottom: '15px' }}>End Interview?</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '30px', lineHeight: '1.6' }}>
                        Your progress will be saved in your history. Are you sure you want to terminate this session?
                    </p>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button
                            onClick={handleEndSession}
                            className="pill-button"
                            style={{ flex: 1, background: 'var(--primary-gradient)', color: '#0c111d' }}
                        >
                            YES, END
                        </button>
                        <button
                            onClick={() => setShowEndModal(false)}
                            className="pill-button"
                            style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', boxShadow: 'none' }}
                        >
                            CANCEL
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="analyzer-wrapper">
            <h1 className="serif-title" style={{ textAlign: 'center', marginBottom: '40px' }}>
                AI Mock Interview
            </h1>

            {/* STEP 1: SETUP SCREEN */}
            {step === 1 && (
                <div className="result-flow">
                    <form onSubmit={handleStart} className="stepped-form">
                        <div className="step-card">
                            <span className="step-number">STEP 01. IDENTIFICATION</span>
                            <h2 className="step-title serif-title">Enter Your Details</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div className="secure-input-wrapper">
                                    <input
                                        type="email"
                                        className="input-field"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="Enter your professional email"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="step-card">
                            <span className="step-number">STEP 02. TARGETING</span>
                            <h2 className="step-title serif-title">Set Your Role & Difficulty</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <select
                                    className="input-field"
                                    value={jobRole}
                                    onChange={e => setJobRole(e.target.value)}
                                    required
                                >
                                    <option value="" disabled hidden>Select Your Domain</option>
                                    {POPULAR_ROLES.map((role) => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>

                                {jobRole === "Other" && (
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. Senior Frontend Developer"
                                        value={customRole}
                                        onChange={(e) => setCustomRole(e.target.value)}
                                        required
                                    />
                                )}

                                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    {DIFFICULTIES.map((diff) => (
                                        <button
                                            key={diff}
                                            type="button"
                                            onClick={() => setDifficulty(diff)}
                                            className="pill-button"
                                            style={{
                                                background: difficulty === diff ? 'var(--primary-gradient)' : 'transparent',
                                                color: difficulty === diff ? '#0c111d' : 'var(--text-main)',
                                                border: difficulty === diff ? 'none' : '1px solid var(--border)',
                                                boxShadow: difficulty === diff ? '0 4px 15px rgba(197, 160, 89, 0.3)' : 'none',
                                                padding: '10px 25px',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            {diff.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <button type="submit" disabled={loading} className="pill-button">
                                {loading ? "INITIALIZING AI..." : "START INTERVIEW"}
                            </button>
                        </div>
                    </form>
                </div >
            )}

            {/* STEP 2: CHAT SCREEN */}
            {
                step === 2 && (
                    <div className="step-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <div>
                                <span className="step-number">LIVE INTERVIEW</span>
                                <h2 className="step-title serif-title" style={{ marginTop: '10px' }}>
                                    {jobRole} — <span style={{ color: 'var(--primary)' }}>{difficulty}</span>
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowEndModal(true)}
                                className="pill-button"
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #e74c3c',
                                    color: '#e74c3c',
                                    padding: '8px 20px',
                                    fontSize: '0.75rem',
                                    boxShadow: 'none'
                                }}
                            >
                                END SESSION
                            </button>
                        </div>

                        <div style={{
                            background: 'var(--input-bg)',
                            borderRadius: '12px',
                            padding: '20px',
                            minHeight: '450px',
                            maxHeight: '550px',
                            overflowY: 'auto',
                            marginBottom: '20px',
                            border: '1px solid var(--border)'
                        }}>
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    style={{
                                        marginBottom: '20px',
                                        display: 'flex',
                                        justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div style={{
                                        maxWidth: '80%',
                                        padding: '15px 20px',
                                        borderRadius: '16px',
                                        background: msg.sender === 'user' ? 'var(--primary-gradient)' : 'var(--glass-bg)',
                                        color: msg.sender === 'user' ? '#0c111d' : 'var(--text-main)',
                                        border: msg.sender === 'user' ? 'none' : '1px solid var(--border)',
                                        boxShadow: msg.sender === 'user' ? '0 4px 15px rgba(197, 160, 89, 0.2)' : 'none'
                                    }}>
                                        <div style={{
                                            fontSize: '0.65rem',
                                            marginBottom: '6px',
                                            opacity: 0.7,
                                            textTransform: 'uppercase',
                                            letterSpacing: '1.5px',
                                            fontWeight: '800'
                                        }}>
                                            {msg.sender === 'user' ? 'Candidate' : 'AI Interviewer'}
                                        </div>
                                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div style={{ textAlign: 'left', color: 'var(--primary)', fontStyle: 'italic', margin: '10px', fontSize: '0.9rem' }}>
                                    AI is analyzing and responding...
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSend} style={{ display: 'flex', gap: '15px' }}>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Type your answer professionally..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                disabled={loading}
                                autoFocus
                                style={{ flex: 1 }}
                            />
                            <button
                                type="submit"
                                className="pill-button"
                                disabled={loading || !input.trim()}
                                style={{ minWidth: '120px' }}
                            >
                                SEND
                            </button>
                        </form>
                    </div>
                )
            }
            {/* END SESSION MODAL */}
            <EndSessionModal />
        </div >
    );
};

export default InterviewPrep;
