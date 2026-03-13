import React, { useState, useEffect } from 'react';
import { restaurantAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Plus, LogOut, Store, MapPin, Phone, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuperAdmin = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // 🔍 SEARCH & FILTER STATES
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contact: '',
    owner_username: '',
    owner_password: '',
    owner_email: '',
    status: 'active',
  });

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const response = await restaurantAPI.getAll();
      setRestaurants(response.data);
    } catch {
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  /* ================= FIXED CREATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();

      fd.append('name', formData.name);
      fd.append('location', formData.location);
      fd.append('contact', formData.contact);
      fd.append('status', 'active');

      fd.append('owner_username', formData.owner_username);
      fd.append('owner_password', formData.owner_password);

      if (formData.owner_email) {
        fd.append('owner_email', formData.owner_email);
      }

      await restaurantAPI.create(fd);

      toast.success('Restaurant created successfully');
      setShowModal(false);

      setFormData({
        name: '',
        location: '',
        contact: '',
        owner_username: '',
        owner_password: '',
        owner_email: '',
        status: 'active',
      });

      loadRestaurants();
    } catch (err) {
      toast.error('Failed to create restaurant');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await restaurantAPI.delete(id);
        toast.success('Restaurant deleted');
        loadRestaurants();
      } catch {
        toast.error('Failed to delete restaurant');
      }
    }
  };

  const totalRestaurants = restaurants.length;
  const activeRestaurants = restaurants.filter(
    (r) => r.status === 'active'
  ).length;

  // 🔍 SEARCH & FILTER LOGIC
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = restaurant.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || restaurant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Super Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Manage all restaurants
            </p>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* STATS */}
        <div className="max-w-7xl mx-auto px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
            <p className="text-sm text-gray-500">Total Restaurants</p>
            <p className="text-2xl font-bold">{totalRestaurants}</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
            <p className="text-sm text-gray-500">Active Restaurants</p>
            <p className="text-2xl font-bold">{activeRestaurants}</p>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* SEARCH & FILTER */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search restaurant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/2 px-4 py-2 border rounded-lg"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 px-4 py-2 border rounded-lg"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 sm:ml-auto"
          >
            <Plus className="w-5 h-5" />
            Add Restaurant
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No restaurants found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() =>
                  navigate(`/super-admin/restaurants/${restaurant.id}`)
                }
                className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer transition hover:shadow-md hover:border-gray-300"
              >
                <div className="flex justify-between mb-3">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Store className="w-5 h-5 text-orange-600" />
                  </div>

                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      restaurant.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {restaurant.status}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-2">
                  {restaurant.name}
                </h3>

                <div className="text-sm text-gray-600 space-y-2 mb-4">
                  <div className="flex gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    {restaurant.location}
                  </div>
                  <div className="flex gap-2">
                    <Phone className="w-4 h-4 text-orange-500" />
                    {restaurant.contact}
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-between items-center">
                  <span className="text-sm">
                    Tables: <b>{restaurant.tables_count || 0}</b>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(restaurant.id);
                    }}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Add New Restaurant</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                placeholder="Restaurant Name"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              <input
                placeholder="Location"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />

              <input
                placeholder="Contact"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                required
              />

              <hr />

              <input
                placeholder="Owner Username"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.owner_username}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    owner_username: e.target.value,
                  })
                }
                required
              />

              <input
                type="password"
                placeholder="Owner Password"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.owner_password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    owner_password: e.target.value,
                  })
                }
                required
              />

              <input
                type="email"
                placeholder="Owner Email (optional)"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.owner_email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    owner_email: e.target.value,
                  })
                }
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border rounded-lg py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;
