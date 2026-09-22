import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Star, Wind, Check, Eye, ArrowRight } from 'lucide-react';

export const RoomCard = ({ room, onOpenDetails }) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate(`/booking?roomId=${room.room_id}`, { viewTransition: true });
  };

  const defaultImg = "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80";
  const imageSrc = room.images && room.images.length > 0 ? room.images[0] : defaultImg;

  return (
    <article className="room-card">
      <div className="room-card-img-wrapper">
        <img
          src={imageSrc}
          alt={room.room_name}
          className="room-card-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultImg;
          }}
        />
        {room.badge && (
          <div className="room-card-badge">
            <span className="badge badge-gold">{room.badge}</span>
          </div>
        )}
        <div className="room-card-ac-tag" style={{
          backgroundColor: room.ac_status === 'AC' ? 'rgba(15, 58, 58, 0.9)' : 'rgba(51, 65, 85, 0.9)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          {room.ac_status === 'AC' ? `❄️ ${room.total_quantity || 1} AC Rooms` : `💨 ${room.total_quantity || 1} Non-AC Rooms`}
        </div>
      </div>

      <div className="room-card-body" style={{ padding: '1.25rem' }}>
        <h3 className="room-card-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          {room.room_name}
        </h3>
        
        {/* Soft Pill Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.85rem' }}>
          <span className={room.ac_status === 'AC' ? "badge-pill-accent" : "badge-pill-surface"}>
            {room.total_quantity || 1} {room.ac_status} Room{(room.total_quantity || 1) > 1 ? 's' : ''} Available
          </span>
          <span className="badge-pill-muted">Max {room.base_capacity || 2} Persons Base</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#B45309', fontWeight: 700, marginLeft: 'auto', fontSize: '0.82rem' }}>
            <Star size={14} fill="#D97706" color="#D97706" /> {room.rating || 4.8} ({room.reviews_count || 24})
          </span>
        </div>

        <p className="room-card-desc" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.85rem' }}>
          {room.description}
        </p>

        <div className="room-card-amenities" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
          {room.amenities && room.amenities.slice(0, 4).map((amenity, idx) => (
            <span key={idx} className="amenity-chip" style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
              <Check size={12} color="var(--success)" style={{ display: 'inline', marginRight: '3px' }} />
              {amenity}
            </span>
          ))}
          {room.amenities && room.amenities.length > 4 && (
            <span className="amenity-chip" style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-subtle)', color: 'var(--primary)', fontWeight: 600 }}>
              +{room.amenities.length - 4} more
            </span>
          )}
        </div>

        {/* Pricing Policy Note */}
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-subtle)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', lineHeight: '1.4' }}>
          • Extra person (adult or child &gt;4y): <strong>₹700/night</strong>. Children under 4 stay <strong>free</strong>.
        </div>

        <div className="room-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline' }}>
              ₹{(room.price || 0).toLocaleString('en-IN')}
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>/ night</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>standard 2 persons tariff</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onOpenDetails(room)}
              className="btn btn-secondary btn-sm"
              title="View full room details & amenities"
            >
              <Eye size={15} /> Details
            </button>
            <button
              onClick={handleBookNow}
              className="btn btn-primary btn-sm"
              title="Book this room instantly"
            >
              Book <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
