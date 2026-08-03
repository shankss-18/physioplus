import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { AddServiceModal } from './AddServiceModal';
import { API_BASE_URL } from '../../config';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoxLCJlbWFpbCI6ImFkbWluQHBoeXNpb3BsdXMuY29tIiwiaWF0IjoxNzg1NzM0OTI1LCJleHAiOjE3ODYzMzk3MjV9.5N8kEfnc-COrSaLKnMt3syYOVZAescaadCcZ1ALf2-k";

const Services = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const [services, setServices]       = useState([]);
  const [rooms, setRooms]             = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [svcRes, roomRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/services`),
          fetch(`${API_BASE_URL}/api/rooms`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);
        if (roomRes.status === 401) { navigate('/admin/login'); return; }
        const svcData  = svcRes.ok  ? await svcRes.json()  : [];
        const roomData = roomRes.ok ? await roomRes.json() : [];
        setRooms(roomData);
        // Enrich services with room names
        setServices(
          svcData.map((s) => ({
            ...s,
            room_name: roomData.find((r) => r.id === Number(s.room_id))?.name || '—',
          }))
        );
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const deleteService = async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/services/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) setServices((prev) => prev.filter((s) => s.id !== id));
  };

  function handleServiceAdded(newSvc) {
    setServices((prev) => [...prev, newSvc]);
  }

  return (
    <div className="flex flex-col md:flex-row bg-cream min-h-screen">
      <AdminSidebar />

      <div className="flex-1 px-4 md:px-8 lg:px-12 py-5 mt-5 min-w-0">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-7 gap-4">
          <div>
            <h1 className="text-xl text-teal-deep font-display font-semibold mb-1">Services</h1>
            <p className="text-[11px] md:text-xs font-medium text-gray-600">
              Manage treatments, durations, and pricing
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-white font-semibold tracking-wider shrink-0 bg-clay px-4 py-2 rounded text-[12px] hover:opacity-90 transition"
          >
            + Add Service
          </button>
        </div>

        {loading && (
          <p className="text-sm text-ink/50 mt-10 text-center">Loading services…</p>
        )}

        {!loading && services.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center text-ink/40 text-sm">
            No services yet. Click <span className="font-semibold text-clay">+ Add Service</span> to get started.
          </div>
        )}

        {!loading && services.length > 0 && (
          <>
            {/* ── Desktop table (md+) ── */}
            <div className="hidden md:block overflow-hidden rounded-xl">
              <table className="w-full bg-white">
                <thead>
                  <tr>
                    <th className="text-left text-xs uppercase text-ink/50 p-4">Service</th>
                    <th className="text-left text-xs uppercase text-ink/50 p-4">Room required</th>
                    <th className="text-left text-xs uppercase text-ink/50 p-4">Duration</th>
                    <th className="text-left text-xs uppercase text-ink/50 p-4">Price</th>
                    <th className="text-left text-xs uppercase text-ink/50 p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((svc) => (
                    <tr key={svc.id} className="border-t border-sand-line">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-sm text-teal-deep">{svc.name}</p>
                        {svc.description && svc.description.trim() && (
                          <p className="text-xs text-ink/50 mt-0.5">{svc.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-ink/70">{svc.room_name}</td>
                      <td className="px-4 py-4 text-sm text-ink/70">{svc.duration_minutes} min</td>
                      <td className="px-4 py-4 text-sm font-medium text-ink">
                        ₹{Number(svc.price).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => deleteService(svc.id)}
                          className="text-[11px] cursor-pointer px-3 py-1 font-semibold border border-red-400 rounded-md text-red-400 outline-none hover:bg-red-50 transition"
                        >
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
              {services.map((svc) => (
                <div key={svc.id} className="bg-white rounded-xl p-4 shadow-sm border border-sand-line">
                  {/* Name + price */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-semibold text-sm text-teal-deep">{svc.name}</span>
                    <span className="text-sm font-medium text-ink shrink-0">
                      ₹{Number(svc.price).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Description */}
                  {svc.description && svc.description.trim() && (
                    <p className="text-xs text-ink/50 mb-2">{svc.description}</p>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[11px] bg-cream text-teal-deep px-2 py-0.5 rounded-md font-medium">
                      {svc.duration_minutes} min
                    </span>
                    <span className="text-[11px] text-ink/50">{svc.room_name}</span>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteService(svc.id)}
                    className="text-[11px] cursor-pointer px-3 py-1.5 font-semibold border border-red-400 rounded-md text-red-400 outline-none hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <AddServiceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onServiceAdded={handleServiceAdded}
          token={token}
          rooms={rooms}
        />
      </div>
    </div>
  );
};

export default Services;
