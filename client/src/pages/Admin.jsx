import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAdmin } from '../context/AdminContext';
import { 
  ShieldCheck, ShieldAlert, Users, CreditCard, Activity, 
  Server, AlertTriangle, CheckCircle2, AlertCircle, RefreshCw, 
  Clock, Search, Filter, Download, ArrowUpRight, Check, X,
  Trash2, Eye, ExternalLink, ShieldAlert as FraudIcon, ShieldCheck as CheckIcon, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  CartesianGrid, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import toast from 'react-hot-toast';

// Simple Pagination UI Component
const PaginationControl = ({ pagination, onLoadPage }) => {
  if (!pagination || pagination.pages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
      <span style={{ fontSize: '0.8125rem', color: '#8c8c9a' }}>
        Page {pagination.page} of {pagination.pages} ({pagination.total} total)
      </span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          disabled={pagination.page <= 1}
          onClick={() => onLoadPage(pagination.page - 1)}
          style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', color: pagination.page <= 1 ? '#5a5a65' : '#fff', cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer' }}
        >
          <ChevronLeft size={16} />
        </button>
        <button 
          disabled={pagination.page >= pagination.pages}
          onClick={() => onLoadPage(pagination.page + 1)}
          style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', color: pagination.page >= pagination.pages ? '#5a5a65' : '#fff', cursor: pagination.page >= pagination.pages ? 'not-allowed' : 'pointer' }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const Admin = () => {
  const { 
    adminData: data, adminLoading: loading, adminLastUpdated, refreshAdmin,
    loadUsersPage, loadTransactionsPage, loadCardsPage, loadAuditLogsPage 
  } = useAdmin();
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, cards, kyc, audit
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Local simulated state for KYC queue
  const [kycQueue, setKycQueue] = useState([
    { id: '1', name: 'John Doe', document: 'Passport', status: 'Pending', time: '10 mins ago', email: 'john@example.com' },
    { id: '2', name: 'Alice Smith', document: 'Driver License', status: 'Pending', time: '1 hour ago', email: 'alice@smith.com' },
    { id: '3', name: 'Bob Johnson', document: 'National ID', status: 'Pending', time: '3 hours ago', email: 'bob@gmail.com' }
  ]);

  // Local simulated state for Fraud alerts
  const [fraudAlerts, setFraudAlerts] = useState([
    { id: '101', type: 'Velocity Limit', user: 'jack@daniels.com', amount: 5000, risk: 'High', time: 'Just now' },
    { id: '102', type: 'Location Anomaly', user: 'sara@connor.com', amount: 120, risk: 'Medium', time: '15 mins ago' }
  ]);

  // Compute stats using pagination totals
  const totalUsers = data?.usersPagination?.total || 0;
  const totalCards = data?.cardsPagination?.total || 0;
  
  // We can only count active/frozen on the current page for now, but usually this is an aggregate query
  const activeCards = data?.cards?.filter(c => c.status === 'active').length || 0;
  const frozenCards = data?.cards?.filter(c => c.status === 'frozen').length || 0;
  const txVolume = data?.transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
  
  const failedLogins = data?.auditLogs?.filter(log => log.action === 'LOGIN_FAILED') || [];
  const freezeLogs = data?.auditLogs?.filter(log => log.action === 'CARD_FROZEN') || [];
  const suspiciousLogs = [...failedLogins, ...freezeLogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const securityScore = Math.max(0, 100 - (failedLogins.length * 5) - (freezeLogs.length * 2));

  // KYC Actions
  const handleApproveKyc = (id, name) => {
    setKycQueue(prev => prev.filter(item => item.id !== id));
    toast.success(`KYC documents approved for ${name}!`, { icon: '✅' });
  };

  const handleRejectKyc = (id, name) => {
    setKycQueue(prev => prev.filter(item => item.id !== id));
    toast.error(`KYC documents rejected for ${name}.`);
  };

  // Fraud Resolve Action
  const handleResolveFraud = (id) => {
    setFraudAlerts(prev => prev.filter(alert => alert.id !== id));
    toast.success(`Fraud alert resolved. Account verified safe.`);
  };

  // Export Data
  const handleExport = (type) => {
    toast.success(`Exported data successfully in ${type.toUpperCase()} format!`, { icon: '📥' });
  };

  if (loading && !data.users.length) {
    return (
      <div className="app-container" style={{ background: '#111111', minHeight: '100vh', color: '#fff' }}>
        <Sidebar />
        <main className="main-content" style={{ flex: 1, padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width: '40px', height: '40px', border: '3px solid #5B5FFF', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px' }} />
            <div style={{ color: '#8c8c9a', fontSize: '0.875rem' }}>Loading Enterprise Operations Console...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ display: 'flex', background: '#111111', minHeight: '100vh', color: '#fff' }}>
      <Sidebar />

      <main className="main-content" style={{ flex: 1, padding: '32px', overflowX: 'hidden' }}>
        <Navbar />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '60px' }}>
          
          {/* Header Block */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="admin-header-block">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <ShieldCheck size={24} color="#5B5FFF" />
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>SOC Terminal</h1>
              </div>
              <p style={{ color: '#8c8c9a', fontSize: '0.875rem', margin: 0 }}>Enterprise Security Operations & Audit Control</p>
            </div>
            
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '6px', background: '#1B1D22', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'users', label: 'Users' },
                { id: 'cards', label: 'Cards' },
                { id: 'kyc', label: 'KYC Queue' },
                { id: 'audit', label: 'Audit Logs' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: activeTab === tab.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: activeTab === tab.id ? '#fff' : '#8c8c9a',
                    fontWeight: activeTab === tab.id ? 700 : 500, fontSize: '0.8125rem', transition: 'all 0.2s'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab 1: Overview Dashboard */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* KPI metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#1B1D22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ color: '#8c8c9a', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</span>
                    <Users size={18} color="#5B5FFF" />
                  </div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{totalUsers.toLocaleString()}</h2>
                  <span style={{ color: '#00C896', fontSize: '0.75rem', fontWeight: 700, marginTop: '8px', display: 'inline-block' }}>Total platform users</span>
                </div>
                
                <div style={{ background: '#1B1D22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ color: '#8c8c9a', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Issued Cards</span>
                    <CreditCard size={18} color="#7A5CFF" />
                  </div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{totalCards.toLocaleString()}</h2>
                  <span style={{ color: '#8c8c9a', fontSize: '0.75rem', marginTop: '8px', display: 'inline-block' }}>Total issued virtual cards</span>
                </div>

                <div style={{ background: '#1B1D22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ color: '#8c8c9a', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Volume</span>
                    <Activity size={18} color="#4D9FFF" />
                  </div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>${txVolume.toLocaleString()}</h2>
                  <span style={{ color: '#00C896', fontSize: '0.75rem', fontWeight: 700, marginTop: '8px', display: 'inline-block' }}>Transaction volume (page {data.transactionsPagination?.page || 1})</span>
                </div>

                <div style={{ background: '#1B1D22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ color: '#8c8c9a', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fraud Score</span>
                    <AlertTriangle size={18} color="#FFB020" />
                  </div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: securityScore > 90 ? '#00C896' : '#FFB020' }}>{securityScore}%</h2>
                  <span style={{ color: '#8c8c9a', fontSize: '0.75rem', marginTop: '8px', display: 'inline-block' }}>{fraudAlerts.length} Active risk alerts</span>
                </div>
              </div>

              {/* Bento Row: System status + Fraud stream */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }} className="overview-bento">
                
                {/* Fraud monitor stream */}
                <div style={{ background: '#1B1D22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '24px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FraudIcon size={18} color="#FF5A5A" /> Fraud Monitoring Stream
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {fraudAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        style={{
                          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)',
                          borderRadius: '16px', padding: '16px 20px', display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: '#FF5A5A15', color: '#FF5A5A', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>{alert.risk}</span>
                            <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{alert.type}</span>
                          </div>
                          <div style={{ color: '#8c8c9a', fontSize: '0.75rem', marginTop: '4px' }}>User: {alert.user} • Amount: ${alert.amount}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#8c8c9a' }}>{alert.time}</span>
                          <button onClick={() => handleResolveFraud(alert.id)} style={{ padding: '6px 12px', background: '#00C89615', color: '#00C896', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>Resolve</button>
                        </div>
                      </div>
                    ))}
                    {fraudAlerts.length === 0 && (
                      <div style={{ padding: '40px', textAlign: 'center', color: '#8c8c9a', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                        No active fraud threats detected. System secure.
                      </div>
                    )}
                  </div>
                </div>

                {/* System infrastructure status */}
                <div style={{ background: '#1B1D22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '24px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px' }}>System Cluster Response</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { name: 'Gateway Cluster', speed: '14ms', load: '12%', status: 'optimal' },
                      { name: 'Auth Server Node', speed: '9ms', load: '18%', status: 'optimal' },
                      { name: 'Ledger Engine', speed: '6ms', load: '8%', status: 'optimal' },
                      { name: 'Compliance Scanner', speed: '98ms', load: '45%', status: 'optimal' }
                    ].map((node) => (
                      <div
                        key={node.name}
                        style={{
                          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                          borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Server size={14} color="#8c8c9a" />
                          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{node.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#8c8c9a' }}>{node.speed}</span>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00C896' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* Tab 2: Users sticky rounded table */}
          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: '#1B1D22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>User Directory</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleExport('csv')} style={{ background: 'rgba(255,255,255,0.04)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Download size={14} /> Export CSV</button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                  <thead>
                    <tr style={{ color: '#8c8c9a', fontSize: '0.8125rem', textTransform: 'uppercase', textAlign: 'left' }}>
                      <th style={{ padding: '12px 20px', fontWeight: 700 }}>Name</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700 }}>Email Address</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700 }}>System Role</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700 }}>Account Balance</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.users?.map(u => (
                      <tr 
                        key={u._id}
                        style={{ background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s', borderRadius: '12px' }}
                        className="table-row"
                      >
                        <td style={{ padding: '16px 20px', fontWeight: 700, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>{u.name}</td>
                        <td style={{ padding: '16px 20px', color: '#8c8c9a', fontSize: '0.875rem' }}>{u.email}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                            background: u.role === 'admin' ? 'rgba(91,95,255,0.15)' : 'rgba(255,255,255,0.06)',
                            color: u.role === 'admin' ? '#5B5FFF' : '#fff'
                          }}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontWeight: 700 }}>
                          ${u.accountBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '16px 20px', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>
                          <button onClick={() => toast.success(`MFA credentials reset for ${u.name}`)} style={{ background: 'none', border: 'none', color: '#5B5FFF', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', marginRight: '12px' }}>Reset 2FA</button>
                          <button onClick={() => toast.error(`Suspended account ${u.name}`)} style={{ background: 'none', border: 'none', color: '#FF5A5A', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Suspend</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControl pagination={data.usersPagination} onLoadPage={loadUsersPage} />
            </motion.div>
          )}

          {/* Tab 3: Cards Directory */}
          {activeTab === 'cards' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: '#1B1D22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>Cards Operations</h3>
                <button onClick={() => handleExport('xlsx')} style={{ background: 'rgba(255,255,255,0.04)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Download size={14} /> Export Sheet</button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                  <thead>
                    <tr style={{ color: '#8c8c9a', fontSize: '0.8125rem', textTransform: 'uppercase', textAlign: 'left' }}>
                      <th style={{ padding: '12px 20px', fontWeight: 700 }}>Cardholder</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700 }}>Card Number</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700 }}>Type</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700 }}>Issue Date</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.cards?.map(c => (
                      <tr 
                        key={c._id}
                        style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}
                      >
                        <td style={{ padding: '16px 20px', fontWeight: 700, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>{c.cardHolderName}</td>
                        <td style={{ padding: '16px 20px', fontFamily: 'monospace', color: '#8c8c9a' }}>{c.maskedNumber}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontWeight: 600 }}>{c.cardType.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                            background: c.status === 'active' ? 'rgba(0,200,150,0.15)' : 'rgba(255,90,90,0.15)',
                            color: c.status === 'active' ? '#00C896' : '#FF5A5A'
                          }}>
                            {c.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#8c8c9a', fontSize: '0.875rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '16px 20px', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>
                          {c.status === 'active' ? (
                            <button onClick={() => toast.error('Card frozen')} style={{ background: 'none', border: 'none', color: '#FF5A5A', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Freeze Card</button>
                          ) : (
                            <button onClick={() => toast.success('Card activated')} style={{ background: 'none', border: 'none', color: '#00C896', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Unfreeze</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControl pagination={data.cardsPagination} onLoadPage={loadCardsPage} />
            </motion.div>
          )}

          {/* Tab 4: KYC Verification Queue */}
          {activeTab === 'kyc' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: '#1B1D22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>KYC Document Queue</h3>
                <span style={{ fontSize: '0.75rem', color: '#8c8c9a', fontWeight: 600 }}>{kycQueue.length} Pending Verifications</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {kycQueue.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                      borderRadius: '16px', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{item.name}</div>
                      <div style={{ color: '#8c8c9a', fontSize: '0.75rem', marginTop: '4px' }}>Email: {item.email} • Document Type: <span style={{ color: '#5B5FFF', fontWeight: 600 }}>{item.document}</span></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#8c8c9a' }}>Received {item.time}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleApproveKyc(item.id, item.name)} style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', background: '#00C89615', color: '#00C896', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Check size={16} /></button>
                        <button onClick={() => handleRejectKyc(item.id, item.name)} style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', background: '#FF5A5A15', color: '#FF5A5A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {kycQueue.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#8c8c9a', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                    All compliance KYC verifications completed!
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Tab 5: Real-time Audit Logs */}
          {activeTab === 'audit' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: '#1B1D22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>Security Audit Trail</h3>
                <span style={{ fontSize: '0.75rem', color: '#8c8c9a', fontWeight: 600 }}>Global Activity Logs</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                  <thead>
                    <tr style={{ color: '#8c8c9a', fontSize: '0.8125rem', textTransform: 'uppercase', textAlign: 'left' }}>
                      <th style={{ padding: '12px 20px', fontWeight: 700 }}>Operation</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700 }}>Operator / Target</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700 }}>Source IP Address</th>
                      <th style={{ padding: '12px 20px', fontWeight: 700 }}>System Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.auditLogs?.map(log => (
                      <tr 
                        key={log._id}
                        style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}
                      >
                        <td style={{ padding: '16px 20px', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                            background: log.action.includes('FAILED') || log.action.includes('FREEZE') 
                              ? 'rgba(255,90,90,0.15)' 
                              : log.action.includes('SUCCESS') 
                              ? 'rgba(0,200,150,0.15)' 
                              : 'rgba(255,255,255,0.05)',
                            color: log.action.includes('FAILED') || log.action.includes('FREEZE') 
                              ? '#FF5A5A' 
                              : log.action.includes('SUCCESS') 
                              ? '#00C896' 
                              : '#fff'
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>{log.user?.email || 'System / Guest'}</td>
                        <td style={{ padding: '16px 20px', fontFamily: 'monospace', color: '#8c8c9a', fontSize: '0.8125rem' }}>{log.ipAddress}</td>
                        <td style={{ padding: '16px 20px', color: '#8c8c9a', fontSize: '0.8125rem', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControl pagination={data.auditLogsPagination} onLoadPage={loadAuditLogsPage} />
            </motion.div>
          )}

        </div>
      </main>

      <style>{`
        .table-row:hover {
          background: rgba(255,255,255,0.04) !important;
          transform: scale(1.002);
        }
        @media (max-width: 900px) {
          .admin-header-block {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .overview-bento {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Admin;