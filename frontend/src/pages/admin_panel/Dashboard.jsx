import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { API_BASE_URL } from '../../config';

const BASE = `${API_BASE_URL}/api`;

/* ── tiny helpers ── */
function toDateStr(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function startOfDay(d) {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x;
}
function fmtTime(str) {
  if (!str) return '—';
  const d = new Date(String(str).replace(' ', 'T') + '+05:30');
  const h = d.getHours(), m = d.getMinutes();
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12}:00 ${period}` : `${h12}:${String(m).padStart(2, '0')} ${period}`;
}
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* Simple CSS bar chart — no library needed */
function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div className="flex justify-between items-end h-48 mt-8 gap-2 w-full">
      {data.map((bar, i) => {
        const heightPct = Math.round((bar.value / max) * 100);
        return (
          <div key={i} className="flex flex-col h-full flex-1 gap-2">
            <div className="flex-1 w-full relative">
              <div
                className="absolute bottom-0 left-0 w-full rounded-t-sm transition-all duration-300"
                style={{
                  height: `${heightPct}%`,
                  minHeight: bar.value > 0 ? '4px' : '2px',
                  backgroundColor: bar.isToday ? '#1C3B34' : '#DCE6DC',
                }}
              />
            </div>
            <div className="h-4 flex items-center justify-center shrink-0">
              <span className="text-[10px] text-ink/40 uppercase tracking-widest">{DAY_LABELS[i]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Stat card */
function StatCard({ label, value, sub, subColor }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-sand-line flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-ink/40 font-semibold">{label}</span>
      <span className="text-3xl font-display font-bold text-ink">{value}</span>
      {sub && <span className={`text-xs ${subColor || 'text-ink/40'}`}>{sub}</span>}
    </div>
  );
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem('adminName') || 'Admin';
  const token = localStorage.getItem('token');

  const [bookings,  setBookings]  = useState([]);
  const [staff,     setStaff]     = useState([]);
  const [rooms,     setRooms]     = useState([]);
  const [services,  setServices]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const authHdr = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  async function handleResetDatabase() {
    if (!window.confirm("Are you sure you want to reset the database to its default state? All user data will be lost.")) return;
    setIsResetting(true);
    try {
      const res = await fetch(`${BASE}/admin/reset-database`, { method: 'POST', headers: authHdr });
      if (!res.ok) throw new Error('Reset failed');
      alert('Database successfully reset to portfolio demo defaults!');
      window.location.reload();
    } catch (err) {
      alert('Failed to reset database.');
    } finally {
      setIsResetting(false);
    }
  }

  useEffect(() => {
    async function fetchAll() {
      try {
        const [bRes, stRes, rRes, svRes] = await Promise.all([
          fetch(`${BASE}/bookings`,  { headers: authHdr }),
          fetch(`${BASE}/staff`,     { headers: authHdr }),
          fetch(`${BASE}/rooms`,     { headers: authHdr }),
          fetch(`${BASE}/services`),
        ]);

        if (bRes.status === 401) { navigate('/admin/login'); return; }

        setBookings(bRes.ok  ? await bRes.json()  : []);
        setStaff(stRes.ok    ? await stRes.json() : []);
        setRooms(rRes.ok     ? await rRes.json()  : []);
        setServices(svRes.ok ? await svRes.json() : []);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  /* ── Lookups ── */
  const getService = (id) => services.find((s) => Number(s.id) === Number(id));
  const getStaff   = (id) => staff.find((s)    => Number(s.id) === Number(id));
  const getRoom    = (id) => rooms.find((r)     => Number(r.id) === Number(id));

  const confirmed = bookings.filter((b) => b.status === 'confirmed');
  const activeBookings = bookings.filter((b) => ['confirmed', 'completed'].includes(b.status));
  const today = new Date();
  const todayStr = toDateStr(today);

  /* ── Today's bookings ── */
  const todayBookings = activeBookings
    .filter((b) => String(b.start_datetime).startsWith(todayStr))
    .sort((a, b) => a.start_datetime.localeCompare(b.start_datetime));

  /* ── This week dates ── */
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Monday
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return toDateStr(d);
  });

  /* ── This week confirmed bookings ── */
  const weekBookings = activeBookings.filter((b) => {
    const ds = String(b.start_datetime).slice(0, 10);
    return weekDates.includes(ds);
  });

  /* ── Stats ── */
  const todaySessions = todayBookings.length;
  const yesterdaySessions = activeBookings.filter((b) => {
    const yStr = toDateStr(new Date(today.getTime() - 86400000));
    return String(b.start_datetime).startsWith(yStr);
  }).length;

  const weekRevenue = weekBookings.reduce((sum, b) => {
    const svc = getService(b.service_id);
    return sum + (svc ? Number(svc.price) : 0);
  }, 0);

  const lastWeekStart = new Date(weekStart); lastWeekStart.setDate(weekStart.getDate() - 7);
  const lastWeekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lastWeekStart); d.setDate(lastWeekStart.getDate() + i); return toDateStr(d);
  });
  const lastWeekRevenue = activeBookings
    .filter((b) => lastWeekDates.includes(String(b.start_datetime).slice(0, 10)))
    .reduce((sum, b) => { const svc = getService(b.service_id); return sum + (svc ? Number(svc.price) : 0); }, 0);

  const noShowsWeek = bookings.filter((b) => b.status === 'no_show' && weekDates.includes(String(b.start_datetime).slice(0, 10))).length;

  /* ── Room utilisation ── */
  const roomUsage = rooms.map((r) => ({
    name: r.name,
    count: weekBookings.filter((b) => Number(b.room_id) === Number(r.id)).length,
  }));
  const busiestRoom = roomUsage.sort((a, b) => b.count - a.count)[0];
  const totalWeekSlots = weekBookings.length || 1;
  const utilizationPct = busiestRoom ? Math.round((busiestRoom.count / totalWeekSlots) * 100) : 0;

  /* ── Bar chart: revenue per day this week ── */
  const chartData = weekDates.map((ds, i) => {
    const dayRevenue = activeBookings
      .filter((b) => String(b.start_datetime).startsWith(ds))
      .reduce((s, b) => { const svc = getService(b.service_id); return s + (svc ? Number(svc.price) : 0); }, 0);
    return { value: dayRevenue, isToday: ds === todayStr };
  });

  /* ── Recent activity ── */
  const recentActivity = [...bookings]
    .sort((a, b) => {
      // Sort by when booking was created, fall back to start_datetime for old records
      const tsA = a.created_at || a.start_datetime;
      const tsB = b.created_at || b.start_datetime;
      return tsB.localeCompare(tsA);
    })
    .slice(0, 8);

  function activityText(b) {
    const svc = getService(b.service_id);
    if (b.status === 'confirmed')  return `${b.customer_name} booked ${svc?.name || 'a session'}`;
    if (b.status === 'completed')  return `${getStaff(b.staff_id)?.name || 'Staff'} completed session with ${b.customer_name}`;
    if (b.status === 'cancelled')  return `${b.customer_name} cancelled ${svc?.name || 'session'}`;
    if (b.status === 'no_show')    return `${b.customer_name} was a no-show`;
    return `Booking #${b.id} updated`;
  }
  function activityDot(b) {
    if (b.status === 'confirmed') return 'bg-teal';
    if (b.status === 'completed') return 'bg-green-500';
    if (b.status === 'no_show')   return 'bg-danger';
    return 'bg-ink/30';
  }
  function timeAgo(str) {
    if (!str) return '';
    const d = new Date(String(str).replace(' ', 'T') + '+05:30');
    const diffMs = Date.now() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr  = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    if (diffMin < 1)   return 'Just now';
    if (diffMin < 60)  return `${diffMin}m ago`;
    if (diffHr  < 24)  return `${diffHr}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7)   return `${diffDay}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
  function formatTimestamp(str) {
    if (!str) return '';
    const d = new Date(String(str).replace(' ', 'T') + '+05:30');
    return d.toLocaleString('en-IN', {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  }

  /* ── Staff Performance ── */
  const staffPerformance = staff.map(stf => {
    const stfBookings = activeBookings.filter(b => b.staff_id === stf.id);
    const rev = stfBookings.reduce((sum, b) => {
      const svc = getService(b.service_id);
      return sum + (svc ? Number(svc.price) : 0);
    }, 0);
    return { name: stf.name, count: stfBookings.length, revenue: rev };
  }).sort((a, b) => b.revenue - a.revenue);

  /* ── Service Popularity ── */
  const servicePopularity = services.map(svc => {
    const count = activeBookings.filter(b => b.service_id === svc.id).length;
    return { name: svc.name, count };
  }).sort((a, b) => b.count - a.count).filter(s => s.count > 0).slice(0, 4);

  /* ── No-Show Analytics ── */
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(today.getDate() - 14);
  const recentBookings = bookings.filter(b => {
    const d = new Date(String(b.start_datetime).replace(' ', 'T') + '+05:30');
    return d >= twoWeeksAgo && d <= today;
  });
  const recentNoShows = recentBookings.filter(b => b.status === 'no_show').length;
  const recentTotal = recentBookings.filter(b => ['completed', 'no_show', 'cancelled'].includes(b.status)).length || 1;
  const noShowRate = Math.round((recentNoShows / recentTotal) * 100);

  /* ── Peak Hours ── */
  const hourCounts = Array(24).fill(0);
  activeBookings.forEach(b => {
    const h = new Date(String(b.start_datetime).replace(' ', 'T') + '+05:30').getHours();
    hourCounts[h]++;
  });
  const busiestHours = hourCounts
    .map((count, hour) => ({ hour, count }))
    .filter(x => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  function formatHour(h) {
    const period = h < 12 ? 'AM' : 'PM';
    const h12 = h % 12 || 12;
    return `${h12}:00 ${period}`;
  }

  const revenueLabel = weekRevenue > 0
    ? `₹${weekRevenue.toLocaleString('en-IN')} total`
    : '₹0 total';

  return (
    <div className="flex flex-col md:flex-row bg-cream min-h-screen">
      <AdminSidebar />

      <div className="flex-1 px-4 md:px-8 lg:px-10 py-5 mt-5 min-w-0">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row items-start justify-between mb-7 gap-4">
          <div>
            <h1 className="text-xl text-teal-deep font-display font-semibold mb-1">
              {greeting()}, {adminName}
            </h1>
            <p className="text-[11px] md:text-xs text-ink/50">
              {today.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handleResetDatabase}
              disabled={isResetting}
              className="flex-1 md:flex-none text-danger border border-danger/30 font-semibold tracking-wider bg-white px-4 py-2 rounded text-[12px] hover:bg-danger/10 disabled:opacity-50 transition"
            >
              {isResetting ? 'Resetting...' : 'Reset Demo Data'}
            </button>
            <button
              onClick={() => navigate('/booking')}
              className="flex-1 md:flex-none text-white font-semibold tracking-wider bg-clay px-4 py-2 rounded text-[12px] hover:opacity-90 transition"
            >
              + New Booking
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-ink/40 mt-16 text-center">Loading dashboard…</p>
        ) : (
          <>
            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Today's Sessions"
                value={todaySessions}
                sub={yesterdaySessions !== todaySessions
                  ? `${todaySessions > yesterdaySessions ? '+' : ''}${todaySessions - yesterdaySessions} vs yesterday`
                  : 'Same as yesterday'}
                subColor={todaySessions >= yesterdaySessions ? 'text-green-600' : 'text-danger'}
              />
              <StatCard
                label="This Week Revenue"
                value={`₹${weekRevenue.toLocaleString('en-IN')}`}
                sub={lastWeekRevenue > 0
                  ? `${Math.round(((weekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100)}% vs last week`
                  : 'No data last week'}
                subColor={weekRevenue >= lastWeekRevenue ? 'text-green-600' : 'text-danger'}
              />
              <StatCard
                label="Room Utilization"
                value={`${utilizationPct}%`}
                sub={busiestRoom ? `${busiestRoom.name} busiest` : 'No data'}
              />
              <StatCard
                label="No-Show Rate (14d)"
                value={`${noShowRate}%`}
                sub={noShowRate > 5 ? 'Higher than target (5%)' : 'Within healthy range'}
                subColor={noShowRate > 5 ? 'text-danger' : 'text-green-600'}
              />
            </div>

            {/* ── Middle row: chart + activity ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

              {/* Revenue chart */}
              <div className="bg-white rounded-xl p-5 border border-sand-line">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm text-teal-deep">Revenue — Last 7 Days</p>
                  <span className="text-xs text-ink/40">{revenueLabel}</span>
                </div>
                <BarChart data={chartData} />
              </div>

              {/* Recent activity */}
              <div className="bg-white rounded-xl p-5 border border-sand-line">
                <p className="font-semibold text-sm text-teal-deep mb-4">Recent Activity</p>
                {recentActivity.length === 0 && (
                  <p className="text-sm text-ink/40">No recent activity.</p>
                )}
                <ul className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
                  {recentActivity.map((b) => {
                    const ts = b.created_at || b.start_datetime;
                    return (
                      <li key={b.id} className="flex items-start gap-3">
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${activityDot(b)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ink leading-snug truncate">{activityText(b)}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-semibold text-teal-deep/70">{timeAgo(ts)}</span>
                            <span className="text-[10px] text-ink/30">·</span>
                            <span className="text-[10px] text-ink/40">{formatTimestamp(ts)}</span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* ── Advanced Analytics Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
              
              {/* Staff Leaderboard */}
              <div className="bg-white rounded-xl p-5 border border-sand-line">
                <p className="font-semibold text-sm text-teal-deep mb-4">Staff Performance (This Wk)</p>
                <div className="flex flex-col gap-3">
                  {staffPerformance.slice(0, 4).map((stf, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-ink">{stf.name}</span>
                        <span className="text-teal font-mono">₹{stf.revenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-sand-line rounded-full h-1.5">
                        <div className="bg-teal h-1.5 rounded-full" style={{ width: `${Math.max(10, (stf.revenue / (staffPerformance[0]?.revenue || 1)) * 100)}%` }}></div>
                      </div>
                      <p className="text-[10px] text-ink/40 mt-1">{stf.count} sessions</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Popularity */}
              <div className="bg-white rounded-xl p-5 border border-sand-line">
                <p className="font-semibold text-sm text-teal-deep mb-4">Top Services</p>
                <div className="flex flex-col gap-4">
                  {servicePopularity.map((svc, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-ink">
                        <span className="w-5 h-5 rounded bg-clay/10 text-clay flex items-center justify-center text-xs font-semibold">{i+1}</span>
                        <span className="truncate max-w-[140px]" title={svc.name}>{svc.name}</span>
                      </div>
                      <span className="text-xs font-medium text-teal-deep bg-teal/10 px-2 py-0.5 rounded">{svc.count} booked</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Peak Hours Heatmap */}
              <div className="bg-white rounded-xl p-5 border border-sand-line">
                <p className="font-semibold text-sm text-teal-deep mb-4">Peak Booking Hours</p>
                <div className="grid grid-cols-2 gap-3">
                  {busiestHours.map((bh, i) => (
                    <div key={i} className="bg-cream border border-sand-line rounded-lg p-3 flex flex-col items-center justify-center">
                      <span className="text-lg font-display text-teal-deep">{formatHour(bh.hour)}</span>
                      <span className="text-[10px] uppercase tracking-wider text-ink/40 mt-1">{bh.count} Sessions</span>
                    </div>
                  ))}
                  {busiestHours.length === 0 && (
                    <p className="text-sm text-ink/40 col-span-2 text-center py-4">Not enough data.</p>
                  )}
                </div>
              </div>

            </div>

            {/* ── Today's bookings table ── */}
            <div className="bg-white rounded-xl border border-sand-line overflow-hidden mb-8">
              <div className="px-5 py-4 border-b border-sand-line flex items-center justify-between">
                <p className="font-semibold text-sm text-teal-deep">Today's Bookings</p>
                <span className="text-xs text-ink/40">{todaySessions} session{todaySessions !== 1 ? 's' : ''}</span>
              </div>

              {todayBookings.length === 0 && (
                <p className="text-sm text-ink/40 px-5 py-6">No bookings today.</p>
              )}

              {todayBookings.length > 0 && (
                <>
                  {/* Desktop */}
                  <div className="hidden md:block">
                    <table className="w-full">
                      <thead>
                        <tr>
                          {['Time', 'Customer', 'Service', 'Therapist', 'Room'].map((h) => (
                            <th key={h} className="text-left text-xs uppercase text-ink/40 px-5 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {todayBookings.map((b) => {
                          const svc = getService(b.service_id);
                          const stf = getStaff(b.staff_id);
                          const rm  = getRoom(b.room_id);
                          return (
                            <tr key={b.id} className="border-t border-sand-line">
                              <td className="px-5 py-3 text-sm font-mono text-teal">{fmtTime(b.start_datetime)}</td>
                              <td className="px-5 py-3 text-sm font-medium text-teal-deep">{b.customer_name}</td>
                              <td className="px-5 py-3 text-sm text-ink/70">{svc?.name || '—'}</td>
                              <td className="px-5 py-3 text-sm text-ink/70">{stf?.name || '—'}</td>
                              <td className="px-5 py-3 text-sm text-teal">{rm?.name || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden flex flex-col divide-y divide-sand-line">
                    {todayBookings.map((b) => {
                      const svc = getService(b.service_id);
                      const stf = getStaff(b.staff_id);
                      const rm  = getRoom(b.room_id);
                      return (
                        <div key={b.id} className="px-4 py-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-teal-deep">{b.customer_name}</span>
                            <span className="text-xs font-mono text-teal">{fmtTime(b.start_datetime)}</span>
                          </div>
                          <p className="text-xs text-ink/60">{svc?.name || '—'}</p>
                          <div className="flex gap-3 mt-1 text-xs text-ink/40">
                            {stf && <span>{stf.name}</span>}
                            {rm  && <span className="text-teal">{rm.name}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;