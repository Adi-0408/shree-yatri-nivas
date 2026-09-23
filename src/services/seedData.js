// SHREE YATRI NIVAS - Initial Production Seed Data
export const DEFAULT_ADMIN_CONFIG = {
  email: "admin@gmail.com",
  password: "1234",
  name: "Front Desk Administrator",
  role: "admin"
};

export const DEFAULT_PRICING_CONFIG = {
  base_rates: {
    AC: 2400,
    "Non-AC": 1400
  },
  extra_person_rate: 700,
  child_age_free_limit: 4, // 0 to 4 years free of charge
  base_capacity_per_room: 2, // Standard tariff covers up to 2 persons
  max_capacity_per_room: 4, // Maximum 4 persons per room
  inventory: {
    AC: { total_rooms: 3, active: true },
    "Non-AC": { total_rooms: 2, active: true }
  },
  date_range_rates: [],
  last_modified_by: "admin@gmail.com",
  last_modified_at: new Date().toISOString(),
  audit_logs: []
};

export const DEFAULT_ROOMS = [
  {
    room_id: "SYN-RM-AC",
    room_name: "Deluxe AC Room",
    room_type: "AC Room",
    ac_status: "AC",
    price: 2400,
    base_capacity: 2,
    capacity: 4,
    total_quantity: 3,
    available_quantity: 3,
    status: "active",
    badge: "Guest Favourite",
    rating: 4.9,
    reviews_count: 0,
    description: "Serene, air-conditioned room crafted for couples and families visiting the holy shrine. Features a plush double bed, silent inverter AC, free high-speed Wi-Fi, and 24/7 hot water. Standard tariff covers up to 2 persons (max 4 with extra person charges).",
    amenities: ["Inverter Air Conditioning", "Free High-Speed Wi-Fi", "Hot Water Geyser (24/7)", "LED Smart TV", "Room Service", "Daily Housekeeping", "Complimentary Water"],
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    room_id: "SYN-RM-NONAC",
    room_name: "Classic Non-AC Room",
    room_type: "Non-AC Room",
    ac_status: "Non-AC",
    price: 1400,
    base_capacity: 2,
    capacity: 4,
    total_quantity: 2,
    available_quantity: 2,
    status: "active",
    badge: "Budget Friendly",
    rating: 4.7,
    reviews_count: 0,
    description: "Peaceful, naturally ventilated room with high ceiling fan, comfortable double bed, and sparkling clean private bathroom. Ideal for budget-conscious pilgrims. Standard tariff covers up to 2 persons (max 4 with extra person charges).",
    amenities: ["High-speed Ceiling Fan", "Free Wi-Fi", "24/7 Hot Water", "Attached Bathroom", "Daily Housekeeping", "Filtered Drinking Water"],
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80"
    ]
  }
];

// Clean slate: Zero demo bookings, zero demo reviews, zero demo customers
export const DEFAULT_BOOKINGS = [];

export const DEFAULT_REVIEWS = [];

export const DEFAULT_CUSTOMERS = [];

export const PROPERTY_INFO = {
  name: "SHREE YATRI NIVAS",
  tagline: "Divine Comfort, Peaceful Lodging & Authentic Hospitality",
  address: "Station Road, Near Central Temple Gate, Pandharpur, Maharashtra - 413304",
  phone: "+91 75177 68655",
  alt_phone: "+91 75177 68655",
  email: "admin@gmail.com",
  admin_email: "admin@gmail.com",
  whatsapp: "917517768655",
  google_maps_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3801.378772392435!2d75.3262!3d17.6745!2m3!1f0!2f0!3f0!3m2!1i1024!2f768!4f13.1!3m3!1m2!1s0x3bc4181a94254841%3A0x2a0d1f7c70f0e0!2sPandharpur%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1695280000000!5m2!1sen!2sin",
  check_in_time: "12:00 PM",
  check_out_time: "11:00 AM",
  policies: {
    child_policy: "Children below 4 years of age stay free of charge without extra bed. Additional charges apply for children aged 4 years and above.",
    payment_policy: "Payment Method: Pay at Property / Payment at Check-in. Cash and UPI/Cards accepted at front desk.",
    cancellation_policy: "Non-Refundable Policy: As per property policy, bookings are non-refundable once confirmed. Please contact the front desk for genuine emergency date modifications."
  }
};
