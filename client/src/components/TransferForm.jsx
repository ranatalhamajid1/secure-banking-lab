import React, { useState, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Send, ArrowRight, CheckCircle, XCircle, Download, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const executeTransfer = async () => {

  if (loading) return;

  const pinVal = pinRef.current?.value;

  if (!pinVal || pinVal.length !== 4) {
    return toast.error("Please enter a 4-digit PIN");
  }

  setLoading(true);

  try {

    // existing code

  } finally {

    setLoading(false);

  }

}

const TransferForm = ({ onTransferSuccess }) => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const amountRef = useRef(null);
  const pinRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState({ email: '', amount: '' });
  const [status, setStatus] = useState('idle'); // 'idle', 'success', 'pending', 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [transactionData, setTransactionData] = useState(null);

  const recentContacts = [
    { initial: 'J', email: 'john@example.com', color: '#3b82f6' },
    { initial: 'S', email: 'sarah@example.com', color: '#10b981' },
    { initial: 'M', email: 'mike@example.com', color: '#f59e0b' },
    { initial: 'A', email: 'alice@example.com', color: '#8b5cf6' },
  ];

  const handlePreSubmit = (e) => {
    e.preventDefault();

    if (loading || showConfirm) return;

    if (!user?.hasTransferPin) {
      toast.error("Please setup Transfer PIN first");
      navigate("/security");
      return;
    }

    const emailVal = emailRef.current?.value;
    const amountVal = amountRef.current?.value;

    if (!emailVal || !amountVal) {
      toast.error('Please fill all fields');
      return;
    }

    if (isNaN(amountVal) || Number(amountVal) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setConfirmData({ email: emailVal, amount: amountVal });
    setShowConfirm(true);
  };

  const executeTransfer = async () => {
    const pinVal = pinRef.current?.value;
    if (!pinVal || pinVal.length !== 4) return toast.error('Please enter a 4-digit PIN');
    setLoading(true);
    try {
      const res = await api.post('/transactions/transfer', {
        receiverEmail: confirmData.email,
        amount: Number(confirmData.amount),
        pin: pinVal
      });
      if (res.data.status === 'pending') {
        setStatus('pending');
      } else {
        setTransactionData(res.data.receipt);
        setStatus('success');
      }
      if (onTransferSuccess) {
        await onTransferSuccess();
      }
      // Force user refresh to update balance immediately
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error) {
      setStatus('error');
      setErrorMsg(error.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowConfirm(false);
    setLoading(false);
    setStatus('idle');
    if (emailRef.current) emailRef.current.value = '';
    if (amountRef.current) amountRef.current.value = '';
    if (pinRef.current) pinRef.current.value = '';
    setConfirmData({ email: '', amount: '' });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-panel"
        style={{ padding: '24px', flex: '1 1 300px', minWidth: '280px', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'var(--accent-light)', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Send size={16} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>Quick Transfer</h3>
        </div>

        {/* Recent Contacts */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Contacts</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            {recentContacts.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (emailRef.current) emailRef.current.value = c.email;
                }}
                title={c.email}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: c.color + '20', color: c.color, border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {c.initial}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handlePreSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Recipient Email
            </label>
            <input
              type="email"
              ref={emailRef}
              className="input-field"
              placeholder="john@example.com"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Amount
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: 600 }}>$</span>
              <input
                type="number"
                ref={amountRef}
                className="input-field"
                placeholder="0.00"
                min="1"
                step="0.01"
                required
                style={{ paddingLeft: '32px', fontSize: '1.25rem', fontWeight: 600, height: '56px' }}
              />
            </div>
          </div>
          <button type="submit" disabled={loading || showConfirm} className="btn-primary" style={{ marginTop: 'auto', width: '100%', padding: '16px' }}>
            <ArrowRight size={18} /> {loading ? "Processing..." : "Send Money"}
          </button>
        </form>
      </motion.div>

      {/* Confirmation/Success Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-content"
              style={{ padding: '32px', maxWidth: '400px', width: '90%', textAlign: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
            >
              {status === 'idle' && (
                <>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Send size={28} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Confirm Transfer</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '24px' }}>
                    You are about to send money to<br />
                    <strong style={{ color: 'var(--text-primary)' }}>{confirmData.email}</strong>
                  </p>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '32px', letterSpacing: '-0.02em' }}>
                    ${Number(confirmData.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      Enter 4-Digit Transfer PIN
                    </label>
                    <input
                      type="password"
                      ref={pinRef}
                      onChange={(e) => {
                        e.target.value = e.target.value.replace(/\D/g, '');
                      }}
                      className="input-field"
                      placeholder="••••"
                      maxLength="4"
                      required
                      style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.25rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => { setShowConfirm(false); setLoading(false); }} disabled={false}>
                      Cancel
                    </button>
                    <button type="button" className="btn-primary" style={{ flex: 1 }} onClick={executeTransfer} disabled={loading}>
                      {loading ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                </>
              )}

              {status === 'success' && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'left' }}>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <CheckCircle size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-heading)' }}>✅ Transfer Successful</h3>
                  </div>

                  <div style={{ background: 'var(--bg-primary)', borderRadius: '16px', padding: '20px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Reference</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{transactionData?.reference || 'Pending...'}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Amount</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>${Number(transactionData?.amount || confirmData.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>From</span>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{transactionData?.sender?.name || user?.name || 'You'}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>To</span>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{transactionData?.receiver?.name || confirmData.email}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                      <span style={{ fontWeight: 600, color: 'var(--success)' }}>{transactionData?.status?.toUpperCase() || 'SUCCESS'}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Date</span>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {transactionData ? new Date(transactionData.createdAt).toLocaleString('en-US', { dateStyle: 'long' }) : new Date().toLocaleString('en-US', { dateStyle: 'long' })}
                      </span>
                    </div>

                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <button type="button" className="btn-secondary" style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => toast.success('Receipt downloaded')}>
                      <Download size={16} /> Download
                    </button>
                    <button type="button" className="btn-secondary" style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => toast.success('Printing receipt...')}>
                      <Printer size={16} /> Print
                    </button>
                  </div>

                  <button type="button" className="btn-primary" style={{ width: '100%', padding: '16px' }} onClick={resetForm}>
                    Back to Dashboard
                  </button>
                </motion.div>
              )}

              {status === 'pending' && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <CheckCircle size={40} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Manual Review Required</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '24px' }}>
                    Transfers over $5,000 require manual verification by our team. Your transfer of ${Number(confirmData.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} to {confirmData.email} is currently pending approval.
                  </p>
                  <button type="button" className="btn-primary" style={{ width: '100%' }} onClick={resetForm}>
                    Understood
                  </button>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--danger-bg)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <XCircle size={40} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Transfer Failed</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '24px' }}>
                    {errorMsg}
                  </p>
                  <button type="button" className="btn-secondary" style={{ width: '100%' }} onClick={() => setStatus('idle')}>
                    Try Again
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TransferForm;
