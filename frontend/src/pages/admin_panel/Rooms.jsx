import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from "../../components/AdminSidebar"
import { AddRoomModal } from './AddRoomModal'
import { API_BASE_URL } from '../../config';


const Rooms = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || '';

    const [rooms, setRooms] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() =>{
        const getRooms = async() =>{
            const res = await fetch(`${API_BASE_URL}/api/rooms`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            })
            if(res.ok){
                const data = await res.json()
                setRooms(data)
            } else if (res.status === 401) {
                navigate('/admin/login')
            } else {
                const data = await res.json()
                console.log(data.msg)
            }
        }
        getRooms()
    }, [])

    const toggleRoomStatus = async(id, currentStatus, name, equipment_notes) =>{
        const res = await fetch(`${API_BASE_URL}/api/rooms/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                name,
                equipment_notes,
                is_active: currentStatus ? 0 : 1
            })
        })
        if(res.ok){
            setRooms(rooms.map(room => room.id === id ? {...room, is_active: currentStatus ? 0 : 1} : room))
        }
    }

    const deleteRoom = async(id) => {
        const res = await fetch(`${API_BASE_URL}/api/rooms/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        })
        if(res.ok){
            setRooms(rooms.filter(room => room.id !== id))
        }
    }

    function handleRoomAdded(newRoom) {
        setRooms((prev) => [...prev, newRoom]);
    }

    return (
    <div className="flex flex-col md:flex-row bg-cream min-h-screen">
      <AdminSidebar />
      <div className="flex-1 px-4 md:px-8 lg:px-12 py-5 mt-5 min-w-0">

        {/* Header */}
        <div className='flex items-center justify-between mb-7'>
            <div>
                <h1 className='text-xl text-teal-deep font-display font-semibold mb-2'>Rooms &amp; Equipment</h1>
                <p className='text-[11px] md:text-xs font-medium text-gray-600'>Mark a room under maintenance to block it instantly</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className='text-white font-semibold tracking-wider self-center bg-clay px-4 py-2 rounded text-[12px]'>+ Add Room</button>
        </div>

        {/* ── Desktop table (md+) ── */}
        <div className="hidden md:block overflow-hidden rounded-xl">
          <table className="w-full bg-white">
            <thead>
              <tr>
                <th className="text-left text-xs uppercase text-ink/50 p-4">Room</th>
                <th className="text-left text-xs uppercase text-ink/50 p-4">Equipment</th>
                <th className="text-left text-xs uppercase text-ink/50 p-4">Status</th>
                <th className="text-left text-xs uppercase text-ink/50 p-4">Action</th>
                <th className="text-left text-xs uppercase text-ink/50 p-4">Delete</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className="border-t border-sand-line">
                  <td className="px-4 py-3 font-semibold text-sm">{room.name}</td>
                  <td className="px-4 py-3 text-sm text-ink/70">{room.equipment_notes}</td>
                  <td className="px-4 py-3 text-sm capitalize">{room.is_active ? "Active" : "Maintenance"}</td>
                  <td className="px-4 py-3">
                    {room.is_active
                      ? <button onClick={() => toggleRoomStatus(room.id, room.is_active, room.name, room.equipment_notes)}
                          className='text-[11px] cursor-pointer px-3 py-1 font-semibold border border-danger rounded-md text-danger outline-none'>
                          Mark maintenance
                        </button>
                      : <button onClick={() => toggleRoomStatus(room.id, room.is_active, room.name, room.equipment_notes)}
                          className='text-[11px] cursor-pointer px-3 py-1 font-semibold border border-green-600 outline-none rounded-md text-green-600'>
                          Mark active
                        </button>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteRoom(room.id)}
                      className='text-[11px] cursor-pointer px-3 py-1 font-semibold border border-red-400 rounded-md text-red-400 outline-none hover:bg-red-50 transition'>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Mobile cards (below md) ── */}
        <div className="flex flex-col gap-3 md:hidden">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl p-4 shadow-sm border border-sand-line">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-semibold text-sm text-teal-deep">{room.name}</span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${
                  room.is_active ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'
                }`}>
                  {room.is_active ? 'Active' : 'Maintenance'}
                </span>
              </div>
              {room.equipment_notes && (
                <p className="text-xs text-ink/60 mb-3">{room.equipment_notes}</p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                {room.is_active
                  ? <button onClick={() => toggleRoomStatus(room.id, room.is_active, room.name, room.equipment_notes)}
                      className='text-[11px] cursor-pointer px-3 py-1.5 font-semibold border border-danger rounded-md text-danger outline-none'>
                      Mark maintenance
                    </button>
                  : <button onClick={() => toggleRoomStatus(room.id, room.is_active, room.name, room.equipment_notes)}
                      className='text-[11px] cursor-pointer px-3 py-1.5 font-semibold border border-green-600 rounded-md text-green-600 outline-none'>
                      Mark active
                    </button>
                }
                <button onClick={() => deleteRoom(room.id)}
                  className='text-[11px] cursor-pointer px-3 py-1.5 font-semibold border border-red-400 rounded-md text-red-400 outline-none hover:bg-red-50 transition'>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <AddRoomModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onRoomAdded={handleRoomAdded}
            token={token}
        />

      </div>
    </div>
  );
}

export default Rooms