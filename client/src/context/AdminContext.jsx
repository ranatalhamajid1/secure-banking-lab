import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import bankingEvents from '../utils/eventDispatcher';
import toast from 'react-hot-toast';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const { user } = useAuth();
  
  // State includes data and pagination metadata
  const [adminData, setAdminData] = useState({ 
    users: [], usersPagination: null,
    transactions: [], transactionsPagination: null,
    cards: [], cardsPagination: null,
    auditLogs: [], auditLogsPagination: null 
  });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminLastUpdated, setAdminLastUpdated] = useState(null);
  const adminRefreshingRef = useRef(false);

  const fetchUsers = async (page = 1, limit = 50) => {
    const res = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return res.data;
  };
  const fetchTransactions = async (page = 1, limit = 50) => {
    const res = await api.get(`/admin/transactions?page=${page}&limit=${limit}`);
    return res.data;
  };
  const fetchCards = async (page = 1, limit = 50) => {
    const res = await api.get(`/admin/cards?page=${page}&limit=${limit}`);
    return res.data;
  };
  const fetchAuditLogs = async (page = 1, limit = 50) => {
    const res = await api.get(`/admin/audit-logs?page=${page}&limit=${limit}`);
    return res.data;
  };

  const refreshAdmin = useCallback(async () => {
    if (adminRefreshingRef.current) return;
    adminRefreshingRef.current = true;
    setAdminLoading(true);
    try {
      const [usersData, txData, cardsData, auditData] = await Promise.all([
        fetchUsers(), fetchTransactions(), fetchCards(), fetchAuditLogs()
      ]);
      setAdminData({
        users: usersData.users || [], usersPagination: usersData.pagination,
        transactions: txData.transactions || [], transactionsPagination: txData.pagination,
        cards: cardsData.cards || [], cardsPagination: cardsData.pagination,
        auditLogs: auditData.logs || [], auditLogsPagination: auditData.pagination
      });
      setAdminLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh admin data', error);
      toast.error('Could not refresh admin data', { id: 'admin-refresh-fail', duration: 3000 });
    } finally {
      setAdminLoading(false);
      adminRefreshingRef.current = false;
    }
  }, []);

  // Individual fetchers for pagination buttons
  const loadUsersPage = async (page) => {
    try {
      const data = await fetchUsers(page);
      setAdminData(prev => ({ ...prev, users: data.users, usersPagination: data.pagination }));
    } catch (err) { toast.error("Failed to load page"); }
  };
  const loadTransactionsPage = async (page) => {
    try {
      const data = await fetchTransactions(page);
      setAdminData(prev => ({ ...prev, transactions: data.transactions, transactionsPagination: data.pagination }));
    } catch (err) { toast.error("Failed to load page"); }
  };
  const loadCardsPage = async (page) => {
    try {
      const data = await fetchCards(page);
      setAdminData(prev => ({ ...prev, cards: data.cards, cardsPagination: data.pagination }));
    } catch (err) { toast.error("Failed to load page"); }
  };
  const loadAuditLogsPage = async (page) => {
    try {
      const data = await fetchAuditLogs(page);
      setAdminData(prev => ({ ...prev, auditLogs: data.logs, auditLogsPagination: data.pagination }));
    } catch (err) { toast.error("Failed to load page"); }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      refreshAdmin();
    } else {
      setAdminData({ 
        users: [], usersPagination: null,
        transactions: [], transactionsPagination: null,
        cards: [], cardsPagination: null,
        auditLogs: [], auditLogsPagination: null 
      });
      setAdminLastUpdated(null);
    }
  }, [user, refreshAdmin]);

  useEffect(() => {
    const handleGlobalUpdate = () => {
      if (user?.role === 'admin') {
        refreshAdmin();
      }
    };
    bankingEvents.on('transaction:success', handleGlobalUpdate);
    bankingEvents.on('card:created', handleGlobalUpdate);
    bankingEvents.on('card:updated', handleGlobalUpdate);
    
    return () => {
      bankingEvents.off('transaction:success', handleGlobalUpdate);
      bankingEvents.off('card:created', handleGlobalUpdate);
      bankingEvents.off('card:updated', handleGlobalUpdate);
    };
  }, [refreshAdmin, user?.role]);

  useEffect(() => {
    const handleLogout = () => {
      setAdminData({ 
        users: [], usersPagination: null,
        transactions: [], transactionsPagination: null,
        cards: [], cardsPagination: null,
        auditLogs: [], auditLogsPagination: null 
      });
      setAdminLastUpdated(null);
    };
    bankingEvents.on('auth:logout', handleLogout);
    return () => bankingEvents.off('auth:logout', handleLogout);
  }, []);

  return (
    <AdminContext.Provider value={{ 
      adminData, adminLoading, adminLastUpdated, refreshAdmin,
      loadUsersPage, loadTransactionsPage, loadCardsPage, loadAuditLogsPage
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return ctx;
};
