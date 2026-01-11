import React, { useState, useEffect } from 'react';
import { manualJobSearch, searchJobsByResume, saveJob, getSavedJobs, removeSavedJob } from '../services/api';

// Email Modal Component
const EmailModal = ({ isOpen, onClose, onSubmit, title, message }) => {
    const [email, setEmail] = useState('');

    useEffect(() => {
        // Pre-fill with stored email if available
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail) setEmail(storedEmail);
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email) {
            localStorage.setItem('userEmail', email); // Remember email
            onSubmit(email);
            onClose();
        }
    };

    if (!isOpen) return null;

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
        }} onClick={onClose}>
            <div className="step-card" style={{
                maxWidth: '500px',
                width: '100%',
                margin: 0
            }} onClick={(e) => e.stopPropagation()}>
                <span className="step-number">{title || "EMAIL REQUIRED"}</span>
                <h2 className="step-title serif-title" style={{ marginBottom: '20px' }}>
                    {message || "Enter Your Email"}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="secure-input-wrapper" style={{ marginBottom: '20px' }}>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your professional email"
                            required
                            autoFocus
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button type="submit" className="pill-button" style={{ flex: 1 }}>
                            CONTINUE
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="pill-button"
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: '1px solid var(--border)',
                                color: 'var(--text-main)',
                                boxShadow: 'none'
                            }}
                        >
                            CANCEL
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const JobSearch = () => {
    const [activeTab, setActiveTab] = useState('search'); // 'search' or 'saved'
    const [searchMode, setSearchMode] = useState('manual'); // 'manual' or 'ai-search'

    const [jobs, setJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [displayCount, setDisplayCount] = useState(10); // For "View More" functionality

    // Modal State
    const [emailModal, setEmailModal] = useState({ isOpen: false, action: null, jobData: null });
    const [viewingJob, setViewingJob] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, jobId: null });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' }); // New Toast State

    // Form State
    const [role, setRole] = useState("");
    const [customRole, setCustomRole] = useState("");
    const [location, setLocation] = useState("Remote");
    const [customLocation, setCustomLocation] = useState("");
    const [experience, setExperience] = useState("");
    const [timeRange, setTimeRange] = useState(""); // '', 'today', '3days', 'week', 'month'
    const [file, setFile] = useState(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState(["LinkedIn", "Indeed", "Glassdoor", "Monster", "ZipRecruiter"]);

    const ALL_PLATFORMS = ["LinkedIn", "Indeed", "Glassdoor", "Monster", "ZipRecruiter"];

    // --- Toast Helper ---
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // --- Actions ---

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setJobs([]);
        setDisplayCount(10); // Reset display count

        try {
            let results;
            const finalLocation = location === "Other" ? customLocation : location;
            if (searchMode === 'manual') {
                const finalRole = role === "Other" ? customRole : role;
                console.log('Searching with:', { finalRole, location: finalLocation, experience, timeRange, selectedPlatforms });
                results = await manualJobSearch(finalRole, finalLocation, experience, timeRange, selectedPlatforms);
            } else {
                if (!file) return alert("Please upload a resume first.");
                results = await searchJobsByResume(file, finalLocation, timeRange);
            }
            console.log('Search results:', results);
            console.log('Number of jobs found:', results?.length || 0);

            if (!results || results.length === 0) {
                showToast("No jobs found for this search.", "error");
            }

            // SMART SORTING: Latest first + Top Companies
            const TOP_COMPANIES = ["google", "microsoft", "amazon", "meta", "facebook", "apple", "netflix", "uber", "airbnb", "linkedin", "adobe", "salesforce", "twitter", "x", "spotify", "bytedance", "tiktok", "walmart", "goldman sachs", "jpmorgan", "tesla", "spacex", "nvidia", "intel", "ibm"];

            const getSortScore = (job) => {
                let score = 0;
                const posted = job.posted_at?.toLowerCase() || "";
                const company = job.company_name?.toLowerCase() || "";

                // Timeliness (Higher is better)
                if (posted.includes("hour") || posted.includes("minute") || posted.includes("recently")) score += 100;
                else if (posted.includes("1 day")) score += 80;
                else if (posted.includes("2 day")) score += 70;
                else if (posted.includes("3 day")) score += 60;
                else if (posted.includes("week")) score += 30;

                // Prestige
                if (TOP_COMPANIES.some(tc => company.includes(tc))) score += 50;
                if (job.is_verified) score += 10;

                return score;
            };

            const sortedResults = (results || []).sort((a, b) => getSortScore(b) - getSortScore(a));
            setJobs(sortedResults);
        } catch (error) {
            console.error('Search error:', error);
            showToast("Search failed. " + error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveJob = (job) => {
        setEmailModal({
            isOpen: true,
            action: 'save',
            jobData: job
        });
    };

    const handleSaveJobWithEmail = async (email) => {
        const job = emailModal.jobData;
        try {
            const response = await saveJob({
                user_email: email,
                title: job.title,
                company_name: job.company_name,
                location: job.location,
                apply_link: job.apply_link,
                platform: job.platform
            });

            if (response.message === "Job already saved") {
                showToast("Job Already Saved", "error");
            } else {
                showToast("Job Saved Successfully!");
            }
        } catch (error) {
            showToast("Could not save job.", "error");
        }
    };

    const handleViewSaved = () => {
        setActiveTab('saved');
        setEmailModal({
            isOpen: true,
            action: 'viewSaved',
            jobData: null
        });
    };

    const handleViewSavedWithEmail = async (email) => {
        setLoading(true);
        try {
            const results = await getSavedJobs(email);
            // Sort by ID descending (Latest first)
            const sortedResults = (results || []).sort((a, b) => b.id - a.id);
            setSavedJobs(sortedResults);
        } catch (error) {
            showToast("Failed to fetch saved jobs.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEmailModalSubmit = (email) => {
        if (emailModal.action === 'save') {
            handleSaveJobWithEmail(email);
        } else if (emailModal.action === 'viewSaved') {
            handleViewSavedWithEmail(email);
        }
    };

    const handleViewMore = () => {
        setDisplayCount(prev => prev + 10);
    };

    const handleRemoveJob = async (jobId) => {
        setDeleteModal({ isOpen: true, jobId });
    };

    const confirmRemoveJob = async () => {
        try {
            await removeSavedJob(deleteModal.jobId);
            setSavedJobs(prev => prev.filter(j => j.id !== deleteModal.jobId));
            setDeleteModal({ isOpen: false, jobId: null });
            showToast("Job removed successfully.");
        } catch (error) {
            console.error(error);
            showToast("Failed to remove job.", "error");
        }
    };

    // Job Details Modal Component
    const JobDetailsModal = ({ job, onClose }) => {
        if (!job) return null;

        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(15px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                padding: '20px'
            }} onClick={onClose}>
                <div className="step-card" style={{
                    maxWidth: '800px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    margin: 0,
                    position: 'relative',
                    padding: '40px'
                }} onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            fontSize: '2rem',
                            cursor: 'pointer',
                            lineHeight: 1
                        }}
                    >&times;</button>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px' }}>
                        {job.thumbnail ?
                            <img src={job.thumbnail} alt="logo" style={{ height: '60px', borderRadius: '12px', background: '#fff', padding: '5px' }} />
                            : <div style={{ height: '60px', width: '60px', background: 'var(--input-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: '1px solid var(--border)' }}>🏢</div>
                        }
                        <div>
                            <h2 className="serif-title" style={{ fontSize: '1.8rem', marginBottom: '5px' }}>{job.title}</h2>
                            <p style={{ color: 'var(--primary)', fontWeight: '600' }}>{job.company_name} • {job.location}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
                        <div className="tag" style={{ background: 'rgba(197, 160, 89, 0.1)', color: 'var(--primary)', padding: '8px 15px' }}>
                            💰 {job.salary || "Salary Not Disclosed"}
                        </div>
                        <div className="tag" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', padding: '8px 15px' }}>
                            💼 {job.job_type || "Full Time"}
                        </div>
                        <div className="tag" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', padding: '8px 15px' }}>
                            🌐 {job.platform}
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '30px' }}>
                        <h3 className="serif-title" style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--text-main)' }}>📋 Job Description</h3>
                        <div style={{
                            color: 'var(--text-muted)',
                            lineHeight: '1.8',
                            fontSize: '1rem',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '500px',
                            overflowY: 'auto',
                            paddingRight: '10px'
                        }}>
                            {job.description}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Delete Confirmation Modal
    const DeleteJobModal = () => {
        if (!deleteModal.isOpen) return null;

        return (
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3000,
                padding: '20px'
            }}>
                <div className="step-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
                        </svg>
                    </div>
                    <h2 className="serif-title" style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Remove Saved Job?</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.95rem' }}>
                        This job will be removed from your saved list. You can always find it again via search.
                    </p>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button
                            onClick={confirmRemoveJob}
                            className="pill-button"
                            style={{ flex: 1, background: '#e74c3c', color: '#fff', border: 'none' }}
                        >
                            REMOVE
                        </button>
                        <button
                            onClick={() => setDeleteModal({ isOpen: false, jobId: null })}
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

    // Toast Component
    const Toast = () => {
        if (!toast.show) return null;
        return (
            <div style={{
                position: 'fixed',
                top: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: toast.type === 'success' ? 'var(--primary-gradient)' : '#e74c3c',
                color: toast.type === 'success' ? '#0c111d' : '#fff',
                padding: '12px 30px',
                borderRadius: '50px',
                zIndex: 6000,
                boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                fontSize: '0.85rem',
                fontWeight: '800',
                letterSpacing: '1px',
                animation: 'slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none'
            }}>
                {toast.message.toUpperCase()}
            </div>
        );
    };

    // --- Render Helpers ---
    const currentJobs = activeTab === 'saved' ? savedJobs : jobs;
    const displayedJobs = currentJobs.slice(0, displayCount);
    const hasMore = displayCount < currentJobs.length;

    return (
        <div className="analyzer-wrapper">
            {/* Email Modal */}
            <EmailModal
                isOpen={emailModal.isOpen}
                onClose={() => setEmailModal({ isOpen: false, action: null, jobData: null })}
                onSubmit={handleEmailModalSubmit}
                title={emailModal.action === 'save' ? "SAVE JOB" : "VIEW SAVED JOBS"}
                message={emailModal.action === 'save' ? "Enter your email to save this job" : "Enter your email to view saved jobs"}
            />

            {/* TOP NAVIGATION */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px', gap: '20px' }}>
                <button
                    onClick={() => setActiveTab('search')}
                    className="pill-button"
                    style={{
                        opacity: activeTab === 'search' ? 1 : 0.6,
                        background: activeTab === 'search' ? 'var(--primary-gradient)' : 'var(--glass-bg)',
                        color: activeTab === 'search' ? '#0c111d' : 'var(--text-main)'
                    }}
                >
                    FIND JOBS
                </button>
                <button
                    onClick={handleViewSaved}
                    className="pill-button"
                    style={{
                        opacity: activeTab === 'saved' ? 1 : 0.6,
                        background: activeTab === 'saved' ? 'var(--primary-gradient)' : 'var(--glass-bg)',
                        color: activeTab === 'saved' ? '#0c111d' : 'var(--text-main)'
                    }}
                >
                    SAVED JOBS
                </button>
            </div>

            {/* SEARCH SECTION */}
            {activeTab === 'search' && (
                <div className="step-card">
                    {/* Method Toggle */}
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '35px', borderBottom: '1px solid var(--border)', paddingBottom: '25px', flexWrap: 'wrap' }}>
                        {[
                            { id: 'manual', label: 'MANUAL SEARCH', icon: '🔍' },
                            { id: 'ai-search', label: 'AI SEARCH', icon: '✨' }
                        ].map((mode) => (
                            <label
                                key={mode.id}
                                style={{
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 24px',
                                    borderRadius: '100px',
                                    border: `1.5px solid ${searchMode === mode.id ? 'var(--primary)' : 'var(--border)'}`,
                                    background: searchMode === mode.id ? 'rgba(197, 160, 89, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                                    color: searchMode === mode.id ? 'var(--primary)' : 'var(--text-muted)',
                                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                    boxShadow: searchMode === mode.id ? '0 0 20px rgba(197, 160, 89, 0.15)' : 'none'
                                }}
                            >
                                <input
                                    type="radio"
                                    checked={searchMode === mode.id}
                                    onChange={() => setSearchMode(mode.id)}
                                    style={{ display: 'none' }}
                                />
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    border: `2px solid ${searchMode === mode.id ? 'var(--primary)' : 'var(--text-muted)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease',
                                    background: searchMode === mode.id ? 'transparent' : 'rgba(0,0,0,0.1)'
                                }}>
                                    {searchMode === mode.id && (
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            background: 'var(--primary)',
                                            boxShadow: '0 0 10px var(--primary)'
                                        }}></div>
                                    )}
                                </div>
                                <span style={{ fontWeight: '800', letterSpacing: '1.2px', fontSize: '0.8rem' }}>
                                    {mode.label}
                                </span>
                            </label>
                        ))}
                    </div>

                    <form onSubmit={handleSearch}>
                        {searchMode === 'manual' ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' }}>
                                <div>
                                    <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>TARGET ROLE</label>
                                    <select className="input-field" value={role} onChange={e => setRole(e.target.value)} style={{ cursor: 'pointer' }} required>
                                        <option value="" disabled hidden>Select Your Domain</option>
                                        <option value="Software Engineer">Software Engineer</option>
                                        <option value="Data Scientist">Data Scientist</option>
                                        <option value="Product Manager">Product Manager</option>
                                        <option value="AI/ML Engineer">AI/ML Engineer</option>
                                        <option value="UI/UX Designer">UI/UX Designer</option>
                                        <option value="DevOps Engineer">DevOps Engineer</option>
                                        <option value="Full Stack Developer">Full Stack Developer</option>
                                        <option value="Frontend Developer">Frontend Developer</option>
                                        <option value="Backend Developer">Backend Developer</option>
                                        <option value="Business Analyst">Business Analyst</option>
                                        <option value="Marketing Manager">Marketing Manager</option>
                                        <option value="Sales Executive">Sales Executive</option>
                                        <option value="Other">Other</option>
                                    </select>

                                    {role === "Other" && (
                                        <input
                                            className="input-field"
                                            placeholder="e.g. Senior Frontend Developer"
                                            value={customRole}
                                            onChange={e => setCustomRole(e.target.value)}
                                            style={{ marginTop: '10px' }}
                                            required
                                        />
                                    )}
                                </div>
                                <div>
                                    <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>EXPERIENCE</label>
                                    <select className="input-field" value={experience} onChange={e => setExperience(e.target.value)} style={{ cursor: 'pointer' }}>
                                        <option value="">Any Experience</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Entry Level">Entry Level</option>
                                        <option value="Mid Level">Mid Level (2-5 years)</option>
                                        <option value="Senior Level">Senior Level (5+ years)</option>
                                        <option value="Lead">Lead/Principal</option>
                                        <option value="Manager">Manager</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>LOCATION</label>
                                    <select className="input-field" value={location} onChange={e => setLocation(e.target.value)} style={{ cursor: 'pointer' }}>
                                        <option value="Remote">Remote</option>
                                        <option value="Bangalore, India">Bangalore</option>
                                        <option value="Mumbai, India">Mumbai</option>
                                        <option value="Delhi NCR, India">Delhi NCR</option>
                                        <option value="Hyderabad, India">Hyderabad</option>
                                        <option value="Pune, India">Pune</option>
                                        <option value="Chennai, India">Chennai</option>
                                        <option value="Kolkata, India">Kolkata</option>
                                        <option value="Other">Other (Specify City)</option>
                                    </select>
                                    {location === "Other" && (
                                        <input
                                            className="input-field"
                                            placeholder="Enter City Name"
                                            value={customLocation}
                                            onChange={e => setCustomLocation(e.target.value)}
                                            style={{ marginTop: '10px' }}
                                            required
                                        />
                                    )}
                                </div>
                                <div>
                                    <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>POSTED DATE</label>
                                    <select className="input-field" value={timeRange} onChange={e => setTimeRange(e.target.value)} style={{ cursor: 'pointer' }}>
                                        <option value="">Any Time</option>
                                        <option value="today">Past 24 Hours</option>
                                        <option value="3days">Past 3 Days</option>
                                        <option value="week">Past Week</option>
                                        <option value="month">Past Month</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', maxWidth: '600px', margin: '0 auto' }}>
                                <div className="upload-zone" onClick={() => document.getElementById('resume-upload-search').click()}>
                                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '15px' }}>
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                    </svg>
                                    <p style={{ color: file ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '0.95rem' }}>
                                        {file ? file.name : 'Click to Upload Resume PDF'}
                                    </p>
                                    <input id="resume-upload-search" type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <select className="input-field" value={location} onChange={e => setLocation(e.target.value)}>
                                            <option value="Remote">Remote</option>
                                            <option value="Bangalore, India">Bangalore</option>
                                            <option value="Mumbai, India">Mumbai</option>
                                            <option value="Delhi NCR, India">Delhi NCR</option>
                                            <option value="Hyderabad, India">Hyderabad</option>
                                            <option value="Pune, India">Pune</option>
                                            <option value="Chennai, India">Chennai</option>
                                            <option value="Kolkata, India">Kolkata</option>
                                            <option value="Other">Other (Specify City)</option>
                                        </select>
                                        {location === "Other" && (
                                            <input
                                                className="input-field"
                                                placeholder="Enter City Name"
                                                value={customLocation}
                                                onChange={e => setCustomLocation(e.target.value)}
                                                style={{ marginTop: '10px' }}
                                                required
                                            />
                                        )}
                                    </div>
                                    <select className="input-field" value={timeRange} onChange={e => setTimeRange(e.target.value)}>
                                        <option value="">Any Time</option>
                                        <option value="today">Past 24 Hours</option>
                                        <option value="3days">Past 3 Days</option>
                                        <option value="week">Past Week</option>
                                        <option value="month">Past Month</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Job Platforms Filter - Positioned after Location */}
                        <div style={{ marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                            <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', marginBottom: '12px', display: 'block', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                Job Platforms
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (selectedPlatforms.length === ALL_PLATFORMS.length) {
                                            setSelectedPlatforms([]);
                                        } else {
                                            setSelectedPlatforms([...ALL_PLATFORMS]);
                                        }
                                    }}
                                    className="tag"
                                    style={{
                                        background: selectedPlatforms.length === ALL_PLATFORMS.length ? 'rgba(197, 160, 89, 0.2)' : 'rgba(255,255,255,0.05)',
                                        color: selectedPlatforms.length === ALL_PLATFORMS.length ? 'var(--primary)' : 'var(--text-main)',
                                        border: selectedPlatforms.length === ALL_PLATFORMS.length ? '1px solid var(--primary)' : '1px solid var(--border)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {selectedPlatforms.length === ALL_PLATFORMS.length ? 'ALL SELECTED' : 'SELECT ALL'}
                                </button>
                                {ALL_PLATFORMS.map(platform => {
                                    const isSelected = selectedPlatforms.includes(platform);
                                    return (
                                        <button
                                            key={platform}
                                            type="button"
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedPlatforms(prev => prev.filter(p => p !== platform));
                                                } else {
                                                    setSelectedPlatforms(prev => [...prev, platform]);
                                                }
                                            }}
                                            className="tag"
                                            style={{
                                                padding: '8px 16px',
                                                fontSize: '0.75rem',
                                                background: isSelected ? 'rgba(197, 160, 89, 0.2)' : 'rgba(255,255,255,0.05)',
                                                color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                                                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                cursor: 'pointer',
                                                boxShadow: isSelected ? '0 5px 15px rgba(197, 160, 89, 0.1)' : 'none'
                                            }}
                                        >
                                            {platform}
                                            {isSelected && <span style={{ fontSize: '1.1rem', fontWeight: '400' }}>&times;</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <button type="submit" className="pill-button" disabled={loading}>
                                {loading ? "SEARCHING..." : "FIND OPPORTUNITIES"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* RESULTS GRID */}
            {displayedJobs.length > 0 && (
                <div>
                    <div className="section-divider"></div>
                    <span className="step-number" style={{ textAlign: 'center', marginBottom: '30px', display: 'block' }}>
                        {activeTab === 'saved' ? "SAVED POSITIONS" : "LATEST OPPORTUNITIES"}
                    </span>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                        {displayedJobs.map((job, index) => (
                            <div
                                key={index}
                                className="report-card"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    transition: 'transform 0.3s ease, border-color 0.3s ease',
                                    position: 'relative',
                                    paddingBottom: '20px' // Adjusted padding for new bottom section
                                }}
                                onClick={() => setViewingJob(job)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                                        {job.thumbnail ?
                                            <img src={job.thumbnail} alt="logo" style={{ height: '40px', borderRadius: '8px', objectFit: 'contain', background: '#fff', padding: '2px' }} />
                                            : <div style={{ height: '40px', width: '40px', background: 'var(--input-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', border: '1px solid var(--border)' }}>💼</div>
                                        }
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {["google", "microsoft", "amazon", "meta", "apple", "netflix", "uber", "airbnb", "linkedin", "spotify", "nvidia"].some(tc => job.company_name?.toLowerCase().includes(tc)) && (
                                                <span className="tag" style={{ fontSize: '0.6rem', background: 'rgba(212, 175, 55, 0.2)', color: 'var(--primary)', border: '1px solid var(--primary)', fontWeight: '900' }}>
                                                    TOP COMPANY
                                                </span>
                                            )}
                                            <span className="tag" style={{ fontSize: '0.6rem', background: 'rgba(197, 160, 89, 0.1)', color: 'var(--primary)', border: '1px solid rgba(197, 160, 89, 0.3)' }}>
                                                {job.job_type || "Full-time"}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="serif-title" style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '8px', lineHeight: '1.3' }}>{job.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem', marginBottom: '15px' }}>
                                        {job.company_name}
                                    </p>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', color: 'var(--secondary)', fontSize: '0.8rem', marginBottom: '20px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>📍 {job.location}</span>
                                        {job.posted_at && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>🕒 {job.posted_at}</span>}
                                    </div>

                                    <p style={{
                                        fontSize: '0.85rem',
                                        color: 'var(--text-muted)',
                                        lineHeight: '1.6',
                                        display: '-webkit-box',
                                        WebkitLineClamp: '2',
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        marginBottom: '20px'
                                    }}>
                                        {job.description}
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', marginBottom: '15px', position: 'relative', zIndex: 10 }}>
                                    <a
                                        href={job.apply_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="pill-button"
                                        style={{ flex: 1, padding: '10px 0', fontSize: '0.8rem', textAlign: 'center', textDecoration: 'none' }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        APPLY NOW
                                    </a>
                                    {activeTab !== 'saved' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSaveJob(job);
                                            }}
                                            className="pill-button"
                                            style={{ flex: 1, padding: '10px 0', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', boxShadow: 'none' }}
                                        >
                                            SAVE
                                        </button>
                                    )}
                                    {activeTab === 'saved' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveJob(job.id);
                                            }}
                                            className="pill-button"
                                            style={{ flex: 0.45, padding: '10px 0', fontSize: '0.8rem', background: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c', boxShadow: 'none' }}
                                        >
                                            REMOVE
                                        </button>
                                    )}
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                    paddingTop: '10px',
                                    marginTop: '10px'
                                }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>
                                        {job.salary === "Salary Not Disclosed" ? "" : job.salary}
                                    </span>
                                    <span style={{
                                        fontSize: '0.65rem',
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        fontWeight: '800',
                                        opacity: 0.6
                                    }}>
                                        SOURCE: <span style={{ color: 'var(--primary)' }}>{job.platform}</span>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination & Status */}
                    {currentJobs.length > 0 && (
                        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                            <div style={{ padding: '8px 20px', background: 'var(--glass-bg)', borderRadius: '100px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--primary)' }}></div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.5px' }}>
                                    SHOWING {displayedJobs.length} OF {currentJobs.length} {activeTab === 'saved' ? 'SAVED JOBS' : 'MATCHING OPPORTUNITIES'}
                                </span>
                            </div>

                            {hasMore && (
                                <button
                                    onClick={handleViewMore}
                                    className="pill-button"
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text-main)',
                                        boxShadow: 'none',
                                        padding: '12px 40px',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                                    </svg>
                                    REVEAL NEXT 10 POSITIONS
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {currentJobs.length === 0 && !loading && (
                <div style={{ textAlign: 'center', marginTop: '60px', opacity: 0.6 }}>
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '1.1rem' }}>
                        {activeTab === 'saved' ? "Your saved list is currently empty." : "Ready to discover your next career move?"}
                    </p>
                </div>
            )}

            {loading && (
                <div className="loading-container">
                    <div className="scanner-box"></div>
                    <p className="loading-text">SCANNING GLOBAL OPPORTUNITIES...</p>
                </div>
            )}

            {/* Job Details Modal */}
            <JobDetailsModal
                job={viewingJob}
                onClose={() => setViewingJob(null)}
            />

            {/* Delete Confirmation Modal */}
            <DeleteJobModal />

            {/* Notification Toast */}
            <Toast />
        </div>
    );
};

export default JobSearch;
