require('dotenv').config();
const bcrypt = require('bcrypt');
const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ---- CONFIG ----
const CLEAR_EXISTING_DATA = true; // set to false if you want to keep existing rows and just add more
const DAYS_IN_PAST = 14;
const DAYS_IN_FUTURE = 14;
const TIMEZONE_OFFSET = '+05:30'; // IST, matches the rest of the backend

// ---- HELPERS ----
function pad(n) { return n.toString().padStart(2, '0'); }

function formatDbDatetime(date) {
  // e.g. "2026-08-03 09:00:00" — matches the format used in your bookings/blocked_slots tables
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

function addMinutes(date, mins) {
  return new Date(date.getTime() + mins * 60000);
}

function overlaps(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBool(chance = 0.5) {
  return Math.random() < chance;
}

// ---- SAMPLE DATA DEFINITIONS ----

const ROOMS = [
  { name: 'Room 1', equipment_notes: 'General treatment room' },
  { name: 'Room 2', equipment_notes: 'Treatment table, resistance bands, exercise mats' },
  { name: 'Room 3', equipment_notes: 'Electrotherapy unit, TENS machine' },
  { name: 'Ultrasound Room', equipment_notes: 'Ultrasound therapy machine' },
];

const STAFF = [
  { name: 'Dr. Priya Rao', specialties: 'Sports injury, Ultrasound therapy', photo_url: '' },
  { name: 'Dr. Arjun Mehta', specialties: 'General physiotherapy, Consultation', photo_url: '' },
  { name: 'Dr. Kavya Nair', specialties: 'Posture correction, Rehab exercise', photo_url: '' },
  { name: 'Dr. Rohan Malhotra', specialties: 'Sports injury, Deep tissue therapy', photo_url: '' },
  { name: 'Dr. Ishita Sharma', specialties: 'Electrotherapy, General physiotherapy', photo_url: '' },
  { name: 'Dr. Vikram Desai', specialties: 'Rehab exercise, Consultation', photo_url: '' },
];

// room assigned by name below, resolved to real IDs after rooms are inserted
const SERVICES = [
  { name: 'Initial Consultation', description: 'First-visit assessment', duration_minutes: 30, price: 500, roomName: 'Room 1' },
  { name: 'Follow-up Consultation', description: 'Quick check-in visit', duration_minutes: 15, price: 250, roomName: 'Room 1' },
  { name: 'Sports Massage', description: 'Deep tissue sports massage', duration_minutes: 45, price: 800, roomName: 'Room 1' },
  { name: 'Deep Tissue Therapy', description: 'Targeted muscle recovery therapy', duration_minutes: 60, price: 1200, roomName: 'Room 2' },
  { name: 'Posture Correction', description: 'Assessment and correction plan', duration_minutes: 40, price: 700, roomName: 'Room 2' },
  { name: 'Rehab Exercise Session', description: 'Guided rehabilitation exercises', duration_minutes: 50, price: 850, roomName: 'Room 3' },
  { name: 'Electrotherapy', description: 'TENS-based pain relief treatment', duration_minutes: 30, price: 900, roomName: 'Room 3' },
  { name: 'Ultrasound Therapy', description: 'Ultrasound-based deep tissue treatment', duration_minutes: 30, price: 1000, roomName: 'Ultrasound Room' },
];

// which staff can perform which services, matched loosely to specialties
const STAFF_SERVICE_MAP = {
  'Dr. Priya Rao': ['Initial Consultation', 'Sports Massage', 'Ultrasound Therapy'],
  'Dr. Arjun Mehta': ['Initial Consultation', 'Follow-up Consultation', 'Posture Correction'],
  'Dr. Kavya Nair': ['Posture Correction', 'Rehab Exercise Session', 'Follow-up Consultation'],
  'Dr. Rohan Malhotra': ['Sports Massage', 'Deep Tissue Therapy', 'Initial Consultation'],
  'Dr. Ishita Sharma': ['Electrotherapy', 'Follow-up Consultation', 'Deep Tissue Therapy'],
  'Dr. Vikram Desai': ['Rehab Exercise Session', 'Initial Consultation', 'Electrotherapy'],
};

const FIRST_NAMES = ['Ananya', 'Ravi', 'Sneha', 'Karan', 'Meera', 'Aditya', 'Divya', 'Rahul', 'Pooja', 'Vikas', 'Nisha', 'Sanjay', 'Anjali', 'Manoj', 'Kavita', 'Suresh', 'Neha', 'Amit', 'Priyanka', 'Deepak'];
const LAST_NAMES = ['Kosuru', 'Kumar', 'Iyer', 'Singh', 'Reddy', 'Sharma', 'Gupta', 'Nair', 'Patel', 'Rao', 'Mehta', 'Verma', 'Joshi', 'Chaudhary', 'Pillai'];

function randomCustomerName() {
  return `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;
}

function randomEmail(name) {
  const clean = name.toLowerCase().replace(' ', '.');
  return `${clean}${Math.floor(Math.random() * 999)}@example.com`;
}

function randomPhone() {
  return `9${Math.floor(100000000 + Math.random() * 899999999)}`;
}

// ---- MAIN SCRIPT ----

async function clearExistingData() {
  console.log('Clearing existing data...');
  await client.execute('DELETE FROM bookings');
  await client.execute('DELETE FROM blocked_slots');
  await client.execute('DELETE FROM working_hours');
  await client.execute('DELETE FROM staff_services');
  await client.execute('DELETE FROM services');
  await client.execute('DELETE FROM staff');
  await client.execute('DELETE FROM rooms');
  console.log('Existing data cleared.\n');
}

async function insertRooms() {
  const roomIds = {};
  for (const room of ROOMS) {
    const result = await client.execute({
      sql: 'INSERT INTO rooms (name, equipment_notes, is_active) VALUES (?, ?, 1)',
      args: [room.name, room.equipment_notes],
    });
    roomIds[room.name] = Number(result.lastInsertRowid);
  }
  console.log(`Inserted ${ROOMS.length} rooms.`);
  return roomIds;
}

async function insertStaff() {
  const staffIds = {};
  for (const person of STAFF) {
    const result = await client.execute({
      sql: 'INSERT INTO staff (name, specialties, photo_url) VALUES (?, ?, ?)',
      args: [person.name, person.specialties, person.photo_url],
    });
    staffIds[person.name] = Number(result.lastInsertRowid);
  }
  console.log(`Inserted ${STAFF.length} staff members.`);
  return staffIds;
}

async function insertServices(roomIds) {
  const serviceIds = {};
  const serviceDetails = {};
  for (const service of SERVICES) {
    const roomId = roomIds[service.roomName];
    const result = await client.execute({
      sql: 'INSERT INTO services (name, description, duration_minutes, price, room_id) VALUES (?, ?, ?, ?, ?)',
      args: [service.name, service.description, service.duration_minutes, service.price, roomId],
    });
    const id = Number(result.lastInsertRowid);
    serviceIds[service.name] = id;
    serviceDetails[id] = { ...service, room_id: roomId };
  }
  console.log(`Inserted ${SERVICES.length} services.`);
  return { serviceIds, serviceDetails };
}

async function insertStaffServices(staffIds, serviceIds) {
  let count = 0;
  for (const [staffName, serviceNames] of Object.entries(STAFF_SERVICE_MAP)) {
    for (const serviceName of serviceNames) {
      await client.execute({
        sql: 'INSERT INTO staff_services (staff_id, service_id) VALUES (?, ?)',
        args: [staffIds[staffName], serviceIds[serviceName]],
      });
      count++;
    }
  }
  console.log(`Inserted ${count} staff-service links.`);
}

async function insertWorkingHours(staffIds) {
  let count = 0;
  for (const staffName of Object.keys(staffIds)) {
    const staffId = staffIds[staffName];
    // Mon-Fri 9-17 for everyone, plus a Saturday half-day for two of the six staff
    for (let day = 1; day <= 5; day++) {
      await client.execute({
        sql: 'INSERT INTO working_hours (staff_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
        args: [staffId, day, '09:00', '17:00'],
      });
      count++;
    }
  }
  // Saturday half-days for Priya and Rohan
  for (const name of ['Dr. Priya Rao', 'Dr. Rohan Malhotra']) {
    await client.execute({
      sql: 'INSERT INTO working_hours (staff_id, day_of_week, start_time, end_time) VALUES (?, 6, ?, ?)',
      args: [staffIds[name], '09:00', '13:00'],
    });
    count++;
  }
  console.log(`Inserted ${count} working hour blocks.`);
}

async function insertAdmin() {
  const email = 'admin@physioplus.com';
  const existing = await client.execute({ sql: 'SELECT id FROM admins WHERE email = ?', args: [email] });
  if (existing.rows.length > 0) {
    console.log('Admin already exists, skipping.');
    return;
  }
  const passwordHash = await bcrypt.hash('admin123', 10);
  await client.execute({
    sql: 'INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)',
    args: [email, passwordHash, 'Clinic Admin'],
  });
  console.log('Inserted admin account (admin@physioplus.com / admin123).');
}

async function insertBlockedSlots(staffIds, roomIds) {
  const today = new Date();
  const blocks = [
    { type: 'room', id: roomIds['Ultrasound Room'], dayOffset: 0, startHour: 14, endHour: 15, reason: 'Equipment maintenance' },
    { type: 'room', id: roomIds['Room 3'], dayOffset: 2, startHour: 11, endHour: 12, reason: 'Electrotherapy unit calibration' },
    { type: 'staff', id: staffIds['Dr. Priya Rao'], dayOffset: -3, startHour: 13, endHour: 14, reason: 'Lunch break extended' },
    { type: 'staff', id: staffIds['Dr. Arjun Mehta'], dayOffset: 4, startHour: 9, endHour: 17, reason: 'Conference — full day off' },
    { type: 'staff', id: staffIds['Dr. Kavya Nair'], dayOffset: -1, startHour: 15, endHour: 16, reason: 'Staff meeting' },
    { type: 'room', id: roomIds['Room 1'], dayOffset: 6, startHour: 9, endHour: 10, reason: 'Deep cleaning' },
    { type: 'staff', id: staffIds['Dr. Vikram Desai'], dayOffset: -6, startHour: 9, endHour: 12, reason: 'Personal leave' },
    { type: 'room', id: roomIds['Ultrasound Room'], dayOffset: 8, startHour: 10, endHour: 11, reason: 'Equipment servicing' },
  ];

  for (const block of blocks) {
    const day = new Date(today);
    day.setDate(day.getDate() + block.dayOffset);
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), block.startHour, 0);
    const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), block.endHour, 0);

    await client.execute({
      sql: 'INSERT INTO blocked_slots (resource_type, resource_id, start_datetime, end_datetime, reason) VALUES (?, ?, ?, ?, ?)',
      args: [block.type, block.id, formatDbDatetime(start), formatDbDatetime(end), block.reason],
    });
  }
  console.log(`Inserted ${blocks.length} blocked slots.`);
  return blocks;
}

async function insertBookings(staffIds, serviceIds, serviceDetails, blockedSlots) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Track busy ranges as we generate, so nothing double-books
  const staffBusy = {}; // staffId -> [{start, end}]
  const roomBusy = {};  // roomId -> [{start, end}]

  Object.values(staffIds).forEach((id) => (staffBusy[id] = []));
  Object.values(serviceDetails).forEach((s) => (roomBusy[s.room_id] = roomBusy[s.room_id] || []));

  // seed busy ranges with the blocked slots we just created, so bookings don't land on top of them
  for (const block of blockedSlots) {
    const day = new Date(today);
    day.setDate(day.getDate() + block.dayOffset);
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), block.startHour, 0);
    const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), block.endHour, 0);
    if (block.type === 'staff') staffBusy[block.id].push({ start, end });
    if (block.type === 'room') {
      // apply to whichever room this is, across all service room_ids that match
      Object.values(serviceDetails).forEach((s) => {
        if (s.room_id === block.id) roomBusy[block.id] = roomBusy[block.id] || [];
      });
      roomBusy[block.id] = roomBusy[block.id] || [];
      roomBusy[block.id].push({ start, end });
    }
  }

  const staffNames = Object.keys(staffIds);
  let bookingsCreated = 0;
  const bookingRows = [];

  for (let dayOffset = -DAYS_IN_PAST; dayOffset <= DAYS_IN_FUTURE; dayOffset++) {
    const day = new Date(today);
    day.setDate(day.getDate() + dayOffset);
    const dow = day.getDay();
    if (dow === 0) continue; // skip Sundays, clinic closed

    for (const staffName of staffNames) {
      const staffId = staffIds[staffName];
      const isPast = dayOffset < 0;
      const isToday = dayOffset === 0;

      // 2-4 bookings per staff per day
      const bookingsToday = 2 + Math.floor(Math.random() * 3);
      let cursor = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 0);
      const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), dow === 6 ? 13 : 17, 0);

      const eligibleServices = STAFF_SERVICE_MAP[staffName].map((name) => serviceIds[name]);

      for (let i = 0; i < bookingsToday && cursor < dayEnd; i++) {
        const serviceId = randomFrom(eligibleServices);
        const service = serviceDetails[serviceId];
        const start = new Date(cursor);
        const end = addMinutes(start, service.duration_minutes);

        if (end > dayEnd) break;

        const staffConflict = staffBusy[staffId].some((r) => overlaps(start, end, r.start, r.end));
        const roomConflict = (roomBusy[service.room_id] || []).some((r) => overlaps(start, end, r.start, r.end));

        if (staffConflict || roomConflict) {
          cursor = addMinutes(cursor, 15); // nudge forward and try the next loop iteration
          continue;
        }

        // Determine a realistic status
        let status = 'confirmed';
        if (isPast) {
          const roll = Math.random();
          status = roll < 0.82 ? 'completed' : roll < 0.93 ? 'no_show' : 'cancelled';
        } else if (!isToday && randomBool(0.05)) {
          status = 'cancelled';
        }

        const customerName = randomCustomerName();
        const depositPaid = randomBool(0.6) ? 1 : 0;

        bookingRows.push({
          customer_name: customerName,
          customer_email: randomEmail(customerName),
          customer_phone: randomPhone(),
          staff_id: staffId,
          room_id: service.room_id,
          service_id: serviceId,
          start_datetime: formatDbDatetime(start),
          end_datetime: formatDbDatetime(end),
          status,
          deposit_paid: depositPaid,
          stripe_payment_id: depositPaid ? `pi_test_${Math.random().toString(36).slice(2, 12)}` : null,
          // Simulate booking created 1-72 hours before the appointment
          created_at: formatDbDatetime(addMinutes(start, -(Math.floor(Math.random() * 4320) + 60))),
        });

        staffBusy[staffId].push({ start, end });
        roomBusy[service.room_id] = roomBusy[service.room_id] || [];
        roomBusy[service.room_id].push({ start, end });

        cursor = addMinutes(end, 15); // small buffer between appointments
        bookingsCreated++;
      }
    }
  }

  // Insert in batches for speed
  for (const row of bookingRows) {
    await client.execute({
      sql: `INSERT INTO bookings
        (customer_name, customer_email, customer_phone, staff_id, room_id, service_id, start_datetime, end_datetime, status, deposit_paid, stripe_payment_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        row.customer_name, row.customer_email, row.customer_phone,
        row.staff_id, row.room_id, row.service_id,
        row.start_datetime, row.end_datetime, row.status,
        row.deposit_paid, row.stripe_payment_id, row.created_at,
      ],
    });
  }

  console.log(`Inserted ${bookingsCreated} bookings spanning ${DAYS_IN_PAST} days back to ${DAYS_IN_FUTURE} days ahead.`);
}

async function run() {
  console.log('Starting seed...\n');

  if (CLEAR_EXISTING_DATA) {
    await clearExistingData();
  }

  const roomIds = await insertRooms();
  const staffIds = await insertStaff();
  const { serviceIds, serviceDetails } = await insertServices(roomIds);
  await insertStaffServices(staffIds, serviceIds);
  await insertWorkingHours(staffIds);
  await insertAdmin();
  const blockedSlots = await insertBlockedSlots(staffIds, roomIds);
  await insertBookings(staffIds, serviceIds, serviceDetails, blockedSlots);

  console.log('\nSeed complete.');
  console.log('Admin login: admin@physioplus.com / admin123');
}

if (require.main === module) {
  run().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}

module.exports = { seedDatabase: run };