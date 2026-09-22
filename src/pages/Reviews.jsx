import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { useToast } from '../context/ToastContext';
import { 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  User, 
  MapPin, 
  BedDouble, 
  Send 
} from 'lucide-react';

export const Reviews = () => {
  const { showSuccess, showError } = useToast();
  const [reviews, setReviews] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Form State
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [roomType, setRoomType] = useState('Deluxe AC Family Suite');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    StorageService.init();
    setReviews(StorageService.getReviews());
    setRooms(StorageService.getRooms());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      showError('Please provide your name and review feedback.');
      return;
    }

    StorageService.addReview({
      guest_name: name.trim(),
      city: city.trim() || 'Pandharpur Devotee',
      room_type: roomType,
      rating: parseFloat(rating),
      comment: comment.trim()
    });

    showSuccess('Thank you for your review! It has been submitted for verification and will appear shortly.');
    setName('');
    setCity('');
    setComment('');
    setRating(5);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 5), 0) / reviews.length).toFixed(1)
    : '4.9';

  return (
    <div className="syn-main-content">
      {/* Header Banner */}
      <section style={{ backgroundColor: 'var(--bg-dark)', color: '#FFFFFF', padding: '3.5rem 0' }}>
        <div className="syn-container" style={{ textAlign: 'center' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>
            Guest Testimonials
          </span>
          <h1 style={{ fontSize: '2.5rem', color: '#FFFFFF', marginBottom: '0.75rem' }}>
            Devotee Experiences & Reviews
          </h1>
          <p style={{ color: '#D6CEC5', maxWidth: '640px', margin: '0 auto', fontSize: '1.05rem' }}>
            Read real feedback from pilgrims and visiting families who chose Shree Yatri Nivas during their sacred Pandharpur pilgrimage.
          </p>
        </div>
      </section>

      {/* Main Review Content */}
      <section style={{ padding: '3.5rem 0', backgroundColor: 'var(--bg-primary)' }}>
        <div className="syn-container">
          
          {/* Top Rating Summary Bar */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', marginBottom: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{avgRating}</div>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0', color: '#C58940' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="#C58940" color="#C58940" />
                ))}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Overall Guest Rating ({reviews.length} Reviews)</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Cleanliness & Hygiene</span>
                <strong>4.9 / 5.0</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Temple Proximity</span>
                <strong>5.0 / 5.0</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Staff & Hospitality</span>
                <strong>4.8 / 5.0</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Value for Money</span>
                <strong>4.9 / 5.0</strong>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--gold-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <ShieldCheck size={24} color="var(--gold)" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>100% Genuine Devotees</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Moderated to prevent spam & false reviews</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '3rem' }}>
            
            {/* Left Column: Reviews List */}
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                Recent Devotee Feedback
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {reviews.map((rev) => (
                  <div key={rev.id} className="review-card" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xs)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{rev.guest_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {rev.city} • Stayed in {rev.room_type}
                        </div>
                      </div>
                      <div style={{ display: 'flex', color: '#C58940' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} fill={i < Math.floor(rev.rating) ? '#C58940' : 'none'} color="#C58940" />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '0.75rem' }}>
                      "{rev.comment}"
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Date: {rev.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Write a Review Form */}
            <div>
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border-gold)', boxShadow: 'var(--shadow-md)', position: 'sticky', top: '100px' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={18} color="var(--primary)" /> Share Your Stay Experience
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Your feedback helps fellow visiting pilgrims choose comfortable lodging.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div className="form-group">
                    <label className="form-label">
                      <User size={15} color="var(--primary)" /> Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dnyaneshwar Jadhav"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <MapPin size={15} color="var(--primary)" /> Your City / Hometown
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pune / Kolhapur"
                      className="form-control"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <BedDouble size={15} color="var(--primary)" /> Room Type Stayed In
                    </label>
                    <select
                      className="form-control"
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                    >
                      {rooms.length > 0 ? (
                        rooms.map(r => <option key={r.room_id} value={r.room_name}>{r.room_name}</option>)
                      ) : (
                        <option value="Deluxe AC Family Suite">Deluxe AC Family Suite</option>
                      )}
                    </select>
                  </div>

                  {/* Interactive Star Rating */}
                  <div className="form-group">
                    <label className="form-label">
                      Rating: {rating} Star{rating > 1 ? 's' : ''}
                    </label>
                    <div style={{ display: 'flex', gap: '6px', cursor: 'pointer' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          className="star-btn"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          style={{ padding: '4px' }}
                          title={`${star} Star`}
                        >
                          <Star
                            size={26}
                            fill={(hoverRating || rating) >= star ? '#C58940' : 'none'}
                            color="#C58940"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Your Comments & Experience *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Tell us about cleanliness, hot water, staff behavior, temple distance..."
                      className="form-control"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    <Send size={16} /> Submit Devotee Review
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
