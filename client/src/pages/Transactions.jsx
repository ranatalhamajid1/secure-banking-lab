import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import TransactionTable from '../components/TransactionTable';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Search, Filter, Download, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, sent, received
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTxs = async () => {
      try {
        const response = await api.get('/transactions/history');
        const data = response.data;
        setTransactions(Array.isArray(data) ? data : Array.isArray(data.transactions) ? data.transactions : []);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTxs();
  }, []);

  const filteredTxs = transactions.filter(tx => {
    const isSender = tx.sender?.email === user?.email;
    if (filter === 'sent' && !isSender) return false;
    if (filter === 'received' && isSender) return false;
    
    if (search) {
      const q = search.toLowerCase();
      const otherParty = isSender ? tx.receiver?.email?.toLowerCase() : tx.sender?.email?.toLowerCase();
      if (otherParty && !otherParty.includes(q)) return false;
    }
    
    return true;
  });

  const totalSent = transactions.filter(t => t.sender?.email === user?.email).reduce((sum, t) => sum + t.amount, 0);
  const totalReceived = transactions.filter(t => t.receiver?.email === user?.email).reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-heading)' }}>Transactions</h1>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={16} /> Export CSV
            </button>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RefreshCw size={18} />
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Transactions</p>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>{transactions.length}</h2>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--danger-bg)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowUpRight size={18} />
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Sent</p>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>${totalSent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowDownRight size={18} />
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Received</p>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>${totalReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
            </div>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* Filters */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '16px' }}>
              
              <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px' }}>
                <button 
                  onClick={() => setFilter('all')}
                  style={{ padding: '6px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem', background: filter === 'all' ? 'var(--bg-card)' : 'transparent', color: filter === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: filter === 'all' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilter('sent')}
                  style={{ padding: '6px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem', background: filter === 'sent' ? 'var(--bg-card)' : 'transparent', color: filter === 'sent' ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: filter === 'sent' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}
                >
                  Sent
                </button>
                <button 
                  onClick={() => setFilter('received')}
                  style={{ padding: '6px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem', background: filter === 'received' ? 'var(--bg-card)' : 'transparent', color: filter === 'received' ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: filter === 'received' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}
                >
                  Received
                </button>
              </div>

              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Search email..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input-field" 
                  style={{ paddingLeft: '36px', height: '40px' }}
                />
              </div>

            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading transactions...</div>
            ) : (
              <TransactionTable transactions={filteredTxs} userEmail={user?.email} />
            )}

          </div>

        </div>
      </main>
    </div>
  );
};

export default Transactions;
