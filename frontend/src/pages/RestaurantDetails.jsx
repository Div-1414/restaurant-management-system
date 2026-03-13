import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantAPI, userAPI } from '../utils/api';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Power,
  Edit,
  Save,
  X,
  User,
  Image as ImageIcon,
} from 'lucide-react';

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [formData, setFormData] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // OWNER EDIT
  const [ownerEditMode, setOwnerEditMode] = useState(false);
  const [ownerFullName, setOwnerFullName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');

  useEffect(() => {
    loadRestaurant();
  }, []);

  const loadRestaurant = async () => {
    try {
      const res = await restaurantAPI.getById(id);
      setRestaurant(res.data);
      setFormData(res.data);

      setOwnerFullName(res.data.owner_name || '');
      setOwnerEmail(res.data.owner_email || '');
      setOwnerPhone(res.data.owner_phone || '');

      setLogoPreview(res.data.logo || null);
      setLogoFile(null);
    } catch {
      toast.error('Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- STATUS TOGGLE ---------- */
  const toggleStatus = async () => {
    const confirmText =
      restaurant.status === 'active'
        ? 'This will disable ALL services for this restaurant. Continue?'
        : 'Activate this restaurant again?';

    if (!window.confirm(confirmText)) return;

    setUpdating(true);
    try {
      await restaurantAPI.updateStatus(id, {
        status: restaurant.status === 'active' ? 'inactive' : 'active',
      });
      toast.success('Restaurant status updated');
      loadRestaurant();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  /* ---------- SAVE RESTAURANT DETAILS (FIXED) ---------- */
  const saveDetails = async () => {
    setUpdating(true);
    try {
      const payload = new FormData();

      // append all fields EXCEPT logo
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'logo') return;
        if (value !== null && value !== undefined) {
          payload.append(key, value);
        }
      });

      // append logo ONLY if user selected a new one
      if (logoFile) {
        payload.append('logo', logoFile);
      }

      await restaurantAPI.update(id, payload);

      toast.success('Restaurant details updated');
      setEditMode(false);
      loadRestaurant();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update details');
    } finally {
      setUpdating(false);
    }
  };

  /* ---------- SAVE OWNER DETAILS ---------- */
  const saveOwnerDetails = async () => {
    if (!ownerFullName.trim()) {
      toast.error('Owner name is required');
      return;
    }

    const parts = ownerFullName.trim().split(' ');
    const first_name = parts[0];
    const last_name = parts.slice(1).join(' ') || '';

    try {
      await userAPI.update(restaurant.owner, {
        first_name,
        last_name,
        email: ownerEmail,
        phone: ownerPhone,
      });

      toast.success('Owner details updated');
      setOwnerEditMode(false);
      loadRestaurant();
    } catch {
      toast.error('Failed to update owner details');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-b-2 border-orange-500 rounded-full" />
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* HEADER */}
      <div className="bg-white border rounded-xl p-6 flex justify-between items-start">
        <div className="flex gap-4 items-center">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Restaurant Logo"
              className="w-20 h-20 object-contain border rounded-lg"
            />
          ) : (
            <div className="w-20 h-20 flex items-center justify-center border rounded-lg text-gray-400">
              <ImageIcon className="w-8 h-8" />
            </div>
          )}

          <div>
            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
            <p className="text-gray-500">{restaurant.location}</p>

            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                restaurant.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {restaurant.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg"
            >
              <Edit className="w-4 h-4" />
              Edit Details
            </button>
          )}

          <button
            disabled={updating}
            onClick={toggleStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
              restaurant.status === 'active'
                ? 'bg-red-600'
                : 'bg-green-600'
            }`}
          >
            <Power className="w-4 h-4" />
            {restaurant.status === 'active' ? 'Inactivate' : 'Activate'}
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RESTAURANT DETAILS */}
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg">Restaurant Details</h3>

          {[
            ['description', 'Description'],
            ['address', 'Address'],
            ['city', 'City'],
            ['state', 'State'],
            ['pincode', 'Pincode'],
            ['support_email', 'Support Email'],
            ['support_phone', 'Support Phone'],
          ].map(([key, label]) => (
            <div key={key}>
              <p className="text-sm text-gray-500">{label}</p>
              {editMode ? (
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData[key] || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                />
              ) : (
                <p className="font-medium">{restaurant[key] || '—'}</p>
              )}
            </div>
          ))}

          {editMode && (
            <div>
              <p className="text-sm text-gray-500">Restaurant Logo</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setLogoFile(file);
                    setLogoPreview(URL.createObjectURL(file));
                  }
                }}
              />
            </div>
          )}

          {editMode && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={saveDetails}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                <Save className="w-4 h-4" />
                Save
              </button>

              <button
                onClick={() => {
                  setEditMode(false);
                  setFormData(restaurant);
                  setLogoPreview(restaurant.logo || null);
                  setLogoFile(null);
                }}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* OWNER CARD */}
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <User className="w-5 h-5 text-orange-500" />
            Owner Details
          </div>

          <p><b>Username:</b> {restaurant.owner_username}</p>
          <p><b>Name:</b> {ownerFullName || '—'}</p>
          <p><b>Email:</b> {restaurant.owner_email || '—'}</p>
          <p><b>Phone:</b> {restaurant.owner_phone || '—'}</p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;
