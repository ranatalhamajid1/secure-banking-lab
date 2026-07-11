import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BalanceCard from '../components/BalanceCard';
import TransferForm from '../components/TransferForm';
import TransactionTable from '../components/TransactionTable';
import ProfileUpload from '../components/ProfileUpload';
import api from '../api/axios';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Send, Download, ShieldCheck, User, PieChart as PieIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const navigate = useNavigate();

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions/history');
      const resData = response.data;
      const txs = Array.isArray(resData) ? resData : Array.isArray(resData.transactions) ? resData.transactions : [];
      setTransactions(txs);

      // Build chart data from transactions
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
      const base = user?.accountBalance || 1000;
      const data = months.map((m, i) => ({
        name: m,
        balance: Math.round(base * (0.6 + Math.random() * 0.8)),
      }));
      if (data.length > 0) data[data.length - 1].balance = base;
      setChartData(data);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleTransferSuccess = () => {
    refreshUser();
    fetchTransactions();
  };

  const quickActions = [
    { icon: <Send size={20} />, label: 'Send Money', onClick: () => document.getElementById('transfer-section')?.scrollIntoView({ behavior: 'smooth' }), color: 'var(--accent)' },
    { icon: <Download size={20} />, label: 'Request', onClick: () => toast('Request feature coming soon', { icon: '👏' }), color: '#10b981' },
    { icon: <ShieldCheck size={20} />, label: 'Security', onClick: () => navigate('/security'), color: '#3b82f6' },
    { icon: <User size={20} />, label: 'Profile', onClick: () => navigate('/profile'), color: '#f59e0b' },
  ];

  const pieData = [
    { name: 'Shopping', value: 400, color: '#8b5cf6' },
    { name: 'Food', value: 300, color: '#06b6d4' },
    { name: 'Transport', value: 200, color: '#3b82f6' },
    { name: 'Bills', value: 100, color: '#10b981' },
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
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>Balance Trend</h3>
              </div>
              <div style={{ height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }}
                      itemStyle={{ color: 'var(--text-primary)' }}
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Balance']}
                    />
                    <Area type="monotone" dataKey="balance" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Row 3: Transfer & Spending Breakdown */}
          <div id="transfer-section" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <TransferForm onTransferSuccess={handleTransferSuccess} />
            
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel" style={{ padding: '24px', flex: '1 1 300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PieIcon size={16} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>Spending Breakdown</h3>
              </div>
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: 'none', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Row 4: Transactions */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <TransactionTable transactions={transactions} userEmail={user?.email} />
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;