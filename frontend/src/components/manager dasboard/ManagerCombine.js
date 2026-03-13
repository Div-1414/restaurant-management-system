import React, { useState } from "react";
import { groupAPI } from "../../utils/api";
import { toast } from "sonner";

const ManagerCombine = ({ floorData, refreshFloor }) => {
  const { tables } = floorData;

  const [selectedTables, setSelectedTables] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= SELECT TABLE ================= */

  const toggleSelection = (tableId) => {
    setSelectedTables((prev) =>
      prev.includes(tableId)
        ? prev.filter((id) => id !== tableId)
        : [...prev, tableId]
    );
  };

  /* ================= COMBINE ACTION ================= */

  const handleCombine = async () => {
    if (selectedTables.length < 2) {
      toast.error("Select at least 2 tables");
      return;
    }

    setLoading(true);

    try {
      await groupAPI.combine({
        table_ids: selectedTables,
      });

      toast.success("Tables combined successfully");

      setSelectedTables([]);      // ✅ Clear selection
      await refreshFloor();       // ✅ Refresh live floor
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Combine failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER AVAILABLE TABLES ================= */

  const selectableTables = tables.filter(
    (t) => t.status === "available" && !t.is_combined
  );

  return (
    <div className="space-y-6 pb-24">

      <h2 className="text-lg font-bold">
        Select Tables to Combine
      </h2>

      {/* ================= TABLE GRID ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">

        {tables.map((table) => {
          const isSelectable =
            table.status === "available" &&
            !table.is_combined;

          const isSelected = selectedTables.includes(table.id);

          return (
            <div
              key={table.id}
              onClick={() =>
                isSelectable && toggleSelection(table.id)
              }
              className={`rounded-xl border p-4 shadow-sm transition-all cursor-pointer
                ${
                  !isSelectable
                    ? "opacity-40 cursor-not-allowed"
                    : isSelected
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-300 bg-white"
                }
              `}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold">
                  Table {table.table_number}
                </h3>

                {isSelectable && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                  />
                )}
              </div>

              <p className="text-sm text-gray-500">
                Hall: {table.hall_name || "General"}
              </p>

              <p className="text-sm mt-1">
                {table.status}
              </p>

              {table.is_combined && (
                <span className="text-xs text-orange-600">
                  Already Combined
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ================= STICKY COMBINE BUTTON ================= */}

      <div className="fixed bottom-16 md:bottom-6 left-0 right-0 flex justify-center px-4">
        <button
          onClick={handleCombine}
          disabled={
            selectedTables.length < 2 || loading
          }
          className={`w-full md:w-auto px-6 py-3 rounded-xl font-semibold transition
            ${
              selectedTables.length < 2
                ? "bg-gray-300 text-gray-600"
                : "bg-orange-600 text-white hover:bg-orange-700"
            }
          `}
        >
          {loading
            ? "Combining..."
            : `Combine (${selectedTables.length})`}
        </button>
      </div>

    </div>
  );
};

export default ManagerCombine;
