import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const Navbar = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        padding: '14px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        background: 'var(--navbar-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Left: Greeting */}
      <div>
        <h2 style={{
          margin: 0,
          fontSize: '1rem',
          fontWeight: 600,
          lineHeight: 1.3,
          letterSpacing: '-0.01em',
        }}>
          {getGreeting()},{' '}
          <span className="text-gradient">{user.name}</span>
        </h2>
        <p style={{
          margin: 0,
          color: 'var(--text-tertiary)',
          fontSize: '0.75rem',
          marginTop: '2px',
          fontWeight: 400,
        }}>
          {formatDate()}
        </p>
      </div>

      {/* Right: Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        {/* Notification Bell */}
        <button
          style={{
            position: 'relative',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            transition: 'all 0.2s ease',
            padding: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-card-hover)';
            e.currentTarget.style.borderColor = 'var(--border-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-card)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          aria-label="Notifications"
        >
          <Bell size={18} />
          {/* Notification dot indicator */}
          <span style={{
            position: 'absolute',
            top: '7px',
            right: '8px',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: 'var(--danger)',
            border: '1.5px solid var(--bg-card)',
          }} />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Avatar */}
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'var(--gradient-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.8125rem',
          color: '#fff',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)',
          flexShrink: 0,
        }}>
          {user.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
