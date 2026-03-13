import React from "react";

const ManagerTables = ({ floorData }) => {
  const { tables, combinedGroups, combinedTables } = floorData;

  return (
    <div className="space-y-6">

      {/* ================= FLOOR STATS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Total Tables" value={tables.length} />
        <StatCard
          label="Combined Groups"
          value={combinedGroups}
          color="orange"
        />
        <StatCard
          label="Tables Combined"
          value={combinedTables}
          color="purple"
        />
      </div>

      {/* ================= TABLE GRID ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">

        {tables.map((table) => {

          const isCombined = table.is_combined;
          const isManager = table.has_manager_order;
          const isQR = table.has_qr_order;
          const isAvailable = table.status === "available";

          // 🎨 COLOR PRIORITY
          let bgClass = "bg-white border-gray-300";
          let statusText = "Available";
          let statusColor = "text-green-600";

          if (isCombined) {
            bgClass = "bg-orange-50 border-orange-400";
            statusText = "Combined";
            statusColor = "text-orange-600";
          } else if (isManager) {
            bgClass = "bg-purple-50 border-purple-400";
            statusText = "Manager Order";
            statusColor = "text-purple-600";
          } else if (isQR) {
            bgClass = "bg-orange-100 border-orange-500";
            statusText = "Customer (QR)";
            statusColor = "text-orange-700";
          } else if (!isAvailable) {
            bgClass = "bg-gray-100 border-gray-400";
            statusText = "Occupied";
            statusColor = "text-gray-700";
          }

          return (
            <div
              key={table.id}
              className={`rounded-xl border p-4 shadow-sm transition-all ${bgClass}`}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">
                  Table {table.table_number}
                </h3>

                {isCombined && (
                  <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded-full">
                    Group
                  </span>
                )}
              </div>

              {/* Hall */}
              <p className="text-sm text-gray-600">
                Hall: {table.hall_name}
              </p>

              {/* Status */}
              <p className={`text-sm font-semibold mt-2 ${statusColor}`}>
                {statusText}
              </p>

            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ================= SMALL COMPONENT ================= */

const StatCard = ({ label, value, color }) => {
  const colorClass =
    color === "orange"
      ? "text-orange-600"
      : color === "purple"
      ? "text-purple-600"
      : "text-gray-800";

  return (
    <div className="bg-white rounded-xl p-4 shadow border">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-xl font-bold ${colorClass}`}>
        {value}
      </p>
    </div>
  );
};

export default ManagerTables;
