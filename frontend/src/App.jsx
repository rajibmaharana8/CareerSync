import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import JobSearch from './pages/JobSearch';
import InterviewPrep from './pages/InterviewPrep';

// Helper component to add 'active' styling to nav links
const NavLink = ({ to, children, disabled }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    const style = {
        color: disabled ? 'var(--text-muted)' : (isActive ? '#0c111d' : 'var(--text-main)'),
        textDecoration: 'none',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        fontSize: '0.8rem',
        padding: '12px 24px',
        borderRadius: '100px',
        background: isActive ? 'var(--primary-gradient)' : 'transparent',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        border: isActive ? 'none' : '1px solid var(--border)',
        boxShadow: isActive ? '0 10px 25px rgba(197, 160, 89, 0.3)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    if (disabled) {
        return <span style={style}>{children}</span>;
    }

    return (
        <Link to={to} style={style}>{children}</Link>
    );
};

const ThemeToggle = ({ theme, toggleTheme, rotation }) => (
    <button
        onClick={toggleTheme}
        className="theme-toggle"
        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        style={{ transform: `rotate(${rotation}deg)` }}
    >
        {theme === 'dark' ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
        ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        )}
    </button>
);

const Footer = () => (
    <footer style={{
        marginTop: '40px',
        padding: '40px 20px 30px',
        textAlign: 'center',
        background: 'var(--glass-bg)',
        borderTop: '1px solid var(--border)',
        backdropFilter: 'blur(30px)'
    }}>
        <div className="analyzer-wrapper" style={{ padding: 0 }}>
            <p className="serif-title" style={{
                fontSize: '0.9rem',
                fontWeight: '700',
                marginBottom: '12px',
                color: 'var(--text-main)',
                letterSpacing: '2px',
                textTransform: 'uppercase'
            }}>
                Created by : Rajib Kumar Maharana
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '10px' }}>
                <a href="https://github.com/rajibmaharana8" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', transition: 'all 0.3s ease' }} className="social-link">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                </a>
                <a href="https://www.linkedin.com/in/rajib-kumar-maharana-8933632ab/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', transition: 'all 0.3s ease' }} className="social-link">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                </a>
            </div>

            <div className="section-divider" style={{ opacity: 0.2, margin: '10px 0' }}></div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '1.5px', opacity: 0.8 }}>
                &copy; CAREERSYNC. ALL RIGHTS RESERVED.
            </p>
        </div>
    </footer>
);

function App() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
        setRotation(prev => prev + 360);
    };

    return (
        <Router>
            <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} rotation={rotation} />

                {/* Header with CareerSync Branding */}
                <header className="app-header" style={{
                    background: 'var(--glass-bg)',
                    borderBottom: '1px solid var(--glass-border)',
                    backdropFilter: 'blur(30px)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                }}>
                    {/* CareerSync Title */}
                    <div className="brand-container" style={{
                        textAlign: 'center',
                        padding: '30px 20px 20px',
                        borderBottom: '1px solid var(--border)'
                    }}>
                        <h1 className="serif-title" style={{
                            fontSize: '2.5rem',
                            margin: 0,
                            background: 'var(--primary-gradient)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '4px',
                            fontWeight: '900'
                        }}>
                            CareerSync
                        </h1>
                        <p style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.8rem',
                            marginTop: '8px',
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            fontWeight: '700'
                        }}>
                            AI-Powered Career Intelligence
                        </p>
                    </div>

                    {/* Navigation Sections */}
                    <nav className="main-nav" style={{
                        padding: '15px 20px',
                        display: 'flex',
                        gap: '15px',
                        justifyContent: 'center'
                    }}>
                        <NavLink to="/">Resume Analyzer</NavLink>
                        <NavLink to="/jobs">Job Search</NavLink>
                        <NavLink to="/interview">Interview Prep</NavLink>
                    </nav>
                </header>

                {/* Page Content */}
                <div style={{ flex: 1 }}>
                    <Routes>
                        <Route path="/" element={<ResumeAnalyzer />} />
                        <Route path="/jobs" element={<JobSearch />} />
                        <Route path="/interview" element={<InterviewPrep />} />
                    </Routes>
                </div>

                <Footer />
            </div>
        </Router>
    );
}

export default App;