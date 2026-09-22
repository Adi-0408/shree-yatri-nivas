import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Star, Wind, Check, Eye, ArrowRight } from 'lucide-react';

export const RoomCard = ({ room, onOpenDetails }) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate(`/booking?roomId=${room.room_id}`);
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
        <div className="room-card-ac-tag">
          {room.ac_status === 'AC' ? '❄️ AC' : '💨 Non-AC'}
        </div>
      </div>

      <div className="room-card-body">
        <h3 className="room-card-title">{room.room_name}</h3>
        
        <div className="room-card-meta" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <span className="badge badge-primary" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>
            Standard: 2 Persons
          </span>
          <span className="badge badge-gold" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>
            Max: 4 Persons
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#B87C2B', fontWeight: 700, marginLeft: 'auto', fontSize: '0.82rem' }}>
            <Star size={14} fill="#B87C2B" color="#B87C2B" /> {room.rating || 4.8} ({room.reviews_count || 24})
          </span>
        </div>

        <p className="room-card-desc">{room.description}</p>

        <div className="room-card-amenities">
          {room.amenities && room.amenities.slice(0, 4).map((amenity, idx) => (
            <span key={idx} className="amenity-chip">
              <Check size={12} color="var(--success)" style={{ display: 'inline', marginRight: '3px' }} />
              {amenity}
            </span>
          ))}
          {room.amenities && room.amenities.length > 4 && (
            <span className="amenity-chip" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              +{room.amenities.length - 4} more
            </span>
          )}
        </div>

        {/* Transparent Pricing Policy Note */}
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-primary)', padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
          • Extra adult/child above 4y: <strong>₹700/night</strong>. Children 4 &amp; under stay <strong>free</strong>.
        </div>

        <div className="room-card-footer">
          <div>
            <div className="room-price-val">₹{room.price.toLocaleString('en-IN')}</div>
            <div className="room-price-unit">per night (for up to 2 guests)</div>
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
