import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { AuthModal } from './components/AuthModal';
import { ScrollToTop } from './components/ScrollToTop';
import { PageTransition } from './components/PageTransition';

import { Home } from './pages/Home';
import { Rooms } from './pages/Rooms';
import { Booking } from './pages/Booking';
import { Reviews } from './pages/Reviews';
import { Rules } from './pages/Rules';
import { Location } from './pages/Location';
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';
import { NotFound } from './pages/NotFound';

export const App = () => {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <PageTransition>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms.html" element={<Rooms />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/booking.html" element={<Booking />} />
          <Route path="/location" element={<Location />} />
          <Route path="/location.html" element={<Location />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/rules.html" element={<Rules />} />
          <Route path="/policies" element={<Rules />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/reviews.html" element={<Reviews />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/contact.html" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/pricing" element={<Admin initialTab="pricing" />} />
          <Route path="/admin/:tab" element={<Admin />} />
          <Route path="/admin.html" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
      <Footer />
      <FloatingWhatsApp />
      <AuthModal />
    </>
  );
};
