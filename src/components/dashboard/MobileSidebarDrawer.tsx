'use client';

import React from 'react';
import Link from 'next/link';
import { 
  X, 
  Store, 
  Utensils, 
  Receipt, 
  QrCode, 
  CreditCard, 
  ChefHat, 
  Tv, 
  KeyRound, 
  BarChart3, 
  Palette, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ExternalLink,
  ShieldCheck,
  DollarSign
} from 'lucide-react';

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  restaurantSubdomain: string;
  restaurantId: string;
  restaurantLogo?: string;
  currentPlanName: string;
  onOpenChangePassword: () => void;
  onLogout: () => void;
}

export function MobileSidebarDrawer({
  isOpen,
  onClose,
  restaurantName,
  restaurantSubdomain,
  restaurantId,
  restaurantLogo,
  currentPlanName,
  onOpenChangePassword,
  onLogout,
}: MobileSidebarDrawerProps) {
  if (!isOpen) return null;

  const targetRestaurant = restaurantSubdomain || restaurantId || '';

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop sombre flouté */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Tiroir coulissant (Drawer) depuis la droite */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation mobile"
        className="fixed inset-y-0 right-0 w-[85%] max-w-xs bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-200"
      >
        {/* Header Drawer */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5 min-w-0">
            <img 
              src={restaurantLogo || '/logo.png'} 
              alt={restaurantName}
              className="w-10 h-10 rounded-xl object-cover border border-amber-300 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
            <div className="min-w-0">
              <h3 className="text-sm font-black text-slate-900 truncate">
                {restaurantName || 'Espace Gérant'}
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                <ShieldCheck className="w-3 h-3 text-amber-700" />
                {currentPlanName}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors shrink-0"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps défilable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Raccourcis Opérationnels Directs */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-black text-slate-400 px-2 tracking-wider block">
              Accès Directs Clés
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/cashier?restaurantId=${targetRestaurant}`}
                target="_blank"
                onClick={onClose}
                className="p-2.5 bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center text-center gap-1 shadow-sm active:scale-95"
              >
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold">Caisse POS</span>
              </Link>
              <Link
                href={`/kitchen?restaurantId=${targetRestaurant}`}
                target="_blank"
                onClick={onClose}
                className="p-2.5 bg-amber-500 text-slate-950 rounded-2xl flex flex-col items-center justify-center text-center gap-1 shadow-sm active:scale-95"
              >
                <ChefHat className="w-5 h-5 text-slate-950" />
                <span className="text-xs font-bold">KDS Cuisine</span>
              </Link>
            </div>
          </div>

          {/* Menu de Gestion */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black text-slate-400 px-2 tracking-wider block">
              Gestion & Restauration
            </span>
            <Link
              href="/dashboard/menu"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>Gestion du Menu</span>
            </Link>
            <Link
              href="/dashboard/orders"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Commandes & Ventes</span>
            </Link>
            <Link
              href="/dashboard/tables"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>Plan de Salle & QR Tables</span>
            </Link>
            <Link
              href="/dashboard/cashiers"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <KeyRound className="w-4 h-4 text-orange-600" />
              <span>Équipe Caissiers</span>
            </Link>
            <Link
              href="/dashboard/cash-closures"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <DollarSign className="w-4 h-4 text-purple-600" />
              <span>Clôtures & Rapports Z</span>
            </Link>
            <Link
              href="/dashboard/stats"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Statistiques & Analyse</span>
            </Link>
          </div>

          {/* Affichage & Marque */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black text-slate-400 px-2 tracking-wider block">
              Expérience & Salle
            </span>
            <Link
              href="/dashboard/branding"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Palette className="w-4 h-4 text-pink-600" />
              <span>Studio de Marque</span>
            </Link>
            <Link
              href="/dashboard/display"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Tv className="w-4 h-4 text-teal-600" />
              <span>Affichage Salle TV</span>
            </Link>
            <Link
              href={`/r/${targetRestaurant}`}
              target="_blank"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              <span className="flex items-center gap-3">
                <ExternalLink className="w-4 h-4 text-emerald-600" />
                <span>Voir le Menu Client</span>
              </span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-black">
                Live
              </span>
            </Link>
          </div>

          {/* Réglages & Sécurité */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black text-slate-400 px-2 tracking-wider block">
              Paramètres
            </span>
            <Link
              href="/dashboard/settings"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-600" />
              <span>Configuration Établissement</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenChangePassword();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors text-left"
            >
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>Changer le Mot de Passe</span>
            </button>
            <Link
              href="/dashboard/help"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-sky-600" />
              <span>Support & Documentation</span>
            </Link>
          </div>
        </div>

        {/* Footer Drawer avec Déconnexion */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold transition-all"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileSidebarDrawer;
