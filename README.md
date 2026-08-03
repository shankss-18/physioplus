# Physio Plus - Clinic Management System

Physio Plus is a full-stack clinic management and booking platform built with a modern React frontend and a robust Node.js/Express backend. It allows clinics to seamlessly manage staff schedules, treatment rooms, specialized services, and customer bookings.

## 🚀 Live Demo Features
This project is structured specifically to be showcased as a portfolio piece. It includes several features designed for recruiters and clients:
- **One-Click Demo Login:** Visitors can access the Admin Panel instantly via the sign-in page without needing to hunt for credentials.
- **Self-Healing Database:** The admin dashboard features a "Reset Demo Data" button. This allows anyone testing the app to safely drop any messy modifications and re-seed the SQLite database with pristine dummy data in milliseconds.

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express, JWT Authentication, bcrypt
- **Database:** SQLite (deployed via Turso / libsql)

## ✨ Key Features
- **Live Availability Board:** Real-time, modern display of the clinic's upcoming schedule, dynamically calculating which services are available for the next 4 time slots.
- **Admin Dashboard:** Comprehensive metrics tracking daily sessions, weekly revenue, room utilization, and recent activity.
- **Booking Management:** Complete CRUD operations for Bookings, Staff, Services, and Rooms.
- **Conflict Resolution:** The backend actively prevents double-booking by verifying therapist schedules, room availability, and working hours simultaneously.

## 🏃‍♂️ Running Locally

1. **Install dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   TURSO_DATABASE_URL=your_turso_url
   TURSO_AUTH_TOKEN=your_turso_token
   JWT_SECRET=your_super_secret_key
   ```

3. **Seed the Database**
   ```bash
   cd backend
   node seeddata.js
   ```

4. **Start the Development Servers**
   ```bash
   # Terminal 1 (Backend)
   cd backend
   npm run dev

   # Terminal 2 (Frontend)
   cd frontend
   npm run dev
   ```
