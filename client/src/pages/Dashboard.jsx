import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransaction } from '../context/TransactionContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TransferForm from '../components/TransferForm';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, RadialBarChart, RadialBar } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Send, Download, ShieldCheck, User, 
  ArrowUpRight, ArrowDownRight, Eye, Search, Bell, 
  CreditCard, RefreshCw, Layers, Compass, DollarSign, 
  Percent, ArrowRight, Shield, Award, AlertCircle, 
  CheckCircle, Plus, Info, Globe, Cpu, Zap, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { transactions, transactionsLoading } = useTransaction();
  const navigate = useNavigate();

  // Dashboard state
  const [selectedCard, setSelectedCard] = useState('debit'); // debit, credit, virtual
  const [showTransfer, setShowTransfer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Card Interactive Tilt States
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({ x: -y / 8, y: x / 8 });
  };

  const handleCardMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Dynamic Security Score
  const securityScore = useMemo(() => {
    let score = 60;
    if (user?.hasTransferPin) score += 20;
    if (user?.twoFactorEnabled) score += 20;
    return score;
  }, [user]);

  // Accounts Data
  const accounts = [
    { type: 'Checking Account', id: 'USD Checking', balance: user?.accountBalance || 0, currency: 'USD', symbol: '$' }
  ];

  // Dynamically calculate Analytics and Spending from transactions
  const { analyticsData, spendingData, timelineTransactions } = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { 
        analyticsData: [], 
        spendingData: [], 
        timelineTransactions: [] 
      };
    }

    const monthlyStats = {};
    const recipientTotals = {};

    const timeline = transactions.map(tx => {
      const isSender = tx.sender?.email === user?.email || tx.sender?._id === user?.id;
      const type = isSender ? 'debit' : 'credit';
      const amount = tx.amount || 0;
      const dateObj = new Date(tx.createdAt);
      
      // For Analytics (Income vs Expense)
      const monthYear = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!monthlyStats[monthYear]) {
        monthlyStats[monthYear] = { name: monthYear, income: 0, expense: 0, timestamp: dateObj.getTime() };
      }
      if (type === 'credit') {
        monthlyStats[monthYear].income += amount;
      } else {
        monthlyStats[monthYear].expense += amount;
        
        // For Spending Breakdown (group by receiver)
        const receiverName = tx.receiver?.name || 'Unknown';
        recipientTotals[receiverName] = (recipientTotals[receiverName] || 0) + amount;
      }

      return {
        id: tx._id,
        title: isSender ? `Transfer to ${tx.receiver?.name || 'User'}` : `Received from ${tx.sender?.name || 'User'}`,
        type,
        amount,
        time: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: tx.status
      };
    });

    // Sort Analytics by date
    const sortedAnalytics = Object.values(monthlyStats).sort((a, b) => a.timestamp - b.timestamp);

    // Format Spending Data for Pie Chart
    const colors = ['#5B5FFF', '#7A5CFF', '#4D9FFF', '#FFB020', '#00C896'];
    const formattedSpending = Object.entries(recipientTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // top 5
      .map(([name, value], idx) => ({
        name, value, color: colors[idx % colors.length]
      }));

    return {
      analyticsData: sortedAnalytics,
      spendingData: formattedSpending,
      timelineTransactions: timeline
    };
  }, [transactions, user]);

  // Dynamic Budget based on expense
  const budgetData = useMemo(() => {
    const totalSpent = spendingData.reduce((acc, curr) => acc + curr.value, 0);
    const limit = 5000; // Arbitrary monthly limit for demo
    const pct = Math.min((totalSpent / limit) * 100, 100);
    return [
      { name: 'Limit', value: 100, fill: 'rgba(255,255,255,0.05)' },
      { name: 'Spent', value: pct, fill: '#5B5FFF' }
    ];
  }, [spendingData]);

  // AI Insights
  const insights = useMemo(() => {
    const totalSpent = spendingData.reduce((acc, curr) => acc + curr.value, 0);
    const messages = [];
    if (totalSpent > 2000) {
      messages.push({ id: 1, type: 'warning', text: "Your transfer volume is high this period." });
    } else if (totalSpent === 0) {
      messages.push({ id: 1, type: 'info', text: "No recent spending detected." });
    } else {
      messages.push({ id: 1, type: 'success', text: "Spending is well within normal limits." });
    }
    if (user?.twoFactorEnabled) {
      messages.push({ id: 2, type: 'success', text: "Your account is secured with 2FA." });
    } else {
      messages.push({ id: 2, type: 'warning', text: "Enable 2FA in security settings to protect your account." });
    }
    return messages;
  }, [spendingData, user]);

  return (
    <div className="app-container" style={{ display: 'flex', background: '#111111', minHeight: '100vh', color: '#fff' }}>
      <Sidebar />
      
      <main className="main-content" style={{ flex: 1, padding: '32px', overflowX: 'hidden' }}>
        
        {/* PREMIUM HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Dashboard</h1>
            <p style={{ color: '#8c8c9a', fontSize: '0.875rem', marginTop: '4px' }}>Welcome back, {user?.name}</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Search */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} color="#8c8c9a" style={{ position: 'absolute', left: '14px' }} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '12px 16px 12px 38px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)',
                  background: '#1B1D22', color: '#fff', fontSize: '0.875rem', outline: 'none', width: '220px'
                }}
              />
            </div>
            
            {/* Notification Bell */}
            <button 
              onClick={() => toast('No new notifications')}
              style={{
                width: '44px', height: '44px', borderRadius: '12px', background: '#1B1D22',
                border: '1px solid rgba(255,255,255,0.08)', color: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative'
              }}
            >
              <Bell size={18} />
              <div style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', borderRadius: '50%', background: '#5B5FFF' }} />
            </button>
            
            {/* Profile Avatar */}
            <div 
              onClick={() => navigate('/profile')}
              style={{
                width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #5B5FFF, #7A5CFF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem',
                border: '2px solid rgba(255,255,255,0.1)', cursor: 'pointer'
              }}
            >
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '32px' }} className="dashboard-grid">
          
          {/* COLUMN 1: INTERACTIVE CARD & QUICK ACTIONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Card Selector Header */}
            <div style={{ display: 'flex', background: '#1B1D22', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              {['debit', 'credit', 'virtual'].map((cardType) => (
                <button
                  key={cardType}
                  onClick={() => setSelectedCard(cardType)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                    background: selectedCard === cardType ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: selectedCard === cardType ? '#fff' : '#8c8c9a',
                    fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {cardType}
                </button>
              ))}
            </div>

            {/* Interactive Card */}
            <div style={{ perspective: '1000px' }}>
              <motion.div
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                animate={{ rotateX: tilt.x, rotateY: tilt.y }}
                style={{
                  width: '100%', height: '220px', borderRadius: '24px',
                  background: selectedCard === 'debit' 
                    ? 'linear-gradient(135deg, #1B1D22 0%, #111111 100%)' 
                    : selectedCard === 'credit'
                    ? 'linear-gradient(135deg, #5B5FFF 0%, #7A5CFF 100%)'
                    : 'linear-gradient(135deg, #00C896 0%, #4D9FFF 100%)',
                  padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)',
                  position: 'relative', overflow: 'hidden', cursor: 'pointer', transformStyle: 'preserve-3d'
                }}
              >
                {/* Glowing Overlay Accent */}
                <div style={{
                  position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px',
                  borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', transform: 'translateZ(30px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={24} color={selectedCard === 'debit' ? '#5B5FFF' : '#fff'} />
                    <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>SecureBank</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#8c8c9a' }}>
                    {selectedCard.toUpperCase()}
                  </span>
                </div>

                <div style={{ transform: 'translateZ(40px)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.15em', fontFamily: 'monospace', color: '#fff', marginBottom: '8px' }}>
                    •••• •••• •••• {selectedCard === 'debit' ? '4321' : selectedCard === 'credit' ? '9876' : '1590'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#8c8c9a', fontWeight: 600 }}>
                    <div>
                      <div style={{ fontSize: '0.625rem', color: '#5a5a65', textTransform: 'uppercase', marginBottom: '2px' }}>Cardholder</div>
                      <div>{user?.name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.625rem', color: '#5a5a65', textTransform: 'uppercase', marginBottom: '2px' }}>Expiry</div>
                      <div>12/29</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { icon: <Send size={18} />, label: 'Send', action: () => {
                  const emailInput = document.querySelector('#transfer-section input[type="email"]');
                  if (emailInput) {
                    emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    emailInput.focus();
                  } else {
                    toast('Quick Transfer form focused');
                  }
                }, color: '#5B5FFF' },
                { icon: <Download size={18} />, label: 'Receive', action: () => toast('Account QR / Details copied to clipboard!'), color: '#00C896' },
                { icon: <RefreshCw size={18} />, label: 'Exchange', action: () => toast('Exchange rate dashboard coming soon'), color: '#FFB020' },
                { icon: <Layers size={18} />, label: 'Bills', action: () => toast('Pay bills utility setup'), color: '#4D9FFF' },
                { icon: <CreditCard size={18} />, label: 'Cards', action: () => toast('Manage cards panel'), color: '#7A5CFF' },
                { icon: <Compass size={18} />, label: 'Crypto', action: () => toast('Buy & Sell crypto vault'), color: '#FF5A5A' }
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  style={{
                    background: '#1B1D22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px',
                    padding: '16px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                    color: '#fff', cursor: 'pointer', transition: 'all 0.2s', outline: 'none'
                  }}
                  className="quick-action-btn"
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Transfer Section */}
            <div id="transfer-section" style={{ width: '100%' }}>
              <TransferForm />
            </div>

            {/* Accounts Balance Swiper (Stacked vertically for ease) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#8c8c9a' }}>My Accounts</span>
                <button onClick={() => toast('New account setup')} style={{ background: 'none', border: 'none', color: '#5B5FFF', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>+ Add</button>
              </div>
              {accounts.map((acc, index) => (
                <div
                  key={index}
                  style={{
                    background: '#1B1D22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px',
                    padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{acc.type}</div>
                    <div style={{ color: '#8c8c9a', fontSize: '0.75rem', marginTop: '2px' }}>{acc.id}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.125rem' }}>
                      {acc.symbol}{acc.balance.toLocaleString('en-US', { minimumFractionDigits: acc.currency === 'PKR' ? 0 : 2 })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#8c8c9a', fontWeight: 600 }}>{acc.currency}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* COLUMN 2: ANALYTICS & TIMELINE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Area Chart Analytics */}
            <div style={{ background: '#1B1D22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Analytics</h3>
                <span style={{ fontSize: '0.75rem', color: '#8c8c9a', fontWeight: 600 }}>Last 6 Months</span>
              </div>
              <div style={{ height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData}>
                    <defs>
                      <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00C896" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#00C896" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF5A5A" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#FF5A5A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#5a5a65" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#5a5a65" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip contentStyle={{ background: '#1B1D22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff' }} />
                    <Area type="monotone" dataKey="income" stroke="#00C896" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" />
                    <Area type="monotone" dataKey="expense" stroke="#FF5A5A" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transactions Timeline */}
            <div style={{ background: '#1B1D22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Timeline</h3>
                <span style={{ fontSize: '0.75rem', color: '#8c8c9a', fontWeight: 600 }}>Transactions Feed</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '16px' }}>
                {/* Timeline Line */}
                <div style={{ position: 'absolute', left: '4px', top: '10px', bottom: '10px', width: '2px', background: 'rgba(255,255,255,0.06)' }} />

                {timelineTransactions.slice(0, 4).map((tx) => (
                  <div key={tx.id} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                    {/* Timeline node dot */}
                    <div style={{
                      position: 'absolute', left: '-16px', top: '6px', width: '8px', height: '8px', borderRadius: '50%',
                      background: tx.type === 'credit' ? '#00C896' : '#FF5A5A',
                      boxShadow: `0 0 8px ${tx.type === 'credit' ? '#00C896' : '#FF5A5A'}`
                    }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{tx.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#8c8c9a', marginTop: '2px' }}>{tx.time}</div>
                      </div>
                      <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '0.9375rem', color: tx.type === 'credit' ? '#00C896' : '#fff' }}>
                        {tx.type === 'credit' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* COLUMN 3: SECURITY, BUDGETS & AI INSIGHTS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Security health score */}
            <div style={{ background: '#1B1D22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Security Shield</h3>
                <ShieldCheck size={18} color="#00C896" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                {/* Radial ring score */}
                <div style={{ width: '80px', height: '80px', position: 'relative' }}>
                  <svg style={{ transform: 'rotate(-90deg)', width: '80px', height: '80px' }}>
                    <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                    <motion.circle 
                      cx="40" cy="40" r="34" stroke="#5B5FFF" strokeWidth="6" fill="transparent"
                      strokeDasharray={2 * Math.PI * 34}
                      initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - securityScore / 100) }}
                      transition={{ duration: 1 }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 800, fontSize: '1.125rem' }}>
                    {securityScore}%
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                    <CheckCircle size={14} color="#00C896" /> Verified Password
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                    <CheckCircle size={14} color={user?.twoFactorEnabled ? "#00C896" : "#FF5A5A"} /> 2FA Authentication
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                    <CheckCircle size={14} color={user?.hasTransferPin ? "#00C896" : "#FF5A5A"} /> Secure PIN Set
                  </div>
                </div>
              </div>
            </div>

            {/* Spending Budget Ring & Goals progress */}
            <div style={{ background: '#1B1D22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', margin: 0 }}>Budget Limits</h3>
              
              <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>$1,420 <span style={{ fontSize: '0.75rem', color: '#8c8c9a' }}>/ $2,000</span></div>
                  <span style={{ fontSize: '0.75rem', color: '#8c8c9a', marginTop: '4px', display: 'inline-block' }}>Monthly Budget limit</span>
                </div>
                {/* Micro budget circular bar */}
                <div style={{ width: '60px', height: '60px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" barSize={6} data={budgetData}>
                      <RadialBar minAngle={15} background dataKey="value" cornerRadius={3} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Goal Progress Bar */}
              <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '8px' }}>
                  <span>Tesla Model Y Savings</span>
                  <span style={{ color: '#5B5FFF' }}>68%</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: '68%', height: '100%', background: '#5B5FFF' }} />
                </div>
              </div>
            </div>

            {/* AI Insights Widget */}
            <div style={{ background: '#1B1D22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Cpu size={16} color="#7A5CFF" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>AI Insights</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    style={{
                      background: 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${insight.type === 'warning' ? '#FFB020' : insight.type === 'info' ? '#5B5FFF' : '#00C896'}`,
                      borderRadius: '8px', padding: '12px', fontSize: '0.8125rem', lineHeight: 1.4
                    }}
                  >
                    {insight.text}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Grid Responsiveness styling */}
      <style>{`
        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
          .main-content {
            padding: 16px !important;
          }
        }
        .quick-action-btn:hover {
          background: rgba(255,255,255,0.05) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default React.memo(Dashboard);