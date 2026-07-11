import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import Card3D from '../components/Card3D';
import { ShieldCheck, Zap, Lock, ArrowRight, CreditCard, BarChart3, Bell, ChevronDown, Sparkles, Check, Star, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import Loader from '../components/Loader';
import api from '../api/axios';

/* ────────────────────────────────────────────
   Animated counter component
   ──────────────────────────────────────────── */
const AnimatedCounter = ({ target, suffix = '', prefix = '', duration = 2, start = false }) => {
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    if (!start) return;

    let startTime;
    let animationFrame;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4); // easeOutQuart
      const current = target * easeProgress;
      
      if (Number.isInteger(target)) {
        setDisplayValue(Math.floor(current).toLocaleString('en-US'));
      } else {
        setDisplayValue(current.toFixed(2));
      }
      
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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (isInView) {
      setStart(true);
    }
  }, [isInView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel"
      style={{
        padding: '36px 28px',
        textAlign: 'center',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'relative',
        overflow: 'hidden'
      }}
      whileHover={{ y: -6, borderColor: 'var(--accent)' }}
    >
      <div style={{
        fontSize: '2.5rem',
        fontWeight: 800,
        letterSpacing: '-0.03em',
        marginBottom: '6px',
        background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        <AnimatedCounter target={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} duration={2.5} start={start} />
      </div>
      <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
        {stat.label}
      </div>
    </motion.div>
  );
};

const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--border-color)', padding: '16px 0' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          color: 'var(--text-primary)',
          fontSize: '1.05rem',
          fontWeight: 600,
          textAlign: 'left',
          cursor: 'pointer',
          padding: '12px 4px',
        }}
      >
        <span>{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown size={20} color="var(--text-secondary)" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, padding: '4px 4px 16px 4px', margin: 0 }}>
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ParticleField = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 0, x: 0 }}
          animate={{
            opacity: [0, 0.4, 0.2, 0.5, 0],
            y: [0, -40, 20, -10, 0],
            x: [0, 20, -15, 10, 0],
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
            background: 'var(--accent)',
            filter: 'blur(1px)'
          }}
        />
      ))}
    </div>
  );
};

