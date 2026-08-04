require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db')
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const requireAuth = require('./middleware/auth')
const serviceRoutes = require('./routes/services')
const staffRoutes = require('./routes/staff')
const roomRoutes = require('./routes/rooms')
const availabilityRoutes = require('./routes/availability');
const bookingsRoutes = require('./routes/bookings');
const blockedSlotsRoutes = require('./routes/blockedSlots');
const workingHoursRoutes = require('./routes/workingHours');


const app = express();

app.use(cors());
app.use(express.json());

// Health check – used by uptime monitors to keep the server warm
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// One-time migration: add created_at to bookings if missing
app.get('/api/admin/migrate', async (req, res) => {
  try {
    await db.execute(`ALTER TABLE bookings ADD COLUMN created_at TEXT`);
    res.json({ message: 'Migration done: created_at column added.' });
  } catch (e) {
    // Column likely already exists — not an error
    res.json({ message: 'Already migrated or no action needed.', detail: e.message });
  }
});

app.use('/api/blocked-slots', blockedSlotsRoutes);
app.use('/api/working-hours', workingHoursRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/rooms', roomRoutes)

app.post("/login", async(req, res) => {
  const {email, password} = req.body
  if(!email || !password){
    return res.status(401).json({"msg" : "no valid credentials"})
  }

  const results = await db.execute({
    sql:'select * from admins where email = ?',
    args: [email]
  })
  const admin = results.rows[0]
  if(!admin){
    return res.status(401).json({"msg" : "no valid credentials"})
  }
  const isMatched = await bcrypt.compare(password, admin.password_hash)
  if(!isMatched){
    return res.status(401).json({"msg" : "no valid credentials"})
  }
  const jwtToken = jwt.sign({'adminId': admin.id, 'email':admin.email}, process.env.JWT_SECRET, {expiresIn: '7d'})
  res.status(200).json({jwtToken, name : admin.name, email: admin.email})
})

const { seedDatabase } = require('./seeddata');
app.post('/api/admin/reset-database', requireAuth, async (req, res) => {
  try {
    await seedDatabase();
    res.json({ message: 'Database reset to default seed data successfully!' });
  } catch (err) {
    console.error('Reset failed:', err);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});