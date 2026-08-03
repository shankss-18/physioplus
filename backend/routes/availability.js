const express = require('express');
const router = express.Router();
const db = require('../db');

function combineDateAndTime(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00+05:30`);
}

function overlaps(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

async function getAvailability(staffId, serviceId, dateStr) {
  const serviceResult = await db.execute({
    sql: 'SELECT * FROM services WHERE id = ?',
    args: [serviceId],
  });
  const service = serviceResult.rows[0];
  if (!service) return { error: 'Service not found' };

  const durationMinutes = service.duration_minutes;
  const roomId = service.room_id;

  const dayOfWeek = new Date(dateStr).getDay();

  const hoursResult = await db.execute({
    sql: 'SELECT * FROM working_hours WHERE staff_id = ? AND day_of_week = ?',
    args: [staffId, dayOfWeek],
  });

  if (hoursResult.rows.length === 0) {
    return { slots: [] };
  }
  const workingHours = hoursResult.rows[0];

  const slotLengthMinutes = 30;
  const dayStart = combineDateAndTime(dateStr, workingHours.start_time);
  const dayEnd = combineDateAndTime(dateStr, workingHours.end_time);

  const candidateSlots = [];
  let slotStart = new Date(dayStart);

  while (slotStart < dayEnd) {
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
    if (slotEnd <= dayEnd) {
      candidateSlots.push({ start: new Date(slotStart), end: slotEnd });
    }
    slotStart = new Date(slotStart.getTime() + slotLengthMinutes * 60000);
  }

  const staffBookingsResult = await db.execute({
    sql: `SELECT * FROM bookings WHERE staff_id = ? AND date(start_datetime) = ? AND status = 'confirmed'`,
    args: [staffId, dateStr],
  });

  const roomBookingsResult = await db.execute({
    sql: `SELECT * FROM bookings WHERE room_id = ? AND date(start_datetime) = ? AND status = 'confirmed'`,
    args: [roomId, dateStr],
  });

  const blockedResult = await db.execute({
    sql: `SELECT * FROM blocked_slots WHERE (resource_type = 'staff' AND resource_id = ?) OR (resource_type = 'room' AND resource_id = ?)`,
    args: [staffId, roomId],
  });

  const busyRanges = [
    ...staffBookingsResult.rows,
    ...roomBookingsResult.rows,
    ...blockedResult.rows,
  ].map((row) => ({
    // Stored datetimes are IST wall-clock strings; append +05:30 so JS parses them correctly
    start: new Date(row.start_datetime.replace(' ', 'T') + '+05:30'),
    end: new Date(row.end_datetime.replace(' ', 'T') + '+05:30'),
  }));

  const availableSlots = candidateSlots.filter((slot) => {
    const isBusy = busyRanges.some((busy) =>
      overlaps(slot.start, slot.end, busy.start, busy.end)
    );
    return !isBusy;
  });

  return { slots: availableSlots };
}

router.get('/', async (req, res) => {
  const { staffId, serviceId, date } = req.query;

  if (!staffId || !serviceId || !date) {
    return res.status(400).json({ error: 'staffId, serviceId, and date are all required' });
  }

  const result = await getAvailability(Number(staffId), Number(serviceId), date);

  if (result.error) {
    return res.status(404).json(result);
  }

  res.json(result.slots);
});
router.get('/board', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date is required' });

  const serviceResult = await db.execute({ sql: 'SELECT id, name FROM services' });
  const staffServicesResult = await db.execute({ sql: 'SELECT staff_id, service_id FROM staff_services' });
  const serviceToStaff = {};
  staffServicesResult.rows.forEach(row => {
    if (!serviceToStaff[row.service_id]) serviceToStaff[row.service_id] = [];
    serviceToStaff[row.service_id].push(row.staff_id);
  });

  const results = {};

  for (const service of serviceResult.rows) {
    const staffIds = serviceToStaff[service.id] || [];
    for (const staffId of staffIds) {
      const avail = await getAvailability(staffId, service.id, date);
      if (!avail.error && avail.slots) {
        avail.slots.forEach(slot => {
          const timeMs = new Date(slot.start).getTime();
          if (!results[timeMs]) results[timeMs] = [];
          if (!results[timeMs].includes(service.name)) {
            results[timeMs].push(service.name);
          }
        });
      }
    }
  }

  res.json(results);
});

module.exports = router;