import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Shield, ShieldAlert, Smartphone, Key, Lock, MonitorSmartphone, CheckCircle, Trash2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Security = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorQr, setTwoFactorQr] = useState('');
  const [transferPin, setTransferPin] = useState('');
  const [pinSubmitting, setPinSubmitting] = useState(false);
  
  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await api.get('/security/devices');
      setDevices(res.data);
    } catch (error) {
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDevice = async (id) => {
    try {
      await api.delete(`/security/devices/${id}`);
      toast.success('Device removed');
      fetchDevices();
    } catch (error) {
      toast.error('Failed to remove device');
    }
  };

  const handleSetup2FA = async () => {
    try {
      const res = await api.post('/auth/2fa/setup');
      setTwoFactorSecret(res.data.data.secret);
      setTwoFactorQr(res.data.data.qrCode);
      setShow2FAModal(true);
      toast.success('2FA Setup Initialized');
    } catch (error) {
      toast.error('Failed to setup 2FA');
    }
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    if (transferPin.length !== 4) return toast.error('PIN must be 4 digits');
    setPinSubmitting(true);
    try {
      await api.post('/security/set-pin', { pin: transferPin });
      toast.success('Transfer PIN set successfully!');
      setTransferPin('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set PIN');
    } finally {
      setPinSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
            <Shield size={24} color="var(--accent)" />
            <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-heading)' }}>Security Center</h1>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            
            {/* Score Card */}
            <div className="glass-panel" style={{ padding: '32px', flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '24px' }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="45" fill="transparent" stroke="var(--border-color)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="transparent" stroke="var(--success)" strokeWidth="8" strokeDasharray="283" strokeDashoffset="42" strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>85</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600 }}>/100</span>
                </div>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Security Score</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '24px' }}>Your account is well protected. Complete the checklist to reach 100.</p>
            </div>

            {/* Checklist */}
            <div className="glass-panel" style={{ padding: '32px', flex: '2 1 400px' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '24px', color: 'var(--text-heading)' }}>Security Checklist</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <CheckCircle size={24} color="var(--success)" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>Email Verified</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Your email address has been verified.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <CheckCircle size={24} color="var(--success)" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>Strong Password</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>You are using a strong password. Last changed 3 months ago.</p>
                  </div>
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8125rem' }}>Change</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', background: 'var(--warning-bg)', borderRadius: '12px', border: '1px solid var(--warning)' }}>
                  <ShieldAlert size={24} color="var(--warning)" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--warning)' }}>Two-Factor Authentication</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--warning)' }}>Add an extra layer of security to your account.</p>
                  </div>
                  <button className="btn-primary" onClick={handleSetup2FA} style={{ padding: '6px 12px', fontSize: '0.8125rem' }}>Enable</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <Key size={24} color="var(--accent)" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-heading)' }}>Transfer PIN</h4>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Required for transferring funds and revealing your virtual card CVV.</p>
                    <form onSubmit={handleSetPin} style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="password" 
                        maxLength="4" 
                        placeholder="4-digit PIN"
                        value={transferPin}
                        onChange={(e) => setTransferPin(e.target.value.replace(/\D/g, ''))}
                        className="input-field" 
                        style={{ width: '120px', padding: '6px 12px', textAlign: 'center', letterSpacing: '4px' }}
                      />
                      <button type="submit" disabled={pinSubmitting} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8125rem' }}>Set PIN</button>
                    </form>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Login History */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '24px', color: 'var(--text-heading)' }}>Recent Login Activity</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.8125rem' }}>Device</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.8125rem' }}>Location</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.8125rem' }}>Date</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.8125rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((item) => (
                    <tr key={item._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                          <MonitorSmartphone size={18} />
                        </div>
                        {item.deviceName}
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>{item.ip}</td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                        {new Date(item.lastLogin).toLocaleString()}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button 
                          onClick={() => handleRemoveDevice(item._id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '90%'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem' }}>Two-Factor Authentication Setup</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'center' }}>
                Scan this QR code with Google Authenticator, Authy, or your preferred TOTP app.
              </p>
              {twoFactorQr && (
                <img src={twoFactorQr} alt="2FA QR Code" style={{ width: '200px', height: '200px', marginBottom: '16px', borderRadius: '8px', border: '4px solid white' }} />
              )}
              <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                Manual entry code: <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{twoFactorSecret}</strong>
              </p>
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShow2FAModal(false)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;
