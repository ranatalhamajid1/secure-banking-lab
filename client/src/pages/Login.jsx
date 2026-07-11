import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import api from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [userIdFor2FA, setUserIdFor2FA] = useState(null);
  const navigate = useNavigate();
  const { user, loading, login } = useAuth();

  if (loading) return <Loader />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (needs2FA) {
        const res = await api.post('/auth/2fa/verify', { userId: userIdFor2FA, code: twoFactorCode });
        toast.success(res.data.message);
        window.location.href = '/dashboard';
        return;
      }

      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.requires2FA) {
        setNeeds2FA(true);
        setUserIdFor2FA(res.data.userId);
        toast('Please enter your 2FA code', { icon: '🔐' });
        setSubmitting(false);
        return;
      }

      await login(email, password);
      toast.success('Welcome back!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--bg-primary)', color: 'var(--text-primary)',
    }}>

      {/* ═══════ LEFT DECORATIVE PANEL (hidden on mobile) ═══════ */}
      <div style={{
        flex: '1 1 50%', position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0c0a1a 0%, #1a0b2e 40%, #0f1b3d 100%)',
      }}
        className="auth-left-panel"
      >
        {/* Decorative orbs */}
        <div style={{
          position: 'absolute', top: '-15%', left: '-10%', width: '500px', height: '500px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-15%', width: '600px', height: '600px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, padding: '48px', maxWidth: '440px' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span style={{
                fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                SecureBank
              </span>
            </Link>
            <h1 style={{
              fontSize: '2.5rem', fontWeight: 800, color: '#fff',
              lineHeight: 1.15, marginTop: '40px', marginBottom: '16px', letterSpacing: '-0.04em',
            }}>
              Welcome back to the future of banking.
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '40px' }}>
              Access your accounts, track spending, and manage transfers — all in one secure dashboard.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.3)', fontSize: '0.8125rem' }}>
              <Lock size={14} style={{ color: '#22c55e' }} />
              Your data is protected with 256-bit encryption
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══════ RIGHT FORM PANEL ═══════ */}
      <div style={{
        flex: '1 1 50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1,
            padding: '48px 40px', borderRadius: '24px',
            background: 'var(--glass-bg, rgba(255,255,255,0.04))',
            border: '1px solid var(--border-color)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Logo (visible on mobile when left panel is hidden) */}
          <div className="auth-mobile-logo" style={{ textAlign: 'center', marginBottom: '8px', display: 'none' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                SecureBank
              </span>
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '8px', fontWeight: 700 }}>Welcome back</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {!needs2FA ? (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </>
            ) : (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="123456"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  maxLength="6"
                  required
                />
                <small style={{ color: 'var(--text-secondary)', marginTop: '8px', display: 'block' }}>
                  Check your authenticator app
                </small>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', padding: '15px', marginTop: '4px',
                borderRadius: '14px', border: 'none', fontWeight: 600, fontSize: '0.9375rem',
                color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer',
                background: submitting ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                boxShadow: submitting ? 'none' : '0 0 20px rgba(139,92,246,0.25)',
                transition: 'opacity 0.2s, box-shadow 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {submitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff'
                  }}
                />
              ) : (needs2FA ? 'Verify Code' : <>Sign In <ArrowRight size={16} /></>)}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '28px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#8b5cf6', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
          </p>

          {/* Security badge */}
          <div style={{
            textAlign: 'center', marginTop: '28px', paddingTop: '20px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            color: 'var(--text-secondary)', fontSize: '0.75rem',
          }}>
            <ShieldCheck size={13} style={{ color: '#22c55e' }} />
            Protected by 256-bit encryption
          </div>
        </motion.div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .auth-left-panel { display: none !important; }
          .auth-mobile-logo { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;