import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Send,
  Shield,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  CreditCard,
  Bell,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const userNavItems = [
    {
      group: 'MAIN',
      items: [
        { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/transactions', icon: <ArrowLeftRight size={20} />, label: 'Transactions' },
      ],
    },
    {
      group: 'ACCOUNT',
      items: [
        { path: '/profile', icon: <User size={20} />, label: 'Profile' },
        { path: '/cards', icon: <CreditCard size={20} />, label: 'My Cards' },
        { path: '/security', icon: <Shield size={20} />, label: 'Security' },
      ],
    },
    {
      group: 'MORE',
      items: [
        { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
      ],
    },
  ];

  const adminNavItems = [
    {
      group: 'ADMIN',
      items: [
        { path: '/admin', icon: <ShieldCheck size={20} />, label: 'Admin Panel' },
        { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
      ],
    },
  ];

  const navGroups = user?.role === 'admin' ? adminNavItems : userNavItems;

  const mobileNavItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Home' },
    { path: '/transactions', icon: <ArrowLeftRight size={20} />, label: 'Activity' },
    { path: '/dashboard', icon: <Send size={18} />, label: 'Transfer', isCenter: true },
    { path: '/cards', icon: <CreditCard size={20} />, label: 'Cards' },
    { path: '/profile', icon: <User size={20} />, label: 'Profile' },
  ];

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '10px',
    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
    background: isActive ? 'var(--accent-ultra-light)' : 'transparent',
    borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
    transition: 'all 0.2s ease',
    fontWeight: isActive ? 600 : 400,
    fontSize: '0.875rem',
    textDecoration: 'none',
    marginLeft: isActive ? '-3px' : '0',
  });

  const sidebarContent = (
    <>
      {/* Logo */}
      <div style={{
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 4px',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'var(--gradient-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.875rem',
          fontWeight: 800,
          color: '#fff',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
        }}>
          S
        </div>
        <span style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: 'var(--text-heading)',
          letterSpacing: '-0.02em',
        }}>
          SecureBank
        </span>
      </div>

      {/* Navigation Groups */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
        {navGroups.map((group) => (
          <div key={group.group}>
            <p style={{
              fontSize: '0.625rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-tertiary)',
              padding: '0 14px',
              marginBottom: '8px',
            }}>
              {group.group}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {group.items.map((item) => (
                <NavLink
                  key={item.path + item.label}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  style={navLinkStyle}
                >
                  <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Info */}
      {user && (
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px',
          marginTop: '16px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 4px',
            marginBottom: '12px',
          }}>
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
              flexShrink: 0,
            }}>
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-heading)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user.name}
              </p>
              <p style={{
                fontSize: '0.6875rem',
                color: 'var(--text-tertiary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user.email}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.8125rem',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--danger-bg)';
              e.currentTarget.style.color = 'var(--danger)';
              e.currentTarget.style.borderColor = 'var(--danger)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hide-mobile" style={{
        width: '260px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        borderRight: '1px solid var(--sidebar-border)',
        background: 'var(--sidebar-bg)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background 0.3s ease, border-color 0.3s ease',
        zIndex: 50,
        overflowY: 'auto',
      }}>
        {sidebarContent}
      </aside>

      {/* ===== TABLET HAMBURGER ===== */}
      <button
        className="hide-desktop"
        onClick={() => setMobileOpen(true)}
        style={{
          position: 'fixed',
          top: '12px',
          left: '12px',
          zIndex: 60,
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          transition: 'all 0.2s ease',
          boxShadow: 'var(--shadow-sm)',
        }}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* ===== MOBILE OVERLAY SIDEBAR ===== */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'var(--overlay-bg)',
                zIndex: 70,
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                width: '260px',
                background: 'var(--sidebar-bg)',
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 80,
                borderRight: '1px solid var(--sidebar-border)',
                overflowY: 'auto',
              }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===== MOBILE BOTTOM NAVIGATION ===== */}
      <nav className="mobile-bottom-nav">
        {mobileNavItems.map((item, index) => {
          if (item.isCenter) {
            return (
              <NavLink
                key={`center-${index}`}
                to={item.path}
                className="nav-item-center"
                aria-label={item.label}
              >
                {item.icon}
              </NavLink>
            );
          }
          return (
            <NavLink
              key={item.path + item.label}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
