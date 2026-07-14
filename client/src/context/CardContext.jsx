import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import bankingEvents from '../utils/eventDispatcher';
import toast from 'react-hot-toast';

const CardContext = createContext(null);

export const CardProvider = ({ children }) => {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const cardsRefreshingRef = useRef(false);

  const refreshCards = useCallback(async () => {
    if (cardsRefreshingRef.current) return;
    cardsRefreshingRef.current = true;
    setCardsLoading(true);
    try {
      const res = await api.get('/cards');
      setCards(res.data?.data?.cards || res.data || []);
    } catch (error) {
      console.error('Failed to refresh cards', error);
      toast.error('Could not refresh cards', { id: 'cards-refresh-fail', duration: 3000 });
    } finally {
      setCardsLoading(false);
      cardsRefreshingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (user) {
      refreshCards();
    } else {
      setCards([]);
    }
  }, [user, refreshCards]);

  useEffect(() => {
    const handleCardEvent = () => {
      refreshCards();
    };
    bankingEvents.on('card:created', handleCardEvent);
    bankingEvents.on('card:updated', handleCardEvent);
    return () => {
      bankingEvents.off('card:created', handleCardEvent);
      bankingEvents.off('card:updated', handleCardEvent);
    };
  }, [refreshCards]);

  useEffect(() => {
    const handleLogout = () => {
      setCards([]);
    };
    bankingEvents.on('auth:logout', handleLogout);
    return () => bankingEvents.off('auth:logout', handleLogout);
  }, []);

  return (
    <CardContext.Provider value={{ cards, setCards, cardsLoading, refreshCards }}>
      {children}
    </CardContext.Provider>
  );
};

export const useCard = () => {
  const ctx = useContext(CardContext);
  if (!ctx) {
    throw new Error('useCard must be used within a CardProvider');
  }
  return ctx;
};
