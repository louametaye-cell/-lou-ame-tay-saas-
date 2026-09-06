'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  QrCode, 
  ExternalLink, 
  Plus, 
  Minus, 
  Layers,
  UtensilsCrossed,
  ShieldCheck,
  Package,
  Phone
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
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
  const [qrMode, setQrMode] = useState<'TABLE' | 'EXPRESS'>('TABLE');
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
    return `${baseUrl}/r/${subdomain}/${num}`;
  };

  const expressUrl = `${baseUrl}/r/${subdomain}/express`;

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
          {/* BANNIÈRE OFFICIELLE MDA ARTS WORK - IMPRESSION RÉSERVÉE */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 border-2 border-amber-300/80 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center shadow-xs shrink-0">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-full">
                    Atelier d&apos;Impression Officiel
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    Médias Graphisme / MDA Arts Work
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Chevalets de Table A5/A6 &amp; Stickers Étanches Haute Définition
                </h3>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  L&apos;impression et le tirage physique des QR codes sont réservés et certifiés par nos ateliers pour garantir une plastification étanche lavable et un design premium anti-reflet.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
              <Link
                href="/dashboard/qrcodes"
                className="flex-1 md:flex-initial py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Package className="w-4 h-4" />
                <span>Commander nos Packs Chevalets</span>
              </Link>

              <a
                href="https://wa.me/221774587474?text=Bonjour%20MDA%20Arts%20Work%20je%20souhaite%20commander%20mes%20chevalets%20et%20stickers%20QR%20code"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp (+221 77 458 74 74)</span>
                <span className="sm:hidden">WhatsApp</span>
              </a>
            </div>
          </div>

          {/* QR Code Type Selector */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex-wrap">
            <button
              type="button"
              onClick={() => setQrMode('TABLE')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                qrMode === 'TABLE'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>🍽️ QR Codes Tables (1 à {tableCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setQrMode('EXPRESS')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                qrMode === 'EXPRESS'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>⚡ 🆕 QR Code Comptoir / Bar (Express)</span>
            </button>
          </div>



          {/* IF QR MODE IS EXPRESS */}
          {qrMode === 'EXPRESS' ? (
            <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-purple-500/50 shadow-2xl space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                    <span>⚡ Mode Express / Bar Officiel</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    QR Code Spécial Comptoir &amp; Bar
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Posez ce QR Code sur votre comptoir, caisse ou bar. Le client scanne, passe sa commande <strong>sans numéro de table</strong>, et elle arrive instantanément sur votre écran caisse (<strong>/cashier</strong>) pour un encaissement ultra-rapide.
                  </p>
                  <p className="text-xs font-mono text-purple-300 font-bold bg-white/10 px-3 py-1.5 rounded-xl w-fit break-all">
                    {expressUrl}
                  </p>
                </div>

                <div className="p-4 bg-white rounded-3xl shadow-xl border-4 border-purple-400 shrink-0 self-center md:self-auto">
                  <QRCodeSVG
                    value={expressUrl}
                    size={160}
                    level="H"
                    marginSize={1}
                  />
                  <span className="block text-center text-[10px] font-black text-purple-950 uppercase tracking-wider pt-2">
                    ⚡ COMPTOIR EXPRESS
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/15 flex items-center gap-3 flex-wrap">
                <Link
                  href="/dashboard/qrcodes"
                  className="py-3 px-5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs rounded-2xl shadow-lg flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Package className="w-4 h-4" />
                  <span>Commander Chevalet Comptoir Officiel (MDA)</span>
                </Link>

                <a
                  href={expressUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/20 flex items-center gap-2 transition-all ml-auto"
                >
                  <span>Tester le Menu Express</span>
                  <ExternalLink className="w-4 h-4 text-amber-400" />
                </a>
              </div>
            </div>
          ) : (
            <>
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
                  <span className="text-xs text-amber-950 font-black flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                    <span>Packs Chevalets MDA</span>
                  </span>
                  <Link
                    href="/dashboard/qrcodes"
                    className="w-full mt-2 py-2 px-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Commander ({tableCount} tables)</span>
                  </Link>
                </div>
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
                      <div className="pt-1.5 flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] bg-amber-50 text-amber-900 border border-amber-200 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-amber-600" />
                          Tirage physique certifié Super-Admin
                        </span>
                        <span className="text-[11px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md border border-slate-200">
                          Format Sticker 8x8 cm ou Chevalet A5/A6
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
                    <Link
                      href="/dashboard/qrcodes"
                      className="flex-1 md:flex-initial py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Package className="w-4 h-4" />
                      <span>Commander nos Chevalets &amp; Stickers</span>
                    </Link>

                    <a
                      href={getTableUrl(selectedTable)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 md:flex-initial py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 transition-all shadow-2xs"
                    >
                      <span>Tester Menu Table {selectedTable < 10 ? '0' + selectedTable : selectedTable}</span>
                      <ExternalLink className="w-4 h-4 text-orange-600" />
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};