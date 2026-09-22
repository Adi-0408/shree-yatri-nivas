# SHREE YATRI NIVAS - Online Lodging Booking & Management System

A modern, fast, responsive, and interactive online lodging booking and management website built for **SHREE YATRI NIVAS**.

---

## 🌟 Key Features

### 1. Customer Experience Portal
- **Home Page (`index.html`)**:
  - Hero banner with quick live availability search widget (Check-in, Check-out, Guests, AC/Non-AC).
  - Featured room suites with luxury imagery, badges, and pricing.
  - Devotee-focused amenities showcase (AC/Non-AC, 24/7 solar/geyser hot water, high-speed Wi-Fi, secure parking, prime temple location).
  - Guest reviews & testimonials carousel.
  - Floating direct WhatsApp inquiry button with pre-filled message.
- **Rooms & Suites Catalog (`rooms.html`)**:
  - Interactive multi-filter bar: Climate (AC / Non-AC), Guest Capacity, and Live Budget Price Slider (₹1,000 – ₹5,000+).
  - Real-time date availability checker with dynamic "X Available" or "Sold Out" badges.
  - Room quick-view modal with multi-photo gallery preview and full amenity breakdowns.
- **Online Booking Engine (`booking.html`)**:
  - **4-Step Wizard**:
    1. *Dates & Room Selection*: Select dates, room type, quantity, adults & children. Includes double-booking prevention across overlapping dates.
    2. *Guest Details*: Name, mobile number (+91 WhatsApp), email, and special requests.
    3. *Review & Policies*: Transparent rate computation (`Room Rate × Nights × Rooms`), child policy verification (<4 free, 4+ extra charges), and Pay at Property / Non-refundable policy agreement checkbox.
    4. *Instant Confirmation Voucher*: Generates unique Booking Reference ID (`SYN-YYYYMMDD-XXX`), simulated customer confirmation email & admin notification triggers, direct WhatsApp contact link, and printable voucher.
- **Guest Reviews & Feedback (`reviews.html`)**:
  - Public reviews showcase with overall 4.9/5 rating breakdown.
  - Interactive modal to submit new ratings and reviews.
  - **Admin Moderation Flow**: Reviews are queued for admin approval before going live.
- **Contact & Location (`contact.html`)**:
  - Property address, direct phone lines, and WhatsApp support.
  - Embedded responsive Google Maps.
  - Contact message inquiry form.
  - Detailed property policies (Child Policy, Pay at Property, Non-Refundable Policy, Timings).

---

### 2. Dedicated Admin Management Panel (`admin.html`)
- **Secure Authentication**:
  - Administrator authentication check (Default: `admin` / `admin123`).
- **Dashboard Overview**:
  - Live KPI cards: Total Rooms, Total Reservations, Realized Revenue, Pending Payments, Today's Check-ins & Check-outs, Upcoming Bookings.
  - Recent reservations quick table.
- **Room & Rate Management**:
  - Add new rooms, edit room details (name, type, AC status, capacity, price, total units, images, description).
  - Toggle active / inactive room status.
- **Booking Management**:
  - Searchable and filterable by guest name, mobile, booking ID, or status.
  - Status updates: `Pending` &rarr; `Confirmed` &rarr; `Checked-in` &rarr; `Checked-out` &rarr; `Cancelled`.
  - Payment tracking: Toggle between `Pending` and `Paid` (Pay at Property workflow).
  - View & print guest booking voucher.
- **Review Moderation**:
  - Approve, reject, or delete submitted guest reviews.
- **Revenue & Occupancy Reports**:
  - Realized vs Pending revenue breakdown.
  - Room-wise booking popularity and visual occupancy bars.

---

## 🚀 How to Run

### Method 1: Built-in Node.js Server (Recommended)
You can run the included zero-dependency high-speed Node.js server:
```bash
node server.js
```
Then open your browser at:
- **Customer Portal**: [http://localhost:3000](http://localhost:3000)
- **Rooms & Suites**: [http://localhost:3000/rooms.html](http://localhost:3000/rooms.html)
- **Online Booking**: [http://localhost:3000/booking.html](http://localhost:3000/booking.html)
- **Guest Reviews**: [http://localhost:3000/reviews.html](http://localhost:3000/reviews.html)
- **Contact & Map**: [http://localhost:3000/contact.html](http://localhost:3000/contact.html)
- **Admin Dashboard**: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

### Method 2: Direct Browser Execution (Static Mode)
The website is fully client-side reactive with persistent `localStorage` data sync! You can double-click or open `index.html` directly in Google Chrome, Microsoft Edge, or Mozilla Firefox without running any server.

---

## 🔐 Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

---

## 🎨 UI/UX Highlights
- **Design Aesthetic**: Royal Navy (`#0f172a`, `#1e293b`) with warm Saffron Gold accents (`#d97706`, `#f59e0b`).
- **Typography**: Google Fonts *Plus Jakarta Sans* for modern readability and *Playfair Display* for luxury hotel accents.
- **Animations & Micro-interactions**: Smooth card hover elevation, image zoom transitions, glowing buttons, floating pulsing WhatsApp icon, and interactive toast notification alerts.
