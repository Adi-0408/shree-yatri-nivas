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
    description: "Serene, air-conditioned room crafted for couples and families visiting Kolhapur. Features a plush double bed, silent inverter AC, free high-speed Wi-Fi, and 24/7 hot water. Standard tariff covers up to 2 persons (max 4 with extra person charges).",
    amenities: ["Inverter Air Conditioning", "Free High-Speed Wi-Fi", "Hot Water Geyser (24/7)", "LED Smart TV", "Room Service", "Daily Housekeeping", "Complimentary Water"],
    images: [
      "/images/rooms/room-wide.jpg",
      "/images/rooms/room-bed-1.jpg",
      "/images/rooms/room-tv-2.jpg",
      "/images/rooms/room-bathroom.jpg"
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
    description: "Peaceful, naturally ventilated room with high ceiling fan, comfortable double bed, and sparkling clean private bathroom. Ideal for budget-conscious guests and families. Standard tariff covers up to 2 persons (max 4 with extra person charges).",
    amenities: ["High-speed Ceiling Fan", "Free Wi-Fi", "24/7 Hot Water", "Attached Bathroom", "Daily Housekeeping", "Filtered Drinking Water"],
    images: [
      "/images/rooms/room-bed-1.jpg",
      "/images/rooms/room-tv-2.jpg",
      "/images/rooms/room-bathroom.jpg",
      "/images/rooms/room-wide.jpg"
    ]
  }
];

// Clean slate: Zero demo bookings, zero demo reviews, zero demo customers
export const DEFAULT_BOOKINGS = [];

export const DEFAULT_REVIEWS = [];

export const DEFAULT_CUSTOMERS = [];

export const PROPERTY_INFO = {
  name: "HOTEL VIHANN INN",
  tagline: "Comfort, Peaceful Lodging & Authentic Hospitality in Kolhapur",
  address: "198, Kolhapur-Rukadi-Sangli Hwy, Tarabai Park, Kolhapur, Maharashtra 416003",
  phone: "+91 75177 68655",
  alt_phone: "+91 75177 68655",
  email: "admin@gmail.com",
  admin_email: "admin@gmail.com",
  whatsapp: "917517768655",
  google_maps_url: "https://maps.google.com/maps?q=198,+Kolhapur-Rukadi-Sangli+Hwy,+Tarabai+Park,+Kolhapur,+Maharashtra+416003&t=&z=15&ie=UTF8&iwloc=&output=embed",
  check_in_time: "3:00 PM",
  check_out_time: "10:00 AM",
  proximity: [
    { name: "Mahalaxmi Temple", distance: "4 km", time: "10-12 mins", category: "Temple & Spiritual" },
    { name: "Airport", distance: "7 km", time: "15-20 mins", category: "Transit & Flights" },
    { name: "Railway Station", distance: "1 km", time: "3-5 mins", category: "Transit & Trains" },
    { name: "S.T. Stand", distance: "800 M", time: "2-3 mins", category: "Central Bus Stand" }
  ],
  rules: [
    "Check In Time 3:00 pm",
    "Check Out Time 10:00 am",
    "Pets Are Not Allowed",
    "Smoking Not Allowed",
    "Govt. Id(s) Not Mandatory",
    "Local Id(s) Allowed",
    "Visitors Are Not Allowed",
    "Outside Food And Beverage Not Allowed",
    "Children Aged 0 to 4 Years Stay Free Of Charge",
    "Children Aged 5 to 17 Years are Chargeable"
  ],
  policies: {
    child_policy: "Children aged 0 to 4 years stay free of charge. Children aged 5 to 17 years are chargeable as extra guests.",
    payment_policy: "Payment Method: Pay at Property / Payment at Check-in. Cash and UPI/Cards accepted at front desk.",
    cancellation_policy: "Non-Refundable Policy: As per property policy, bookings are non-refundable once confirmed. Please contact the front desk for genuine emergency date modifications."
  }
};
