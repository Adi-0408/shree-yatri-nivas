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
  Car
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
            <Sparkles size={16} /> Sacred Pilgrimage Sanctuary • Pandharpur
          </div>
          <h1 className="hero-title">
            Divine Comfort & Peace at <span>Shree Yatri Nivas</span>
          </h1>
          <p className="hero-lead">
            Experience serene, hygienic, and affordable lodging just 400 meters from the Holy Temple. Enjoy 24/7 solar hot water, purified drinking water, and warm devotee hospitality.
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
            <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>Why Choose Shree Yatri Nivas</span>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--text-main)' }}>Your Peaceful Haven During Pilgrimage</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            <div className="highlight-card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
              <div className="highlight-icon" style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <MapPin size={24} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>400m from Temple</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Located right near the central temple gate and railway station for effortless darshan and hassle-free transit.
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

      {/* Pilgrimage Trust Banner */}
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
                We understand the spiritual importance of your pilgrimage. At Shree Yatri Nivas, we take pride in offering warm, honest, and reliable hospitality so you can focus entirely on prayer and serenity.
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
                  "Clean rooms, immediate hot water, and extremely respectful staff. Shree Yatri Nivas made our Pandharpur yatra comfortable and memorable."
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
