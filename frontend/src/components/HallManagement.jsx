import React, { useEffect, useState } from 'react';
import { hallAPI } from '../utils/api';
import { toast } from 'sonner';
import { Plus, Trash2, DoorOpen, AlertTriangle } from 'lucide-react';

const HallManagement = ({ restaurantId }) => {
  const [halls, setHalls] = useState([]);
  const [hallName, setHallName] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔥 NEW STATES (only addition)
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;
    loadHalls();
  }, [restaurantId]);

  const loadHalls = async () => {
    try {
      const res = await hallAPI.getAll(restaurantId);
      setHalls(res.data);
    } catch {
      toast.error('Failed to load halls');
    }
  };

  const createHall = async () => {
    if (!hallName.trim()) {
      toast.error('Hall name is required');
      return;
    }

    try {
      setLoading(true);
      await hallAPI.create({
        restaurant: restaurantId,
        name: hallName,
      });
      toast.success('Hall added');
      setHallName('');
      loadHalls();
    } catch {
      toast.error('Failed to create hall');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 OPEN CONFIRM MODAL
  const askDeleteHall = (hall) => {
    setDeleteTarget(hall);
  };

  // 🔥 CONFIRM DELETE
  const confirmDeleteHall = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const res = await hallAPI.delete(deleteTarget.id);

      toast.success(
        `Hall deleted. ${res.data.tables_deleted} tables were also removed.`,
        { className: 'toast-danger' }
      );

      setDeleteTarget(null);
      loadHalls();
    } catch {
      toast.error('Failed to delete hall');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Hall Management</h2>
      </div>

      {/* ADD HALL */}
      <div className="bg-white rounded-xl border p-5 mb-8 flex gap-4">
        <input
          type="text"
          placeholder="Hall name (AC / Non-AC / VIP)"
          value={hallName}
          onChange={(e) => setHallName(e.target.value)}
          className="flex-1 border px-4 py-2 rounded-lg"
        />

        <button
          onClick={createHall}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Hall
        </button>
      </div>

      {/* HALL LIST */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {halls.map((hall) => (
          <div
            key={hall.id}
            className="bg-white border rounded-xl p-5 flex justify-between items-center hover:shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
                <DoorOpen className="w-5 h-5" />
              </div>

              <div>
                <p className="font-semibold">{hall.name}</p>
                <p className="text-xs text-gray-500">
                  Tables: {hall.tables_count}
                </p>
              </div>
            </div>

            <button
              onClick={() => askDeleteHall(hall)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        {halls.length === 0 && (
          <p className="text-gray-500">No halls created yet</p>
        )}
      </div>

      {/* 🔥 DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 text-red-600 p-3 rounded-full">
                <AlertTriangle />
              </div>
              <h3 className="text-lg font-bold text-red-600">
                Delete Hall?
              </h3>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              You are about to delete <b>{deleteTarget.name}</b>.
            </p>

            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-5">
              ⚠️ All tables linked to this hall will be permanently deleted.
              This action cannot be undone.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border rounded-lg py-2"
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteHall}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 hover:bg-red-700"
              >
                {deleting ? 'Deleting...' : 'Delete Hall'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HallManagement;
