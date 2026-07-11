import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import Card3D from '../components/Card3D';
import { ShieldCheck, Zap, Lock, ArrowRight, CreditCard, BarChart3, Bell, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import Loader from '../components/Loader';

/* ────────────────────────────────────────────
   Animated counter component
   ──────────────────────────────────────────── */
const AnimatedCounter = ({ target, suffix = '', prefix = '', duration = 2, start = false }) => {
  const [displayValue, setDisplayValue] = useState(
    Number.isInteger(target) ? '0' : '0.00'
  );

  useEffect(() => {
    if (!start) return;

    let startTime;
    let animationFrame;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4); // easeOutQuart
      const current = target * easeProgress;
      
      setDisplayValue(
        Number.isInteger(target) 
          ? Math.floor(current).toString() 
          : current.toFixed(2)
      );
      
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      }
    };
    
    animationFrame = window.requestAnimationFrame(step);
    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [target, duration, start]);

  return (
    <span>
      {prefix}
      <span>{displayValue}</span>
      {suffix}
    </span>
  );
};

const StatCard = ({ stat, index }) => {
  const [start, setStart] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onViewportEnter={() => setStart(true)}
      style={{
        padding: '36px 28px', borderRadius: '20px', textAlign: 'center',
        background: 'var(--glass-bg, rgba(255,255,255,0.04))',
        border: '1px solid var(--border-color)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div style={{
        fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em',
        marginBottom: '6px',
        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        <AnimatedCounter target={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} duration={2.5} start={start} />
      </div>
      <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
        {stat.label}
      </div>
    </motion.div>
  );
};

/* ────────────────────────────────────────────
   Particle field — 35 floating dots
   ──────────────────────────────────────────── */
const particles = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1.5,
  delay: Math.random() * 6,
  duration: Math.random() * 8 + 10,
}));

const ParticleField = () => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    {particles.map((p) => (
      <motion.div
        key={p.id}
        initial={{ opacity: 0, y: 0, x: 0 }}
        animate={{
          opacity: [0, 0.6, 0.3, 0.7, 0],
          y: [0, -30, 10, -20, 0],
          x: [0, 15, -10, 5, 0],
        }}
        transition={{
          duration: p.duration,
          delay: p.delay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          background: 'rgba(139,92,246,0.5)',
        }}
      />
    ))}
  </div>
);

/* ────────────────────────────────────────────
   Stagger helpers
   ──────────────────────────────────────────── */
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/* ────────────────────────────────────────────
   LANDING PAGE
   ──────────────────────────────────────────── */
