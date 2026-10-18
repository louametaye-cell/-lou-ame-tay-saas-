'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Layers, 
  ShieldCheck, 
  Plus, 
  RefreshCw, 
  Gift, 
  Receipt, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight,
  TrendingUp,
  FileText,
  Boxes,
  Truck,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';

interface QRSupportItem {
  id: string;
  name: string;
  description?: string;
  material: 'BOIS' | 'ACRYLIQUE' | 'ALUMINIUM';
  targetSpace: 'TABLE' | 'ROOM' | 'POOL' | 'BEACH' | 'BAR' | 'COUNTER';
  finishType: 'STANDARD' | 'MARINE_VERNIS';
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  packagingIncluded: boolean;
  antiTheftEngraving: boolean;
  isSavPack: boolean;
  isActive: boolean;
  _count?: {
    dotations: number;
    tables: number;
  };
}

interface DotationItem {
  id: string;
  tenantId: string;
  supportId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isSetupInvoiced: boolean;
  invoiceType: 'SETUP' | 'SAV' | 'PARRAINAGE';
  isSponsored: boolean;
  notes?: string;
  createdAt: string;
  tenant: {
    id: string;
    businessName: string;
    subdomain: string;
    ownerName?: string;
    parrainageCredits: number;
  };
  support: QRSupportItem;
}

interface HardwareInvoiceItem {
  id: string;
  invoiceNumber: string;
  invoiceType: string;
  amount: number;
  status: string;
  paymentMethod: string;
  paidAt?: string;
  createdAt: string;
  tenant: {
    id: string;
    businessName: string;
    subdomain: string;
  };
}

interface RestaurantOption {
  id: string;
  businessName: string;
  subdomain: string;
  ownerName?: string | null;
  parrainageCredits?: number;
}

