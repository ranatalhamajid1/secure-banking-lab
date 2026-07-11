import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Bell, Shield, Moon, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
            <SettingsIcon size={24} color="var(--accent)" />
            <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-heading)' }}>Settings</h1>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={18} color="var(--text-secondary)" /> Appearance
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div>
                <p style={{ fontWeight: 600, margin: '0 0 4px 0' }}>Theme Preference</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', margin: 0 }}>Toggle between light and dark mode</p>
              </div>
              <ThemeToggle />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} color="var(--text-secondary)" /> Notifications
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { title: 'Email Alerts', desc: 'Receive transaction alerts via email', active: true },
                { title: 'Push Notifications', desc: 'Receive alerts on your device', active: false },
                { title: 'Marketing Updates', desc: 'Occasional news and updates', active: false }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <p style={{ fontWeight: 600, margin: '0 0 4px 0' }}>{item.title}</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', margin: 0 }}>{item.desc}</p>
                  </div>
                  <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: item.active ? 'var(--accent)' : 'var(--bg-secondary)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', border: `1px solid ${item.active ? 'var(--accent)' : 'var(--border-color)'}` }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '1px', left: item.active ? '21px' : '1px', transition: 'left 0.2s' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="var(--text-secondary)" /> Security
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Manage your password, 2FA, and trusted devices in the Security Center.</p>
            <Link to="/security" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Go to Security Center
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Settings;
