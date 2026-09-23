import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="syn-main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '3rem 1.5rem', textAlign: 'center' }}>
      <div style={{ maxWidth: '520px' }}>
        <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Building size={36} color="var(--primary)" />
        </div>
        <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1, marginBottom: '0.5rem' }}>
          404
        </div>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
          Page Not Found
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          The page you are seeking might have been moved or does not exist. Let's guide you back to HOTEL VIHANN INN.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={16} /> Return to Home
          </Link>
          <Link to="/rooms" className="btn btn-secondary">
            View Available Rooms
          </Link>
        </div>
      </div>
    </div>
  );
};