export const HardwareCatalogPanel: React.FC<{ restaurants?: RestaurantOption[] }> = ({ restaurants = [] }) => {
  const [catalog, setCatalog] = useState<QRSupportItem[]>([]);
  const [dotations, setDotations] = useState<DotationItem[]>([]);
  const [invoices, setInvoices] = useState<HardwareInvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddSupportOpen, setIsAddSupportOpen] = useState(false);
  const [isNewDotationOpen, setIsNewDotationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Support Form State
  const [supportName, setSupportName] = useState('');
  const [supportDesc, setSupportDesc] = useState('');
  const [supportMaterial, setSupportMaterial] = useState<'BOIS' | 'ACRYLIQUE' | 'ALUMINIUM'>('BOIS');
  const [supportTargetSpace, setSupportTargetSpace] = useState<'TABLE' | 'ROOM' | 'POOL' | 'BEACH' | 'BAR' | 'COUNTER'>('TABLE');
  const [supportFinishType, setSupportFinishType] = useState<'STANDARD' | 'MARINE_VERNIS'>('STANDARD');
  const [supportCostPrice, setSupportCostPrice] = useState<number>(3000);
  const [supportSellingPrice, setSupportSellingPrice] = useState<number>(6000);
  const [supportStock, setSupportStock] = useState<number>(50);
  const [supportPackaging, setSupportPackaging] = useState(true);
  const [supportEngraving, setSupportEngraving] = useState(true);
  const [supportIsSav, setSupportIsSav] = useState(false);

  // New Dotation Form State
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedSupportId, setSelectedSupportId] = useState('');
  const [dotationQty, setDotationQty] = useState(1);
  const [dotationType, setDotationType] = useState<'SETUP' | 'SAV' | 'PARRAINAGE'>('SETUP');
  const [generateInvoice, setGenerateInvoice] = useState(true);
  const [dotationNotes, setDotationNotes] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [catRes, dotRes, invRes] = await Promise.all([
        fetch('/api/super-admin/hardware/catalog'),
        fetch('/api/super-admin/hardware/dotations'),
        fetch('/api/super-admin/hardware/invoices'),
      ]);

      if (catRes.ok) {
        const d = await catRes.json();
        setCatalog(d.items || []);
      }
      if (dotRes.ok) {
        const d = await dotRes.json();
        setDotations(d.dotations || []);
      }
      if (invRes.ok) {
        const d = await invRes.json();
        setInvoices(d.invoices || []);
      }
    } catch (e) {
      console.error(e);
      toast.error('Erreur de chargement des données matériel');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Quick stock adjustment (+10, -10)
  const handleQuickStock = async (id: string, delta: number) => {
    try {
      const res = await fetch('/api/super-admin/hardware/catalog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stockAdjustment: delta }),
      });
      if (res.ok) {
        toast.success(`Stock mis à jour (${delta > 0 ? `+${delta}` : delta})`);
        fetchData();
      }
    } catch (e) {
      toast.error('Erreur ajustement stock');
    }
  };

  // Add Support Item
  const handleCreateSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportName.trim()) {
      toast.error('Nom du support obligatoire');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/super-admin/hardware/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: supportName.trim(),
          description: supportDesc.trim() || undefined,
          material: supportMaterial,
          targetSpace: supportTargetSpace,
          finishType: supportFinishType,
          costPrice: Number(supportCostPrice),
          sellingPrice: Number(supportSellingPrice),
          stockQuantity: Number(supportStock),
          packagingIncluded: supportPackaging,
          antiTheftEngraving: supportEngraving,
          isSavPack: supportIsSav,
        }),
      });

      if (res.ok) {
        toast.success('Nouveau support ajouté au catalogue !');
        setIsAddSupportOpen(false);
        // Reset form
        setSupportName('');
        setSupportDesc('');
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erreur lors de la création');
      }
    } catch (e) {
      toast.error('Erreur réseau');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Dotation
  const handleCreateDotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId || !selectedSupportId) {
      toast.error('Veuillez sélectionner un établissement et un support');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/super-admin/hardware/dotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenantId,
          supportId: selectedSupportId,
          quantity: Number(dotationQty),
          invoiceType: dotationType,
          isSetupInvoiced: generateInvoice,
          notes: dotationNotes.trim() || undefined,
        }),
      });

      if (res.ok) {
        toast.success('Dotation matériel attribuée avec succès !');
        setIsNewDotationOpen(false);
        setDotationNotes('');
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erreur lors de la dotation');
      }
    } catch (e) {
      toast.error('Erreur réseau');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mark invoice as paid
  const handlePayInvoice = async (invoiceId: string) => {
    try {
      const res = await fetch('/api/super-admin/hardware/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: invoiceId, status: 'SUCCESS' }),
      });
      if (res.ok) {
        toast.success('Facture matériel marquée comme encaissée !');
        fetchData();
      }
    } catch (e) {
      toast.error('Erreur mise à jour facture');
    }
  };

  // Financial & Inventory KPIs
  const totalStockUnits = catalog.reduce((acc, item) => acc + (item.stockQuantity || 0), 0);
  const totalStockValueFcfa = catalog.reduce(
    (acc, item) => acc + (item.stockQuantity || 0) * Number(item.sellingPrice || 0),
    0
  );
  const totalSavUnits = catalog
    .filter((item) => item.isSavPack)
    .reduce((acc, item) => acc + (item.stockQuantity || 0), 0);
  const totalInvoicedFcfa = invoices
    .filter((inv) => inv.status === 'SUCCESS')
    .reduce((acc, inv) => acc + Number(inv.amount || 0), 0);
  const pendingInvoicesCount = invoices.filter((inv) => inv.status === 'PENDING').length;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 text-slate-900 font-sans">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>📦 CATALOGUE & STOCK MATÉRIEL (BOIS & ACRYLIQUE)</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Vente de supports physiques, finitions marine, kits SAV et traçabilité par établissement.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAddSupportOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>+ Nouveau Support</span>
          </button>

          <button
            onClick={() => setIsNewDotationOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Truck className="w-4 h-4 text-white" />
            <span>+ Attribuer Dotation</span>
          </button>

          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all font-bold"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500">Stock Total Restant</span>
            <div className="text-2xl font-black text-slate-900 font-mono">{totalStockUnits} unités</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-800">Valeur Vente du Stock</span>
            <div className="text-2xl font-black text-emerald-700 font-mono">{formatFCFA(totalStockValueFcfa)}</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-emerald-200 text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-900">Kits Secours SAV</span>
            <div className="text-2xl font-black text-amber-700 font-mono">{totalSavUnits} lots pré-gravés</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-amber-200 text-amber-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-900">Facturation Matériel</span>
            <div className="text-2xl font-black text-blue-700 font-mono">{formatFCFA(totalInvoicedFcfa)}</div>
            {pendingInvoicesCount > 0 && (
              <span className="text-[10px] font-bold text-amber-700">({pendingInvoicesCount} en attente)</span>
            )}
          </div>
          <div className="p-3 bg-white rounded-xl border border-blue-200 text-blue-600">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SECTION 1: CATALOGUE DES SUPPORTS PHYSIQUES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <span>─── ARTICLES DU CATALOGUE & INVENTAIRE ───</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">{catalog.length} références actives</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {catalog.map((item) => {
            const isLowStock = item.stockQuantity <= 15;
            const isZeroStock = item.stockQuantity === 0;
            const margin = item.sellingPrice - item.costPrice;

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        item.material === 'BOIS'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-cyan-100 text-cyan-900 border border-cyan-300'
                      }`}
                    >
                      {item.material}
                    </span>

                    {item.finishType === 'MARINE_VERNIS' && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        🌊 Finition Marine
                      </span>
                    )}

                    {item.isSavPack && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                        🛡️ SAV
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 leading-tight">{item.name}</h4>
                  {item.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                  )}

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {item.packagingIncluded && (
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        ✓ Jute Offerte
                      </span>
                    )}
                    {item.antiTheftEngraving && (
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        ✓ Gravure DAW
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-600 uppercase font-bold">Prix Vente</span>
                      <div className="text-base font-black text-slate-900 font-mono">
                        {formatFCFA(item.sellingPrice)}
                      </div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="text-[10px] text-slate-600 uppercase font-bold">Marge Brute</span>
                      <div className="text-xs font-bold text-emerald-700 font-mono">+{formatFCFA(margin)}</div>
                    </div>
                  </div>

                  {/* Stock Indicator & Quick Controls */}
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isZeroStock ? 'bg-red-500 animate-ping' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                      <span className="text-xs font-black font-mono text-slate-900">{item.stockQuantity} en stock</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickStock(item.id, -5)}
                        disabled={item.stockQuantity < 5}
                        className="px-2 py-0.5 bg-white hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs rounded border border-slate-300"
                        title="Retirer 5 unités"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => handleQuickStock(item.id, 10)}
                        className="px-2 py-0.5 bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs rounded border border-slate-300"
                        title="Ajouter 10 unités"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: HISTORIQUE DES DOTATIONS & FACTURATION */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <span>─── DOTATIONS RESTAURANTS & FACTURATION SÉPARÉE ───</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">{dotations.length} dotations enregistrées</span>
        </div>

        {dotations.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
            <p className="text-xs font-semibold text-slate-500">
              Aucune dotation de supports physiques effectuée pour le moment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Restaurant Client</th>
                  <th className="py-2.5 px-3">Support Attribué</th>
                  <th className="py-2.5 px-3">Quantité</th>
                  <th className="py-2.5 px-3">Total FCFA</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Facture Matériel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dotations.map((dot) => {
                  const matchingInvoice = invoices.find(
                    (inv) => inv.tenant.subdomain === dot.tenant.subdomain && inv.status === 'PENDING'
                  );

                  return (
                    <tr key={dot.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {new Date(dot.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-slate-900">{dot.tenant.businessName}</span>
                        <span className="block text-[10px] text-slate-400">@{dot.tenant.subdomain}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800">{dot.support.name}</span>
                        <span className="block text-[10px] text-slate-500">
                          {dot.support.material} • {dot.support.finishType}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-black text-slate-900">x{dot.quantity}</td>
                      <td className="py-3 px-3 font-mono font-black text-slate-900">
                        {dot.isSponsored ? (
                          <span className="text-purple-600 font-bold">OFFERT (0 FCFA)</span>
                        ) : (
                          formatFCFA(dot.totalPrice)
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {dot.invoiceType === 'PARRAINAGE' ? (
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-black text-[10px]">
                            🎁 Parrainage
                          </span>
                        ) : dot.invoiceType === 'SAV' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[10px]">
                            🛡️ SAV
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-black text-[10px]">
                            📦 Setup Initial
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {dot.isSponsored ? (
                          <span className="text-slate-400 text-[10px] italic">Non facturé</span>
                        ) : matchingInvoice ? (
                          <button
                            onClick={() => handlePayInvoice(matchingInvoice.id)}
                            className="px-2.5 py-1 bg-amber-100 hover:bg-emerald-600 hover:text-white text-amber-900 rounded-lg text-[10px] font-black transition-all"
                            title="Cliquer pour marquer comme encaissé"
                          >
                            Encaisser {matchingInvoice.invoiceNumber}
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold text-[10px] flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Encaissé
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: NOUVEAU SUPPORT AU CATALOGUE */}
      {isAddSupportOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <span>Ajouter un Support au Catalogue</span>
              </h3>
              <button
                onClick={() => setIsAddSupportOpen(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupport} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation du Support *</label>
                <input
                  type="text"
                  required
                  value={supportName}
                  onChange={(e) => setSupportName(e.target.value)}
                  placeholder="ex: Cube VIP Bois Massif - 4 Faces QR"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Matériau</label>
                  <select
                    value={supportMaterial}
                    onChange={(e: any) => setSupportMaterial(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="BOIS">Bois Massif / Exotique</option>
                    <option value="ACRYLIQUE">Acrylique Haute Densité</option>
                    <option value="ALUMINIUM">Aluminium Brossé</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Finition</label>
                  <select
                    value={supportFinishType}
                    onChange={(e: any) => setSupportFinishType(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="STANDARD">Standard Intérieur</option>
                    <option value="MARINE_VERNIS">Finition Marine (Bord de Mer/Piscine)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prix Achat (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={supportCostPrice}
                    onChange={(e) => setSupportCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prix Vente (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={supportSellingPrice}
                    onChange={(e) => setSupportSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Initial</label>
                  <input
                    type="number"
                    min="0"
                    value={supportStock}
                    onChange={(e) => setSupportStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={supportPackaging}
                    onChange={(e) => setSupportPackaging(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Inclure la pochette en jute premium offerte</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={supportEngraving}
                    onChange={(e) => setSupportEngraving(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Gravure laser anti-vol (&quot;Propriété de [Resto] - Lou Ame Tay&quot;)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={supportIsSav}
                    onChange={(e) => setSupportIsSav(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <span>Définir comme Kit de Secours / Remplacement SAV</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddSupportOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Enregistrer l&apos;Article</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NOUVELLE DOTATION RESTAURANT */}
      {isNewDotationOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <span>Attribuer une Dotation Matériel</span>
              </h3>
              <button
                onClick={() => setIsNewDotationOpen(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDotation} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Établissement Bénéficiaire *</label>
                <select
                  required
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 font-bold"
                >
                  <option value="">Sélectionner un restaurant...</option>
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.businessName} (@{r.subdomain}){' '}
                      {r.parrainageCredits ? `[${r.parrainageCredits} crédits parrainage]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Support Physique *</label>
                <select
                  required
                  value={selectedSupportId}
                  onChange={(e) => setSelectedSupportId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 font-bold"
                >
                  <option value="">Sélectionner un modèle...</option>
                  {catalog.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {formatFCFA(c.sellingPrice)} ({c.stockQuantity} en stock)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantité (Unités)</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={dotationQty}
                    onChange={(e) => setDotationQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Type d&apos;Attribution</label>
                  <select
                    value={dotationType}
                    onChange={(e: any) => setDotationType(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  >
                    <option value="SETUP">Installation Initiale (Facturée)</option>
                    <option value="SAV">Remplacement SAV / Secours</option>
                    <option value="PARRAINAGE">Offre Parrainage (5 Offerts / 0 FCFA)</option>
                  </select>
                </div>
              </div>

              {dotationType !== 'PARRAINAGE' && (
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 pt-1">
                  <input
                    type="checkbox"
                    checked={generateInvoice}
                    onChange={(e) => setGenerateInvoice(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Générer automatiquement la facture matériel séparée</span>
                </label>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Instructions gravure</label>
                <textarea
                  rows={2}
                  value={dotationNotes}
                  onChange={(e) => setDotationNotes(e.target.value)}
                  placeholder="ex: Numérotation de 1 à 15, gravure terrasse bord de mer"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewDotationOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Valider la Dotation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
