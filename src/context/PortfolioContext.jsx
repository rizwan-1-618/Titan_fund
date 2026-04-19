import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  subscribeToUserTransactions,
  subscribeToAllTransactions,
  createTransaction as createTx,
  approveTransaction as approveTx,
  rejectTransaction as rejectTx,
} from '@/services/firestore';

const PortfolioContext = createContext(null);

/**
 * PortfolioProvider — global state for transactions data.
 * Demonstrates: Context API, useEffect with cleanup (Firestore onSnapshot), useCallback.
 */
export function PortfolioProvider({ children }) {
  const { user, userData, isAdmin } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to transactions based on user role
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubscribe;

    if (isAdmin) {
      // Admin sees all transactions
      unsubscribe = subscribeToAllTransactions((data) => {
        setTransactions(data);
        setLoading(false);
      });
    } else {
      // Investor sees only own transactions
      unsubscribe = subscribeToUserTransactions(user.uid, (data) => {
        setTransactions(data);
        setLoading(false);
      });
    }

    // Cleanup: unsubscribe from Firestore listener
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, isAdmin]);

  /**
   * Submit a new transaction request (deposit or withdrawal).
   * Wrapped in useCallback to prevent unnecessary re-renders of child components.
   */
  const submitTransaction = useCallback(
    async (amount, type = 'Deposit', note = '') => {
      if (!user || !userData) throw new Error('Not authenticated');
      setError(null);
      try {
        const txId = await createTx({
          userId: user.uid,
          userName: userData.name,
          amount,
          type,
          note,
        });
        return txId;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user, userData]
  );

  /**
   * Approve a pending transaction (admin only).
   * Wrapped in useCallback.
   */
  const handleApproveTransaction = useCallback(
    async (transactionId, userId, amount, type = 'Deposit') => {
      setError(null);
      try {
        await approveTx(transactionId, userId, amount, type);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    []
  );

  /**
   * Reject/decline a pending transaction (preserves audit trail).
   * Wrapped in useCallback.
   */
  const handleRejectTransaction = useCallback(
    async (transactionId) => {
      setError(null);
      try {
        await rejectTx(transactionId);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    []
  );

  const value = {
    transactions,
    loading,
    error,
    submitTransaction,
    handleApproveTransaction,
    handleRejectTransaction,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

/**
 * Hook to consume PortfolioContext
 */
export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}

export default PortfolioContext;
