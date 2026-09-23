import { DEFAULT_ROOMS, DEFAULT_BOOKINGS, DEFAULT_REVIEWS, DEFAULT_CUSTOMERS, DEFAULT_PRICING_CONFIG, DEFAULT_ADMIN_CONFIG } from './seedData.js';
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

export const sanitizeRoomImages = (roomList) => {
  const defaultAcImages = [
    "/images/rooms/room-wide.jpg",
    "/images/rooms/room-bed-1.jpg",
    "/images/rooms/room-tv-2.jpg",
    "/images/rooms/room-bathroom.jpg"
  ];
  const defaultNonAcImages = [
    "/images/rooms/room-bed-1.jpg",
    "/images/rooms/room-tv-2.jpg",
    "/images/rooms/room-bathroom.jpg",
    "/images/rooms/room-wide.jpg"
  ];

  if (!Array.isArray(roomList)) return roomList;

  return roomList.map(room => {
    if (!room) return room;
    const isAc = room.ac_status === "AC" || (room.room_type && room.room_type.includes("AC") && !room.room_type.includes("Non-AC"));
    const replacementImages = isAc ? defaultAcImages : defaultNonAcImages;

    const hasUnsplash = Array.isArray(room.images) && room.images.some(img => typeof img === 'string' && img.includes('unsplash.com'));
    const isEmpty = !Array.isArray(room.images) || room.images.length === 0;

    if (hasUnsplash || isEmpty) {
      return {
        ...room,
        images: replacementImages
      };
    }
    return room;
  });
};

const STORAGE_KEYS = {
  ROOMS: "syn_rooms_v1",
  BOOKINGS: "syn_bookings_v1",
  REVIEWS: "syn_reviews_v1",
  ADMIN_LOGGED_IN: "syn_admin_auth_v1",
  CUSTOMERS: "syn_customers_v1",
  CURRENT_CUSTOMER: "syn_current_customer_v1",
  PRICING_CONFIG: "syn_pricing_config_v2",
  INQUIRIES: "syn_inquiries_v1",
  ADMIN_CONFIG: "syn_admin_config_v1",
  STAFF_MEMBERS: "syn_staff_members_v1",
  CLEANSED_FLAG: "syn_demo_cleansed_v5"
};