const Landing = () => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [liveStats, setLiveStats] = useState({
    users: 15420,
    transactions: 248102,
    moneyProcessed: 1258490,
    cards: 4210,
    securityScore: 99.9,
    uptime: 99.99
  });

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const res = await api.get('/public/stats');
        if (res.data?.success) {
          const s = res.data.data;
          setLiveStats({
            // Add premium base values so it looks like a real popular app even if DB starts empty
            users: (s.users || 0) + 15420,
            transactions: (s.transactions || 0) + 248102,
            moneyProcessed: (s.moneyProcessed || 0) + 1258490,
            cards: (s.cards || 0) + 4210,
            securityScore: s.securityScore || 99.9,
            uptime: 99.99
          });
        }
      } catch (e) {
        // Fallback to static realistic defaults
      }
    };
    fetchLiveStats();

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) return <Loader />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;

  const features = [
    { icon: <Zap size={24} />, title: 'Instant Core Transfers', desc: 'Send and receive money in milliseconds with zero fees on internal secure transfers.' },
    { icon: <ShieldCheck size={24} />, title: 'Bank-Grade Security', desc: 'Multi-layer encryption, 2FA validation, and real-time auditing protect your wealth.' },
    { icon: <BarChart3 size={24} />, title: 'Advanced Cash Flow', desc: 'Sleek interactive charts showing real-time monthly income and expenses breakdown.' },
    { icon: <CreditCard size={24} />, title: 'Apple Wallet Style Cards', desc: 'Generate dynamic virtual cards instantly with interactive freeze and control toggles.' },
    { icon: <Lock size={24} />, title: 'AES-256 Storage', desc: 'Highly secure environment built on standard cryptographically hardened modules.' },
    { icon: <Bell size={24} />, title: 'Security Auditing', desc: 'Comprehensive log telemetry tracking every login, transfer, and card control event.' },
  ];

  const partners = ['Stripe', 'Visa', 'Mastercard', 'Wise', 'Plaid', 'AWS'];

  const stats = [
    { value: liveStats.users, suffix: '+', label: 'Registered Members' },
    { value: liveStats.transactions, suffix: '+', label: 'Secure Transfers' },
    { value: Math.round(liveStats.moneyProcessed), prefix: '$', suffix: '+', label: 'Volume Processed' },
    { value: liveStats.cards, suffix: '+', label: 'Virtual Cards Issued' }
  ];

  const testimonials = [
    { quote: "SecureBank completely redefined how I manage my subscriptions. The temporary virtual card feature is a lifesaver.", name: "Sophia Martinez", role: "Product Manager at Vercel", rating: 5 },
    { quote: "The interface is Linear-level quality. Beautiful, responsive, dark-mode focused, and extremely fast.", name: "David Chen", role: "Software Architect", rating: 5 },
    { quote: "Fast money transfers inside a fully audited ledger. Peace of mind paired with an incredible user experience.", name: "Elena Rostova", role: "Fintech Investor", rating: 5 }
  ];

  const faqs = [
    { question: "Is my money insured and secure?", answer: "Absolutely. SecureBank uses bank-grade AES-256 bit encryption, dual-factor authentication (2FA), and secure session cookies. Every transfer is executed in an atomic database transaction." },
    { question: "How does the virtual card freeze work?", answer: "From your card settings page, you can toggle freeze. This immediately updates the database, blocking any incoming payment request in real-time until you unfreeze it." },
    { question: "Are there any fees for sending money?", answer: "All internal transfers between SecureBank users are completely free and processed instantly, 24/7." },
    { question: "How can I check the receipt integrity hash?", answer: "Every transaction generates a cryptographically secure receipt with a SHA-256 integrity hash, signing the reference, amount, sender, receiver, and date. You can print, download, or share this verified receipt at any time." }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#050507', color: '#FFFFFF', overflowX: 'hidden' }}>

      {/* ═══════════════════ NAVBAR ═══════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        background: scrolled ? 'rgba(5, 5, 7, 0.85)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <div style={{
          maxWidth: '1280px', width: '100%', margin: '0 auto',
          padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff'
            }}>S</span>
            <span className="text-gradient" style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              SecureBank
            </span>
          </Link>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <ThemeToggle />
            <Link to="/login" className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.875rem', height: '38px', borderRadius: '10px' }}>
              Login
            </Link>
            <Link to="/register" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.875rem', height: '38px', borderRadius: '10px' }}>
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section style={{
        position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center',
        overflow: 'hidden', paddingTop: '100px',
      }}>
        {/* Glow behind hero */}
        <div style={{
          position: 'absolute', top: '15%', left: '15%', width: '40vw', height: '40vw',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 60%)',
          pointerEvents: 'none', zIndex: 0
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '15%', width: '40vw', height: '40vw',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 60%)',
          pointerEvents: 'none', zIndex: 0
        }} />
        <ParticleField />

        <div style={{
          position: 'relative', zIndex: 10, maxWidth: '1280px', width: '100%', margin: '0 auto',
          padding: '0 24px', display: 'flex', alignItems: 'center', gap: '48px', flexWrap: 'wrap',
        }}>
          {/* Left Column */}
          <div style={{ flex: '1 1 500px', minWidth: '300px' }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px', borderRadius: '100px', marginBottom: '24px',
                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                fontSize: '0.8125rem', fontWeight: 600, color: '#a78bfa',
              }}>
                <Sparkles size={14} /> Redefining Enterprise Wealth
              </div>

              <h1 style={{
                fontSize: 'clamp(2.5rem, 5vw, 4.25rem)', lineHeight: 1.1, marginBottom: '20px',
                letterSpacing: '-0.04em', fontWeight: 800, color: '#FFFFFF',
              }}>
                The Banking Hub<br />
                <span className="animate-text-shimmer" style={{
                  backgroundSize: '200% auto',
                  fontWeight: 800
                }}>
                  Built to Empower
                </span>
              </h1>

              <p style={{
                fontSize: '1.125rem', color: '#A8B3CF', marginBottom: '36px',
                maxWidth: '540px', lineHeight: 1.65,
              }}>
                Experience next-generation personal banking. Lightning-fast ledger transfers, intelligent cash flow trackers,
                and Apple Wallet-inspired virtual cards — all inside a bank-grade audited environment.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '40px' }}>
                <Link to="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  padding: '14px 32px', borderRadius: '12px', fontWeight: 600, fontSize: '0.9375rem',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  color: '#fff', textDecoration: 'none', border: 'none',
                  boxShadow: '0 0 24px rgba(139,92,246,0.3)',
                  transition: 'transform 0.2s',
                }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  Get Started <ArrowRight size={16} />
                </Link>
                <Link to="/login" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  padding: '14px 32px', borderRadius: '12px', fontWeight: 600, fontSize: '0.9375rem',
                  background: 'rgba(255,255,255,0.03)', color: '#FFFFFF', textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
                  transition: 'background 0.2s',
                }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                  Learn More
                </Link>
              </div>

              {/* Trust Badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
                fontSize: '0.8125rem', color: '#71717a', fontWeight: 500,
              }}>
                <ShieldCheck size={14} style={{ color: '#22C55E' }} />
                AES-256 Encrypted &nbsp;•&nbsp; 2FA Secure &nbsp;•&nbsp; Full Ledger Audit Logs
              </div>
            </motion.div>
          </div>

          {/* Right 3D Card Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ flex: '1 1 400px', minWidth: '300px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ width: '100%', height: '100%', maxWidth: '420px' }}>
              <Card3D />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ PARTNERS / LOGOS ═══════════════════ */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', py: '30px', background: 'rgba(10,10,15,0.4)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center', gap: '24px' }}>
          {partners.map(p => (
            <span key={p} style={{ fontSize: '1.125rem', fontWeight: 700, color: '#52525b', letterSpacing: '-0.02em', cursor: 'default' }}>{p}</span>
          ))}
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '80px 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {stats.map((s, i) => (
            <StatCard key={s.label} stat={s} index={i} />
          ))}
        </div>
      </section>

      {/* ═══════════════════ BENTO FEATURES ═══════════════════ */}
      <section style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '60px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '56px' }}
        >
          <h2 style={{ fontSize: '2.25rem', marginBottom: '12px', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Engineered for{' '}
            <span style={{
              background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Fintech Excellence</span>
          </h2>
          <p style={{ color: '#A8B3CF', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
            A comprehensive suite of secure banking tools built with premium micro-interactions.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              whileHover={{ y: -4, borderColor: '#8B5CF6' }}
              className="glass-panel"
              style={{
                padding: '32px', borderRadius: '20px', background: '#15151D',
                border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.25s ease'
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px'
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px', color: '#FFFFFF' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#A8B3CF', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      <section style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 12px 0' }}>What our members say</h2>
          <p style={{ color: '#A8B3CF', fontSize: '1rem' }}>High trust and premium execution verified by experts.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-panel"
              style={{ padding: '32px', borderRadius: '20px', background: '#0D0D12', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div style={{ display: 'flex', gap: '2px', marginBottom: '16px', color: '#F59E0B' }}>
                {Array.from({ length: t.rating }).map((_, idx) => <Star key={idx} size={16} fill="currentColor" />)}
              </div>
              <p style={{ fontSize: '0.9375rem', color: '#A8B3CF', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '24px' }}>
                "{t.quote}"
              </p>
              <div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 2px 0' }}>{t.name}</h4>
                <p style={{ fontSize: '0.8125rem', color: '#71717a', margin: 0 }}>{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ FAQ SECTION ═══════════════════ */}
      <section style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '60px 24px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 12px 0' }}>Frequently Asked Questions</h2>
          <p style={{ color: '#A8B3CF', fontSize: '1rem' }}>Have questions? We have answers.</p>
        </div>
        <div className="glass-panel" style={{ padding: '24px 32px', borderRadius: '24px', background: '#0D0D12' }}>
          {faqs.map(faq => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '0 24px 100px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            borderRadius: '28px', padding: '80px 24px', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(6,182,212,0.06) 100%)',
            border: '1px solid rgba(139,92,246,0.2)',
            position: 'relative', overflow: 'hidden'
          }}
        >
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.03em' }}>Ready to experience NeoBanking?</h2>
          <p style={{ color: '#A8B3CF', fontSize: '1.05rem', marginBottom: '32px', maxWidth: '440px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            Join our fast-growing community and take full control of your finances today.
          </p>
          <Link to="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '16px 36px', borderRadius: '12px', fontWeight: 600, fontSize: '0.9375rem',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
            color: '#fff', textDecoration: 'none', border: 'none',
            boxShadow: '0 0 24px rgba(139,92,246,0.4)',
            transition: 'transform 0.2s',
          }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            Open Free Account <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 24px',
        background: '#050507'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '24px', height: '24px', borderRadius: '6px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: '0.75rem'
            }}>S</span>
            <span style={{ fontSize: '1rem', fontWeight: 800 }}>SecureBank</span>
          </div>
          <span style={{ fontSize: '0.8125rem', color: '#71717a' }}>
            © 2026 SecureBank. All rights reserved. Not a real bank — for educational simulation purposes only.
          </span>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Privacy Policy', 'Terms of Service', 'Support'].map((lnk) => (
              <a key={lnk} href="#" style={{ fontSize: '0.8125rem', color: '#71717a', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'} onMouseLeave={e => e.currentTarget.style.color = '#71717a'}>
                {lnk}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* Styles for gradient animation and shimmer text */}
      <style>{`
        .animate-text-shimmer {
          background: linear-gradient(
            90deg,
            #8B5CF6 0%,
            #06B6D4 25%,
            #8B5CF6 50%,
            #06B6D4 75%,
            #8B5CF6 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: textShimmer 4s linear infinite;
        }
        @keyframes textShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
};

export default Landing;
