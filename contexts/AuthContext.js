'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  getAuth
} from 'firebase/auth';
import { app, auth as firebaseAuth } from '../lib/firebase';
import { initializeNotifications, registerFCMToken } from '../lib/notificationService';

const AuthContext = createContext(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    // Initialize auth only on the client side
    if (typeof window !== 'undefined') {
      // Use the auth instance from firebase.js if it's already initialized
      if (firebaseAuth) {
        setAuth(firebaseAuth);
      } else {
        // Otherwise initialize it ourselves
        setAuth(getAuth(app));
      }
    }
  }, []);

  // Check if user is admin based on email
  const checkAdmin = (email) => {
    return email === 'umarmaaz2637@gmail.com';
  };

  async function register(email, password) {
    if (!auth) {
      throw new Error('Auth not initialized');
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  async function login(email, password) {
    if (!auth) {
      throw new Error('Auth not initialized');
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    setIsAdmin(checkAdmin(user.email || ''));
    
    // Initialize notifications and register FCM token
    try {
      const fcmToken = await initializeNotifications();
      if (fcmToken) {
        // Register the token in Firestore
        await registerFCMToken(user.uid, fcmToken);
      }
    } catch (error) {
      console.warn('Error initializing notifications (expected in development):', error);
    }
    
    return user;
  }

  async function logout() {
    if (!auth) {
      throw new Error('Auth not initialized');
    }
    return signOut(auth);
  }

  useEffect(() => {
    if (!auth) return; // Don't set up listener if auth isn't initialized

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsAdmin(checkAdmin(user.email || ''));
        
        // Initialize notifications and register FCM token when user is logged in
        try {
          const fcmToken = await initializeNotifications();
          if (fcmToken) {
            await registerFCMToken(user.uid, fcmToken);
          }
        } catch (error) {
          console.warn('Error initializing notifications (expected in development):', error);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const value = {
    currentUser,
    register,
    login,
    logout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}