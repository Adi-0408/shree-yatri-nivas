import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const PageTransition = ({ children }) => {
  const location = useLocation();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    // Show top progress shimmer on route travel
    setNavigating(true);

    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    const timer = setTimeout(() => {
      setNavigating(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {navigating && <div className="syn-route-progress" aria-hidden="true" />}
      <div key={location.pathname} className="syn-page-transition">
        {children}
      </div>
    </>
  );
};
