<div align="center">

# 🚕 Ryde

**A full-stack ride-hailing app built with React Native, Expo, and serverless Postgres.**

Real-time-feeling driver matching, live route calculation, dynamic INR pricing, and Razorpay checkout — all running on a single Expo codebase with no standalone backend server.

[![Expo](https://img.shields.io/badge/Expo-52-000020?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Postgres](https://img.shields.io/badge/Neon-Postgres-00E599?logo=postgresql)](https://neon.tech)

</div>

---

## Overview

Ryde is an Uber-style ride-hailing app for the Indian market. A rider signs in, sets a pickup and destination, sees nearby drivers priced and ETA'd against a real routing engine, picks one, and pays via Razorpay — with the ride persisted to a serverless Postgres database.

The interesting engineering decision here is architectural: instead of a separate Express/Nest backend, **Expo Router's file-based API routes double as serverless functions**, running right alongside the client code and talking directly to [Neon](https://neon.tech) (serverless Postgres) over the `@neondatabase/serverless` driver. One codebase, one deploy, shared TypeScript types between client and "server."

---

## Features

- **Authentication** — Google OAuth and email/password via [Clerk](https://clerk.com), with sessions cached securely on-device (`expo-secure-store`).
- **Location & search** — current-location detection (`expo-location`) plus destination search-as-you-type powered by the free [Photon](https://photon.komoot.io) geocoding API.
- **Live map** — Google Maps rendering via `react-native-maps`, with driver markers, a destination pin, and an animated route polyline.
- **Real routing, not straight lines** — driver ETA and route geometry are computed against [OSRM](http://project-osrm.org/), with a **haversine-distance fallback** if the routing service is slow or unreachable, so the UI never hangs on a third-party outage.
- **Dynamic fare calculation** — computed per-driver from real driving distance (base fare + per-km rate), not a flat estimate.
- **Ride booking & payments** — Razorpay Checkout integration for INR payments, with ride records persisted on successful payment.
- **Ride history** — past rides joined with driver details (name, photo, car, rating) in a single query.
- **Resilient networking** — every API call is wrapped with timeouts (`AbortController`) and defensive JSON parsing, with clear console diagnostics when a route 404s or returns unexpected content.

---

## Tech Stack

| Layer | Technology |
|---|---|
| App framework | Expo 52 / React Native 0.76 / TypeScript 5.3 |
| Navigation | Expo Router (file-based, typed routes) |
| Styling | NativeWind (Tailwind for React Native) |
| State management | Zustand |
| Auth | Clerk (`@clerk/clerk-expo`) |
| Database | Neon serverless Postgres (`@neondatabase/serverless`) |
| "Backend" | Expo Router API routes (`app/(api)/**/+api.ts`) |
| Maps | `react-native-maps` (Google provider) |
| Routing / ETA | OSRM public router, haversine fallback |
| Geocoding / search | Photon (Komoot / OpenStreetMap) |
| Payments | Razorpay (`react-native-razorpay`) |

> **Note:** earlier drafts of this project experimented with Mapbox and a Sequelize ORM layer. The shipped implementation uses `react-native-maps` (Google provider) and raw parameterized SQL via the Neon driver instead — this README reflects what's actually running.

---

## Architecture

```
┌──────────────────────────┐
│   React Native (Expo)    │
│  ┌─────────────────────┐ │
│  │  Zustand stores      │ │   useLocationStore · useDriverStore
│  ├─────────────────────┤ │
│  │  Map / Search / Pay  │ │   react-native-maps · Photon · Razorpay
│  └──────────┬──────────┘ │
└─────────────┼────────────┘
              │  fetchAPI() — timeouts + defensive parsing
              ▼
┌──────────────────────────┐
│ Expo Router API Routes   │   app/(api)/**/+api.ts
│  /user  /driver  /ride/* │   (serverless functions)
└─────────────┬────────────┘
              │  parameterized SQL (tagged templates)
              ▼
┌──────────────────────────┐
│   Neon Serverless Postgres│
│   users · drivers · rides │
└──────────────────────────┘

External services: Clerk (auth) · OSRM (routing) · Photon (geocoding) · Razorpay (payments)
```

### Data flow, request to booking

1. User authenticates via Clerk → first-time sign-up provisions a row in `users`.
2. Pickup is auto-detected or typed; destination is searched via Photon.
3. `GET /driver` returns all drivers; each is placed on the map near the rider's location to simulate nearby availability.
4. For every driver, the app calls OSRM to get driver→pickup and pickup→destination durations/distances (parallelized, with a haversine fallback per call), then derives ETA and fare.
5. User selects a driver and confirms → Razorpay Checkout opens.
6. On successful payment, `POST /ride/create` persists the ride.
7. `GET /ride/[id]` returns the rider's full ride history with driver details joined in.

---

## Database Schema

```sql
users
  id, clerk_id, name, email, created_at

drivers
  id, first_name, last_name, profile_image_url,
  car_image_url, car_seats, rating

rides
  ride_id, origin_address, destination_address,
  origin_latitude, origin_longitude,
  destination_latitude, destination_longitude,
  ride_time, fare_price, payment_status,
  driver_id (FK → drivers.id), user_id, created_at
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app (for quick device testing) or Android Studio / Xcode for emulators
- A [Neon](https://neon.tech) Postgres database
- A [Clerk](https://clerk.com) application
- A [Razorpay](https://razorpay.com) account (test-mode keys are fine for development)
- A Google Cloud project with Maps SDK enabled

### Installation

```bash
git clone https://github.com/Amanag43/Ryde.git
cd Ryde
npm install
```

### Environment variables

Create a `.env` file in the project root:

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_SERVER_URL=your_deployed_or_local_server_url
EXPO_PUBLIC_GOOGLE_API_KEY=your_google_maps_api_key
EXPO_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
EXPO_PUBLIC_GEOAPIFY_API_KEY=your_geoapify_key   # optional, used for auxiliary geocoding
DATABASE_URL=your_neon_postgres_connection_string
```

### Database setup

Run the following against your Neon database before first use:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE drivers (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  profile_image_url TEXT,
  car_image_url TEXT,
  car_seats INTEGER NOT NULL,
  rating NUMERIC(2,1)
);

CREATE TABLE rides (
  ride_id SERIAL PRIMARY KEY,
  origin_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  origin_latitude DOUBLE PRECISION NOT NULL,
  origin_longitude DOUBLE PRECISION NOT NULL,
  destination_latitude DOUBLE PRECISION NOT NULL,
  destination_longitude DOUBLE PRECISION NOT NULL,
  ride_time INTEGER NOT NULL,
  fare_price NUMERIC NOT NULL,
  payment_status TEXT NOT NULL,
  driver_id INTEGER REFERENCES drivers(id),
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Run it

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `a` / `i` for an Android/iOS emulator.

---

## Project Structure

```
app/
├── (api)/              # Serverless API routes
│   ├── user+api.ts
│   ├── driver+api.ts
│   └── ride/
│       ├── create+api.ts
│       └── [id]+api.ts
├── (auth)/              # Sign-in, sign-up, welcome
├── (root)/
│   ├── (tabs)/          # home, rides, chat, profile
│   ├── book-ride.tsx
│   ├── confirm-ride.tsx
│   └── find-ride.tsx
components/               # Map, Payment, GoogleTextInput, DriverCard, RideCard, ...
lib/                       # fetch.ts, map.ts (routing/pricing), auth.ts, utils.ts
store/                     # Zustand stores
types/                     # Shared TypeScript types
```

---

## Known Limitations & Roadmap

Being direct about what this project doesn't do yet, because pretending otherwise helps no one:

- **Payment verification is client-trusted.** Razorpay's success callback is taken at face value; there's no server-side HMAC signature verification against the Razorpay secret before marking a ride `paid`. Planned: a `/ride/verify-payment` route that recomputes and checks the signature server-side.
- **Driver locations are simulated**, not real GPS — markers are placed near the rider with a random offset for demo purposes. Planned: a driver-side location channel (WebSocket or short-poll) with geospatial querying (PostGIS or Redis GEO) to serve real "nearby drivers."
- **No booking concurrency control** — two riders could theoretically book the same driver simultaneously. Planned: a driver `status` column with a conditional update pattern to prevent double-booking.
- **API routes are not session-verified server-side** — they trust client-supplied identifiers rather than deriving the user from the verified Clerk session. Planned: server-side Clerk auth checks on every route.
- **No surge/time-based pricing** — fare is distance-only (`base + per-km`); duration and demand aren't factored in yet.

---

## License

This project is available for educational and portfolio purposes.

---

<div align="center">

Built with React Native, Expo, and a healthy respect for what "demo-ready" vs. "production-ready" actually means.

</div>