const Landing = () => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) return <Loader />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;

  const features = [
    { icon: <Zap size={24} />, title: 'Instant Transfers', desc: 'Send and receive money in milliseconds with zero fees on internal transfers.' },
    { icon: <ShieldCheck size={24} />, title: 'Bank-Grade Security', desc: 'Multi-layer encryption and real-time threat monitoring protect every transaction.' },
    { icon: <BarChart3 size={24} />, title: 'Smart Analytics', desc: 'AI-powered spending insights and budgeting tools that learn your habits.' },
    { icon: <CreditCard size={24} />, title: 'Virtual Cards', desc: 'Generate unlimited virtual cards for online purchases and subscriptions.' },
    { icon: <Lock size={24} />, title: 'Encrypted Storage', desc: 'Military-grade AES-256 encryption keeps your documents and data safe.' },
    { icon: <Bell size={24} />, title: 'Real-time Alerts', desc: 'Instant push notifications for every transaction, login, and security event.' },
  ];

  const stats = [
    { value: 2.4, prefix: '$', suffix: 'B+', label: 'Processed' },
    { value: 150, suffix: 'K+', label: 'Users' },
    { value: 99.99, suffix: '%', label: 'Uptime' },
    { value: 256, suffix: '-bit', label: 'Encryption' },
  ];

  const steps = [
    { num: '01', icon: <Sparkles size={28} />, title: 'Create Account', desc: 'Sign up in under 60 seconds with just your email. No paperwork required.' },
    { num: '02', icon: <CreditCard size={28} />, title: 'Fund Your Account', desc: 'Link your existing bank or deposit crypto. Instant balance availability.' },
    { num: '03', icon: <Zap size={28} />, title: 'Start Banking', desc: 'Send money, pay bills, invest, and manage everything from one dashboard.' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {/* ═══════════════════ NAVBAR ═══════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        background: scrolled ? 'rgba(var(--bg-primary-rgb, 10,10,20), 0.85)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <div style={{
          maxWidth: '1280px', width: '100%', margin: '0 auto',
          padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span className="text-gradient" style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              SecureBank
            </span>
          </Link>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <ThemeToggle />
            <Link to="/login" className="btn-secondary" style={{ padding: '10px 22px', fontSize: '0.875rem' }}>
              Login
            </Link>
            <Link to="/register" className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.875rem' }}>
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section style={{
        position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center',
        overflow: 'hidden', paddingTop: '80px',
      }}>
        {/* Animated gradient background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: theme === 'light' 
            ? 'linear-gradient(135deg, #f8f9fc 0%, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%, #f8f9fc 100%)' 
            : 'linear-gradient(135deg, #0c0a1a 0%, #1a0b2e 25%, #0f1b3d 50%, #0a0e23 75%, #0c0a1a 100%)',
          backgroundSize: '400% 400%',
          animation: 'heroGradient 12s ease infinite',
        }} />
        {/* Overlay radial glow */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'radial-gradient(ellipse at 30% 50%, rgba(139,92,246,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(6,182,212,0.08) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />
        <ParticleField />

        <div style={{
          position: 'relative', zIndex: 2, maxWidth: '1280px', width: '100%', margin: '0 auto',
          padding: '0 48px', display: 'flex', alignItems: 'center', gap: '64px', flexWrap: 'wrap',
        }}>
          {/* Left text */}
          <div style={{ flex: '1 1 500px', minWidth: '300px' }}>
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '7px 16px', borderRadius: '100px', marginBottom: '28px',
                background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
                fontSize: '0.8125rem', fontWeight: 500, color: '#a78bfa',
              }}>
                <Sparkles size={14} /> Trusted by 150,000+ customers
              </div>

              <h1 style={{
                fontSize: 'clamp(2.75rem, 5.5vw, 4.5rem)', lineHeight: 1.05, marginBottom: '24px',
                letterSpacing: '-0.045em', fontWeight: 800, color: 'var(--text-heading)',
              }}>
                The Future of<br />
                <span style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #8b5cf6 100%)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  animation: 'textShimmer 4s ease infinite',
                }}>
                  Secure Banking
                </span>
              </h1>

              <p style={{
                fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '44px',
                maxWidth: '540px', lineHeight: 1.7,
              }}>
                Experience next-generation personal finance. Lightning-fast transfers, intelligent insights,
                and military-grade security — all in one beautifully crafted platform.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '48px' }}>
                <Link to="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  padding: '16px 36px', borderRadius: '14px', fontWeight: 600, fontSize: '1rem',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: '#fff', textDecoration: 'none', border: 'none',
                  boxShadow: '0 0 30px rgba(139,92,246,0.3), 0 4px 20px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}>
                  Open Free Account <ArrowRight size={18} />
                </Link>
                <Link to="/login" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  padding: '16px 36px', borderRadius: '14px', fontWeight: 600, fontSize: '1rem',
                  background: 'var(--bg-card)', color: 'var(--text-primary)', textDecoration: 'none',
                  border: '1px solid var(--border-color)',
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  transition: 'background 0.2s',
                }}>
                  Sign In
                </Link>
              </div>

              {/* Trust badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
                fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 400,
              }}>
                <ShieldCheck size={14} style={{ color: '#22c55e' }} />
                Bank-grade security &nbsp;•&nbsp; 256-bit encryption &nbsp;•&nbsp; FDIC Insured
              </div>
            </motion.div>
          </div>

          {/* Right 3D card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ flex: '1 1 400px', minWidth: '300px', height: '420px' }}
          >
            <Card3D />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section style={{
        maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '100px 48px 80px',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px',
        }}>
          {stats.map((s, i) => (
            <StatCard key={s.label} stat={s} index={i} />
          ))}
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '60px 48px 100px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '56px' }}
        >
          <h2 style={{ fontSize: '2.25rem', marginBottom: '14px', fontWeight: 700, letterSpacing: '-0.03em' }}>
            Built for the{' '}
            <span style={{
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>modern era</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6 }}>
            Every feature designed with security and speed in mind.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              style={{
                padding: '32px 28px', borderRadius: '20px', textAlign: 'left',
                background: 'var(--glass-bg, rgba(255,255,255,0.04))',
                border: '1px solid var(--border-color)',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                transition: 'border-color 0.2s',
                cursor: 'default',
              }}
            >
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.1))',
                color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px', fontSize: '1.25rem',
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 650, marginBottom: '10px' }}>{f.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '60px 48px 100px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          <h2 style={{ fontSize: '2.25rem', marginBottom: '14px', fontWeight: 700, letterSpacing: '-0.03em' }}>
            Get started in{' '}
            <span style={{
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>3 simple steps</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', maxWidth: '460px', margin: '0 auto' }}>
            From sign-up to your first transfer in under two minutes.
          </p>
        </motion.div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px', position: 'relative',
        }}>
          {/* Connecting line (desktop) */}
          <div style={{
            position: 'absolute', top: '52px', left: 'calc(16.66% + 16px)', right: 'calc(16.66% + 16px)',
            height: '2px',
            background: 'linear-gradient(90deg, rgba(139,92,246,0.3), rgba(6,182,212,0.3))',
            display: 'var(--step-line-display, block)',
            zIndex: 0,
          }} />

          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'relative', zIndex: 1, textAlign: 'center',
                padding: '36px 24px', borderRadius: '20px',
                background: 'var(--glass-bg, rgba(255,255,255,0.04))',
                border: '1px solid var(--border-color)',
              }}
            >
              {/* Number badge */}
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 20px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: '1.125rem',
                boxShadow: '0 0 24px rgba(139,92,246,0.25)',
              }}>
                {s.num}
              </div>
              <div style={{ color: '#8b5cf6', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                {s.icon}
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 650, marginBottom: '10px' }}>{s.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '280px', margin: '0 auto' }}>
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '20px 48px 100px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{
            borderRadius: '28px', padding: '80px 48px', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(6,182,212,0.08) 100%)',
            border: '1px solid rgba(139,92,246,0.15)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Decorative orb */}
          <div style={{
            position: 'absolute', top: '-60px', right: '-40px', width: '300px', height: '300px',
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <h2 style={{
            fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.03em',
            position: 'relative',
          }}>
            Ready to get started?
          </h2>
          <p style={{
            color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '40px',
            maxWidth: '480px', margin: '0 auto 40px', lineHeight: 1.6, position: 'relative',
          }}>
            Join thousands who trust SecureBank for fast, secure, and intelligent banking.
          </p>
          <Link to="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '18px 40px', borderRadius: '14px', fontWeight: 600, fontSize: '1.05rem',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            color: '#fff', textDecoration: 'none',
            boxShadow: '0 0 30px rgba(139,92,246,0.3), 0 4px 20px rgba(0,0,0,0.2)',
            position: 'relative',
          }}>
            Create Free Account <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer style={{
        borderTop: '1px solid var(--border-color)', padding: '36px 48px',
        maxWidth: '1280px', width: '100%', margin: '0 auto',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center',
        gap: '16px',
      }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          © 2026 SecureBank. All rights reserved.
        </span>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Privacy', 'Terms', 'Contact'].map((lnk) => (
            <a key={lnk} href="#" style={{
              fontSize: '0.8125rem', color: 'var(--text-secondary)', textDecoration: 'none',
              transition: 'color 0.2s',
            }}>
              {lnk}
            </a>
          ))}
        </div>
      </footer>

      {/* Keyframe injection */}
      <style>{`
        @keyframes heroGradient {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes textShimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @media (max-width: 768px) {
          :root { --step-line-display: none; }
        }
      `}</style>
    </div>
  );
};

export default Landing;
