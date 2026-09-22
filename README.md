# SHREE YATRI NIVAS - Modern React Lodging & Management SPA

A modern, fast, responsive, and interactive online lodging booking and management application built for **SHREE YATRI NIVAS** using **React 18, Vite, React Router v6, and Context API**.

---

## 🌟 Key Features

### 1. Customer Experience Portal
- **Home Page (`/`)**:
  - Hero banner with quick live availability search widget (Check-in, Check-out, Guests, AC/Non-AC).
  - Featured room suites with high-resolution imagery, badges, and pricing.
  - Devotee-focused amenities showcase (24/7 solar/geyser hot water, RO drinking water, high-speed Wi-Fi, secure parking, prime temple location).
  - Guest reviews & testimonials carousel.
  - Floating direct WhatsApp inquiry concierge with pre-filled message.
- **Rooms & Suites Catalog (`/rooms`)**:
  - Interactive multi-filter bar: Climate (AC / Non-AC), Guest Capacity, and Live Sort by Price.
  - Room quick-view modal with multi-photo gallery preview and full amenity breakdowns.
- **Online Booking Engine (`/booking`)**:
  - **3-Step Wizard**:
    1. *Dates & Room Selection*: Select dates, room type, quantity, adults & children. Includes double-booking prevention across overlapping dates.
    2. *Guest Details*: Name, mobile number (+91 WhatsApp), email, and special requests.
    3. *Instant Confirmation Voucher*: Generates unique Booking Reference ID (`SYN-YYYYMMDD-XXX`), printable voucher, and direct WhatsApp share button.
  - *Booking Status Lookup*: Devotees can look up existing reservations by Reference ID or Mobile Number.
- **Guest Reviews & Feedback (`/reviews`)**:
  - Public reviews showcase with overall rating breakdown.
  - Interactive form to submit new ratings and reviews.
  - **Admin Moderation Flow**: Reviews are queued for admin approval before going live.
- **Contact & Directions (`/contact`)**:
  - Property address, direct phone lines, and WhatsApp support.
  - Embedded responsive Google Maps.
  - Contact message inquiry form and FAQ accordion.

---

### 2. Dedicated Admin Management Panel (`/admin`)
- **Secure Authentication**:
  - Administrator authentication check (Default: `admin` / `admin123` with 1-click demo login).
- **Dashboard Overview**:
  - Live KPI cards: Total Rooms, Total Reservations, Collected Revenue, Pending Payments, Check-ins & Check-outs.
  - Recent reservations quick table.
- **Room & Rate Management**:
  - Add new rooms, edit room details (name, type, AC status, capacity, price, total units, images, description).
  - Toggle active / inactive room status or delete rooms.
- **Booking Management**:
  - Searchable and filterable by guest name, mobile, booking ID, or status.
  - Status updates: `Confirmed` &rarr; `Checked-in` &rarr; `Checked-out` &rarr; `Cancelled`.
  - Payment tracking: Toggle between `Pending` and `Paid`.
- **Review Moderation**:
  - Approve or delete submitted guest reviews.
- **Devotee Accounts**:
  - View registered customer profiles.

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Vite Development Server
```bash
npm run dev
```
Then open your browser at [http://localhost:3000](http://localhost:3000).

### 3. Build for Production
```bash
npm run build
```
Production assets will be output to the `dist/` directory.

---

## 🔐 Default Credentials

### Staff / Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

### Demo Devotee Customer Credentials
- **Email**: `ramesh@example.com`
- **Password**: `password123`

---

## 🛠️ Technology Stack
- **Framework**: React 18
- **Bundler & Dev Server**: Vite
- **Routing**: React Router DOM (v6)
- **Icons**: Lucide React
- **Styling**: Modern CSS Design System (Warm Paper Serenity & Pilgrimage Accents)
- **State & Storage**: React Context API + LocalStorage Persistent Sync
