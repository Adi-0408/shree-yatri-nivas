import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { PricingService } from '../services/pricingService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  ShieldAlert, 
  Lock, 
  User, 
  LayoutDashboard, 
  CalendarCheck, 
  BedDouble, 
  Star, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  LogOut, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  RotateCcw,
  Printer,
  Sparkles,
  Sliders,
  Save,
  History,
  Info
} from 'lucide-react';

export const Admin = ({ initialTab }) => {
  const { customer, isAdminLoggedIn, loginAdmin, logoutAdmin, logoutCustomer } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const location = useLocation();
  const params = useParams();

  // Admin login form state
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  // Active Tab: 'dashboard' | 'bookings' | 'rooms' | 'pricing' | 'reviews' | 'customers'
  const isPricingPath = location.pathname.includes('/pricing') || initialTab === 'pricing';
  const defaultTab = isPricingPath ? 'pricing' : (params.tab || initialTab || 'dashboard');
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync tab if URL changes
  useEffect(() => {
    if (location.pathname.includes('/pricing')) {
      setActiveTab('pricing');
    } else if (params.tab) {
      setActiveTab(params.tab);
    }
  }, [location.pathname, params.tab]);

  // Data State
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Pricing & Inventory State
  const [pricingConfig, setPricingConfig] = useState(StorageService.getPricingConfig());
  const [pricingForm, setPricingForm] = useState(StorageService.getPricingConfig());
  const [isSavingPricing, setIsSavingPricing] = useState(false);

  // Search & Filter state
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');

  // Room Modal state (Create / Edit)
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    room_name: '',
    room_type: 'Family Suite',
    ac_status: 'AC',
    price: 2500,
    capacity: 4,
    total_quantity: 5,
    status: 'active',
    description: ''
  });

  const reloadData = () => {
    StorageService.init();
    setStats(StorageService.getDashboardStats());
    setBookings(StorageService.getBookings());
    setRooms(StorageService.getRooms(true));
    setReviews(StorageService.getReviews(true));
    setCustomers(StorageService.getCustomers());
    const pConfig = StorageService.getPricingConfig();
    setPricingConfig(pConfig);
    setPricingForm(pConfig);
  };

  const handleSavePricing = async (e) => {
    e.preventDefault();

    const acRate = Number(pricingForm.base_rates?.AC);
    const nonAcRate = Number(pricingForm.base_rates?.["Non-AC"]);
    const extraRate = Number(pricingForm.extra_person_rate);
    const childLimit = Number(pricingForm.child_age_free_limit);
    const acQty = Number(pricingForm.inventory?.AC?.total_rooms);
    const nonAcQty = Number(pricingForm.inventory?.["Non-AC"]?.total_rooms);

    if (isNaN(acRate) || acRate < 0 || isNaN(nonAcRate) || nonAcRate < 0 || isNaN(extraRate) || extraRate < 0) {
      showError("Price must be greater than or equal to 0");
      return;
    }
    if (isNaN(childLimit) || childLimit < 0) {
      showError("Child age free limit must be greater than or equal to 0");
      return;
    }
    if (isNaN(acQty) || acQty < 0 || isNaN(nonAcQty) || nonAcQty < 0) {
      showError("Room inventory count must be greater than or equal to 0");
      return;
    }

    setIsSavingPricing(true);
    try {
      await PricingService.savePricingConfig(pricingForm, 'Admin');
      showSuccess('Pricing and inventory configuration saved successfully! Rates and inventory are instantly synced.');
      reloadData();
    } catch (err) {
      showError(err.message || 'Failed to update pricing settings.');
    } finally {
      setIsSavingPricing(false);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      reloadData();
    }
  }, [isAdminLoggedIn]);

  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    loginAdmin(adminUser, adminPass);
  };

  const handleQuickDemoLogin = () => {
    setAdminUser('admin');
    setAdminPass('admin123');
    loginAdmin('admin', 'admin123');
  };

  // Booking updates
  const handleUpdateBookingStatus = (bookingId, newStatus) => {
    StorageService.updateBookingStatus(bookingId, newStatus);
    showSuccess(`Booking ${bookingId} status updated to ${newStatus}`);
    reloadData();
  };

  const handleUpdatePaymentStatus = (bookingId, newPayment) => {
    StorageService.updatePaymentStatus(bookingId, newPayment);
    showSuccess(`Booking ${bookingId} payment marked as ${newPayment}`);
    reloadData();
  };

  // Room actions
  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    setRoomFormData({
      room_name: '',
      room_type: 'Executive Double',
      ac_status: 'AC',
      price: 2000,
      capacity: 2,
      total_quantity: 5,
      status: 'active',
      description: 'Comfortable pilgrim room with modern amenities.'
    });
    setRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room) => {
    setEditingRoom(room);
    setRoomFormData({
      room_name: room.room_name,
      room_type: room.room_type,
      ac_status: room.ac_status,
      price: room.price,
      capacity: room.capacity,
      total_quantity: room.total_quantity,
      status: room.status,
      description: room.description
    });
    setRoomModalOpen(true);
  };

  const handleSaveRoom = (e) => {
    e.preventDefault();
    const payload = {
      ...roomFormData,
      price: parseFloat(roomFormData.price),
      capacity: parseInt(roomFormData.capacity, 10),
      total_quantity: parseInt(roomFormData.total_quantity, 10)
    };

    if (editingRoom) {
      payload.room_id = editingRoom.room_id;
    }

    StorageService.saveRoom(payload);
    showSuccess(editingRoom ? 'Room details updated!' : 'New room added successfully!');
    setRoomModalOpen(false);
    reloadData();
  };

  const handleDeleteRoom = (roomId) => {
    if (window.confirm('Are you sure you want to delete this room category?')) {
      StorageService.deleteRoom(roomId);
      showInfo('Room removed.');
      reloadData();
    }
  };

  // Review actions
  const handleApproveReview = (id) => {
    StorageService.approveReview(id);
    showSuccess('Review approved and published to website!');
    reloadData();
  };

  const handleDeleteReview = (id) => {
    if (window.confirm('Delete this review?')) {
      StorageService.deleteReview(id);
      showInfo('Review deleted.');
      reloadData();
    }
  };

  const handleResetSeedData = () => {
    if (window.confirm('Reset all demo rooms, bookings, and reviews to fresh defaults?')) {
      StorageService.resetToDefaults();
      showSuccess('Data reset to original initial state.');
      reloadData();
    }
  };

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (bookingStatusFilter !== 'all' && b.booking_status !== bookingStatusFilter) {
        return false;
      }
      if (bookingSearch.trim()) {
        const q = bookingSearch.toLowerCase();
        const mRef = (b.booking_reference || '').toLowerCase().includes(q);
        const mName = (b.guest_name || '').toLowerCase().includes(q);
        const mMobile = (b.mobile || '').toLowerCase().includes(q);
        const mRoom = (b.room_name || '').toLowerCase().includes(q);
        if (!mRef && !mName && !mMobile && !mRoom) return false;
      }
      return true;
    });
  }, [bookings, bookingStatusFilter, bookingSearch]);

  // AUTH GUARD: 403 Forbidden for logged-in standard customer (role: 'user')
  if (customer && !isAdminLoggedIn) {
    return (
      <div className="syn-main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '2rem 1rem' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)', padding: '2.5rem', border: '1px solid #FECACA', boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: '480px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#FEE2E2', color: '#DC2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <ShieldAlert size={36} />
          </div>
          <div>
            <span className="badge badge-danger" style={{ marginBottom: '0.75rem', backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}>
              403 Forbidden • Access Denied
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Admin Privileges Required
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            You are currently authenticated as <strong>{customer.name}</strong> (standard customer: <code>role: 'user'</code>). Administrative access to pricing and property inventory is strictly restricted.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-outline">
              Return to Home
            </Link>
            <button
              onClick={() => {
                logoutCustomer();
              }}
              className="btn btn-primary"
            >
              Sign Out &amp; Staff Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN FOR GUESTS
  if (!isAdminLoggedIn) {
    return (
      <div className="syn-main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '2rem 1rem' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)', padding: '2.5rem', border: '1px solid var(--border-gold)', boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: '440px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldAlert size={32} color="var(--primary)" />
            </div>
            <h1 style={{ fontSize: '1.6rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Staff & Admin Portal</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Shree Yatri Nivas Management System</p>
          </div>

          <form onSubmit={handleAdminLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="form-group">
              <label className="form-label">
                <User size={15} color="var(--primary)" /> Admin Username
              </label>
              <input
                type="text"
                required
                placeholder="Username (admin)"
                className="form-control"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={15} color="var(--primary)" /> Password
              </label>
              <input
                type="password"
                required
                placeholder="Password (admin123)"
                className="form-control"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              Authenticate & Enter
            </button>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="btn btn-secondary"
              style={{ width: '100%', border: '1px dashed var(--gold)', color: 'var(--primary)' }}
            >
              <Sparkles size={16} color="var(--gold)" />
              <span>1-Click Staff Demo Login (admin / admin123)</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="admin-layout syn-main-content">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>ADMIN PORTAL</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Logged in as Front Desk Manager</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} /> Overview & KPIs
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`admin-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
          >
            <CalendarCheck size={18} /> Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`admin-nav-item ${activeTab === 'rooms' ? 'active' : ''}`}
          >
            <BedDouble size={18} /> Room Inventory ({rooms.length})
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`admin-nav-item ${activeTab === 'pricing' ? 'active' : ''}`}
          >
            <Sliders size={18} /> Pricing & Inventory
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`admin-nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
          >
            <Star size={18} /> Reviews Moderation {stats?.pendingReviewsCount > 0 && <span className="badge badge-warning">{stats.pendingReviewsCount}</span>}
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`admin-nav-item ${activeTab === 'customers' ? 'active' : ''}`}
          >
            <Users size={18} /> Devotee Accounts ({customers.length})
          </button>
        </nav>

        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={handleResetSeedData}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'flex-start' }}
            title="Reset system to seed demo data"
          >
            <RotateCcw size={15} /> Reset Demo Data
          </button>
          <button
            onClick={logoutAdmin}
            className="btn btn-danger btn-sm"
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <LogOut size={15} /> Sign Out Admin
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="admin-content">
        
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                Management Dashboard
              </h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Real-time lodging overview, occupancy status, and revenue statistics.
              </p>
            </div>

            {/* KPI Cards Grid */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div>
                  <div className="kpi-label">TOTAL ROOMS</div>
                  <div className="kpi-val">{stats.totalRooms}</div>
                </div>
                <div className="kpi-icon-box" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <BedDouble size={26} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">TOTAL BOOKINGS</div>
                  <div className="kpi-val">{stats.totalBookings}</div>
                </div>
                <div className="kpi-icon-box" style={{ backgroundColor: 'var(--gold-light)', color: 'var(--gold)' }}>
                  <CalendarCheck size={26} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">COLLECTED REVENUE</div>
                  <div className="kpi-val" style={{ color: 'var(--success)' }}>
                    ₹{stats.totalRevenue.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="kpi-icon-box" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                  <DollarSign size={26} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">PAYMENTS PENDING</div>
                  <div className="kpi-val" style={{ color: 'var(--warning)' }}>
                    ₹{stats.pendingPayments.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="kpi-icon-box" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
                  <Clock size={26} />
                </div>
              </div>
            </div>

            {/* Recent Bookings Table */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Recent Reservations</h3>
                <button onClick={() => setActiveTab('bookings')} className="btn btn-secondary btn-sm">
                  View All ({bookings.length})
                </button>
              </div>

              <div className="table-responsive">
                <table className="syn-table">
                  <thead>
                    <tr>
                      <th>Ref ID</th>
                      <th>Guest Name</th>
                      <th>Room</th>
                      <th>Dates</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 5).map((b) => (
                      <tr key={b.booking_id}>
                        <td><strong>{b.booking_reference}</strong></td>
                        <td>
                          <div>{b.guest_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.mobile}</div>
                        </td>
                        <td>{b.room_name}</td>
                        <td>{b.check_in} to {b.check_out}</td>
                        <td>₹{b.total_amount?.toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`badge ${b.booking_status === 'Confirmed' ? 'badge-success' : b.booking_status === 'Checked-in' ? 'badge-info' : 'badge-warning'}`}>
                            {b.booking_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALL BOOKINGS MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>Bookings Management</h1>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Search, verify check-ins, and update payment status.</p>
              </div>
            </div>

            {/* Filter controls */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-light)', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <input
                  type="text"
                  placeholder="Search by Guest Name, Mobile, or Ref ID..."
                  className="form-control"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                />
              </div>
              <div style={{ width: '180px' }}>
                <select
                  className="form-control"
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Checked-in">Checked-in</option>
                  <option value="Checked-out">Checked-out</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="table-responsive">
              <table className="syn-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Guest / Devotee</th>
                    <th>Room Details</th>
                    <th>Stay Dates</th>
                    <th>Tariff & Pay Status</th>
                    <th>Reservation Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b.booking_id}>
                      <td>
                        <strong>{b.booking_reference}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(b.created_at).toLocaleDateString()}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{b.guest_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.mobile}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.city}</div>
                      </td>
                      <td>
                        <div>{b.room_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.room_quantity} Room ({b.adults}A, {b.children}C)</div>
                      </td>
                      <td>
                        <div>{b.check_in}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>to {b.check_out} ({b.number_of_nights}N)</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>₹{b.total_amount?.toLocaleString('en-IN')}</div>
                        <select
                          value={b.payment_status}
                          onChange={(e) => handleUpdatePaymentStatus(b.booking_id, e.target.value)}
                          className={`table-status-select pay-${b.payment_status?.toLowerCase() || 'pending'}`}
                          style={{ marginTop: '6px' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={b.booking_status}
                          onChange={(e) => handleUpdateBookingStatus(b.booking_id, e.target.value)}
                          className={`table-status-select status-${b.booking_status?.toLowerCase()?.replace(/\s+/g, '-') || 'confirmed'}`}
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Checked-in">Checked-in</option>
                          <option value="Checked-out">Checked-out</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            const text = `SHREE YATRI NIVAS: Booking ${b.booking_reference} for ${b.guest_name}. Room: ${b.room_name}. Dates: ${b.check_in} to ${b.check_out}. Payable: Rs.${b.total_amount}.`;
                            navigator.clipboard.writeText(text);
                            showSuccess('Booking summary copied to clipboard!');
                          }}
                          className="btn btn-secondary btn-sm"
                          title="Copy details"
                        >
                          Copy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ROOMS INVENTORY CRUD */}
        {activeTab === 'rooms' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>Room Inventory & Rates</h1>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage categories, room quantities, and tariffs.</p>
              </div>
              <button onClick={handleOpenAddRoom} className="btn btn-primary">
                <Plus size={16} /> Add Room Category
              </button>
            </div>

            <div className="table-responsive">
              <table className="syn-table">
                <thead>
                  <tr>
                    <th>Room ID</th>
                    <th>Room Name & Category</th>
                    <th>AC Type</th>
                    <th>Price / Night</th>
                    <th>Capacity</th>
                    <th>Inventory Qty</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r) => (
                    <tr key={r.room_id}>
                      <td><strong>{r.room_id}</strong></td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{r.room_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.room_type}</div>
                      </td>
                      <td>
                        <span className={`badge ${r.ac_status === 'AC' ? 'badge-primary' : 'badge-warning'}`}>
                          {r.ac_status}
                        </span>
                      </td>
                      <td><strong>₹{r.price?.toLocaleString('en-IN')}</strong></td>
                      <td>{r.capacity} Guests</td>
                      <td>{r.total_quantity} Rooms</td>
                      <td>
                        <span className={`badge ${r.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleOpenEditRoom(r)} className="btn btn-secondary btn-sm" title="Edit room">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDeleteRoom(r.room_id)} className="btn btn-danger btn-sm" title="Delete room">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>Review Moderation</h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Approve or reject reviews before they appear on the public portal.</p>
            </div>

            <div className="table-responsive">
              <table className="syn-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Room Stayed</th>
                    <th>Rating</th>
                    <th>Review Comment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((rev) => (
                    <tr key={rev.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{rev.guest_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rev.city} • {rev.date}</div>
                      </td>
                      <td>{rev.room_type}</td>
                      <td>
                        <div style={{ display: 'flex', color: '#C58940' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < Math.floor(rev.rating) ? '#C58940' : 'none'} color="#C58940" />
                          ))}
                        </div>
                      </td>
                      <td style={{ maxWidth: '300px', fontSize: '0.85rem' }}>{rev.comment}</td>
                      <td>
                        <span className={`badge ${rev.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                          {rev.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {rev.status !== 'approved' && (
                            <button
                              onClick={() => handleApproveReview(rev.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--success)' }}
                              title="Approve Review"
                            >
                              <Check size={14} /> Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="btn btn-danger btn-sm"
                            title="Delete Review"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: DEVOTEE CUSTOMER ACCOUNTS */}
        {activeTab === 'customers' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>Registered Devotee Accounts</h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Guest users with personal accounts.</p>
            </div>

            <div className="table-responsive">
              <table className="syn-table">
                <thead>
                  <tr>
                    <th>Customer ID</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>City</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.id}</strong></td>
                      <td><div style={{ fontWeight: 700 }}>{c.name}</div></td>
                      <td>{c.mobile}</td>
                      <td>{c.email}</td>
                      <td>{c.city}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(c.created_at || Date.now()).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: PRICING & INVENTORY MANAGEMENT */}
        {activeTab === 'pricing' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Sliders size={26} color="var(--primary)" /> Pricing & Inventory Management
                </h1>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Full role-based authority to dynamically override room tariffs, extra guest rules, and live property room counts.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span className="badge badge-success" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
                  <CheckCircle2 size={15} style={{ marginRight: '5px' }} /> Dynamic Sync Active
                </span>
              </div>
            </div>

            <form onSubmit={handleSavePricing}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                
                {/* 1. Room Base Rates */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>Room Base Rates</h3>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tariff per night for up to 2 persons</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ justifyContent: 'space-between' }}>
                        <span>AC Room Base Tariff (₹/night)</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 600 }}>Standard Capacity: 2</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        required
                        className="form-control"
                        value={pricingForm.base_rates?.AC || 2400}
                        onChange={(e) => setPricingForm({
                          ...pricingForm,
                          base_rates: { ...pricingForm.base_rates, AC: parseFloat(e.target.value) || 0 }
                        })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ justifyContent: 'space-between' }}>
                        <span>Non-AC Room Base Tariff (₹/night)</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 600 }}>Standard Capacity: 2</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        required
                        className="form-control"
                        value={pricingForm.base_rates?.["Non-AC"] || 1400}
                        onChange={(e) => setPricingForm({
                          ...pricingForm,
                          base_rates: { ...pricingForm.base_rates, "Non-AC": parseFloat(e.target.value) || 0 }
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Occupancy & Extra Person Rules */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--gold-light)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>Extra Guest & Child Policy</h3>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Occupancy limits and extra charges</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ justifyContent: 'space-between' }}>
                        <span>Extra Person Surcharge (₹/person/night)</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>Adults / Kids &gt; 4y</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        required
                        className="form-control"
                        value={pricingForm.extra_person_rate || 700}
                        onChange={(e) => setPricingForm({
                          ...pricingForm,
                          extra_person_rate: parseFloat(e.target.value) || 0
                        })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ justifyContent: 'space-between' }}>
                        <span>Child Free Age Limit (Years)</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>Free of Charge</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="12"
                        required
                        className="form-control"
                        value={pricingForm.child_age_free_limit ?? 4}
                        onChange={(e) => setPricingForm({
                          ...pricingForm,
                          child_age_free_limit: parseInt(e.target.value, 10) || 0
                        })}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Info size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <span>Max room occupancy is <strong>4 persons</strong>. Children aged 0–{pricingForm.child_age_free_limit} stay free.</span>
                  </div>
                </div>

                {/* 3. Room Inventory & Availability */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BedDouble size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>Inventory Configuration</h3>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>5 Total Rooms Available</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                    {/* AC Rooms Inventory */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem', alignItems: 'flex-end' }}>
                      <div className="form-group">
                        <label className="form-label">AC Rooms Count</label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          required
                          className="form-control"
                          value={pricingForm.inventory?.AC?.total_rooms ?? 3}
                          onChange={(e) => setPricingForm({
                            ...pricingForm,
                            inventory: {
                              ...pricingForm.inventory,
                              AC: {
                                ...pricingForm.inventory?.AC,
                                total_rooms: parseInt(e.target.value, 10) || 0
                              }
                            }
                          })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">AC Status</label>
                        <select
                          className="form-control"
                          value={pricingForm.inventory?.AC?.active !== false ? 'active' : 'inactive'}
                          onChange={(e) => setPricingForm({
                            ...pricingForm,
                            inventory: {
                              ...pricingForm.inventory,
                              AC: {
                                ...pricingForm.inventory?.AC,
                                active: e.target.value === 'active'
                              }
                            }
                          })}
                        >
                          <option value="active">Active (Live)</option>
                          <option value="inactive">Inactive (Off)</option>
                        </select>
                      </div>
                    </div>

                    {/* Non-AC Rooms Inventory */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem', alignItems: 'flex-end' }}>
                      <div className="form-group">
                        <label className="form-label">Non-AC Rooms Count</label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          required
                          className="form-control"
                          value={pricingForm.inventory?.["Non-AC"]?.total_rooms ?? 2}
                          onChange={(e) => setPricingForm({
                            ...pricingForm,
                            inventory: {
                              ...pricingForm.inventory,
                              "Non-AC": {
                                ...pricingForm.inventory?.["Non-AC"],
                                total_rooms: parseInt(e.target.value, 10) || 0
                              }
                            }
                          })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Non-AC Status</label>
                        <select
                          className="form-control"
                          value={pricingForm.inventory?.["Non-AC"]?.active !== false ? 'active' : 'inactive'}
                          onChange={(e) => setPricingForm({
                            ...pricingForm,
                            inventory: {
                              ...pricingForm.inventory,
                              "Non-AC": {
                                ...pricingForm.inventory?.["Non-AC"],
                                active: e.target.value === 'active'
                              }
                            }
                          })}
                        >
                          <option value="active">Active (Live)</option>
                          <option value="inactive">Inactive (Off)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 600 }}>Total Property Inventory:</span>
                    <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>
                      {(pricingForm.inventory?.AC?.total_rooms || 0) + (pricingForm.inventory?.["Non-AC"]?.total_rooms || 0)} Rooms
                    </strong>
                  </div>
                </div>

              </div>

              {/* Save Button Action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-gold)', boxShadow: 'var(--shadow-md)', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>Save &amp; Broadcast Pricing Updates</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Changes immediately reflect on user booking calculation, invoices, and room cards.
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSavingPricing}
                  className="btn btn-primary btn-lg"
                  style={{ minWidth: '220px', justifyContent: 'center' }}
                >
                  <Save size={18} />
                  <span>{isSavingPricing ? 'Saving Settings...' : 'Save Pricing Settings'}</span>
                </button>
              </div>
            </form>

            {/* 4. Pricing Audit Logs */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                <History size={20} color="var(--primary)" />
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>Pricing &amp; Inventory Audit Logs</h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Traceability record of who modified tariffs and inventory</div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="syn-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Admin User</th>
                      <th>Changes &amp; Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(pricingConfig.audit_logs || []).map((log) => (
                      <tr key={log.id || log.timestamp}>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {new Date(log.timestamp).toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span className="badge badge-primary" style={{ fontSize: '0.78rem' }}>
                            <User size={12} style={{ marginRight: '4px' }} /> {log.modified_by || 'Admin'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                          {log.action}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ADD / EDIT ROOM MODAL */}
      {roomModalOpen && (
        <div className="modal-overlay" onClick={() => setRoomModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.3rem' }}>
                {editingRoom ? 'Edit Room Category' : 'Add New Room Category'}
              </h2>
              <button onClick={() => setRoomModalOpen(false)} style={{ padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveRoom}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Room Title *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={roomFormData.room_name}
                    onChange={(e) => setRoomFormData({ ...roomFormData, room_name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category Type</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={roomFormData.room_type}
                      onChange={(e) => setRoomFormData({ ...roomFormData, room_type: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">AC / Non-AC</label>
                    <select
                      className="form-control"
                      value={roomFormData.ac_status}
                      onChange={(e) => setRoomFormData({ ...roomFormData, ac_status: e.target.value })}
                    >
                      <option value="AC">AC</option>
                      <option value="Non-AC">Non-AC</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nightly Rate (₹) *</label>
                    <input
                      type="number"
                      required
                      min={100}
                      className="form-control"
                      value={roomFormData.price}
                      onChange={(e) => setRoomFormData({ ...roomFormData, price: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Capacity *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      className="form-control"
                      value={roomFormData.capacity}
                      onChange={(e) => setRoomFormData({ ...roomFormData, capacity: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Units *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      className="form-control"
                      value={roomFormData.total_quantity}
                      onChange={(e) => setRoomFormData({ ...roomFormData, total_quantity: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    value={roomFormData.description}
                    onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setRoomModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
