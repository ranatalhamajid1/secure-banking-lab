import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search } from 'lucide-react';

const UserTable = ({ users = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(q)) ||
      (user.email && user.email.toLowerCase().includes(q))
    );
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  const getInitial = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="glass-panel" style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <Users size={20} color="#a78bfa" />
          </div>
          <h2 style={styles.headerTitle}>User Management</h2>
        </div>
        <span style={styles.rowCount}>
          Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search Bar */}
      <div style={styles.searchWrapper}>
        <Search size={16} color="#94a3b8" style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Table */}
      {filteredUsers.length === 0 ? (
        <div style={styles.emptyState}>
          <Users size={48} color="#475569" />
          <p style={styles.emptyText}>
            {searchQuery ? 'No users match your search' : 'No users found'}
          </p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Balance</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Joined</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user._id || index}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    style={styles.tr}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(139,92,246,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {/* User (avatar + name) */}
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={styles.avatar}>{getInitial(user.name)}</div>
                        <span style={styles.userName}>{user.name || 'Unknown'}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ ...styles.td, color: '#94a3b8' }}>{user.email}</td>

                    {/* Role Badge */}
                    <td style={styles.td}>
                      <span
                        style={
                          user.role === 'admin'
                            ? styles.badgeAdmin
                            : styles.badgeUser
                        }
                      >
                        {user.role === 'admin' ? 'ADMIN' : 'USER'}
                      </span>
                    </td>

                    {/* Balance */}
                    <td style={{ ...styles.td, fontFamily: "'JetBrains Mono', monospace", color: '#e2e8f0' }}>
                      ${Number(user.accountBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Status */}
                    <td style={styles.td}>
                      <div style={styles.statusCell}>
                        <span style={styles.statusDot} />
                        <span style={{ color: '#4ade80' }}>Active</span>
                      </div>
                    </td>

                    {/* Joined */}
                    <td style={{ ...styles.td, color: '#94a3b8' }}>
                      {formatDate(user.createdAt)}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  panel: {
    background: 'rgba(15,23,42,0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(139,92,246,0.15)',
    borderRadius: '16px',
    padding: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'rgba(139,92,246,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#f1f5f9',
    margin: 0,
  },
  rowCount: {
    fontSize: '13px',
    color: '#64748b',
  },
  searchWrapper: {
    position: 'relative',
    marginBottom: '20px',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px 10px 40px',
    background: 'rgba(30,41,59,0.7)',
    border: '1px solid rgba(100,116,139,0.25)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid rgba(100,116,139,0.2)',
    whiteSpace: 'nowrap',
  },
  tr: {
    transition: 'background 0.2s',
    borderBottom: '1px solid rgba(100,116,139,0.1)',
    cursor: 'default',
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#e2e8f0',
    whiteSpace: 'nowrap',
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  userName: {
    fontWeight: 600,
    color: '#f1f5f9',
  },
  badgeAdmin: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    background: 'rgba(139,92,246,0.18)',
    color: '#a78bfa',
    border: '1px solid rgba(139,92,246,0.3)',
  },
  badgeUser: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    background: 'rgba(6,182,212,0.15)',
    color: '#22d3ee',
    border: '1px solid rgba(6,182,212,0.3)',
  },
  statusCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#4ade80',
    boxShadow: '0 0 8px rgba(74,222,128,0.5)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '16px',
  },
  emptyText: {
    color: '#64748b',
    fontSize: '15px',
    margin: 0,
  },
};

export default UserTable;
