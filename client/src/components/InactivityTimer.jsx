import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const InactivityTimer = () => {
    const { user, logout } = useAuth();
    const [showWarning, setShowWarning] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const timeoutRef = useRef(null);
    const countdownRef = useRef(null);

    // 5 minutes = 300,000 ms. We warn at 4m30s (270,000 ms).
    const IDLE_LIMIT = 5 * 60 * 1000;
    const WARNING_TIME = 30 * 1000;

    const resetTimer = () => {
        if (showWarning) return; // Do not reset if warning is showing

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);

        timeoutRef.current = setTimeout(() => {
            setShowWarning(true);
            setCountdown(30);
        }, IDLE_LIMIT - WARNING_TIME);
    };

    useEffect(() => {
        if (!user) return;

        // Events that reset the inactivity timer
        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
        
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        resetTimer();

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [user, showWarning]);

    useEffect(() => {
        if (showWarning) {
            countdownRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownRef.current);
                        logout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [showWarning, logout]);

    const handleStayLoggedIn = () => {
        setShowWarning(false);
        resetTimer();
    };

    if (!showWarning) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                        padding: '30px', borderRadius: '16px', maxWidth: '400px', width: '90%',
                        textAlign: 'center'
                    }}
                >
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Inactivity Warning</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                        You have been inactive. For your security, your session will expire in <strong>{countdown}</strong> seconds.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button className="btn-secondary" onClick={() => logout()}>Logout Now</button>
                        <button className="btn-primary" onClick={handleStayLoggedIn}>Stay Logged In</button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default InactivityTimer;
