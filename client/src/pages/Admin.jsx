import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { ShieldAlert, Users, CreditCard, Activity, Server, AlertTriangle, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const Admin = () => {
  const [data, setData] = useState({
    users: [],
    transactions: [],
    cards: [],
    auditLogs: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, cards, security

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, txRes, cardsRes, auditRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/transactions'),
          api.get('/admin/cards'),
          api.get('/admin/audit-logs')
        ]);
        
        setData({
          users: usersRes.data.users || [],
          transactions: txRes.data.transactions || [],
          cards: cardsRes.data.cards || [],
          auditLogs: auditRes.data.logs || []
        });
      } catch (err) {
        console.error('Failed to load admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  // Compute stats
  const totalUsers = data.users.length;
  const totalCards = data.cards.length;
  const activeCards = data.cards.filter(c => c.status === 'active').length;
  const frozenCards = data.cards.filter(c => c.status === 'frozen').length;
  const txVolume = data.transactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  const loginLogs = data.auditLogs.filter(log => log.action === 'LOGIN_SUCCESS');
  const failedLogins = data.auditLogs.filter(log => log.action === 'LOGIN_FAILED');
  const freezeLogs = data.auditLogs.filter(log => log.action === 'CARD_FROZEN');

  const suspiciousLogs = [...failedLogins, ...freezeLogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const securityScore = Math.max(0, 100 - (failedLogins.length * 5) - (freezeLogs.length * 2));

  const pieData = [
    { name: 'Active Cards', value: activeCards, color: '#10b981' },
    { name: 'Frozen Cards', value: frozenCards, color: '#3b82f6' },
  ];

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Navbar />
          <div style={{ padding: '100px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            Loading Security Operations Center...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', margin: 0, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={28} color="var(--accent)" /> SOC Dashboard
              </h1>
              <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>Security Operations & Admin Console</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-secondary)', padding: '6px', borderRadius: '12px' }}>
              {['overview', 'transactions', 'users', 'cards', 'security'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{ 
                    padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: activeTab === tab ? 'var(--bg-card)' : 'transparent',
                    color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    fontWeight: activeTab === tab ? 600 : 500,
                    textTransform: 'capitalize', transition: 'all 0.2s',
                    boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* TOP STATS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Users</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={16} />
                    </div>
                  </div>
                  <h2 style={{ fontSize: '2rem', margin: 0 }}>{totalUsers}</h2>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.8125rem', color: 'var(--success)' }}>↑ 12% vs last month</p>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Transaction Volume</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Activity size={16} />
                    </div>
                  </div>
                  <h2 style={{ fontSize: '2rem', margin: 0 }}>${txVolume.toLocaleString()}</h2>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.8125rem', color: 'var(--success)' }}>↑ 8% vs last month</p>
                </div>

                <div className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Cards Issued</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6,182,212,0.1)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard size={16} />
                    </div>
                  </div>
                  <h2 style={{ fontSize: '2rem', margin: 0 }}>{totalCards}</h2>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{activeCards} Active • {frozenCards} Frozen</p>
                </div>

                <div className="stat-card" style={{ borderTop: '3px solid var(--warning)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Security Alerts</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={16} />
                    </div>
                  </div>
                  <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--warning)' }}>{failedLogins.length}</h2>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Failed logins detected</p>
                </div>
              </div>

              {/* BENTO GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '24px' }}>System Health</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      { name: 'API Gateway', ms: '12ms', status: 'optimal' },
                      { name: 'Database Cluster', ms: '8ms', status: 'optimal' },
                      { name: 'Auth Microservice', ms: '15ms', status: 'optimal' },
                      { name: 'Card Issuer Network', ms: '124ms', status: 'warning' },
                    ].map(sys => (
                      <div key={sys.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Server size={16} color="var(--text-secondary)" />
                          <span>{sys.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{sys.ms}</span>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: sys.status === 'optimal' ? 'var(--success)' : 'var(--warning)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '24px' }}>Card Distribution</h3>
                  <div style={{ height: '220px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#050507', border: '1px solid #1e1e2d', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
                    {pieData.map(d => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: d.color }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                        <span style={{ fontWeight: 600 }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '24px' }}>Recent Transactions</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Sender</th>
                        <th>Receiver</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.transactions.slice(0, 50).map(tx => (
                        <tr key={tx._id}>
                          <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{tx.reference || tx._id}</td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{tx.sender?.name || 'Unknown'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{tx.sender?.email}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{tx.receiver?.name || 'Unknown'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{tx.receiver?.email}</div>
                          </td>
                          <td style={{ fontWeight: 700 }}>${tx.amount?.toLocaleString()}</td>
                          <td>
                            <span className={`badge badge-${tx.status?.toLowerCase() === 'success' ? 'active' : tx.status?.toLowerCase() === 'processing' ? 'warning' : 'inactive'}`}>
                              {tx.status || 'SUCCESS'}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>{new Date(tx.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Categorized Transactions Preview */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                {/* Pending */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--warning)', marginBottom: '16px' }}>Pending Transactions</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data.transactions.filter(t => t.status === 'PROCESSING' || t.status === 'pending').slice(0, 5).map(tx => (
                      <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span>{tx.reference || tx._id.slice(-6)}</span>
                        <span style={{ fontWeight: 600 }}>${tx.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Failed */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--danger)', marginBottom: '16px' }}>Failed Transactions</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data.transactions.filter(t => t.status === 'FAILED' || t.status === 'failed').slice(0, 5).map(tx => (
                      <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span>{tx.reference || tx._id.slice(-6)}</span>
                        <span style={{ fontWeight: 600 }}>${tx.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Refunded */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--success)', marginBottom: '16px' }}>Refunded Transactions</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data.transactions.filter(t => t.status === 'REFUNDED').slice(0, 5).map(tx => (
                      <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span>{tx.reference || tx._id.slice(-6)}</span>
                        <span style={{ fontWeight: 600 }}>${tx.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '24px' }}>User Directory</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map(u => (
                      <tr key={u._id}>
                        <td style={{ fontWeight: 500 }}>{u.name}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td>
                          <span className={u.role === 'admin' ? 'badge badge-admin' : 'badge badge-user'}>{u.role}</span>
                        </td>
                        <td style={{ fontFamily: 'monospace' }}>${u.accountBalance?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'cards' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '24px' }}>Virtual Cards Issued</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Owner</th>
                      <th>Card Number</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.cards.map(c => (
                      <tr key={c._id}>
                        <td style={{ fontWeight: 500 }}>{c.cardHolderName}</td>
                        <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{c.maskedNumber}</td>
                        <td>
                          <span style={{ fontSize: '0.8125rem', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>{c.cardType}</span>
                        </td>
                        <td>
                          <span className={c.status === 'active' ? 'badge badge-active' : 'badge badge-inactive'}>{c.status}</span>
                        </td>
                        <td style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '24px' }}>
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                      <circle cx="50" cy="50" r="45" fill="transparent" stroke="var(--border-color)" strokeWidth="8" />
                      <circle cx="50" cy="50" r="45" fill="transparent" stroke="var(--success)" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * securityScore) / 100} strokeLinecap="round" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{securityScore}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>SECURE</span>
                    </div>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0' }}>Security Score</h3>
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.875rem', margin: 0 }}>System is operating under normal parameters with no active breaches.</p>
                </div>

                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={18} color="var(--warning)" /> Suspicious Activity Alerts
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {suspiciousLogs.slice(0, 5).map((log, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', background: 'var(--warning-bg)', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <AlertCircle size={20} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--warning)' }}>
                            {log.action === 'LOGIN_FAILED' ? 'Failed login attempt' : 'Card frozen due to suspicious activity'}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            IP: {log.ipAddress} • User ID: {log.user?._id || log.user || 'Unknown'}
                          </p>
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                    {suspiciousLogs.length === 0 && (
                      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                        No suspicious alerts at this time.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '24px' }}>Global Audit Log (Real-time)</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>User</th>
                        <th>IP Address</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.auditLogs.map(log => (
                        <tr key={log._id}>
                          <td>
                            <span style={{ 
                              fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', fontWeight: 600,
                              background: log.action.includes('FAILED') || log.action.includes('FREEZE') ? 'var(--warning-bg)' : 
                                          log.action.includes('SUCCESS') ? 'var(--success-bg)' : 'var(--bg-secondary)',
                              color: log.action.includes('FAILED') || log.action.includes('FREEZE') ? 'var(--warning)' : 
                                     log.action.includes('SUCCESS') ? 'var(--success)' : 'var(--text-secondary)'
                            }}>
                              {log.action}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.875rem' }}>{log.user?.email || 'Unknown User'}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{log.ipAddress}</td>
                          <td style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{new Date(log.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Admin;