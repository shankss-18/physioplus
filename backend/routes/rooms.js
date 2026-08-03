const express = require("express")
const db = require("../db")
const router = express.Router()
const requireAuth = require("../middleware/auth")

router.get('/', async(req, res) =>{
    const results = await db.execute({
        sql: 'select * from rooms'
    })
    res.json(results.rows)
})

router.post("/", requireAuth, async(req,res) =>{
    const {name, equipment_notes} = req.body
    if(!name){
        return res.status(400).json({msg : "provide valid details"})
    }
    const results = await db.execute({
        sql:'insert into rooms (name, equipment_notes) values (?, ?)',
        args: [name, equipment_notes]
    })
    return res.status(201).json({id: Number(results.lastInsertRowid), name, equipment_notes})
})

router.put("/:id", requireAuth, async(req,res) =>{
    const {name, equipment_notes, is_active} = req.body
    const {id} = req.params
    if(!name){
        return res.status(400).json({msg : "provide valid details"})
    }
    const results = await db.execute({
        sql:'update rooms set name = ?,equipment_notes = ?, is_active = ? where id = ?',
        args: [name, equipment_notes, is_active, id]
    })
    return res.status(201).json({id: Number(results.lastInsertRowid), name, equipment_notes, is_active})
})

router.delete('/:id', requireAuth, async(req,res) =>{
    const {id} = req.params
    const results = await db.execute({
        sql: 'delete from rooms where id = ?',
        args: [id]
    })
    res.status(200).json({msg: "deleted !"})
})

module.exports = router