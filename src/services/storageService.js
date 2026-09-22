import { DEFAULT_ROOMS, DEFAULT_BOOKINGS, DEFAULT_REVIEWS, DEFAULT_CUSTOMERS, DEFAULT_PRICING_CONFIG } from './seedData.js';
import { db } from './firebase.js';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

function cleanForFirestore(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        cleaned[key] = cleanForFirestore(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

const STORAGE_KEYS = {
  ROOMS: "syn_rooms_v1",
  BOOKINGS: "syn_bookings_v1",
  REVIEWS: "syn_reviews_v1",
  ADMIN_LOGGED_IN: "syn_admin_auth_v1",
  CUSTOMERS: "syn_customers_v1",
  CURRENT_CUSTOMER: "syn_current_customer_v1",
  PRICING_CONFIG: "syn_pricing_config_v2",
  INQUIRIES: "syn_inquiries_v1"
};

export const StorageService = {
  firestoreInitialized: false,

  init() {
    if (typeof window === "undefined") return;
    const storedRooms = localStorage.getItem(STORAGE_KEYS.ROOMS);
    if (!storedRooms) {
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
    if (!localStorage.getItem(STORAGE_KEYS.PRICING_CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.PRICING_CONFIG, JSON.stringify(DEFAULT_PRICING_CONFIG));
    }

    // Initialize real-time Cloud Firestore synchronization
    this.initFirestore();
  },

  async initFirestore() {
    if (this.firestoreInitialized || typeof window === "undefined" || !db) return;
    this.firestoreInitialized = true;

    try {
      // 1. Sync & listen to pricing_config
      const pricingRef = doc(db, "settings", "pricing_config");
      onSnapshot(pricingRef, (docSnap) => {
        if (docSnap.exists()) {
          const cloudConfig = docSnap.data();
          localStorage.setItem(STORAGE_KEYS.PRICING_CONFIG, JSON.stringify(cloudConfig));
          window.dispatchEvent(new CustomEvent("syn_pricing_updated", { detail: cloudConfig }));
        } else {
          // Auto-seed pricing config to Firestore if empty
          const localConfig = this.getPricingConfig();
          setDoc(pricingRef, cleanForFirestore(localConfig)).catch(err => {
            console.warn("Firestore pricing auto-seed:", err.message);
          });
        }
      }, (err) => {
        console.warn("Firestore pricing listener:", err.message);
      });

      // 2. Sync & listen to rooms
      const roomsRef = collection(db, "rooms");
      onSnapshot(roomsRef, (snapshot) => {
        if (!snapshot.empty) {
          const cloudRooms = [];
          snapshot.forEach(d => cloudRooms.push({ ...d.data(), room_id: d.id }));
          localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(cloudRooms));
          window.dispatchEvent(new CustomEvent("syn_rooms_updated", { detail: cloudRooms }));
          window.dispatchEvent(new CustomEvent("syn_pricing_updated"));
        } else {
          // Auto-seed rooms to Firestore if empty
          const localRooms = this.getRooms(true);
          localRooms.forEach(room => {
            setDoc(doc(db, "rooms", room.room_id), cleanForFirestore(room)).catch(err => {
              console.warn("Firestore room auto-seed:", err.message);
            });
          });
        }
      }, (err) => {
        console.warn("Firestore rooms listener:", err.message);
      });

      // 3. Sync & listen to bookings
      const bookingsRef = collection(db, "bookings");
      onSnapshot(bookingsRef, (snapshot) => {
        if (!snapshot.empty) {
          const cloudBookings = [];
          snapshot.forEach(d => cloudBookings.push({ ...d.data(), booking_id: d.id }));
          cloudBookings.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(cloudBookings));
          window.dispatchEvent(new CustomEvent("syn_bookings_updated", { detail: cloudBookings }));
        } else {
          // Auto-seed initial bookings
          const localBookings = this.getBookings();
          localBookings.forEach(b => {
            setDoc(doc(db, "bookings", b.booking_id), cleanForFirestore(b)).catch(err => {
              console.warn("Firestore booking auto-seed:", err.message);
            });
          });
        }
      }, (err) => {
        console.warn("Firestore bookings listener:", err.message);
      });

      // 4. Sync & listen to reviews
      const reviewsRef = collection(db, "reviews");
      onSnapshot(reviewsRef, (snapshot) => {
        if (!snapshot.empty) {
          const cloudReviews = [];
          snapshot.forEach(d => cloudReviews.push({ ...d.data(), id: d.id }));
          localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(cloudReviews));
          window.dispatchEvent(new CustomEvent("syn_reviews_updated", { detail: cloudReviews }));
        } else {
          const localReviews = this.getReviews(true);
          localReviews.forEach(r => {
            setDoc(doc(db, "reviews", String(r.id)), cleanForFirestore(r)).catch(err => {
              console.warn("Firestore review auto-seed:", err.message);
            });
          });
        }
      }, (err) => {
        console.warn("Firestore reviews listener:", err.message);
      });
    } catch (err) {
      console.warn("Firestore initialization warning:", err.message);
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
    this.init();
    const rooms = this.getRooms(true);
    const existingIndex = rooms.findIndex(r => r.room_id === roomData.room_id);
    const parsedPrice = parseFloat(roomData.price) || 0;
    const parsedCapacity = parseInt(roomData.capacity, 10) || 4;
    const parsedQty = parseInt(roomData.total_quantity, 10) || 1;

    let savedRoom;
    if (existingIndex >= 0) {
      savedRoom = {
        ...rooms[existingIndex],
        ...roomData,
        price: parsedPrice,
        capacity: parsedCapacity,
        total_quantity: parsedQty,
        available_quantity: parsedQty,
        updated_at: new Date().toISOString()
      };
      rooms[existingIndex] = savedRoom;
    } else {
      const newId = roomData.room_id || `SYN-RM-${Date.now().toString().slice(-4)}`;
      const defaultAmenities = [
        "Free High-Speed Wi-Fi",
        "24/7 Hot Water Geyser",
        "Daily Housekeeping",
        "Purified RO Drinking Water"
      ];
      savedRoom = {
        amenities: defaultAmenities,
        badge: "Popular Stay",
        rating: 4.8,
        reviews_count: 12,
        images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"],
        ...roomData,
        room_id: newId,
        price: parsedPrice,
        capacity: parsedCapacity,
        total_quantity: parsedQty,
        available_quantity: parsedQty,
        created_at: new Date().toISOString()
      };
      rooms.push(savedRoom);
    }
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));

    // Persist room to Cloud Firestore
    if (db) {
      setDoc(doc(db, "rooms", savedRoom.room_id), cleanForFirestore(savedRoom), { merge: true }).catch(err => {
        console.warn("Firestore saveRoom error:", err.message);
      });
    }

    // Synchronize room updates into pricingConfig
    try {
      const config = this.getPricingConfig();
      const acKey = savedRoom.ac_status === "Non-AC" ? "Non-AC" : "AC";
      const updatedConfig = {
        ...config,
        base_rates: {
          ...config.base_rates,
          [acKey]: parsedPrice
        },
        inventory: {
          ...config.inventory,
          [acKey]: {
            total_rooms: parsedQty,
            active: savedRoom.status === "active"
          }
        },
        last_modified_at: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.PRICING_CONFIG, JSON.stringify(updatedConfig));

      // Persist updated pricing to Cloud Firestore
      if (db) {
        setDoc(doc(db, "settings", "pricing_config"), cleanForFirestore(updatedConfig), { merge: true }).catch(err => {
          console.warn("Firestore sync pricing error:", err.message);
        });
      }

      // Attempt async server sync if in dev environment
      if (typeof fetch !== "undefined") {
        fetch('/api/admin/pricing', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
          body: JSON.stringify({ ...updatedConfig, adminUser: "Admin" })
        }).catch(() => {});
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("syn_pricing_updated", { detail: updatedConfig }));
      }
    } catch {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("syn_pricing_updated"));
      }
    }

    return true;
  },

  deleteRoom(id) {
    let rooms = this.getRooms(true);
    rooms = rooms.filter(r => r.room_id !== id);
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));

    // Delete room from Cloud Firestore
    if (db) {
      deleteDoc(doc(db, "rooms", id)).catch(err => {
        console.warn("Firestore deleteRoom error:", err.message);
      });
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("syn_pricing_updated"));
    }
  },

  // Availability calculation (Prevents double booking across overlapping dates)
  checkRoomAvailability(roomId, checkInDateStr, checkOutDateStr, requestedQty = 1) {
    const room = this.getRoomById(roomId);
    if (!room || room.status !== "active") {
      return { available: false, remainingQty: 0, totalQty: 0, bookedQty: 0, reason: "Room not found or inactive" };
    }

    const config = this.getPricingConfig();
    const configQty = config.inventory?.[room.ac_status]?.total_rooms;
    const totalQty = typeof room.total_quantity === "number" && room.total_quantity > 0
      ? room.total_quantity
      : (typeof configQty === "number" ? configQty : 1);

    if (!checkInDateStr || !checkOutDateStr) {
      return { available: totalQty >= requestedQty, remainingQty: totalQty, totalQty, bookedQty: 0 };
    }

    const checkIn = new Date(checkInDateStr).getTime();
    const checkOut = new Date(checkOutDateStr).getTime();

    if (isNaN(checkIn) || isNaN(checkOut) || checkOut <= checkIn) {
      return { available: false, remainingQty: 0, totalQty, bookedQty: 0, reason: "Invalid date range" };
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

    const remaining = Math.max(0, totalQty - bookedRoomsCount);

    return {
      available: remaining >= requestedQty,
      remainingQty: remaining,
      totalQty,
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
    const currentCustomer = this.getCurrentCustomer();
    const isAdmin = this.isAdminLoggedIn();
    if (!currentCustomer && !isAdmin && !bookingData.is_admin_booking) {
      throw new Error("Devotee account required. Please sign in or register to complete your reservation.");
    }

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
      customer_id: bookingData.customer_id || currentCustomer?.id || currentCustomer?.mobile || currentCustomer?.email || 'DEVOTEE',
      customer_name: bookingData.customer_name || currentCustomer?.name || bookingData.guest_name,
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

    // Persist booking to Cloud Firestore
    if (db) {
      setDoc(doc(db, "bookings", newBooking.booking_id), cleanForFirestore(newBooking), { merge: true }).catch(err => {
        console.warn("Firestore createBooking error:", err.message);
      });
    }

    return newBooking;
  },

  updateBookingStatus(bookingId, newStatus) {
    const bookings = this.getBookings();
    const b = bookings.find(item => item.booking_id === bookingId);
    if (b) {
      b.booking_status = newStatus;
      b.updated_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

      // Update in Cloud Firestore
      if (db) {
        updateDoc(doc(db, "bookings", bookingId), {
          booking_status: newStatus,
          updated_at: b.updated_at
        }).catch(err => {
          console.warn("Firestore updateBookingStatus error:", err.message);
        });
      }

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

      // Update in Cloud Firestore
      if (db) {
        updateDoc(doc(db, "bookings", bookingId), {
          payment_status: newPaymentStatus,
          updated_at: b.updated_at
        }).catch(err => {
          console.warn("Firestore updatePaymentStatus error:", err.message);
        });
      }

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

    // Persist review to Cloud Firestore
    if (db) {
      setDoc(doc(db, "reviews", String(newReview.id)), cleanForFirestore(newReview), { merge: true }).catch(err => {
        console.warn("Firestore addReview error:", err.message);
      });
    }

    return newReview;
  },

  approveReview(id) {
    const reviews = this.getReviews(true);
    const r = reviews.find(item => item.id === id);
    if (r) {
      r.status = "approved";
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

      // Update review status in Cloud Firestore
      if (db) {
        updateDoc(doc(db, "reviews", String(id)), {
          status: "approved",
          updated_at: new Date().toISOString()
        }).catch(err => {
          console.warn("Firestore approveReview error:", err.message);
        });
      }

      return true;
    }
    return false;
  },

  deleteReview(id) {
    let reviews = this.getReviews(true);
    reviews = reviews.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

    // Delete review from Cloud Firestore
    if (db) {
      deleteDoc(doc(db, "reviews", String(id))).catch(err => {
        console.warn("Firestore deleteReview error:", err.message);
      });
    }
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
      if (!data) return null;
      const parsed = JSON.parse(data);
      return { ...parsed, role: parsed.role || "user" };
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
        city: customer.city || "Guest",
        role: customer.role || "user"
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
      role: "user",
      created_at: new Date().toISOString()
    };

    customers.push(newCustomer);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));

    const sessionData = {
      id: newCustomer.id,
      name: newCustomer.name,
      email: newCustomer.email,
      mobile: newCustomer.mobile,
      city: newCustomer.city,
      role: "user"
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_CUSTOMER, JSON.stringify(sessionData));
    return { success: true, customer: sessionData };
  },

  customerLogout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CUSTOMER);
  },

  setCurrentCustomer(customer) {
    if (customer) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_CUSTOMER, JSON.stringify(customer));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_CUSTOMER);
    }
  },

  saveContactMessage(contactData) {
    this.init();
    const inquiries = JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES) || "[]");
    const newInquiry = {
      id: `INQ-${Date.now()}`,
      name: contactData.name || "Guest Devotee",
      mobile: contactData.mobile || "",
      message: contactData.message || "",
      room_type: contactData.roomType || "General Inquiry",
      created_at: new Date().toISOString()
    };
    inquiries.unshift(newInquiry);
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));

    if (db) {
      setDoc(doc(db, "inquiries", newInquiry.id), cleanForFirestore(newInquiry), { merge: true }).catch(err => {
        console.warn("Firestore saveContactMessage error:", err.message);
      });
    }
    return newInquiry;
  },

  getContactMessages() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES) || "[]");
    } catch {
      return [];
    }
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

  // =========================================================================
  // DYNAMIC PRICING & INVENTORY MANAGEMENT
  // =========================================================================
  getPricingConfig() {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRICING_CONFIG);
      return data ? JSON.parse(data) : DEFAULT_PRICING_CONFIG;
    } catch {
      return DEFAULT_PRICING_CONFIG;
    }
  },

  updatePricingConfig(newConfig, adminUser = "Admin") {
    this.init();

    // Validation
    const acRate = Number(newConfig.base_rates?.AC);
    const nonAcRate = Number(newConfig.base_rates?.["Non-AC"]);
    const extraRate = Number(newConfig.extra_person_rate);
    const childAgeLimit = Number(newConfig.child_age_free_limit);
    const acQty = Number(newConfig.inventory?.AC?.total_rooms);
    const nonAcQty = Number(newConfig.inventory?.["Non-AC"]?.total_rooms);

    if (isNaN(acRate) || acRate < 0) {
      throw new Error("Price must be greater than or equal to 0.");
    }
    if (isNaN(nonAcRate) || nonAcRate < 0) {
      throw new Error("Price must be greater than or equal to 0.");
    }
    if (isNaN(extraRate) || extraRate < 0) {
      throw new Error("Price must be greater than or equal to 0.");
    }
    if (isNaN(childAgeLimit) || childAgeLimit < 0) {
      throw new Error("Child age free limit must be greater than or equal to 0.");
    }
    if (isNaN(acQty) || acQty < 0 || isNaN(nonAcQty) || nonAcQty < 0) {
      throw new Error("Room inventory count must be greater than or equal to 0.");
    }

    const current = this.getPricingConfig();
    const auditLogs = current.audit_logs || [];

    const changeDescriptions = [];
    if (current.base_rates?.AC !== acRate) changeDescriptions.push(`AC Rate: ₹${current.base_rates?.AC} → ₹${acRate}`);
    if (current.base_rates?.["Non-AC"] !== nonAcRate) changeDescriptions.push(`Non-AC Rate: ₹${current.base_rates?.["Non-AC"]} → ₹${nonAcRate}`);
    if (current.extra_person_rate !== extraRate) changeDescriptions.push(`Extra Person: ₹${current.extra_person_rate} → ₹${extraRate}`);
    if (current.child_age_free_limit !== childAgeLimit) changeDescriptions.push(`Child Free Age: ${current.child_age_free_limit}y → ${childAgeLimit}y`);
    if (current.inventory?.AC?.total_rooms !== acQty) changeDescriptions.push(`AC Rooms: ${current.inventory?.AC?.total_rooms} → ${acQty}`);
    if (current.inventory?.["Non-AC"]?.total_rooms !== nonAcQty) changeDescriptions.push(`Non-AC Rooms: ${current.inventory?.["Non-AC"]?.total_rooms} → ${nonAcQty}`);
    if (current.inventory?.AC?.active !== newConfig.inventory?.AC?.active) changeDescriptions.push(`AC Status: ${newConfig.inventory?.AC?.active ? 'Active' : 'Inactive'}`);
    if (current.inventory?.["Non-AC"]?.active !== newConfig.inventory?.["Non-AC"]?.active) changeDescriptions.push(`Non-AC Status: ${newConfig.inventory?.["Non-AC"]?.active ? 'Active' : 'Inactive'}`);

    const newLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      modified_by: adminUser,
      action: changeDescriptions.length > 0 ? changeDescriptions.join(", ") : "Updated configuration values"
    };

    const updatedConfig = {
      ...current,
      ...newConfig,
      base_rates: {
        AC: acRate,
        "Non-AC": nonAcRate
      },
      extra_person_rate: extraRate,
      child_age_free_limit: childAgeLimit,
      base_capacity_per_room: 2,
      max_capacity_per_room: 4,
      inventory: {
        AC: {
          total_rooms: acQty,
          active: newConfig.inventory?.AC?.active !== false
        },
        "Non-AC": {
          total_rooms: nonAcQty,
          active: newConfig.inventory?.["Non-AC"]?.active !== false
        }
      },
      date_range_rates: Array.isArray(newConfig.date_range_rates) ? newConfig.date_range_rates : (current.date_range_rates || []),
      last_modified_by: adminUser,
      last_modified_at: new Date().toISOString(),
      audit_logs: [newLogEntry, ...auditLogs].slice(0, 50)
    };

    localStorage.setItem(STORAGE_KEYS.PRICING_CONFIG, JSON.stringify(updatedConfig));

    // Auto-sync room models in STORAGE_KEYS.ROOMS
    const rooms = this.getRooms(true);
    rooms.forEach(room => {
      if (room.ac_status === "AC") {
        room.price = acRate;
        room.total_quantity = acQty;
        room.status = updatedConfig.inventory.AC.active ? "active" : "inactive";
      } else if (room.ac_status === "Non-AC") {
        room.price = nonAcRate;
        room.total_quantity = nonAcQty;
        room.status = updatedConfig.inventory["Non-AC"].active ? "active" : "inactive";
      }
    });
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));

    // Persist pricing configuration & rooms to Cloud Firestore
    if (db) {
      setDoc(doc(db, "settings", "pricing_config"), cleanForFirestore(updatedConfig), { merge: true }).catch(err => {
        console.warn("Firestore updatePricingConfig error:", err.message);
      });
      rooms.forEach(room => {
        setDoc(doc(db, "rooms", room.room_id), cleanForFirestore(room), { merge: true }).catch(err => {
          console.warn("Firestore sync room pricing error:", err.message);
        });
      });
    }

    // Trigger window event for reactive UI updates
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("syn_pricing_updated", { detail: updatedConfig }));
    }

    return { success: true, pricing: updatedConfig };
  },

  // Date-Range / Seasonal Rates Management
  getDateRangeRates() {
    const config = this.getPricingConfig();
    return Array.isArray(config.date_range_rates) ? config.date_range_rates : [];
  },

  saveDateRangeRate(rateData, adminUser = "Admin") {
    this.init();
    const config = this.getPricingConfig();
    const rates = Array.isArray(config.date_range_rates) ? [...config.date_range_rates] : [];

    const newId = rateData.id || `DRR-${Date.now()}`;
    const payload = {
      id: newId,
      name: (rateData.name || "Seasonal Rate").trim(),
      start_date: rateData.start_date,
      end_date: rateData.end_date,
      rates: {
        AC: Math.round(Number(rateData.rates?.AC ?? rateData.ac_rate ?? config.base_rates?.AC ?? 2400)),
        "Non-AC": Math.round(Number(rateData.rates?.["Non-AC"] ?? rateData.non_ac_rate ?? config.base_rates?.["Non-AC"] ?? 1400))
      },
      extra_person_rate: Math.round(Number(rateData.extra_person_rate ?? config.extra_person_rate ?? 700)),
      created_at: rateData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const existingIdx = rates.findIndex(r => r.id === newId);
    if (existingIdx >= 0) {
      rates[existingIdx] = payload;
    } else {
      rates.push(payload);
    }

    // Sort by start_date ascending
    rates.sort((a, b) => a.start_date.localeCompare(b.start_date));

    const updatedConfig = {
      ...config,
      date_range_rates: rates,
      last_modified_by: adminUser,
      last_modified_at: new Date().toISOString(),
      audit_logs: [
        {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toISOString(),
          modified_by: adminUser,
          action: `Set date-range rate '${payload.name}' (${payload.start_date} to ${payload.end_date}): AC ₹${payload.rates.AC}, Non-AC ₹${payload.rates["Non-AC"]}`
        },
        ...(config.audit_logs || [])
      ].slice(0, 50)
    };

    localStorage.setItem(STORAGE_KEYS.PRICING_CONFIG, JSON.stringify(updatedConfig));

    if (typeof fetch !== "undefined") {
      fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        body: JSON.stringify({ ...updatedConfig, adminUser })
      }).catch(() => {});
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("syn_pricing_updated", { detail: updatedConfig }));
    }

    return payload;
  },

  deleteDateRangeRate(id, adminUser = "Admin") {
    this.init();
    const config = this.getPricingConfig();
    const target = (config.date_range_rates || []).find(r => r.id === id);
    const rates = (config.date_range_rates || []).filter(r => r.id !== id);

    const updatedConfig = {
      ...config,
      date_range_rates: rates,
      last_modified_by: adminUser,
      last_modified_at: new Date().toISOString(),
      audit_logs: [
        {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toISOString(),
          modified_by: adminUser,
          action: `Removed date-range rate rule: ${target?.name || id} (${target?.start_date || ''} to ${target?.end_date || ''})`
        },
        ...(config.audit_logs || [])
      ].slice(0, 50)
    };

    localStorage.setItem(STORAGE_KEYS.PRICING_CONFIG, JSON.stringify(updatedConfig));

    if (typeof fetch !== "undefined") {
      fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        body: JSON.stringify({ ...updatedConfig, adminUser })
      }).catch(() => {});
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("syn_pricing_updated", { detail: updatedConfig }));
    }

    return true;
  },

  // Dynamic Booking Price Calculator
  calculateBookingCost(params = {}) {
    const config = this.getPricingConfig();
    const {
      roomId,
      acStatus,
      checkIn,
      checkOut,
      roomQty = 1,
      adults = 2,
      childrenUnder4 = 0,
      childrenAbove4 = 0,
      childrenAges
    } = params;

    const parsedQty = Math.max(1, parseInt(roomQty, 10) || 1);
    const parsedAdults = Math.max(1, parseInt(adults, 10) || 1);
    const childAgeLimit = typeof config.child_age_free_limit === "number" ? config.child_age_free_limit : 4;

    let parsedKidsUnder4 = Math.max(0, parseInt(childrenUnder4, 10) || 0);
    let parsedKidsAbove4 = Math.max(0, parseInt(childrenAbove4, 10) || 0);

    // If dynamic childrenAges array is supplied, map strictly against childAgeLimit
    if (Array.isArray(childrenAges)) {
      parsedKidsUnder4 = childrenAges.filter(a => Number(a) <= childAgeLimit).length;
      parsedKidsAbove4 = childrenAges.filter(a => Number(a) > childAgeLimit).length;
    }

    // Nights calculation
    let nights = 1;
    if (checkIn && checkOut) {
      const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
      const calcDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      nights = calcDays > 0 ? calcDays : 1;
    }

    // Resolve room base rate & AC status
    let room = null;
    if (roomId) {
      room = this.getRoomById(roomId);
    }
    const resolvedAcStatus = room ? room.ac_status : (acStatus || "AC");
    const standardBaseRate = Math.round(room?.price ?? (config.base_rates?.[resolvedAcStatus] || (resolvedAcStatus === "Non-AC" ? 1400 : 2400)));
    const standardExtraPersonRate = Math.round(config.extra_person_rate ?? 700);
    const dateRangeRates = Array.isArray(config.date_range_rates) ? config.date_range_rates : [];

    // Occupancy rules
    const baseCapacityPerRoom = config.base_capacity_per_room || 2;
    const maxCapacityPerRoom = config.max_capacity_per_room || 4;
    const maxAllowedGuests = maxCapacityPerRoom * parsedQty;

    const totalGuests = parsedAdults + parsedKidsUnder4 + parsedKidsAbove4;
    const exceedsMaxCapacity = totalGuests > maxAllowedGuests;

    // Chargeable guests: Adults + Children above 4 (Children 0-4 are free)
    const chargeableGuests = parsedAdults + parsedKidsAbove4;
    const includedGuests = baseCapacityPerRoom * parsedQty;
    const extraGuests = Math.max(0, chargeableGuests - includedGuests);

    // Night-by-night dynamic calculation supporting date-range overrides
    let roomBaseCharge = 0;
    let extraGuestCharge = 0;
    const nightBreakdowns = [];
    let hasSpecialDateRate = false;

    if (checkIn && checkOut && nights > 0) {
      const startMs = new Date(checkIn).getTime();
      for (let i = 0; i < nights; i++) {
        const nightDateObj = new Date(startMs + i * 24 * 60 * 60 * 1000);
        const nightDateStr = nightDateObj.toISOString().split('T')[0];

        // Find active date-range override
        const matchedOverride = dateRangeRates.find(dr => {
          if (!dr.start_date || !dr.end_date) return false;
          return nightDateStr >= dr.start_date && nightDateStr <= dr.end_date;
        });

        let nightRate = standardBaseRate;
        let nightExtraPersonRate = standardExtraPersonRate;
        let isOverride = false;
        let overrideName = null;

        if (matchedOverride) {
          const overrideRate = matchedOverride.rates?.[resolvedAcStatus] ??
            matchedOverride.rates?.all ??
            matchedOverride.override_rate ??
            matchedOverride.rate ??
            matchedOverride.daily_rate;

          if (typeof overrideRate === 'number' && overrideRate >= 0) {
            nightRate = Math.round(overrideRate);
            isOverride = true;
            hasSpecialDateRate = true;
            overrideName = matchedOverride.name || matchedOverride.title || "Seasonal Rate";
          }
          if (typeof matchedOverride.extra_person_rate === 'number' && matchedOverride.extra_person_rate >= 0) {
            nightExtraPersonRate = Math.round(matchedOverride.extra_person_rate);
          }
        }

        const nightRoomCost = Math.round(nightRate * parsedQty);
        const nightExtraCost = Math.round(extraGuests * nightExtraPersonRate);

        roomBaseCharge += nightRoomCost;
        extraGuestCharge += nightExtraCost;

        nightBreakdowns.push({
          date: nightDateStr,
          rate: nightRate,
          isOverride,
          overrideName,
          extraPersonRate: nightExtraPersonRate,
          nightRoomCost,
          nightExtraCost
        });
      }
    } else {
      roomBaseCharge = Math.round(standardBaseRate * parsedQty * nights);
      extraGuestCharge = Math.round(extraGuests * standardExtraPersonRate * nights);
    }

    const totalAmount = Math.round(roomBaseCharge + extraGuestCharge);
    const avgBaseRate = nights > 0 ? Math.round(roomBaseCharge / (parsedQty * nights)) : standardBaseRate;

    return {
      numberOfNights: nights,
      roomQty: parsedQty,
      baseRate: avgBaseRate,
      standardBaseRate,
      roomBaseCharge,
      adults: parsedAdults,
      childrenUnder4: parsedKidsUnder4,
      childrenAbove4: parsedKidsAbove4,
      childrenAges: Array.isArray(childrenAges) ? childrenAges : [],
      totalGuests,
      includedGuests,
      chargeableGuests,
      extraGuests,
      extraPersonRate: standardExtraPersonRate,
      extraGuestCharge,
      totalAmount,
      maxAllowedGuests,
      exceedsMaxCapacity,
      childAgeLimit: config.child_age_free_limit || 4,
      acStatus: resolvedAcStatus,
      hasSpecialDateRate,
      nightBreakdowns
    };
  },

  async syncAllToFirebase() {
    if (!db) return { success: false, message: "Firestore database is not connected." };
    try {
      // 1. Pricing config
      const config = this.getPricingConfig();
      await setDoc(doc(db, "settings", "pricing_config"), cleanForFirestore(config), { merge: true });

      // 2. Rooms
      const rooms = this.getRooms(true);
      for (const r of rooms) {
        await setDoc(doc(db, "rooms", r.room_id), cleanForFirestore(r), { merge: true });
      }

      // 3. Bookings
      const bookings = this.getBookings();
      for (const b of bookings) {
        await setDoc(doc(db, "bookings", b.booking_id), cleanForFirestore(b), { merge: true });
      }

      // 4. Reviews
      const reviews = this.getReviews(true);
      for (const rev of reviews) {
        await setDoc(doc(db, "reviews", String(rev.id)), cleanForFirestore(rev), { merge: true });
      }

      return {
        success: true,
        message: `Cloud sync complete! Synced ${rooms.length} rooms, ${bookings.length} reservations, ${reviews.length} reviews, and tariffs to hotel-fad04.`
      };
    } catch (err) {
      console.error("syncAllToFirebase error:", err);
      return { success: false, message: err.message };
    }
  },

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(DEFAULT_ROOMS));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(DEFAULT_BOOKINGS));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(DEFAULT_REVIEWS));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(DEFAULT_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.PRICING_CONFIG, JSON.stringify(DEFAULT_PRICING_CONFIG));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("syn_pricing_updated", { detail: DEFAULT_PRICING_CONFIG }));
    }
    return true;
  }
};
