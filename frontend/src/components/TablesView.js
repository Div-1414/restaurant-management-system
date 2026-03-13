import React, { useState, useEffect } from 'react';
import { tableAPI, hallAPI } from '../utils/api';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Download, UtensilsCrossed, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import ConfirmDangerModal from '../components/ConfirmDangerModal';
import QrPrintLayout from '../components/QrPrintLayout';
import * as htmlToImage from 'html-to-image';
import { restaurantAPI } from '../utils/api';


const TablesView = ({ restaurantId, onUpdate }) => {
  const [tables, setTables] = useState([]);
  const [halls, setHalls] = useState([]);

  const [filterHall, setFilterHall] = useState('');
  const [createHall, setCreateHall] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [tableCount, setTableCount] = useState(1);
  const [selectedQR, setSelectedQR] = useState(null);

  const [tableToDelete, setTableToDelete] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [printSettings, setPrintSettings] = useState(null);
  const [printingTable, setPrintingTable] = useState(null);
  const printRef = React.useRef(null);




  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (!restaurantId) return;
    loadHalls();
    loadRestaurantData();
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) return;
    loadTables();
    loadRestaurantData();
  }, [restaurantId, filterHall]);

  const loadHalls = async () => {
    try {
      const res = await hallAPI.getAll(restaurantId);
      setHalls(res.data);
    } catch {
      toast.error('Failed to load halls');
    }
  };

  const loadTables = async () => {
    try {
      const params = { restaurant_id: restaurantId };
      if (filterHall) params.hall_id = filterHall;

      const response = await tableAPI.getAll(params);
      setTables(response.data);
    } catch {
      toast.error('Failed to load tables');
    }
  };

  /* ================= ACTIONS ================= */

  const openCreateModal = () => {
    setCreateHall(filterHall || '');
    setShowModal(true);
  };

  const createTables = async () => {
    try {
      await tableAPI.bulkCreate(
        restaurantId,
        tableCount,
        process.env.REACT_APP_FRONTEND_URL,
        createHall || null
      );

      toast.success(`${tableCount} tables created`);
      setShowModal(false);
      setTableCount(1);
      setCreateHall('');
      loadTables();
      onUpdate?.();
    } catch {
      toast.error('Failed to create tables');
    }
  };

  const viewQR = async (table) => {
    try {
      const response = await tableAPI.generateQR(
        table.id,
        process.env.REACT_APP_FRONTEND_URL
      );
      setSelectedQR(response.data);
    } catch {
      toast.error('Failed to generate QR');
    }
  };

  /* ================= DELETE TABLE ================= */

  const handleConfirmDeleteTable = async () => {
    if (!tableToDelete) return;

    try {
      await tableAPI.delete(tableToDelete.id);
      toast.success(`Table ${tableToDelete.table_number} deleted`);
      setTableToDelete(null);   // close modal
      loadTables();
      onUpdate?.();
    } catch {
      toast.error('Failed to delete table');
    }
  };

  /*For preview */
  const loadRestaurantData = async () => {
    try {
      const [restaurantRes, settingsRes] = await Promise.all([
        restaurantAPI.getById(restaurantId),
        restaurantAPI.getPrintSettings(),
      ]);

      setRestaurant(restaurantRes.data);
      setPrintSettings(settingsRes.data);
    } catch {
      toast.error('Failed to load restaurant print data');
    }
  };


  /* ================= PDF ================= */

  const downloadAllQRCodes = async () => {
    if (!tables.length || !restaurant || !printSettings) {
      toast.error('QR data not ready');
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      setPrintingTable(table);

      // wait for DOM to render hidden layout
      await new Promise((res) => setTimeout(res, 100));

      const image = await htmlToImage.toPng(printRef.current, {
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgProps = pdf.getImageProperties(image);
      const pdfWidth = 150;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      const x = (210 - pdfWidth) / 2;
      const y = 20;

      if (i !== 0) pdf.addPage();
      pdf.addImage(image, 'PNG', x, y, pdfWidth, pdfHeight);
    }

    setPrintingTable(null);
    pdf.save('table-qr-codes.pdf');
    toast.success('QR codes downloaded');
  };





  /* ================= UI ================= */

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h3 className="text-xl font-semibold">Tables</h3>

        <div className="flex gap-3 items-center">
          <select
            value={filterHall}
            onChange={(e) => setFilterHall(e.target.value)}
            className="px-4 py-2 rounded-lg text-sm border bg-white"
          >
            <option value="">All Halls</option>
            {halls.map((hall) => (
              <option key={hall.id} value={hall.id}>
                {hall.name}
              </option>
            ))}
          </select>

          {tables.length > 0 && (
            <button
              onClick={downloadAllQRCodes}
              className="btn-outline flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download QR
            </button>
          )}

          <button
            onClick={openCreateModal}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Tables
          </button>
        </div>
      </div>

      {/* TABLE GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {tables.map((table) => {
          const occupied = table.status === 'occupied';

          return (
            <div
              key={table.id}
              className={`relative rounded-2xl p-5 border
                ${occupied ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}
            >
              {/* DELETE BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTableToDelete(table);
                }}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700 z-10"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div
                onClick={() => viewQR(table)}
                className="cursor-pointer"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4
                    ${occupied ? 'bg-red-600' : 'bg-green-600'} text-white`}
                >
                  <UtensilsCrossed className="w-7 h-7" />
                </div>

                <div className="text-center font-bold">
                  Table {table.table_number}
                </div>

                <div className="text-center text-xs text-gray-500 mt-1">
                  {table.hall_name || 'General'}
                </div>

                <div className="flex justify-center mt-3">
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold
                      ${occupied ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}
                  >
                    {occupied ? 'Occupied' : 'Available'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD TABLE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Tables</h3>

            <select
              value={createHall}
              onChange={(e) => setCreateHall(e.target.value)}
              className="w-full border px-4 py-2 rounded mb-4"
            >
              <option value="">General</option>
              {halls.map((hall) => (
                <option key={hall.id} value={hall.id}>
                  {hall.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={tableCount}
              onChange={(e) => setTableCount(Number(e.target.value))}
              className="w-full border px-4 py-2 rounded mb-5"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border rounded py-2"
              >
                Cancel
              </button>
              <button
                onClick={createTables}
                className="flex-1 btn-primary"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {/* DELETE MODAL ✅ */}
      <ConfirmDangerModal
        open={Boolean(tableToDelete)}
        title="Delete Table"
        description={
          tableToDelete
            ? `Deleting Table ${tableToDelete.table_number} cannot be undone.`
            : ''
        }
        confirmText="Delete Table"
        onCancel={() => setTableToDelete(null)}
        onConfirm={handleConfirmDeleteTable}
      />

      {/* QR MODAL */}
      {selectedQR && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedQR(null)}
        >
          <div
            className="bg-white rounded-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <QRCodeSVG value={selectedQR.qr_url} size={240} />
            <button
              onClick={() => setSelectedQR(null)}
              className="mt-4 w-full btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {printingTable && restaurant && printSettings && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <QrPrintLayout
            ref={printRef}
            qrValue={
              printingTable.qr_code ||
              `${process.env.REACT_APP_FRONTEND_URL}/menu/${restaurantId}/${printingTable.id}`

            }
            restaurant={restaurant}
            printSettings={printSettings}
            subtitle={`Table ${printingTable.table_number} (${printingTable.hall_name || 'General'})`}
          />
        </div>
      )}



    </div>
  );
};

export default TablesView;
