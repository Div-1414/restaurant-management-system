import React, { useState, useEffect } from 'react';
import api, { menuAPI } from '../utils/api';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

/* ================= TOGGLE SWITCH ================= */
const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
  <button
    onClick={onChange}
    disabled={disabled}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition
      ${checked ? 'bg-green-600' : 'bg-gray-300'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <span
      className={`inline-block h-3 w-3 transform rounded-full bg-white transition
        ${checked ? 'translate-x-5' : 'translate-x-1'}`}
    />
  </button>
);

const MenuManagement = ({ restaurantId }) => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);


  const [categoryForm, setCategoryForm] = useState({
    name: '',
    display_order: 0
  });

  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    allow_half: false,
    half_price: '',
    available: true
  });


  // DELETE MODAL (ITEM / CATEGORY)
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  //search modal
  const [searchQuery, setSearchQuery] = useState('');


  /* ================= OPTION STATE (NEW) ================= */
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [optionForm, setOptionForm] = useState({
    name: '',
    extra_price: ''
  });

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    loadCategories();
    setSearchQuery('');
  }, [restaurantId]);

  useEffect(() => {
    if (selectedCategory) {
      loadItems(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const res = await menuAPI.getCategories(restaurantId);
      setCategories(res.data);
      if (res.data.length > 0 && !selectedCategory) {
        setSelectedCategory(res.data[0].id);
      }
    } catch {
      toast.error('Failed to load categories');
    }
  };

  const loadItems = async (categoryId) => {
    try {
      const res = await menuAPI.getItems(null, categoryId);
      setItems(res.data);
    } catch {
      toast.error('Failed to load items');
    }
  };

  /* ================= CREATE ================= */

  const createCategory = async (e) => {
    e.preventDefault();
    try {
      await menuAPI.createCategory({
        ...categoryForm,
        restaurant: restaurantId
      });
      toast.success('Category created');
      setShowCategoryModal(false);
      setCategoryForm({ name: '', display_order: 0 });
      loadCategories();
    } catch {
      toast.error('Failed to create category');
    }
  };

  const createItem = async (e) => {
    e.preventDefault();

    try {
      if (editingItem) {
        // 🔄 UPDATE ITEM
        await menuAPI.updateItem(editingItem.id, itemForm);
        toast.success('Item updated');
      } else {
        // ➕ CREATE ITEM
        await menuAPI.createItem({
          ...itemForm,
          category: selectedCategory,
        });
        toast.success('Item created');
      }

      setShowItemModal(false);
      setEditingItem(null);
      resetItemForm();
      loadItems(selectedCategory);

    } catch {
      toast.error('Failed to save item');
    }
  };

  const resetItemForm = () => {
    setItemForm({
      name: '',
      description: '',
      price: '',
      allow_half: false,
      half_price: '',
      available: true,
    });
  };






  /* ================= TOGGLES ================= */

  const toggleAvailability = async (item) => {
    try {
      const res = await api.patch(
        `/menu-items/${item.id}/toggle-availability/`
      );
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, available: res.data.available } : i
        )
      );
      toast.success('Item availability updated');
    } catch {
      toast.error('Failed to update availability');
    }
  };

  const toggleHalf = async (item) => {
    try {
      const res = await api.patch(
        `/menu-items/${item.id}/toggle-half/`
      );
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, allow_half: res.data.allow_half } : i
        )
      );
      toast.success('Half plate option updated');
    } catch {
      toast.error('Failed to update half option');
    }
  };

  /* ================= OPTIONS (NEW) ================= */

  const createOption = async (e) => {
    e.preventDefault();
    try {
      await api.post('/menu-item-options/', {
        item: currentItem.id,
        name: optionForm.name,
        extra_price: optionForm.extra_price
      });
      toast.success('Option added');
      setShowOptionModal(false);
      setOptionForm({ name: '', extra_price: '' });
      loadItems(selectedCategory);
    } catch {
      toast.error('Failed to add option');
    }
  };

  const deleteOption = async (optionId) => {
    try {
      await api.delete(`/menu-item-options/${optionId}/`);
      toast.success('Option deleted');
      loadItems(selectedCategory);
    } catch {
      toast.error('Failed to delete option');
    }
  };

  /* ================= DELETE ================= */

  const askDeleteItem = (item) => {
    setDeleteTarget({ type: 'item', data: item });
  };

  const askDeleteCategory = (category) => {
    setDeleteTarget({ type: 'category', data: category });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      if (deleteTarget.type === 'item') {
        await menuAPI.deleteItem(deleteTarget.data.id);
        toast.success('Item deleted');
        loadItems(selectedCategory);
      }

      if (deleteTarget.type === 'category') {
        await menuAPI.deleteCategory(deleteTarget.data.id);
        toast.success('Category deleted');
        setSelectedCategory(null);
        loadCategories();
      }

      setDeleteTarget(null);
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 relative z-20">
        <h2 className="text-2xl font-bold">Menu Management</h2>

        <div className="flex gap-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="btn-outline flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>

          <button
            onClick={() => setShowItemModal(true)}
            className="btn-primary flex items-center gap-2"
            disabled={!selectedCategory}
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* CATEGORIES */}
        <div className="w-64">
          <h3 className="text-lg font-semibold mb-3">Categories</h3>

          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`flex justify-between items-center px-4 py-3 rounded-lg ${selectedCategory === category.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-white border hover:border-orange-300'
                  }`}
              >
                <button
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex-1 text-left"
                >
                  {category.name} ({category.items_count || 0})
                </button>

                <button
                  onClick={() => askDeleteCategory(category)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ITEMS */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Items</h3>

            <input
              type="text"
              placeholder="Search item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm w-56"
            />
          </div>


          <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto pr-2 relative z-0">
            {items.filter((item) =>
              item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
            ).map((item) => (
              <div
                key={item.id}
                className="card p-4 space-y-3 w-full min-w-[320px]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4
                      className="font-semibold text-lg cursor-pointer hover:underline"
                      onClick={() => {
                        setEditingItem(item);
                        setItemForm({
                          name: item.name,
                          description: item.description || '',
                          price: item.price,
                          allow_half: item.allow_half,
                          half_price: item.half_price || '',
                          available: item.available,
                        });
                        setShowItemModal(true);
                      }}
                    >
                      {item.name}
                    </h4>


                    <span className="text-lg font-bold text-orange-600">
                      ₹{parseFloat(item.price).toFixed(2)}
                    </span>
                    {item.allow_half && item.half_price && (
                      <div className="text-sm text-gray-500">
                        Half: ₹{item.half_price}
                      </div>
                    )}




                  </div>

                  <button
                    onClick={() => askDeleteItem(item)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>


                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span>Available</span>
                    <ToggleSwitch
                      checked={item.available}
                      onChange={() => toggleAvailability(item)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Half Plate</span>
                    <ToggleSwitch
                      checked={item.allow_half}
                      onChange={() => toggleHalf(item)}
                      disabled={!item.available || !item.half_price}
                    />
                    {!item.half_price && (
                      <span className="text-xs text-red-500">
                        Set half plate price to enable
                      </span>
                    )}


                  </div>
                </div>

                {/* OPTIONS */}
                {item.options?.length > 0 && (
                  <div className="border-t pt-3 space-y-2">
                    {item.options.map((opt) => (
                      <div
                        key={opt.id}
                        className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded"
                      >
                        <span>
                          {opt.name} (+₹{opt.extra_price})
                        </span>

                        <button
                          onClick={() => deleteOption(opt.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    setCurrentItem(item);
                    setShowOptionModal(true);
                  }}
                  className="text-sm text-orange-600 hover:underline"
                >
                  + Add Option
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= OPTION MODAL ================= */}
      {showOptionModal && currentItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 bounce-in">
            <h3 className="text-xl font-bold mb-4">
              Add Option – {currentItem.name}
            </h3>

            <form onSubmit={createOption} className="space-y-4">
              <input
                type="text"
                value={optionForm.name}
                onChange={(e) =>
                  setOptionForm({ ...optionForm, name: e.target.value })
                }
                placeholder="Option name (e.g. Butter)"
                className="w-full px-4 py-2 border rounded-lg"
                required
              />

              <input
                type="number"
                step="0.01"
                value={optionForm.extra_price}
                onChange={(e) =>
                  setOptionForm({ ...optionForm, extra_price: e.target.value })
                }
                placeholder="Extra price (e.g. 10)"
                className="w-full px-4 py-2 border rounded-lg"
                required
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOptionModal(false)}
                  className="flex-1 border rounded py-2"
                >
                  Cancel
                </button>

                <button type="submit" className="flex-1 btn-primary">
                  Add Option
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ================= CATEGORY MODAL ================= */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 bounce-in">
            <h3 className="text-2xl font-bold mb-4">Add Category</h3>

            <form onSubmit={createCategory} className="space-y-4">
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                placeholder="Category name"
                className="w-full px-4 py-2 border rounded-lg"
                required
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 border rounded py-2"
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
      {/* ================= ITEM MODAL ================= */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 bounce-in">
            <h3 className="text-2xl font-bold mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </h3>


            <form onSubmit={createItem} className="space-y-4">
              <input
                type="text"
                value={itemForm.name}
                onChange={(e) =>
                  setItemForm({ ...itemForm, name: e.target.value })
                }
                placeholder="Item name"
                className="w-full px-4 py-2 border rounded-lg"
                required
              />

              <textarea
                value={itemForm.description}
                onChange={(e) =>
                  setItemForm({ ...itemForm, description: e.target.value })
                }
                placeholder="Description"
                rows="2"
                className="w-full px-4 py-2 border rounded-lg"
              />

              <input
                type="number"
                step="0.01"
                value={itemForm.price}
                onChange={(e) =>
                  setItemForm({ ...itemForm, price: e.target.value })
                }
                placeholder="Price"
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <div className="flex items-center gap-3">
                <span className="text-sm">Allow Half Plate</span>
                <ToggleSwitch
                  checked={itemForm.allow_half}
                  onChange={() =>
                    setItemForm({
                      ...itemForm,
                      allow_half: !itemForm.allow_half,
                      half_price: ''
                    })
                  }
                />
              </div>
              {itemForm.allow_half && (
                <input
                  type="number"
                  step="0.01"
                  value={itemForm.half_price}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, half_price: e.target.value })
                  }
                  placeholder="Half plate price (e.g. 140)"
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              )}




              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 border rounded py-2"
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



      {/* ================= DELETE MODAL ================= */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full bounce-in">
            <h3 className="text-xl font-bold text-red-600 mb-2">
              Delete {deleteTarget.type === 'item' ? 'Menu Item' : 'Category'}
            </h3>

            <p className="text-gray-600 mb-5">
              Are you sure you want to delete{' '}
              <b>{deleteTarget.data.name}</b>?
              <br />
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border rounded py-2"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded py-2"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
