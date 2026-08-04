import React from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Home from './pages/home/Home'
import { BookingFlow } from './pages/booking/Booking'
import TrackBooking from './pages/track/TrackBooking'
import AdminLogin from './pages/admin_panel/AdminLogin'
import AdminDashboard from './pages/admin_panel/Dashboard'
import Rooms from './pages/admin_panel/Rooms'
import Staff from './pages/admin_panel/Staff'
import Services from './pages/admin_panel/Services'
import Calendar from './pages/admin_panel/Callendar'
import Bookings from './pages/admin_panel/Bookings'
import { ProtectedRoute } from './components/ProtectedRoute'

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path='/booking' element={<BookingFlow />}/>
        <Route path='/track-booking' element={<TrackBooking />}/>

        {/* Admin auth */}
        <Route path='/admin/login' element={<AdminLogin />}/>

        {/* Protected admin routes */}
        <Route path='/admin/dashboard' element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}/>
        <Route path='/admin/' element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}/>
        <Route path='/admin/calendar' element={<ProtectedRoute><Calendar /></ProtectedRoute>}/>
        <Route path='/admin/bookings' element={<ProtectedRoute><Bookings /></ProtectedRoute>}/>
        <Route path='/admin/services' element={<ProtectedRoute><Services /></ProtectedRoute>}/>
        <Route path='/admin/staff' element={<ProtectedRoute><Staff /></ProtectedRoute>}/>
        <Route path='/admin/rooms' element={<ProtectedRoute><Rooms /></ProtectedRoute>}/>
      </Routes>
    </Router>
  )
}

export default App