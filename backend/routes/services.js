const express = require("express")
const db = require("../db")
const router = express.Router()
const requireAuth = require("../middleware/auth")

router.get('/', async(req, res) =>{
    const results = await db.execute({
        sql: 'select * from services'
    })
    res.json(results.rows)
})

router.get('/:id', async(req,res) =>{
    const {id} = req.params;
    const results = await db.execute({
        sql:'select * from services where id = ?',
        args: [id]
    })
    if(results.rows.length == 0){
        return res.status(404).json({error: 'service not found'})
    }
    res.json(results.rows[0])
})

router.post('/', requireAuth, async(req,res) =>{
    const {name, description, duration_minutes, price, room_id} = req.body
    if(!name || !duration_minutes || !price || !room_id){
        return res.status(400).json({msg : "Provide valid details"})
    }
    const results = await db.execute({
        sql: 'insert into services (name, description, duration_minutes, price, room_id) values(?,?,?,?,?)',
        args: [name,description || " ", duration_minutes, price, room_id]
    })
    res.status(201).json({id : Number(results.lastInsertRowid), name, description, duration_minutes, price, room_id})
})

router.put('/:id', requireAuth, async(req,res) =>{
    const {id} = req.params
    const {name, description, duration_minutes, price, room_id} = req.body
    if(!name || !duration_minutes || !price || !room_id){
        return res.status(400).json({msg : "Provide valid details"})
    }
    const resluts = await db.execute({
        sql: 'update services set name = ? , description = ? , duration_minutes = ? , price = ? , room_id = ? where id = ?',
        args: [name, description || " ", duration_minutes, price, room_id, id]
    })

    res.status(201).json({"msg" : "updated successfully"})
})

router.delete('/:id', requireAuth, async(req,res) =>{
    const {id} = req.params
    const results = await db.execute({
        sql: 'delete from services where id = ?',
        args : [id]
    })
    res.status(200).json({msg:"Deleted successfully"})
})

module.exports = router