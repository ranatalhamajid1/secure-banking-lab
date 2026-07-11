import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { ShieldCheck, ArrowRight, Lock, Sparkles } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/register', { name, email, password });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
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
          position: 'absolute', top: '-15%', right: '-10%', width: '500px', height: '500px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-15%', width: '600px', height: '600px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
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
              Start your banking journey today.
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '40px' }}>
              Open a free account in under 60 seconds. No paperwork, no hidden fees — just modern banking that works for you.
            </p>

            {/* Trust points */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { icon: <Sparkles size={15} />, text: 'Instant account setup' },
                { icon: <ShieldCheck size={15} />, text: 'Bank-grade security from day one' },
                { icon: <Lock size={15} />, text: 'Zero monthly fees' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem',
                  }}
                >
                  <span style={{ color: '#22c55e' }}>{item.icon}</span>
                  {item.text}
                </motion.div>
              ))}
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
          position: 'absolute', top: '-20%', right: '-10%', width: '500px', height: '500px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-10%', width: '600px', height: '600px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
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
            <h2 style={{ fontSize: '1.75rem', marginBottom: '8px', fontWeight: 700 }}>Create account</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Join SecureBank and start banking smarter
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block', marginBottom: '8px', fontSize: '0.875rem',
                fontWeight: 500, color: 'var(--text-secondary)',
              }}>
                Full Name
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label style={{
                display: 'block', marginBottom: '8px', fontSize: '0.875rem',
                fontWeight: 500, color: 'var(--text-secondary)',
              }}>
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
              <label style={{
                display: 'block', marginBottom: '8px', fontSize: '0.875rem',
                fontWeight: 500, color: 'var(--text-secondary)',
              }}>
                Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', padding: '15px', marginTop: '4px',
                borderRadius: '14px', border: 'none', fontWeight: 600, fontSize: '0.9375rem',
                color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer',
                background: submitting
                  ? 'rgba(139,92,246,0.5)'
                  : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                boxShadow: submitting ? 'none' : '0 0 20px rgba(139,92,246,0.25)',
                transition: 'opacity 0.2s, box-shadow 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {submitting ? 'Creating account...' : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '28px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#8b5cf6', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
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

export default Register;