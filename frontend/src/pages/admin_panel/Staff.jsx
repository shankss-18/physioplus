import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { AddStaffModal } from './AddStaffModal';
import { BlockTimeModal } from './BlockTimeModal';
import { API_BASE_URL } from '../../config';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoxLCJlbWFpbCI6ImFkbWluQHBoeXNpb3BsdXMuY29tIiwiaWF0IjoxNzg1NzM0OTI1LCJleHAiOjE3ODYzMzk3MjV9.5N8kEfnc-COrSaLKnMt3syYOVZAescaadCcZ1ALf2-k";

/* Helper: format time "09:00" → "9AM", "17:00" → "5PM" */
function fmtTime(t) {
  const [h, m] = t.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const hour   = h % 12 || 12;
  return m === 0 ? `${hour}${period}` : `${hour}:${String(m).padStart(2,'0')}${period}`;
}

/* Helper: compact working-hours string, e.g. "Mon-Fri 9AM-5PM" */
function formatHours(workingHours) {
  if (!workingHours || workingHours.length === 0) return '—';
  const sorted = [...workingHours].sort((a, b) => a.day_of_week - b.day_of_week);
  const first  = DAY_NAMES[sorted[0].day_of_week];
  const last   = DAY_NAMES[sorted[sorted.length - 1].day_of_week];
  const dayStr = sorted.length === 1 ? first : `${first}-${last}`;
  const { start_time, end_time } = sorted[0];
  return `${dayStr} ${fmtTime(start_time)}-${fmtTime(end_time)}`;
}

const Staff = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const [staff, setStaff]               = useState([]);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [isBlockOpen, setIsBlockOpen]   = useState(false);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const fetchStaff = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/staff`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.status === 401) { navigate('/admin/login'); return; }
        if (res.ok) {
          const data = await res.json();
          setStaff(data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const deleteStaff = async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/staff/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      setStaff((prev) => prev.filter((s) => s.id !== id));
    }
  };

  function handleStaffAdded(newMember) {
    setStaff((prev) => [...prev, { ...newMember, working_hours: [] }]);
  }

  return (
    <div className="flex flex-col md:flex-row bg-cream min-h-screen">
      <AdminSidebar />

      <div className="flex-1 px-4 md:px-8 lg:px-12 py-5 mt-5 min-w-0">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-7 gap-4">
          <div>
            <h1 className="text-xl text-teal-deep font-display font-semibold mb-1">Staff</h1>
            <p className="text-[11px] md:text-xs font-medium text-gray-600">
              Manage therapists, working hours, and time off
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-white font-semibold tracking-wider shrink-0 bg-clay px-4 py-2 rounded text-[12px] hover:opacity-90 transition"
          >
            + Add Staff
          </button>
        </div>

        {loading && (
          <p className="text-sm text-ink/50 mt-10 text-center">Loading staff…</p>
        )}

        {!loading && staff.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center text-ink/40 text-sm">
            No staff yet. Click <span className="font-semibold text-clay">+ Add Staff</span> to get started.
          </div>
        )}

        {/* ── Desktop table (md+) ── */}
        {!loading && staff.length > 0 && (
          <>
            <div className="hidden md:block overflow-hidden rounded-xl">
              <table className="w-full bg-white">
                <thead>
                  <tr>
                    <th className="text-left text-xs uppercase text-ink/50 p-4">Name</th>
                    <th className="text-left text-xs uppercase text-ink/50 p-4">Specialties</th>
                    <th className="text-left text-xs uppercase text-ink/50 p-4">Working Hours</th>
                    <th className="text-left text-xs uppercase text-ink/50 p-4">Status</th>
                    <th className="text-left text-xs uppercase text-ink/50 p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member) => (
                    <tr key={member.id} className="border-t border-sand-line">
                      {/* Name */}
                      <td className="px-4 py-4 font-semibold text-sm text-teal-deep whitespace-nowrap">
                        {member.name}
                      </td>
                      {/* Specialties */}
                      <td className="px-4 py-4 text-sm text-ink/70">
                        {member.specialties || '—'}
                      </td>
                      {/* Working hours */}
                      <td className="px-4 py-4 text-sm text-ink/70 font-mono text-xs">
                        {formatHours(member.working_hours)}
                      </td>
                      {/* Status badge */}
                      <td className="px-4 py-4">
                        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                          member.is_active !== 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {member.is_active !== 0 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsBlockOpen(true)}
                            className="text-[11px] cursor-pointer px-3 py-1 font-semibold border border-danger rounded-md text-danger outline-none hover:bg-red-50 transition"
                          >
                            Block time off
                          </button>
                          <button
                            onClick={() => deleteStaff(member.id)}
                            className="text-[11px] cursor-pointer px-3 py-1 font-semibold border border-red-400 rounded-md text-red-400 outline-none hover:bg-red-50 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards (below md) ── */}
            <div className="flex flex-col gap-3 md:hidden">
              {staff.map((member) => (
                <div key={member.id} className="bg-white rounded-xl p-4 shadow-sm border border-sand-line">
                  {/* Top row: name + status badge */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-semibold text-sm text-teal-deep">{member.name}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                      member.is_active !== 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {member.is_active !== 0 ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Specialties */}
                  {member.specialties && (
                    <p className="text-xs text-ink/60 mb-1">{member.specialties}</p>
                  )}

                  {/* Working hours */}
                  <p className="text-[11px] font-mono text-ink/50 mb-3">
                    {formatHours(member.working_hours)}
                  </p>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setIsBlockOpen(true)}
                      className="text-[11px] cursor-pointer px-3 py-1.5 font-semibold border border-danger rounded-md text-danger outline-none hover:bg-red-50 transition"
                    >
                      Block time off
                    </button>
                    <button
                      onClick={() => deleteStaff(member.id)}
                      className="text-[11px] cursor-pointer px-3 py-1.5 font-semibold border border-red-400 rounded-md text-red-400 outline-none hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <AddStaffModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStaffAdded={handleStaffAdded}
          token={token}
        />

        <BlockTimeModal
          isOpen={isBlockOpen}
          onClose={() => setIsBlockOpen(false)}
          staffList={staff}
          token={token}
        />
      </div>
    </div>
  );
};

export default Staff;