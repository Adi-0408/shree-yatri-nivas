// SHREE YATRI NIVAS - Default Seed Data
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
  last_modified_by: "Admin",
  last_modified_at: new Date().toISOString(),
  audit_logs: [
    {
      id: "LOG-INIT",
      timestamp: new Date().toISOString(),
      modified_by: "Admin",
      action: "Initial Setup: 3 AC (₹2400), 2 Non-AC (₹1400), Extra Person ₹700, Child Free ≤ 4 yrs"
    }
  ]
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
    reviews_count: 48,
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
    reviews_count: 35,
    description: "Peaceful, naturally ventilated room with high ceiling fan, comfortable double bed, and sparkling clean private bathroom. Ideal for budget-conscious pilgrims. Standard tariff covers up to 2 persons (max 4 with extra person charges).",
    amenities: ["High-speed Ceiling Fan", "Free Wi-Fi", "24/7 Hot Water", "Attached Bathroom", "Daily Housekeeping", "Filtered Drinking Water"],
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80"
    ]
  }
];

export const DEFAULT_BOOKINGS = [
  {
    booking_id: "SYN-20260921-001",
    booking_reference: "SYN-20260921-001",
    guest_name: "Ramesh Sharma",
    mobile: "+91 98230 45671",
    email: "ramesh.sharma@example.com",
    check_in: "2026-09-22",
    check_out: "2026-09-24",
    adults: 2,
    children: 1,
    children_under_4: 1,
    children_above_4: 0,
    extra_guests: 0,
    room_id: "SYN-RM-AC",
    room_name: "Deluxe AC Room",
    room_type: "AC Room",
    room_quantity: 1,
    room_rate: 2400,
    number_of_nights: 2,
    base_charges: 4800,
    extra_charges: 0,
    total_amount: 4800,
    payment_method: "Pay at Property",
    payment_status: "Pending",
    booking_status: "Confirmed",
    special_requests: "Early morning arrival around 8:00 AM if possible.",
    created_at: "2026-09-21T10:30:00Z"
  },
  {
    booking_id: "SYN-20260920-002",
    booking_reference: "SYN-20260920-002",
    guest_name: "Sunita Deshmukh",
    mobile: "+91 94220 18293",
    email: "sunita.deshmukh@gmail.com",
    check_in: "2026-09-21",
    check_out: "2026-09-23",
    adults: 3,
    children: 0,
    children_under_4: 0,
    children_above_4: 0,
    extra_guests: 1,
    room_id: "SYN-RM-NONAC",
    room_name: "Classic Non-AC Room",
    room_type: "Non-AC Room",
    room_quantity: 1,
    room_rate: 1400,
    number_of_nights: 2,
    base_charges: 2800,
    extra_charges: 1400,
    total_amount: 4200,
    payment_method: "Pay at Property",
    payment_status: "Paid",
    booking_status: "Checked-in",
    special_requests: "Please provide extra bed linens.",
    created_at: "2026-09-20T14:15:00Z"
  }
];

export const DEFAULT_REVIEWS = [
  {
    id: "REV-101",
    guest_name: "Rajesh Kulkarni",
    city: "Pune",
    rating: 5,
    date: "2026-09-18",
    room_type: "Deluxe AC Family Suite",
    comment: "Exceptional hospitality! The rooms at Shree Yatri Nivas were sparkling clean, very close to the temple, and the staff was extremely courteous. Hot water was available 24/7. Highly recommended for visiting pilgrims!",
    status: "approved"
  },
  {
    id: "REV-102",
    guest_name: "Pooja Patil",
    city: "Mumbai",
    rating: 5,
    date: "2026-09-15",
    room_type: "Executive AC Double Room",
    comment: "Very peaceful stay with serene vibes. The AC was chilling fast, mattresses were comfortable and parking facility was safe and spacious. Will definitely choose Shree Yatri Nivas every time we visit.",
    status: "approved"
  },
  {
    id: "REV-103",
    guest_name: "Anand Verma",
    city: "Nagpur",
    rating: 4.8,
    date: "2026-09-10",
    room_type: "Classic Non-AC Double Room",
    comment: "Great value for money! Even in the budget Non-AC room, hygiene and cleanliness were top notch. Prompt room service and quick booking process.",
    status: "approved"
  }
];

export const PROPERTY_INFO = {
  name: "SHREE YATRI NIVAS",
  tagline: "Divine Comfort, Peaceful Lodging & Authentic Hospitality",
  address: "Station Road, Near Central Temple Gate, Pandharpur, Maharashtra - 413304",
  phone: "+91 98220 12345",
  alt_phone: "+91 98220 54321",
  email: "info@shreeyatrinivas.com",
  admin_email: "admin@shreeyatrinivas.com",
  whatsapp: "919822012345",
  google_maps_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3801.378772392435!2d75.3262!3d17.6745!2m3!1f0!2f0!3f0!3m2!1i1024!2f768!4f13.1!3m3!1m2!1s0x3bc4181a94254841%3A0x2a0d1f7c70f0e0!2sPandharpur%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1695280000000!5m2!1sen!2sin",
  check_in_time: "12:00 PM",
  check_out_time: "11:00 AM",
  policies: {
    child_policy: "Children below 4 years of age stay free of charge without extra bed. Additional charges apply for children aged 4 years and above.",
    payment_policy: "Payment Method: Pay at Property / Payment at Check-in. Cash and UPI/Cards accepted at front desk.",
    cancellation_policy: "Non-Refundable Policy: As per property policy, bookings are non-refundable once confirmed. Please contact the front desk for genuine emergency date modifications."
  }
};

export const DEFAULT_CUSTOMERS = [
  {
    id: "CUST-101",
    name: "Ramesh Sharma",
    mobile: "9823045671",
    email: "ramesh@example.com",
    password: "password123",
    city: "Pune",
    role: "user",
    created_at: "2026-09-20T10:00:00Z"
  }
];
