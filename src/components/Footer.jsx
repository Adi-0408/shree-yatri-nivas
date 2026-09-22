import React from 'react';
import { Link } from 'react-router-dom';
import { PROPERTY_INFO } from '../services/seedData';
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  HeartHandshake,
  ExternalLink
} from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="syn-footer" role="contentinfo">
      <div className="syn-container">
        <div className="footer-grid">
          {/* Col 1: Brand & Tagline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="syn-brand-icon" style={{ width: '38px', height: '38px', fontSize: '1.1rem' }}>
                <Building size={20} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                SHREE YATRI NIVAS
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#B3AAA0', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Your sacred sanctuary in Pandharpur. Dedicated to providing pilgrims and traveling families with pristine cleanliness, authentic hospitality, modern amenities, and peace of mind.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                <ShieldCheck size={12} /> Verified Hygiene
              </span>
              <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                <HeartHandshake size={12} /> 24/7 Pilgrimage Care
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home Overview</Link></li>
              <li><Link to="/rooms">Rooms & Tariffs</Link></li>
              <li><Link to="/booking">Online Reservation</Link></li>
              <li><Link to="/reviews">Guest Testimonials</Link></li>
              <li><Link to="/contact">Directions & Contact</Link></li>
            </ul>
          </div>

          {/* Col 3: Pilgrimage Info */}
          <div>
            <h3 className="footer-title">Stay Policies</h3>
            <ul className="footer-links" style={{ fontSize: '0.85rem' }}>
              <li><strong>Check-in:</strong> {PROPERTY_INFO.check_in_time}</li>
              <li><strong>Check-out:</strong> {PROPERTY_INFO.check_out_time}</li>
              <li><strong>Kids under 4:</strong> Free of charge</li>
              <li><strong>Payment:</strong> Pay at property / UPI</li>
              <li><strong>Front Desk:</strong> 24 Hours Open</li>
              <li><strong>Temple Distance:</strong> 400m Walk</li>
            </ul>
          </div>

          {/* Col 4: Contact & Address */}
          <div>
            <h3 className="footer-title">Get in Touch</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <MapPin size={18} color="var(--gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{PROPERTY_INFO.address}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                <Phone size={18} color="var(--gold)" style={{ flexShrink: 0 }} />
                <a href={`tel:${PROPERTY_INFO.phone}`} style={{ color: '#FFFFFF', fontWeight: 600 }}>
                  {PROPERTY_INFO.phone}
                </a>
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                <Mail size={18} color="var(--gold)" style={{ flexShrink: 0 }} />
                <a href={`mailto:${PROPERTY_INFO.email}`}>
                  {PROPERTY_INFO.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} {PROPERTY_INFO.name}. All Rights Reserved. Devotee Hospitality Excellence.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/contact" style={{ color: '#9C948B' }}>Privacy & Terms</Link>
            <Link to="/contact" style={{ color: '#9C948B' }}>Help Desk</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
