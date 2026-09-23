import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PROPERTY_INFO } from '../services/seedData';
import { 
  MapPin, 
  Navigation, 
  Building, 
  Plane, 
  Train, 
  Bus, 
  Clock, 
  PhoneCall, 
  Copy, 
  Check, 
  ExternalLink,
  CalendarCheck,
  Compass,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const Location = () => {
  const { showSuccess } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(PROPERTY_INFO.address);
    setCopied(true);
    showSuccess("Address copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  const keyLandmarks = [
    {
      name: "Mahalaxmi Temple",
      distance: "4 km",
      time: "10-12 mins",
      category: "Sacred Temple & Pilgrimage",
      icon: <Building size={26} />,
      bg: "#FEF3C7",
      color: "#B45309",
      badgeClass: "badge-gold",
      description: "Historic Shri Ambabai (Mahalaxmi) Temple, the spiritual epicenter of Kolhapur. Smooth direct transit for morning kakad aarti and evening darshan."
    },
    {
      name: "Airport",
      distance: "7 km",
      time: "15-20 mins",
      category: "Domestic Flights & Aviation",
      icon: <Plane size={26} />,
      bg: "#EFF6FF",
      color: "#1D4ED8",
      badgeClass: "badge-primary",
      description: "Kolhapur Airport (KLH - Chhatrapati Rajaram Maharaj Airport). Direct highway connectivity with seamless auto/taxi availability."
    },
    {
      name: "Railway Station",
      distance: "1 km",
      time: "3-5 mins",
      category: "Central Rail Terminus",
      icon: <Train size={26} />,
      bg: "#ECFDF5",
      color: "#047857",
      badgeClass: "badge-success",
      description: "Chhatrapati Shahu Maharaj Terminus (CSMT Kolhapur). Extremely close convenience for travelers arriving by express and passenger trains."
    },
    {
      name: "S.T. Stand",
      distance: "800 M",
      time: "2-3 mins",
      category: "Central Bus Stand (CBS)",
      icon: <Bus size={26} />,
      bg: "#FDF2F8",
      color: "#BE185D",
      badgeClass: "badge-gold",
      description: "Kolhapur Central Bus Stand (CBS / S.T. Stand). Under 2-3 minutes away for effortless state transport and private luxury sleeper bus arrivals."
    }
  ];

  const transitModes = [
    {
      title: "Arriving by Bus (S.T. Stand)",
      distance: "800 M",
      time: "2-3 mins",
      icon: <Bus size={20} color="#BE185D" />,
      detail: "From Kolhapur Central Bus Stand (CBS), head straight towards Tarabai Park via the Kolhapur-Rukadi-Sangli Highway. Autos are readily available 24/7."
    },
    {
      title: "Arriving by Train (Railway Station)",
      distance: "1 km",
      time: "3-5 mins",
      icon: <Train size={20} color="#047857" />,
      detail: "Exit Kolhapur Railway Station (CSMT) toward Station Road / Tarabai Park. Our hotel is positioned conveniently on the main highway."
    },
    {
      title: "Arriving by Air (Kolhapur Airport)",
      distance: "7 km",
      time: "15-20 mins",
      icon: <Plane size={20} color="#1D4ED8" />,
      detail: "Direct drive via Ujalaiwadi / Sangli Highway route straight into Tarabai Park without navigating congested city alleys."
    },
    {
      title: "Visiting Mahalaxmi Temple",
      distance: "4 km",
      time: "10-12 mins",
      icon: <Building size={20} color="#B45309" />,
      detail: "Direct transit via Bhausingji Road / Station Road leading straight into the temple complex with ample dedicated parking nearby."
    }
  ];

  return (
    <div className="syn-main-content">
      {/* Hero Header */}
      <section className="hero-section" style={{ padding: '3.5rem 0 3rem' }}>
        <div className="syn-container text-center">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#D4AF37' }}>
            <Link to="/" style={{ color: '#D4AF37', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <span style={{ color: '#FFFFFF' }}>Location</span>
          </div>
          <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
            Prime Location in Kolhapur
          </h1>
          <p className="hero-lead" style={{ maxWidth: '640px', margin: '0 auto', fontSize: '1rem', color: '#E8DED1' }}>
            Situated right on the Kolhapur-Rukadi-Sangli Highway in elite Tarabai Park, {PROPERTY_INFO.name} offers unbeatable closeness to major transit hubs and temples.
          </p>
        </div>
      </section>

      {/* Main Location Section */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#FDFBF7' }}>
        <div className="syn-container">
          
          {/* Section Header: Proximity Highlight */}
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Compass size={14} /> Strategic Accessibility
            </span>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              Close to All Main Places
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Spend less time in transit and more time visiting the sacred temple, attending business, or relaxing with your family.
            </p>
          </div>

          {/* 4 Prominent Key Landmark Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
            {keyLandmarks.map((item, idx) => (
              <div 
                key={idx}
                className="landmark-card"
                style={{
                  padding: '2rem 1.75rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: item.bg,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.icon}
                  </div>
                  <span className={`badge ${item.badgeClass}`} style={{ fontSize: '0.9rem', fontWeight: 800, padding: '5px 12px' }}>
                    {item.distance}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                  {item.category}
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  {item.name}
                </h3>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '1.25rem', flex: 1 }}>
                  {item.description}
                </p>

                <div style={{
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.82rem'
                }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} color="var(--primary)" /> Drive Time:
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Map & Address Container */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '4.5rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
              
              {/* Address details */}
              <div>
                <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>Physical Address</span>
                <h3 style={{ fontSize: '1.7rem', color: 'var(--text-main)', marginBottom: '0.75rem', fontWeight: 800 }}>
                  {PROPERTY_INFO.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem', color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
                  <MapPin size={22} color="var(--primary)" style={{ flexShrink: 0, marginTop: '4px' }} />
                  <span>{PROPERTY_INFO.address}</span>
                </div>

                <div style={{ backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', padding: '1.15rem 1.25rem', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                    Landmark Summary
                  </div>
                  <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    Mahalaxmi Temple: 4 km • Airport: 7 km • Railway Station: 1 km • S.T. Stand: 800 M
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={handleCopyAddress} 
                    className="btn btn-secondary"
                    style={{ flex: 1, minWidth: '160px' }}
                  >
                    {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                    <span>{copied ? "Copied!" : "Copy Address"}</span>
                  </button>
                  <a 
                    href={PROPERTY_INFO.google_maps_direct_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-primary"
                    style={{ flex: 1, minWidth: '160px' }}
                  >
                    <ExternalLink size={16} />
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>

              {/* Embedded Google Map */}
              <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '340px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <iframe
                  title="HOTEL VIHANN INN Map"
                  src={PROPERTY_INFO.google_maps_url}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

            </div>
          </div>

          {/* Transit Directions Breakdown */}
          <div style={{ marginBottom: '4.5rem' }}>
            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
              <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>Transit Guide</span>
              <h2 style={{ fontSize: '1.9rem', color: 'var(--text-main)' }}>How to Reach Us</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                Smooth routes whether you arrive by state transport bus, express train, domestic flight, or private automobile.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {transitModes.map((mode, idx) => (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {mode.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{mode.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>{mode.distance} • ~{mode.time}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {mode.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #8E3200 0%, #6E2600 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 2.5rem',
            color: '#FFFFFF',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h2 style={{ fontSize: '2rem', color: '#FFFFFF', marginBottom: '0.75rem' }}>
              Plan Your Kolhapur Stay with Us
            </h2>
            <p style={{ fontSize: '1rem', color: '#F8D8A0', maxWidth: '620px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
              Stay close to Mahalaxmi Temple (4 km), Airport (7 km), Railway Station (1 km), and S.T. Stand (800 M). Zero online advance deposit required.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/booking" className="btn btn-gold btn-lg">
                <CalendarCheck size={18} />
                <span>Book Now (Pay at Property)</span>
              </Link>
              <Link to="/rooms" className="btn btn-secondary btn-lg" style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)', color: '#FFFFFF' }}>
                <span>Explore Rooms &amp; Rates</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};
