// SHREE YATRI NIVAS - Default Seed Data
const DEFAULT_ROOMS = [
  {
    room_id: "SYN-RM-101",
    room_name: "Deluxe AC Family Suite",
    room_type: "Family Suite",
    ac_status: "AC",
    price: 3200,
    capacity: 4,
    total_quantity: 5,
    available_quantity: 4,
    status: "active",
    badge: "Most Popular",
    rating: 4.9,
    reviews_count: 38,
    description: "Spacious luxury suite crafted for families and groups visiting the holy pilgrimage. Features 2 king-sized beds, modern air conditioning, premium wooden furnishing, ambient warm lighting, and a panoramic city/temple view.",
    amenities: ["Air Conditioning", "Free High-Speed Wi-Fi", "Hot Water Geyser (24/7)", "LED Smart TV", "Room Service", "Daily Housekeeping", "Complimentary Water", "Electric Kettle & Tea Kit"],
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    room_id: "SYN-RM-102",
    room_name: "Executive AC Double Room",
    room_type: "Executive Double",
    ac_status: "AC",
    price: 2200,
    capacity: 2,
    total_quantity: 8,
    available_quantity: 7,
    status: "active",
    badge: "Recommended",
    rating: 4.8,
    reviews_count: 54,
    description: "Elegantly designed modern double room ideal for couples, pilgrims, and business travelers. Offers superior comfort with plush bedding, silent AC, high-speed Wi-Fi, work desk, and spotless private bathroom.",
    amenities: ["Air Conditioning", "Free High-Speed Wi-Fi", "24/7 Hot Water", "Flat Screen TV", "Room Service", "Luggage Storage", "Clean Linens & Towels"],
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    room_id: "SYN-RM-103",
    room_name: "Classic Non-AC Double Room",
    room_type: "Standard Double",
    ac_status: "Non-AC",
    price: 1400,
    capacity: 2,
    total_quantity: 10,
    available_quantity: 9,
    status: "active",
    badge: "Budget Friendly",
    rating: 4.6,
    reviews_count: 29,
    description: "Affordable and peaceful accommodation with natural ventilation, high ceiling fan, comfortable double bed, pristine sanitation, and round-the-clock hot water. Perfect for budget-conscious pilgrims.",
    amenities: ["High-speed Ceiling Fan", "Free Wi-Fi", "24/7 Hot Water", "Attached Bathroom", "Daily Housekeeping", "Filtered Drinking Water"],
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    room_id: "SYN-RM-104",
    room_name: "Royal 4-Bed AC Suite",
    room_type: "Royal Suite",
    ac_status: "AC",
    price: 3900,
    capacity: 5,
    total_quantity: 4,
    available_quantity: 3,
    status: "active",
    badge: "Luxury Group Stay",
    rating: 4.95,
    reviews_count: 22,
    description: "Our largest and most luxurious family suite featuring lavish interiors, sofa seating lounge, double air-conditioning units, 4 separate deluxe beds or 2 king suites, spacious vanity bathroom, and premium hospitality perks.",
    amenities: ["Dual AC Units", "Ultra High-Speed Wi-Fi", "24/7 Solar & Geyser Hot Water", "55-inch Smart TV", "Sofa Seating Lounge", "Mini Fridge", "Complimentary Tea & Coffee", "Dedicated Room Attendant"],
    images: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    room_id: "SYN-RM-105",
    room_name: "Standard Non-AC Triple Room",
    room_type: "Triple Room",
    ac_status: "Non-AC",
    price: 1800,
    capacity: 3,
    total_quantity: 6,
    available_quantity: 5,
    status: "active",
    badge: "Value Stay",
    rating: 4.7,
    reviews_count: 17,
    description: "Designed for small pilgrim groups or families of 3. Features one double bed and one single bed, large windows for refreshing cross-ventilation, spotless linens, and round-the-clock water support.",
    amenities: ["Ceiling Fans", "Free Wi-Fi", "24/7 Hot Water", "Attached Bathroom", "Drinking Water on Call", "Luggage Rack"],
    images: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
    ]
  }
];

const DEFAULT_BOOKINGS = [
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
    room_id: "SYN-RM-102",
    room_name: "Executive AC Double Room",
    room_type: "Executive Double",
    room_quantity: 1,
    room_rate: 2200,
    number_of_nights: 2,
    total_amount: 4400,
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
    adults: 4,
    children: 0,
    room_id: "SYN-RM-101",
    room_name: "Deluxe AC Family Suite",
    room_type: "Family Suite",
    room_quantity: 1,
    room_rate: 3200,
    number_of_nights: 2,
    total_amount: 6400,
    payment_method: "Pay at Property",
    payment_status: "Paid",
    booking_status: "Checked-in",
    special_requests: "Please provide extra pillows.",
    created_at: "2026-09-20T14:15:00Z"
  }
];

const DEFAULT_REVIEWS = [
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

const PROPERTY_INFO = {
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

const DEFAULT_CUSTOMERS = [
  {
    id: "CUST-101",
    name: "Ramesh Sharma",
    mobile: "9823045671",
    email: "ramesh@example.com",
    password: "password123",
    city: "Pune",
    created_at: "2026-09-20T10:00:00Z"
  }
];

