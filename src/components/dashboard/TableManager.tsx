'use client';

import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Download, 
  Printer, 
  ExternalLink, 
  Plus, 
  Minus, 
  Layers 
} from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { OrderType } from '@/types';
import { toast } from 'sonner';

interface TableStatus {
  number: number;
  status: 'FREE' | 'OCCUPIED' | 'CALL_WAITER' | 'BILL_REQUESTED';
  activeOrder?: OrderType;
}

interface TableManagerProps {
  subdomain?: string;
  restaurantName?: string;
  initialTableCount?: number;
}

export const TableManager: React.FC<TableManagerProps> = ({
  subdomain = 'chezfatou',
  restaurantName = 'Chez Fatou & Frères',
  initialTableCount = 12,
}) => {
  const [tableCount, setTableCount] = useState(initialTableCount);
  const [selectedTable, setSelectedTable] = useState<number | null>(1);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }

    const fetchLiveOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (e) {
        // Ignore
      }
    };

    fetchLiveOrders();
    const interval = setInterval(fetchLiveOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  const tables: TableStatus[] = Array.from({ length: tableCount }, (_, i) => {
    const num = i + 1;
    const activeOrder = orders.find(
      (o) => o.tableNumber === num && (o.status === 'PENDING' || o.status === 'PREPARING')
    );

    let status: TableStatus['status'] = 'FREE';
    if (activeOrder) {
      status = 'OCCUPIED';
    }

    return {
      number: num,
      status,
      activeOrder,
    };
  });

  const freeCount = tables.filter((t) => t.status === 'FREE').length;
  const occupiedCount = tables.filter((t) => t.status === 'OCCUPIED').length;

  const getTableUrl = (num: number) => {
    return `${baseUrl}/menu/${subdomain}/${num}`;
  };

  const handleDownloadPNG = (num: number) => {
    const canvas = document.getElementById(`qr-canvas-${num}`) as HTMLCanvasElement;
    if (!canvas) {
      toast.error('Génération du QR Code en cours...');
      return;
    }

    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');

    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `QR-Table-${num < 10 ? '0' + num : num}-${subdomain}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    toast.success(`📥 QR Code Table ${num} téléchargé en HD !`);
  };

  const handlePrintAllStickers = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;

    const stickersHtml = tables
      .map((t) => {
        const formattedNum = t.number < 10 ? `0${t.number}` : t.number;
        const qrUrl = getTableUrl(t.number);
        const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
          qrUrl
        )}&margin=1`;

        return `
          <div class="sticker-card">
            <div class="brand">🍽️ LOU AME TAY ?</div>
            <div class="restaurant-name">${restaurantName}</div>
            <div class="qr-container">
              <img src="${qrImgUrl}" alt="QR Table ${formattedNum}" />
            </div>
            <div class="table-badge">TABLE ${formattedNum}</div>
            <div class="tagline">Scannez pour commander sans attendre</div>
          </div>
        `;
      })
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Planche Stickers QR Codes Tables - ${restaurantName}</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 0;
              background: #fff;
              color: #000;
            }
            .grid-container {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12mm;
            }
            .sticker-card {
              border: 3px solid #ff6b00;
              border-radius: 16px;
              padding: 12px;
              text-align: center;
              page-break-inside: avoid;
              background: #fff;
              box-shadow: 0 2px 6px rgba(0,0,0,0.05);
            }
            .brand {
              font-size: 13px;
              font-weight: 900;
              color: #ff6b00;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .restaurant-name {
              font-size: 10px;
              color: #666;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .qr-container {
              background: #fff;
              padding: 6px;
              display: inline-block;
              border-radius: 12px;
              border: 1px solid #eee;
            }
            .qr-container img {
              width: 140px;
              height: 140px;
              display: block;
            }
            .table-badge {
              font-size: 18px;
              font-weight: 900;
              background: #00A86B;
              color: #fff;
              padding: 4px 12px;
              border-radius: 8px;
              display: inline-block;
              margin-top: 8px;
              margin-bottom: 4px;
            }
            .tagline {
              font-size: 9px;
              color: #444;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="grid-container">
            ${stickersHtml}
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1">
          <span className="text-xs text-slate-400 font-bold block">Total Tables</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-white">{tableCount}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTableCount((prev) => Math.max(1, prev - 1))}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold"
                title="Supprimer une table"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTableCount((prev) => prev + 1)}
                className="w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center text-xs font-bold"
                title="Ajouter une table"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1">
          <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>Tables Libres</span>
          </span>
          <span className="text-2xl font-black text-slate-300">{freeCount}</span>
        </div>

        <div className="bg-slate-900 border border-amber-500/40 p-4 rounded-3xl space-y-1">
          <span className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Commandes en cours</span>
          </span>
          <span className="text-2xl font-black text-amber-400">{occupiedCount}</span>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 p-4 rounded-3xl flex flex-col justify-between">
          <span className="text-xs text-orange-400 font-bold">Impression Stickers</span>
          <button
            type="button"
            onClick={handlePrintAllStickers}
            className="w-full mt-2 py-2 px-3 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer Planche</span>
          </button>
        </div>
      </div>

      {/* Hidden QR Canvases for PNG Downloads */}
      <div className="hidden">
        {tables.map((t) => (
          <QRCodeCanvas
            key={t.number}
            id={`qr-canvas-${t.number}`}
            value={getTableUrl(t.number)}
            size={512}
            level="H"
            marginSize={2}
          />
        ))}
      </div>

      {/* 2. Floor Plan Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-black text-white">
              Plan de Salle en Direct
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Cliquez sur une table pour générer le QR code et tester le menu
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {tables.map((t) => {
            const isSelected = selectedTable === t.number;
            const isOccupied = t.status === 'OCCUPIED';
            const formatted = t.number < 10 ? `0${t.number}` : t.number;

            return (
              <button
                key={t.number}
                type="button"
                onClick={() => setSelectedTable(t.number)}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-between text-center gap-2 relative ${
                  isSelected
                    ? 'border-orange-500 bg-orange-950/30 ring-2 ring-orange-500/40 scale-[1.02]'
                    : isOccupied
                    ? 'border-amber-500/80 bg-amber-950/20 hover:bg-amber-900/30'
                    : 'border-slate-800 bg-slate-950 hover:bg-slate-800/80'
                }`}
              >
                <span
                  className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full ${
                    isOccupied ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'
                  }`}
                />

                <div className="text-xl sm:text-2xl font-black text-white font-mono">
                  {formatted}
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-300 block">
                    Table {t.number}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider block ${
                      isOccupied ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  >
                    {isOccupied ? '🟡 En cours' : '⚪ Libre'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Table QR Detail Box */}
      {selectedTable !== null && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-orange-400 shrink-0">
              <QRCodeSVG
                value={getTableUrl(selectedTable)}
                size={120}
                level="H"
                marginSize={1}
              />
            </div>

            <div className="space-y-1 text-left">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                Sticker Officiel
              </span>
              <h4 className="text-lg font-black text-white">
                Table N° {selectedTable < 10 ? '0' + selectedTable : selectedTable}
              </h4>
              <p className="text-xs text-slate-400 break-all font-mono">
                {getTableUrl(selectedTable)}
              </p>
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md">
                  QR Haute Définition
                </span>
                <span className="text-[11px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-md">
                  Format Sticker 8x8 cm
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
            <button
              type="button"
              onClick={() => handleDownloadPNG(selectedTable)}
              className="flex-1 md:flex-initial py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all shadow-xs"
            >
              <Download className="w-4 h-4 text-orange-400" />
              <span>Télécharger PNG</span>
            </button>

            <a
              href={getTableUrl(selectedTable)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial py-3 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all"
            >
              <span>Tester Menu Table</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};