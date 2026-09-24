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

    // Check if active session is Admin or Staff
    const activeCust = StorageService.getCurrentCustomer();
    if (activeCust && (activeCust.role === 'admin' || activeCust.role === 'staff')) {
      setIsAdminLoggedIn(true);
      setCustomer(activeCust);
      setAuthLoading(false);
    } else {
      setIsAdminLoggedIn(StorageService.isAdminLoggedIn());
    }

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
              city: data.city || 'Kolhapur Guest',
              role: data.role || 'user',
              photoURL: firebaseUser.photoURL || null
            };
            setCustomer(session);
            StorageService.setCurrentCustomer(session);
          } else {
            // First-time Google or new Auth user
            const newProfile = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Devotee',
              email: firebaseUser.email,
              mobile: firebaseUser.phoneNumber || '',
              city: 'Kolhapur Guest',
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
        // If not in Firebase Auth, preserve admin or staff if active
        const localCust = StorageService.getCurrentCustomer();
        if (localCust && (localCust.role === 'admin' || localCust.role === 'staff')) {
          setCustomer(localCust);
          setIsAdminLoggedIn(true);
        } else {
          setCustomer(localCust || null);
        }
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

  // 1. Unified Sign-in with Email & Password (Devotees, Staff & Administrators)
  const loginCustomer = useCallback(async (identifier, password) => {
    setAuthLoading(true);

    // Check 1: Is this an Administrator or Staff member logging in via public login?
    const adminStaffCheck = StorageService.validateAdminOrStaffLogin(identifier, password);
    if (adminStaffCheck.success) {
      const user = adminStaffCheck.user;

      // Also authenticate with Firebase Auth so Firestore security rules recognize the session
      try {
        await signInWithEmailAndPassword(auth, user.email, password);
      } catch (authErr) {
        console.warn('Firebase Auth admin sign-in notice:', authErr.code);
      }

      StorageService.setCurrentCustomer(user);
      localStorage.setItem('syn_admin_auth_v1', 'true');
      setIsAdminLoggedIn(true);
      setCustomer(user);
      setAuthLoading(false);
      setIsAuthModalOpen(false);
      showSuccess(`Welcome, ${user.name}! Logged into ${user.role === 'admin' ? 'Administrator' : 'Staff'} Portal.`);
      return { success: true, role: user.role, isAdmin: true };
    }

    // Check 2: Authenticate Devotee through Firebase Auth
    try {
      const email = identifier.includes('@')
        ? identifier.trim().toLowerCase()
        : `${identifier.trim().replace(/\D/g, '')}@hotelvihanninn.in`;

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
        city: userProfile?.city || 'Kolhapur Guest',
        role: userProfile?.role || 'user'
      };

      StorageService.setCurrentCustomer(session);
      setCustomer(session);
      showSuccess(`Welcome back, ${session.name}!`);
      setIsAuthModalOpen(false);
      setAuthLoading(false);
      return { success: true, role: 'user', isAdmin: false };
    } catch (err) {
      console.warn('Firebase login failed:', err.message);

      let errorMsg = 'Invalid email/mobile or password.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMsg = 'Incorrect login credentials. Please verify your email and password.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMsg = 'Too many failed attempts. Please try again later.';
      } else if (err.code) {
        errorMsg = err.message;
      }
      showError(errorMsg);
      setAuthLoading(false);
      return { success: false, error: errorMsg };
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
        city: formData.city ? formData.city.trim() : 'Kolhapur Guest',
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
            city: 'Kolhapur Guest',
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
        city: userProfile?.city || 'Kolhapur Guest',
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
    StorageService.adminLogout();
    setIsAdminLoggedIn(false);
    setCustomer(null);
    showInfo('You have logged out successfully.');
  }, [showInfo]);

  // 5. Admin Authentication
  const loginAdmin = useCallback((username, password) => {
    const ok = StorageService.adminLogin(username, password);
    if (ok) {
      const active = StorageService.getCurrentCustomer();
      setIsAdminLoggedIn(true);
      setCustomer(active);
      showSuccess('Admin access granted.');
      return true;
    } else {
      showError('Invalid admin credentials. Please use your configured email and password.');
      return false;
    }
  }, [showSuccess, showError]);

  const logoutAdmin = useCallback(() => {
    StorageService.adminLogout();
    setIsAdminLoggedIn(false);
    setCustomer(null);
    showInfo('Admin signed out.');
  }, [showInfo]);

  // 6. Admin Authority: Update Own Credentials
  const updateAdminCredentials = useCallback((newConfig) => {
    try {
      const updated = StorageService.updateAdminConfig(newConfig);
      if (customer && customer.role === 'admin') {
        const refreshed = { ...customer, email: updated.email, name: updated.name };
        setCustomer(refreshed);
        StorageService.setCurrentCustomer(refreshed);
      }
      showSuccess('Administrator credentials updated successfully!');
      return { success: true, config: updated };
    } catch (err) {
      showError(err.message || 'Failed to update credentials.');
      return { success: false, message: err.message };
    }
  }, [customer, showSuccess, showError]);

  // 7. Admin Authority: Create Staff Account
  const createStaff = useCallback((staffData) => {
    try {
      const newStaff = StorageService.createStaffMember(staffData);
      showSuccess(`Staff account created for ${newStaff.name} (${newStaff.email})!`);
      return { success: true, staff: newStaff };
    } catch (err) {
      showError(err.message || 'Failed to create staff account.');
      return { success: false, message: err.message };
    }
  }, [showSuccess, showError]);

  // 8. Admin Authority: Delete Staff Account
  const deleteStaff = useCallback((id) => {
    try {
      StorageService.deleteStaffMember(id);
      showInfo('Staff account removed.');
      return { success: true };
    } catch (err) {
      showError(err.message || 'Failed to remove staff.');
      return { success: false };
    }
  }, [showInfo, showError]);

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
        logoutAdmin,
        updateAdminCredentials,
        createStaff,
        deleteStaff
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
