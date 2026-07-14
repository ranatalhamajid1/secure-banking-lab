import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import bankingEvents from '../utils/eventDispatcher';
import toast from 'react-hot-toast';

const TransactionContext = createContext(null);

export const TransactionProvider = ({ children }) => {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const txRefreshingRef = useRef(false);

  const refreshTransactions = useCallback(async () => {
    if (txRefreshingRef.current) return;
    txRefreshingRef.current = true;
    setTransactionsLoading(true);
    try {
      const response = await api.get('/transactions/history');
      const resData = response.data;
      const txs = resData?.data?.transactions
        || (Array.isArray(resData) ? resData : Array.isArray(resData?.transactions) ? resData.transactions : []);
      setTransactions(txs);
    } catch (error) {
      console.error('Failed to refresh transactions', error);
      toast.error('Could not refresh transactions', { id: 'tx-refresh-fail', duration: 3000 });
    } finally {
      setTransactionsLoading(false);
      txRefreshingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (user) {
      refreshTransactions();
    } else {
      setTransactions([]);
    }
  }, [user, refreshTransactions]);

  useEffect(() => {
    const handleTransactionSuccess = () => {
      refreshUser();
      refreshTransactions();
    };
    bankingEvents.on('transaction:success', handleTransactionSuccess);
    return () => bankingEvents.off('transaction:success', handleTransactionSuccess);
  }, [refreshUser, refreshTransactions]);

  useEffect(() => {
    const handleLogout = () => {
      setTransactions([]);
    };
    bankingEvents.on('auth:logout', handleLogout);
    return () => bankingEvents.off('auth:logout', handleLogout);
  }, []);

  return (
    <TransactionContext.Provider value={{ transactions, transactionsLoading, refreshTransactions }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => {
  const ctx = useContext(TransactionContext);
  if (!ctx) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return ctx;
};
