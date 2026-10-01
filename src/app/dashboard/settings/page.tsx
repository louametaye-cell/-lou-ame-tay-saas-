'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Store, 
  Clock, 
  QrCode, 
  CreditCard, 
  Bell, 
  AlertTriangle, 
  Save, 
  Upload, 
  Plus, 
  Trash2, 
  Share2, 
  Printer, 
  CheckCircle2, 
  Volume2, 
  MessageCircle, 
  Download, 
  Eye, 
  RefreshCw,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Globe,
  DollarSign,
  KeyRound,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

type TabKey = 'identity' | 'hours' | 'zones' | 'cashiers' | 'payment' | 'notifications' | 'danger';

export default function DashboardSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('identity');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [restaurantId, setRestaurantId] = useState('');
  const [restaurantSubdomain, setRestaurantSubdomain] = useState('');

  // 1. Identité
  const [identity, setIdentity] = useState({
    id: '',
    name: '',
    subdomain: '',
    address: '',
    phone: '',
    email: '',
    logoUrl: '',
    bannerUrl: '',
  });

  // 2. Horaires
  const [openingHours, setOpeningHours] = useState<Record<string, { isOpen: boolean; open: string; close: string }>>({
    monday: { isOpen: true, open: '11:00', close: '23:00' },
    tuesday: { isOpen: true, open: '11:00', close: '23:00' },
    wednesday: { isOpen: true, open: '11:00', close: '23:00' },
    thursday: { isOpen: true, open: '11:00', close: '23:00' },
    friday: { isOpen: true, open: '11:00', close: '23:30' },
    saturday: { isOpen: true, open: '11:00', close: '00:00' },
    sunday: { isOpen: true, open: '12:00', close: '23:00' },
  });
  const [exceptionalClosure, setExceptionalClosure] = useState({
    isClosed: false,
    date: '',
    reason: '',
  });

  // 3. Zones & Tables
  const [zones, setZones] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('all');
  const [newZoneName, setNewZoneName] = useState('');
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableLabel, setNewTableLabel] = useState('');
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editingTableLabel, setEditingTableLabel] = useState('');
  const [qrModalTable, setQrModalTable] = useState<any | null>(null);

  // 4. Caissiers
  const [cashiers, setCashiers] = useState<any[]>([]);
  const [isAddingCashier, setIsAddingCashier] = useState(false);
  const [newCashierName, setNewCashierName] = useState('');
  const [newCashierPhone, setNewCashierPhone] = useState('');
  const [newCashierShift, setNewCashierShift] = useState('MORNING');
  const [newCashierPin, setNewCashierPin] = useState('');

  // 5. Paiement & Devise
  const [payment, setPayment] = useState({
    currency: 'FCFA',
    methods: {
      cash: true,
      wave: true,
      orangeMoney: true,
      card: false,
    },
    merchants: {
      waveMerchantId: '',
      omMerchantNumber: '',
    },
  });

  // 6. Notifications
  const [notifications, setNotifications] = useState({
    kdsSoundEnabled: true,
    kdsSoundType: 'carillon',
    whatsappNotifications: false,
    whatsappAlertNumber: '',
  });

  // 7. Zone de Danger
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Charger les paramètres depuis l'API
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const storedId = localStorage.getItem('current_restaurant_id') || '';
      const storedSub = localStorage.getItem('current_restaurant_subdomain') || '';
      const effectiveId = storedId || storedSub || 'anima-pizzeria';
      setRestaurantId(effectiveId);
      setRestaurantSubdomain(storedSub);

      const res = await fetch(`/api/tenant/settings?restaurantId=${effectiveId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setIdentity(data.settings.identity);
          if (data.settings.openingHours) setOpeningHours(data.settings.openingHours);
          if (data.settings.exceptionalClosure) setExceptionalClosure(data.settings.exceptionalClosure);
          if (data.settings.payment) setPayment(data.settings.payment);
          if (data.settings.notifications) setNotifications(data.settings.notifications);
        }
      }

      // Charger les zones & tables
      const zonesRes = await fetch(`/api/tenant/zones?restaurantId=${effectiveId}`);
      if (zonesRes.ok) {
        const zData = await zonesRes.json();
        setZones(zData.zones || []);
      }

      const tablesRes = await fetch(`/api/tenant/tables?restaurantId=${effectiveId}`);
      if (tablesRes.ok) {
        const tData = await tablesRes.json();
        setTables(tData.tables || []);
      }

      // Charger les caissiers
      const cashiersRes = await fetch(`/api/tenant/cashiers?restaurantId=${effectiveId}`);
      if (cashiersRes.ok) {
        const cData = await cashiersRes.json();
        setCashiers(cData.cashiers || []);
      }
    } catch (err) {
      console.error('Erreur chargement paramètres:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Paramètres — Espace Gérant Lou Ame Tay?';
    fetchSettings();
  }, []);

  // Sauvegarder les paramètres principaux
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const res = await fetch('/api/tenant/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          identity,
          openingHours,
          exceptionalClosure,
          payment,
          notifications,
        }),
      });

      if (res.ok) {
        toast.success('Paramètres enregistrés avec succès !');
        if (identity.name) localStorage.setItem('current_restaurant_name', identity.name);
        if (identity.logoUrl) localStorage.setItem('current_restaurant_logo', identity.logoUrl);
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    } catch (err) {
      toast.error('Erreur de connexion');
    } finally {
      setIsSaving(false);
    }
  };

  // Upload d'image (Logo ou Bannière)
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'bannerUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxBytes = field === 'logoUrl' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`Fichier trop lourd. Maximum autorisé : ${field === 'logoUrl' ? '2 Mo' : '5 Mo'}`);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', field === 'logoUrl' ? 'louametay/logos' : 'louametay/banners');

      toast.loading('Upload de l\'image en cours...');
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      toast.dismiss();
      if (res.ok) {
        const data = await res.json();
        const uploadedUrl = data.image?.url || data.image?.secure_url || data.url;
        setIdentity((prev) => ({ ...prev, [field]: uploadedUrl }));
        toast.success('Image mise à jour avec succès !');
      } else {
        toast.error('Erreur lors de l\'upload');
      }
    } catch (err) {
      toast.dismiss();
      toast.error('Erreur réseau lors de l\'upload');
    }
  };

  // Gestion des Zones & Tables
  const handleCreateZone = async () => {
    if (!newZoneName.trim()) return;
    try {
      const res = await fetch('/api/tenant/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          name: newZoneName.trim(),
          type: 'TABLES',
        }),
      });
      if (res.ok) {
        toast.success(`Zone "${newZoneName}" créée !`);
        setNewZoneName('');
        setIsAddingZone(false);
        fetchSettings();
      } else {
        toast.error('Erreur lors de la création de la zone');
      }
    } catch {
      toast.error('Erreur réseau');
    }
  };

  const handleAddTable = async () => {
    const num = parseInt(newTableNumber, 10);
    if (isNaN(num) || num <= 0) {
      toast.error('Numéro de table invalide');
      return;
    }

    try {
      const res = await fetch('/api/tenant/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          tableNumber: num,
          label: newTableLabel.trim() || undefined,
          zoneId: selectedZoneId === 'all' ? undefined : selectedZoneId,
        }),
      });

      if (res.ok) {
        toast.success(`Table ${num} ajoutée avec succès !`);
        setNewTableNumber('');
        setNewTableLabel('');
        fetchSettings();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erreur lors de l\'ajout de la table');
      }
    } catch {
      toast.error('Erreur réseau');
    }
  };

  const handleRenameTable = async (tableId: string) => {
    try {
      const res = await fetch(`/api/tenant/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          label: editingTableLabel.trim(),
        }),
      });

      if (res.ok) {
        toast.success('Table renommée avec succès !');
        setEditingTableId(null);
        fetchSettings();
      } else {
        toast.error('Erreur lors de la modification');
      }
    } catch {
      toast.error('Erreur réseau');
    }
  };

  const handleDeleteTable = async (tableId: string, tableNum: number) => {
    if (!window.confirm(`Supprimer définitivement la Table ${tableNum} ?`)) return;
    try {
      const res = await fetch(`/api/tenant/tables/${tableId}?restaurantId=${restaurantId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(`Table ${tableNum} supprimée`);
        fetchSettings();
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur réseau');
    }
  };

  // Caissiers
  const generateRandomPin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setNewCashierPin(pin);
  };

  const handleCreateCashier = async () => {
    if (!newCashierName.trim() || !newCashierPin.trim()) {
      toast.error('Le nom et le code PIN à 4 chiffres sont obligatoires');
      return;
    }
    if (newCashierPin.length !== 4) {
      toast.error('Le code PIN doit comporter exactement 4 chiffres');
      return;
    }

    try {
      const res = await fetch('/api/tenant/cashiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          name: newCashierName.trim(),
          phone: newCashierPhone.trim(),
          shift: newCashierShift,
          pinCode: newCashierPin.trim(),
        }),
      });

      if (res.ok) {
        toast.success(`Caissier "${newCashierName}" créé avec succès !`);
        setNewCashierName('');
        setNewCashierPhone('');
        setNewCashierPin('');
        setIsAddingCashier(false);
        fetchSettings();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erreur lors de la création');
      }
    } catch {
      toast.error('Erreur réseau');
    }
  };

  const handleSendPinWhatsApp = (cashier: any) => {
    if (!cashier.phone) {
      toast.error('Numéro de téléphone non renseigné pour ce caissier');
      return;
    }
    const cleanPhone = cashier.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Bonjour ${cashier.name},\nVoici vos identifiants pour le Poste Caisse de ${identity.name || 'Lou Ame Tay ?'} :\n` +
      `🔐 Code PIN : ${cashier.pinCode || '****'}\n` +
      `🔗 Accès caisse : https://www.louametay.com/cashier?restaurantId=${restaurantSubdomain || restaurantId}\n` +
      `Bon service !`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  // Zone de Danger : Reset & Export
  const handleExportData = async () => {
    try {
      toast.loading('Génération de l\'export RGPD...');
      const res = await fetch('/api/tenant/settings/danger-zone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'EXPORT_DATA', restaurantId }),
      });
      toast.dismiss();

      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename || `export-louametay-${restaurantId}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Données exportées avec succès !');
      } else {
        toast.error('Erreur lors de l\'export');
      }
    } catch {
      toast.dismiss();
      toast.error('Erreur de téléchargement');
    }
  };

  const handleResetMenu = async () => {
    if (resetConfirmText !== 'REINITIALISER') {
      toast.error('Veuillez taper précisément "REINITIALISER" pour confirmer');
      return;
    }
    try {
      setIsResetting(true);
      const res = await fetch('/api/tenant/settings/danger-zone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESET_MENU',
          restaurantId,
          confirmationText: resetConfirmText,
        }),
      });

      if (res.ok) {
        toast.success('Le menu a été réinitialisé !');
        setIsResetModalOpen(false);
        setResetConfirmText('');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erreur lors de la réinitialisation');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setIsResetting(false);
    }
  };

  // Test dynamique si actuellement ouvert
  const isCurrentlyOpen = () => {
    if (exceptionalClosure.isClosed) return false;
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const config = openingHours[currentDay];
    if (!config || !config.isOpen) return false;

    const [openH, openM] = config.open.split(':').map(Number);
    const [closeH, closeM] = config.close.split(':').map(Number);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = openH * 60 + openM;
    let closeMinutes = closeH * 60 + closeM;
    if (closeMinutes < openMinutes) closeMinutes += 24 * 60; // Dépasse minuit

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  };

  const dayLabels: Record<string, string> = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-amber-500 selection:text-white pb-24">
      {/* 1. Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="min-h-[44px] min-w-[44px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl flex items-center justify-center transition-all border border-slate-200 active:scale-95 shadow-2xs cursor-pointer"
              title="Retour au Tableau de Bord"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>⚙️ Paramètres du Restaurant</span>
                <span className="text-xs text-amber-800 font-bold bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200 hidden sm:inline">
                  {identity.name || 'Lou Ame Tay ?'}
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Gérez en totale autonomie l'identité, les horaires, les tables et les moyens de paiement.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="min-h-[46px] px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
            </button>
          </div>
        </div>

        {/* Barre d'onglets ergonomique */}
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar border-t border-slate-100 flex gap-2 pt-2 pb-2">
          {[
            { key: 'identity', label: 'Identité', icon: Store },
            { key: 'hours', label: 'Horaires & Jours', icon: Clock },
            { key: 'zones', label: 'Zones & Tables', icon: QrCode },
            { key: 'cashiers', label: 'Caissiers & PIN', icon: KeyRound },
            { key: 'payment', label: 'Paiement & Devise', icon: CreditCard },
            { key: 'notifications', label: 'Notifications', icon: Bell },
            { key: 'danger', label: 'Zone de Danger', icon: AlertTriangle, danger: true },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? tab.danger
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-emerald-600 text-white shadow-sm'
                    : tab.danger
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* 2. Contenu des onglets */}
      <main className="max-w-7xl mx-auto p-4 sm:p-8">
        
        {/* ================= ONGLET 1 : IDENTITÉ ================= */}
        {activeTab === 'identity' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" />
                <span>Coordonnées & Vitrine de l'Établissement</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom du Restaurant</label>
                  <input
                    type="text"
                    value={identity.name}
                    onChange={(e) => setIdentity({ ...identity, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-hidden transition-all"
                    placeholder="Ex: Anima Pizzeria"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sous-domaine Web</label>
                  <input
                    type="text"
                    disabled
                    value={identity.subdomain ? `${identity.subdomain}.louametay.com` : ''}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-mono text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Adresse Physique</label>
                  <input
                    type="text"
                    value={identity.address}
                    onChange={(e) => setIdentity({ ...identity, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-emerald-500 outline-hidden transition-all"
                    placeholder="Ex: Route des Almadies, Dakar"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Numéro de Téléphone</label>
                  <input
                    type="text"
                    value={identity.phone}
                    onChange={(e) => setIdentity({ ...identity, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-emerald-500 outline-hidden transition-all"
                    placeholder="Ex: +221 77 000 00 00"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Adresse Email de Contact</label>
                  <input
                    type="email"
                    value={identity.email}
                    onChange={(e) => setIdentity({ ...identity, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-emerald-500 outline-hidden transition-all"
                    placeholder="contact@restaurant.sn"
                  />
                </div>
              </div>

              {/* Uploads Logo & Bannière */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {/* Logo (Max 2 Mo) */}
                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-800">
                    Logo Officiel (Max 2 Mo • JPG, PNG, SVG)
                  </label>
                  <div className="flex items-center gap-4">
                    <img
                      src={identity.logoUrl || '/logo.png'}
                      alt="Logo"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 bg-slate-50 shadow-xs"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                    />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        className="hidden"
                        onChange={(e) => handleUploadImage(e, 'logoUrl')}
                      />
                      <span className="min-h-[44px] px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs inline-flex items-center gap-2 border border-slate-300 transition-all">
                        <Upload className="w-4 h-4 text-emerald-600" />
                        <span>Changer le logo</span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* Bannière (Max 5 Mo) */}
                <div className="space-y-3">
                  <label className="block text-xs font-black text-slate-800">
                    Bannière de Couverture (Max 5 Mo)
                  </label>
                  <div className="relative h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden flex items-center justify-center group">
                    {identity.bannerUrl ? (
                      <img src={identity.bannerUrl} alt="Bannière" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Aucune bannière configurée</span>
                    )}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white font-bold text-xs gap-2">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => handleUploadImage(e, 'bannerUrl')}
                      />
                      <Upload className="w-4 h-4" />
                      <span>Modifier la bannière</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= ONGLET 2 : HORAIRES ================= */}
        {activeTab === 'hours' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Indicateur temps réel statut ouverture */}
            <div className={`p-4 rounded-3xl border-2 flex items-center justify-between gap-4 ${
              isCurrentlyOpen()
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}>
              <div className="flex items-center gap-3">
                <span className={`w-3.5 h-3.5 rounded-full ${isCurrentlyOpen() ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <div>
                  <h3 className="text-sm font-black">
                    {isCurrentlyOpen() ? '🟢 Votre établissement est actuellement OUVERT' : '🔴 Votre établissement est actuellement FERMÉ'}
                  </h3>
                  <p className="text-xs opacity-80">
                    {isCurrentlyOpen()
                      ? 'Les clients peuvent passer commande et consulter le menu complet.'
                      : 'Les clients verront le badge "Fermé actuellement" sur leur menu digital.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tableau des 7 jours */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span>Plages Horaires par Jour</span>
              </h2>

              <div className="space-y-3">
                {Object.entries(openingHours).map(([dayKey, dayConfig]) => (
                  <div key={dayKey} className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex-wrap">
                    <div className="w-28 font-black text-sm text-slate-900">
                      {dayLabels[dayKey] || dayKey}
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dayConfig.isOpen}
                        onChange={(e) => {
                          setOpeningHours({
                            ...openingHours,
                            [dayKey]: { ...dayConfig, isOpen: e.target.checked },
                          });
                        }}
                        className="w-4 h-4 accent-emerald-600 rounded"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        {dayConfig.isOpen ? 'Ouvert' : 'Fermé'}
                      </span>
                    </label>

                    {dayConfig.isOpen ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <span>De</span>
                        <input
                          type="time"
                          value={dayConfig.open}
                          onChange={(e) => {
                            setOpeningHours({
                              ...openingHours,
                              [dayKey]: { ...dayConfig, open: e.target.value },
                            });
                          }}
                          className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                        />
                        <span>à</span>
                        <input
                          type="time"
                          value={dayConfig.close}
                          onChange={(e) => {
                            setOpeningHours({
                              ...openingHours,
                              [dayKey]: { ...dayConfig, close: e.target.value },
                            });
                          }}
                          className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Journée de fermeture</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Fermeture exceptionnelle */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-sm font-black text-slate-900">Fermeture Exceptionnelle (Jours fériés, travaux, congés)</h3>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exceptionalClosure.isClosed}
                      onChange={(e) => setExceptionalClosure({ ...exceptionalClosure, isClosed: e.target.checked })}
                      className="w-4 h-4 accent-amber-600 rounded"
                    />
                    <span className="text-xs font-bold text-amber-950">Fermé exceptionnellement</span>
                  </label>

                  {exceptionalClosure.isClosed && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="date"
                        value={exceptionalClosure.date}
                        onChange={(e) => setExceptionalClosure({ ...exceptionalClosure, date: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Motif (ex: Travaux d'extension)"
                        value={exceptionalClosure.reason}
                        onChange={(e) => setExceptionalClosure({ ...exceptionalClosure, reason: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= ONGLET 3 : ZONES & TABLES ================= */}
        {activeTab === 'zones' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header Zones */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-emerald-600" />
                    <span>Configuration des Espaces (Salle, Terrasse, Rooftop, Bar)</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Créez vos zones, ajoutez vos tables et générez les QR codes d'impression.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingZone(true)}
                  className="min-h-[44px] px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouvelle Zone</span>
                </button>
              </div>

              {/* Formulaire ajout zone */}
              {isAddingZone && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Nom de la zone (ex: Terrasse Piscine)"
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold"
                  />
                  <button
                    onClick={handleCreateZone}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 cursor-pointer"
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => setIsAddingZone(false)}
                    className="px-3 py-2 text-slate-500 text-xs font-bold hover:text-slate-800 cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              )}

              {/* Filtre des zones */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedZoneId('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedZoneId === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Toutes les tables ({tables.length})
                </button>
                {zones.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setSelectedZoneId(z.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      selectedZoneId === z.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {z.name}
                  </button>
                ))}
              </div>

              {/* Formulaire rapide ajout table */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Numéro :</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ex: 15"
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    className="w-20 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-black"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                  <span className="text-xs font-bold text-slate-700">Nom/VIP :</span>
                  <input
                    type="text"
                    placeholder="Ex: Table VIP 1 (facultatif)"
                    value={newTableLabel}
                    onChange={(e) => setNewTableLabel(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>
                <button
                  onClick={handleAddTable}
                  className="min-h-[42px] px-4 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter Table</span>
                </button>
              </div>

              {/* Grille des Tables */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
                {tables
                  .filter((t) => selectedZoneId === 'all' || t.zoneId === selectedZoneId)
                  .map((t) => (
                    <div
                      key={t.id}
                      className="bg-white border-2 border-slate-200 hover:border-emerald-400 rounded-2xl p-4 shadow-xs space-y-3 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                            N° {t.tableNumber}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            t.status === 'OCCUPIED' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {t.status === 'OCCUPIED' ? 'Occupée' : 'Libre'}
                          </span>
                        </div>

                        {editingTableId === t.id ? (
                          <div className="mt-2 space-y-1">
                            <input
                              type="text"
                              value={editingTableLabel}
                              onChange={(e) => setEditingTableLabel(e.target.value)}
                              className="w-full px-2 py-1 border border-emerald-400 rounded-lg text-xs font-bold"
                              placeholder="Nom personnalisé"
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleRenameTable(t.id)}
                                className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold"
                              >
                                OK
                              </button>
                              <button
                                onClick={() => setEditingTableId(null)}
                                className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center justify-between">
                            <h4 className="text-sm font-black text-slate-900 truncate">
                              {t.label || `Table ${t.tableNumber}`}
                            </h4>
                            <button
                              onClick={() => {
                                setEditingTableId(t.id);
                                setEditingTableLabel(t.label || '');
                              }}
                              className="text-slate-400 hover:text-slate-700 p-1"
                              title="Renommer la table"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Actions Table */}
                      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setQrModalTable(t)}
                          className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR Code</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTable(t.id, t.tableNumber)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Supprimer la table"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Modal Aperçu QR Code Table */}
            {qrModalTable && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="font-black text-slate-900 text-sm">
                      QR Code — Table {qrModalTable.tableNumber} {qrModalTable.label ? `(${qrModalTable.label})` : ''}
                    </span>
                    <button onClick={() => setQrModalTable(null)} className="text-slate-400 hover:text-slate-700 p-1">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-2xl flex justify-center shadow-xs">
                    <QRCodeSVG
                      value={`https://www.louametay.com/r/${restaurantSubdomain || restaurantId}?table=${qrModalTable.tableNumber}`}
                      size={200}
                      level="H"
                      includeMargin
                    />
                  </div>

                  <p className="text-xs text-slate-500 font-medium">
                    Scannez pour ouvrir le menu digital rattaché directement à cette table.
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimer le chevalet</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= ONGLET 4 : CAISSIERS & PIN ================= */}
        {activeTab === 'cashiers' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-emerald-600" />
                    <span>Gestion des Caissiers &amp; Sécurité PIN</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Attribuez des codes PIN uniques à 4 chiffres avec contrôle strict d'accès inter-restaurants.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCashier(true);
                    generateRandomPin();
                  }}
                  className="min-h-[44px] px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau Caissier</span>
                </button>
              </div>

              {/* Formulaire ajout caissier */}
              {isAddingCashier && (
                <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black uppercase text-emerald-950">Création d'un Caissier</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Nom complet</label>
                      <input
                        type="text"
                        placeholder="Ex: Awa Ndiaye"
                        value={newCashierName}
                        onChange={(e) => setNewCashierName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Téléphone WhatsApp</label>
                      <input
                        type="text"
                        placeholder="+221 77 000 00 00"
                        value={newCashierPhone}
                        onChange={(e) => setNewCashierPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Shift de travail</label>
                      <select
                        value={newCashierShift}
                        onChange={(e) => setNewCashierShift(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold"
                      >
                        <option value="MORNING">Matin (08h - 16h)</option>
                        <option value="EVENING">Soir (16h - 00h)</option>
                        <option value="NIGHT">Nuit (00h - 08h)</option>
                        <option value="FULL_DAY">Journée complète</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Code PIN (4 chiffres)</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          maxLength={4}
                          value={newCashierPin}
                          onChange={(e) => setNewCashierPin(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-mono font-black tracking-widest text-center"
                        />
                        <button
                          type="button"
                          onClick={generateRandomPin}
                          className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs"
                          title="Générer aléatoirement"
                        >
                          🎲
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsAddingCashier(false)}
                      className="px-4 py-2 text-slate-600 font-bold text-xs"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleCreateCashier}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Créer le caissier
                    </button>
                  </div>
                </div>
              )}

              {/* Liste des caissiers */}
              <div className="space-y-3">
                {cashiers.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl flex items-center justify-between gap-4 flex-wrap shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">{c.name}</h4>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                            Shift : {c.shift}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>📞 {c.phone || 'Pas de numéro'}</span>
                          <span>•</span>
                          <span>Code PIN : <strong className="font-mono text-emerald-700">{c.pinCode || '••••'}</strong></span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSendPinWhatsApp(c)}
                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-emerald-200 cursor-pointer"
                        title="Renvoyer le code PIN par WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Renvoyer PIN (WhatsApp)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= ONGLET 5 : PAIEMENT & DEVISE ================= */}
        {activeTab === 'payment' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Paramètres de Règlement &amp; Devise</span>
              </h2>

              {/* Devise Principale */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-800">Devise Principale d'Affichage</label>
                <div className="grid grid-cols-3 gap-3">
                  {['FCFA', 'EUR', 'USD'].map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setPayment({ ...payment, currency: curr })}
                      className={`p-3 rounded-2xl border-2 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        payment.currency === curr
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>{curr}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Méthodes de Paiement */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="block text-xs font-black text-slate-800">
                  Modes de Paiement Acceptés
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'cash', label: '💵 Espèces (Cash)', color: 'border-emerald-200 bg-emerald-50/50' },
                    { key: 'wave', label: '🌊 Wave Mobile Money', color: 'border-blue-200 bg-blue-50/50' },
                    { key: 'orangeMoney', label: '🟠 Orange Money', color: 'border-orange-200 bg-orange-50/50' },
                    { key: 'card', label: '💳 Carte Bancaire / TPE', color: 'border-slate-200 bg-slate-50/50' },
                  ].map((m) => (
                    <label
                      key={m.key}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${m.color}`}
                    >
                      <span className="text-xs font-black text-slate-900">{m.label}</span>
                      <input
                        type="checkbox"
                        checked={(payment.methods as any)[m.key]}
                        onChange={(e) => {
                          setPayment({
                            ...payment,
                            methods: { ...payment.methods, [m.key]: e.target.checked },
                          });
                        }}
                        className="w-4 h-4 accent-emerald-600 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Numéros Marchands pour Affichage */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-800 uppercase">
                  Identifiants Marchands (Affichage aux Clients &amp; Caissiers)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Wave Merchant ID / Numéro</label>
                    <input
                      type="text"
                      placeholder="Ex: 77 458 74 74 ou WAVE-XXXX"
                      value={payment.merchants.waveMerchantId}
                      onChange={(e) => {
                        setPayment({
                          ...payment,
                          merchants: { ...payment.merchants, waveMerchantId: e.target.value },
                        });
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Orange Money Numéro Marchand</label>
                    <input
                      type="text"
                      placeholder="Ex: 78 000 00 00 ou CODE-OM"
                      value={payment.merchants.omMerchantNumber}
                      onChange={(e) => {
                        setPayment({
                          ...payment,
                          merchants: { ...payment.merchants, omMerchantNumber: e.target.value },
                        });
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= ONGLET 6 : NOTIFICATIONS ================= */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600" />
                <span>Alertes Sonores KDS &amp; Notifications</span>
              </h2>

              {/* Alertes Sonores KDS */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Alertes Sonores Écran Cuisine (KDS)</h3>
                    <p className="text-xs text-slate-500">Jouer un carillon audio à chaque nouvelle commande reçue.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.kdsSoundEnabled}
                    onChange={(e) => setNotifications({ ...notifications, kdsSoundEnabled: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 rounded"
                  />
                </div>

                {notifications.kdsSoundEnabled && (
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-bold text-slate-700">Type de sonorité</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: 'carillon', label: '🔔 Carillon Doux' },
                        { key: 'dingdong', label: '🛎️ Ding-Dong' },
                        { key: 'alert', label: '🚨 Alerte Flash' },
                      ].map((snd) => (
                        <button
                          key={snd.key}
                          type="button"
                          onClick={() => setNotifications({ ...notifications, kdsSoundType: snd.key })}
                          className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                            notifications.kdsSoundType === snd.key
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-black'
                              : 'border-slate-200 bg-white text-slate-600'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{snd.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications WhatsApp */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Notifications WhatsApp B2B (V3)</h3>
                    <p className="text-xs text-slate-500">Recevoir le récapitulatif des clôtures de caisse sur WhatsApp.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.whatsappNotifications}
                    onChange={(e) => setNotifications({ ...notifications, whatsappNotifications: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 rounded"
                  />
                </div>

                {notifications.whatsappNotifications && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Numéro récepteur</label>
                    <input
                      type="text"
                      placeholder="+221 77 000 00 00"
                      value={notifications.whatsappAlertNumber}
                      onChange={(e) => setNotifications({ ...notifications, whatsappAlertNumber: e.target.value })}
                      className="w-full max-w-sm px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= ONGLET 7 : ZONE DE DANGER ================= */}
        {activeTab === 'danger' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-rose-50/50 border-2 border-rose-200 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-rose-950">Zone de Danger &amp; Conformité RGPD</h2>
                  <p className="text-xs text-rose-800">
                    Ces actions sont irréversibles. Veuillez procéder avec précaution.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* 1. Export RGPD */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Exportation Intégrale des Données (RGPD)</h3>
                    <p className="text-xs text-slate-500">Téléchargez une archive JSON complète de vos données (menu, tables, caissiers, branding).</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="min-h-[44px] px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-300 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Exporter (JSON)</span>
                  </button>
                </div>

                {/* 2. Réinitialisation Menu */}
                <div className="p-4 bg-white border border-rose-200 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-sm font-black text-rose-950">Réinitialiser l'intégralité du menu</h3>
                    <p className="text-xs text-rose-700">Supprime tous les plats et catégories pour repartir d'une carte vierge.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(true)}
                    className="min-h-[44px] px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Réinitialiser mon menu</span>
                  </button>
                </div>

                {/* 3. Suppression de compte */}
                <div className="p-4 bg-white border border-rose-200 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-sm font-black text-rose-950">Supprimer mon compte établissement</h3>
                    <p className="text-xs text-rose-700">Fermeture définitive et résiliation de l'abonnement Lou Ame Tay.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const msg = `Demande de résiliation pour ${identity.name} (${restaurantId})`;
                      window.open(`https://wa.me/221774587474?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="min-h-[44px] px-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Contacter DAW pour résiliation</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal de confirmation Réinitialisation Menu */}
            {isResetModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-rose-200">
                  <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl w-fit">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-rose-950">Confirmation Requise</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Cette action va supprimer TOUS les plats et catégories de <strong>{identity.name}</strong>. Pour confirmer, tapez précisément le mot <strong className="text-rose-600 font-mono">REINITIALISER</strong> ci-dessous :
                    </p>
                  </div>

                  <input
                    type="text"
                    value={resetConfirmText}
                    onChange={(e) => setResetConfirmText(e.target.value)}
                    placeholder="REINITIALISER"
                    className="w-full px-3.5 py-2.5 bg-rose-50 border-2 border-rose-300 rounded-xl text-sm font-mono font-black text-rose-950"
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetModalOpen(false);
                        setResetConfirmText('');
                      }}
                      className="px-4 py-2 text-slate-600 font-bold text-xs"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      disabled={resetConfirmText !== 'REINITIALISER' || isResetting}
                      onClick={handleResetMenu}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow-md shadow-rose-600/20"
                    >
                      {isResetting ? 'Suppression...' : 'Confirmer la réinitialisation'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
