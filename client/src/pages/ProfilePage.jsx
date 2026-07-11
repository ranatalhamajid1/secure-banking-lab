import React from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ProfileUpload from '../components/ProfileUpload';
import { motion } from 'framer-motion';
import { User, Mail, Wallet, Calendar } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gradient-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', color: 'var(--text-heading)' }}>{user?.name}</h1>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span className={user?.role === 'admin' ? 'badge badge-admin' : 'badge badge-user'}>
                  {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} /> Member since 2026
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <ProfileUpload />
            </div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ flex: '2 1 400px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '24px', color: 'var(--text-heading)' }}>Account Details</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} />
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Full Name</p>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6,182,212,0.1)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Email Address</p>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.email}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wallet size={20} />
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Current Balance</p>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>${user?.accountBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
