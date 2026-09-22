import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { PROPERTY_INFO } from '../services/seedData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Calendar, 
  Users, 
  BedDouble, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Printer, 
  Share2, 
  MessageCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Info,
  ShieldCheck,
  Phone,
  Mail,
  User,
  Search
} from 'lucide-react';

export const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { customer, isCustomerLoggedIn, openAuthModal } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const [step, setStep] = useState(1);
  const [rooms, setRooms] = useState([]);
  
  // Form State - Step 1
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [selectedRoomId, setSelectedRoomId] = useState(searchParams.get('roomId') || 'SYN-RM-101');
  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [roomQty, setRoomQty] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Form State - Step 2 (Guest Details)
  const [guestName, setGuestName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Confirmed booking state - Step 3
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Lookup existing booking tab
  const [lookupRef, setLookupRef] = useState('');
  const [lookedUpBooking, setLookedUpBooking] = useState(null);
  const [lookupError, setLookupError] = useState('');

  useEffect(() => {
    StorageService.init();
    const loadedRooms = StorageService.getRooms();
    setRooms(loadedRooms);
    
    // Check if valid roomId passed in URL
    const urlRoomId = searchParams.get('roomId');
    if (urlRoomId && loadedRooms.some(r => r.room_id === urlRoomId)) {
      setSelectedRoomId(urlRoomId);
    } else if (loadedRooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(loadedRooms[0].room_id);
    }
  }, [searchParams]);

  // Autofill customer data if logged in
  useEffect(() => {
    if (customer) {
      setGuestName((prev) => prev || customer.name || '');
      setEmail((prev) => prev || customer.email || '');
      setMobile((prev) => prev || customer.mobile || '');
      setCity((prev) => prev || customer.city || '');
    }
  }, [customer]);

  // Selected room object
  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.room_id === selectedRoomId) || rooms[0] || null;
  }, [rooms, selectedRoomId]);

  // Calculate nights
  const numberOfNights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkIn, checkOut]);

  // Calculate pricing
  const totalAmount = useMemo(() => {
    if (!selectedRoom) return 0;
    return selectedRoom.price * roomQty * numberOfNights;
  }, [selectedRoom, roomQty, numberOfNights]);

  // Overlap availability check
  const availability = useMemo(() => {
    if (!selectedRoomId || !checkIn || !checkOut) return { available: true, remainingQty: 1 };
    return StorageService.checkRoomAvailability(selectedRoomId, checkIn, checkOut, roomQty);
  }, [selectedRoomId, checkIn, checkOut, roomQty]);

  // Step 1 -> Step 2 validation
  const handleProceedToStep2 = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      showError('Please select valid check-in and check-out dates.');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      showError('Check-out date must be after check-in date.');
      return;
    }
    if (!availability.available) {
      showError(`Only ${availability.remainingQty} room(s) available for selected dates. Please adjust.`);
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 -> Step 3 (Create Booking)
  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!guestName.trim() || !mobile.trim()) {
      showError('Please enter full guest name and a valid mobile number.');
      return;
    }
    if (!agreeTerms) {
      showWarning('Please agree to the stay and payment terms.');
      return;
    }

    try {
      const bookingPayload = {
        guest_name: guestName.trim(),
        mobile: mobile.trim(),
        email: email.trim() || `${mobile.trim()}@guest.shreeyatrinivas.com`,
        city: city.trim() || 'Pandharpur Devotee',
        check_in: checkIn,
        check_out: checkOut,
        adults: parseInt(adults, 10),
        children: parseInt(children, 10),
        room_id: selectedRoom.room_id,
        room_name: selectedRoom.room_name,
        room_type: selectedRoom.room_type,
        room_quantity: parseInt(roomQty, 10),
        room_rate: selectedRoom.price,
        number_of_nights: numberOfNights,
        total_amount: totalAmount,
        payment_method: 'Pay at Property',
        payment_status: 'Pending',
        special_requests: specialRequests.trim() || 'None'
      };

      const created = StorageService.createBooking(bookingPayload);
      setConfirmedBooking(created);
      setStep(3);
      showSuccess(`Booking Confirmed! Reference: ${created.booking_reference}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      showError(err.message || 'Could not complete booking.');
    }
  };

  const handlePrintVoucher = () => {
    window.print();
  };

  const handleWhatsAppShare = (b) => {
    const text = `*SHREE YATRI NIVAS - Booking Voucher*\n\n` +
      `*Reference:* ${b.booking_reference}\n` +
      `*Guest Name:* ${b.guest_name}\n` +
      `*Room:* ${b.room_name} (${b.room_quantity} Room)\n` +
      `*Check-in:* ${b.check_in} (12:00 PM)\n` +
      `*Check-out:* ${b.check_out} (11:00 AM)\n` +
      `*Total Nights:* ${b.number_of_nights}\n` +
      `*Total Payable:* ₹${b.total_amount.toLocaleString('en-IN')} (Pay at Property)\n\n` +
      `*Property Address:* ${PROPERTY_INFO.address}\n` +
      `*Help Desk:* ${PROPERTY_INFO.phone}`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleLookupBooking = (e) => {
    e.preventDefault();
    setLookupError('');
    setLookedUpBooking(null);
    const clean = lookupRef.trim();
    if (!clean) return;

    const b = StorageService.getBookingById(clean);
    if (b) {
      setLookedUpBooking(b);
      showSuccess('Booking record found!');
    } else {
      // Also try search by mobile
      const allBookings = StorageService.getBookings();
      const match = allBookings.find(item => item.mobile && item.mobile.replace(/\D/g, '').includes(clean.replace(/\D/g, '')));
      if (match) {
        setLookedUpBooking(match);
        showSuccess('Booking record found by mobile number!');
      } else {
        setLookupError('No booking found with this Reference ID or Mobile Number.');
        showError('Booking not found.');
      }
    }
  };

  return (
    <div className="syn-main-content">
      {/* Header Banner */}
      <section className="no-print" style={{ backgroundColor: 'var(--bg-dark)', color: '#FFFFFF', padding: '3rem 0' }}>
        <div className="syn-container" style={{ textAlign: 'center' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            Instant Reservation
          </span>
          <h1 style={{ fontSize: '2.4rem', color: '#FFFFFF', marginBottom: '0.5rem' }}>
            Book Your Devotee Stay Online
          </h1>
          <p style={{ color: '#D6CEC5', maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
            Zero booking fees. Pay at the property upon arrival with full flexibility and guaranteed check-in.
          </p>
        </div>
      </section>

      {/* Main Booking Container */}
      <section style={{ padding: '3rem 0', backgroundColor: 'var(--bg-primary)' }}>
        <div className="syn-container syn-container-sm">
          
          {/* Wizard Progress Steps (Hidden on print) */}
          <div className="booking-wizard-nav no-print">
            <div className={`booking-wizard-step ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
              <div className="wizard-circle">{step > 1 ? <CheckCircle2 size={20} /> : '1'}</div>
              <span className="wizard-label">1. Room & Dates</span>
            </div>

            <div style={{ flex: 1, height: '2px', backgroundColor: step > 1 ? 'var(--primary)' : 'var(--border-light)', margin: '0 10px', marginTop: '-20px' }} />

            <div className={`booking-wizard-step ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
              <div className="wizard-circle">{step > 2 ? <CheckCircle2 size={20} /> : '2'}</div>
              <span className="wizard-label">2. Guest Details</span>
            </div>

            <div style={{ flex: 1, height: '2px', backgroundColor: step > 2 ? 'var(--primary)' : 'var(--border-light)', margin: '0 10px', marginTop: '-20px' }} />

            <div className={`booking-wizard-step ${step === 3 ? 'active' : ''}`}>
              <div className="wizard-circle">3</div>
              <span className="wizard-label">3. Confirmation</span>
            </div>
          </div>

          {/* STEP 1: Room & Date Selection */}
          {step === 1 && (
            <div className="search-widget-card no-print">
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                Select Room Category & Stay Dates
              </h2>

              <form onSubmit={handleProceedToStep2}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  
                  {/* Room Selection */}
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">
                      <BedDouble size={15} color="var(--primary)" /> Choose Accommodation Category
                    </label>
                    <select
                      className="form-control"
                      value={selectedRoomId}
                      onChange={(e) => setSelectedRoomId(e.target.value)}
                    >
                      {rooms.map((r) => (
                        <option key={r.room_id} value={r.room_id}>
                          {r.room_name} ({r.ac_status}) — ₹{r.price}/night (Max {r.capacity} Guests)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dates */}
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

                  {/* Quantity & Guests */}
                  <div className="form-group">
                    <label className="form-label">
                      <BedDouble size={15} color="var(--primary)" /> Number of Rooms
                    </label>
                    <select
                      className="form-control"
                      value={roomQty}
                      onChange={(e) => setRoomQty(parseInt(e.target.value, 10))}
                    >
                      <option value="1">1 Room</option>
                      <option value="2">2 Rooms</option>
                      <option value="3">3 Rooms</option>
                      <option value="4">4 Rooms</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Users size={15} color="var(--primary)" /> Adults (Age 12+)
                    </label>
                    <select
                      className="form-control"
                      value={adults}
                      onChange={(e) => setAdults(parseInt(e.target.value, 10))}
                    >
                      <option value="1">1 Adult</option>
                      <option value="2">2 Adults</option>
                      <option value="3">3 Adults</option>
                      <option value="4">4 Adults</option>
                      <option value="5">5 Adults</option>
                      <option value="6">6+ Adults</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Users size={15} color="var(--primary)" /> Children (0-11 yrs)
                    </label>
                    <select
                      className="form-control"
                      value={children}
                      onChange={(e) => setChildren(parseInt(e.target.value, 10))}
                    >
                      <option value="0">0 Children</option>
                      <option value="1">1 Child (Free under 4)</option>
                      <option value="2">2 Children</option>
                      <option value="3">3 Children</option>
                    </select>
                  </div>
                </div>

                {/* Availability status badge */}
                <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: availability.available ? 'var(--success-bg)' : 'var(--danger-bg)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {availability.available ? (
                    <>
                      <CheckCircle2 size={20} color="var(--success)" />
                      <div style={{ fontSize: '0.9rem', color: 'var(--success)', fontWeight: 600 }}>
                        Rooms Available! {availability.remainingQty} room(s) currently open for your requested dates.
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={20} color="var(--danger)" />
                      <div style={{ fontSize: '0.9rem', color: 'var(--danger)', fontWeight: 600 }}>
                        {availability.reason || `Only ${availability.remainingQty} room(s) available for selected dates.`}
                      </div>
                    </>
                  )}
                </div>

                {/* Live Tariff Summary Box */}
                {selectedRoom && (
                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '1.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <span>{selectedRoom.room_name} (₹{selectedRoom.price} × {roomQty} room × {numberOfNights} night{numberOfNights > 1 ? 's' : ''})</span>
                      <span style={{ fontWeight: 700 }}>₹{(selectedRoom.price * roomQty * numberOfNights).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      <span>Taxes & Service Fees</span>
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>INCLUDED (₹0 extra)</span>
                    </div>
                    <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '0.75rem 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800 }}>
                      <span style={{ color: 'var(--text-main)' }}>Total Estimated Amount:</span>
                      <span style={{ color: 'var(--primary)' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Payment will be collected at property during check-in.
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!availability.available}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                >
                  <span>Proceed to Guest Details</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Guest Details & Confirmation */}
          {step === 2 && (
            <div className="search-widget-card no-print">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>
                  Guest & Devotee Information
                </h2>
                {!isCustomerLoggedIn && (
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="btn btn-secondary btn-sm"
                  >
                    <User size={14} /> Sign In for 1-Click Fill
                  </button>
                )}
              </div>

              <form onSubmit={handleFinalSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">
                      <User size={15} color="var(--primary)" /> Primary Guest Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh V. Sharma"
                      className="form-control"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Phone size={15} color="var(--primary)" /> Mobile Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98230 45671"
                      className="form-control"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Mail size={15} color="var(--primary)" /> Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. guest@example.com"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <MapPin size={15} color="var(--primary)" /> Hometown / City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pune, Solapur, Mumbai..."
                      className="form-control"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Clock size={15} color="var(--primary)" /> Estimated Arrival Time
                    </label>
                    <select className="form-control">
                      <option>Morning (08:00 AM - 12:00 PM)</option>
                      <option>Standard Check-in (12:00 PM - 03:00 PM)</option>
                      <option>Evening (03:00 PM - 08:00 PM)</option>
                      <option>Late Night (After 08:00 PM)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Ground floor preference, extra pillows, early temple darshan guidance..."
                      className="form-control"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                    />
                  </div>
                </div>

                {/* Stay Summary Recap */}
                <div style={{ backgroundColor: 'var(--gold-light)', border: '1px solid var(--gold-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} color="var(--primary)" /> Reservation Summary
                  </div>
                  <div><strong>Room:</strong> {selectedRoom?.room_name} ({roomQty} unit)</div>
                  <div><strong>Duration:</strong> {checkIn} to {checkOut} ({numberOfNights} night{numberOfNights > 1 ? 's' : ''})</div>
                  <div><strong>Total Amount Payable at Check-in:</strong> ₹{totalAmount.toLocaleString('en-IN')}</div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#66420B' }}>
                    • No advance payment required online. Pay via Cash or UPI at front desk.
                  </div>
                </div>

                {/* Terms checkbox */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '1.5rem' }}>
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{ marginTop: '4px' }}
                  />
                  <label htmlFor="terms" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    I agree to the property stay policies (Check-in 12:00 PM, Check-out 11:00 AM) and confirm that all guest details provided are correct.
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                  >
                    <Sparkles size={16} /> Confirm & Generate Voucher
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Confirmed Voucher */}
          {step === 3 && confirmedBooking && (
            <div>
              <div className="voucher-card">
                <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--success-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                    <CheckCircle2 size={32} color="var(--success)" />
                  </div>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    Reservation Confirmed!
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    Thank you, {confirmedBooking.guest_name}. Your room has been reserved at Shree Yatri Nivas.
                  </p>
                  <div style={{ marginTop: '0.75rem' }}>
                    <span className="badge badge-gold" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
                      Booking ID: {confirmedBooking.booking_reference}
                    </span>
                  </div>
                </div>

                {/* Voucher Specifications Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>GUEST NAME</div>
                    <div style={{ fontWeight: 700 }}>{confirmedBooking.guest_name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{confirmedBooking.mobile}</div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>ROOM TYPE</div>
                    <div style={{ fontWeight: 700 }}>{confirmedBooking.room_name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{confirmedBooking.room_quantity} Room ({confirmedBooking.adults} Adults, {confirmedBooking.children} Kids)</div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>CHECK-IN DATE</div>
                    <div style={{ fontWeight: 700 }}>{confirmedBooking.check_in}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>From {PROPERTY_INFO.check_in_time}</div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>CHECK-OUT DATE</div>
                    <div style={{ fontWeight: 700 }}>{confirmedBooking.check_out}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Until {PROPERTY_INFO.check_out_time}</div>
                  </div>
                </div>

                {/* Payable Box */}
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>Total Payable at Property</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payment Method: Pay at Check-in (Cash / UPI)</div>
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ₹{confirmedBooking.total_amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Property Contact & Directions */}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                  <div><strong>Property Location:</strong> {PROPERTY_INFO.address}</div>
                  <div><strong>Front Desk Support:</strong> {PROPERTY_INFO.phone} / {PROPERTY_INFO.alt_phone}</div>
                </div>
              </div>

              {/* Voucher Action Buttons (Hidden in print) */}
              <div className="no-print" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handlePrintVoucher}
                  className="btn btn-secondary"
                  style={{ flex: 1, minWidth: '160px' }}
                >
                  <Printer size={16} /> Print Voucher
                </button>
                <button
                  onClick={() => handleWhatsAppShare(confirmedBooking)}
                  className="btn btn-gold"
                  style={{ flex: 1, minWidth: '160px' }}
                >
                  <MessageCircle size={16} /> Share on WhatsApp
                </button>
                <button
                  onClick={() => {
                    setConfirmedBooking(null);
                    setStep(1);
                  }}
                  className="btn btn-primary"
                  style={{ flex: 1, minWidth: '160px' }}
                >
                  Book Another Room
                </button>
              </div>
            </div>
          )}

          {/* Booking Lookup Widget (Search Existing Booking) */}
          <div className="no-print" style={{ marginTop: '3.5rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={18} color="var(--primary)" /> Find Existing Booking & Status
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Already made a reservation? Enter your booking reference number or 10-digit mobile number to view details.
            </p>

            <form onSubmit={handleLookupBooking} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                required
                placeholder="e.g. SYN-20260921-001 or 9823045671"
                className="form-control"
                style={{ flex: 1, minWidth: '240px' }}
                value={lookupRef}
                onChange={(e) => setLookupRef(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary">
                Search Booking
              </button>
            </form>

            {lookupError && (
              <div style={{ marginTop: '1rem', color: 'var(--danger)', fontSize: '0.85rem' }}>
                {lookupError}
              </div>
            )}

            {lookedUpBooking && (
              <div style={{ marginTop: '1.5rem', padding: '1.25rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span className="badge badge-gold" style={{ marginBottom: '0.25rem' }}>{lookedUpBooking.booking_reference}</span>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{lookedUpBooking.guest_name}</div>
                  </div>
                  <span className={`badge ${lookedUpBooking.booking_status === 'Confirmed' ? 'badge-success' : 'badge-primary'}`}>
                    Status: {lookedUpBooking.booking_status}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div><strong>Room:</strong> {lookedUpBooking.room_name} ({lookedUpBooking.room_quantity} unit)</div>
                  <div><strong>Stay Dates:</strong> {lookedUpBooking.check_in} to {lookedUpBooking.check_out}</div>
                  <div><strong>Total Amount:</strong> ₹{lookedUpBooking.total_amount?.toLocaleString('en-IN')} ({lookedUpBooking.payment_status})</div>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => handleWhatsAppShare(lookedUpBooking)} className="btn btn-secondary btn-sm">
                    <MessageCircle size={14} /> Send to WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  );
};
