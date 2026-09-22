import React, { useState, useEffect, useMemo } from 'react';
import { StorageService } from '../services/storageService';
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
  Sparkles
} from 'lucide-react';

export const Admin = () => {
  const { isAdminLoggedIn, loginAdmin, logoutAdmin } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  // Admin login form state
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  // Active Tab: 'dashboard' | 'bookings' | 'rooms' | 'reviews' | 'customers'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data State
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);

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

  // LOGIN SCREEN
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
                          style={{ fontSize: '0.75rem', padding: '2px 4px', borderRadius: '4px', marginTop: '4px' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={b.booking_status}
                          onChange={(e) => handleUpdateBookingStatus(b.booking_id, e.target.value)}
                          style={{ fontSize: '0.8rem', padding: '4px 6px', borderRadius: '4px', fontWeight: 600 }}
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
