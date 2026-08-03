import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { API_BASE_URL } from '../../config';

const DAYS = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 0 },
];

const DEFAULT_START = '09:00';
const DEFAULT_END  = '17:00';

export function AddStaffModal({ isOpen, onClose, onStaffAdded, token }) {
  const [name, setName]           = useState('');
  const [specialties, setSpecialties] = useState('');
  const [selectedDays, setSelectedDays] = useState({});   // { dayValue: { start, end } }
  const [error, setError]         = useState(null);
  const [loading, setLoading]     = useState(false);

  function toggleDay(val) {
    setSelectedDays((prev) => {
      if (prev[val]) {
        const next = { ...prev };
        delete next[val];
        return next;
      }
      return { ...prev, [val]: { start: DEFAULT_START, end: DEFAULT_END } };
    });
  }

  function updateTime(val, field, time) {
    setSelectedDays((prev) => ({
      ...prev,
      [val]: { ...prev[val], [field]: time },
    }));
  }

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Staff name is required.');
      return;
    }
    if (Object.keys(selectedDays).length === 0) {
      setError('Select at least one working day.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create staff member
      const staffRes = await fetch(`${API_BASE_URL}/api/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), specialties: specialties.trim() }),
      });

      if (!staffRes.ok) {
        const err = await staffRes.json();
        throw new Error(err.msg || 'Failed to add staff');
      }

      const newStaff = await staffRes.json();

      // 2. Post working hours for each selected day
      await Promise.all(
        Object.entries(selectedDays).map(([day, { start, end }]) =>
          fetch(`${API_BASE_URL}/api/working-hours`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              staff_id: newStaff.id,
              day_of_week: Number(day),
              start_time: start,
              end_time: end,
            }),
          })
        )
      );

      onStaffAdded({ ...newStaff, working_hours: selectedDays });
      resetAndClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetAndClose() {
    setName('');
    setSpecialties('');
    setSelectedDays({});
    setError(null);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Add staff member"
      description="Fill in the details and set their working schedule."
    >
      <div className="flex flex-col gap-4">

        {/* Name */}
        <div>
          <label className="text-sm font-semibold text-teal-deep block mb-1.5">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dr. Priya Rao"
            className="w-full border border-sand-line rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
          />
        </div>

        {/* Specialties */}
        <div>
          <label className="text-sm font-semibold text-teal-deep block mb-1.5">Specialties</label>
          <input
            value={specialties}
            onChange={(e) => setSpecialties(e.target.value)}
            placeholder="e.g. Sports injury, Ultrasound therapy"
            className="w-full border border-sand-line rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
          />
        </div>

        {/* Working days */}
        <div>
          <label className="text-sm font-semibold text-teal-deep block mb-2">Working days</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {DAYS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleDay(value)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition ${
                  selectedDays[value]
                    ? 'bg-teal-deep text-white border-teal-deep'
                    : 'border-sand-line text-ink/60 hover:border-teal-deep'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Time pickers for each selected day */}
          {Object.entries(selectedDays).map(([dayVal, { start, end }]) => {
            const dayLabel = DAYS.find((d) => d.value === Number(dayVal))?.label;
            return (
              <div key={dayVal} className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold text-teal-deep w-8">{dayLabel}</span>
                <input
                  type="time"
                  value={start}
                  onChange={(e) => updateTime(dayVal, 'start', e.target.value)}
                  className="border border-sand-line rounded-md p-1.5 text-xs focus:outline-none"
                />
                <span className="text-ink/40 text-xs">to</span>
                <input
                  type="time"
                  value={end}
                  onChange={(e) => updateTime(dayVal, 'end', e.target.value)}
                  className="border border-sand-line rounded-md p-1.5 text-xs focus:outline-none"
                />
              </div>
            );
          })}
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <div className="flex gap-3 mt-1">
          <button
            onClick={resetAndClose}
            className="flex-1 border border-sand-line text-teal-deep px-5 py-3 rounded-md text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-clay text-white px-5 py-3 rounded-md text-sm font-semibold disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Staff'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
