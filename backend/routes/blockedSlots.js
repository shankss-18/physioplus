const express = require('express');
const router = express.Router();
const db = require('../db');
const requireAuth = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  const result = await db.execute('SELECT * FROM blocked_slots ORDER BY start_datetime ASC');
  res.json(result.rows);
});

router.post('/', requireAuth, async (req, res) => {
  const { resource_type, resource_id, start_datetime, end_datetime, reason } = req.body;

  if (!resource_type || !resource_id || !start_datetime || !end_datetime) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!['staff', 'room'].includes(resource_type)) {
    return res.status(400).json({ error: 'resource_type must be "staff" or "room"' });
  }

  const result = await db.execute({
    sql: `INSERT INTO blocked_slots (resource_type, resource_id, start_datetime, end_datetime, reason)
          VALUES (?, ?, ?, ?, ?)`,
    args: [resource_type, resource_id, start_datetime, end_datetime, reason || ''],
  });

  res.status(201).json({ id: Number(result.lastInsertRowid), message: 'Block created' });
});

router.delete('/:id', requireAuth, async (req, res) => {
  await db.execute({
    sql: 'DELETE FROM blocked_slots WHERE id = ?',
    args: [req.params.id],
  });
  res.json({ message: 'Block removed' });
});

module.exports = router;