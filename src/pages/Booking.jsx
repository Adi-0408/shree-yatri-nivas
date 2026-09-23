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
  Search,
  DollarSign,
  Lock
} from 'lucide-react';
import { CustomSelect } from '../components/CustomSelect';

export const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { customer, isCustomerLoggedIn, openAuthModal } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const [step, setStep] = useState(1);
  const [rooms, setRooms] = useState([]);
  const [pendingAdvanceStep, setPendingAdvanceStep] = useState(false);
  
  // Form State - Step 1
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [selectedRoomId, setSelectedRoomId] = useState(searchParams.get('roomId') || 'SYN-RM-AC');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || todayStr);
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || tomorrowStr);
  const [roomQty, setRoomQty] = useState(Math.max(1, parseInt(searchParams.get('roomQty'), 10) || 1));
  const [adults, setAdults] = useState(Math.max(1, parseInt(searchParams.get('guests'), 10) || 2));
  const [childrenCount, setChildrenCount] = useState(0);
  const [childrenAges, setChildrenAges] = useState([]);
  const [pricingConfig, setPricingConfig] = useState(StorageService.getPricingConfig());

  // Children count and age handlers
  const handleChildrenCountChange = (newVal) => {
    const count = Math.max(0, parseInt(newVal, 10) || 0);
    setChildrenCount(count);
    setChildrenAges((prev) => {
      if (count > prev.length) {
        const added = Array.from({ length: count - prev.length }, () => 2);
        return [...prev, ...added];
      } else {
        return prev.slice(0, count);
      }
    });
  };

  const handleChildAgeChange = (index, newAge) => {
    setChildrenAges((prev) => {
      const copy = [...prev];
      copy[index] = Math.max(0, Math.min(17, parseInt(newAge, 10) || 0));
      return copy;
    });
  };

  const childrenUnder4 = useMemo(() => {
    const limit = pricingConfig.child_age_free_limit ?? 4;
    return childrenAges.filter((a) => Number(a) <= limit).length;
  }, [childrenAges, pricingConfig.child_age_free_limit]);

  const childrenAbove4 = useMemo(() => {
    const limit = pricingConfig.child_age_free_limit ?? 4;
    return childrenAges.filter((a) => Number(a) > limit).length;
  }, [childrenAges, pricingConfig.child_age_free_limit]);

  // Form State - Step 2 (Guest Details)
  const [guestName, setGuestName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [arrivalTime, setArrivalTime] = useState('Standard Check-in (12:00 PM - 03:00 PM)');
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
    setPricingConfig(StorageService.getPricingConfig());
    
    // Check if valid roomId passed in URL
    const urlRoomId = searchParams.get('roomId');
    if (urlRoomId && loadedRooms.some(r => r.room_id === urlRoomId)) {
      setSelectedRoomId(urlRoomId);
    } else if (loadedRooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(loadedRooms[0].room_id);
    }

    const handlePricingSync = (e) => {
      setPricingConfig(e.detail || StorageService.getPricingConfig());
      const updatedRooms = StorageService.getRooms();
      setRooms(updatedRooms);
      setSelectedRoomId((prevId) => {
        if (updatedRooms.some(r => r.room_id === prevId)) return prevId;
        return updatedRooms[0]?.room_id || prevId;
      });
    };
    window.addEventListener('syn_pricing_updated', handlePricingSync);
    return () => window.removeEventListener('syn_pricing_updated', handlePricingSync);
  }, [searchParams]);

  // Autofill customer data if logged in
  useEffect(() => {
    if (customer) {
      setGuestName(customer.name || '');
      setEmail(customer.email || '');
      setMobile(customer.mobile || '');
      setCity(customer.city || '');
    }
  }, [customer]);

  // If customer logs in after clicking "Sign In / Register to Book", auto-advance to Step 2
  useEffect(() => {
    if (isCustomerLoggedIn && pendingAdvanceStep) {
      setPendingAdvanceStep(false);
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isCustomerLoggedIn, pendingAdvanceStep]);

  // Strictly prevent unauthenticated visitors from accessing Step 2
  useEffect(() => {
    if (step === 2 && !isCustomerLoggedIn) {
      setStep(1);
      showWarning('Devotee authentication required. Please sign in or register to complete your reservation.');
      openAuthModal('login');
    }
  }, [step, isCustomerLoggedIn, showWarning, openAuthModal]);

  // Selected room object
  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.room_id === selectedRoomId) || rooms[0] || null;
  }, [rooms, selectedRoomId]);

  // Dynamic Pricing & Occupancy Breakdown
  const priceBreakdown = useMemo(() => {
    return StorageService.calculateBookingCost({
      roomId: selectedRoomId,
      acStatus: selectedRoom?.ac_status || 'AC',
      checkIn,
      checkOut,
      roomQty,
      adults,
      childrenUnder4,
      childrenAbove4,
      childrenAges
    });
  }, [selectedRoomId, selectedRoom, checkIn, checkOut, roomQty, adults, childrenUnder4, childrenAbove4, childrenAges, pricingConfig]);

  const numberOfNights = priceBreakdown.numberOfNights;
  const totalAmount = priceBreakdown.totalAmount;

  // Overlap availability check
  const availability = useMemo(() => {
    if (!selectedRoomId || !checkIn || !checkOut) return { available: true, remainingQty: 1, totalQty: 1 };
    return StorageService.checkRoomAvailability(selectedRoomId, checkIn, checkOut, roomQty);
  }, [selectedRoomId, checkIn, checkOut, roomQty]);

  // Ensure roomQty is within current selected room inventory
  useEffect(() => {
    const maxRooms = selectedRoom?.total_quantity || availability.totalQty || 1;
    if (roomQty > maxRooms) {
      setRoomQty(Math.max(1, maxRooms));
    }
  }, [selectedRoom?.total_quantity, availability.totalQty, roomQty]);

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
    if (priceBreakdown.exceedsMaxCapacity) {
      showError(`Occupancy limit exceeded: Maximum 4 persons allowed per room (${priceBreakdown.maxAllowedGuests} guests for ${roomQty} room(s)). Please add another room.`);
      return;
    }
    if (!availability.available || roomQty > availability.remainingQty) {
      const totalAvail = availability.remainingQty;
      const totalInv = availability.totalQty || selectedRoom?.total_quantity || 1;
      showError(`Only ${totalAvail} ${selectedRoom?.room_name || 'room'}(s) available for selected dates (Total inventory: ${totalInv}). Please adjust.`);
      return;
    }

    // Devotee Authentication Enforcement: Account required to proceed
    if (!isCustomerLoggedIn) {
      setPendingAdvanceStep(true);
      showWarning('Devotee account required. Please sign in or register to complete your reservation.');
      openAuthModal('login');
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 -> Step 3 (Create Booking)
  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!isCustomerLoggedIn) {
      showError('Devotee account required. Please sign in or register to complete your reservation.');
      openAuthModal('login');
      return;
    }
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
        customer_id: customer?.id || customer?.mobile || customer?.email || 'DEVOTEE',
        customer_name: customer?.name || guestName.trim(),
        guest_name: guestName.trim(),
        mobile: mobile.trim(),
        email: email.trim() || `${mobile.trim()}@guest.hotelvihanninn.com`,
        city: city.trim() || 'Kolhapur Guest',
        check_in: checkIn,
        check_out: checkOut,
        adults: priceBreakdown.adults,
        children: priceBreakdown.childrenUnder4 + priceBreakdown.childrenAbove4,
        children_under_4: priceBreakdown.childrenUnder4,
        children_above_4: priceBreakdown.childrenAbove4,
        children_ages: childrenAges,
        total_guests: priceBreakdown.totalGuests,
        included_guests: priceBreakdown.includedGuests,
        extra_guests: priceBreakdown.extraGuests,
        extra_adults: priceBreakdown.extraAdults || 0,
        extra_children: priceBreakdown.extraChildren || 0,
        extra_person_rate: priceBreakdown.extraPersonRate,
        child_rate: priceBreakdown.childRate,
        extra_adult_charges: priceBreakdown.extraAdultCharge || 0,
        extra_child_charges: priceBreakdown.extraChildCharge || 0,
        room_id: selectedRoom?.room_id || selectedRoomId,
        room_name: selectedRoom?.room_name || 'Accommodations',
        room_type: selectedRoom?.room_type || 'AC Room',
        room_quantity: parseInt(roomQty, 10),
        room_rate: priceBreakdown.baseRate,
        number_of_nights: priceBreakdown.numberOfNights,
        base_charges: priceBreakdown.roomBaseCharge,
        extra_charges: priceBreakdown.extraGuestCharge,
        total_amount: priceBreakdown.totalAmount,
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
    const text = `*${PROPERTY_INFO.name} - Booking Voucher*\n\n` +
      `*Reference:* ${b.booking_reference}\n` +
      `*Guest Name:* ${b.guest_name}\n` +
      `*Room:* ${b.room_name} (${b.room_quantity} Room)\n` +
      `*Check-in:* ${b.check_in} (${PROPERTY_INFO.check_in_time})\n` +
      `*Check-out:* ${b.check_out} (${PROPERTY_INFO.check_out_time})\n` +
      `*Total Nights:* ${b.number_of_nights}\n` +
      `*Total Payable:* ₹${(b.total_amount || 0).toLocaleString('en-IN')} (Pay at Property)\n\n` +
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
                    <CustomSelect
                      value={selectedRoomId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setSelectedRoomId(newId);
                        setRoomQty(1);
                      }}
                      options={rooms.map((r) => {
                        let displayPrice = r.price;
                        let specialTag = '';
                        if (checkIn && checkOut) {
                          const est = StorageService.calculateBookingCost({
                            roomId: r.room_id,
                            acStatus: r.ac_status,
                            checkIn,
                            checkOut,
                            roomQty: 1,
                            adults: 2
                          });
                          if (est?.baseRate) {
                            displayPrice = est.baseRate;
                            if (est.hasSpecialDateRate) {
                              specialTag = ' ✨ Seasonal Tariff';
                            }
                          }
                        }
                        return {
                          value: r.room_id,
                          label: `${r.room_name} (${r.ac_status}) — ₹${displayPrice.toLocaleString('en-IN')}/night${specialTag} (${r.total_quantity} Available, Max ${r.capacity} Guests/room)`
                        };
                      })}
                    />
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
                    <label className="form-label" style={{ justifyContent: 'space-between' }}>
                      <span><BedDouble size={15} color="var(--primary)" /> Number of Rooms</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Available: {availability.remainingQty} of {availability.totalQty || selectedRoom?.total_quantity || 1}
                      </span>
                    </label>
                    <CustomSelect
                      value={roomQty}
                      onChange={(e) => setRoomQty(parseInt(e.target.value, 10))}
                      options={Array.from({ length: Math.max(1, availability.totalQty || selectedRoom?.total_quantity || 1) }, (_, i) => i + 1).map((qty) => ({
                        value: qty,
                        label: `${qty} Room${qty > 1 ? 's' : ''} (Max ${(selectedRoom?.capacity || 4) * qty} Guests)`
                      }))}
                    />
                  </div>

                  {/* Adults Counter */}
                  <div className="form-group">
                    <label className="form-label" style={{ justifyContent: 'space-between' }}>
                      <span><Users size={15} color="var(--primary)" /> Adults</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Age 5+ / Adult</span>
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid var(--border-light)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.35rem 0.65rem',
                      minHeight: '44px'
                    }}>
                      <button
                        type="button"
                        className="counter-btn"
                        disabled={adults <= 1}
                        onClick={() => setAdults(prev => Math.max(1, prev - 1))}
                        aria-label="Decrease adults"
                      >
                        –
                      </button>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        {adults} Adult{adults > 1 ? 's' : ''}
                      </span>
                      <button
                        type="button"
                        className="counter-btn"
                        disabled={adults >= Math.min(30, (selectedRoom?.capacity || 4) * roomQty)}
                        onClick={() => setAdults(prev => Math.min(Math.min(30, (selectedRoom?.capacity || 4) * roomQty), prev + 1))}
                        aria-label="Increase adults"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Children Total Counter */}
                  <div className="form-group">
                    <label className="form-label" style={{ justifyContent: 'space-between' }}>
                      <span><Users size={15} color="var(--gold)" /> Children</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        ≤{pricingConfig.child_age_free_limit ?? 4}y: Free
                      </span>
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid var(--border-light)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.35rem 0.65rem',
                      minHeight: '44px'
                    }}>
                      <button
                        type="button"
                        className="counter-btn"
                        disabled={childrenCount <= 0}
                        onClick={() => handleChildrenCountChange(Math.max(0, childrenCount - 1))}
                        aria-label="Decrease children"
                      >
                        –
                      </button>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        {childrenCount} Child{childrenCount === 1 ? '' : 'ren'}
                      </span>
                      <button
                        type="button"
                        className="counter-btn"
                        disabled={childrenCount >= ((selectedRoom?.capacity || 4) * roomQty)}
                        onClick={() => handleChildrenCountChange(Math.min((selectedRoom?.capacity || 4) * roomQty, childrenCount + 1))}
                        aria-label="Increase children"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Age Selectors for each Child (Graceful Animation) */}
                  {childrenCount > 0 && (
                    <div className="child-age-animate" style={{ gridColumn: '1 / -1', padding: '1.1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#F8FAFC', border: '1px solid var(--border-light)', marginTop: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Users size={16} color="var(--primary)" /> Individual Child Age Classification
                        </div>
                        <div style={{ fontSize: '0.78rem' }}>
                          <span className="badge badge-success" style={{ marginRight: '6px' }}>{childrenUnder4} Free (≤{pricingConfig.child_age_free_limit ?? 4} yrs)</span>
                          {childrenAbove4 > 0 && (
                            <span className="badge badge-warning">{childrenAbove4} Extra Guest (&gt;{pricingConfig.child_age_free_limit ?? 4} yrs)</span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.75rem' }}>
                        {childrenAges.map((age, idx) => {
                          const isFree = Number(age) <= (pricingConfig.child_age_free_limit ?? 4);
                          return (
                            <div key={idx} className="form-group" style={{ margin: 0, padding: '0.75rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                              <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                <span>Child {idx + 1} Age:</span>
                                <span className={`badge ${isFree ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.72rem', padding: '2px 6px' }}>
                                  {isFree ? 'FREE' : `+₹${pricingConfig.extra_person_rate}/nt`}
                                </span>
                              </label>
                              <CustomSelect
                                value={age}
                                onChange={(e) => handleChildAgeChange(idx, e.target.value)}
                              >
                                {Array.from({ length: 18 }, (_, a) => (
                                  <option key={a} value={a}>
                                    {a === 0 ? 'Under 1 yr (Infant)' : `${a} year${a > 1 ? 's' : ''} ${a <= (pricingConfig.child_age_free_limit ?? 4) ? '(Free)' : `(+₹${pricingConfig.extra_person_rate}/nt)`}`}
                                  </option>
                                ))}
                              </CustomSelect>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Over-capacity warning for Inventory Limits */}
                  {(!availability.available || roomQty > availability.remainingQty) && (
                    <div style={{ gridColumn: '1 / -1', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={16} />
                      <span>
                        {`Only ${availability.remainingQty} ${selectedRoom?.room_name || selectedRoom?.ac_status || ''} room(s) available for these dates (Total property inventory: ${availability.totalQty || selectedRoom?.total_quantity || 1}).`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Occupancy Policy & Total Persons Notice */}
                <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: priceBreakdown.exceedsMaxCapacity ? 'var(--danger-bg)' : '#F8FAFC', border: `1px solid ${priceBreakdown.exceedsMaxCapacity ? 'var(--danger)' : 'var(--border-light)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {priceBreakdown.exceedsMaxCapacity ? (
                      <AlertCircle size={18} color="var(--danger)" />
                    ) : (
                      <Info size={18} color="var(--primary)" />
                    )}
                    <div style={{ fontSize: '0.85rem', color: priceBreakdown.exceedsMaxCapacity ? 'var(--danger)' : 'var(--text-main)' }}>
                      <strong>Occupancy:</strong> {priceBreakdown.totalGuests} / {priceBreakdown.maxAllowedGuests} Persons Max ({roomQty} Room(s) × {selectedRoom?.capacity || 4} max)
                      {priceBreakdown.exceedsMaxCapacity && (
                        <span style={{ fontWeight: 700, display: 'block', marginTop: '2px' }}>
                          Limit exceeded! Maximum {selectedRoom?.capacity || 4} persons per room. Please book an additional room.
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Standard tariff covers up to <strong>{priceBreakdown.includedGuests} guests</strong>
                  </div>
                </div>

                {/* Availability status badge */}
                <div style={{ marginBottom: '1.5rem', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: availability.available ? 'var(--success-bg)' : 'var(--danger-bg)', display: 'flex', alignItems: 'center', gap: '0.75rem', border: `1px solid ${availability.available ? '#BBF7D0' : '#FECACA'}` }}>
                  {availability.available ? (
                    <>
                      <CheckCircle2 size={18} color="var(--success)" />
                      <div style={{ fontSize: '0.88rem', color: 'var(--success)', fontWeight: 600 }}>
                        Rooms Available! {availability.remainingQty} room(s) currently open for your requested dates.
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={18} color="var(--danger)" />
                      <div style={{ fontSize: '0.88rem', color: 'var(--danger)', fontWeight: 600 }}>
                        {availability.reason || `Only ${availability.remainingQty} room(s) available for selected dates.`}
                      </div>
                    </>
                  )}
                </div>

                {/* Modern Receipt Card: Itemized Tariff Breakdown */}
                {selectedRoom && (
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)',
                    marginBottom: '1.75rem'
                  }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: 'var(--text-main)',
                      marginBottom: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: '0.75rem',
                      borderBottom: '1px solid var(--border-light)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={18} color="var(--primary)" /> Itemized Tariff Receipt
                      </div>
                      <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>All Taxes Included</span>
                    </div>

                    {priceBreakdown.hasSpecialDateRate && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        marginBottom: '0.85rem',
                        padding: '0.5rem 0.8rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--gold-light)',
                        border: '1px solid var(--gold-border)',
                        fontSize: '0.8rem',
                        color: 'var(--gold-hover)',
                        fontWeight: 600
                      }}>
                        <Sparkles size={14} />
                        <span>Special Seasonal / Date-Range Rates applied for selected dates</span>
                      </div>
                    )}

                    {/* Line 1: Room Base Charge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                      <div>
                        <strong style={{ color: 'var(--text-main)' }}>Room Base Tariff:</strong> {selectedRoom?.room_name || 'Room'}
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {priceBreakdown.hasSpecialDateRate ? (
                            <span>Custom seasonal rate applied across {priceBreakdown.numberOfNights} night{priceBreakdown.numberOfNights > 1 ? 's' : ''} (Avg ₹{Math.round(priceBreakdown.roomBaseCharge / (Math.max(1, priceBreakdown.roomQty * priceBreakdown.numberOfNights)))}/night/room)</span>
                          ) : (
                            <span>₹{priceBreakdown.baseRate} × {priceBreakdown.roomQty} room × {priceBreakdown.numberOfNights} night{priceBreakdown.numberOfNights > 1 ? 's' : ''} (Includes up to {priceBreakdown.includedGuests} guests)</span>
                          )}
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        ₹{(priceBreakdown.roomBaseCharge || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Night Breakdown Detail Pill List if date-range rate is active */}
                    {priceBreakdown.hasSpecialDateRate && priceBreakdown.nightBreakdowns && priceBreakdown.nightBreakdowns.length > 0 && (
                      <div style={{ backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', padding: '0.65rem 0.85rem', marginBottom: '0.85rem', fontSize: '0.78rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Date-wise Tariff Breakdown:</span>
                          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{priceBreakdown.numberOfNights} Night{priceBreakdown.numberOfNights > 1 ? 's' : ''}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {priceBreakdown.nightBreakdowns.map((nb, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: nb.isOverride ? 'var(--primary)' : 'var(--text-secondary)' }}>
                              <span>• {nb.date}: {nb.isOverride ? `${nb.overrideName || 'Advance Rate'}` : 'Standard Base Rate'}</span>
                              <span style={{ fontWeight: 600 }}>₹{(nb.rate * priceBreakdown.roomQty).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Line 2: Extra Adult Charges */}
                    {priceBreakdown.extraAdults > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                        <div>
                          <strong style={{ color: 'var(--text-main)' }}>Extra Adult Charge:</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {priceBreakdown.extraAdults} extra adult(s) × ₹{priceBreakdown.extraPersonRate} × {priceBreakdown.numberOfNights} night(s)
                          </div>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>
                          +₹{(priceBreakdown.extraAdultCharge || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    {/* Line 2b: Chargeable Children (5–17 yrs) Charges */}
                    {priceBreakdown.extraChildren > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                        <div>
                          <strong style={{ color: 'var(--text-main)' }}>Child Charge (5–17 yrs):</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {priceBreakdown.extraChildren} child(ren) (5–17y) × ₹{priceBreakdown.childRate} × {priceBreakdown.numberOfNights} night(s)
                          </div>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--gold-hover, #B45309)' }}>
                          +₹{(priceBreakdown.extraChildCharge || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    {/* Line 2c: If neither extra adults nor extra children */}
                    {priceBreakdown.extraGuests === 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                        <div>
                          <strong style={{ color: 'var(--text-main)' }}>Extra Guest Charges:</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            No extra guest charges (Included capacity covers up to {priceBreakdown.includedGuests} guests)
                          </div>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                          ₹0
                        </span>
                      </div>
                    )}

                    {/* Line 3: Children under 4 */}
                    {priceBreakdown.childrenUnder4 > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                        <div>
                          <strong style={{ color: 'var(--text-main)' }}>Children (Ages 0–4):</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {priceBreakdown.childrenUnder4} child(ren) aged 0–4 years stay free of charge
                          </div>
                        </div>
                        <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE (₹0)</span>
                      </div>
                    )}

                    {/* Line 4: Taxes */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      <span>Applicable Taxes &amp; Booking Fees</span>
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>INCLUDED (₹0 extra)</span>
                    </div>

                    {/* Grand Total Row with Highlighted Surface Fill */}
                    <div style={{
                      backgroundColor: 'var(--primary-light)',
                      border: '1px solid #BBF7D0',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.9rem 1.1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          Total Payable at Check-in:
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                          Zero online advance deposit. 100% payment collected at property check-in.
                        </div>
                      </div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                        ₹{(priceBreakdown.totalAmount || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Devotee Account Requirement Notice */}
                {!isCustomerLoggedIn && (
                  <div style={{
                    backgroundColor: '#FFFDF5',
                    border: '1.5px solid var(--gold)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.1rem 1.25rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        flexShrink: 0
                      }}>
                        <Lock size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                          Devotee Account Required to Book
                        </div>
                        <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                          Please sign in or create an account to confirm your room reservation.
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button
                        type="button"
                        onClick={() => openAuthModal('login')}
                        className="btn btn-primary btn-sm"
                      >
                        Devotee Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => openAuthModal('register')}
                        className="btn btn-secondary btn-sm"
                      >
                        Create Account
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!availability.available}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                >
                  {!isCustomerLoggedIn ? (
                    <>
                      <Lock size={18} />
                      <span>Sign In / Register to Book</span>
                      <ArrowRight size={18} />
                    </>
                  ) : (
                    <>
                      <span>Proceed to Guest Details</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Guest Details & Confirmation */}
          {step === 2 && (
            <div className="search-widget-card no-print">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>
                  Guest & Devotee Information
                </h2>
                {isCustomerLoggedIn && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600, backgroundColor: '#ECFDF5', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #A7F3D0' }}>
                    <CheckCircle2 size={16} /> Authenticated Devotee: {customer?.name}
                  </div>
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
                    <CustomSelect
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                    >
                      <option value="Morning (08:00 AM - 12:00 PM)">Morning (08:00 AM - 12:00 PM)</option>
                      <option value="Standard Check-in (12:00 PM - 03:00 PM)">Standard Check-in (12:00 PM - 03:00 PM)</option>
                      <option value="Evening (03:00 PM - 08:00 PM)">Evening (03:00 PM - 08:00 PM)</option>
                      <option value="Late Night (After 08:00 PM)">Late Night (After 08:00 PM)</option>
                    </CustomSelect>
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

                {/* Stay Summary Recap - Modern Receipt Card */}
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '1rem', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={18} color="var(--primary)" /> Itemized Reservation Summary
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>Pay at Check-in</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span><strong>Room:</strong> {selectedRoom?.room_name} ({roomQty} unit)</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{checkIn} to {checkOut} ({priceBreakdown.numberOfNights} night{priceBreakdown.numberOfNights > 1 ? 's' : ''})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                    <span>Room Base Charges (Up to {priceBreakdown.includedGuests} guests){priceBreakdown.hasSpecialDateRate ? ' (Seasonal Override)' : ''}:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{(priceBreakdown.roomBaseCharge || 0).toLocaleString('en-IN')}</span>
                  </div>
                  {priceBreakdown.extraAdults > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      <span>Extra Adult Charges ({priceBreakdown.extraAdults} extra × ₹{priceBreakdown.extraPersonRate} × {priceBreakdown.numberOfNights}n):</span>
                      <span style={{ fontWeight: 700 }}>+₹{(priceBreakdown.extraAdultCharge || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {priceBreakdown.extraChildren > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--gold-hover, #B45309)' }}>
                      <span>Child Charges (5–17 yrs: {priceBreakdown.extraChildren} child × ₹{priceBreakdown.childRate} × {priceBreakdown.numberOfNights}n):</span>
                      <span style={{ fontWeight: 700 }}>+₹{(priceBreakdown.extraChildCharge || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {priceBreakdown.childrenUnder4 > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--success)' }}>
                      <span>Children (0–4 yrs: {priceBreakdown.childrenUnder4} child):</span>
                      <span style={{ fontWeight: 700 }}>FREE (₹0)</span>
                    </div>
                  )}
                  
                  {/* Grand Total Row with Highlighted Surface Fill */}
                  <div style={{
                    backgroundColor: 'var(--primary-light)',
                    border: '1px solid #BBF7D0',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.9rem 1.1rem',
                    marginTop: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Total Payable at Check-in:
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Zero online deposit. Cash or UPI at property front desk.
                      </div>
                    </div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                      ₹{(priceBreakdown.totalAmount || 0).toLocaleString('en-IN')}
                    </div>
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
                    Thank you, {confirmedBooking.guest_name}. Your room has been reserved at {PROPERTY_INFO.name}.
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
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {confirmedBooking.room_quantity} Room ({confirmedBooking.adults} Adults
                      {confirmedBooking.children_under_4 > 0 ? `, ${confirmedBooking.children_under_4} Child <4y (Free)` : ''}
                      {confirmedBooking.children_above_4 > 0 ? `, ${confirmedBooking.children_above_4} Child >4y` : ''})
                    </div>
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

                {/* Payable Box with Itemized Breakdown */}
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                    <span>Room Base Tariff ({confirmedBooking.number_of_nights}N × ₹{confirmedBooking.room_rate}):</span>
                    <span>₹{(confirmedBooking.base_charges || (confirmedBooking.room_rate * confirmedBooking.room_quantity * confirmedBooking.number_of_nights) || 0).toLocaleString('en-IN')}</span>
                  </div>
                  {(confirmedBooking.extra_charges > 0 || confirmedBooking.extra_guests > 0) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem', color: 'var(--primary)' }}>
                      <span>Extra Guest Charges ({confirmedBooking.extra_guests || 1} extra guest × {confirmedBooking.number_of_nights}N):</span>
                      <span>+₹{(confirmedBooking.extra_charges || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '0.5rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>Total Payable at Property</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payment Method: Pay at Check-in (Cash / UPI)</div>
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ₹{(confirmedBooking.total_amount || 0).toLocaleString('en-IN')}
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
