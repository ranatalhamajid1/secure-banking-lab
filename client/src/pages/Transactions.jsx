import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransaction } from '../context/TransactionContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TransactionTable from '../components/TransactionTable';
import { motion } from 'framer-motion';
import { Search, ArrowDownRight, ArrowUpRight, RefreshCw, Filter } from 'lucide-react';
import Loader from '../components/Loader';

const Transactions = () => {
  const { user } = useAuth();
  const { transactions, transactionsLoading, refreshTransactions } = useTransaction();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, sent, received, pending, failed

  const filteredTransactions = useMemo(() => {
    let txs = [...transactions];

    // Search
    if (search.trim()) {
      const term = search.toLowerCase();
      txs = txs.filter(tx =>
        tx.sender?.name?.toLowerCase().includes(term) ||
        tx.sender?.email?.toLowerCase().includes(term) ||
        tx.receiver?.name?.toLowerCase().includes(term) ||
        tx.receiver?.email?.toLowerCase().includes(term) ||
        tx.reference?.toLowerCase().includes(term) ||
        String(tx.amount).includes(term)
      );
    }

    // Filter
    if (filter === 'sent') {
      txs = txs.filter(tx => tx.sender?.email === user?.email);
    } else if (filter === 'received') {
      txs = txs.filter(tx => tx.receiver?.email === user?.email);
    } else if (filter === 'pending') {
      txs = txs.filter(tx => tx.status === 'PROCESSING' || tx.status === 'pending');
    } else if (filter === 'failed') {
      txs = txs.filter(tx => tx.status === 'FAILED');
    }

    return txs;
  }, [transactions, search, filter, user?.email]);

  const filterButtons = [
    { key: 'all', label: 'All', icon: null },
    { key: 'sent', label: 'Sent', icon: <ArrowUpRight size={14} /> },
    { key: 'received', label: 'Received', icon: <ArrowDownRight size={14} /> },
    { key: 'pending', label: 'Pending', icon: null },
    { key: 'failed', label: 'Failed', icon: null },
  ];

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '80px' }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}
          >
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 4px 0' }}>Transactions</h1>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', margin: 0 }}>
                {transactions.length} total transactions
              </p>
            </div>
            <button
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}
              onClick={() => refreshTransactions()}
              disabled={transactionsLoading}
            >
              <RefreshCw size={14} className={transactionsLoading ? 'spin' : ''} /> Refresh
            </button>
          </motion.div>

          {/* Search & Filters */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Search by name, email, amount, or reference..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {filterButtons.map(f => (
                <button
                  key={f.key}
                  className={filter === f.key ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => setFilter(f.key)}
                  style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {transactionsLoading && transactions.length === 0 ? (
            <Loader />
          ) : (
            <TransactionTable transactions={filteredTransactions} userEmail={user?.email} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Transactions;
