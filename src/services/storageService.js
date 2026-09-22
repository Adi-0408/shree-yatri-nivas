import { DEFAULT_ROOMS, DEFAULT_BOOKINGS, DEFAULT_REVIEWS, DEFAULT_CUSTOMERS } from './seedData';

const STORAGE_KEYS = {
  ROOMS: "syn_rooms_v1",
  BOOKINGS: "syn_bookings_v1",
  REVIEWS: "syn_reviews_v1",
  ADMIN_LOGGED_IN: "syn_admin_auth_v1",
  CUSTOMERS: "syn_customers_v1",
  CURRENT_CUSTOMER: "syn_current_customer_v1"
};

export const StorageService = {
  init() {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(DEFAULT_ROOMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(DEFAULT_BOOKINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(DEFAULT_REVIEWS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(DEFAULT_CUSTOMERS));
    }
  },

  // Rooms CRUD
  getRooms(includeInactive = false) {
    this.init();
    try {
      const rooms = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS) || "[]");
      return includeInactive ? rooms : rooms.filter(r => r.status === "active");
    } catch {
      return DEFAULT_ROOMS;
    }
  },

  getRoomById(id) {
    const rooms = this.getRooms(true);
    return rooms.find(r => r.room_id === id) || null;
  },

  saveRoom(roomData) {
    const rooms = this.getRooms(true);
    const existingIndex = rooms.findIndex(r => r.room_id === roomData.room_id);
    if (existingIndex >= 0) {
      rooms[existingIndex] = { ...rooms[existingIndex], ...roomData, updated_at: new Date().toISOString() };
    } else {
      const newId = roomData.room_id || `SYN-RM-${100 + rooms.length + 1}`;
      const defaultAmenities = [
        "Free High-Speed Wi-Fi",
        "24/7 Hot Water Geyser",
        "Daily Housekeeping",
        "Purified RO Drinking Water"
      ];
      rooms.push({
        amenities: defaultAmenities,
        badge: "Popular Stay",
        rating: 4.8,
        reviews_count: 12,
        images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"],
        ...roomData,
        room_id: newId,
        available_quantity: parseInt(roomData.total_quantity, 10) || 5,
        created_at: new Date().toISOString()
      });
    }
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    return true;
  },

  deleteRoom(id) {
    let rooms = this.getRooms(true);
    rooms = rooms.filter(r => r.room_id !== id);
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  },

  // Availability calculation (Prevents double booking across overlapping dates)
  checkRoomAvailability(roomId, checkInDateStr, checkOutDateStr, requestedQty = 1) {
    const room = this.getRoomById(roomId);
    if (!room || room.status !== "active") {
      return { available: false, remainingQty: 0, reason: "Room not found or inactive" };
    }

    if (!checkInDateStr || !checkOutDateStr) {
      return { available: room.total_quantity >= requestedQty, remainingQty: room.total_quantity };
    }

    const checkIn = new Date(checkInDateStr).getTime();
    const checkOut = new Date(checkOutDateStr).getTime();

    if (isNaN(checkIn) || isNaN(checkOut) || checkOut <= checkIn) {
      return { available: false, remainingQty: 0, reason: "Invalid date range" };
    }

    const bookings = this.getBookings();
    let bookedRoomsCount = 0;
    bookings.forEach(b => {
      if (b.room_id === roomId && b.booking_status !== "Cancelled") {
        const bIn = new Date(b.check_in).getTime();
        const bOut = new Date(b.check_out).getTime();
        if (bIn < checkOut && bOut > checkIn) {
          bookedRoomsCount += parseInt(b.room_quantity || 1, 10);
        }
      }
    });

    const remaining = Math.max(0, (room.total_quantity || 1) - bookedRoomsCount);
    return {
      available: remaining >= requestedQty,
      remainingQty: remaining,
      totalQty: room.total_quantity,
      bookedQty: bookedRoomsCount
    };
  },

  // Bookings CRUD
  getBookings() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || "[]");
    } catch {
      return DEFAULT_BOOKINGS;
    }
  },

  getBookingById(id) {
    const bookings = this.getBookings();
    return bookings.find(b => b.booking_id === id || b.booking_reference === id) || null;
  },

  generateBookingReference() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const count = this.getBookings().length + 1;
    const seq = String(count).padStart(3, "0");
    return `SYN-${year}${month}${day}-${seq}`;
  },

  createBooking(bookingData) {
    const check = this.checkRoomAvailability(
      bookingData.room_id,
      bookingData.check_in,
      bookingData.check_out,
      bookingData.room_quantity
    );

    if (!check.available) {
      throw new Error(`Sorry, only ${check.remainingQty} room(s) available for the selected dates. Please adjust dates or quantity.`);
    }

    const ref = this.generateBookingReference();
    const newBooking = {
      ...bookingData,
      booking_id: ref,
      booking_reference: ref,
      payment_method: bookingData.payment_method || "Pay at Property",
      payment_status: bookingData.payment_status || "Pending",
      booking_status: "Confirmed",
      created_at: new Date().toISOString()
    };

    const bookings = this.getBookings();
    bookings.unshift(newBooking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return newBooking;
  },

  updateBookingStatus(bookingId, newStatus) {
    const bookings = this.getBookings();
    const b = bookings.find(item => item.booking_id === bookingId);
    if (b) {
      b.booking_status = newStatus;
      b.updated_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      return true;
    }
    return false;
  },

  updatePaymentStatus(bookingId, newPaymentStatus) {
    const bookings = this.getBookings();
    const b = bookings.find(item => item.booking_id === bookingId);
    if (b) {
      b.payment_status = newPaymentStatus;
      b.updated_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      return true;
    }
    return false;
  },

  // Reviews CRUD
  getReviews(includePending = false) {
    this.init();
    try {
      const reviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || "[]");
      return includePending ? reviews : reviews.filter(r => r.status === "approved");
    } catch {
      return DEFAULT_REVIEWS;
    }
  },

  addReview(reviewData) {
    const reviews = this.getReviews(true);
    const newReview = {
      id: `REV-${Date.now()}`,
      guest_name: reviewData.guest_name,
      city: reviewData.city || "Guest",
      rating: parseFloat(reviewData.rating) || 5,
      date: new Date().toISOString().split("T")[0],
      room_type: reviewData.room_type || "Deluxe AC Family Suite",
      comment: reviewData.comment,
      status: "pending" // Admin moderation workflow
    };
    reviews.unshift(newReview);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    return newReview;
  },

  approveReview(id) {
    const reviews = this.getReviews(true);
    const r = reviews.find(item => item.id === id);
    if (r) {
      r.status = "approved";
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
      return true;
    }
    return false;
  },

  deleteReview(id) {
    let reviews = this.getReviews(true);
    reviews = reviews.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  },

  // Admin Auth
  isAdminLoggedIn() {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_LOGGED_IN) === "true";
  },

  adminLogin(username, password) {
    if (username.trim() === "admin" && password.trim() === "admin123") {
      localStorage.setItem(STORAGE_KEYS.ADMIN_LOGGED_IN, "true");
      return true;
    }
    return false;
  },

  adminLogout() {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_LOGGED_IN);
  },

  // Customer Authentication
  getCustomers() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || "[]");
    } catch {
      return DEFAULT_CUSTOMERS;
    }
  },

  getCurrentCustomer() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_CUSTOMER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  isCustomerLoggedIn() {
    return this.getCurrentCustomer() !== null;
  },

  customerLogin(identifier, password) {
    const customers = this.getCustomers();
    const idClean = (identifier || "").trim().toLowerCase();
    const passClean = (password || "").trim();

    if (!idClean || !passClean) {
      return { success: false, message: "Please enter your email or mobile number and password." };
    }

    const digitsOnly = idClean.replace(/\D/g, "");
    const customer = customers.find(c => {
      const emailMatch = c.email && c.email.toLowerCase() === idClean;
      const mobileMatch = digitsOnly.length >= 10 && c.mobile && c.mobile.replace(/\D/g, "") === digitsOnly;
      return (emailMatch || mobileMatch) && c.password === passClean;
    });

    if (customer) {
      const sessionData = {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        mobile: customer.mobile,
        city: customer.city || "Guest"
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_CUSTOMER, JSON.stringify(sessionData));
      return { success: true, customer: sessionData };
    }
    return { success: false, message: "Invalid email/mobile or password. Please check credentials or register." };
  },

  customerRegister(data) {
    const customers = this.getCustomers();
    const emailClean = (data.email || "").trim().toLowerCase();
    const phoneClean = (data.mobile || "").trim().replace(/\D/g, "");

    if (!data.name || !emailClean || !phoneClean || !data.password) {
      return { success: false, message: "Please fill in all required registration fields." };
    }

    if (data.password.trim().length < 4) {
      return { success: false, message: "Password must be at least 4 characters." };
    }

    const exists = customers.some(c => 
      (c.email && c.email.toLowerCase() === emailClean) || 
      (phoneClean.length >= 10 && c.mobile && c.mobile.replace(/\D/g, "") === phoneClean)
    );

    if (exists) {
      return { success: false, message: "An account with this email or mobile number already exists. Please log in." };
    }

    const newCustomer = {
      id: `CUST-${Date.now()}`,
      name: data.name.trim(),
      email: emailClean,
      mobile: data.mobile.trim(),
      password: data.password.trim(),
      city: data.city ? data.city.trim() : "Pandharpur Devotee",
      created_at: new Date().toISOString()
    };

    customers.push(newCustomer);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));

    const sessionData = {
      id: newCustomer.id,
      name: newCustomer.name,
      email: newCustomer.email,
      mobile: newCustomer.mobile,
      city: newCustomer.city
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_CUSTOMER, JSON.stringify(sessionData));
    return { success: true, customer: sessionData };
  },

  customerLogout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CUSTOMER);
  },

  // Admin Dashboard Statistics
  getDashboardStats() {
    const rooms = this.getRooms(true);
    const bookings = this.getBookings();
    const reviews = this.getReviews(true);

    const totalRooms = rooms.reduce((acc, r) => acc + (parseInt(r.total_quantity, 10) || 1), 0);
    const totalBookings = bookings.length;

    const todayStr = new Date().toISOString().split("T")[0];
    const todayCheckIns = bookings.filter(b => b.check_in === todayStr && b.booking_status !== "Cancelled").length;
    const todayCheckOuts = bookings.filter(b => b.check_out === todayStr && b.booking_status !== "Cancelled").length;
    const upcomingBookings = bookings.filter(b => b.check_in >= todayStr && b.booking_status !== "Cancelled").length;

    const totalRevenue = bookings
      .filter(b => b.payment_status === "Paid" && b.booking_status !== "Cancelled")
      .reduce((acc, b) => acc + (b.total_amount || 0), 0);

    const pendingPayments = bookings
      .filter(b => b.payment_status === "Pending" && b.booking_status !== "Cancelled")
      .reduce((acc, b) => acc + (b.total_amount || 0), 0);

    const pendingReviewsCount = reviews.filter(r => r.status === "pending").length;

    return {
      totalRooms,
      totalBookings,
      todayCheckIns,
      todayCheckOuts,
      upcomingBookings,
      totalRevenue,
      pendingPayments,
      pendingReviewsCount
    };
  },

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(DEFAULT_ROOMS));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(DEFAULT_BOOKINGS));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(DEFAULT_REVIEWS));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(DEFAULT_CUSTOMERS));
    return true;
  }
};
