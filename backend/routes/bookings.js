const express = require('express');
const router = express.Router();
const db = require('../db');
const requireAuth = require('../middleware/auth');

function overlaps(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

async function isSlotStillAvailable(staffId, roomId, startDatetime, endDatetime) {
  const staffBookings = await db.execute({
    sql: `SELECT * FROM bookings WHERE staff_id = ? AND status = 'confirmed'`,
    args: [staffId],
  });

  const roomBookings = await db.execute({
    sql: `SELECT * FROM bookings WHERE room_id = ? AND status = 'confirmed'`,
    args: [roomId],
  });

  const blocked = await db.execute({
    sql: `SELECT * FROM blocked_slots WHERE (resource_type = 'staff' AND resource_id = ?) OR (resource_type = 'room' AND resource_id = ?)`,
    args: [staffId, roomId],
  });

  const busyRanges = [...staffBookings.rows, ...roomBookings.rows, ...blocked.rows].map((row) => ({
    // Append +05:30 so JS parses the stored local (IST) value correctly
    start: new Date(row.start_datetime.replace(' ', 'T') + '+05:30'),
    end: new Date(row.end_datetime.replace(' ', 'T') + '+05:30'),
  }));

  const newStart = new Date(startDatetime);
  const newEnd = new Date(endDatetime);

  return !busyRanges.some((busy) => overlaps(newStart, newEnd, busy.start, busy.end));
}

router.post('/', async (req, res) => {
  const { customer_name, customer_email, customer_phone, staff_id, service_id, start_datetime } = req.body;

  if (!customer_name || !customer_email || !staff_id || !service_id || !start_datetime) {
    return res.status(400).json({ error: 'Missing required booking details' });
  }

  const serviceResult = await db.execute({
    sql: 'SELECT * FROM services WHERE id = ?',
    args: [service_id],
  });
  const service = serviceResult.rows[0];
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const roomId = service.room_id;
  // Frontend sends a LOCAL datetime string (e.g. "2026-08-03T13:30:00").
  // Append +05:30 so the JS Date object represents the correct UTC instant for math,
  // then format back to local (IST) wall-clock for storage — never use toISOString().
  const startDate = new Date(start_datetime + '+05:30');
  const endDate = new Date(startDate.getTime() + service.duration_minutes * 60000);

  const stillAvailable = await isSlotStillAvailable(staff_id, roomId, startDate, endDate);

  if (!stillAvailable) {
    return res.status(409).json({ error: 'This slot was just booked or blocked. Please choose another time.' });
  }

  // Format as local IST string (YYYY-MM-DD HH:MM:SS) using date components, NOT toISOString()
  const formatForDb = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    // Convert UTC instant back to IST (+5:30)
    const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
    return `${ist.getUTCFullYear()}-${pad(ist.getUTCMonth() + 1)}-${pad(ist.getUTCDate())} ${pad(ist.getUTCHours())}:${pad(ist.getUTCMinutes())}:${pad(ist.getUTCSeconds())}`;
  };

  try {
    const result = await db.execute({
      sql: `INSERT INTO bookings
        (customer_name, customer_email, customer_phone, staff_id, room_id, service_id, start_datetime, end_datetime, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
      args: [
        customer_name, customer_email, customer_phone || '',
        staff_id, roomId, service_id,
        formatForDb(startDate), formatForDb(endDate),
      ],
    });

    res.status(201).json({
      id: Number(result.lastInsertRowid),
      message: 'Booking confirmed',
      start_datetime: startDate,
      end_datetime: endDate,
    });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'This slot was just taken. Please choose another time.' });
    }
    throw err;
  }
});

router.get('/', requireAuth, async (req, res) => {
  const result = await db.execute('SELECT * FROM bookings ORDER BY start_datetime DESC');
  res.json(result.rows);
});

router.put('/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['confirmed', 'completed', 'cancelled', 'no_show'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  await db.execute({
    sql: 'UPDATE bookings SET status = ? WHERE id = ?',
    args: [status, req.params.id],
  });
  res.json({ message: 'Status updated' });
});

router.post('/get/:id', async(req,res) =>{
  const {email}  = req.body;
  if(!email){
    return res.status(400).json({ error: 'Email is required' });
  }
  const booking = await db.execute({
    sql: 'SELECT s.name as service_name, s.price as price,s.duration_minutes as duration, t.name as therapist_name, b.status, b.id, b.start_datetime, b.end_datetime FROM bookings b JOIN services s ON s.id = b.service_id JOIN staff t ON t.id = b.staff_id WHERE b.id = ? and b.customer_email = ?',
    args: [req.params.id, email],
  });
  if(booking.rows.length === 0){
    return res.status(404).json({ error: 'Booking not found' });
  }
  res.json(booking.rows[0]);
})

module.exports = router;