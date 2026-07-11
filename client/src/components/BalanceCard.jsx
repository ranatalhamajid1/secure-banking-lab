import React, { useEffect } from 'react';
import Card3D from './Card3D';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { Wallet, ArrowUpRight } from 'lucide-react';

const BalanceCard = ({ user }) => {
  const balance = user?.accountBalance || 0;
  
  // Animation logic for balance
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return "$" + latest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  });

  useEffect(() => {
    const controls = animate(count, balance, { duration: 1.5, ease: "easeOut" });
    return controls.stop;
  }, [balance, count]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel"
      style={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        overflow: 'hidden',
        position: 'relative',
        width: '100%'
      }}
    >
      {/* Decorative gradient orb */}
      <div style={{
        position: 'absolute', top: '-50%', left: '-20%', width: '300px', height: '300px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ padding: '32px', flex: '1 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--accent-light)', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Wallet size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-heading)' }}>Primary Account</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>•••• 4526</span>
              <span className="badge badge-active">Active</span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px', fontWeight: 500 }}>
            Available Balance
          </p>
          <motion.h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', margin: 0, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-heading)' }}>
            {rounded}
          </motion.h1>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--success-bg)', color: 'var(--success)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 600 }}>
            <ArrowUpRight size={14} /> 12.5% vs last month
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-input)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 500 }}>
            Income $4,250.00
          </div>
        </div>
      </div>

      <div style={{ flex: '1 1 380px', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: '420px', height: '100%', minHeight: '260px', position: 'relative' }}>
          <Card3D balance={user?.accountBalance} name={user?.name} />
        </div>
      </div>
    </motion.div>
  );
};

export default BalanceCard;
