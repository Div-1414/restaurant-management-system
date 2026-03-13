import React, { useState, useEffect } from "react";
import { menuAPI, orderAPI } from "../../utils/api";
import { toast } from "sonner";

const ManagerManualOrder = ({ restaurantId, floorData, refreshFloor }) => {
  const { tables } = floorData;

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ✅ NEW: Option Modal State */
  const [optionModalItem, setOptionModalItem] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);

  /* ================= LOAD MENU ================= */

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await menuAPI.getCategories(restaurantId);
      setCategories(res.data);
    } catch {
      toast.error("Failed to load menu");
    }
  };

  const loadItems = async (categoryId) => {
    try {
      const res = await menuAPI.getItems(null, categoryId);
      setItems(res.data);
    } catch {
      toast.error("Failed to load items");
    }
  };

  const availableTables = tables;

  /* ================= ADD TO CART ================= */

  const addToCart = (item, type = "full") => {
    // If item has options → open modal
    if (item.options && item.options.length > 0) {
      setOptionModalItem({ item, type });
      setSelectedOptions([]);
      return;
    }

    addItemToCart(item, type, []);
  };

  const addItemToCart = (item, type, options) => {
    const isHalf = type === "half";

    const basePrice = Number(
      isHalf ? item.half_price : item.price
    );

    const extraPrice = options.reduce(
      (sum, opt) => sum + Number(opt.extra_price || 0),
      0
    );

    const finalPrice = basePrice + extraPrice;


    const cartId =
      `${item.id}_${type}_` +
      options.map((o) => o.id).join("_");

    const existing = cart.find((c) => c.cartId === cartId);

    if (existing) {
      setCart(
        cart.map((c) =>
          c.cartId === cartId
            ? { ...c, quantity: c.quantity + 1 }
            : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...item,
          cartId,
          isHalf,
          price: finalPrice,
          quantity: 1,
          selectedOptions: options,
        },
      ]);
    }
  };

  const changeQty = (index, delta) => {
    const updated = [...cart];
    updated[index].quantity += delta;

    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }

    setCart(updated);
  };

  const getTotal = () => {
  return cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * item.quantity,
    0
  );
};


  /* ================= PLACE ORDER ================= */

  const handlePlaceOrder = async () => {
    if (!selectedTable) {
      toast.error("Select table first");
      return;
    }

    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setLoading(true);

    try {
      await orderAPI.managerCreateOrder({
        table_id: selectedTable,
        items: cart.map((item) => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          option_ids:
            item.selectedOptions?.map((o) => o.id) || [],
        })),
      });

      toast.success("Order placed successfully");

      setCart([]);
      setSelectedTable(null);
      await refreshFloor();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Order failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <h2 className="text-lg font-bold">Manual Order</h2>

      {/* ================= TABLE SELECT ================= */}

      <div>
        <h3 className="font-semibold mb-3">Select Table</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {availableTables.map((table) => {
            const isManager = table.has_manager_order;
            const isQR = table.has_qr_order;
            const isCombined = table.is_combined;

            let bgClass = "bg-white border-gray-300";
            let statusText = "Available";
            let statusColor = "text-green-600";

            if (isCombined) {
              bgClass = "bg-orange-50 border-orange-400";
              statusText = "Combined";
              statusColor = "text-orange-600";
            } else if (isManager) {
              bgClass = "bg-purple-50 border-purple-400";
              statusText = "Manager Active";
              statusColor = "text-purple-600";
            } else if (isQR) {
              bgClass = "bg-orange-100 border-orange-500";
              statusText = "Customer (QR)";
              statusColor = "text-orange-700";
            }

            return (
              <div
                key={table.id}
                onClick={() => setSelectedTable(table.id)}
                className={`p-3 rounded-xl border cursor-pointer transition 
                  ${bgClass}
                  ${
                    selectedTable === table.id
                      ? "ring-2 ring-green-600 scale-105"
                      : ""
                  }
                `}
              >
                <p className="font-semibold">
                  Table {table.table_number}
                </p>

                <p className="text-xs text-gray-500">
                  {table.hall_name}
                </p>

                <p className={`text-xs mt-1 font-semibold ${statusColor}`}>
                  {statusText}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= CATEGORY SELECT ================= */}

      <div>
        <h3 className="font-semibold mb-3">Categories</h3>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                loadItems(cat.id);
              }}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap
                ${
                  selectedCategory === cat.id
                    ? "bg-orange-600 text-white"
                    : "bg-gray-200"
                }
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ================= ITEMS ================= */}

      {selectedCategory && (
        <div>
          <h3 className="font-semibold mb-3">Items</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border bg-white"
              >
                <p className="font-medium">{item.name}</p>

                {item.allow_half ? (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => addToCart(item, "half")}
                      className="flex-1 py-2 bg-gray-200 rounded-lg text-sm"
                    >
                      Half ₹{item.half_price}
                    </button>

                    <button
                      onClick={() => addToCart(item, "full")}
                      className="flex-1 py-2 bg-orange-600 text-white rounded-lg text-sm"
                    >
                      Full ₹{item.price}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(item, "full")}
                    className="mt-3 w-full bg-orange-600 text-white py-2 rounded-lg text-sm"
                  >
                    Add ₹{item.price}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= CART ================= */}

      {cart.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Cart</h3>

          <div className="space-y-3">
            {cart.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-white p-3 rounded-xl border"
              >
                <div>
                  <p className="font-medium">
                    {item.name} {item.isHalf && "(Half)"}
                  </p>

                  {item.selectedOptions?.length > 0 && (
                    <p className="text-xs text-gray-500">
                      {item.selectedOptions
                        .map((o) => o.name)
                        .join(", ")}
                    </p>
                  )}

                  <p className="text-sm text-gray-500">
                    ₹{item.price} × {item.quantity}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changeQty(index, -1)}
                    className="px-2 bg-gray-200 rounded"
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => changeQty(index, 1)}
                    className="px-2 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            <div className="font-bold text-right">
              Total: ₹{getTotal()}
            </div>
          </div>
        </div>
      )}

      {/* ================= OPTION MODAL ================= */}

      {optionModalItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 space-y-4">
            <h3 className="font-bold text-lg">Select Extras</h3>

            {optionModalItem.item.options.map((opt) => (
              <label
                key={opt.id}
                className="flex justify-between items-center"
              >
                <span>
                  {opt.name} (+₹{opt.extra_price})
                </span>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedOptions([
                        ...selectedOptions,
                        opt,
                      ]);
                    } else {
                      setSelectedOptions(
                        selectedOptions.filter(
                          (o) => o.id !== opt.id
                        )
                      );
                    }
                  }}
                />
              </label>
            ))}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setOptionModalItem(null)}
                className="flex-1 bg-gray-300 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  addItemToCart(
                    optionModalItem.item,
                    optionModalItem.type,
                    selectedOptions
                  );
                  setOptionModalItem(null);
                }}
                className="flex-1 bg-orange-600 text-white py-2 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PLACE ORDER ================= */}

      {cart.length > 0 && (
        <div className="fixed bottom-16 md:bottom-6 left-0 right-0 flex justify-center px-4">
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-xl font-semibold"
          >
            {loading ? "Placing..." : "Place Order"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ManagerManualOrder;
