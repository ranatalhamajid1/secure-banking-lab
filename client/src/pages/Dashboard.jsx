import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BalanceCard from '../components/BalanceCard';
import TransferForm from '../components/TransferForm';
import TransactionTable from '../components/TransactionTable';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Send, Download, ShieldCheck, User, PieChart as PieIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { transactions, transactionsLoading } = useAppData();
  const navigate = useNavigate();

  // ─── Cash Flow Chart Data (transaction-derived, not reconstructed balance) ───
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const successTxs = transactions.filter(tx => tx.status === 'SUCCESS');
    if (successTxs.length === 0) return [];

    // Group by month and compute net cash flow
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
      .slice(-7) // Last 7 months
      .map(m => ({
        name: m.name,
        incoming: Math.round(m.incoming),
        outgoing: Math.round(m.outgoing),
        net: Math.round(m.incoming - m.outgoing)
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
    { icon: <Send size={20} />, label: 'Send Money', onClick: () => document.getElementById('transfer-section')?.scrollIntoView({ behavior: 'smooth' }), color: 'var(--accent)' },
    { icon: <Download size={20} />, label: 'Request', onClick: () => toast('Request feature coming soon', { icon: '👏' }), color: '#10b981' },
    { icon: <ShieldCheck size={20} />, label: 'Security', onClick: () => navigate('/security'), color: '#3b82f6' },
    { icon: <User size={20} />, label: 'Profile', onClick: () => navigate('/profile'), color: '#f59e0b' },
  ];

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '80px' }}>
          
          {/* Row 1: Hero Balance */}
          <BalanceCard user={user} />

          {/* Row 2: Quick Actions & Chart */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            
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
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = action.color;
                    e.currentTarget.style.boxShadow = `0 8px 24px ${action.color}20`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${action.color}20`, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {action.icon}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{action.label}</span>
                </motion.button>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={16} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>Cash Flow</h3>
              </div>
              <div style={{ height: '220px' }}>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOutgoing" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }}
                        formatter={(value, name) => [`$${value.toLocaleString()}`, name === 'incoming' ? 'Incoming' : 'Outgoing']}
                      />
                      <Area type="monotone" dataKey="incoming" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncoming)" />
                      <Area type="monotone" dataKey="outgoing" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorOutgoing)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                    {transactionsLoading ? 'Loading chart data...' : 'Make your first transfer to see cash flow analytics'}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Row 3: Transfer & Spending Breakdown */}
          <div id="transfer-section" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <TransferForm />
            
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel" style={{ padding: '24px', flex: '1 1 300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PieIcon size={16} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>Spending Breakdown</h3>
              </div>
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: 'none', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                    {transactionsLoading ? 'Loading...' : 'No transaction data yet'}
                  </div>
                )}
              </div>
              {pieData.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginTop: '12px' }}>
                  {pieData.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: d.color }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                      <span style={{ fontWeight: 600 }}>${d.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Row 4: Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <TransactionTable transactions={transactions} userEmail={user?.email} limit={10} />
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;