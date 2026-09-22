import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { PROPERTY_INFO } from '../services/seedData';
import { useToast } from '../context/ToastContext';
import { 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  Send, 
  HelpCircle, 
  CheckCircle2, 
  ShieldAlert,
  Car,
  ChevronDown
} from 'lucide-react';
import { CustomSelect } from '../components/CustomSelect';

export const Contact = () => {
  const { showSuccess, showError } = useToast();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [subject, setSubject] = useState('General Stay Inquiry');
  const [message, setMessage] = useState('');

  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim() || !message.trim()) {
      showError('Please fill in your name, mobile, and inquiry message.');
      return;
    }
    StorageService.saveContactMessage({
      name: name.trim(),
      mobile: mobile.trim(),
      message: message.trim(),
      roomType: subject
    });
    showSuccess('Thank you for contacting us! Front desk staff will respond to your inquiry shortly.');
    setName('');
    setMobile('');
    setMessage('');
  };

  const faqs = [
    {
      q: "How close is Shree Yatri Nivas to the main Vitthal-Rukmini Temple?",
      a: "Shree Yatri Nivas is conveniently located just 400 meters (a comfortable 5-7 minute walking distance) from the central temple gate and darshan line entry."
    },
    {
      q: "What are your check-in and check-out timings?",
      a: "Standard Check-in is at 12:00 PM and Check-out is at 11:00 AM. Early check-in or late luggage storage can be accommodated based on room readiness upon arrival."
    },
    {
      q: "Is hot water available for early morning holy bath?",
      a: "Yes! We provide 24/7 round-the-clock solar and electric geyser hot water in all rooms for early morning snan and temple visits."
    },
    {
      q: "Is vehicle parking available at the property?",
      a: "Yes, we have dedicated, secure CCTV-monitored vehicle parking for devotees traveling by private car, tempo, or bus."
    },
    {
      q: "What is your cancellation and booking policy?",
      a: "Reservations are confirmed with zero advance payment ('Pay at Property'). Please notify our desk at least 24 hours prior if your travel plans change."
    }
  ];

  return (
    <div className="syn-main-content">
      {/* Header Banner */}
      <section style={{ backgroundColor: 'var(--bg-dark)', color: '#FFFFFF', padding: '3.5rem 0' }}>
        <div className="syn-container" style={{ textAlign: 'center' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>
            Directions & Front Desk
          </span>
          <h1 style={{ fontSize: '2.5rem', color: '#FFFFFF', marginBottom: '0.75rem' }}>
            Contact Shree Yatri Nivas
          </h1>
          <p style={{ color: '#D6CEC5', maxWidth: '640px', margin: '0 auto', fontSize: '1.05rem' }}>
            Have questions about room availability, pilgrimage guidance, or directions? Our 24/7 reception desk is always ready to assist you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: '3.5rem 0', backgroundColor: 'var(--bg-primary)' }}>
        <div className="syn-container">
          
          {/* Quick Contact Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Phone size={22} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Direct Front Desk</h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>24 Hours Open for Devotees</div>
              <a href={`tel:${PROPERTY_INFO.phone}`} style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.05rem' }}>
                {PROPERTY_INFO.phone}
              </a>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{PROPERTY_INFO.alt_phone}</div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <MessageCircle size={22} color="var(--success)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>WhatsApp Concierge</h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Instant Chat & Directions</div>
              <a
                href={`https://wa.me/${PROPERTY_INFO.whatsapp}?text=${encodeURIComponent('Namaste Shree Yatri Nivas! I would like to inquire about lodging.')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.05rem' }}
              >
                Chat on WhatsApp →
              </a>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Mail size={22} color="var(--info)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Email Inquiries</h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Group Booking & Invoices</div>
              <a href={`mailto:${PROPERTY_INFO.email}`} style={{ color: 'var(--info)', fontWeight: 700, fontSize: '1.05rem' }}>
                {PROPERTY_INFO.email}
              </a>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Clock size={22} color="var(--gold)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Stay Schedule</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div><strong>Check-in:</strong> {PROPERTY_INFO.check_in_time}</div>
                <div><strong>Check-out:</strong> {PROPERTY_INFO.check_out_time}</div>
                <div><strong>Reception:</strong> 24/7 Available</div>
              </div>
            </div>
          </div>

          {/* Form & Map Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem', marginBottom: '4rem' }}>
            {/* Inquiry Form */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '2.25rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Send Us a Message</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Planning a family group yatra or have special requirements? Leave your details below.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile"
                      className="form-control"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject / Purpose</label>
                  <CustomSelect
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    <option value="General Stay Inquiry">General Stay Inquiry</option>
                    <option value="Large Group / Bus Booking (10+ people)">Large Group / Bus Booking (10+ people)</option>
                    <option value="Temple Darshan & Route Guidance">Temple Darshan & Route Guidance</option>
                    <option value="Feedback & Suggestions">Feedback & Suggestions</option>
                  </CustomSelect>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can our front desk assist you?"
                    className="form-control"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Send size={16} /> Send Inquiry
                </button>
              </form>
            </div>

            {/* Map & Address Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={18} color="var(--primary)" /> Physical Address
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {PROPERTY_INFO.address}
                </p>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Landmarks: 400m from Central Temple Gate • 1 km from Pandharpur Railway Station • 800m from ST Bus Stand.
                </div>
              </div>

              {/* Embedded Map */}
              <div style={{ flex: 1, minHeight: '260px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                <iframe
                  title="Shree Yatri Nivas Location Map"
                  src={PROPERTY_INFO.google_maps_url}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '260px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>Help & Guidance</span>
              <h2 style={{ fontSize: '2rem', color: 'var(--text-main)' }}>Frequently Asked Questions</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: 'var(--text-main)'
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      style={{
                        transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}
                    />
                  </button>

                  {openFaq === idx && (
                    <div style={{ padding: '0 1.25rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};
