import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building, 
  Menu, 
  X, 
  User, 
  LogOut, 
  ShieldAlert, 
  CalendarCheck, 
  Sparkles,
  PhoneCall
} from 'lucide-react';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { customer, isCustomerLoggedIn, logoutCustomer, openAuthModal, isAdminLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleNavClick = () => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <nav className="syn-navbar" role="navigation" aria-label="Main Navigation">
      <div className="syn-container syn-navbar-inner">
        {/* Brand */}
        <Link to="/" viewTransition className="syn-brand" onClick={handleNavClick}>
          <div className="syn-brand-icon">
            <Building size={24} />
          </div>
          <div>
            <div className="syn-brand-title">SHREE YATRI NIVAS</div>
            <div className="syn-brand-subtitle">Pandharpur Pilgrimage Lodging</div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="syn-nav-links">
          <li>
            <NavLink to="/" viewTransition className={({ isActive }) => `syn-nav-link ${isActive ? 'active' : ''}`} end>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/rooms" viewTransition className={({ isActive }) => `syn-nav-link ${isActive ? 'active' : ''}`}>
              Rooms & Rates
            </NavLink>
          </li>
          <li>
            <NavLink to="/booking" viewTransition className={({ isActive }) => `syn-nav-link ${isActive ? 'active' : ''}`}>
              Book Now
            </NavLink>
          </li>
          <li>
            <NavLink to="/reviews" viewTransition className={({ isActive }) => `syn-nav-link ${isActive ? 'active' : ''}`}>
              Reviews
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" viewTransition className={({ isActive }) => `syn-nav-link ${isActive ? 'active' : ''}`}>
              Contact
            </NavLink>
          </li>
        </ul>

        {/* Right Actions (Auth & CTA) */}
        <div className="syn-nav-actions">
          {isCustomerLoggedIn ? (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <User size={16} color="var(--primary)" />
                <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {(customer?.name || 'Devotee').split(' ')[0]}
                </span>
              </button>

              {dropdownOpen && (
                <div className="syn-dropdown-menu">
                  <div className="syn-dropdown-header">
                    <div className="syn-dropdown-name">{customer?.name || 'Devotee'}</div>
                    <div className="syn-dropdown-sub">{customer?.email || customer?.mobile || ''}</div>
                    {(customer?.role === 'admin' || customer?.role === 'staff' || isAdminLoggedIn) && (
                      <div style={{ marginTop: '4px' }}>
                        <span className={`badge ${customer?.role === 'staff' ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: '0.7rem' }}>
                          {customer?.role === 'staff' ? 'Staff Member' : 'Administrator'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="syn-dropdown-body">
                    {(customer?.role === 'admin' || customer?.role === 'staff' || isAdminLoggedIn) && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate('/admin', { viewTransition: true });
                        }}
                        className="syn-dropdown-item"
                        style={{ color: 'var(--primary)', fontWeight: 600 }}
                      >
                        <ShieldAlert size={16} color="var(--primary)" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/booking', { viewTransition: true });
                      }}
                      className="syn-dropdown-item"
                    >
                      <CalendarCheck size={16} color="var(--primary)" />
                      <span>My Bookings</span>
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logoutCustomer();
                      }}
                      className="syn-dropdown-item syn-dropdown-item-danger"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              className="btn btn-secondary btn-sm syn-desktop-only"
              onClick={() => openAuthModal('login')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <User size={16} />
              <span>Sign In</span>
            </button>
          )}

          <Link to="/booking" viewTransition className="btn btn-primary btn-sm syn-reserve-cta">
            <Sparkles size={16} />
            <span>Instant Reserve</span>
          </Link>

          {/* Mobile menu trigger */}
          <button
            className="syn-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid var(--border-light)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <NavLink
            to="/"
            viewTransition
            onClick={handleNavClick}
            className={({ isActive }) => `syn-nav-link ${isActive ? 'active' : ''}`}
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/rooms"
            viewTransition
            onClick={handleNavClick}
            className={({ isActive }) => `syn-nav-link ${isActive ? 'active' : ''}`}
          >
            Rooms & Rates
          </NavLink>
          <NavLink
            to="/booking"
            viewTransition
            onClick={handleNavClick}
            className={({ isActive }) => `syn-nav-link ${isActive ? 'active' : ''}`}
          >
            Book Now
          </NavLink>
          <NavLink
            to="/reviews"
            viewTransition
            onClick={handleNavClick}
            className={({ isActive }) => `syn-nav-link ${isActive ? 'active' : ''}`}
          >
            Guest Reviews
          </NavLink>
          <NavLink
            to="/contact"
            viewTransition
            onClick={handleNavClick}
            className={({ isActive }) => `syn-nav-link ${isActive ? 'active' : ''}`}
          >
            Contact & Location
          </NavLink>

          <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {!isCustomerLoggedIn && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
              >
                <User size={16} /> Devotee Login / Register
              </button>
            )}
            <Link to="/booking" viewTransition onClick={handleNavClick} className="btn btn-primary">
              <Sparkles size={16} /> Reserve Room Online
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
