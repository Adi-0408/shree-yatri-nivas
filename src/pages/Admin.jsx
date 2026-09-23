import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { PricingService } from '../services/pricingService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  ShieldAlert, 
  ShieldCheck,
  Lock, 
  User, 
  UserPlus,
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
  Info,
  Calendar,
  CalendarRange,
  Cloud,
  RefreshCw,
  Eye,
  EyeOff,
  Key
} from 'lucide-react';
import { CustomSelect } from '../components/CustomSelect';

export const Admin = ({ initialTab }) => {
  const { 
    customer, 
    isAdminLoggedIn, 
    loginCustomer, 
    loginAdmin, 
    logoutAdmin, 
    logoutCustomer, 
    openAuthModal, 
    updateAdminCredentials, 
    createStaff, 
    deleteStaff 
  } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const location = useLocation();
  const params = useParams();

  // Admin login form state
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  // Active Tab: 'dashboard' | 'bookings' | 'rooms' | 'pricing' | 'reviews' | 'customers' | 'staff'
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

  // Staff & Administrator Credentials State
  const [adminConfig, setAdminConfig] = useState(StorageService.getAdminConfig());
  const [staffList, setStaffList] = useState(StorageService.getStaffList());
  const [adminEmailForm, setAdminEmailForm] = useState({
    name: StorageService.getAdminConfig().name || 'Front Desk Administrator',
    email: StorageService.getAdminConfig().email || 'admin@gmail.com',
    password: StorageService.getAdminConfig().password || '1234'
  });
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(false);

  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff'
  });
  const [showNewStaffPass, setShowNewStaffPass] = useState(false);
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);

  // Search & Filter state
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');

  // Room Modal state (Create / Edit)
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  useEffect(() => {
    if (!roomModalOpen) return;
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [roomModalOpen]);
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
    const aConfig = StorageService.getAdminConfig();
    setAdminConfig(aConfig);
    setAdminEmailForm({
      name: aConfig.name || 'Front Desk Administrator',
      email: aConfig.email || 'admin@gmail.com',
      password: aConfig.password || '1234'
    });
    setStaffList(StorageService.getStaffList());
  };

  const [syncingCloud, setSyncingCloud] = useState(false);

  const handleCloudSync = async () => {
    setSyncingCloud(true);
    try {
      const res = await StorageService.syncAllToFirebase();
      if (res.success) {
        showSuccess(res.message);
      } else {
        showError(res.message || 'Cloud synchronization failed.');
      }
    } catch (err) {
      showError(err.message || 'Error during cloud sync.');
    } finally {
      setSyncingCloud(false);
      reloadData();
    }
  };

  useEffect(() => {
    reloadData();
    const handleSync = () => reloadData();
    window.addEventListener('syn_pricing_updated', handleSync);
    window.addEventListener('syn_rooms_updated', handleSync);
    window.addEventListener('syn_bookings_updated', handleSync);
    window.addEventListener('syn_reviews_updated', handleSync);
    window.addEventListener('syn_staff_updated', handleSync);
    window.addEventListener('syn_admin_config_updated', handleSync);
    return () => {
      window.removeEventListener('syn_pricing_updated', handleSync);
      window.removeEventListener('syn_rooms_updated', handleSync);
      window.removeEventListener('syn_bookings_updated', handleSync);
      window.removeEventListener('syn_reviews_updated', handleSync);
      window.removeEventListener('syn_staff_updated', handleSync);
      window.removeEventListener('syn_admin_config_updated', handleSync);
    };
  }, [isAdminLoggedIn]);

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

  // Date-Range / 15-Day Rate Override Form State
  const [dateRangeForm, setDateRangeForm] = useState({
    name: '',
    start_date: '',
    end_date: '',
    ac_rate: 3200,
    non_ac_rate: 1800,
    extra_person_rate: 850
  });

  const handleQuick15Days = () => {
    const today = new Date();
    const startStr = dateRangeForm.start_date || today.toISOString().split('T')[0];
    const startDateObj = new Date(startStr);
    const endDateObj = new Date(startDateObj.getTime() + 15 * 24 * 60 * 60 * 1000);
    setDateRangeForm(prev => ({
      ...prev,
      start_date: startStr,
      end_date: endDateObj.toISOString().split('T')[0]
    }));
  };

  const handleSaveDateRangeRate = (e) => {
    e.preventDefault();
    if (!dateRangeForm.start_date || !dateRangeForm.end_date) {
      showError('Please select both start and end dates.');
      return;
    }
    if (dateRangeForm.end_date < dateRangeForm.start_date) {
      showError('End date must be after or equal to start date.');
      return;
    }
    try {
      StorageService.saveDateRangeRate({
        ...dateRangeForm,
        name: dateRangeForm.name.trim() || 'Seasonal Rate Period',
        rates: {
          AC: parseFloat(dateRangeForm.ac_rate) || 2400,
          "Non-AC": parseFloat(dateRangeForm.non_ac_rate) || 1400
        },
        extra_person_rate: parseFloat(dateRangeForm.extra_person_rate) || 700
      }, 'Admin');
      showSuccess(`Date-range rate rule '${dateRangeForm.name || 'Seasonal Rate'}' saved successfully!`);
      setDateRangeForm({
        name: '',
        start_date: '',
        end_date: '',
        ac_rate: pricingForm.base_rates?.AC || 2400,
        non_ac_rate: pricingForm.base_rates?.["Non-AC"] || 1400,
        extra_person_rate: pricingForm.extra_person_rate || 700
      });
      reloadData();
    } catch (err) {
      showError(err.message || 'Failed to save date-range rate.');
    }
  };

  const handleDeleteDateRangeRate = (id) => {
    if (window.confirm('Remove this date-range rate rule? Outside these dates, standard tariffs apply.')) {
      StorageService.deleteDateRangeRate(id, 'Admin');
      showInfo('Date-range rate rule removed.');
      reloadData();
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      reloadData();
    }
  }, [isAdminLoggedIn]);

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    const res = await loginCustomer(adminUser, adminPass);
    if (res && res.success) {
      reloadData();
    }
  };

  // Staff & Admin Credentials Handlers
  const handleUpdateAdminProfile = (e) => {
    e.preventDefault();
    if (!adminEmailForm.email || !adminEmailForm.password) {
      showError('Please provide both administrator email and password.');
      return;
    }
    setIsUpdatingAdmin(true);
    try {
      const res = updateAdminCredentials({
        name: adminEmailForm.name,
        email: adminEmailForm.email,
        password: adminEmailForm.password
      });
      if (res && res.success) {
        setAdminConfig(res.config);
      }
    } catch (err) {
      showError(err.message || 'Failed to update admin credentials.');
    } finally {
      setIsUpdatingAdmin(false);
    }
  };

  const handleCreateStaff = (e) => {
    e.preventDefault();
    if (!newStaffForm.name || !newStaffForm.email || !newStaffForm.password) {
      showError('Please provide staff name, email, and password.');
      return;
    }
    setIsCreatingStaff(true);
    try {
      const res = createStaff({
        name: newStaffForm.name,
        email: newStaffForm.email,
        password: newStaffForm.password,
        role: newStaffForm.role
      });
      if (res && res.success) {
        setNewStaffForm({
          name: '',
          email: '',
          password: '',
          role: 'staff'
        });
        setStaffList(StorageService.getStaffList());
      }
    } catch (err) {
      showError(err.message || 'Failed to create staff account.');
    } finally {
      setIsCreatingStaff(false);
    }
  };

  const handleDeleteStaffMember = (id, name) => {
    if (window.confirm(`Are you sure you want to revoke access and delete staff account for ${name}?`)) {
      deleteStaff(id);
      setStaffList(StorageService.getStaffList());
    }
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

  // AUTH GUARD: For unauthenticated users or non-staff devotees
  if (!isAdminLoggedIn) {
    return (
      <div className="admin-login-wrapper syn-main-content">
        <div className="admin-login-card">
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldAlert size={32} />
            </div>
            <h1 style={{ fontSize: '1.6rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Staff &amp; Admin Portal
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              HOTEL VIHANN INN Management &amp; Access Control
            </p>
          </div>

          {customer && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', padding: '0.85rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#991B1B' }}>
              Currently authenticated as devotee <strong>{customer.name || customer.email}</strong>. Administrative privileges are required to view this dashboard.
            </div>
          )}

          <div style={{ backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.5rem', border: '1px solid var(--border-light)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.2rem' }}>
              <Info size={15} /> Unified Portal Access
            </div>
            Sign in using your administrator or staff credentials. You can also sign in directly via the website header login.
          </div>

          <form onSubmit={handleAdminLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div className="form-group">
              <label className="form-label">
                <User size={15} color="var(--primary)" /> Email Address
              </label>
              <input
                type="email"
                required
                placeholder="admin@gmail.com"
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
                placeholder="••••••••"
                className="form-control"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}>
              Sign In to Management Portal
            </button>

            <div style={{ textAlign: 'center', margin: '0.35rem 0' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>— or —</span>
            </div>

            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Sign In via Website Public Login
            </button>
          </form>

          {customer && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
              <button
                type="button"
                onClick={logoutCustomer}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Sign Out from Devotee Account
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="admin-layout syn-main-content">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} color="var(--primary)" />
              <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>ADMIN PORTAL</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Front Desk &amp; Tariffs</div>

            {/* Cloud Firestore Live Status */}
            <div className="admin-status-pill">
              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#15803D', display: 'inline-block' }} />
              <span>Firebase: hotel-fad04 (Live)</span>
            </div>
          </div>

          {/* Quick Actions Toolbar for Mobile View */}
          <div className="admin-sidebar-actions-mobile">
            <button
              onClick={handleCloudSync}
              disabled={syncingCloud}
              className="btn btn-secondary btn-sm"
              title="Sync all local data to Cloud Firestore"
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}
            >
              <Cloud size={14} color="var(--primary)" />
              <span>{syncingCloud ? 'Syncing...' : 'Sync'}</span>
            </button>
            <button
              onClick={logoutAdmin}
              className="btn btn-danger btn-sm"
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}
              title="Sign Out Admin"
            >
              <LogOut size={14} />
              <span>Exit</span>
            </button>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={16} /> Overview
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`admin-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
          >
            <CalendarCheck size={16} /> Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`admin-nav-item ${activeTab === 'rooms' ? 'active' : ''}`}
          >
            <BedDouble size={16} /> Rooms ({rooms.length})
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`admin-nav-item ${activeTab === 'pricing' ? 'active' : ''}`}
          >
            <Sliders size={16} /> Pricing
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`admin-nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
          >
            <Star size={16} /> Reviews {stats?.pendingReviewsCount > 0 && <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '2px 5px' }}>{stats.pendingReviewsCount}</span>}
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`admin-nav-item ${activeTab === 'customers' ? 'active' : ''}`}
          >
            <Users size={16} /> Devotees ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`admin-nav-item ${activeTab === 'staff' ? 'active' : ''}`}
          >
            <ShieldCheck size={16} /> Staff ({staffList.length})
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button
            onClick={handleCloudSync}
            disabled={syncingCloud}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'flex-start' }}
            title="Sync all local data to Cloud Firestore (hotel-fad04)"
          >
            <Cloud size={15} color="var(--primary)" />
            <span>{syncingCloud ? 'Syncing to Cloud...' : 'Sync to Firestore'}</span>
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
            <div className="admin-page-header">
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
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0 }}>Recent Reservations</h3>
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
                      <th style={{ textAlign: 'right' }}>Amount</th>
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
                        <td className="td-number">₹{b.total_amount?.toLocaleString('en-IN')}</td>
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
            <div className="admin-page-header">
              <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Bookings Management</h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Search, verify check-ins, and update payment status.</p>
            </div>

            {/* Filter controls */}
            <div className="admin-filter-bar">
              <div className="admin-filter-search">
                <input
                  type="text"
                  placeholder="Search by Guest Name, Mobile, or Ref ID..."
                  className="form-control"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                />
              </div>
              <div className="admin-filter-status">
                <CustomSelect
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Checked-in">Checked-in</option>
                  <option value="Checked-out">Checked-out</option>
                  <option value="Cancelled">Cancelled</option>
                </CustomSelect>
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
                        <CustomSelect
                          value={b.payment_status}
                          onChange={(e) => handleUpdatePaymentStatus(b.booking_id, e.target.value)}
                          triggerClassName={`table-status-select pay-${b.payment_status?.toLowerCase() || 'pending'}`}
                          style={{ marginTop: '6px' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                        </CustomSelect>
                      </td>
                      <td>
                        <CustomSelect
                          value={b.booking_status}
                          onChange={(e) => handleUpdateBookingStatus(b.booking_id, e.target.value)}
                          triggerClassName={`table-status-select status-${b.booking_status?.toLowerCase()?.replace(/\s+/g, '-') || 'confirmed'}`}
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Checked-in">Checked-in</option>
                          <option value="Checked-out">Checked-out</option>
                          <option value="Cancelled">Cancelled</option>
                        </CustomSelect>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            const text = `HOTEL VIHANN INN: Booking ${b.booking_reference} for ${b.guest_name}. Room: ${b.room_name}. Dates: ${b.check_in} to ${b.check_out}. Payable: Rs.${b.total_amount}.`;
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
            <div className="admin-page-header admin-page-header-flex">
              <div>
                <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Room Inventory &amp; Rates</h1>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage categories, room quantities, and tariffs.</p>
              </div>
              <button onClick={handleOpenAddRoom} className="btn btn-primary admin-header-btn">
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
            <div className="admin-page-header">
              <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Review Moderation</h1>
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
            <div className="admin-page-header">
              <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Registered Devotee Accounts</h1>
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
            <div className="admin-page-header admin-page-header-flex">
              <div>
                <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                  <Sliders size={26} color="var(--primary)" /> Pricing &amp; Inventory Management
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
              <div className="admin-pricing-grid">
                
                {/* 1. Room Base Rates */}
                <div className="admin-card">
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
                <div className="admin-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--gold-light)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>Extra Guest &amp; Child Policy</h3>
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
                <div className="admin-card">
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
                    <div className="admin-inventory-row">
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
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label className="form-label" style={{ marginBottom: 0 }}>AC Category Status</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '44px' }}>
                          <label className="syn-switch">
                            <input
                              type="checkbox"
                              checked={pricingForm.inventory?.AC?.active !== false}
                              onChange={(e) => setPricingForm({
                                ...pricingForm,
                                inventory: {
                                  ...pricingForm.inventory,
                                  AC: {
                                    ...pricingForm.inventory?.AC,
                                    active: e.target.checked
                                  }
                                }
                              })}
                            />
                            <span className="syn-switch-slider"></span>
                          </label>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: pricingForm.inventory?.AC?.active !== false ? 'var(--success)' : 'var(--text-muted)' }}>
                            {pricingForm.inventory?.AC?.active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Non-AC Rooms Inventory */}
                    <div className="admin-inventory-row">
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
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label className="form-label" style={{ marginBottom: 0 }}>Non-AC Category Status</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '44px' }}>
                          <label className="syn-switch">
                            <input
                              type="checkbox"
                              checked={pricingForm.inventory?.["Non-AC"]?.active !== false}
                              onChange={(e) => setPricingForm({
                                ...pricingForm,
                                inventory: {
                                  ...pricingForm.inventory,
                                  "Non-AC": {
                                    ...pricingForm.inventory?.["Non-AC"],
                                    active: e.target.checked
                                  }
                                }
                              })}
                            />
                            <span className="syn-switch-slider"></span>
                          </label>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: pricingForm.inventory?.["Non-AC"]?.active !== false ? 'var(--success)' : 'var(--text-muted)' }}>
                            {pricingForm.inventory?.["Non-AC"]?.active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
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
              <div className="admin-actions-card">
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>Save &amp; Broadcast Base Pricing Updates</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Standard tariff baseline changes immediately reflect on room cards and standard booking calculations.
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

            {/* 4. Date-Range Rate Overrides (15-Day / Seasonal Special Pricing) */}
            <div className="admin-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--gold-light)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CalendarRange size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: 0 }}>Date-Range &amp; 15-Day Rate Overrides</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Set special tariffs for specific periods (e.g., 15-day Ashadhi/Kartiki Ekadashi festivals). Standard baseline rates apply outside these dates.
                    </div>
                  </div>
                </div>
                <span className="badge-pill-surface" style={{ fontSize: '0.75rem' }}>
                  {(pricingConfig.date_range_rates || []).length} Active Rule{((pricingConfig.date_range_rates || []).length === 1) ? '' : 's'}
                </span>
              </div>

              {/* Form to Add New Date-Range Rule */}
              <form onSubmit={handleSaveDateRangeRate} style={{ backgroundColor: 'var(--bg-canvas)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} color="var(--primary)" /> Add New Date-Range Rate Rule (e.g. 15 Days at Once)
                </div>

                <div className="admin-date-range-grid">
                  <div className="form-group">
                    <label className="form-label">Period Name / Reason</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ashadhi Wari (15 Days)"
                      className="form-control"
                      value={dateRangeForm.name}
                      onChange={(e) => setDateRangeForm({ ...dateRangeForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      required
                      className="form-control"
                      value={dateRangeForm.start_date}
                      onChange={(e) => setDateRangeForm({ ...dateRangeForm, start_date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label className="form-label" style={{ margin: 0 }}>End Date</label>
                      <button
                        type="button"
                        onClick={handleQuick15Days}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: '0 4px',
                          textDecoration: 'underline'
                        }}
                        title="Calculate 15 days from start date"
                      >
                        ⚡ +15 Days
                      </button>
                    </div>
                    <input
                      type="date"
                      required
                      min={dateRangeForm.start_date}
                      className="form-control"
                      value={dateRangeForm.end_date}
                      onChange={(e) => setDateRangeForm({ ...dateRangeForm, end_date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">AC Rate (₹/nt)</label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      required
                      placeholder="e.g. 3200"
                      className="form-control"
                      value={dateRangeForm.ac_rate}
                      onChange={(e) => setDateRangeForm({ ...dateRangeForm, ac_rate: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Non-AC Rate (₹/nt)</label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      required
                      placeholder="e.g. 1800"
                      className="form-control"
                      value={dateRangeForm.non_ac_rate}
                      onChange={(e) => setDateRangeForm({ ...dateRangeForm, non_ac_rate: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Extra Person (₹/nt)</label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      required
                      placeholder="e.g. 850"
                      className="form-control"
                      value={dateRangeForm.extra_person_rate}
                      onChange={(e) => setDateRangeForm({ ...dateRangeForm, extra_person_rate: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary btn-sm admin-btn-block" style={{ minWidth: '180px', justifyContent: 'center' }}>
                    <Plus size={16} /> Save Date-Range Rule
                  </button>
                </div>
              </form>

              {/* Table of Configured Date-Range Rules */}
              {(pricingConfig.date_range_rates && pricingConfig.date_range_rates.length > 0) ? (
                <div className="table-responsive">
                  <table className="syn-table">
                    <thead>
                      <tr>
                        <th>Rule / Period</th>
                        <th>Date Interval</th>
                        <th style={{ textAlign: 'right' }}>AC Tariff</th>
                        <th style={{ textAlign: 'right' }}>Non-AC Tariff</th>
                        <th style={{ textAlign: 'right' }}>Extra Person</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricingConfig.date_range_rates.map((rule) => {
                        const start = new Date(rule.start_date).getTime();
                        const end = new Date(rule.end_date).getTime();
                        const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
                        return (
                          <tr key={rule.id}>
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{rule.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {rule.id}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{rule.start_date} to {rule.end_date}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                                {days} Day{days > 1 ? 's' : ''} Period
                              </div>
                            </td>
                            <td className="td-number" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                              ₹{(rule.rates?.AC || 0).toLocaleString('en-IN')}/nt
                            </td>
                            <td className="td-number" style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                              ₹{(rule.rates?.["Non-AC"] || 0).toLocaleString('en-IN')}/nt
                            </td>
                            <td className="td-number" style={{ fontWeight: 600 }}>
                              ₹{(rule.extra_person_rate || 700).toLocaleString('en-IN')}
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => handleDeleteDateRangeRate(rule.id)}
                                className="btn btn-danger btn-sm"
                                title="Remove date range rule"
                              >
                                <Trash2 size={14} /> Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.88rem', border: '1px dashed var(--border-light)' }}>
                  <Calendar size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.6, display: 'block' }} />
                  <div>No date-range rate overrides configured.</div>
                  <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                    All booking dates currently calculate using standard room tariffs (AC ₹{pricingForm.base_rates?.AC || 2400}, Non-AC ₹{pricingForm.base_rates?.["Non-AC"] || 1400}).
                  </div>
                </div>
              )}
            </div>

            {/* 5. Pricing Audit Logs */}
            <div className="admin-card">
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

        {/* TAB 6: STAFF & ACCESS CONTROL */}
        {activeTab === 'staff' && (
          <div>
            <div className="admin-page-header admin-page-header-flex">
              <div>
                <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                  <ShieldCheck size={26} color="var(--primary)" /> Staff &amp; Access Control
                </h1>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Manage master administrator credentials and provision staff accounts with dashboard access.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span className="badge badge-primary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
                  <Users size={15} style={{ marginRight: '6px' }} />
                  {staffList.length} Active Staff {staffList.length === 1 ? 'Member' : 'Members'}
                </span>
              </div>
            </div>

            <div className="admin-staff-grid">
              
              {/* Card 1: Master Admin Credentials */}
              <div className="admin-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Key size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>Master Admin Credentials</h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Change primary administrator email &amp; password</div>
                  </div>
                </div>

                <form onSubmit={handleUpdateAdminProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Admin Display Name</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={adminEmailForm.name}
                      onChange={(e) => setAdminEmailForm({ ...adminEmailForm, name: e.target.value })}
                      placeholder="Front Desk Administrator"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Admin Email Address</label>
                    <input
                      type="email"
                      required
                      className="form-control"
                      value={adminEmailForm.email}
                      onChange={(e) => setAdminEmailForm({ ...adminEmailForm, email: e.target.value })}
                      placeholder="admin@gmail.com"
                    />
                    <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Used to sign in through the public website sign-in or admin gate.
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Admin Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showAdminPass ? 'text' : 'password'}
                        required
                        className="form-control"
                        style={{ paddingRight: '2.5rem' }}
                        value={adminEmailForm.password}
                        onChange={(e) => setAdminEmailForm({ ...adminEmailForm, password: e.target.value })}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        title={showAdminPass ? 'Hide password' : 'Show password'}
                      >
                        {showAdminPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingAdmin}
                    className="btn btn-primary"
                    style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
                  >
                    <Save size={16} />
                    <span>{isUpdatingAdmin ? 'Updating Credentials...' : 'Save Administrator Credentials'}</span>
                  </button>
                </form>
              </div>

              {/* Card 2: Provision New Staff Member */}
              <div className="admin-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--gold-light)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>Provision Staff Account</h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Grant dashboard access to front desk personnel</div>
                  </div>
                </div>

                <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Staff Full Name *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={newStaffForm.name}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                      placeholder="e.g. Ramesh Kulkarni"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Staff Email Address *</label>
                    <input
                      type="email"
                      required
                      className="form-control"
                      value={newStaffForm.email}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                      placeholder="e.g. ramesh@hotelvihanninn.in"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assigned Login Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewStaffPass ? 'text' : 'password'}
                        required
                        className="form-control"
                        style={{ paddingRight: '2.5rem' }}
                        value={newStaffForm.password}
                        onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                        placeholder="Create a password for staff"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewStaffPass(!showNewStaffPass)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        title={showNewStaffPass ? 'Hide password' : 'Show password'}
                      >
                        {showNewStaffPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Access Level / Role</label>
                    <CustomSelect
                      value={newStaffForm.role}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
                    >
                      <option value="staff">Staff (Front Desk &amp; Booking Management)</option>
                      <option value="admin">Administrator (Full Access)</option>
                    </CustomSelect>
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingStaff}
                    className="btn btn-secondary"
                    style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', borderColor: 'var(--gold)', color: 'var(--primary)', fontWeight: 600 }}
                  >
                    <Plus size={16} color="var(--gold)" />
                    <span>{isCreatingStaff ? 'Creating Account...' : 'Create Staff Member'}</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Active Staff List Table */}
            <div className="admin-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Users size={20} color="var(--primary)" />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>Active Staff Accounts</h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Staff credentials provisioned for portal sign-in</div>
                  </div>
                </div>
              </div>

              {staffList.length > 0 ? (
                <div className="table-responsive">
                  <table className="syn-table">
                    <thead>
                      <tr>
                        <th>Staff Member</th>
                        <th>Email (Login Identifier)</th>
                        <th>Role</th>
                        <th>Password</th>
                        <th>Created Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {s.id}</div>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.email}</span>
                          </td>
                          <td>
                            <span className={`badge ${s.role === 'admin' ? 'badge-primary' : 'badge-warning'}`}>
                              {s.role === 'admin' ? 'Administrator' : 'Staff'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', backgroundColor: 'var(--bg-canvas)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                              {s.password}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {s.created_at ? new Date(s.created_at).toLocaleDateString('en-IN') : 'Recently'}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleDeleteStaffMember(s.id, s.name)}
                              className="btn btn-danger btn-sm"
                              title="Revoke staff account"
                            >
                              <Trash2 size={14} /> Revoke Access
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.88rem', border: '1px dashed var(--border-light)' }}>
                  <Users size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5, display: 'block' }} />
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>No staff accounts provisioned yet</div>
                  <div style={{ fontSize: '0.8rem', maxWidth: '420px', margin: '0 auto' }}>
                    Use the "Provision Staff Account" form above to create email and password credentials for front desk receptionists and staff members.
                  </div>
                </div>
              )}
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

                <div className="admin-room-form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                    <CustomSelect
                      value={roomFormData.ac_status}
                      onChange={(e) => setRoomFormData({ ...roomFormData, ac_status: e.target.value })}
                    >
                      <option value="AC">AC</option>
                      <option value="Non-AC">Non-AC</option>
                    </CustomSelect>
                  </div>
                </div>

                <div className="admin-room-form-grid-3col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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
              <div className="modal-footer admin-modal-footer">
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
