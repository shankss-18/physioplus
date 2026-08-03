import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { API_BASE_URL } from '../../config';

export function AddServiceModal({ isOpen, onClose, onServiceAdded, token, rooms }) {
  const [name, setName]           = useState('');
  const [description, setDesc]    = useState('');
  const [duration, setDuration]   = useState('');
  const [price, setPrice]         = useState('');
  const [roomId, setRoomId]       = useState('');
  const [error, setError]         = useState(null);
  const [loading, setLoading]     = useState(false);

  async function handleSubmit() {
    if (!name.trim())  { setError('Service name is required.'); return; }
    if (!duration || isNaN(duration) || Number(duration) <= 0) { setError('Enter a valid duration in minutes.'); return; }
    if (!price || isNaN(price) || Number(price) < 0)           { setError('Enter a valid price.'); return; }
    if (!roomId) { setError('Please select a room.'); return; }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          duration_minutes: Number(duration),
          price: Number(price),
          room_id: Number(roomId),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.msg || 'Failed to add service');
      }

      const newService = await res.json();
      // Attach the room name for display
      const room = rooms.find((r) => r.id === Number(roomId));
      onServiceAdded({ ...newService, room_name: room?.name || '' });
      resetAndClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetAndClose() {
    setName(''); setDesc(''); setDuration(''); setPrice(''); setRoomId('');
    setError(null);
    onClose();
  }

  const inputCls = 'w-full border border-sand-line rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30';
  const labelCls = 'text-sm font-semibold text-teal-deep block mb-1.5';

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Add a service"
      description="New services are immediately available for booking."
    >
      <div className="flex flex-col gap-4">

        {/* Name */}
        <div>
          <label className={labelCls}>Service name</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sports Massage" className={inputCls} />
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>
            Description <span className="font-normal text-ink/40">(optional)</span>
          </label>
          <input value={description} onChange={(e) => setDesc(e.target.value)}
            placeholder="e.g. Deep tissue relief for sports injuries" className={inputCls} />
        </div>

        {/* Duration + Price side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Duration (min)</label>
            <input type="number" min="5" value={duration} onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 45" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Price (₹)</label>
            <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 800" className={inputCls} />
          </div>
        </div>

        {/* Room */}
        <div>
          <label className={labelCls}>Room required</label>
          <select value={roomId} onChange={(e) => setRoomId(e.target.value)}
            className={`${inputCls} bg-white`}>
            <option value="">Select a room…</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <div className="flex gap-3 mt-1">
          <button onClick={resetAndClose}
            className="flex-1 border border-sand-line text-teal-deep px-5 py-3 rounded-md text-sm font-semibold hover:bg-sand-line/30 transition">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-clay text-white px-5 py-3 rounded-md text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition">
            {loading ? 'Adding…' : 'Add Service'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
