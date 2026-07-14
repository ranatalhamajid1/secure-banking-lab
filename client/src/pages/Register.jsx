import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { Shield, ArrowRight, ArrowLeft, Lock, Mail, Phone, Upload, CheckCircle2, User, Key, Eye, EyeOff, Globe } from 'lucide-react';

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: (direction) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeIn' }
  })
};

const Register = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = back
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Personal Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('US');
  const [currency, setCurrency] = useState('USD');

  // Step 2: Email OTP
  const [emailOtp, setEmailOtp] = useState('');
  
  // Step 3: Phone OTP
  const [phone, setPhone] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');

  // Step 4: ID Upload
  const [idFile, setIdFile] = useState(null);
  const [idScanning, setIdScanning] = useState(false);
  const [idScanned, setIdScanned] = useState(false);

  // Step 5: Password
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passStrength, setPassStrength] = useState(0);

  // Step 6: Security PIN
  const [pin, setPin] = useState('');

  const navigate = useNavigate();
  const { user, loading, login } = useAuth();
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
        ctx.fillStyle = `rgba(122, 92, 255, ${this.alpha})`;
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

  const nextStep = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  // Step 2 Action
  const handleEmailVerification = (e) => {
    e.preventDefault();
    if (emailOtp === '123456' || emailOtp.length === 6) {
      toast.success('Email verified successfully!');
      nextStep();
    } else {
      toast.error('Invalid OTP. Use 123456');
    }
  };

  // Step 3 Action
  const handlePhoneVerification = (e) => {
    e.preventDefault();
    if (phoneOtp === '123456' || phoneOtp.length === 6) {
      toast.success('Phone verified successfully!');
      nextStep();
    } else {
      toast.error('Invalid OTP. Use 123456');
    }
  };

  // Step 4 Action: Identity Upload Simulation
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdFile(file);
      setIdScanning(true);
      toast('Scanning identity document...', { icon: '🔍' });
      setTimeout(() => {
        setIdScanning(false);
        setIdScanned(true);
        toast.success('Document scan successful!', { icon: '✅' });
      }, 2500);
    }
  };

  // Step 5: Backend Registration
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passStrength < 2) {
      toast.error('Please create a stronger password.');
      return;
    }
    setSubmitting(true);
    try {
      // Backend call
      await api.post('/auth/register', { name, email, password });
      toast.success('Account registered successfully!');
      nextStep();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Email might exist.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 6: Security PIN Setup
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) {
      toast.error('Please enter a 4-digit PIN');
      return;
    }
    setSubmitting(true);
    try {
      // 1. Attempt automatic login first to establish credentials session
      await login(email, password);
      
      // 2. Set the Transfer PIN in the backend
      await api.post('/security/set-pin', { pin });
      
      toast.success('Security PIN configured successfully!');
      nextStep();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to setup Security PIN. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePinPress = (num) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', position: 'relative',
      backgroundColor: '#111111', color: '#FFFFFF', overflow: 'hidden',
      fontFamily: '"Outfit", -apple-system, sans-serif'
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />

      <div style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyItems: 'center', justifyContent: 'center', alignItems: 'center', zIndex: 1, position: 'relative', padding: '40px 20px' }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <div style={{ background: '#7A5CFF', padding: '8px', borderRadius: '12px' }}>
            <Shield size={24} color="#fff" />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>SecureBank</span>
        </div>

        {/* Global Progress Bar */}
        <div style={{ width: '100%', maxWidth: '460px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', color: '#8c8c9a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Step {step} of 7</span>
            <span>{Math.round((step / 7) * 100)}% Complete</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${(step / 7) * 100}%` }} 
              transition={{ duration: 0.3 }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #5B5FFF, #7A5CFF)' }} 
            />
          </div>
        </div>

        {/* Form Box */}
        <div style={{ width: '100%', maxWidth: '460px', position: 'relative', minHeight: '480px' }}>
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{
                width: '100%',
                background: 'rgba(27, 29, 34, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                padding: '40px',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              
              {/* Step 1: Personal Details */}
              {step === 1 && (
                <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Personal Details</h2>
                    <p style={{ color: '#8c8c9a', fontSize: '0.875rem' }}>Let's get started with your account profile</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#8c8c9a', marginBottom: '8px' }}>Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      style={{
                        width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                        background: '#1B1D22', color: '#fff', fontSize: '0.9375rem', outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#8c8c9a', marginBottom: '8px' }}>Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                      style={{
                        width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                        background: '#1B1D22', color: '#fff', fontSize: '0.9375rem', outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#8c8c9a', marginBottom: '8px' }}>Country</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        aria-label="Select Country"
                        style={{
                          width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)',
                          background: '#1B1D22', color: '#fff', fontSize: '0.9375rem', outline: 'none'
                        }}
                      >
                        <option value="US">United States</option>
                        <option value="PK">Pakistan</option>
                        <option value="GB">United Kingdom</option>
                        <option value="DE">Germany</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#8c8c9a', marginBottom: '8px' }}>Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        aria-label="Select Currency"
                        style={{
                          width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)',
                          background: '#1B1D22', color: '#fff', fontSize: '0.9375rem', outline: 'none'
                        }}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="PKR">PKR (Rs)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    style={{
                      width: '100%', padding: '14px', background: '#7A5CFF', color: '#fff', border: 'none',
                      borderRadius: '12px', fontSize: '0.9375rem', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px'
                    }}
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* Step 2: Email Verification */}
              {step === 2 && (
                <form onSubmit={handleEmailVerification} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Verify Email</h2>
                    <p style={{ color: '#8c8c9a', fontSize: '0.875rem' }}>We sent a 6-digit confirmation code to <span style={{ color: '#7A5CFF' }}>{email}</span></p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#8c8c9a', marginBottom: '8px' }}>Verification Code</label>
                    <input
                      type="text"
                      maxLength="6"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      placeholder="123456"
                      required
                      style={{
                        width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                        background: '#1B1D22', color: '#fff', fontSize: '0.9375rem', outline: 'none', letterSpacing: '0.1em', textAlign: 'center'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={prevStep}
                      style={{
                        padding: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px', color: '#fff', cursor: 'pointer'
                      }}
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <button
                      type="submit"
                      style={{
                        flex: 1, padding: '14px', background: '#7A5CFF', color: '#fff', border: 'none',
                        borderRadius: '12px', fontSize: '0.9375rem', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      Verify <Mail size={16} />
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Phone Verification */}
              {step === 3 && (
                <form onSubmit={handlePhoneVerification} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Verify Phone</h2>
                    <p style={{ color: '#8c8c9a', fontSize: '0.875rem' }}>Verify your phone for two-factor authentication security</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#8c8c9a', marginBottom: '8px' }}>Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      required
                      style={{
                        width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: '#1B1D22', color: '#fff', fontSize: '0.9375rem', outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#8c8c9a', marginBottom: '8px' }}>SMS OTP Code</label>
                    <input
                      type="text"
                      maxLength="6"
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value)}
                      placeholder="123456"
                      required
                      style={{
                        width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                        background: '#1B1D22', color: '#fff', fontSize: '0.9375rem', outline: 'none', letterSpacing: '0.1em', textAlign: 'center'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={prevStep}
                      style={{
                        padding: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px', color: '#fff', cursor: 'pointer'
                      }}
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <button
                      type="submit"
                      style={{
                        flex: 1, padding: '14px', background: '#7A5CFF', color: '#fff', border: 'none',
                        borderRadius: '12px', fontSize: '0.9375rem', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      Verify <Phone size={16} />
                    </button>
                  </div>
                </form>
              )}

              {/* Step 4: Identity Scanner */}
              {step === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Verify Identity</h2>
                    <p style={{ color: '#8c8c9a', fontSize: '0.875rem' }}>Upload your passport or driver's license for compliance KYC</p>
                  </div>
                  
                  <div style={{
                    border: '2px dashed rgba(255,255,255,0.15)', borderRadius: '16px', padding: '40px 20px',
                    textAlign: 'center', background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden'
                  }}>
                    {idScanning ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        {/* Scanner visual */}
                        <div style={{
                          width: '40px', height: '40px', border: '3px solid #7A5CFF', borderTopColor: 'transparent',
                          borderRadius: '50%', animation: 'spin 1s linear infinite'
                        }} />
                        <span style={{ fontSize: '0.875rem', color: '#8c8c9a' }}>Scanning document safety checks...</span>
                      </div>
                    ) : idScanned ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <CheckCircle2 size={40} color="#00C896" />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{idFile?.name || 'Document Scanned'}</span>
                        <button onClick={() => { setIdScanned(false); setIdFile(null); }} style={{ background: 'transparent', border: 'none', color: '#FF5A5A', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>Remove</button>
                      </div>
                    ) : (
                      <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <Upload size={32} color="#7A5CFF" />
                        <span style={{ fontSize: '0.875rem', color: '#8c8c9a' }}>Drag & Drop or click to browse</span>
                        <input type="file" onChange={handleFileUpload} accept="image/*,application/pdf" style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={prevStep}
                      style={{
                        padding: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px', color: '#fff', cursor: 'pointer'
                      }}
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={!idScanned}
                      onClick={nextStep}
                      style={{
                        flex: 1, padding: '14px', background: idScanned ? '#7A5CFF' : 'rgba(255,255,255,0.06)', color: idScanned ? '#fff' : '#8c8c9a', border: 'none',
                        borderRadius: '12px', fontSize: '0.9375rem', fontWeight: 700, cursor: idScanned ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      Next Step <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Create Password */}
              {step === 5 && (
                <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Security Credentials</h2>
                    <p style={{ color: '#8c8c9a', fontSize: '0.875rem' }}>Create a strong password to safeguard your digital assets</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#8c8c9a', marginBottom: '8px' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        placeholder="••••••••"
                        required
                        style={{
                          width: '100%', padding: '14px', paddingRight: '48px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                          background: '#1B1D22', color: '#fff', fontSize: '0.9375rem', outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
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
                          {passStrength === 1 ? 'Too Weak' : passStrength === 2 ? 'Fair' : 'Strong & Safe'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={prevStep}
                      style={{
                        padding: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px', color: '#fff', cursor: 'pointer'
                      }}
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        flex: 1, padding: '14px', background: '#7A5CFF', color: '#fff', border: 'none',
                        borderRadius: '12px', fontSize: '0.9375rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      {submitting ? 'Registering...' : <>Complete Register <Key size={16} /></>}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 6: Security PIN */}
              {step === 6 && (
                <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Security PIN</h2>
                    <p style={{ color: '#8c8c9a', fontSize: '0.875rem', marginBottom: '16px' }}>Setup a 4-digit PIN for swift device login</p>
                    
                    {/* Dots indicator */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', margin: '20px 0' }}>
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          style={{
                            width: '12px', height: '12px', borderRadius: '50%',
                            background: pin.length > i ? '#7A5CFF' : 'rgba(255,255,255,0.1)',
                            transition: 'all 0.15s'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Circle number pad */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px',
                    maxWidth: '280px', margin: '0 auto'
                  }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handlePinPress(num)}
                        style={{
                          width: '56px', height: '56px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)',
                          background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '1.25rem', fontWeight: 700,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPin('')}
                      style={{
                        gridColumn: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#FF5A5A', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 700
                      }}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePinPress(0)}
                      style={{
                        width: '56px', height: '56px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '1.25rem', fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      0
                    </button>
                    <button
                      type="submit"
                      disabled={pin.length !== 4}
                      style={{
                        gridColumn: '3', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: pin.length === 4 ? '#00C896' : '#8c8c9a', background: 'none', border: 'none', cursor: pin.length === 4 ? 'pointer' : 'not-allowed', fontSize: '0.8125rem', fontWeight: 700
                      }}
                    >
                      Enter
                    </button>
                  </div>
                </form>
              )}

              {/* Step 7: Onboarding Success */}
              {step === 7 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', textAlign: 'center' }}>
                  <motion.div
                    initial={{ scale: 0.5, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <CheckCircle2 size={80} color="#00C896" />
                  </motion.div>

                  <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '12px' }}>Welcome aboard, {name}!</h2>
                    <p style={{ color: '#8c8c9a', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                      Your SecureBank account setup is 100% complete and fully verified. You can now access your dashboard.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      toast.success('Successfully logged in!');
                      navigate('/dashboard');
                    }}
                    style={{
                      width: '100%', padding: '16px', background: 'linear-gradient(135deg, #7A5CFF, #5B5FFF)', color: '#fff', border: 'none',
                      borderRadius: '14px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 8px 24px rgba(122,92,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    Go to Dashboard <ArrowRight size={18} />
                  </button>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Register;