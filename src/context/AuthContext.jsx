import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/services/firebase';
import { getUserDoc, createUserDoc } from '@/services/firestore';

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app to provide global authentication state.
 * Demonstrates: Context API, useEffect with cleanup (onAuthStateChanged listener).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);          // Firebase Auth user object
  const [userData, setUserData] = useState(null);   // Firestore user document
  const [loading, setLoading] = useState(true);     // Initial auth check
  const [error, setError] = useState(null);

  // Subscribe to Firebase Auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    let unsubscribe;
    try {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            setUser(firebaseUser);
            // Fetch the full user profile from Firestore
            const profile = await getUserDoc(firebaseUser.uid);
            setUserData(profile);
          } else {
            setUser(null);
            setUserData(null);
          }
        } catch (err) {
          console.error('Auth state change error:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      });
    } catch (err) {
      console.error('Auth listener setup error:', err);
      setLoading(false);
    }

    // Cleanup: unsubscribe from auth listener
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  /**
   * Login with email and password
   */
  async function login(email, password) {
    if (!isFirebaseConfigured) {
      throw { code: 'auth/configuration-error', message: 'Firebase is not configured. Please add your Firebase credentials to the .env file.' };
    }
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getUserDoc(result.user.uid);
      setUserData(profile);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  /**
   * Sign up a new user, create Firestore profile
   */
  async function signup(email, password, name) {
    if (!isFirebaseConfigured) {
      throw { code: 'auth/configuration-error', message: 'Firebase is not configured. Please add your Firebase credentials to the .env file.' };
    }
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Create the Firestore user doc
      await createUserDoc(result.user.uid, {
        email,
        name,
        role: 'investor', // default role
      });
      const profile = await getUserDoc(result.user.uid);
      setUserData(profile);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  /**
   * Logout the current user
   */
  async function logout() {
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  const value = {
    user,
    userData,
    loading,
    error,
    login,
    signup,
    logout,
    isAdmin: userData?.role === 'admin',
    isAuthenticated: !!user,
    isFirebaseConfigured,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to consume AuthContext
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
