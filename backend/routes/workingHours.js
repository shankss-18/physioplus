const express = require('express');
const router = express.Router();
const db = require('../db');
const requireAuth = require('../middleware/auth');

router.get('/:staffId', async (req, res) => {
  const result = await db.execute({
    sql: 'SELECT * FROM working_hours WHERE staff_id = ? ORDER BY day_of_week ASC',
    args: [req.params.staffId],
  });
  res.json(result.rows);
});

router.post('/', requireAuth, async (req, res) => {
  const { staff_id, day_of_week, start_time, end_time } = req.body;

  if (staff_id === undefined || day_of_week === undefined || !start_time || !end_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  await db.execute({
    sql: 'DELETE FROM working_hours WHERE staff_id = ? AND day_of_week = ?',
    args: [staff_id, day_of_week],
  });

  const result = await db.execute({
    sql: 'INSERT INTO working_hours (staff_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
    args: [staff_id, day_of_week, start_time, end_time],
  });

  res.status(201).json({ id: Number(result.lastInsertRowid), message: 'Working hours set' });
});

router.delete('/:staffId/:dayOfWeek', requireAuth, async (req, res) => {
  await db.execute({
    sql: 'DELETE FROM working_hours WHERE staff_id = ? AND day_of_week = ?',
    args: [req.params.staffId, req.params.dayOfWeek],
  });
  res.json({ message: 'Working hours removed for that day' });
});

module.exports = router;