import React, { useRef, useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { restaurantAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import QrPrintLayout from '../QrPrintLayout';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';

const ParcelQR = ({ restaurantId }) => {
  const qrRef = useRef(null);
  const { user } = useAuth();

  const [printSettings, setPrintSettings] = useState(null);
  const [restaurant, setRestaurant] = useState(null);


  const parcelUrl = `${process.env.REACT_APP_FRONTEND_URL}/parcel/menu/${restaurantId}`;

  /* ================= LOAD SETTINGS ================= */

  useEffect(() => {
    loadPrintSettings();
  }, []);

  const loadPrintSettings = async () => {
    try {
      const res = await restaurantAPI.getPrintSettings();
      setPrintSettings(res.data);
    } catch { }
  };
  useEffect(() => {
    loadPrintSettings();
    loadRestaurant();
  }, []);

  const loadRestaurant = async () => {
    try {
      const res = await restaurantAPI.getById(restaurantId);
      setRestaurant(res.data);
    } catch { }
  };


  /* ================= DOWNLOAD QR (FINAL FIX) ================= */

  const downloadQR = async () => {
    if (!qrRef.current) return;

    try {
      // 1️⃣ Convert layout to image (LOGO SAFE)
      const dataUrl = await htmlToImage.toPng(qrRef.current, {
        cacheBust: true,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      // 2️⃣ Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = 150;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      const x = (210 - pdfWidth) / 2; // center horizontally
      const y = 20;

      pdf.addImage(dataUrl, 'PNG', x, y, pdfWidth, pdfHeight);
      pdf.save('parcel-qr.pdf');
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="card p-6 max-w-md">
      <h2 className="text-xl font-bold mb-2">Parcel QR</h2>

      <p className="text-sm text-gray-500 mb-4">
        Place this QR on your desk for parcel customers
      </p>

      {/* QR PRINT LAYOUT (HIDDEN BUT USED FOR PDF) */}
      <div className="flex justify-center">
        <QrPrintLayout
          ref={qrRef}
          qrValue={parcelUrl}
          restaurant={{
            name: restaurant?.name,
            logo: restaurant?.logo,
          }}
          printSettings={printSettings}
          subtitle="Scan to order parcel"
        />
      </div>

      <button
        onClick={downloadQR}
        className="btn-primary mt-4 w-full flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        Download QR (PDF)
      </button>
    </div>
  );
};

export default ParcelQR;
