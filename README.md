<div align="center">
  <h1>🚗 Ryde</h1>
  <p><strong>A production-grade ride-hailing mobile application built for the Indian market</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  </p>

  <p>
    <a href="https://github.com/Amanag43/Ryde/stargazers"><img src="https://img.shields.io/github/stars/Amanag43/Ryde?style=social" /></a>
    <a href="https://github.com/Amanag43/Ryde/network/members"><img src="https://img.shields.io/github/forks/Amanag43/Ryde?style=social" /></a>
  </p>
</div>

---

## 📱 Overview

**Ryde** is a full-stack ride-hailing mobile application inspired by Uber, built natively for Android using React Native and Expo. The app features real-time maps, driver tracking, secure authentication, and seamless payments — fully localized for the Indian market with INR pricing and Razorpay integration.

> Built as a showcase of production-level mobile development skills including full-stack architecture, native maps, OAuth, real-time location tracking, and payment gateway integration.

---

## ✨ Features

- 🔐 **Secure Authentication** — Google OAuth + email/password via Clerk with JWT sessions
- 🗺️ **Real-Time Maps** — Native Mapbox SDK with live driver locations and road routing
- 📍 **GPS Location Tracking** — Real-time user location with expo-location
- 🔍 **Place Search** — Smart autocomplete powered by Photon/Nominatim API
- 🚗 **Driver Matching** — Intelligent driver assignment with ETA and pricing calculations
- 💳 **Razorpay Payments** — UPI, Cards, NetBanking support — fully localized for India
- 📊 **Ride History** — Complete ride tracking stored in PostgreSQL
- 🎨 **Polished UI** — NativeWind (Tailwind CSS) with smooth animations and gestures
- 🌙 **Bottom Sheet UI** — Smooth ride confirmation flow with `@gorhom/bottom-sheet`

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React Native (Expo) | Cross-platform mobile framework |
| TypeScript | Type-safe development |
| NativeWind / Tailwind CSS | Utility-first styling |
| Expo Router | File-based navigation |
| Zustand | Lightweight global state management |

### Backend & Database
| Technology | Purpose |
|---|---|
| Expo API Routes | Serverless backend endpoints |
| NeonDB (PostgreSQL) | Serverless relational database |
| Sequelize ORM | Database query management |

### Authentication
| Technology | Purpose |
|---|---|
| Clerk | OAuth + email auth, JWT sessions |

### Maps & Location
| Technology | Purpose |
|---|---|
| Mapbox SDK (`@rnmapbox/maps`) | Native map rendering |
| OSRM | Free road routing engine |
| Photon API | Free place search & geocoding |
| expo-location | Device GPS access |

### Payments
| Technology | Purpose |
|---|---|
| Razorpay | UPI, Cards, NetBanking (India) |

---

## 📂 Project Structure

```
Ryde/
├── app/
│   ├── (auth)/               # Sign in, Sign up, Onboarding
│   ├── (root)/
│   │   ├── (tabs)/           # Home, Rides, Chat, Profile
│   │   ├── find-ride.tsx     # Location search screen
│   │   ├── confirm-ride.tsx  # Driver selection screen
│   │   └── book-ride.tsx     # Booking & payment screen
│   └── (api)/                # Backend API routes
│       ├── driver+api.ts
│       ├── user+api.ts
│       ├── ride+api.ts
│       └── directions+api.ts
├── components/
│   ├── Map.tsx               # Mapbox native map component
│   ├── GoogleTextInput.tsx   # Place search input
│   ├── DriverCard.tsx        # Driver listing card
│   ├── RideCard.tsx          # Ride history card
│   ├── Payment.tsx           # Razorpay payment component
│   └── RideLayout.tsx        # Shared ride screen layout
├── lib/
│   ├── fetch.ts              # API client with auth headers
│   ├── map.ts                # Map utilities & driver time calculation
│   └── utils.ts              # Shared utility functions
├── store/                    # Zustand global state
└── types/                    # TypeScript type definitions
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Android Studio + Android SDK
- JDK 17
- Expo CLI

### Installation

```bash
# Clone the repo
git clone https://github.com/Amanag43/Ryde.git
cd Ryde

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
DATABASE_URL=your_neondb_url
EXPO_PUBLIC_SERVER_URL=http://YOUR_LOCAL_IP:8081
EXPO_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Running the App

```bash
# Start the development server
npx expo start --dev-client

# Build for Android (first time or after adding native libraries)
npx expo run:android
```

---

## 🗄️ Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  clerk_id VARCHAR(100) UNIQUE
);

-- Drivers table
CREATE TABLE drivers (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  profile_image_url TEXT,
  car_image_url TEXT,
  car_seats INTEGER,
  rating DECIMAL(3,2)
);

-- Rides table
CREATE TABLE rides (
  ride_id SERIAL PRIMARY KEY,
  origin_address TEXT,
  destination_address TEXT,
  origin_latitude DECIMAL,
  origin_longitude DECIMAL,
  destination_latitude DECIMAL,
  destination_longitude DECIMAL,
  ride_time INTEGER,
  fare_price DECIMAL,
  payment_status VARCHAR(20),
  driver_id INTEGER REFERENCES drivers(id),
  user_id VARCHAR(100)
);
```

---

## 📸 Screenshots

> Coming soon — add your app screenshots here

---

## 🔑 Key Technical Decisions

**Why Mapbox over Google Maps?**
Mapbox offers a generous free tier (50k loads/month) with no credit card required, native SDK performance, and full road routing built-in — replacing Leaflet/WebView, OSRM, and OpenStreetMap separately.

**Why Razorpay over Stripe?**
Razorpay is purpose-built for India — supporting UPI, NetBanking, and all major Indian payment methods with INR as the default currency. Stripe has limited India support.

**Why NeonDB?**
Serverless PostgreSQL with zero cold starts, perfect for Expo API routes that spin up on demand.

---

## 👨‍💻 Author

**Aman Agarwal**
- GitHub: [@Amanag43](https://github.com/Amanag43)
- LinkedIn: [linkedin.com/in/aman-agarwal-396921245](https://linkedin.com/in/aman-agarwal-396921245)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <p>If you found this project helpful, please consider giving it a ⭐</p>
</div>