export const StorageService = {
  firestoreInitialized: false,

  isDemoRecord(item) {
    if (!item) return false;
    const name = String(item.guest_name || item.customer_name || item.name || "").toLowerCase();
    const email = String(item.email || "").toLowerCase();
    const ref = String(item.booking_reference || item.booking_id || item.id || "");
    return (
      name.includes("ramesh sharma") ||
      name.includes("sunita deshmukh") ||
      name.includes("ramesh") ||
      name.includes("sunita") ||
      email.includes("ramesh@") ||
      email.includes("sunita@") ||
      ref === "SYN-20260921-001" ||
      ref === "SYN-20260920-002" ||
      ref === "BK-101" ||
      ref === "BK-102" ||
      ref === "CUST-001" ||
      ref === "CUST-002" ||
      ref === "REV-101" ||
      ref === "REV-102" ||
      ref === "REV-103"
    );
  },

  init() {
    if (typeof window === "undefined") return;

    // Automatic cleanup of all legacy demo accounts, mock bookings, and mock reviews
    if (!localStorage.getItem(STORAGE_KEYS.CLEANSED_FLAG)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));

      // Remove mock bookings
      try {
        const currentBookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || "[]");
        const realBookings = currentBookings.filter(b => !this.isDemoRecord(b));
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(realBookings));
      } catch {
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
      }

      // Remove mock reviews
      try {
        const currentReviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || "[]");
        const realReviews = currentReviews.filter(r => !this.isDemoRecord(r));
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(realReviews));
      } catch {
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify([]));
      }

      // Clear legacy demo customer session if Ramesh or demo
      const currentCust = localStorage.getItem(STORAGE_KEYS.CURRENT_CUSTOMER);
      if (currentCust && (currentCust.includes("ramesh") || currentCust.includes("sunita") || currentCust.includes("Ramesh"))) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_CUSTOMER);
      }
      localStorage.setItem(STORAGE_KEYS.CLEANSED_FLAG, "true");
    }

    const storedRooms = localStorage.getItem(STORAGE_KEYS.ROOMS);
    if (!storedRooms) {
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(DEFAULT_ROOMS));
    } else {
      try {
        const parsed = JSON.parse(storedRooms);
        const sanitized = sanitizeRoomImages(parsed);
        localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(sanitized));
      } catch {
        localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(DEFAULT_ROOMS));
      }
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
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_CONFIG, JSON.stringify(DEFAULT_ADMIN_CONFIG));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STAFF_MEMBERS)) {
      localStorage.setItem(STORAGE_KEYS.STAFF_MEMBERS, JSON.stringify([]));
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
          const localConfig = this.getPricingConfig();

          // Intelligent merge: Ensure local date_range_rates are not erased if cloud had empty/missing array
          const cloudRates = Array.isArray(cloudConfig.date_range_rates) ? cloudConfig.date_range_rates : [];
          const localRates = Array.isArray(localConfig.date_range_rates) ? localConfig.date_range_rates : [];

          let mergedRates = cloudRates;
          if (cloudRates.length === 0 && localRates.length > 0) {
            mergedRates = localRates;
          } else if (localRates.length > 0 && cloudRates.length > 0) {
            const rateMap = new Map();
            localRates.forEach(r => { if (r && r.id) rateMap.set(r.id, r); });
            cloudRates.forEach(r => { if (r && r.id) rateMap.set(r.id, r); });
            mergedRates = Array.from(rateMap.values());
            mergedRates.sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)));
          }

          const finalConfig = {
            ...localConfig,
            ...cloudConfig,
            date_range_rates: mergedRates
          };

          // If cloud was missing date_range_rates, repair cloud in background
          if (cloudRates.length !== mergedRates.length) {
            setDoc(pricingRef, cleanForFirestore(finalConfig), { merge: true }).catch(() => {});
          }

          localStorage.setItem(STORAGE_KEYS.PRICING_CONFIG, JSON.stringify(finalConfig));
          window.dispatchEvent(new CustomEvent("syn_pricing_updated", { detail: finalConfig }));
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
          const sanitizedRooms = sanitizeRoomImages(cloudRooms);

          // If any cloud room had legacy unsplash images, repair Firestore doc
          sanitizedRooms.forEach((r, idx) => {
            const original = cloudRooms[idx];
            if (JSON.stringify(r.images) !== JSON.stringify(original?.images)) {
              setDoc(doc(db, "rooms", r.room_id), cleanForFirestore(r), { merge: true }).catch(() => {});
            }
          });

          localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(sanitizedRooms));
          window.dispatchEvent(new CustomEvent("syn_rooms_updated", { detail: sanitizedRooms }));
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
          snapshot.forEach(d => {
            const data = { ...d.data(), booking_id: d.id };
            if (this.isDemoRecord(data)) {
              deleteDoc(doc(db, "bookings", d.id)).catch(() => {});
            } else {
              cloudBookings.push(data);
            }
          });
          cloudBookings.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(cloudBookings));
          window.dispatchEvent(new CustomEvent("syn_bookings_updated", { detail: cloudBookings }));
        }
      }, (err) => {
        console.warn("Firestore bookings listener:", err.message);
      });

      // 4. Sync & listen to reviews
      const reviewsRef = collection(db, "reviews");
      onSnapshot(reviewsRef, (snapshot) => {
        if (!snapshot.empty) {
          const cloudReviews = [];
          snapshot.forEach(d => {
            const data = { ...d.data(), id: d.id };
            if (this.isDemoRecord(data)) {
              deleteDoc(doc(db, "reviews", String(d.id))).catch(() => {});
            } else {
              cloudReviews.push(data);
            }
          });
          localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(cloudReviews));
          window.dispatchEvent(new CustomEvent("syn_reviews_updated", { detail: cloudReviews }));
        }
      }, (err) => {
        console.warn("Firestore reviews listener:", err.message);
      });

      // 5. Sync & listen to admin_config
      const adminRef = doc(db, "settings", "admin_config");
      onSnapshot(adminRef, (docSnap) => {
        if (docSnap.exists()) {
          const cloudAdmin = docSnap.data();
          localStorage.setItem(STORAGE_KEYS.ADMIN_CONFIG, JSON.stringify(cloudAdmin));
        } else {
          // Auto-seed admin config to Firestore if empty
          const localAdmin = this.getAdminConfig();
          setDoc(adminRef, cleanForFirestore(localAdmin)).catch(err => {
            console.warn("Firestore admin auto-seed:", err.message);
          });
        }
      }, (err) => {
        console.warn("Firestore admin listener:", err.message);
      });

      // 6. Sync & listen to staff accounts
      const staffRef = collection(db, "staff");
      onSnapshot(staffRef, (snapshot) => {
        if (!snapshot.empty) {
          const cloudStaff = [];
          snapshot.forEach(d => cloudStaff.push({ ...d.data(), id: d.id }));
          localStorage.setItem(STORAGE_KEYS.STAFF_MEMBERS, JSON.stringify(cloudStaff));
          window.dispatchEvent(new CustomEvent("syn_staff_updated", { detail: cloudStaff }));
        }
      }, (err) => {
        console.warn("Firestore staff listener:", err.message);
      });
    } catch (err) {
      console.warn("Firestore initialization warning:", err.message);
    }
  },

  // Rooms CRUD
  getRooms(includeInactive = false) {
    this.init();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ROOMS);
      const rooms = raw ? sanitizeRoomImages(JSON.parse(raw)) : DEFAULT_ROOMS;
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
        images: [
          "/images/rooms/room-wide.jpg",
          "/images/rooms/room-bed-1.jpg",
          "/images/rooms/room-tv-2.jpg",
          "/images/rooms/room-bathroom.jpg"
        ],
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
      const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || "[]");
      return items.filter(b => !this.isDemoRecord(b));
    } catch {
      return [];
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

    // Enforce dynamic pricing calculation for the specific booking dates
    const cost = this.calculateBookingCost({
      roomId: bookingData.room_id,
      acStatus: bookingData.ac_status || bookingData.room_type,
      checkIn: bookingData.check_in,
      checkOut: bookingData.check_out,
      roomQty: bookingData.room_quantity || 1,
      adults: bookingData.adults || 2,
      childrenUnder4: bookingData.children_under_4 || 0,
      childrenAbove4: bookingData.children_above_4 || 0,
      childrenAges: bookingData.children_ages || []
    });

    const newBooking = {
      ...bookingData,
      customer_id: bookingData.customer_id || currentCustomer?.id || currentCustomer?.mobile || currentCustomer?.email || 'DEVOTEE',
      customer_name: bookingData.customer_name || currentCustomer?.name || bookingData.guest_name,
      booking_id: ref,
      booking_reference: ref,
      room_rate: cost.baseRate || bookingData.room_rate,
      number_of_nights: cost.numberOfNights || bookingData.number_of_nights,
      base_charges: cost.roomBaseCharge ?? bookingData.base_charges,
      extra_charges: cost.extraGuestCharge ?? bookingData.extra_charges,
      total_amount: cost.totalAmount ?? bookingData.total_amount,
      extra_person_rate: cost.extraPersonRate ?? bookingData.extra_person_rate,
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
      const filtered = reviews.filter(r => !this.isDemoRecord(r));
      return includePending ? filtered : filtered.filter(r => r.status === "approved");
    } catch {
      return [];
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

  // Admin & Staff Authentication & Management
  isAdminLoggedIn() {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_LOGGED_IN) === "true";
  },

  getAdminConfig() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_CONFIG);
      return data ? JSON.parse(data) : DEFAULT_ADMIN_CONFIG;
    } catch {
      return DEFAULT_ADMIN_CONFIG;
    }
  },

  updateAdminConfig(newConfig) {
    if (!newConfig.email || !newConfig.password) {
      throw new Error("Admin email and password are required.");
    }
    const current = this.getAdminConfig();
    const updated = {
      ...current,
      email: newConfig.email.trim().toLowerCase(),
      password: String(newConfig.password).trim(),
      name: newConfig.name ? newConfig.name.trim() : (current.name || "Administrator"),
      role: "admin",
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.ADMIN_CONFIG, JSON.stringify(updated));

    if (db) {
      setDoc(doc(db, "settings", "admin_config"), cleanForFirestore(updated), { merge: true }).catch(err => {
        console.warn("Firestore updateAdminConfig error:", err.message);
      });
    }

    // Update session if currently logged in as admin
    const currentCust = this.getCurrentCustomer();
    if (currentCust && currentCust.role === "admin") {
      this.setCurrentCustomer({ ...currentCust, email: updated.email, name: updated.name });
    }

    return updated;
  },

  getStaffList() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.STAFF_MEMBERS) || "[]");
    } catch {
      return [];
    }
  },

  createStaffMember(staffData) {
    this.init();
    if (!staffData.name || !staffData.email || !staffData.password) {
      throw new Error("Staff name, email, and password are required.");
    }
    const staffList = this.getStaffList();
    const emailClean = staffData.email.trim().toLowerCase();

    // Check duplicate
    if (staffList.some(s => s.email.toLowerCase() === emailClean) || emailClean === this.getAdminConfig().email.toLowerCase()) {
      throw new Error("An admin or staff account with this email already exists.");
    }

    const newStaff = {
      id: `STAFF-${Date.now()}`,
      name: staffData.name.trim(),
      email: emailClean,
      password: String(staffData.password).trim(),
      role: staffData.role || "staff",
      created_at: new Date().toISOString()
    };

    staffList.push(newStaff);
    localStorage.setItem(STORAGE_KEYS.STAFF_MEMBERS, JSON.stringify(staffList));

    if (db) {
      setDoc(doc(db, "staff", newStaff.id), cleanForFirestore(newStaff), { merge: true }).catch(err => {
        console.warn("Firestore createStaffMember error:", err.message);
      });
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("syn_staff_updated", { detail: staffList }));
    }
    return newStaff;
  },

  deleteStaffMember(id) {
    let staffList = this.getStaffList();
    staffList = staffList.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STAFF_MEMBERS, JSON.stringify(staffList));

    if (db) {
      deleteDoc(doc(db, "staff", id)).catch(err => {
        console.warn("Firestore deleteStaffMember error:", err.message);
      });
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("syn_staff_updated", { detail: staffList }));
    }
    return true;
  },

  validateAdminOrStaffLogin(identifier, password) {
    this.init();
    const idClean = (identifier || "").trim().toLowerCase();
    const passClean = String(password || "").trim();
    if (!idClean || !passClean) return { success: false };

    // 1. Check Primary Administrator credentials (defaults to admin@gmail.com / 1234 or custom)
    const admin = this.getAdminConfig();
    if (admin.email.toLowerCase() === idClean && String(admin.password).trim() === passClean) {
      return {
        success: true,
        user: {
          id: "admin-master",
          uid: "admin-master",
          name: admin.name || "Administrator",
          email: admin.email,
          role: "admin",
          isAdmin: true
        }
      };
    }

    // 2. Check Staff credentials
    const staffList = this.getStaffList();
    const staff = staffList.find(s => s.email.toLowerCase() === idClean && String(s.password).trim() === passClean);
    if (staff) {
      return {
        success: true,
        user: {
          id: staff.id,
          uid: staff.id,
          name: staff.name,
          email: staff.email,
          role: staff.role || "staff",
          isAdmin: true
        }
      };
    }

    return { success: false };
  },

  adminLogin(username, password) {
    const res = this.validateAdminOrStaffLogin(username, password);
    if (res.success) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_LOGGED_IN, "true");
      this.setCurrentCustomer(res.user);
      return true;
    }
    return false;
  },

  adminLogout() {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_LOGGED_IN);
    const curr = this.getCurrentCustomer();
    if (curr && (curr.role === 'admin' || curr.role === 'staff')) {
      this.customerLogout();
    }
  },

  // Customer Authentication
  getCustomers() {
    this.init();
    try {
      const customers = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || "[]");
      return customers.filter(c => !this.isDemoRecord(c));
    } catch {
      return [];
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
      city: data.city ? data.city.trim() : "Kolhapur Guest",
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

    // Persist immediately to Cloud Firestore
    if (db) {
      setDoc(doc(db, "settings", "pricing_config"), cleanForFirestore(updatedConfig), { merge: true }).catch(err => {
        console.warn("Firestore saveDateRangeRate error:", err.message);
      });
    }

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

    // Persist immediately to Cloud Firestore
    if (db) {
      setDoc(doc(db, "settings", "pricing_config"), cleanForFirestore(updatedConfig), { merge: true }).catch(err => {
        console.warn("Firestore deleteDateRangeRate error:", err.message);
      });
    }

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

    // Clean check-in & check-out dates (format: YYYY-MM-DD)
    let cleanCheckIn = '';
    let cleanCheckOut = '';
    let nights = 1;

    if (checkIn && checkOut) {
      cleanCheckIn = String(checkIn).split('T')[0].trim();
      cleanCheckOut = String(checkOut).split('T')[0].trim();
      const diff = new Date(cleanCheckOut).getTime() - new Date(cleanCheckIn).getTime();
      const calcDays = Math.round(diff / (1000 * 60 * 60 * 24));
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

    if (cleanCheckIn && cleanCheckOut && nights > 0) {
      const parts = cleanCheckIn.split('-').map(Number);
      const ciY = parts[0] || new Date().getFullYear();
      const ciM = parts[1] || 1;
      const ciD = parts[2] || 1;

      for (let i = 0; i < nights; i++) {
        // Use UTC date arithmetic to avoid any local timezone drift
        const nightDateObj = new Date(Date.UTC(ciY, ciM - 1, ciD + i));
        const nightDateStr = nightDateObj.toISOString().split('T')[0];

        // Find active date-range override
        const matchedOverride = dateRangeRates.find(dr => {
          if (!dr || !dr.start_date || !dr.end_date) return false;
          const s = String(dr.start_date).split('T')[0].trim();
          const e = String(dr.end_date).split('T')[0].trim();
          return nightDateStr >= s && nightDateStr <= e;
        });

        let nightRate = standardBaseRate;
        let nightExtraPersonRate = standardExtraPersonRate;
        let isOverride = false;
        let overrideName = null;

        if (matchedOverride) {
          const isAc = resolvedAcStatus === "AC" || (String(resolvedAcStatus).toUpperCase().includes("AC") && !String(resolvedAcStatus).toUpperCase().includes("NON"));
          const acKey = isAc ? "AC" : "Non-AC";

          const overrideRate = matchedOverride.rates?.[acKey] ??
            matchedOverride.rates?.[resolvedAcStatus] ??
            (isAc ? (matchedOverride.ac_rate ?? matchedOverride.rates?.AC) : (matchedOverride.non_ac_rate ?? matchedOverride.rates?.["Non-AC"])) ??
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
    const effectiveExtraPersonRate = (nightBreakdowns.length > 0 && hasSpecialDateRate)
      ? Math.round(nightBreakdowns.reduce((sum, n) => sum + n.extraPersonRate, 0) / nightBreakdowns.length)
      : standardExtraPersonRate;

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
      extraPersonRate: effectiveExtraPersonRate,
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
