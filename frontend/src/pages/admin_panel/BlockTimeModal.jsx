import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { API_BASE_URL } from '../../config';

export function BlockTimeModal({ isOpen, onClose, staffList, token, onBlockAdded }) {
  const today = new Date().toISOString().split('T')[0];

  const [staffId, setStaffId]   = useState('');
  const [date, setDate]         = useState(today);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime]   = useState('17:00');
  const [reason, setReason]     = useState('');
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  async function handleSubmit() {
    if (!staffId) { setError('Please select a staff member.'); return; }
    if (!date)    { setError('Please pick a date.'); return; }
    if (startTime >= endTime) { setError('End time must be after start time.'); return; }

    setLoading(true);
    setError(null);

    try {
      const start_datetime = `${date}T${startTime}:00`;
      const end_datetime   = `${date}T${endTime}:00`;

      const res = await fetch(`${API_BASE_URL}/api/blocked-slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          resource_type: 'staff',
          resource_id: Number(staffId),
          start_datetime,
          end_datetime,
          reason: reason.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create block');
      }

      const data = await res.json();
      if (onBlockAdded) onBlockAdded(data);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        resetAndClose();
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetAndClose() {
    setStaffId('');
    setDate(today);
    setStartTime('09:00');
    setEndTime('17:00');
    setReason('');
    setError(null);
    setSuccess(false);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Block time off"
      description="This slot will immediately stop showing as available to customers."
    >
      <div className="flex flex-col gap-4">

        {/* Staff member */}
        <div>
          <label className="text-sm font-semibold text-teal-deep block mb-1.5">Staff member</label>
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="w-full border border-sand-line rounded-lg p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal/30"
          >
            <option value="">Select a staff member…</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="text-sm font-semibold text-teal-deep block mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-sand-line rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
          />
        </div>

        {/* Start / End time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-teal-deep block mb-1.5">Start time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border border-sand-line rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-teal-deep block mb-1.5">End time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border border-sand-line rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="text-sm font-semibold text-teal-deep block mb-1.5">
            Reason <span className="font-normal text-ink/40">(optional)</span>
          </label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Lunch break, Training session"
            className="w-full border border-sand-line rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
          />
        </div>

        {error   && <p className="text-danger text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm font-medium">✓ Time block confirmed!</p>}

        <div className="flex gap-3 mt-1">
          <button
            onClick={resetAndClose}
            className="flex-1 border border-sand-line text-teal-deep px-5 py-3 rounded-md text-sm font-semibold hover:bg-sand-line/30 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || success}
            className="flex-1 bg-clay text-white px-5 py-3 rounded-md text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition"
          >
            {loading ? 'Saving…' : success ? 'Confirmed ✓' : 'Confirm block'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
