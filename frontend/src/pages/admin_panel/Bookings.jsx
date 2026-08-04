import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { API_BASE_URL } from '../../config';

const BASE = `${API_BASE_URL}/api`;

/* ── helpers ── */
function fmtTime12(str) {
  if (!str) return '—';
  const s = String(str).replace(' ', 'T');
  const d = new Date(s.includes('+') ? s : s + '+05:30');
  const h = d.getHours(), m = d.getMinutes();
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12}:00 ${period}` : `${h12}:${String(m).padStart(2, '0')} ${period}`;
}
function fmtDate(str) {
  if (!str) return '—';
  const d = new Date(String(str).replace(' ', 'T') + '+05:30');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function toDateStr(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* ── Status config ── */
const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', bg: 'bg-teal/10',   text: 'text-teal',       dot: 'bg-teal'       },
  completed: { label: 'Completed', bg: 'bg-green-50',  text: 'text-green-600',  dot: 'bg-green-500'  },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50',    text: 'text-red-500',    dot: 'bg-red-400'    },
  no_show:   { label: 'No Show',   bg: 'bg-orange-50', text: 'text-orange-500', dot: 'bg-orange-400' },
};

const FILTERS = [
  { key: 'all',       label: 'All'       },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'no_show',   label: 'No Show'   },
];

/* ── StatusBadge ── */
function StatusBadge({ status }) {
  const sc = STATUS_CONFIG[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
      {sc.label}
    </span>
  );
}

/* ── Booking Detail Modal ── */
function BookingDetailModal({ booking, service, staff, room, onClose, onStatusChange, authHdr }) {
  const [status, setStatus] = useState(booking?.status || 'confirmed');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (booking) setStatus(booking.status);
  }, [booking]);

  if (!booking) return null;

  const sc = STATUS_CONFIG[status] || STATUS_CONFIG.confirmed;

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
            <p className="text-white/70 text-xs mt-0.5">
              {fmtDate(booking.start_datetime)} · {fmtTime12(booking.start_datetime)} — {fmtTime12(booking.end_datetime)}
            </p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition text-xl leading-none mt-0.5" aria-label="Close">✕</button>
        </div>

        {/* Status bar */}
        <div className={`px-6 py-2.5 flex items-center gap-2 ${sc.bg} border-b border-sand-line`}>
          <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
          <span className={`text-xs font-semibold ${sc.text}`}>{sc.label}</span>
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
                {booking.customer_email && <span className="text-xs text-ink/60">✉ {booking.customer_email}</span>}
                {booking.customer_phone && <span className="text-xs font-mono text-ink/60">📞 {booking.customer_phone}</span>}
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
                {service?.description && <p className="text-xs text-ink/50 mt-0.5">{service.description}</p>}
              </div>
              <div className="bg-cream rounded-xl px-4 py-3">
                <p className="text-[10px] text-ink/40 uppercase tracking-wider mb-1">Duration & Price</p>
                <p className="text-sm font-semibold text-ink">{service?.duration_minutes || '—'} min</p>
                {service?.price && <p className="text-xs text-teal font-semibold mt-0.5">₹{service.price}</p>}
              </div>
            </div>
          </div>

          {/* Assigned Resources */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-ink/40 font-semibold mb-2">Assigned Resources</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cream rounded-xl px-4 py-3">
                <p className="text-[10px] text-ink/40 uppercase tracking-wider mb-1">Therapist</p>
                <p className="text-sm font-semibold text-teal-deep">{staff?.name || '—'}</p>
                {staff?.specialization && <p className="text-xs text-ink/50 mt-0.5">{staff.specialization}</p>}
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
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  disabled={updating || status === key}
                  onClick={() => handleStatusChange(key)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                    status === key
                      ? `${cfg.bg} ${cfg.text} border-transparent cursor-default`
                      : 'border-sand-line text-ink/50 hover:border-teal hover:text-teal bg-white'
                  } disabled:opacity-50`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-cream border-t border-sand-line flex justify-end">
          <button onClick={onClose} className="text-sm font-semibold px-5 py-2 rounded-lg bg-teal-deep text-white hover:opacity-90 transition">
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

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
const Bookings = () => {
  const navigate = useNavigate();

  const [bookings,    setBookings]    = useState([]);
  const [services,    setServices]    = useState([]);
  const [staff,       setStaff]       = useState([]);
  const [rooms,       setRooms]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState('all');
  const [dateFilter,  setDateFilter]  = useState('all');  // 'all' | 'today'
  const [search,      setSearch]      = useState('');
  const [detail,      setDetail]      = useState(null);
  const [sortField,   setSortField]   = useState('start_datetime');
  const [sortDir,     setSortDir]     = useState('desc');

  const today   = new Date();
  const todayStr = toDateStr(today);

  const TOKEN   = localStorage.getItem('token') || '';
  const authHdr = { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

  /* ── Fetch ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, svRes, stRes, rRes] = await Promise.all([
        fetch(`${BASE}/bookings`,  { headers: authHdr }),
        fetch(`${BASE}/services`),
        fetch(`${BASE}/staff`,     { headers: authHdr }),
        fetch(`${BASE}/rooms`,     { headers: authHdr }),
      ]);
      if (bRes.status === 401) { navigate('/admin/login'); return; }
      setBookings(bRes.ok  ? await bRes.json()  : []);
      setServices(svRes.ok ? await svRes.json() : []);
      setStaff(stRes.ok    ? await stRes.json() : []);
      setRooms(rRes.ok     ? await rRes.json()  : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Lookup helpers ── */
  const getService = (id) => services.find((s) => Number(s.id) === Number(id));
  const getStaff   = (id) => staff.find((s)    => Number(s.id) === Number(id));
  const getRoom    = (id) => rooms.find((r)    => Number(r.id) === Number(id));

  /* ── Counts per status ── */
  const counts = useMemo(() => {
    const c = { all: bookings.length };
    Object.keys(STATUS_CONFIG).forEach((k) => {
      c[k] = bookings.filter((b) => b.status === k).length;
    });
    return c;
  }, [bookings]);

  /* ── Today count ── */
  const todayCount = useMemo(() =>
    bookings.filter((b) => String(b.start_datetime).startsWith(todayStr)).length
  , [bookings, todayStr]);

  /* ── Filtered + searched + sorted ── */
  const displayed = useMemo(() => {
    let list = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);
    // Date filter
    if (dateFilter === 'today') {
      list = list.filter((b) => String(b.start_datetime).startsWith(todayStr));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) =>
        (b.customer_name  || '').toLowerCase().includes(q) ||
        (b.customer_email || '').toLowerCase().includes(q) ||
        (b.customer_phone || '').toLowerCase().includes(q) ||
        String(b.id).includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      let va = a[sortField] ?? '';
      let vb = b[sortField] ?? '';
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
    return list;
  }, [bookings, filter, dateFilter, search, sortField, sortDir, todayStr]);

  /* ── Toggle sort ── */
  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };
  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="ml-1 text-ink/20">↕</span>;
    return <span className="ml-1 text-teal">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  /* ── Status change callback ── */
  const handleStatusChange = (bookingId, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => Number(b.id) === Number(bookingId) ? { ...b, status: newStatus } : b)
    );
    if (detail && Number(detail.id) === Number(bookingId)) {
      setDetail((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const detailService = detail ? getService(detail.service_id) : null;
  const detailStaff   = detail ? getStaff(detail.staff_id)     : null;
  const detailRoom    = detail ? getRoom(detail.room_id)        : null;

  return (
    <div className="flex flex-col md:flex-row bg-cream min-h-screen">
      <AdminSidebar />

      <div className="flex-1 px-4 md:px-8 lg:px-10 py-5 mt-5 min-w-0">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-xl text-teal-deep font-display font-semibold mb-1">Bookings</h1>
            <p className="text-[11px] md:text-xs text-ink/50">
              {counts.all} total · {counts.confirmed ?? 0} confirmed · {counts.completed ?? 0} completed
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Today toggle */}
            <button
              onClick={() => setDateFilter((prev) => prev === 'today' ? 'all' : 'today')}
              className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border transition ${
                dateFilter === 'today'
                  ? 'bg-clay text-white border-clay shadow-sm'
                  : 'bg-white text-ink/60 border-sand-line hover:border-clay hover:text-clay'
              }`}
            >
              📅 Today
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                dateFilter === 'today' ? 'bg-white/20 text-white' : 'bg-cream text-ink/50'
              }`}>
                {todayCount}
              </span>
            </button>
            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30 text-sm pointer-events-none">🔍</span>
              <input
                type="text"
                placeholder="Search name, email, phone, ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 text-sm rounded-lg border border-sand-line bg-white text-ink placeholder:text-ink/30 focus:border-teal transition w-56 md:w-64"
              />
            </div>
          </div>
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex gap-1.5 flex-wrap mb-5">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border transition ${
                  active
                    ? 'bg-teal-deep text-white border-teal-deep shadow-sm'
                    : 'bg-white text-ink/60 border-sand-line hover:border-teal hover:text-teal'
                }`}
              >
                {f.label}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-white/20 text-white' : 'bg-cream text-ink/50'
                }`}>
                  {counts[f.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Table card ── */}
        <div className="bg-white rounded-xl overflow-hidden mb-8">

          {loading && (
            <div className="px-5 py-16 text-center">
              <div className="inline-block w-6 h-6 border-2 border-teal border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-ink/40">Loading bookings…</p>
            </div>
          )}

          {!loading && displayed.length === 0 && (
            <div className="px-5 py-16 text-center">
              <p className="text-3xl mb-3">📋</p>
              <p className="text-sm font-medium text-ink/50">No bookings found</p>
              {search && <p className="text-xs text-ink/30 mt-1">Try a different search term</p>}
            </div>
          )}

          {!loading && displayed.length > 0 && (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-sand-line">
                      <th
                        onClick={() => toggleSort('id')}
                        className="text-left text-xs uppercase text-ink/40 px-5 py-3 cursor-pointer hover:text-teal select-none whitespace-nowrap"
                      >
                        # <SortIcon field="id" />
                      </th>
                      <th
                        onClick={() => toggleSort('customer_name')}
                        className="text-left text-xs uppercase text-ink/40 px-5 py-3 cursor-pointer hover:text-teal select-none"
                      >
                        Customer <SortIcon field="customer_name" />
                      </th>
                      <th className="text-left text-xs uppercase text-ink/40 px-5 py-3">Service</th>
                      <th className="text-left text-xs uppercase text-ink/40 px-5 py-3">Therapist</th>
                      <th
                        onClick={() => toggleSort('start_datetime')}
                        className="text-left text-xs uppercase text-ink/40 px-5 py-3 cursor-pointer hover:text-teal select-none whitespace-nowrap"
                      >
                        Date & Time <SortIcon field="start_datetime" />
                      </th>
                      <th className="text-left text-xs uppercase text-ink/40 px-5 py-3">Status</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map((b) => {
                      const svc = getService(b.service_id);
                      const stf = getStaff(b.staff_id);
                      return (
                        <tr
                          key={b.id}
                          onClick={() => setDetail(b)}
                          className="border-t border-sand-line cursor-pointer hover:bg-teal/5 group transition-colors"
                        >
                          <td className="px-5 py-3.5 text-xs font-mono text-ink/40">#{b.id}</td>
                          <td className="px-5 py-3.5">
                            <p className="text-sm font-semibold text-ink">{b.customer_name || '—'}</p>
                            <p className="text-xs text-ink/40 font-mono">{b.customer_phone || b.customer_email || ''}</p>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-ink/70">{svc?.name || '—'}</td>
                          <td className="px-5 py-3.5 text-sm text-teal-deep/80">{stf?.name || '—'}</td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <p className="text-xs text-ink/60">{fmtDate(b.start_datetime)}</p>
                            <p className="text-xs font-mono text-ink/40">{fmtTime12(b.start_datetime)}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={b.status} />
                          </td>
                          <td className="px-3 py-3.5">
                            <span className="text-[10px] text-teal/50 group-hover:text-teal transition opacity-0 group-hover:opacity-100 whitespace-nowrap">View →</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden flex flex-col divide-y divide-sand-line">
                {displayed.map((b) => {
                  const svc = getService(b.service_id);
                  const stf = getStaff(b.staff_id);
                  return (
                    <div
                      key={b.id}
                      onClick={() => setDetail(b)}
                      className="px-4 py-4 cursor-pointer hover:bg-teal/5 active:bg-teal/10 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="text-sm font-semibold text-ink">{b.customer_name || '—'}</p>
                          <p className="text-xs text-ink/40 font-mono">{b.customer_phone || b.customer_email || ''}</p>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="text-sm text-ink/70">
                        {svc?.name || '—'}
                        <span className="text-ink/30 mx-1">·</span>
                        <span className="text-teal-deep/70">{stf?.name || '—'}</span>
                      </p>
                      <p className="text-xs text-ink/40 mt-1">{fmtDate(b.start_datetime)} · {fmtTime12(b.start_datetime)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Results footer */}
              <div className="px-5 py-3 border-t border-sand-line">
                <p className="text-xs text-ink/40">
                  Showing <span className="font-semibold text-ink/60">{displayed.length}</span> of{' '}
                  <span className="font-semibold text-ink/60">{counts.all}</span> bookings
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Booking Detail Modal */}
      {detail && (
        <BookingDetailModal
          booking={detail}
          service={detailService}
          staff={detailStaff}
          room={detailRoom}
          authHdr={authHdr}
          onClose={() => setDetail(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default Bookings;
