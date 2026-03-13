import React, { useState, useEffect } from 'react';
import { ChefHat, Plus, Trash2, KeyRound, Power, Users } from 'lucide-react';
import { toast } from 'sonner';
import { userAPI } from '../utils/api';

const KitchenManagement = ({ restaurantId }) => {
  const [kitchenStaff, setKitchenStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: '',
    first_name: '',
    last_name: '',
  });

  useEffect(() => {
    loadKitchenStaff();
  }, [restaurantId]);

  const loadKitchenStaff = async () => {
    try {
      const res = await userAPI.getKitchenStaff();
      setKitchenStaff(res.data);
    } catch {
      toast.error('Failed to load kitchen staff');
    }
  };

  const handleCreate = async () => {
    if (!formData.username || !formData.password) {
      toast.error('Username and password required');
      return;
    }
    try {
      setLoading(true);
      await userAPI.create({
        ...formData,
        role: 'kitchen_staff',
        restaurant: restaurantId,
      });
      toast.success('Kitchen staff created successfully');
      setShowModal(false);
      setFormData({ username: '', password: '', phone: '', first_name: '', last_name: '' });
      loadKitchenStaff();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to create kitchen staff');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this kitchen staff?')) return;
    try {
      await userAPI.delete(id);
      toast.success('Kitchen staff deleted');
      loadKitchenStaff();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleToggleStatus = async (staff) => {
    try {
      const res = await userAPI.toggleKitchenStaffStatus(staff.id);
      toast.success(res.data.is_active ? 'Staff activated' : 'Staff deactivated');
      loadKitchenStaff();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleResetPassword = async (id) => {
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;
    try {
      await userAPI.resetKitchenStaffPassword(id, newPassword);
      toast.success('Password reset successfully');
    } catch {
      toast.error('Reset failed');
    }
  };

  return (
    <div className="space-y-8">

      {/* INFO CARD */}
      <div className="bg-orange-50 border border-orange-200 p-6 rounded-xl">
        <h2 className="text-xl font-bold text-orange-700 mb-4 flex items-center gap-2">
          <ChefHat className="w-5 h-5" />
          What Can Kitchen Staff Do?
        </h2>
        <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
          <p>Kitchen staff manage all incoming orders through the Kitchen Dashboard.</p>
          <div>
            <h3 className="font-semibold text-green-700 mb-2">Kitchen Powers:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>View all incoming table orders in real-time</li>
              <li>View parcel orders sent to kitchen</li>
              <li>Mark individual items as completed</li>
              <li>Mark full orders as completed</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-red-600 mb-2">Restricted Actions (Owner Only):</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Generate or mark bills as paid</li>
              <li>Access sales reports</li>
              <li>Manage menu or staff</li>
            </ul>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            Manage Kitchen Staff
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            <Plus className="w-4 h-4" />
            Add Kitchen Staff
          </button>
        </div>

        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">Username</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Active</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {kitchenStaff.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-400">
                    No kitchen staff added yet
                  </td>
                </tr>
              )}
              {kitchenStaff.map((staff) => (
                <tr key={staff.id} className="border-t">
                  <td className="p-3">{staff.username}</td>
                  <td className="p-3">{staff.phone || '-'}</td>
                  <td className="p-3">
                    {staff.is_active ? (
                      <span className="text-green-600 font-semibold">Active</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Inactive</span>
                    )}
                  </td>
                  <td className="p-3 flex gap-3">
                    <button onClick={() => handleResetPassword(staff.id)}>
                      <KeyRound className="w-4 h-4 text-blue-600" />
                    </button>
                    <button onClick={() => handleToggleStatus(staff)}>
                      <Power className={`w-4 h-4 ${staff.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                    </button>
                    <button onClick={() => handleDelete(staff.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Add Kitchen Staff</h3>

            <input
              type="text"
              placeholder="Username"
              className="w-full border p-2 rounded-lg"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border p-2 rounded-lg"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <input
              type="text"
              placeholder="Phone (optional)"
              className="w-full border p-2 rounded-lg"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenManagement;