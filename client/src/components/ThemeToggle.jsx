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
        width: '64px',
        height: '32px',
        borderRadius: '16px',
        border: 'none',
        cursor: 'pointer',
        background: isDark
          ? 'linear-gradient(135deg, #1a1a2e, #16213e)'
          : 'linear-gradient(135deg, #87CEEB, #FDB813)',
        padding: '3px',
        transition: 'background 0.4s ease',
        overflow: 'hidden',
        boxShadow: isDark
          ? '0 2px 10px rgba(139, 92, 246, 0.3), inset 0 1px 2px rgba(255,255,255,0.05)'
          : '0 2px 10px rgba(253, 184, 19, 0.3), inset 0 1px 2px rgba(255,255,255,0.3)',
      }}
    >
      {isDark && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ position: 'absolute', top: '6px', right: '12px', width: '3px', height: '3px', borderRadius: '50%', background: '#fff' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ delay: 0.1 }}
            style={{ position: 'absolute', top: '14px', right: '20px', width: '2px', height: '2px', borderRadius: '50%', background: '#fff' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.5, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{ position: 'absolute', bottom: '8px', right: '16px', width: '2px', height: '2px', borderRadius: '50%', background: '#fff' }}
          />
        </>
      )}

      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: isDark ? '#8b5cf6' : '#FDB813',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: isDark ? '0px' : '35px',
          boxShadow: isDark
            ? '0 0 8px rgba(139, 92, 246, 0.6)'
            : '0 0 8px rgba(253, 184, 19, 0.6)',
        }}
      >
        {isDark ? (
          <Moon size={14} color="#fff" />
        ) : (
          <Sun size={14} color="#fff" />
        )}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
