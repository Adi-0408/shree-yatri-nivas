import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/storageService';
import { useToast } from './ToastContext';
import { auth, db, googleProvider } from '../services/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { showSuccess, showError, showInfo } = useToast();
  const [customer, setCustomer] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    StorageService.init();
    setIsAdminLoggedIn(StorageService.isAdminLoggedIn());

    // Listen to Firebase Authentication state in real-time
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);
      if (firebaseUser) {
        try {
          // Fetch extra devotee profile from Cloud Firestore users collection
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            const session = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              name: data.name || firebaseUser.displayName || 'Devotee',
              email: data.email || firebaseUser.email,
              mobile: data.mobile || firebaseUser.phoneNumber || '',
              city: data.city || 'Pandharpur Devotee',
              role: data.role || 'user',
              photoURL: firebaseUser.photoURL || null
            };
            setCustomer(session);
            StorageService.setCurrentCustomer(session);
          } else {
            // Document does not exist yet (e.g. initial Google login)
            const newProfile = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Devotee',
              email: firebaseUser.email,
              mobile: firebaseUser.phoneNumber || '',
              city: 'Pandharpur Devotee',
              role: 'user',
              photoURL: firebaseUser.photoURL || null,
              created_at: new Date().toISOString()
            };
            setCustomer(newProfile);
            StorageService.setCurrentCustomer(newProfile);
            setDoc(userDocRef, newProfile, { merge: true }).catch(err => {
              console.warn('Could not auto-create Firestore user profile:', err.message);
            });
          }
        } catch (err) {
          console.warn('Error fetching Firestore user profile:', err.message);
          const cached = StorageService.getCurrentCustomer();
          if (cached) setCustomer(cached);
        }
      } else {
        // If not in Firebase Auth, check if local customer session exists (e.g. demo mode)
        const localCust = StorageService.getCurrentCustomer();
        setCustomer(localCust || null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = useCallback((tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // 1. Devotee Sign-in with Email & Password via Firebase Auth
  const loginCustomer = useCallback(async (identifier, password) => {
    setAuthLoading(true);
    try {
      const email = identifier.includes('@')
        ? identifier.trim().toLowerCase()
        : `${identifier.trim().replace(/\D/g, '')}@shreeyatrinivas.in`;

      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      let userProfile = null;
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          userProfile = snap.data();
        }
      } catch (e) {
        console.warn('Could not fetch user profile from Firestore:', e.message);
      }

      const session = {
        id: user.uid,
        uid: user.uid,
        name: userProfile?.name || user.displayName || user.email.split('@')[0],
        email: user.email,
        mobile: userProfile?.mobile || '',
        city: userProfile?.city || 'Pandharpur Devotee',
        role: userProfile?.role || 'user'
      };

      StorageService.setCurrentCustomer(session);
      setCustomer(session);
      showSuccess(`Welcome back, ${session.name}!`);
      setIsAuthModalOpen(false);
      setAuthLoading(false);
      return true;
    } catch (err) {
      console.warn('Firebase login failed, testing local fallback:', err.message);
      // Graceful fallback for local demo accounts
      const res = StorageService.customerLogin(identifier, password);
      if (res.success) {
        setCustomer(res.customer);
        showSuccess(`Welcome back, ${res.customer.name}!`);
        setIsAuthModalOpen(false);
        setAuthLoading(false);
        return true;
      }

      let errorMsg = 'Invalid email/mobile or password.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMsg = 'Incorrect login credentials. Please verify your email and password.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMsg = 'Too many failed attempts. Please reset your password or try again later.';
      } else if (err.code) {
        errorMsg = err.message;
      }
      showError(errorMsg);
      setAuthLoading(false);
      return false;
    }
  }, [showSuccess, showError]);

  // 2. Devotee Registration via Firebase Auth
  const registerCustomer = useCallback(async (formData) => {
    setAuthLoading(true);
    try {
      if (!formData.email || !formData.password || formData.password.length < 6) {
        showError('Please provide a valid email and a password of at least 6 characters.');
        setAuthLoading(false);
        return false;
      }

      const cred = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      const user = cred.user;

      // Update displayName in Firebase Auth
      await updateProfile(user, { displayName: formData.name.trim() });

      const newProfile = {
        id: user.uid,
        uid: user.uid,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        city: formData.city ? formData.city.trim() : 'Pandharpur Devotee',
        role: 'user',
        created_at: new Date().toISOString()
      };

      // Persist profile into Cloud Firestore
      try {
        await setDoc(doc(db, 'users', user.uid), newProfile, { merge: true });
      } catch (err) {
        console.warn('Firestore user profile save error:', err.message);
      }

      StorageService.setCurrentCustomer(newProfile);
      setCustomer(newProfile);
      showSuccess(`Account created! Welcome, ${newProfile.name}!`);
      setIsAuthModalOpen(false);
      setAuthLoading(false);
      return true;
    } catch (err) {
      console.error('Registration failed:', err);
      let errorMsg = 'Registration failed.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'An account with this email already exists. Please sign in.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      showError(errorMsg);
      setAuthLoading(false);
      return false;
    }
  }, [showSuccess, showError]);

  // 3. One-Click Google Sign-In
  const loginWithGoogle = useCallback(async () => {
    setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      let userProfile = null;
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          userProfile = snap.data();
        } else {
          userProfile = {
            id: user.uid,
            uid: user.uid,
            name: user.displayName || 'Devotee',
            email: user.email,
            mobile: user.phoneNumber || '',
            city: 'Pandharpur Devotee',
            role: 'user',
            photoURL: user.photoURL || null,
            created_at: new Date().toISOString()
          };
          await setDoc(userRef, userProfile, { merge: true });
        }
      } catch (e) {
        console.warn('Firestore Google profile sync:', e.message);
      }

      const session = {
        id: user.uid,
        uid: user.uid,
        name: userProfile?.name || user.displayName || 'Devotee',
        email: user.email,
        mobile: userProfile?.mobile || '',
        city: userProfile?.city || 'Pandharpur Devotee',
        role: userProfile?.role || 'user',
        photoURL: user.photoURL || null
      };

      StorageService.setCurrentCustomer(session);
      setCustomer(session);
      showSuccess(`Signed in with Google! Welcome, ${session.name}!`);
      setIsAuthModalOpen(false);
      setAuthLoading(false);
      return true;
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      let errorMsg = 'Google Sign-In was cancelled or failed.';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMsg = 'Sign-in popup was closed before completing.';
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMsg = 'Domain not authorized in Firebase Console. Add localhost to Authorized Domains.';
      }
      showError(errorMsg);
      setAuthLoading(false);
      return false;
    }
  }, [showSuccess, showError]);

  // 4. Sign Out
  const logoutCustomer = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut error:', e.message);
    }
    StorageService.customerLogout();
    setCustomer(null);
    showInfo('You have logged out successfully.');
  }, [showInfo]);

  // 5. Admin Authentication
  const loginAdmin = useCallback((username, password) => {
    const ok = StorageService.adminLogin(username, password);
    if (ok) {
      setIsAdminLoggedIn(true);
      showSuccess('Admin access granted.');
      return true;
    } else {
      showError('Invalid admin credentials. Use admin / admin123');
      return false;
    }
  }, [showSuccess, showError]);

  const logoutAdmin = useCallback(() => {
    StorageService.adminLogout();
    setIsAdminLoggedIn(false);
    showInfo('Admin signed out.');
  }, [showInfo]);

  return (
    <AuthContext.Provider
      value={{
        customer,
        isCustomerLoggedIn: !!customer,
        authLoading,
        isAdminLoggedIn,
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal,
        loginCustomer,
        registerCustomer,
        loginWithGoogle,
        logoutCustomer,
        loginAdmin,
        logoutAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
