import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import bankingEvents from '../utils/eventDispatcher';
import toast from 'react-hot-toast';

const AppDataContext = createContext(null);

export const AppDataProvider = ({ children }) => {
  const { user, refreshUser } = useAuth();

  // ─── Transactions Cache ───
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const txRefreshingRef = useRef(false);

  // ─── Cards Cache ───
  const [cards, setCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const cardsRefreshingRef = useRef(false);

  // ─── Admin Cache ───
  const [adminData, setAdminData] = useState({ users: [], transactions: [], cards: [], auditLogs: [] });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminLastUpdated, setAdminLastUpdated] = useState(null);
  const adminRefreshingRef = useRef(false);

  // ─── Refresh Transactions (with simultaneous-call protection) ───
  const refreshTransactions = useCallback(async () => {
    if (txRefreshingRef.current) return; // Prevent duplicate simultaneous calls
    txRefreshingRef.current = true;
    setTransactionsLoading(true);
    try {
      const response = await api.get('/transactions/history');
      const resData = response.data;
      // Support both new standardized and legacy response shapes
      const txs = resData?.data?.transactions
        || (Array.isArray(resData) ? resData : Array.isArray(resData?.transactions) ? resData.transactions : []);
      setTransactions(txs);
    } catch (error) {
      // Recovery: keep previous cached data, show non-blocking warning
      console.error('Failed to refresh transactions', error);
      toast.error('Could not refresh transactions', { id: 'tx-refresh-fail', duration: 3000 });
    } finally {
      setTransactionsLoading(false);
      txRefreshingRef.current = false;
    }
  }, []);

  // ─── Refresh Cards (with simultaneous-call protection) ───
  const refreshCards = useCallback(async () => {
    if (cardsRefreshingRef.current) return;
    cardsRefreshingRef.current = true;
    setCardsLoading(true);
    try {
      const res = await api.get('/cards');
      setCards(res.data);
    } catch (error) {
      console.error('Failed to refresh cards', error);
      toast.error('Could not refresh cards', { id: 'cards-refresh-fail', duration: 3000 });
    } finally {
      setCardsLoading(false);
      cardsRefreshingRef.current = false;
    }
  }, []);

  // ─── Refresh Admin Data (with simultaneous-call protection) ───
  const refreshAdmin = useCallback(async () => {
    if (adminRefreshingRef.current) return;
    adminRefreshingRef.current = true;
    setAdminLoading(true);
    try {
      const [usersRes, txRes, cardsRes, auditRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/transactions'),
        api.get('/admin/cards'),
        api.get('/admin/audit-logs')
      ]);
      setAdminData({
        users: usersRes.data.users || [],
        transactions: txRes.data.transactions || [],
        cards: cardsRes.data.cards || [],
        auditLogs: auditRes.data.logs || []
      });
      setAdminLastUpdated(new Date());
    } catch (error) {
      // Recovery: keep previous cached data, show timestamp of last successful fetch
      console.error('Failed to refresh admin data', error);
      toast.error('Could not refresh admin data', { id: 'admin-refresh-fail', duration: 3000 });
    } finally {
      setAdminLoading(false);
      adminRefreshingRef.current = false;
    }
  }, []);

  // ─── Initial data fetch when user logs in ───
  useEffect(() => {
    if (user) {
      refreshTransactions();
      refreshCards();
      if (user.role === 'admin') {
        refreshAdmin();
      }
    } else {
      // Clear all cached data on logout
      setTransactions([]);
      setCards([]);
      setAdminData({ users: [], transactions: [], cards: [], auditLogs: [] });
      setAdminLastUpdated(null);
    }
  }, [user, refreshTransactions, refreshCards, refreshAdmin]);

  // ─── Event: transaction:success ───
  useEffect(() => {
    const handleTransactionSuccess = () => {
      // Refresh user balance immediately (most critical)
      refreshUser();
      // Refresh transactions cache
      refreshTransactions();
      // Refresh admin if admin user is logged in
      if (user?.role === 'admin') {
        refreshAdmin();
      }
    };

    bankingEvents.on('transaction:success', handleTransactionSuccess);
    return () => bankingEvents.off('transaction:success', handleTransactionSuccess);
  }, [refreshUser, refreshTransactions, refreshAdmin, user?.role]);

  // ─── Event: card:created / card:updated ───
  useEffect(() => {
    const handleCardEvent = () => {
      refreshCards();
      if (user?.role === 'admin') {
        refreshAdmin();
      }
    };

    bankingEvents.on('card:created', handleCardEvent);
    bankingEvents.on('card:updated', handleCardEvent);
    return () => {
      bankingEvents.off('card:created', handleCardEvent);
      bankingEvents.off('card:updated', handleCardEvent);
    };
  }, [refreshCards, refreshAdmin, user?.role]);

  // ─── Event: auth:logout → clear cache ───
  useEffect(() => {
    const handleLogout = () => {
      setTransactions([]);
      setCards([]);
      setAdminData({ users: [], transactions: [], cards: [], auditLogs: [] });
      setAdminLastUpdated(null);
    };

    bankingEvents.on('auth:logout', handleLogout);
    return () => bankingEvents.off('auth:logout', handleLogout);
  }, []);

  const value = {
    // Transactions
    transactions,
    transactionsLoading,
    refreshTransactions,
    // Cards
    cards,
    setCards,
    cardsLoading,
    refreshCards,
    // Admin
    adminData,
    adminLoading,
    adminLastUpdated,
    refreshAdmin,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return ctx;
};
