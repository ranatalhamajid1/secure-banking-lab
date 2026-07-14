import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Coffee, Home, Shield, Zap } from 'lucide-react';

const SalarySection = lazy(() => import('../components/SalarySection'));

// Custom CSS for phone mockups and premium cards
const styles = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .premium-card {
    border-radius: 20px;
    background: linear-gradient(135deg, #2a2a2d 0%, #111 100%);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.5);
    position: relative;
    overflow: hidden;
  }
  .premium-card::after {
    content: '';
    position: absolute;
    top: 0; left: -100%; width: 50%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transform: skewX(-20deg);
    animation: shimmer 6s infinite;
  }
  @keyframes shimmer {
    0% { left: -100%; }
    20% { left: 200%; }
    100% { left: 200%; }
  }
  .phone-mockup {
    background: #000;
    border-radius: 40px;
    border: 8px solid #333;
    box-shadow: 0 30px 60px rgba(0,0,0,0.6), inset 0 0 0 2px #555;
    position: relative;
    overflow: hidden;
  }
  .phone-notch {
    position: absolute;
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 120px; height: 25px;
    background: #333;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
    z-index: 10;
  }
`;

const Landing = () => {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef(null);
  
  // Advanced Scroll Animations
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) return null;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;

  return (
    <div ref={containerRef} style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: '#f8f9fa',
      fontFamily: '"Inter", -apple-system, sans-serif',
      overflowX: 'hidden'
    }}>
      <style>{styles}</style>

      {/* TOP BANNER */}
      <div style={{
        background: '#3B59FF', color: '#ffffff', padding: '12px 24px',
        textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, position: 'relative', zIndex: 100
      }}>
        Earn 5% AER (variable) on savings. <a href="#" style={{ color: '#fff', textDecoration: 'underline' }}>Open an account →</a>
      </div>

      {/* HERO SECTION */}
      <section style={{
        position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        backgroundColor: '#6CA5EC', overflow: 'hidden'
      }}>
        
        {/* NAVBAR */}
        <nav style={{
          width: '100%', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 50, background: scrolled ? 'rgba(255,255,255,0.05)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none', WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          transition: 'all 0.3s ease', position: 'fixed', top: scrolled ? 0 : 44
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#fff' }}>
              <Shield size={28} fill="#fff" color="#3B59FF" />
              <span style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.05em' }}>SecureBank</span>
            </Link>
            <div style={{ display: 'none', gap: '24px', color: '#fff', fontSize: '0.9375rem', fontWeight: 600, '@media(min-width: 768px)': { display: 'flex' } }}>
              <Link to="#" style={{ color: '#fff', textDecoration: 'none' }}>Personal</Link>
              <Link to="#" style={{ color: '#fff', textDecoration: 'none' }}>Business</Link>
              <Link to="#" style={{ color: '#fff', textDecoration: 'none' }}>Kids & Teens</Link>
              <Link to="#" style={{ color: '#fff', textDecoration: 'none' }}>Company</Link>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 600 }}>Log in</Link>
            <Link to="/register" style={{
              background: '#fff', color: '#000', padding: '10px 24px', borderRadius: '9999px',
              textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>Sign up</Link>
          </div>
        </nav>

        {/* HERO CONTENT with Parallax */}
        <motion.div style={{
          position: 'relative', width: '100%', maxWidth: '1400px', padding: '60px 48px',
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          y: heroY, opacity: heroOpacity
        }}>
          
          {/* LADY IMAGE (Layer 1) */}
          <motion.img 
            src="/hero-bg.png" 
            alt="Lady"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{
              position: 'absolute',
              top: 'calc(50% - 280px)',
              left: 'calc(50% - 210px)',
              width: '420px',
              height: '560px',
              objectFit: 'cover',
              objectPosition: 'center 35%',
              borderRadius: '32px',
              zIndex: 2,
              pointerEvents: 'none'
            }}
          />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            style={{ position: 'absolute', top: '25%', left: '48px', right: '48px', zIndex: 5, pointerEvents: 'none' }}>
            <h1 style={{
              fontSize: 'clamp(5rem, 11vw, 12rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 0.95, margin: 0, textAlign: 'center'
            }}>Banking & Beyond</h1>
          </motion.div>

          {/* GLASS CARD OUTLINE & TEXT (Layer 3) */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.3 }}
            style={{
              position: 'absolute', 
              top: 'calc(50% - 280px)', 
              left: 'calc(50% - 210px)',
              width: '420px', height: '560px', 
              border: '1.5px solid rgba(255, 255, 255, 0.5)', 
              borderRadius: '32px',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.08) 100%)',
              backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', padding: '40px 32px', zIndex: 10,
              boxShadow: '0 20px 60px rgba(0,0,0,0.1)', overflow: 'hidden'
            }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)', zIndex: 1 }} />
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
              <div style={{ color: '#fff', fontSize: '1.125rem', fontWeight: 500, marginBottom: '4px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Personal</div>
              <div style={{ color: '#fff', fontSize: '4rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '24px', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>$6,012</div>
              <div style={{ background: '#fff', color: '#000', padding: '12px 32px', borderRadius: '9999px', fontSize: '1rem', fontWeight: 700, display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                Accounts
              </div>
            </div>
          </motion.div>

          {/* BOTTOM LEFT TEXT & CTA */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            style={{ position: 'absolute', bottom: '15%', left: '48px', zIndex: 20, maxWidth: '480px' }}>
            <p style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 500, lineHeight: 1.5, marginBottom: '32px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              This is your bank, redefined. Get powerful daily banking and global freedom. Sign up for free in a tap.
            </p>
            <Link to="/register" style={{
              display: 'inline-block', background: '#111216', color: '#fff', padding: '18px 36px', borderRadius: '9999px',
              textDecoration: 'none', fontSize: '1.05rem', fontWeight: 700, boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
            }}>Get Started</Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════ YOUR SALARY REIMAGINED (GSAP) ═══════════════════ */}
      <Suspense fallback={<div style={{height: '100vh', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Loading physics...</div>}>
        <SalarySection />
      </Suspense>


      {/* ═══════════════════ GO VIRTUAL ═══════════════════ */}
      <section style={{ padding: '140px 48px', background: '#000', color: '#fff', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto 80px' }}>
          <h2 style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '24px' }}>Go virtual</h2>
          <p style={{ fontSize: '1.25rem', color: '#a1a1aa', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            Create and add virtual cards to your Apple Wallet or Google Wallet to start paying right away.
          </p>
          <Link to="/register" style={{
            display: 'inline-block', background: '#fff', color: '#000', padding: '16px 32px', borderRadius: '9999px',
            textDecoration: 'none', fontSize: '1rem', fontWeight: 700
          }}>Create a card</Link>
        </div>

        {/* 3D SCROLLING PHONE & CARDS */}
        <div style={{ position: 'relative', height: '600px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', perspective: '1200px' }}>
          
          <motion.div initial={{ rotateX: 60, rotateZ: -15, y: 200, scale: 0.8 }} whileInView={{ rotateX: 30, rotateZ: 0, y: 0, scale: 1 }} transition={{ duration: 1, type: 'spring' }} viewport={{ margin: '-200px' }}
            className="phone-mockup" style={{ width: '380px', height: '800px', transformStyle: 'preserve-3d' }}>
            <div className="phone-notch" />
            
            {/* Screen UI */}
            <div style={{ padding: '80px 24px', background: '#111', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                background: 'linear-gradient(135deg, #a78bfa, #3B59FF)', height: '220px', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.05em' }}>SecureBank</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>VIRTUAL</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '40px' }}>
                <div style={{ padding: '12px 24px', border: '1px solid #333', borderRadius: '9999px', fontSize: '0.875rem', color: '#888' }}>Physical cards</div>
                <div style={{ padding: '12px 24px', background: '#fff', color: '#000', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600 }}>Virtual cards</div>
              </div>
            </div>
          </motion.div>

          {/* Floating Cards around phone */}
          <motion.div initial={{ x: -200, y: 200, opacity: 0 }} whileInView={{ x: -280, y: 50, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ margin: '-100px' }}
            style={{
              position: 'absolute', width: '280px', height: '170px', borderRadius: '16px', background: 'linear-gradient(135deg, #333, #111)',
              border: '1px solid #444', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 10, transform: 'rotate(-10deg)'
            }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.05em' }}>SecureBank</div>
            <div style={{ fontSize: '0.75rem', color: '#888', textAlign: 'right' }}>VIRTUAL</div>
          </motion.div>

          <motion.div initial={{ x: 200, y: -100, opacity: 0 }} whileInView={{ x: 250, y: -50, opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} viewport={{ margin: '-100px' }}
            style={{
              position: 'absolute', width: '320px', height: '190px', borderRadius: '16px', background: '#ccff00', color: '#000',
              padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)', zIndex: 5, transform: 'rotate(15deg)'
            }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.05em' }}>SecureBank</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textAlign: 'right' }}>VIRTUAL</div>
          </motion.div>

        </div>
      </section>

      {/* ═══════════════════ ELEVATE YOUR SPEND ═══════════════════ */}
      <section style={{ padding: '140px 48px', background: '#111216', color: '#fff', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto 80px' }}>
          <h2 style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '24px' }}>Elevate your spend</h2>
          <p style={{ fontSize: '1.25rem', color: '#a1a1aa', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            Earn points on your purchases with one of our debit cards. Then redeem them for Airline Miles and other rewards.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <Link to="/register" style={{
              display: 'inline-block', background: '#fff', color: '#000', padding: '16px 32px', borderRadius: '9999px',
              textDecoration: 'none', fontSize: '1rem', fontWeight: 700
            }}>Start earning</Link>
          </div>
        </div>

        {/* OVERLAPPING METAL CARDS */}
        <div style={{ position: 'relative', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', perspective: '1500px' }}>
          {[
            { bg: 'linear-gradient(135deg, #e000ff, #001aff)', delay: 0 },
            { bg: 'linear-gradient(135deg, #aaaaaa, #666666)', delay: 0.1 },
            { bg: 'linear-gradient(135deg, #222222, #050505)', delay: 0.2 },
            { bg: 'linear-gradient(135deg, #d4af37, #aa8529)', delay: 0.3 } // Goldish metal
          ].map((card, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: 100, rotateY: -30, zZ: -100 * i }}
              whileInView={{ opacity: 1, x: 0, rotateY: -15, zZ: 0 }}
              transition={{ duration: 0.8, delay: card.delay, type: 'spring' }}
              viewport={{ margin: '-100px' }}
              className="premium-card"
              style={{
                width: '260px', height: '380px', background: card.bg, padding: '32px 24px', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', zIndex: 10 - i, transformOrigin: 'center right',
                marginLeft: i !== 0 ? '-100px' : '0' // Overlapping effect
              }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.05em', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>SecureBank</div>
              </div>
              <div style={{ width: '40px', height: '30px', background: 'rgba(255,255,255,0.3)', borderRadius: '6px', backdropFilter: 'blur(2px)' }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ MEGA FOOTER ═══════════════════ */}
      <footer style={{ background: '#18181b', color: '#a1a1aa', padding: '80px 48px 40px', fontSize: '0.9375rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px', marginBottom: '80px' }}>
            <div>
              <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.05em', marginBottom: '24px' }}>SecureBank</div>
              <p style={{ lineHeight: 1.6, marginBottom: '24px' }}>One app, all things money. We're building a global financial superapp.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ color: '#fff', fontWeight: 700, marginBottom: '8px' }}>Personal</div>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Accounts</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Cards</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ color: '#fff', fontWeight: 700, marginBottom: '8px' }}>Business</div>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Corporate Cards</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ color: '#fff', fontWeight: 700, marginBottom: '8px' }}>Company</div>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>About us</a>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #27272a', paddingTop: '40px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
            <div>© 2026 SecureBank. Educational project only. Not a real bank.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
