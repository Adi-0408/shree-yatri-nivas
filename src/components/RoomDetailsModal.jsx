import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  useEffect(() => {
    if (!room) return;
    document.body.classList.add('modal-open');
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [room, onClose]);

  if (!room) return null;

  const defaultRoomPhotos = [
    "/images/rooms/room-wide.jpg",
    "/images/rooms/room-bed-1.jpg",
    "/images/rooms/room-tv-2.jpg",
    "/images/rooms/room-bathroom.jpg"
  ];

  const rawImages = room.images && room.images.length > 0 ? room.images : [];
  const validImages = rawImages.filter(img => typeof img === 'string' && !img.includes('unsplash.com'));
  const images = validImages.length > 0 ? validImages : defaultRoomPhotos;

  const handleBookNow = () => {
    onClose();
    navigate(`/booking?roomId=${room.room_id}`, { viewTransition: true });
  };

  const nextImg = () => {
    setActiveImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImg = () => {
    setActiveImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog room-details-dialog" onClick={(e) => e.stopPropagation()}>
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
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em', margin: 0 }}>
              {room.room_name}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              padding: '0.45rem', 
              color: 'var(--text-muted)', 
              borderRadius: 'var(--radius-md)', 
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition-fast)' 
            }} 
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body room-details-body">
          <div className="room-details-grid">
            {/* Left Column: Gallery, Thumbnails & Quick Specs */}
            <div className="room-details-left">
              {/* Gallery Carousel */}
              <div style={{ position: 'relative', height: '280px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '0.65rem', backgroundColor: 'var(--bg-subtle)' }}>
                <img
                  src={images[activeImgIndex]}
                  alt={`${room.room_name} - Photo ${activeImgIndex + 1}`}
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
                        background: 'rgba(0,0,0,0.55)',
                        color: '#FFF',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer'
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
                        background: 'rgba(0,0,0,0.55)',
                        color: '#FFF',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      title="Next image"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(0,0,0,0.65)',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '12px'
                    }}>
                      {activeImgIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${images.length}, 1fr)`, gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImgIndex(idx)}
                      style={{
                        height: '56px',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        border: activeImgIndex === idx ? '2px solid var(--primary)' : '2px solid transparent',
                        opacity: activeImgIndex === idx ? 1 : 0.65,
                        cursor: 'pointer',
                        padding: 0,
                        backgroundColor: 'var(--bg-subtle)',
                        transition: 'all 0.2s ease'
                      }}
                      title={`View photo ${idx + 1}`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Specifications */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', backgroundColor: 'var(--bg-canvas)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
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
                    ₹700 / night
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Description, Amenities & Rules */}
            <div className="room-details-right">
              {/* Description */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Overview &amp; Ambience</h4>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{room.description}</p>
              </div>

              {/* Amenities Grid */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.65rem', color: 'var(--text-main)' }}>Included Amenities &amp; Facilities</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.55rem' }}>
                  {room.amenities && room.amenities.map((amenity, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check size={12} color="var(--success)" />
                      </div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Policies Note */}
              <div style={{ backgroundColor: 'var(--gold-light)', border: '1px solid var(--gold-border)', borderRadius: 'var(--radius-md)', padding: '0.9rem', fontSize: '0.82rem', color: '#66420B' }}>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
                  <ShieldCheck size={16} /> Important House &amp; Stay Rules ({PROPERTY_INFO.name})
                </div>
                <div>• <strong>Timings:</strong> Check-in: {PROPERTY_INFO.check_in_time} | Check-out: {PROPERTY_INFO.check_out_time}</div>
                <div>• <strong>ID Policy:</strong> Local ID(s) Allowed • Govt. ID(s) Not Mandatory</div>
                <div>• <strong>Restrictions:</strong> Pets Not Allowed • Smoking Not Allowed • Visitors Not Allowed • Outside Food &amp; Beverages Not Allowed</div>
                <div>• <strong>Child Policy:</strong> Children aged 0 to 4 stay free • Children aged 5 to 17 are chargeable</div>
                <div>• <strong>Payment:</strong> Pay at Property / Payment at Check-in (Cash / UPI)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer room-details-footer">
          <div className="room-details-footer-tariff">
            <span className="tariff-label">Room Tariff</span>
            <span className="tariff-val">
              ₹{room.price.toLocaleString('en-IN')}<small> / night</small>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: 'auto' }}>
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
    </div>,
    document.body
  );
};
