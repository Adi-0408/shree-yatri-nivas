import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PROPERTY_INFO } from '../services/seedData';
import { 
  X, 
  Users, 
  Star, 
  Check, 
  ShieldCheck, 
  Clock, 
  Info, 
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const RoomDetailsModal = ({ room, onClose }) => {
  const navigate = useNavigate();
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  if (!room) return null;

  const images = room.images && room.images.length > 0
    ? room.images
    : ["https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"];

  const handleBookNow = () => {
    onClose();
    navigate(`/booking?roomId=${room.room_id}`);
  };

  const nextImg = () => {
    setActiveImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImg = () => {
    setActiveImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span className="badge-pill-surface">{room.room_type}</span>
              <span className="badge-pill-accent">{room.ac_status}</span>
              {(room.total_quantity || room.total_rooms) && (
                <span className="badge-pill-muted">
                  {room.total_quantity || room.total_rooms} {room.ac_status} Rooms
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>{room.room_name}</h2>
          </div>
          <button onClick={onClose} style={{ padding: '0.4rem', color: 'var(--text-muted)', borderRadius: 'var(--radius-md)', transition: 'var(--transition-fast)' }} aria-label="Close modal">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Gallery Carousel */}
          <div style={{ position: 'relative', height: '300px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.5rem', backgroundColor: 'var(--bg-subtle)' }}>
            <img
              src={images[activeImgIndex]}
              alt={room.room_name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.5)',
                    color: '#FFF',
                    borderRadius: '50%',
                    padding: '8px',
                    display: 'flex'
                  }}
                  title="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImg}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.5)',
                    color: '#FFF',
                    borderRadius: '50%',
                    padding: '8px',
                    display: 'flex'
                  }}
                  title="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Quick Specifications */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem', backgroundColor: 'var(--bg-canvas)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Base Capacity</div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-main)', marginTop: '2px' }}>
                <Users size={15} color="var(--primary)" /> 2 Included
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Max Capacity</div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gold)', marginTop: '2px' }}>
                <Users size={15} color="var(--gold)" /> 4 Persons
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Standard Tariff</div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)', marginTop: '2px' }}>
                ₹{room.price.toLocaleString('en-IN')}<span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}> / night</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Extra Guest</div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '2px' }}>
                ₹700/night
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Overview & Ambience</h4>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{room.description}</p>
          </div>

          {/* Amenities Grid */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Included Amenities & Facilities</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
              {room.amenities && room.amenities.map((amenity, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={12} color="var(--success)" />
                  </div>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Policies Note */}
          <div style={{ backgroundColor: 'var(--gold-light)', border: '1px solid var(--gold-border)', borderRadius: 'var(--radius-md)', padding: '1rem', fontSize: '0.85rem', color: '#66420B' }}>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.25rem' }}>
              <ShieldCheck size={16} /> Important House & Stay Policies
            </div>
            <div>• Check-in: {PROPERTY_INFO.check_in_time} | Check-out: {PROPERTY_INFO.check_out_time}</div>
            <div>• {PROPERTY_INFO.policies.child_policy}</div>
            <div>• {PROPERTY_INFO.policies.payment_policy}</div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button onClick={handleBookNow} className="btn btn-primary">
            <span>Proceed to Book This Room</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
