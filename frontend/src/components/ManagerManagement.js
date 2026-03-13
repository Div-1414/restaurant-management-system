import React, { useState, useEffect } from "react";
import { Users, Plus, Trash2, KeyRound, Power } from "lucide-react";
import { toast } from "sonner";
import { userAPI } from "../utils/api";

const ManagerManagement = ({ restaurantId }) => {
    const [managers, setManagers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        phone: "",
    });

    const [floorStats, setFloorStats] = useState({
        totalTables: 0,
        occupied: 0,
        available: 0,
        combinedGroups: 0,
        combinedTables: 0,
    });

    /* ================= LOAD DATA ================= */

    useEffect(() => {
        loadManagers();
    }, []);

    const loadManagers = async () => {
        try {
            const res = await userAPI.getManagers();
            setManagers(res.data);
        } catch {
            toast.error("Failed to load managers");
        }
    };

    /* ================= ACTIONS ================= */

    const handleCreateManager = async () => {
        if (!formData.username || !formData.password) {
            toast.error("Username and password required");
            return;
        }

        try {
            setLoading(true);

            await userAPI.createManager({
                username: formData.username,
                password: formData.password,
                phone: formData.phone,
            });

            toast.success("Floor Manager created successfully");

            setShowModal(false);
            setFormData({ username: "", password: "", phone: "" });
            loadManagers();
        } catch (err) {
            toast.error(
                err?.response?.data?.error || "Failed to create manager"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this manager?"))
            return;

        try {
            await userAPI.delete(id);
            toast.success("Manager deleted");
            loadManagers();
        } catch {
            toast.error("Delete failed");
        }
    };

    const handleToggleStatus = async (manager) => {
        try {
            const res = await userAPI.toggleManagerStatus(manager.id);

            toast.success(
                res.data.is_active
                    ? "Manager activated"
                    : "Manager deactivated"
            );

            loadManagers();
        } catch {
            toast.error("Failed to update manager status");
        }
    };


    const handleResetPassword = async (id) => {
        const newPassword = prompt("Enter new password:");
        if (!newPassword) return;

        try {
            await userAPI.resetManagerPassword(id, newPassword);
            toast.success("Password reset successfully");
        } catch {
            toast.error("Reset failed");
        }
    };

    /* ================= UI ================= */

    return (
        <div className="space-y-8">

            {/* ================= ROLE EXPLANATION ================= */}
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
                <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    What Can a Floor Manager Do?
                </h2>

                <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
                    <p>
                        A Floor Manager helps you manage daily restaurant operations
                        while you retain full financial control.
                    </p>

                    <div>
                        <h3 className="font-semibold text-green-700 mb-2">
                            Operational Powers:
                        </h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Monitor live tables in real-time</li>
                            <li>Combine multiple tables for large groups</li>
                            <li>Transfer customers to another table</li>
                            <li>Place manual orders for customers</li>
                            <li>Generate bills after dining</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-red-600 mb-2">
                            Restricted Actions (Owner Only):
                        </h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Mark bills as paid</li>
                            <li>Download sales reports</li>
                            <li>Close restaurant day</li>
                            <li>Manage staff accounts</li>
                            <li>Modify menu items</li>
                        </ul>
                    </div>

                    <p className="font-semibold text-blue-800 mt-3">
                        ⚠️ You remain in full financial control at all times.
                    </p>
                </div>
            </div>

            {/* ================= MANAGER MANAGEMENT ================= */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">
                        Manage Floor Managers
                    </h2>

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                    >
                        <Plus className="w-4 h-4" />
                        Add Floor Manager
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
                            {managers.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-4 text-center text-gray-400">
                                        No managers added yet
                                    </td>
                                </tr>
                            )}

                            {managers.map((m) => (
                                <tr key={m.id} className="border-t">
                                    <td className="p-3">{m.username}</td>
                                    <td className="p-3">{m.phone || "-"}</td>
                                    <td className="p-3">
                                        {m.is_active ? (
                                            <span className="text-green-600 font-semibold">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="text-red-600 font-semibold">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 flex gap-3">
                                        <button onClick={() => handleResetPassword(m.id)}>
                                            <KeyRound className="w-4 h-4 text-blue-600" />
                                        </button>
                                        <button onClick={() => handleToggleStatus(m)}>
                                            <Power
                                                className={`w-4 h-4 ${m.is_active ? "text-green-600" : "text-gray-400"
                                                    }`}
                                            />
                                        </button>

                                        <button onClick={() => handleDelete(m.id)}>
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ================= MODAL ================= */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
                        <h3 className="text-lg font-bold text-gray-800">
                            Add Floor Manager
                        </h3>

                        <input
                            type="text"
                            placeholder="Username"
                            className="w-full border p-2 rounded-lg"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({ ...formData, username: e.target.value })
                            }
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full border p-2 rounded-lg"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                        />

                        <input
                            type="text"
                            placeholder="Phone (optional)"
                            className="w-full border p-2 rounded-lg"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                            }
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleCreateManager}
                                disabled={loading}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg"
                            >
                                {loading ? "Creating..." : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerManagement;
