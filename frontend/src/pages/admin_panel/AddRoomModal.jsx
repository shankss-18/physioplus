import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { API_BASE_URL } from '../../config';

export function AddRoomModal({ isOpen, onClose, onRoomAdded, token }) {
  const [name, setName] = useState('');
  const [equipmentNotes, setEquipmentNotes] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Room name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newRoom = await fetch(`${API_BASE_URL}/api/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                name,
                equipment_notes: equipmentNotes,
                is_active: 1
            })
        })
        const addedRoom = await newRoom.json()
      onRoomAdded(addedRoom); 
      resetAndClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetAndClose() {
    setName('');
    setEquipmentNotes('');
    setError(null);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Add a room"
      description="New rooms become available for services immediately."
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold text-teal-deep block mb-1.5">Room name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Room 2"
            className="w-full border border-sand-line rounded-lg p-3 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-teal-deep block mb-1.5">Equipment notes</label>
          <input
            value={equipmentNotes}
            onChange={(e) => setEquipmentNotes(e.target.value)}
            placeholder="e.g. Has electrotherapy unit"
            className="w-full border border-sand-line rounded-lg p-3 text-sm"
          />
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <div className="flex gap-3 mt-2">
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
            {loading ? 'Adding...' : 'Add Room'}
          </button>
        </div>
      </div>
    </Modal>
  );
}