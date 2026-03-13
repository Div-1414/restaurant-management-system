import React, { useState } from "react";
import { groupAPI } from "../../utils/api";
import { toast } from "sonner";

const ManagerTransfer = ({ floorData, refreshFloor }) => {
  const { tables } = floorData;

  const [selectedSession, setSelectedSession] = useState(null);
  const [targetTable, setTargetTable] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= ACTIVE TABLES ================= */

  const activeTables = tables.filter(
    (t) =>
      t.status === "occupied" &&
      !t.is_combined &&
      t.active_session_id
  );

  const availableTables = tables.filter(
    (t) =>
      t.status === "available" &&
      !t.is_combined
  );

  /* ================= TRANSFER ================= */

  const handleTransfer = async () => {
    if (!selectedSession || !targetTable) {
      toast.error("Select source and target table");
      return;
    }

    setLoading(true);

    try {
      await groupAPI.transfer({
        session_id: selectedSession,
        target_table_id: targetTable,
      });

      toast.success("Table transferred successfully");

      setSelectedSession(null);
      setTargetTable(null);
      await refreshFloor();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Transfer failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-24">

      <h2 className="text-lg font-bold">
        Transfer Table
      </h2>

      {/* ================= STEP 1 ================= */}
      <div>
        <h3 className="font-semibold mb-3">
          Step 1: Select Occupied Table
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {activeTables.length === 0 && (
            <p className="text-gray-500 text-sm">
              No transferable tables available
            </p>
          )}

          {activeTables.map((table) => (
            <div
              key={table.id}
              onClick={() =>
                setSelectedSession(table.active_session_id)
              }
              className={`p-4 rounded-xl border cursor-pointer transition
                ${
                  selectedSession === table.active_session_id
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-300 bg-white"
                }
              `}
            >
              <h4 className="font-bold">
                Table {table.table_number}
              </h4>

              <p className="text-sm text-gray-500">
                Hall: {table.hall_name || "General"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ================= STEP 2 ================= */}
      {selectedSession && (
        <div>
          <h3 className="font-semibold mb-3">
            Step 2: Select Target Table
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableTables.length === 0 && (
              <p className="text-gray-500 text-sm">
                No available tables
              </p>
            )}

            {availableTables.map((table) => (
              <div
                key={table.id}
                onClick={() =>
                  setTargetTable(table.id)
                }
                className={`p-4 rounded-xl border cursor-pointer transition
                  ${
                    targetTable === table.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 bg-white"
                  }
                `}
              >
                <h4 className="font-bold">
                  Table {table.table_number}
                </h4>

                <p className="text-sm text-gray-500">
                  Hall: {table.hall_name || "General"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= STICKY BUTTON ================= */}

      {selectedSession && (
        <div className="fixed bottom-16 md:bottom-6 left-0 right-0 flex justify-center px-4">
          <button
            onClick={handleTransfer}
            disabled={!targetTable || loading}
            className={`w-full md:w-auto px-6 py-3 rounded-xl font-semibold transition
              ${
                !targetTable
                  ? "bg-gray-300 text-gray-600"
                  : "bg-green-600 text-white hover:bg-green-700"
              }
            `}
          >
            {loading ? "Transferring..." : "Transfer Table"}
          </button>
        </div>
      )}

    </div>
  );
};

export default ManagerTransfer;
