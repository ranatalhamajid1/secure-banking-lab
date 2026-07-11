import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Snowflake, Lock, Globe, MonitorSmartphone, Store, Landmark, RefreshCw } from 'lucide-react';

const Card3DFlip = ({ card, isFlipped, onClick }) => {
  return (
    <div 
      style={{ perspective: '1000px', width: '380px', height: '240px', cursor: 'pointer', margin: '0 auto' }}
      onClick={onClick}
    >
      <motion.div
        style={{
          width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d',
        }}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* FRONT */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
          borderRadius: '16px', background: 'linear-gradient(135deg, #1e1e2d 0%, #0f0f17 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden'
        }}>
          {card.status === 'frozen' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(2px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'rgba(0,0,0,0.6)', padding: '12px 24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: 600 }}>
                <Snowflake size={18} color="#06b6d4" /> FROZEN
              </div>
            </div>
          )}
          
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent)', opacity: 0.15, filter: 'blur(40px)', borderRadius: '50%' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>SecureBank</span>
            <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="#EB001B" opacity="0.8"/>
              <circle cx="28" cy="12" r="12" fill="#F79E1B" opacity="0.8"/>
            </svg>
          </div>

          <div style={{ zIndex: 1 }}>
            <div style={{ width: '48px', height: '36px', background: 'linear-gradient(135deg, #ffd700, #b8860b)', borderRadius: '6px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.2)' }} />
            <p style={{ fontSize: '1.25rem', letterSpacing: '2px', color: '#fff', margin: '0 0 8px 0', fontFamily: 'monospace' }}>
              {card.maskedNumber}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
              <span>{card.cardHolderName.toUpperCase()}</span>
              <span>{card.expiryDate}</span>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
          borderRadius: '16px', background: '#0a0a0f',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ width: '100%', height: '48px', background: '#000', marginTop: '32px' }} />
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, height: '36px', background: '#e0e0e0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 12px' }}>
                <span style={{ color: '#000', fontWeight: 600, fontFamily: 'monospace', fontStyle: 'italic' }}>{card.cvv || '***'}</span>
              </div>
            </div>
            {card.fullCardNumber && (
              <p style={{ marginTop: '16px', color: 'var(--text-tertiary)', fontSize: '0.75rem', textAlign: 'center' }}>
                {card.fullCardNumber.match(/.{1,4}/g).join(' ')}
              </p>
            )}
            <p style={{ marginTop: '16px', color: 'var(--text-tertiary)', fontSize: '0.625rem', textAlign: 'center' }}>
              This card is for virtual use only. Never share your CVV with anyone.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Cards = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [togglingFreeze, setTogglingFreeze] = useState(false);

  // Reveal CVV states
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [revealPin, setRevealPin] = useState('');
  const [revealing, setRevealing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const fetchCards = async () => {
    try {
      const res = await api.get('/cards');
      setCards(res.data);
    } catch (err) {
      toast.error('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && cards[activeCardIndex]?.cvv) {
      // Hide details after timer
      const updatedCards = [...cards];
      updatedCards[activeCardIndex].cvv = null;
      updatedCards[activeCardIndex].fullCardNumber = null;
      setCards(updatedCards);
      setIsFlipped(false);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, cards, activeCardIndex]);

  const handleGenerateCard = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/cards/create');
      toast.success(res.data.message);
      // We push the new card with full details (including CVV) so user can see it once
      setCards([...cards, res.data.card]);
      setActiveCardIndex(cards.length);
      // Auto flip to back to show CVV
      setTimeout(() => setIsFlipped(true), 500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create card');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleFreeze = async () => {
    const card = cards[activeCardIndex];
    if (!card) return;
    setTogglingFreeze(true);
    try {
      const res = await api.patch(`/cards/${card._id}/freeze`);
      toast.success(res.data.message);
      const updatedCards = [...cards];
      updatedCards[activeCardIndex].status = res.data.card.status;
      setCards(updatedCards);
      setIsFlipped(false);
    } catch (err) {
      toast.error('Failed to update card status');
    } finally {
      setTogglingFreeze(false);
    }
  };

  const handleTogglePermission = async (key, value) => {
    const card = cards[activeCardIndex];
    if (!card || card.status === 'frozen') return;
    
    // Optimistic update
    const updatedCards = [...cards];
    updatedCards[activeCardIndex].permissions[key] = value;
    setCards(updatedCards);

    try {
      await api.patch(`/cards/${card._id}/permissions`, {
        permissions: { [key]: value }
      });
    } catch (err) {
      toast.error('Failed to update permission');
      // Revert on error
      updatedCards[activeCardIndex].permissions[key] = !value;
      setCards([...updatedCards]);
    }
  };

  const handleRevealSubmit = async (e) => {
    e.preventDefault();
    if (revealPin.length !== 4) return toast.error('PIN must be 4 digits');
    setRevealing(true);
    
    try {
      const card = cards[activeCardIndex];
      const res = await api.post(`/cards/${card._id}/reveal-cvv`, { pin: revealPin });
      
      const updatedCards = [...cards];
      updatedCards[activeCardIndex].cvv = res.data.cvv;
      updatedCards[activeCardIndex].fullCardNumber = res.data.cardNumber;
      setCards(updatedCards);
      
      setShowRevealModal(false);
      setRevealPin('');
      toast.success('Details revealed for 20 seconds');
      setIsFlipped(true);
      setTimeLeft(20);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reveal details';
      toast.error(msg);
      if (err.response?.data?.cardDeleted) {
        // Card was corrupted and deleted by the server — refresh list
        fetchCards();
        setActiveCardIndex(0);
        setShowRevealModal(false);
        setRevealPin('');
      }
    } finally {
      setRevealing(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Navbar />
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <RefreshCw className="spin" size={32} color="var(--accent)" />
          </div>
        </main>
      </div>
    );
  }

  const activeCard = cards[activeCardIndex];

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px', margin: '0 auto', width: '100%', paddingBottom: '40px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <h1 style={{ fontSize: '1.75rem', margin: 0, color: 'var(--text-heading)' }}>My Cards</h1>
            {cards.length === 0 && (
              <button onClick={handleGenerateCard} disabled={generating} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} /> {generating ? 'Generating...' : 'Get Virtual Card'}
              </button>
            )}
          </div>

          {cards.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <CreditCard size={40} color="var(--text-secondary)" />
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>No cards yet</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '400px' }}>
                Generate a free virtual card instantly to shop securely online and manage your subscriptions.
              </p>
              <button onClick={handleGenerateCard} disabled={generating} className="btn-primary" style={{ padding: '12px 32px' }}>
                {generating ? 'Creating...' : 'Generate Free Card'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              
              {/* Left Column: Card Visual & Actions */}
              <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ padding: '32px 0', display: 'flex', justifyContent: 'center' }}>
                  <Card3DFlip 
                    card={activeCard} 
                    isFlipped={isFlipped} 
                    onClick={() => setIsFlipped(!isFlipped)} 
                  />
                  <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                    Tap card to flip
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--text-heading)' }}>Card Controls</h3>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                      onClick={handleToggleFreeze}
                      disabled={togglingFreeze}
                      style={{ 
                        flex: 1, padding: '16px', borderRadius: '12px', border: `1px solid ${activeCard.status === 'frozen' ? 'var(--accent)' : 'var(--border-color)'}`,
                        background: activeCard.status === 'frozen' ? 'var(--accent-ultra-light)' : 'var(--bg-secondary)',
                        color: activeCard.status === 'frozen' ? 'var(--accent)' : 'var(--text-primary)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <Snowflake size={24} />
                      <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                        {activeCard.status === 'frozen' ? 'Unfreeze Card' : 'Freeze Card'}
                      </span>
                    </button>

                    <button 
                      onClick={() => setShowRevealModal(true)}
                      disabled={activeCard.status === 'frozen' || timeLeft > 0}
                      style={{ 
                      flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', 
                      cursor: (activeCard.status === 'frozen' || timeLeft > 0) ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                    }}>
                      <Lock size={24} color={timeLeft > 0 ? "var(--success)" : "currentColor"} />
                      <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                        {timeLeft > 0 ? `Hiding in ${timeLeft}s` : 'Reveal Details'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Permissions & Limits */}
              <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                <div className="glass-panel" style={{ padding: '32px' }}>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '24px', color: 'var(--text-heading)' }}>Card Permissions</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {[
                      { key: 'onlinePayments', icon: <Globe size={20} />, title: 'Online Payments', desc: 'Allow purchases on websites and apps' },
                      { key: 'internationalTransactions', icon: <Landmark size={20} />, title: 'International Transactions', desc: 'Allow payments outside your country' },
                      { key: 'posPayments', icon: <Store size={20} />, title: 'In-Store Shopping / POS', desc: 'Allow contactless & chip payments' },
                      { key: 'atmWithdrawals', icon: <MonitorSmartphone size={20} />, title: 'ATM Withdrawals', desc: 'Allow cash withdrawals at ATMs' },
                    ].map(perm => (
                      <div key={perm.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', opacity: activeCard.status === 'frozen' ? 0.5 : 1 }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <div style={{ color: activeCard.permissions[perm.key] ? 'var(--accent)' : 'var(--text-tertiary)' }}>
                            {perm.icon}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{perm.title}</p>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: 0 }}>{perm.desc}</p>
                          </div>
                        </div>
                        
                        {/* Toggle Switch */}
                        <div 
                          onClick={() => handleTogglePermission(perm.key, !activeCard.permissions[perm.key])}
                          style={{ 
                            width: '44px', height: '24px', borderRadius: '12px', 
                            background: activeCard.permissions[perm.key] ? 'var(--success)' : 'var(--bg-secondary)', 
                            position: 'relative', cursor: activeCard.status === 'frozen' ? 'not-allowed' : 'pointer', transition: 'background 0.2s', 
                            border: `1px solid ${activeCard.permissions[perm.key] ? 'var(--success)' : 'var(--border-color)'}` 
                          }}
                        >
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '1px', left: activeCard.permissions[perm.key] ? '21px' : '1px', transition: 'left 0.2s' }} />
                        </div>
                      </div>
                    ))}

                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '32px' }}>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '24px', color: 'var(--text-heading)' }}>Spending Limits</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Daily Limit</span>
                        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>$0 / ${activeCard.spendingLimit.daily}</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '0%', height: '100%', background: 'var(--accent)', borderRadius: '4px' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Monthly Limit</span>
                        <span style={{ fontWeight: 600, color: 'var(--success)' }}>$240 / ${activeCard.spendingLimit.monthly}</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '5%', height: '100%', background: 'var(--success)', borderRadius: '4px' }} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* Reveal CVV Modal */}
      <AnimatePresence>
        {showRevealModal && (
          <div className="modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-content glass-panel"
              style={{ padding: '32px', maxWidth: '400px', width: '90%' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Lock size={28} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px 0' }}>Security Check</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0 }}>
                  Enter your Transfer PIN to reveal card details. Details will be visible for 20 seconds.
                </p>
              </div>

              <form onSubmit={handleRevealSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <input
                    type="password"
                    value={revealPin}
                    onChange={(e) => setRevealPin(e.target.value.replace(/\D/g, ''))}
                    className="input-field"
                    placeholder="••••"
                    maxLength="4"
                    required
                    style={{ textAlign: 'center', letterSpacing: '12px', fontSize: '1.5rem', height: '60px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowRevealModal(false)} disabled={revealing}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={revealing || revealPin.length !== 4}>
                    {revealing ? 'Verifying...' : 'Reveal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cards;
