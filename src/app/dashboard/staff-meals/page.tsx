'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  DollarSign, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight,
  Utensils,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';

interface StaffMealEmployeeSummary {
  employeeName: string;
  orderCount: number;
  totalAmount: number;
  orders: {
    id: string;
    createdAt: string;
    totalAmount: number;
    cashierName: string;
    items: {
      name: string;
      quantity: number;
      price: number;
    }[];
  }[];
}

export default function StaffMealsReportPage() {
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState('Mon Restaurant');
  const [summary, setSummary] = useState<StaffMealEmployeeSummary[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [totalMeals, setTotalMeals] = useState(0);
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

  const fetchStaffMeals = useCallback(async (month: string) => {
    setIsLoading(true);
    try {
      const storedId = typeof window !== 'undefined' ? localStorage.getItem('current_restaurant_id') || '' : '';
      const res = await fetch(`/api/tenant/staff-meals?restaurantId=${encodeURIComponent(storedId)}&month=${month}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setSummary(data.summary || []);
        setGrandTotal(data.grandTotal || 0);
        setTotalMeals(data.totalMeals || 0);
        if (data.restaurant?.name) {
          setRestaurantName(data.restaurant.name);
        }
      } else {
        toast.error(data.error || 'Erreur lors du chargement des repas employés');
      }
    } catch (err) {
      toast.error('Erreur réseau lors du chargement');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffMeals(currentMonth);
  }, [currentMonth, fetchStaffMeals]);

  const handlePrevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${newY}-${newM}`);
  };

  const handleNextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const date = new Date(y, m, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${newY}-${newM}`);
  };

  // Export CSV Comptabilité
  const handleExportCSV = () => {
    if (summary.length === 0) {
      toast.warning('Aucun repas personnel enregistré pour ce mois.');
      return;
    }

    const [y, m] = currentMonth.split('-');
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const monthLabel = `${monthNames[Number(m) - 1]} ${y}`;

    let csvContent = '\uFEFF'; // UTF-8 BOM pour Excel
    csvContent += `RAPPORT DES BONS REPAS PERSONNEL (NP) - ${restaurantName.toUpperCase()}\n`;
    csvContent += `Période : ${monthLabel}\n`;
    csvContent += `Total Général à Déduire sur Salaires : ${grandTotal} FCFA (${totalMeals} repas)\n\n`;

    csvContent += '--- RÉSUMÉ PAR EMPLOYÉ ---\n';
    csvContent += 'Nom de l\'Employé;Nombre de Repas;Montant Total (FCFA)\n';

    summary.forEach((emp) => {
      csvContent += `"${emp.employeeName.replace(/"/g, '""')}";${emp.orderCount};${emp.totalAmount}\n`;
    });

    csvContent += '\n--- DÉTAIL CHRONOLOGIQUE DES BONS NP ---\n';
    csvContent += 'Date & Heure;N° Commande;Employé;Détail Plats;Caissier;Montant (FCFA)\n';

    summary.forEach((emp) => {
      emp.orders.forEach((o) => {
        const orderDate = new Date(o.createdAt).toLocaleString('fr-FR');
        const itemsDetail = o.items.map((i) => `${i.quantity}x ${i.name}`).join(' + ');
        csvContent += `"${orderDate}";"#${o.id.slice(-6).toUpperCase()}";"${emp.employeeName}";"${itemsDetail}";"${o.cashierName}";${o.totalAmount}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `repas_personnel_NP_${restaurantName.toLowerCase().replace(/\s+/g, '_')}_${currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Fichier CSV exporté avec succès pour le comptable !');
  };

  const formattedMonthLabel = (() => {
    const [y, m] = currentMonth.split('-').map(Number);
    const date = new Date(y, m - 1, 1);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  })();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      {/* Header Sticky */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                <span>Repas du Personnel (Bons NP)</span>
              </h1>
              <p className="text-xs text-slate-500">
                Suivi mensuel des repas pris par les employés pour retenue sur salaire ou facturation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={summary.length === 0}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs sm:text-sm font-extrabold px-4 sm:px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer min-h-[44px]"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Exporter en CSV (Comptable)</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
        {/* Barre de navigation par mois */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Mois précédent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-950 border border-purple-200 rounded-xl font-black text-sm capitalize">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>{formattedMonthLabel}</span>
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Mois suivant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="text-xs text-slate-500 font-bold">
            Établissement : <strong className="text-slate-900">{restaurantName}</strong>
          </div>
        </div>

        {/* Cartes Synthétiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Montant Total Cumulé (NP)
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-purple-950">
              {formatFCFA(grandTotal)}
            </div>
            <span className="text-[11px] text-purple-700 font-bold">
              À déduire des fiches de paie à la fin du mois
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Total Bons Repas Servis
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {totalMeals}
            </div>
            <span className="text-[11px] text-slate-500">
              Enregistrés en caisse sous le motif NP
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Employés Bénéficiaires
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {summary.length}
            </div>
            <span className="text-[11px] text-slate-500">
              Membres du staff ayant consommé ce mois
            </span>
          </div>
        </div>

        {/* Tableau Récapitulatif par Employé */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>Ventilation par Employé</span>
                <span className="text-xs bg-purple-100 text-purple-900 font-bold px-2.5 py-0.5 rounded-full">
                  {summary.length} employés
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Cliquez sur une ligne pour voir le détail des repas pris (date, plats, caissier)
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold">Chargement des données comptables...</p>
            </div>
          ) : summary.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 text-xl">
                👤
              </div>
              <p className="text-sm font-bold text-slate-600">Aucun bon repas personnel enregistré pour ce mois</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Les repas validés en caisse avec le mode "Repas Personnel (NP)" apparaîtront automatiquement ici.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {summary.map((emp) => {
                const isExpanded = expandedEmployee === emp.employeeName;

                return (
                  <div key={emp.employeeName} className="transition-colors">
                    {/* Ligne principale cliquable */}
                    <div
                      onClick={() => setExpandedEmployee(isExpanded ? null : emp.employeeName)}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-black text-sm text-slate-900">{emp.employeeName}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                              {emp.orderCount} repas
                            </span>
                            <span>•</span>
                            <span>Moyenne : {formatFCFA(Math.round(emp.totalAmount / emp.orderCount))} / repas</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-xs text-slate-400 uppercase font-bold block">À déduire</span>
                          <span className="text-lg sm:text-xl font-black font-mono text-purple-950">
                            {formatFCFA(emp.totalAmount)}
                          </span>
                        </div>
                        <div className="text-slate-400">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* Détail déroulant des repas */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 bg-purple-50/30 border-t border-purple-100 space-y-3">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Détail des repas pris par {emp.employeeName} :
                        </h4>
                        <div className="space-y-2">
                          {emp.orders.map((o) => (
                            <div
                              key={o.id}
                              className="p-3 bg-white rounded-xl border border-purple-100 flex items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <div className="font-bold text-slate-800">
                                  {new Date(o.createdAt).toLocaleString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                  <span className="text-slate-400 font-mono ml-2">#{o.id.slice(-5).toUpperCase()}</span>
                                </div>
                                <div className="text-slate-600 mt-1">
                                  {o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Validé par : {o.cashierName}
                                </div>
                              </div>
                              <div className="text-right font-black font-mono text-sm text-purple-950">
                                {formatFCFA(o.totalAmount)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
