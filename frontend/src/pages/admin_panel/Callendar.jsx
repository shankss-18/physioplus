import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { BlockTimeModal } from './BlockTimeModal';
import { API_BASE_URL } from '../../config';

const BASE = `${API_BASE_URL}/api`;

/* ── Booking Detail Modal ── */
function BookingDetailModal({ booking, service, staff, room, onClose, onStatusChange, authHdr }) {
  const [status, setStatus] = useState(booking?.status || 'confirmed');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (booking) setStatus(booking.status);
  }, [booking]);

  if (!booking) return null;

  const statusConfig = {
    confirmed:  { label: 'Confirmed',  bg: 'bg-teal/10',      text: 'text-teal',      dot: 'bg-teal'       },
    completed:  { label: 'Completed',  bg: 'bg-green-50',     text: 'text-green-600', dot: 'bg-green-500'  },
    cancelled:  { label: 'Cancelled',  bg: 'bg-red-50',       text: 'text-red-500',   dot: 'bg-red-400'    },
    no_show:    { label: 'No Show',    bg: 'bg-orange-50',    text: 'text-orange-500',dot: 'bg-orange-400' },
  };
  const sc = statusConfig[status] || statusConfig.confirmed;

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`${BASE}/bookings/${booking.id}/status`, {
        method: 'PUT',
        headers: authHdr,
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        onStatusChange(booking.id, newStatus);
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        style={{ animation: 'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-deep to-teal px-6 py-5 flex items-start justify-between">
          <div>
            <p className="text-[11px] text-white/60 uppercase tracking-widest font-semibold mb-0.5">Booking #{booking.id}</p>
            <h2 className="text-white text-lg font-display font-bold leading-tight">
              {service?.name || '—'}
            </h2>
            <p className="text-white/70 text-xs mt-0.5">{fmtDateLong(new Date(String(booking.start_datetime).replace(' ', 'T') + '+05:30'))}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition text-xl leading-none mt-0.5"
            aria-label="Close"
          >✕</button>
        </div>

        {/* Status bar */}
        <div className={`px-6 py-2.5 flex items-center gap-2 ${sc.bg} border-b border-sand-line`}>
          <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
          <span className={`text-xs font-semibold ${sc.text}`}>{sc.label}</span>
          <span className="text-ink/30 mx-1">·</span>
          <span className="text-xs text-ink/50 font-mono">
            {fmtTime12(booking.start_datetime)} — {fmtTime12(booking.end_datetime)}
          </span>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Customer */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-ink/40 font-semibold mb-2">Customer</p>
            <div className="bg-cream rounded-xl px-4 py-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-teal/10 text-teal flex items-center justify-center text-sm font-bold">
                  {(booking.customer_name || '?')[0].toUpperCase()}
                </span>
                <span className="font-semibold text-ink text-sm">{booking.customer_name || '—'}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 pl-9">
                {booking.customer_email && (
                  <span className="text-xs text-ink/60">✉ {booking.customer_email}</span>
                )}
                {booking.customer_phone && (
                  <span className="text-xs font-mono text-ink/60">📞 {booking.customer_phone}</span>
                )}
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-ink/40 font-semibold mb-2">Service Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cream rounded-xl px-4 py-3">
                <p className="text-[10px] text-ink/40 uppercase tracking-wider mb-1">Service</p>
                <p className="text-sm font-semibold text-teal-deep">{service?.name || '—'}</p>
                {service?.description && (
                  <p className="text-xs text-ink/50 mt-0.5">{service.description}</p>
                )}
              </div>
              <div className="bg-cream rounded-xl px-4 py-3">
                <p className="text-[10px] text-ink/40 uppercase tracking-wider mb-1">Duration & Price</p>
                <p className="text-sm font-semibold text-ink">{service?.duration_minutes || '—'} min</p>
                {service?.price && (
                  <p className="text-xs text-teal font-semibold mt-0.5">₹{service.price}</p>
                )}
              </div>
            </div>
          </div>

          {/* Staff & Room */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-ink/40 font-semibold mb-2">Assigned Resources</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cream rounded-xl px-4 py-3">
                <p className="text-[10px] text-ink/40 uppercase tracking-wider mb-1">Therapist</p>
                <p className="text-sm font-semibold text-teal-deep">{staff?.name || '—'}</p>
                {staff?.specialization && (
                  <p className="text-xs text-ink/50 mt-0.5">{staff.specialization}</p>
                )}
              </div>
              <div className="bg-cream rounded-xl px-4 py-3">
                <p className="text-[10px] text-ink/40 uppercase tracking-wider mb-1">Room</p>
                <p className="text-sm font-semibold text-teal-deep">{room?.name || '—'}</p>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-ink/40 font-semibold mb-2">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {['confirmed','completed','cancelled','no_show'].map((s) => (
                <button
                  key={s}
                  disabled={updating || status === s}
                  onClick={() => handleStatusChange(s)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                    status === s
                      ? `${statusConfig[s].bg} ${statusConfig[s].text} border-transparent cursor-default`
                      : 'border-sand-line text-ink/50 hover:border-teal hover:text-teal bg-white'
                  } disabled:opacity-50`}
                >
                  {statusConfig[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-cream border-t border-sand-line flex justify-end">
          <button
            onClick={onClose}
            className="text-sm font-semibold px-5 py-2 rounded-lg bg-teal-deep text-white hover:opacity-90 transition"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ── date helpers ── */
function toDateStr(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getWeekDates(anchor) {
  const day = anchor.getDay(); // 0=Sun
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - ((day + 6) % 7)); // roll back to Mon
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function fmtTime12(isoOrStr) {
  const str = String(isoOrStr).replace(' ', 'T');
  const d = new Date(str.includes('+') ? str : str + '+05:30');
  const h = d.getHours(), m = d.getMinutes();
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12}:00 ${period}` : `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function fmtDateLong(d) {
  return d.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });
}

function sameDay(dateStr, d) {
  return dateStr.startsWith(toDateStr(d));
}

/* ─────────────────────────────────────────── */
const Calendar = () => {
  const navigate  = useNavigate();
  const today = new Date();

  const [weekAnchor, setWeekAnchor]     = useState(today);
  const [selectedDay, setSelectedDay]   = useState(today);
  const [bookings, setBookings]         = useState([]);
  const [blocks, setBlocks]             = useState([]);
  const [staff, setStaff]               = useState([]);
  const [rooms, setRooms]               = useState([]);
  const [services, setServices]         = useState([]);
  const [isBlockOpen, setIsBlockOpen]   = useState(false);
  const [loading, setLoading]           = useState(true);
  const [detailBooking, setDetailBooking] = useState(null);

  const weekDates = getWeekDates(weekAnchor);

  const TOKEN = localStorage.getItem('token') || '';
  const authHdr = { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

  /* ── Fetch all data ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, blRes, stRes, rRes, svRes] = await Promise.all([
        fetch(`${BASE}/bookings`, { headers: authHdr }),
        fetch(`${BASE}/blocked-slots`, { headers: authHdr }),
        fetch(`${BASE}/staff`, { headers: authHdr }),
        fetch(`${BASE}/rooms`, { headers: authHdr }),
        fetch(`${BASE}/services`),
      ]);
      if (bRes.status === 401) { navigate('/admin/login'); return; }
      setBookings(bRes.ok   ? await bRes.json()  : []);
      setBlocks(blRes.ok    ? await blRes.json() : []);
      setStaff(stRes.ok     ? await stRes.json() : []);
      setRooms(rRes.ok      ? await rRes.json()  : []);
      setServices(svRes.ok  ? await svRes.json() : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Lookup helpers ── */
  const getStaff   = (id) => staff.find((s)  => Number(s.id) === Number(id));
  const getRoom    = (id) => rooms.find((r)   => Number(r.id) === Number(id));
  const getService = (id) => services.find((s) => Number(s.id) === Number(id));

  /* ── Bookings for selected day ── */
  const dayBookings = bookings
    .filter((b) => sameDay(b.start_datetime, selectedDay) && b.status === 'confirmed')
    .sort((a, b) => a.start_datetime.localeCompare(b.start_datetime));

  /* ── Blocks for selected day ── */
  const dayBlocks = blocks
    .filter((bl) => sameDay(bl.start_datetime, selectedDay))
    .sort((a, b) => a.start_datetime.localeCompare(b.start_datetime));

  /* ── Booking count per day for the week strip ── */
  const bookingsPerDay = weekDates.map((d) =>
    bookings.filter((b) => sameDay(b.start_datetime, d) && b.status === 'confirmed').length
  );

  /* ── Delete a block ── */
  const deleteBlock = async (id) => {
    const res = await fetch(`${BASE}/blocked-slots/${id}`, {
      method: 'DELETE',
      headers: authHdr,
    });
    if (res.ok) setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  /* ── Update booking status in local state ── */
  const handleStatusChange = (bookingId, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => Number(b.id) === Number(bookingId) ? { ...b, status: newStatus } : b)
    );
    if (detailBooking && Number(detailBooking.id) === Number(bookingId)) {
      setDetailBooking((prev) => ({ ...prev, status: newStatus }));
    }
  };

  /* ── Week navigation ── */
  const prevWeek = () => {
    const d = new Date(weekAnchor);
    d.setDate(d.getDate() - 7);
    setWeekAnchor(d);
    setSelectedDay(d);
  };
  const nextWeek = () => {
    const d = new Date(weekAnchor);
    d.setDate(d.getDate() + 7);
    setWeekAnchor(d);
    setSelectedDay(d);
  };

  /* ── Merged slot rows for the day detail table ── */
  const dayRows = [
    ...dayBookings.map((b) => ({ type: 'booking', data: b })),
    ...dayBlocks.map((bl) => ({ type: 'block', data: bl })),
  ].sort((a, b) =>
    a.data.start_datetime.localeCompare(b.data.start_datetime)
  );

  /* ── Active blocks (all future / ongoing) ── */
  const activeBlocks = blocks
    .filter((bl) => sameDay(bl.start_datetime, selectedDay))
    .sort((a, b) => a.start_datetime.localeCompare(b.start_datetime));

  return (
    <div className="flex flex-col md:flex-row bg-cream min-h-screen">
      <AdminSidebar />

      <div className="flex-1 px-4 md:px-8 lg:px-10 py-5 mt-5 min-w-0">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl text-teal-deep font-display font-semibold mb-1">Calendar</h1>
            <p className="text-[11px] md:text-xs text-ink/50">
              Week of {weekDates[0].toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}
              {' — '}
              <span className="text-teal underline cursor-default">filter by therapist or room</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={prevWeek} className="w-8 h-8 flex items-center justify-center rounded-md border border-sand-line text-ink/50 hover:text-teal-deep hover:border-teal-deep transition text-sm">‹</button>
            <button onClick={nextWeek} className="w-8 h-8 flex items-center justify-center rounded-md border border-sand-line text-ink/50 hover:text-teal-deep hover:border-teal-deep transition text-sm">›</button>
            <button
              onClick={() => setIsBlockOpen(true)}
              className="bg-clay text-white font-semibold text-[12px] px-4 py-2 rounded hover:opacity-90 transition"
            >
              + Block Time
            </button>
          </div>
        </div>

        {/* ── Week strip ── */}
        <div className="bg-white rounded-xl p-4 mb-5 overflow-hidden">
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((d, i) => {
              const isToday    = toDateStr(d) === toDateStr(today);
              const isSelected = toDateStr(d) === toDateStr(selectedDay);
              const count      = bookingsPerDay[i];
              const isPast     = d < new Date(toDateStr(today));
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(new Date(d))}
                  className={`rounded-xl p-3 text-center transition flex flex-col items-center gap-1 border ${
                    isSelected
                      ? 'bg-teal-deep/10 border-teal-deep/30'
                      : 'border-transparent hover:bg-cream'
                  }`}
                >
                  <span className={`text-[10px] uppercase font-semibold ${isPast ? 'text-ink/30' : 'text-ink/50'}`}>
                    {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                  </span>
                  <span className={`text-lg font-bold leading-none ${isPast ? 'text-ink/30' : isToday ? 'text-teal' : 'text-ink'}`}>
                    {d.getDate()}
                  </span>
                  {count > 0 && (
                    <span className="text-[10px] text-teal/70 font-medium">{count} booked</span>
                  )}
                  {count === 0 && !isPast && (
                    <span className="text-[10px] text-ink/20">—</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Day detail: Booked slots ── */}
        <div className="bg-white rounded-xl mb-5 overflow-hidden">
          <div className="px-5 py-4 border-b border-sand-line">
            <p className="font-semibold text-sm text-teal-deep">
              {fmtDateLong(selectedDay)}
            </p>
          </div>

          {loading && (
            <p className="text-sm text-ink/40 px-5 py-6">Loading…</p>
          )}

          {!loading && dayRows.length === 0 && (
            <p className="text-sm text-ink/40 px-5 py-6">No bookings or blocks for this day.</p>
          )}

          {!loading && dayRows.length > 0 && (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-xs uppercase text-ink/40 px-5 py-3">Time</th>
                      <th className="text-left text-xs uppercase text-ink/40 px-5 py-3">Type</th>
                      <th className="text-left text-xs uppercase text-ink/40 px-5 py-3">Detail</th>
                      <th className="text-left text-xs uppercase text-ink/40 px-5 py-3">Customer</th>
                      <th className="text-left text-xs uppercase text-ink/40 px-5 py-3">Phone</th>
                      <th className="text-left text-xs uppercase text-ink/40 px-5 py-3">Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayRows.map((row, i) => {
                      const { type, data } = row;
                      const isBooking = type === 'booking';
                      const svc  = isBooking ? getService(data.service_id) : null;
                      const stf  = isBooking ? getStaff(data.staff_id)     : null;
                      const rm   = isBooking ? getRoom(data.room_id)
                                             : (data.resource_type === 'room' ? getRoom(data.resource_id) : null);
                      const stfBlock = (!isBooking && data.resource_type === 'staff') ? getStaff(data.resource_id) : null;

                      return (
                        <tr
                          key={i}
                          className={`border-t border-sand-line transition-colors ${
                            isBooking
                              ? 'cursor-pointer hover:bg-teal/5 group'
                              : ''
                          }`}
                          onClick={() => isBooking && setDetailBooking(data)}
                          title={isBooking ? 'Click to view booking details' : undefined}
                        >
                          <td className="px-5 py-3 text-xs font-mono text-ink/70 whitespace-nowrap">
                            {fmtTime12(data.start_datetime)}
                            <span className="text-ink/30 mx-1">–</span>
                            {fmtTime12(data.end_datetime)}
                          </td>
                          <td className="px-5 py-3">
                            {isBooking ? (
                              <span className="text-[11px] font-semibold bg-teal/10 text-teal px-2 py-0.5 rounded-full">Booked</span>
                            ) : (
                              <span className="text-[11px] font-semibold bg-danger/10 text-danger px-2 py-0.5 rounded-full">Blocked</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-sm text-ink">
                            {isBooking
                              ? <>{svc?.name || '—'} <span className="text-ink/40">—</span> <span className="text-teal-deep/70">{stf?.name || '—'}</span></>
                              : <span className="text-ink/60">{data.reason || 'No reason given'}</span>
                            }
                          </td>
                          <td className="px-5 py-3 text-sm">
                            {isBooking
                              ? <span className="font-medium text-ink">{data.customer_name || '—'}</span>
                              : <span className="text-ink/40">—</span>
                            }
                          </td>
                          <td className="px-5 py-3 text-sm">
                            {isBooking
                              ? <span className="font-mono text-ink/70 text-xs">{data.customer_phone || '—'}</span>
                              : <span className="text-ink/40">—</span>
                            }
                          </td>
                          <td className="px-5 py-3 text-sm">
                            <span className="text-teal">{rm?.name || '—'}</span>
                          </td>
                          {isBooking && (
                            <td className="px-3 py-3">
                              <span className="text-[10px] text-teal/60 group-hover:text-teal transition opacity-0 group-hover:opacity-100 whitespace-nowrap">View →</span>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden flex flex-col divide-y divide-sand-line">
                {dayRows.map((row, i) => {
                  const { type, data } = row;
                  const isBooking = type === 'booking';
                  const svc  = isBooking ? getService(data.service_id) : null;
                  const stf  = isBooking ? getStaff(data.staff_id)     : null;
                  const rm   = isBooking ? getRoom(data.room_id)
                                         : (data.resource_type === 'room' ? getRoom(data.resource_id) : null);
                  const stfBlock = (!isBooking && data.resource_type === 'staff') ? getStaff(data.resource_id) : null;

                  return (
                    <div
                      key={i}
                      className={`px-4 py-3 transition-colors ${
                        isBooking ? 'cursor-pointer hover:bg-teal/5 active:bg-teal/10' : ''
                      }`}
                      onClick={() => isBooking && setDetailBooking(data)}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-mono text-ink/60">
                          {fmtTime12(data.start_datetime)} – {fmtTime12(data.end_datetime)}
                        </span>
                        <div className="flex items-center gap-2">
                          {isBooking
                            ? <span className="text-[10px] font-semibold bg-teal/10 text-teal px-2 py-0.5 rounded-full">Booked</span>
                            : <span className="text-[10px] font-semibold bg-danger/10 text-danger px-2 py-0.5 rounded-full">Blocked</span>
                          }
                          {isBooking && <span className="text-[10px] text-teal/50">›</span>}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-ink">
                        {isBooking ? `${svc?.name || '—'} — ${stf?.name || '—'}` : (data.reason || 'No reason given')}
                      </p>
                      {isBooking && (
                        <div className="mt-1 text-xs text-ink/60">
                          <span className="font-medium">{data.customer_name}</span>
                          {data.customer_phone && (
                            <span className="ml-2 font-mono text-ink/50">{data.customer_phone}</span>
                          )}
                        </div>
                      )}
                      <div className="flex gap-3 mt-1 text-xs text-ink/50">
                        {(!isBooking && stfBlock) && <span>{stfBlock.name}</span>}
                        {rm && <span className="text-teal">{rm.name}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ── Active Blocks section ── */}
        <div className="bg-white rounded-xl overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-sand-line flex items-center justify-between">
            <p className="font-semibold text-sm text-teal-deep">Active Blocks</p>
            <span className="text-xs text-ink/40">{activeBlocks.length} active</span>
          </div>

          {activeBlocks.length === 0 && (
            <p className="text-sm text-ink/40 px-5 py-6">No active blocks.</p>
          )}

          {activeBlocks.length > 0 && (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-xs uppercase text-ink/40 px-5 py-3">Resource</th>
                      <th className="text-left text-xs uppercase text-ink/40 px-5 py-3">Date</th>
                      <th className="text-left text-xs uppercase text-ink/40 px-5 py-3">Time</th>
                      <th className="text-left text-xs uppercase text-ink/40 px-5 py-3">Reason</th>
                      <th className="text-left text-xs uppercase text-ink/40 px-5 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeBlocks.map((bl) => {
                      const resourceName = bl.resource_type === 'staff'
                        ? getStaff(bl.resource_id)?.name
                        : getRoom(bl.resource_id)?.name;
                      const dateStr = String(bl.start_datetime).split('T')[0].split(' ')[0];
                      return (
                        <tr key={bl.id} className="border-t border-sand-line">
                          <td className="px-5 py-3 text-sm font-medium text-teal-deep">
                            <span className={`text-[10px] font-semibold mr-2 px-1.5 py-0.5 rounded ${
                              bl.resource_type === 'staff' ? 'bg-teal/10 text-teal' : 'bg-orange-100 text-orange-500'
                            }`}>
                              {bl.resource_type}
                            </span>
                            {resourceName || `#${bl.resource_id}`}
                          </td>
                          <td className="px-5 py-3 text-sm text-ink/60">{dateStr}</td>
                          <td className="px-5 py-3 text-xs font-mono text-ink/60 whitespace-nowrap">
                            {fmtTime12(bl.start_datetime)} – {fmtTime12(bl.end_datetime)}
                          </td>
                          <td className="px-5 py-3 text-sm text-ink/60">{bl.reason || '—'}</td>
                          <td className="px-5 py-3">
                            <button
                              onClick={() => deleteBlock(bl.id)}
                              className="text-[11px] px-3 py-1 border border-red-400 rounded-md text-red-400 hover:bg-red-50 transition font-semibold"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden flex flex-col divide-y divide-sand-line">
                {activeBlocks.map((bl) => {
                  const resourceName = bl.resource_type === 'staff'
                    ? getStaff(bl.resource_id)?.name
                    : getRoom(bl.resource_id)?.name;
                  const dateStr = String(bl.start_datetime).split('T')[0].split(' ')[0];
                  return (
                    <div key={bl.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              bl.resource_type === 'staff' ? 'bg-teal/10 text-teal' : 'bg-orange-100 text-orange-500'
                            }`}>
                              {bl.resource_type}
                            </span>
                            <span className="text-sm font-medium text-teal-deep">{resourceName || `#${bl.resource_id}`}</span>
                          </div>
                          <p className="text-xs text-ink/50 mb-0.5">{dateStr} · {fmtTime12(bl.start_datetime)} – {fmtTime12(bl.end_datetime)}</p>
                          {bl.reason && <p className="text-xs text-ink/50">{bl.reason}</p>}
                        </div>
                        <button
                          onClick={() => deleteBlock(bl.id)}
                          className="text-[11px] shrink-0 px-3 py-1.5 border border-red-400 rounded-md text-red-400 hover:bg-red-50 transition font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Block Time Modal */}
      <BlockTimeModal
        isOpen={isBlockOpen}
        onClose={() => setIsBlockOpen(false)}
        staffList={staff}
        token={TOKEN}
        onBlockAdded={(newBlock) => {
          setBlocks((prev) => [...prev, newBlock]);
        }}
      />

      {/* Booking Detail Modal */}
      {detailBooking && (
        <BookingDetailModal
          booking={detailBooking}
          service={getService(detailBooking.service_id)}
          staff={getStaff(detailBooking.staff_id)}
          room={getRoom(detailBooking.room_id)}
          authHdr={authHdr}
          onClose={() => setDetailBooking(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default Calendar;