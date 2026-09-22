import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/storageService';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { showSuccess, showError, showInfo } = useToast();
  const [customer, setCustomer] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    StorageService.init();
    setCustomer(StorageService.getCurrentCustomer());
    setIsAdminLoggedIn(StorageService.isAdminLoggedIn());
  }, []);

  const openAuthModal = useCallback((tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const loginCustomer = useCallback((identifier, password) => {
    const res = StorageService.customerLogin(identifier, password);
    if (res.success) {
      setCustomer(res.customer);
      showSuccess(`Welcome back, ${res.customer.name}!`);
      setIsAuthModalOpen(false);
      return true;
    } else {
      showError(res.message || 'Login failed.');
      return false;
    }
  }, [showSuccess, showError]);

  const registerCustomer = useCallback((formData) => {
    const res = StorageService.customerRegister(formData);
    if (res.success) {
      setCustomer(res.customer);
      showSuccess(`Account created! Welcome, ${res.customer.name}!`);
      setIsAuthModalOpen(false);
      return true;
    } else {
      showError(res.message || 'Registration failed.');
      return false;
    }
  }, [showSuccess, showError]);

  const logoutCustomer = useCallback(() => {
    StorageService.customerLogout();
    setCustomer(null);
    showInfo('You have logged out successfully.');
  }, [showInfo]);

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
        isAdminLoggedIn,
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal,
        loginCustomer,
        registerCustomer,
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
