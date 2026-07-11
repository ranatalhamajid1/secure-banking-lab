import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      style={{
        position: 'relative',
        width: '60px',
        height: '32px',
        borderRadius: '9999px',
        border: '1.5px solid var(--border-color)',
        cursor: 'pointer',
        background: isDark ? '#09090b' : '#f4f4f5',
        padding: '3px',
        transition: 'background 0.3s ease, border-color 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isDark ? 'flex-start' : 'flex-end',
        overflow: 'hidden',
      }}
    >
      {/* Background Star details for Dark Mode */}
      {isDark && (
        <div style={{ position: 'absolute', right: '10px', display: 'flex', gap: '3px', opacity: 0.6 }}>
          <div style={{ width: '2px', height: '2px', borderRadius: '50%', background: '#fff' }} />
          <div style={{ width: '1px', height: '1px', borderRadius: '50%', background: '#fff', marginTop: '4px' }} />
        </div>
      )}

      {/* Sun rays for Light Mode */}
      {!isDark && (
        <div style={{ position: 'absolute', left: '10px', display: 'flex', gap: '3px', opacity: 0.6 }}>
          <div style={{ width: '2px', height: '2px', borderRadius: '50%', background: '#f59e0b' }} />
        </div>
      )}

      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: isDark
            ? 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)'
            : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isDark
            ? '0 0 12px rgba(139, 92, 246, 0.5)'
            : '0 0 12px rgba(245, 158, 11, 0.5)',
          zIndex: 2,
        }}
      >
        {isDark ? (
          <Moon size={12} color="#fff" />
        ) : (
          <Sun size={12} color="#fff" />
        )}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
