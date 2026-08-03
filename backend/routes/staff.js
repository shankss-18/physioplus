const express = require("express")
const db = require("../db")
const router = express.Router()
const requireAuth = require("../middleware/auth")

// GET all staff with their working hours
router.get('/', async(req, res) => {
    const staffResult = await db.execute({ sql: 'SELECT * FROM staff' })
    const staff = staffResult.rows

    // Fetch working hours for all staff in one query
    const hoursResult = await db.execute({ sql: 'SELECT * FROM working_hours ORDER BY day_of_week ASC' })
    const allHours = hoursResult.rows

    // Attach working hours to each staff member
    const staffWithHours = staff.map(member => ({
        ...member,
        working_hours: allHours.filter(h => Number(h.staff_id) === Number(member.id))
    }))

    res.json(staffWithHours)
})

// GET single staff member with working hours
router.get('/:id', async(req, res) => {
    const staffResult = await db.execute({
        sql: 'SELECT * FROM staff WHERE id = ?',
        args: [req.params.id]
    })
    if (!staffResult.rows[0]) return res.status(404).json({ msg: 'Staff not found' })

    const hoursResult = await db.execute({
        sql: 'SELECT * FROM working_hours WHERE staff_id = ? ORDER BY day_of_week ASC',
        args: [req.params.id]
    })

    res.json({ ...staffResult.rows[0], working_hours: hoursResult.rows })
})

// POST — create staff member
router.post('/', requireAuth, async(req, res) => {
    const { name, specialties, photo_url } = req.body
    if (!name) {
        return res.status(400).json({ msg: "provide valid details" })
    }
    const results = await db.execute({
        sql: "INSERT INTO staff (name, specialties, photo_url) VALUES (?, ?, ?)",
        args: [name, specialties || '', photo_url || '']
    })
    return res.status(201).json({ id: Number(results.lastInsertRowid), name, specialties, photo_url })
})

// PUT — update staff member
router.put('/:id', requireAuth, async(req, res) => {
    const { name, specialties, photo_url, is_active } = req.body
    const { id } = req.params

    // Build dynamic update — only update provided fields
    const fields = []
    const args = []
    if (name !== undefined)       { fields.push('name = ?');       args.push(name) }
    if (specialties !== undefined){ fields.push('specialties = ?'); args.push(specialties) }
    if (photo_url !== undefined)  { fields.push('photo_url = ?');  args.push(photo_url) }
    if (is_active !== undefined)  { fields.push('is_active = ?');  args.push(is_active) }

    if (fields.length === 0) return res.status(400).json({ msg: 'Nothing to update' })

    args.push(id)
    await db.execute({ sql: `UPDATE staff SET ${fields.join(', ')} WHERE id = ?`, args })
    res.json({ msg: 'Staff updated' })
})

// DELETE — remove staff member (cascades to working_hours if FK set, otherwise manual delete)
router.delete('/:id', requireAuth, async(req, res) => {
    const { id } = req.params
    // Delete working hours first to avoid FK violations
    await db.execute({ sql: 'DELETE FROM working_hours WHERE staff_id = ?', args: [id] })
    await db.execute({ sql: 'DELETE FROM staff WHERE id = ?', args: [id] })
    return res.status(200).json({ msg: "Deleted successfully" })
})

module.exports = router