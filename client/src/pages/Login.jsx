import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { Shield, Lock, Eye, EyeOff, QrCode, Smartphone, LogIn, ChevronDown, Check, Globe } from 'lucide-react';
import api from '../api/axios';

const shakeVariants = {
  shake: {
    x: [0, -10, 10, -10, 10, -5, 5, 0],
    transition: { duration: 0.5 }
  },
  idle: { x: 0 }
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [tempToken, setTempToken] = useState(null);
  
  // Custom states for premium UX
  const [shakeState, setShakeState] = useState('idle');
  const [passStrength, setPassStrength] = useState(0); // 0 to 3
  const [isQrHovered, setIsQrHovered] = useState(false);
  const [qrTimeLeft, setQrTimeLeft] = useState(59);
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ code: 'US', dial: '+1', name: 'United States' });
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [phoneNumber, setPhoneNumber] = useState('');

  const navigate = useNavigate();
  const { user, loading, login, refreshUser } = useAuth();
  const canvasRef = useRef(null);

  // Background Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    const particleCount = 40;

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.alpha = Math.random() * 0.5 + 0.1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
      draw() {
        ctx.fillStyle = `rgba(91, 95, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      // Soft background glow
      const gradient = ctx.createRadialGradient(width * 0.5, height * 0.5, 10, width * 0.5, height * 0.5, Math.max(width, height) * 0.8);
      gradient.addColorStop(0, '#1B1D22');
      gradient.addColorStop(1, '#111111');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // QR Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setQrTimeLeft((prev) => (prev > 1 ? prev - 1 : 59));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <Loader />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (!val) {
      setPassStrength(0);
      return;
    }
    let score = 1;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
    setPassStrength(score);
  };

  const triggerShake = () => {
    setShakeState('shake');
    setTimeout(() => setShakeState('idle'), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    
    // Normalize target values depending on login type
    const targetEmail = loginMethod === 'email' ? email : `${phoneNumber.replace(/\D/g, '')}@securebank.phone`;

    try {
      if (needs2FA) {
        const res = await api.post('/auth/2fa/verify', { tempToken, code: twoFactorCode });
        toast.success(res.data.message, { id: 'login-success' });
        await refreshUser();
        navigate(user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
        return;
      }

      const result = await login(targetEmail, password);

      if (result?.requires2FA) {
        setNeeds2FA(true);
        setTempToken(result.tempToken);
        toast('Please enter your 2FA code', { icon: '🔐', id: '2fa-prompt' });
        setSubmitting(false);
        return;
      }

      toast.success('Welcome back to SecureBank!', { id: 'welcome-toast', duration: 3000 });
    } catch (error) {
      triggerShake();
      toast.error(error.response?.data?.message || 'Invalid email or password', { id: 'login-error' });
      setSubmitting(false);
    }
  };

  // Simulated Biometric Flow
  const triggerBiometricScan = () => {
    if (biometricScanning) return;
    setBiometricScanning(true);
    toast('Place your finger on scanner or look at camera...', { icon: '🤖', id: 'biometric-scanning' });
    
    setTimeout(() => {
      setBiometricScanning(false);
      // Autofill developer credentials and trigger signin
      setEmail('demo@securebank.com');
      setPassword('DemoPass123!');
      setPassStrength(3);
      toast.success('FaceID / Fingerprint recognized!', { icon: '👤', id: 'biometric-success' });
    }, 2000);
  };

  const countries = [
    { code: 'US', dial: '+1', name: 'United States' },
    { code: 'PK', dial: '+92', name: 'Pakistan' },
    { code: 'GB', dial: '+44', name: 'United Kingdom' },
    { code: 'EU', dial: '+49', name: 'Germany' }
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', position: 'relative',
      backgroundColor: '#111111', color: '#FFFFFF', overflow: 'hidden',
      fontFamily: '"Outfit", -apple-system, sans-serif'
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />

      <div style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', display: 'flex', zIndex: 1, position: 'relative' }}>
        
        {/* LEFT COLUMN: FORM */}
        <div style={{
          flex: '1 1 55%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '40px 60px', zIndex: 10
        }} className="form-column">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
            <div style={{ background: '#5B5FFF', padding: '8px', borderRadius: '12px' }}>
              <Shield size={24} color="#fff" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>SecureBank</span>
          </div>

          <motion.div
            variants={shakeVariants}
            animate={shakeState}
            style={{
              width: '100%', maxWidth: '440px',
              background: 'rgba(27, 29, 34, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '40px',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
            }}
          >
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>Welcome back</h2>
            <p style={{ color: '#8c8c9a', fontSize: '0.9375rem', marginBottom: '28px' }}>
              Access your digital assets with enterprise protection
            </p>

            {/* Switch Tabs */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
              <button 
                onClick={() => setLoginMethod('email')}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                  background: loginMethod === 'email' ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}>
                Email
              </button>
              <button 
                onClick={() => setLoginMethod('phone')}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                  background: loginMethod === 'phone' ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}>
                Phone
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {!needs2FA ? (
                <>
                  {loginMethod === 'email' ? (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#8c8c9a', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email address</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="email"
                          id="email"
                          aria-label="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          required
                          style={{
                            width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)',
                            background: '#1B1D22', color: '#fff', fontSize: '0.9375rem', outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#8c8c9a', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone number</label>
                      <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          style={{
                            padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)',
                            background: '#1B1D22', color: '#fff', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                          }}
                        >
                          <span>{selectedCountry.dial}</span>
                          <ChevronDown size={14} />
                        </button>
                        <input
                          type="tel"
                          id="phone"
                          aria-label="Phone number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="300 1234567"
                          required
                          style={{
                            flex: 1, padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)',
                            background: '#1B1D22', color: '#fff', fontSize: '0.9375rem', outline: 'none'
                          }}
                        />
                        {showCountryDropdown && (
                          <div style={{
                            position: 'absolute', top: '56px', left: 0, width: '220px', background: '#1B1D22',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', zIndex: 100, overflow: 'hidden'
                          }}>
                            {countries.map((c) => (
                              <div
                                key={c.code}
                                onClick={() => {
                                  setSelectedCountry(c);
                                  setShowCountryDropdown(false);
                                }}
                                style={{
                                  padding: '12px 16px', display: 'flex', justifyItems: 'center', justifyContent: 'space-between',
                                  fontSize: '0.875rem', cursor: 'pointer', background: selectedCountry.code === c.code ? 'rgba(91,95,255,0.1)' : 'transparent'
                                }}
                                className="country-item"
                              >
                                <span>{c.name} ({c.dial})</span>
                                {selectedCountry.code === c.code && <Check size={14} color="#5B5FFF" />}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#8c8c9a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                      <a href="#" style={{ color: '#5B5FFF', fontSize: '0.8125rem', textDecoration: 'none', fontWeight: 600 }}>Forgot?</a>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        aria-label="Password"
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        placeholder="••••••••"
                        required
                        style={{
                          width: '100%', padding: '16px', paddingRight: '48px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)',
                          background: '#1B1D22', color: '#fff', fontSize: '0.9375rem', outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility"
                        style={{
                          position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', color: '#8c8c9a', cursor: 'pointer'
                        }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {password && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ display: 'flex', gap: '4px', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ flex: 1, background: passStrength >= 1 ? (passStrength === 1 ? '#FF5A5A' : passStrength === 2 ? '#FFB020' : '#00C896') : 'rgba(255,255,255,0.1)' }} />
                          <div style={{ flex: 1, background: passStrength >= 2 ? (passStrength === 2 ? '#FFB020' : '#00C896') : 'rgba(255,255,255,0.1)' }} />
                          <div style={{ flex: 1, background: passStrength >= 3 ? '#00C896' : 'rgba(255,255,255,0.1)' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: passStrength === 1 ? '#FF5A5A' : passStrength === 2 ? '#FFB020' : '#00C896', marginTop: '6px', display: 'inline-block' }}>
                          {passStrength === 1 ? 'Weak' : passStrength === 2 ? 'Fair' : 'Strong'}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#8c8c9a', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>2FA Verification Code</label>
                  <input
                    type="text"
                    id="twoFactorCode"
                    aria-label="2FA Verification Code"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    maxLength="6"
                    placeholder="123456"
                    required
                    style={{
                      width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)',
                      background: '#1B1D22', color: '#fff', fontSize: '0.9375rem', outline: 'none', letterSpacing: '0.1em', textAlign: 'center'
                    }}
                  />
                  <small style={{ color: '#8c8c9a', marginTop: '8px', display: 'block' }}>Enter the 6-digit code from your authenticator application.</small>
                </div>
              )}

              {/* Continue Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%', padding: '16px', background: '#5B5FFF', color: '#fff', border: 'none',
                  borderRadius: '14px', fontSize: '0.9375rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 20px rgba(91,95,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'opacity 0.2s'
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
                ) : (
                  <>Continue <LogIn size={16} /></>
                )}
              </button>

              {/* Bio Auth Button */}
              {!needs2FA && (
                <button
                  type="button"
                  onClick={triggerBiometricScan}
                  disabled={biometricScanning}
                  style={{
                    width: '100%', padding: '14px', background: 'transparent', border: '1px dashed rgba(255,255,255,0.15)',
                    borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    color: '#fff', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.875rem'
                  }}
                >
                  <motion.div animate={biometricScanning ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: Infinity, duration: 1 }}>
                    <Smartphone size={16} color="#00C896" />
                  </motion.div>
                  {biometricScanning ? 'Verifying biometrics...' : 'Use TouchID / FaceID'}
                </button>
              )}
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '12px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: '0.75rem', color: '#8c8c9a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Social Logins */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <button 
                type="button"
                onClick={() => toast.success('Google Authentication Initialized')}
                style={{
                  padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.8125rem', fontWeight: 600
                }}>
                <Globe size={14} /> Google
              </button>
              <button 
                type="button"
                onClick={() => toast.success('Apple Authentication Initialized')}
                style={{
                  padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.8125rem', fontWeight: 600
                }}>
                <Lock size={14} /> Apple
              </button>
            </div>

            <p style={{ textAlign: 'center', color: '#8c8c9a', fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#5B5FFF', fontWeight: 700, textDecoration: 'none' }}>Create one</Link>
            </p>

          </motion.div>
        </div>

        {/* RIGHT COLUMN: BRAND & QR LOGIN PANEL */}
        <div style={{
          flex: '1 1 45%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          alignItems: 'center', padding: '40px 60px', zIndex: 10, position: 'relative'
        }} className="qr-column">
          
          {/* Decorative Ring */}
          <div style={{
            position: 'absolute', width: '380px', height: '380px', borderRadius: '50%',
            border: '1px dashed rgba(91,95,255,0.15)', animation: 'spin 120s linear infinite', pointerEvents: 'none'
          }} />

          {/* QR Panel Card */}
          <motion.div
            onHoverStart={() => setIsQrHovered(true)}
            onHoverEnd={() => setIsQrHovered(false)}
            animate={{ y: isQrHovered ? -5 : 0 }}
            style={{
              background: 'rgba(27, 29, 34, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '36px',
              backdropFilter: 'blur(24px)',
              textAlign: 'center',
              width: '100%',
              maxWidth: '340px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ position: 'relative', display: 'inline-block', background: '#fff', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
              <QrCode size={160} color="#111" />
              {/* Scan target visual */}
              <div style={{
                position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px',
                border: '2px solid #5B5FFF', borderRadius: '12px', animation: 'pulse 2s infinite', pointerEvents: 'none'
              }} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Login with QR</h3>
            <p style={{ color: '#8c8c9a', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '16px' }}>
              Scan this code with your SecureBank mobile app to sign in instantly.
            </p>
            <div style={{ fontSize: '0.75rem', color: '#8c8c9a', background: 'rgba(255,255,255,0.04)', padding: '6px 12px', borderRadius: '20px', display: 'inline-block' }}>
              Expires in <span style={{ color: '#5B5FFF', fontWeight: 700 }}>{qrTimeLeft}s</span>
            </div>
          </motion.div>

          {/* Security Status Box */}
          <div style={{
            marginTop: '32px', width: '100%', maxWidth: '340px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255, 255, 255, 0.04)',
            borderRadius: '16px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span style={{ color: '#8c8c9a' }}>Secure Connection</span>
              <span style={{ color: '#00C896', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00C896' }} /> SSL Active
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span style={{ color: '#8c8c9a' }}>Device Safety Score</span>
              <span style={{ color: '#5B5FFF', fontWeight: 700 }}>98/100 (Safe)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span style={{ color: '#8c8c9a' }}>Last Login IP</span>
              <span style={{ color: '#8c8c9a' }}>192.168.1.1 (Today)</span>
            </div>
          </div>

        </div>

      </div>

      {/* Styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.8; }
          100% { opacity: 0.3; }
        }
        @media (max-width: 900px) {
          .qr-column { display: none !important; }
          .form-column { flex: 1 1 100% !important; padding: 24px !important; align-items: center !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;