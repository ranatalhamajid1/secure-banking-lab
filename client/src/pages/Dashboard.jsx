import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BalanceCard from '../components/BalanceCard';
import TransferForm from '../components/TransferForm';
import TransactionTable from '../components/TransactionTable';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Send, Download, ShieldCheck, User, PieChart as PieIcon, ArrowRight, Shield, Award, AlertCircle, ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { transactions, transactionsLoading } = useAppData();
  const navigate = useNavigate();
  const [chartTab, setChartTab] = useState('flow'); // flow, trend

  // ─── Dynamic Security Score calculation ───
  const securityScore = useMemo(() => {
    let score = 50; // base score for registration
    if (user?.hasTransferPin) score += 25;
    if (user?.twoFactorEnabled) score += 25;
    return score;
  }, [user]);

  // ─── Balance Trend calculation (estimates historical balance progression) ───
  const trendData = useMemo(() => {
    const currentBalance = user?.accountBalance || 0;
    if (!transactions || transactions.length === 0) {
      // Fallback trend if no transactions exist yet
      return [
        { name: 'Day 1', balance: currentBalance * 0.8 },
        { name: 'Day 2', balance: currentBalance * 0.9 },
        { name: 'Day 3', balance: currentBalance * 0.85 },
        { name: 'Day 4', balance: currentBalance * 0.95 },
        { name: 'Now', balance: currentBalance },
      ];
    }

    let runningBalance = currentBalance;
    const successTxs = [...transactions]
      .filter(tx => tx.status === 'SUCCESS')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const points = [{ name: 'Now', balance: Math.round(runningBalance) }];

    successTxs.forEach((tx, index) => {
      if (index >= 5) return; // Keep last 5 points
      const isSender = tx.sender?.email === user?.email || tx.sender?._id === user?.id;
      if (isSender) {
        runningBalance += tx.amount; // added back since it was debited
      } else {
        runningBalance -= tx.amount; // subtracted since it was credited
      }
      const date = new Date(tx.createdAt);
      points.push({
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: Math.round(runningBalance)
      });
    });

    return points.reverse();
  }, [transactions, user?.accountBalance, user?.email, user?.id]);

  // ─── Cash Flow Chart Data (Monthly inbound vs outbound) ───
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const successTxs = transactions.filter(tx => tx.status === 'SUCCESS');
    if (successTxs.length === 0) return [];

    const monthMap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    successTxs.forEach(tx => {
      const date = new Date(tx.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(2)}`;

      if (!monthMap[key]) {
        monthMap[key] = { name: monthLabel, incoming: 0, outgoing: 0, sortKey: date.getTime() };
      }

      const isSender = tx.sender?.email === user?.email || tx.sender?._id === user?.id;
      if (isSender) {
        monthMap[key].outgoing += tx.amount;
      } else {
        monthMap[key].incoming += tx.amount;
      }
    });

    return Object.values(monthMap)
      .sort((a, b) => a.sortKey - b.sortKey)
      .slice(-6)
      .map(m => ({
        name: m.name,
        incoming: Math.round(m.incoming),
        outgoing: Math.round(m.outgoing),
      }));
  }, [transactions, user?.email, user?.id]);

  // ─── Spending Breakdown (dynamic from transactions) ───
  const pieData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    let incoming = 0, outgoing = 0, pending = 0, refunded = 0;

    transactions.forEach(tx => {
      const isSender = tx.sender?.email === user?.email || tx.sender?._id === user?.id;

      if (tx.status === 'PROCESSING' || tx.status === 'pending') {
        pending += tx.amount;
      } else if (tx.status === 'REFUNDED') {
        refunded += tx.amount;
      } else if (tx.status === 'SUCCESS' || tx.status === 'success') {
        if (isSender) {
          outgoing += tx.amount;
        } else {
          incoming += tx.amount;
        }
      }
    });

    const data = [];
    if (incoming > 0) data.push({ name: 'Incoming', value: Math.round(incoming), color: '#10b981' });
    if (outgoing > 0) data.push({ name: 'Outgoing', value: Math.round(outgoing), color: '#ef4444' });
    if (pending > 0) data.push({ name: 'Pending', value: Math.round(pending), color: '#f59e0b' });
    if (refunded > 0) data.push({ name: 'Refunded', value: Math.round(refunded), color: '#8b5cf6' });

    return data;
  }, [transactions, user?.email, user?.id]);

  const quickActions = [
    { icon: <Send size={20} />, label: 'Send Money', onClick: () => document.getElementById('transfer-section')?.scrollIntoView({ behavior: 'smooth' }), color: '#8B5CF6' },
    { icon: <Download size={20} />, label: 'Request', onClick: () => toast('Request feature coming soon', { icon: '👏', id: 'req-soon' }), color: '#06B6D4' },
    { icon: <ShieldCheck size={20} />, label: 'Security', onClick: () => navigate('/security'), color: '#10B981' },
    { icon: <User size={20} />, label: 'Profile', onClick: () => navigate('/profile'), color: '#F59E0B' },
  ];

  const totalIncoming = useMemo(() => {
    return transactions
      .filter(tx => tx.status === 'SUCCESS' && (tx.receiver?.email === user?.email || tx.receiver?._id === user?.id))
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions, user?.email, user?.id]);

  const totalOutgoing = useMemo(() => {
    return transactions
      .filter(tx => tx.status === 'SUCCESS' && (tx.sender?.email === user?.email || tx.sender?._id === user?.id))
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions, user?.email, user?.id]);

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '80px' }}>
          
          {/* Hero Balance Block (Consolidated 3D card + dynamic numbers) */}
          <BalanceCard user={user} />

          {/* Quick Actions & Interactive Charts Bento row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Quick Actions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignContent: 'start' }}>
              {quickActions.map((action, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={action.onClick}
                  className="glass-card"
                  style={{
                    padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                    border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', cursor: 'pointer',
                    transition: 'all 0.2s', borderRadius: '16px', color: 'var(--text-primary)', fontFamily: 'inherit'
                  }}
                  whileHover={{ y: -4, borderColor: action.color, boxShadow: `0 8px 24px ${action.color}15` }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${action.color}15`, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {action.icon}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{action.label}</span>
                </motion.button>
              ))}

              {/* Dynamic Security score card */}
              <div
                className="glass-card"
                onClick={() => navigate('/security')}
                style={{
                  gridColumn: 'span 2', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '16px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: securityScore === 100 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: securityScore === 100 ? '#22c55e' : '#f59e0b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem',
                  boxShadow: securityScore === 100 ? '0 0 16px rgba(34,197,94,0.2)' : '0 0 16px rgba(245,158,11,0.2)'
                }}>
                  {securityScore}%
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '0 0 2px 0' }}>Security Health</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {securityScore === 100 ? 'Your account is fully fortified' : 'Configure 2FA & PIN to hit 100%'}
                  </p>
                </div>
                <ArrowRight size={16} color="var(--text-secondary)" />
              </div>
            </div>

            {/* Main Interactive Chart (Cash Flow / Balance Trend) */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ padding: '24px', background: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={16} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>
                    {chartTab === 'flow' ? 'Cash Flow' : 'Balance Trend'}
                  </h3>
                </div>
                <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => setChartTab('flow')}
                    style={{
                      border: 'none', background: chartTab === 'flow' ? 'var(--bg-card-hover)' : 'transparent',
                      color: chartTab === 'flow' ? 'var(--text-heading)' : 'var(--text-secondary)',
                      padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Flow
                  </button>
                  <button
                    onClick={() => setChartTab('trend')}
                    style={{
                      border: 'none', background: chartTab === 'trend' ? 'var(--bg-card-hover)' : 'transparent',
                      color: chartTab === 'trend' ? 'var(--text-heading)' : 'var(--text-secondary)',
                      padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Trend
                  </button>
                </div>
              </div>

              <div style={{ height: '200px' }}>
                {chartTab === 'flow' ? (
                  chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorOutgoing" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                        <Tooltip
                          contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }}
                          formatter={(value, name) => [`$${value.toLocaleString()}`, name === 'incoming' ? 'Incoming' : 'Outgoing']}
                        />
                        <Area type="monotone" dataKey="incoming" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncoming)" />
                        <Area type="monotone" dataKey="outgoing" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorOutgoing)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                      Make transactions to see monthly cash flow
                    </div>
                  )
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }}
                        formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Balance']}
                      />
                      <Line type="monotone" dataKey="balance" stroke="var(--accent)" strokeWidth={3} dot={{ fill: 'var(--accent)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          </div>

          {/* Quick Transfer Form & Dynamic Spending Insights */}
          <div id="transfer-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <TransferForm />

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel" style={{ padding: '24px', background: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PieIcon size={16} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>Spending & Volume</h3>
              </div>

              {/* Dynamic In/Out flow stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ArrowDownRight size={12} color="#10b981" /> Total Inbound
                  </span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                    ${totalIncoming.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ArrowUpRight size={12} color="#ef4444" /> Total Outbound
                  </span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                    ${totalOutgoing.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={45} outerRadius={60} paddingAngle={4} dataKey="value" stroke="none">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                    No transaction data yet
                  </div>
                )}
              </div>
              
              {pieData.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                  {pieData.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: d.color }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                      <span style={{ fontWeight: 650, color: 'var(--text-primary)' }}>${d.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Recent Activity Table (Timeline view) */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <TransactionTable transactions={transactions} userEmail={user?.email} limit={5} />
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;