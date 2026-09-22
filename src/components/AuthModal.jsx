import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, Phone, User, MapPin, Loader2, ShieldCheck } from 'lucide-react';

export const AuthModal = () => {
  const navigate = useNavigate();
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    loginCustomer,
    registerCustomer,
    loginWithGoogle,
    authLoading
  } = useAuth();
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regPassword, setRegPassword] = useState('');

  useEffect(() => {
    if (!isAuthModalOpen) return;
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const res = await loginCustomer(loginEmail, loginPassword);
    if (res && res.success && res.isAdmin) {
      navigate('/admin');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    await registerCustomer({
      name: regName,
      email: regEmail,
      mobile: regMobile,
      city: regCity,
      password: regPassword
    });
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--text-main)', fontWeight: 800 }}>
              {authModalTab === 'login' ? 'Devotee & Staff Sign In' : 'Create Devotee Account'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {authModalTab === 'login'
                ? 'Sign in to access your bookings or Administrator dashboard'
                : 'Join Shree Yatri Nivas devotee community'}
            </p>
          </div>
          <button onClick={closeAuthModal} style={{ padding: '0.4rem', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)' }}>
          <button
            type="button"
            onClick={() => setAuthModalTab('login')}
            style={{
              flex: 1,
              padding: '0.85rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: authModalTab === 'login' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: authModalTab === 'login' ? '2.5px solid var(--primary)' : 'none',
              backgroundColor: authModalTab === 'login' ? 'var(--primary-light)' : 'transparent'
            }}
          >
            Direct Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthModalTab('register')}
            style={{
              flex: 1,
              padding: '0.85rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: authModalTab === 'register' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: authModalTab === 'register' ? '2.5px solid var(--primary)' : 'none',
              backgroundColor: authModalTab === 'register' ? 'var(--primary-light)' : 'transparent'
            }}
          >
            New Registration
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* 1. Google One-Click Login */}
          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={authLoading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-light)',
              backgroundColor: '#FFFFFF',
              color: 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.92rem',
              boxShadow: 'var(--shadow-xs)',
              cursor: authLoading ? 'not-allowed' : 'pointer',
              marginBottom: '1rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div style={{ textAlign: 'center', margin: '0.75rem 0 1rem', position: 'relative' }}>
            <div style={{ borderBottom: '1px solid var(--border-light)', position: 'absolute', top: '50%', width: '100%' }} />
            <span style={{ backgroundColor: '#FFFFFF', padding: '0 0.75rem', position: 'relative', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              OR DIRECT EMAIL SIGN IN
            </span>
          </div>

          {authModalTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <Mail size={15} color="var(--primary)" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email (e.g. admin@gmail.com)"
                  className="form-control"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={15} color="var(--primary)" /> Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  className="form-control"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem', minHeight: '44px' }}
              >
                {authLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Direct Sign In</span>
                )}
              </button>

              <div style={{
                marginTop: '0.5rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)'
              }}>
                <ShieldCheck size={16} color="var(--primary)" />
                <span>Administrators &amp; staff can also sign in directly using their authorized email.</span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <User size={15} color="var(--primary)" /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Devotee Name"
                  className="form-control"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    <Mail size={15} color="var(--primary)" /> Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="devotee@example.com"
                    className="form-control"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <Phone size={15} color="var(--primary)" /> Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    className="form-control"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    <MapPin size={15} color="var(--primary)" /> City / Hometown
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pandharpur / Pune"
                    className="form-control"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <Lock size={15} color="var(--primary)" /> Password (Min. 6) *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min. 6 chars"
                    className="form-control"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem', minHeight: '44px' }}
              >
                {authLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Devotee Account</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
