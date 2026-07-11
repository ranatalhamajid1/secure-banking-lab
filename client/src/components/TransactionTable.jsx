import React from 'react';
import { ArrowDownRight, ArrowUpRight, Inbox, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const TransactionTable = ({ transactions, userEmail }) => {
  const displayTxs = transactions.slice(0, 10);

  return (
    <div className="glass-panel" style={{ padding: '24px', flex: '1 1 100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>Recent Activity</h3>
        {transactions.length > 10 && (
          <Link to="/transactions" style={{ fontSize: '0.875rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            View All
          </Link>
        )}
      </div>

      {transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-ultra-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', position: 'relative' }}>
            <Inbox size={40} />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{ position: 'absolute', inset: -10, border: '2px dashed var(--accent)', borderRadius: '50%', opacity: 0.3 }}
            />
          </div>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-heading)' }}>No transactions yet</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '24px' }}>
            Your transaction history will appear here.
          </p>
          <Link to="/dashboard" className="btn-primary" style={{ display: 'inline-flex', padding: '10px 24px', textDecoration: 'none' }}>
            Send Money <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {displayTxs.map((tx, i) => {
            const isSender = userEmail ? tx.sender?.email === userEmail : false; // Handle admin view when userEmail is null
            const isIncome = !isSender;
            
            return (
              <motion.div
                key={tx._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'transparent',
                  transition: 'background 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: isIncome ? 'var(--success-bg)' : 'var(--danger-bg)',
                  color: isIncome ? 'var(--success)' : 'var(--danger)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginRight: '16px', flexShrink: 0
                }}>
                  {isIncome ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {isIncome ? (tx.sender?.name || tx.sender?.email || 'Unknown') : (tx.receiver?.name || tx.receiver?.email || 'Unknown')}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                    {new Date(tx.createdAt || tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>

                <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700, color: isIncome ? 'var(--success)' : 'var(--text-heading)' }}>
                    {isIncome ? '+' : '-'}${tx.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: tx.status === 'SUCCESS' ? 'var(--success)' : 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {tx.status || 'SUCCESS'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
