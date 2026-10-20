import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecuperareCont.css';

import email_icon from '../Assets/email.png';

function RecuperareCont() {
    const navigate = useNavigate();

    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('pc-garage-theme');
        if (savedTheme !== null) {
            return savedTheme === 'dark';
        }
        return true;
    });

    useEffect(() => {
        document.body.classList.add('recover-background');
        document.body.classList.toggle('recover-dark-theme', isDarkMode);
        document.body.classList.toggle('recover-light-theme', !isDarkMode);

        return () => {
            document.body.classList.remove('recover-background');
            document.body.classList.remove('recover-dark-theme');
            document.body.classList.remove('recover-light-theme');
        };
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode((prevMode) => {
            const newMode = !prevMode;
            localStorage.setItem('pc-garage-theme', newMode ? 'dark' : 'light');
            return newMode;
        });
    };

    // Stil comun cu gradient mov pentru butoanele de acțiune
    const purpleGradientBtnStyle = {
        background: 'linear-gradient(135deg, #7928ca, #b828ff)',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '50px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold',
        boxShadow: '0 4px 15px rgba(121, 40, 202, 0.4)',
    };

    return (
        <>
            <button
                className="auth-theme-toggle-btn"
                onClick={toggleTheme}
                title={isDarkMode ? "Comută la modul luminos" : "Comută la modul întunecat"}
            >
                {isDarkMode ? '☀️' : '🌙'}
            </button>

            <div className="recover-page container">
                <div className="header">
                    <div 
                        className="text"
                        style={{
                            background: 'linear-gradient(135deg, #7928ca, #b828ff)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            color: 'transparent'
                        }}
                    >
                        Recuperare Cont
                    </div>
                    <div 
                        className="underline"
                        style={{ background: 'linear-gradient(135deg, #7928ca, #b828ff)' }}
                    ></div>
                </div>

                <div className="recover-description">
                    Introdu email-ul asociat contului tău pentru a reseta parola.
                </div>

                <div className="inputs">
                    <div className="input">
                        <img src={email_icon} alt="email" />
                        <input type="email" placeholder="Email" />
                    </div>
                </div>

                <div className="submit-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                    <div 
                        className="submit"
                        style={{ ...purpleGradientBtnStyle, padding: '12px 30px', width: '100%', fontSize: '16px' }}
                    >
                        Reset password
                    </div>
                </div>

                <div 
                    className="back-login" 
                    style={{ marginTop: '20px', textAlign: 'center', cursor: 'pointer', color: '#b828ff', fontWeight: '500' }} 
                    onClick={() => navigate('/login')}
                >
                    Înapoi la Login
                </div>
            </div>
        </>
    );
}

export default RecuperareCont;