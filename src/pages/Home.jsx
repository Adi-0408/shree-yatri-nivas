import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { PROPERTY_INFO } from '../services/seedData';
import { RoomCard } from '../components/RoomCard';
import { RoomDetailsModal } from '../components/RoomDetailsModal';
import { CustomSelect } from '../components/CustomSelect';
import { 
  Building, 
  Calendar, 
  Users, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Droplet, 
  Wifi, 
  Clock, 
  MapPin, 
  Star, 
  ArrowRight,
  ChevronRight,
  Flame,
  Car,
  Plane,
  Train,
  Bus,
  Navigation,
  FileText,
  Check
} from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [reviews, setReviews] = useState([]);

  // Search widget state
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [guests, setGuests] = useState('2');
  const [acPref, setAcPref] = useState('all');

  useEffect(() => {
    StorageService.init();
    setRooms(StorageService.getRooms());
    setReviews(StorageService.getReviews().slice(0, 3));

    const handleSync = () => {
      setRooms(StorageService.getRooms());
    };
    window.addEventListener('syn_pricing_updated', handleSync);
    return () => window.removeEventListener('syn_pricing_updated', handleSync);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&ac=${acPref}`, { viewTransition: true });
  };

  return (
    <div className="syn-main-content">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pattern" />
        <div className="syn-container hero-content">
          <div className="hero-subtitle-tag">
            <Sparkles size={16} /> Premium Comfort & Hospitality • Tarabai Park, Kolhapur
          </div>
          <h1 className="hero-title">
            Divine Comfort & Peace at <span>HOTEL VIHANN INN</span>
          </h1>
          <p className="hero-lead">
            Experience serene, comfortable, and affordable lodging in Tarabai Park, Kolhapur. Just 4 km from Mahalaxmi Temple, 1 km from Railway Station, and 800m from S.T. Stand.
          </p>

          {/* Quick Search Widget */}
          <div className="search-widget-card">
            <form onSubmit={handleSearchSubmit} className="search-form-grid">
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={15} color="var(--primary)" /> Check-in Date
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  className="form-control"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={15} color="var(--primary)" /> Check-out Date
                </label>
                <input
                  type="date"
                  required
                  min={checkIn || todayStr}
                  className="form-control"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Users size={15} color="var(--primary)" /> Guests / Devotees
                </label>
                <CustomSelect
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  options={[
                    { value: '1', label: '1 Person' },
                    { value: '2', label: '2 Persons' },
                    { value: '3', label: '3 Persons' },
                    { value: '4', label: '4 Persons (Family)' },
                    { value: '5', label: '5+ Persons (Group)' }
                  ]}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Flame size={15} color="var(--primary)" /> Room Category
                </label>
                <CustomSelect
                  value={acPref}
                  onChange={(e) => setAcPref(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Categories (AC & Non-AC)' },
                    { value: 'AC', label: 'AC Rooms & Suites' },
                    { value: 'Non-AC', label: 'Non-AC Budget Friendly' }
                  ]}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ height: '46px' }}>
                <Search size={18} />
                <span>Search Rooms</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Value Pillars / Highlights */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-light)' }}>
        <div className="syn-container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>Why Choose HOTEL VIHANN INN</span>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--text-main)' }}>Your Peaceful Haven in Kolhapur</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            <div className="highlight-card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
              <div className="highlight-icon" style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <MapPin size={24} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Prime Tarabai Park</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Located on Kolhapur-Rukadi-Sangli Hwy, just 4 km from Mahalaxmi Temple, 1 km from Railway Station & 800m from S.T. Stand.
              </p>
            </div>

            <div className="highlight-card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
              <div className="highlight-icon" style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Droplet size={24} color="var(--gold)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>24/7 Hot Water & RO</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Round-the-clock solar & electric geysers along with pure filtered RO drinking water on every floor.
              </p>
            </div>

            <div className="highlight-card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
              <div className="highlight-icon" style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <ShieldCheck size={24} color="var(--info)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Spotless Hygiene</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Fresh sanitized linens, squeaky-clean bathrooms, daily housekeeping, and peaceful temple-facing environment.
              </p>
            </div>

            <div className="highlight-card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
              <div className="highlight-icon" style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Car size={24} color="var(--success)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Safe Parking & Wi-Fi</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Spacious CCTV-monitored vehicle parking, ultra high-speed Wi-Fi, and 24-hour reception desk support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-primary)' }}>
        <div className="syn-container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>Curated Accommodations</span>
              <h2 style={{ fontSize: '2.2rem', color: 'var(--text-main)' }}>Featured Rooms & Suites</h2>
            </div>
            <Link to="/rooms" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span>View All Rooms</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {rooms.slice(0, 3).map((room) => (
              <RoomCard
                key={room.room_id}
                room={room}
                onOpenDetails={setSelectedRoom}
                searchDates={{ checkIn, checkOut, guests }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Prime Location & Nearby Key Places Section */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-light)' }}>
        <div className="syn-container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Navigation size={14} /> Prime Central Location
            </span>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              Proximity to Key Destinations
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.6 }}>
              HOTEL VIHANN INN is conveniently located on <strong>Kolhapur-Rukadi-Sangli Hwy, Tarabai Park</strong>, with effortless, quick connectivity to Kolhapur’s principal temple, flight, rail, and bus terminals.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {/* 1. Mahalaxmi Temple */}
            <div className="landmark-card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={24} />
                </div>
                <span className="badge badge-gold" style={{ fontSize: '0.85rem', fontWeight: 800, padding: '4px 10px' }}>
                  4 km
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Mahalaxmi Temple
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem', flex: 1 }}>
                World-renowned historic Shri Ambabai / Mahalaxmi Temple. Swift drive (~10-12 mins) for peaceful morning and evening darshan.
              </p>
              <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} /> Sacred Temple • 4 km
              </div>
            </div>

            {/* 2. Airport */}
            <div className="landmark-card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: '#EFF6FF', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plane size={24} />
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.85rem', fontWeight: 800, padding: '4px 10px', backgroundColor: '#DBEAFE', color: '#1E40AF', borderColor: '#BFDBFE' }}>
                  7 km
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Airport
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem', flex: 1 }}>
                Kolhapur Airport (KLH - Chhatrapati Rajaram Maharaj Airport). Direct highway transit (~15-20 mins).
              </p>
              <div style={{ fontSize: '0.78rem', color: '#1D4ED8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} /> Domestic Airport • 7 km
              </div>
            </div>

            {/* 3. Railway Station */}
            <div className="landmark-card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: '#ECFDF5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Train size={24} />
                </div>
                <span className="badge badge-success" style={{ fontSize: '0.85rem', fontWeight: 800, padding: '4px 10px' }}>
                  1 km
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Railway Station
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem', flex: 1 }}>
                Chhatrapati Shahu Maharaj Terminus (Kolhapur Central Railway Station). Quick 3-5 minute drive or easy commute.
              </p>
              <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} /> Main Train Station • 1 km
              </div>
            </div>

            {/* 4. S.T. Stand */}
            <div className="landmark-card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: '#FDF2F8', color: '#BE185D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bus size={24} />
                </div>
                <span className="badge badge-gold" style={{ fontSize: '0.85rem', fontWeight: 800, padding: '4px 10px', backgroundColor: '#FCE7F3', color: '#9D174D', borderColor: '#FBCFE8' }}>
                  800 M
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                S.T. Stand
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem', flex: 1 }}>
                Kolhapur Central Bus Stand (CBS / S.T. Stand). Under 2-3 minutes away for effortless intercity bus transit.
              </p>
              <div style={{ fontSize: '0.78rem', color: '#BE185D', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} /> Central Bus Terminal • 800 M
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Rules Section (Matching User Specification) */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#FDFBF7', borderTop: '1px solid var(--border-light)' }}>
        <div className="syn-container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} /> House Guidelines
            </span>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Property Rule
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Important house policies and stay regulations for all guests staying at HOTEL VIHANN INN.
            </p>
          </div>

          {/* Centered Rule Card - Styled authentic to user request */}
          <div style={{ maxWidth: '580px', margin: '0 auto' }}>
            <div style={{
              backgroundColor: '#F7EDC7',
              borderRadius: '16px',
              padding: '2rem 2.25rem',
              border: '2.5px solid #C49BDF',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                {[
                  "Check In Time 3:00 pm",
                  "Check Out Time 10:00 am",
                  "Pets Are Not Allowed",
                  "Smoking Not Allowed",
                  "Govt. Id(s) Not Mandatory",
                  "Local Id(s) Allowed",
                  "Visitors Are Not Allowed",
                  "Outside Food And Beverage Not Allowed",
                  "Children Aged 0 to 4 Years Stay Free Of Charge",
                  "Children Aged 5 to 17 Years are Chargeable"
                ].map((ruleText, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#6E1B00',
                    lineHeight: 1.35
                  }}>
                    <span style={{ fontSize: '1.25rem', color: '#6E1B00', fontWeight: 900 }}>✔</span>
                    <span>{ruleText}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hospitality Trust Banner */}
      <section style={{ padding: '4.5rem 0', background: 'linear-gradient(135deg, #8E3200 0%, #6E2600 100%)', color: '#FFFFFF' }}>
        <div className="syn-container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '3rem', alignItems: 'center' }}>
            <div>
              <span className="badge badge-gold" style={{ marginBottom: '1rem', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                Guaranteed Satisfaction
              </span>
              <h2 style={{ fontSize: '2.4rem', color: '#FFFFFF', marginBottom: '1rem' }}>
                Peace of Mind for You and Your Family
              </h2>
              <p style={{ fontSize: '1.05rem', color: '#F8D8A0', lineHeight: 1.6, marginBottom: '2rem' }}>
                We understand the importance of your visit to Kolhapur. At HOTEL VIHANN INN, we take pride in offering warm, honest, and reliable hospitality so you can focus entirely on comfort and relaxation.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/booking" className="btn btn-gold btn-lg">
                  <span>Reserve Your Room Now</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/contact" className="btn btn-white btn-lg" style={{ color: 'var(--primary)' }}>
                  <span>Contact Front Desk</span>
                </Link>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-xl)', padding: '2rem', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F8D8A0' }}>4.8★</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>Average Devotee Rating</div>
                    <div style={{ fontSize: '0.85rem', color: '#E8D5B5' }}>Over 200+ Verified Guest Stays</div>
                  </div>
                </div>
                <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.15)' }} />
                <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#FFFFFF', fontStyle: 'italic' }}>
                  "Clean rooms, immediate hot water, and extremely respectful staff. HOTEL VIHANN INN made our Kolhapur visit comfortable and memorable."
                </div>
                <div style={{ fontSize: '0.8rem', color: '#F8D8A0', fontWeight: 600 }}>— Rajesh Kulkarni, Pune</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guest Reviews Section */}
      <section style={{ padding: '5rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="syn-container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>Devotee Feedback</span>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--text-main)' }}>What Our Guests Say</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            {reviews.map((rev) => (
              <div key={rev.id} style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{rev.guest_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rev.city} • {rev.room_type}</div>
                  </div>
                  <div style={{ display: 'flex', color: '#C58940' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} fill={i < Math.floor(rev.rating) ? '#C58940' : 'none'} color="#C58940" />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic', flex: 1 }}>
                  "{rev.comment}"
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                  Stayed: {rev.date}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/reviews" className="btn btn-outline-gold">
              <span>Read More Reviews & Submit Yours</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Details Modal */}
      {selectedRoom && (
        <RoomDetailsModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
      )}
    </div>
  );
};
