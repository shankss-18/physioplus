require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./db');

createAdmin = async() => {
  const email = 'admin@physioplus.com';
  const plainPassword = 'admin123'; 
  const name = 'Clinic Admin';

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  await db.execute({
    sql: `INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)`,
    args: [email, passwordHash, name],
  });

  console.log('Admin created:', email);
}

createAdmin().catch((err) => console.error('Error:', err));