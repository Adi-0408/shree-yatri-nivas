import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, Phone, User, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, setAuthModalTab, loginCustomer, registerCustomer } = useAuth();
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regPassword, setRegPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    loginCustomer(loginIdentifier, loginPassword);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    registerCustomer({
      name: regName,
      email: regEmail,
      mobile: regMobile,
      city: regCity,
      password: regPassword
    });
  };

  const handleFillDemo = () => {
    setLoginIdentifier('ramesh@example.com');
    setLoginPassword('password123');
    loginCustomer('ramesh@example.com', 'password123');
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--text-main)' }}>
              {authModalTab === 'login' ? 'Devotee Sign In' : 'Create Guest Account'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {authModalTab === 'login'
                ? 'Access your bookings and faster reservation checkouts'
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
            Sign In
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
          {authModalTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <Mail size={15} /> Email or Mobile Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ramesh@example.com or 9823045671"
                  className="form-control"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={15} /> Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  className="form-control"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Sign In to Account
              </button>

              <div style={{ textAlign: 'center', margin: '0.5rem 0', position: 'relative' }}>
                <div style={{ borderBottom: '1px solid var(--border-light)', position: 'absolute', top: '50%', width: '100%' }} />
                <span style={{ backgroundColor: '#FFFFFF', padding: '0 0.75rem', position: 'relative', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  OR QUICK DEMO
                </span>
              </div>

              <button
                type="button"
                onClick={handleFillDemo}
                className="btn btn-secondary"
                style={{ width: '100%', border: '1px dashed var(--gold)', color: 'var(--primary)' }}
              >
                <Sparkles size={16} color="var(--gold)" />
                <span>1-Click Devotee Demo Sign In (Ramesh)</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <User size={15} /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Kulkarni"
                  className="form-control"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    <Mail size={15} /> Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    className="form-control"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <Phone size={15} /> Mobile Number *
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
                    <MapPin size={15} /> City / Hometown
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pune / Mumbai"
                    className="form-control"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <Lock size={15} /> Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min. 4 chars"
                    className="form-control"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Create Free Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
