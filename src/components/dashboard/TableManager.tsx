'use client';

import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Download, 
  Printer, 
  ExternalLink, 
  Plus, 
  Minus, 
  Layers,
  UtensilsCrossed
} from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { OrderType } from '@/types';
import { TableServiceLiveStatus } from './TableServiceLiveStatus';
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
  const [activeTab, setActiveTab] = useState<'SERVICE' | 'QRCODES'>('SERVICE');
  const [tableCount, setTableCount] = useState(initialTableCount);
  const [selectedTable, setSelectedTable] = useState<number | null>(1);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [baseUrl, setBaseUrl] = useState('');

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }

    fetchLiveOrders();
    const interval = setInterval(fetchLiveOrders, 5000);
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
    toast.success(`QR Code Table ${num} téléchargé (PNG Haute Définition) !`);
  };

  const handlePrintAllStickers = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    const stickersHtml = tables
      .map((t) => {
        const url = getTableUrl(t.number);
        const formatted = t.number < 10 ? `0${t.number}` : `${t.number}`;
        return `
        <div class="sticker-card">
          <div class="sticker-header">🍽️ LOU AME TAY ?</div>
          <div class="resto-name">${restaurantName}</div>
          <div class="qr-container">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}" />
          </div>
          <div class="table-badge">TABLE ${formatted}</div>
          <div class="scan-cta">Scannez pour commander sans attendre</div>
        </div>
      `;
      })
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Planche Stickers QR Codes - ${restaurantName}</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; margin: 0; padding: 0; }
            .grid-container {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15mm;
              justify-items: center;
            }
            .sticker-card {
              width: 80mm;
              height: 80mm;
              border: 2px dashed #ff6b00;
              border-radius: 12mm;
              box-sizing: border-box;
              padding: 4mm;
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              page-break-inside: avoid;
            }
            .sticker-header {
              font-size: 13px;
              font-weight: 900;
              color: #ff6b00;
            }
            .resto-name {
              font-size: 10px;
              font-weight: 700;
              color: #333;
            }
            .qr-container img {
              width: 44mm;
              height: 44mm;
              display: block;
              margin: 0 auto;
            }
            .table-badge {
              background: #00a86b;
              color: #fff;
              font-size: 12px;
              font-weight: 900;
              padding: 2px 10px;
              border-radius: 6px;
            }
            .scan-cta {
              font-size: 9px;
              color: #666;
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
      {/* Tab Selector */}
      <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl w-fit text-xs sm:text-sm font-bold shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('SERVICE')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'SERVICE'
              ? 'bg-white text-slate-900 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4 text-orange-600" />
          <span>Suivi du Service & Shift Serveurs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('QRCODES')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'QRCODES'
              ? 'bg-white text-slate-900 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4 text-emerald-600" />
          <span>Générateur QR Codes & Stickers HD</span>
        </button>
      </div>

      {/* TAB 1: SERVICE & TABLES LIVE STATUS */}
      {activeTab === 'SERVICE' && (
        <TableServiceLiveStatus
          orders={orders}
          tableCount={tableCount}
          onRefreshOrders={fetchLiveOrders}
        />
      )}

      {/* TAB 2: QR CODES & FLOOR PLAN */}
      {activeTab === 'QRCODES' && (
        <div className="space-y-6">
          {/* 1. Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-3xl space-y-1 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">Tables Installées</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-slate-900 font-mono">{tableCount}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setTableCount(Math.max(1, tableCount - 1))}
                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                    title="Diminuer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableCount(tableCount + 1)}
                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                    title="Ajouter"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-emerald-300 p-4 rounded-3xl space-y-1 shadow-xs">
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Tables Libres</span>
              </span>
              <span className="text-2xl font-black text-emerald-700 font-mono">{freeCount}</span>
            </div>

            <div className="bg-white border border-amber-300 p-4 rounded-3xl space-y-1 shadow-xs">
              <span className="text-xs text-amber-700 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Commandes en cours</span>
              </span>
              <span className="text-2xl font-black text-amber-800 font-mono">{occupiedCount}</span>
            </div>

            <div className="bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-300 p-4 rounded-3xl flex flex-col justify-between shadow-xs">
              <span className="text-xs text-amber-900 font-bold">Impression Stickers</span>
              <button
                type="button"
                onClick={handlePrintAllStickers}
                className="w-full mt-2 py-2 px-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
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
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-black text-slate-900">
                  Plan de Salle en Direct
                </h3>
              </div>
              <span className="text-xs text-slate-500">
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
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-between text-center gap-2 relative shadow-2xs ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400 scale-[1.02]'
                        : isOccupied
                        ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-100/50'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full ${
                        isOccupied ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'
                      }`}
                    />

                    <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                      {formatted}
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        Table {t.number}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider block ${
                          isOccupied ? 'text-amber-800' : 'text-slate-400'
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
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-white rounded-2xl shadow-sm border-2 border-amber-400 shrink-0">
                  <QRCodeSVG
                    value={getTableUrl(selectedTable)}
                    size={120}
                    level="H"
                    marginSize={1}
                  />
                </div>

                <div className="space-y-1 text-left">
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                    Sticker Officiel
                  </span>
                  <h4 className="text-lg font-black text-slate-900">
                    Table N° {selectedTable < 10 ? '0' + selectedTable : selectedTable}
                  </h4>
                  <p className="text-xs text-slate-500 break-all font-mono">
                    {getTableUrl(selectedTable)}
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded-md">
                      QR Haute Définition
                    </span>
                    <span className="text-[11px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md border border-slate-200">
                      Format Sticker 8x8 cm
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => handleDownloadPNG(selectedTable)}
                  className="flex-1 md:flex-initial py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 transition-all shadow-2xs"
                >
                  <Download className="w-4 h-4 text-orange-600" />
                  <span>Télécharger PNG</span>
                </button>

                <a
                  href={getTableUrl(selectedTable)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-initial py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <span>Tester Menu Table</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};