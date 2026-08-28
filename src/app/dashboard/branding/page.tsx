'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Sparkles, 
  Save, 
  ArrowLeft, 
  CheckCircle2, 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Instagram, 
  Facebook, 
  MessageCircle, 
  Smartphone, 
  Eye, 
  RefreshCw,
  ExternalLink,
  Upload,
  Layers,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { RestaurantBranding } from '@/types';

// Palettes prédéfinies conçues par MDA Arts Work
const COLOR_PRESETS = [
  {
    name: 'Teranga Soleil (Défaut)',
    primary: '#FF6B00',
    secondary: '#00A86B',
    bg: '#FFFDF9',
    text: '#0F172A',
  },
  {
    name: 'Saly Beach & Palme',
    primary: '#00A86B',
    secondary: '#F59E0B',
    bg: '#F0FDF4',
    text: '#064E3B',
  },
  {
    name: 'Bistrot Chic Bordeaux',
    primary: '#9F1239',
    secondary: '#E11D48',
    bg: '#FFF1F2',
    text: '#4C0519',
  },
  {
    name: 'Dakar Nuit & Électrique',
    primary: '#0284C7',
    secondary: '#38BDF8',
    bg: '#0F172A',
    text: '#F8FAFC',
  },
  {
    name: 'Luxe Doré & Sombre',
    primary: '#D97706',
    secondary: '#FBBF24',
    bg: '#18181B',
    text: '#FAFAFA',
  },
  {
    name: 'Street Food & Tacos',
    primary: '#DC2626',
    secondary: '#EA580C',
    bg: '#FEF2F2',
    text: '#450A0A',
  },
];

// Polices Google Fonts sélectionnées pour la restauration
const GOOGLE_FONTS_TITLES = [
  { id: 'Playfair Display', label: 'Playfair Display (Élégant, Gastronomie, Pizzeria)' },
  { id: 'Poppins', label: 'Poppins (Moderne, Épuré, Tech & Fast-Food)' },
  { id: 'Montserrat', label: 'Montserrat (Chic, Contemporain, Urbain)' },
  { id: 'Oswald', label: 'Oswald (Impactant, Bold, Grillades & Dibi)' },
  { id: 'Cinzel', label: 'Cinzel (Luxe Impérial, Hôtels & Resorts)' },
  { id: 'Merriweather', label: 'Merriweather (Chaleureux, Traditionnel)' },
  { id: 'Syne', label: 'Syne (Créatif, Tendance, Street Food)' },
  { id: 'Great Vibes', label: 'Great Vibes (Calligraphie, Pâtisseries, Salons)' },
];

const GOOGLE_FONTS_BODY = [
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Ultra-lisible sur mobile)' },
  { id: 'Roboto', label: 'Roboto (Standard International fluide)' },
  { id: 'Lato', label: 'Lato (Doux et équilibré)' },
  { id: 'Inter', label: 'Inter (Minimaliste et net)' },
  { id: 'Open Sans', label: 'Open Sans (Neutre et clair)' },
];

// Bannières prédéfinies
const PRESET_BANNERS = [
  {
    label: 'Grillades & Braises',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Pizzas au Feu de Bois',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Café & Petit-Déjeuner',
    url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Resort & Piscine Lounge',
    url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function BrandStudioPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [restaurantName, setRestaurantName] = useState('MG Café Resto');
  const [subdomain, setSubdomain] = useState('mg-cafe-resto');
  const [restaurantId, setRestaurantId] = useState('');

  // Branding State
  const [branding, setBranding] = useState<RestaurantBranding>({
    primaryColor: '#FF6B00',
    secondaryColor: '#00A86B',
    backgroundColor: '#FFFDF9',
    textColor: '#0F172A',
    fontTitle: 'Playfair Display',
    fontBody: 'Plus Jakarta Sans',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    phone: '+221 77 458 74 74',
    whatsapp: '+221 77 458 74 74',
    address: 'Plateau, Dakar, Sénégal',
    googleMapsUrl: 'https://maps.google.com/?q=Dakar+Senegal',
    website: 'https://louametay.sn',
    instagram: 'https://instagram.com/louametay',
    facebook: 'https://facebook.com/louametay',
    tiktok: 'https://tiktok.com/@louametay',
    googleReviewUrl: 'https://g.page/r/louametay/review',
    tagline: 'Scannez • Commandez • Savourez !',
  });

  // Preview tab switcher in mockup
  const [previewTab, setPreviewTab] = useState<'MENU' | 'FOOTER' | 'REVIEW'>('MENU');

  useEffect(() => {
    const storedId = localStorage.getItem('current_restaurant_id') || '';
    const storedSub = localStorage.getItem('current_restaurant_subdomain') || '';
    const storedName = localStorage.getItem('current_restaurant_name') || '';

    if (storedId) setRestaurantId(storedId);
    if (storedSub) setSubdomain(storedSub);
    if (storedName) setRestaurantName(storedName);

    // Fetch existing branding
    fetch(`/api/tenant/branding?restaurantId=${storedId}&subdomain=${storedSub}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.branding) {
          setBranding(data.branding);
        }
        if (data.name) setRestaurantName(data.name);
        if (data.subdomain) setSubdomain(data.subdomain);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Save branding changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/tenant/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          subdomain,
          branding,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('🎨 Identité graphique enregistrée avec succès !', {
          description: 'Vos clients verront instantanément ce nouveau design sur leur menu QR Code.',
        });
      } else {
        toast.error(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (e) {
      toast.error('Erreur réseau');
    } finally {
      setIsSaving(false);
    }
  };

  // Upload logo or banner as data URL (instant client-side)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'bannerUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (Maximum 4 Mo)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setBranding((prev) => ({ ...prev, [field]: result }));
      toast.success(field === 'logoUrl' ? 'Logo chargé avec succès' : 'Bannière chargée avec succès');
    };
    reader.readAsDataURL(file);
  };

  const applyPalette = (p: typeof COLOR_PRESETS[0]) => {
    setBranding((prev) => ({
      ...prev,
      primaryColor: p.primary,
      secondaryColor: p.secondary,
      backgroundColor: p.bg,
      textColor: p.text,
    }));
    toast.success(`Palette "${p.name}" appliquée !`);
  };

  const selectedTitleFont = branding.fontTitle || 'Playfair Display';
  const selectedBodyFont = branding.fontBody || 'Plus Jakarta Sans';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-24">
      {/* Dynamic Font Loading for Studio Live Preview */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(selectedTitleFont)}:wght@400;600;700;800;900&family=${encodeURIComponent(selectedBodyFont)}:wght@400;500;600;700&display=swap`} 
        rel="stylesheet" 
      />

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Retour au Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Palette className="w-5 h-5 text-orange-600" />
                <span>Studio de Marque & Personnalisation</span>
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Alignez l'identité visuelle de <span className="font-bold text-slate-800">{restaurantName}</span> sur votre menu QR Code
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/r/${subdomain}/table-1`}
              target="_blank"
              className="hidden md:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-2xl transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>Voir le Menu Public</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-gradient-to-r from-[#FF6B00] via-orange-600 to-[#00A86B] hover:opacity-95 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-lg shadow-orange-600/20 active:scale-95 transition-all"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Grid : Left Form (7 cols) & Right Smartphone Mockup (5 cols) */}
      <main className="max-w-7xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN : SETTINGS CONTROLS (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SECTION 1 : PALETTES RAPIDES */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Palettes Prédéfinies (1 Clic)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Design Graphique MDA</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPalette(preset)}
                  className="p-3 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 rounded-2xl text-left transition-all group active:scale-95"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-4 h-4 rounded-full shadow-2xs border border-white" style={{ backgroundColor: preset.primary }} />
                    <span className="w-4 h-4 rounded-full shadow-2xs border border-white" style={{ backgroundColor: preset.secondary }} />
                    <span className="w-4 h-4 rounded-full shadow-2xs border border-white" style={{ backgroundColor: preset.bg }} />
                  </div>
                  <span className="text-xs font-bold text-slate-800 block truncate group-hover:text-orange-600">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 2 : SÉLECTEUR DE COULEURS PRÉCIS */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-orange-600" />
              <span>Couleurs Personnalisées (Code Hexadécimal)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Couleur Principale */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Couleur Principale (Boutons, titres majeurs)
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2">
                  <input
                    type="color"
                    value={branding.primaryColor || '#FF6B00'}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={branding.primaryColor || '#FF6B00'}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="w-full bg-transparent text-xs font-mono font-bold text-slate-800 outline-none uppercase"
                  />
                </div>
              </div>

              {/* Couleur Secondaire */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Couleur Secondaire (Accents, badges)
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2">
                  <input
                    type="color"
                    value={branding.secondaryColor || '#00A86B'}
                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={branding.secondaryColor || '#00A86B'}
                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                    className="w-full bg-transparent text-xs font-mono font-bold text-slate-800 outline-none uppercase"
                  />
                </div>
              </div>

              {/* Couleur de Fond */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Couleur d'Arrière-Plan du Menu
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2">
                  <input
                    type="color"
                    value={branding.backgroundColor || '#FFFDF9'}
                    onChange={(e) => setBranding({ ...branding, backgroundColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={branding.backgroundColor || '#FFFDF9'}
                    onChange={(e) => setBranding({ ...branding, backgroundColor: e.target.value })}
                    className="w-full bg-transparent text-xs font-mono font-bold text-slate-800 outline-none uppercase"
                  />
                </div>
              </div>

              {/* Couleur du Texte */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Couleur du Texte
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2">
                  <input
                    type="color"
                    value={branding.textColor || '#0F172A'}
                    onChange={(e) => setBranding({ ...branding, textColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={branding.textColor || '#0F172A'}
                    onChange={(e) => setBranding({ ...branding, textColor: e.target.value })}
                    className="w-full bg-transparent text-xs font-mono font-bold text-slate-800 outline-none uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3 : TYPOGRAPHIE GOOGLE FONTS */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Type className="w-4 h-4 text-purple-600" />
              <span>Typographies (Google Fonts)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Police Titres */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Police des Titres & Plats
                </label>
                <select
                  value={branding.fontTitle || 'Playfair Display'}
                  onChange={(e) => setBranding({ ...branding, fontTitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-orange-500"
                >
                  {GOOGLE_FONTS_TITLES.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1" style={{ fontFamily: selectedTitleFont }}>
                  Aperçu : "Les Délices de {restaurantName}"
                </p>
              </div>

              {/* Police Texte Courant */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Police du Texte & Descriptions
                </label>
                <select
                  value={branding.fontBody || 'Plus Jakarta Sans'}
                  onChange={(e) => setBranding({ ...branding, fontBody: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-orange-500"
                >
                  {GOOGLE_FONTS_BODY.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1" style={{ fontFamily: selectedBodyFont }}>
                  Aperçu : "Poulet fermier mariné aux épices du terroir."
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 4 : LOGO & BANNIÈRE */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>Logo & Bannière d'En-tête</span>
            </h3>

            <div className="space-y-4">
              {/* Logo Upload */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                  <span>Logo Officiel (PNG Transparent recommandé)</span>
                  <span className="text-[11px] text-slate-400 font-normal">Format carré 512x512</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 relative">
                    <img 
                      src={branding.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80'} 
                      alt="Logo" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={branding.logoUrl || ''}
                      onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                      placeholder="URL du logo ou importer un fichier..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none"
                    />
                    <label className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Importer un fichier PNG/JPG</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'logoUrl')} 
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Bannière Header */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                  <span>Bannière de Couverture (1200 x 400 recommandé)</span>
                  <span className="text-[11px] text-slate-400 font-normal">Affichée en haut du menu</span>
                </label>
                <div className="space-y-2">
                  <div className="w-full h-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                    <img 
                      src={branding.bannerUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80'} 
                      alt="Bannière" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <input
                    type="text"
                    value={branding.bannerUrl || ''}
                    onChange={(e) => setBranding({ ...branding, bannerUrl: e.target.value })}
                    placeholder="URL de l'image de bannière..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none"
                  />
                  
                  {/* Bannières prédéfinies rapides */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center">Suggestions :</span>
                    {PRESET_BANNERS.map((b) => (
                      <button
                        key={b.label}
                        type="button"
                        onClick={() => setBranding({ ...branding, bannerUrl: b.url })}
                        className="text-[11px] font-bold bg-slate-100 hover:bg-orange-50 hover:text-orange-600 border border-slate-200 px-2.5 py-1 rounded-lg transition-all"
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Slogan */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Slogan ou Phrase d'Accroche
                </label>
                <input
                  type="text"
                  value={branding.tagline || ''}
                  onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                  placeholder="Ex : Scannez • Commandez • Savourez !"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5 : AVIS GOOGLE MAPS ⭐⭐⭐⭐⭐ */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-600/10 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-900">
              <Star className="w-5 h-5 fill-amber-500 stroke-amber-600" />
              <h3 className="text-sm font-black">Lien Avis Google Maps (Booster les 5 Étoiles)</h3>
            </div>
            <p className="text-xs text-amber-950/80">
              Une bannière attractive et engageante s'affichera au bas du menu client pour inviter vos clients à laisser un avis 5 étoiles sur votre fiche Google Maps.
            </p>
            <div>
              <label className="text-xs font-bold text-amber-950 block mb-1.5">
                Lien direct d'avis Google Maps
              </label>
              <input
                type="text"
                value={branding.googleReviewUrl || ''}
                onChange={(e) => setBranding({ ...branding, googleReviewUrl: e.target.value })}
                placeholder="Ex : https://g.page/r/xxxx/review ou https://maps.app.goo.gl/xxxx"
                className="w-full bg-white border border-amber-300 rounded-2xl px-4 py-3 text-xs font-mono text-slate-900 outline-none shadow-inner"
              />
            </div>
          </div>

          {/* SECTION 6 : COORDONNÉES & RÉSEAUX SOCIAUX */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Coordonnées & Réseaux Sociaux</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Téléphone */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Téléphone Appel Direct</label>
                <input
                  type="text"
                  value={branding.phone || ''}
                  onChange={(e) => setBranding({ ...branding, phone: e.target.value })}
                  placeholder="+221 77 458 74 74"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Numéro WhatsApp</label>
                <input
                  type="text"
                  value={branding.whatsapp || ''}
                  onChange={(e) => setBranding({ ...branding, whatsapp: e.target.value })}
                  placeholder="+221 77 458 74 74"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none"
                />
              </div>

              {/* Adresse */}
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Adresse Physique</label>
                <input
                  type="text"
                  value={branding.address || ''}
                  onChange={(e) => setBranding({ ...branding, address: e.target.value })}
                  placeholder="Ex : HLM Route de Mbour, Thiès / Plateau, Dakar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none"
                />
              </div>

              {/* Lien Itinéraire Google Maps */}
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Lien Itinéraire Google Maps (Optionnel)</label>
                <input
                  type="text"
                  value={branding.googleMapsUrl || ''}
                  onChange={(e) => setBranding({ ...branding, googleMapsUrl: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono outline-none"
                />
              </div>

              {/* Site Web */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Site Web Officiel</label>
                <input
                  type="text"
                  value={branding.website || ''}
                  onChange={(e) => setBranding({ ...branding, website: e.target.value })}
                  placeholder="https://monresto.sn"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                />
              </div>

              {/* Instagram */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Profil Instagram</label>
                <input
                  type="text"
                  value={branding.instagram || ''}
                  onChange={(e) => setBranding({ ...branding, instagram: e.target.value })}
                  placeholder="https://instagram.com/monresto"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                />
              </div>

              {/* Facebook */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Page Facebook</label>
                <input
                  type="text"
                  value={branding.facebook || ''}
                  onChange={(e) => setBranding({ ...branding, facebook: e.target.value })}
                  placeholder="https://facebook.com/monresto"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                />
              </div>

              {/* TikTok */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Compte TikTok</label>
                <input
                  type="text"
                  value={branding.tiktok || ''}
                  onChange={(e) => setBranding({ ...branding, tiktok: e.target.value })}
                  placeholder="https://tiktok.com/@monresto"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN : REAL-TIME SMARTPHONE LIVE PREVIEW (5 Cols - Sticky) */}
        <div className="lg:col-span-5 sticky top-20">
          <div className="bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-800 text-white space-y-3">
            <div className="flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-black uppercase tracking-wider">Aperçu Smartphone en Direct</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded-full">
                Live Sync
              </span>
            </div>

            {/* Sub-Tabs for Mockup */}
            <div className="grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setPreviewTab('MENU')}
                className={`py-1.5 rounded-lg transition-all ${previewTab === 'MENU' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Menu Client
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('REVIEW')}
                className={`py-1.5 rounded-lg transition-all ${previewTab === 'REVIEW' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Avis Google
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('FOOTER')}
                className={`py-1.5 rounded-lg transition-all ${previewTab === 'FOOTER' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Coordonnées
              </button>
            </div>

            {/* PHONE SHELL */}
            <div className="relative mx-auto w-full max-w-[340px] aspect-[9/18.5] bg-black rounded-[44px] p-3 shadow-2xl border-4 border-slate-700 overflow-hidden">
              {/* Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30" />

              {/* Dynamic Content Screen */}
              <div 
                className="w-full h-full rounded-[34px] overflow-y-auto pt-6 pb-8 transition-colors text-left"
                style={{
                  backgroundColor: branding.backgroundColor || '#FFFDF9',
                  color: branding.textColor || '#0F172A',
                  fontFamily: selectedBodyFont,
                }}
              >
                {/* Header */}
                <div className="p-3 border-b border-black/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img 
                      src={branding.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80'} 
                      alt="Logo" 
                      className="w-8 h-8 rounded-xl object-cover border"
                      style={{ borderColor: branding.primaryColor || '#FF6B00' }}
                    />
                    <div>
                      <h4 className="text-xs font-black tracking-tight" style={{ fontFamily: selectedTitleFont }}>
                        {restaurantName}
                      </h4>
                      <span className="text-[9px] font-bold block" style={{ color: branding.primaryColor || '#FF6B00' }}>
                        📍 Table 04
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-black/5 px-2 py-1 rounded-lg font-bold">🇸🇳 FR</span>
                </div>

                {/* Banner Image */}
                {branding.bannerUrl && (
                  <div className="px-3 pt-2">
                    <div className="relative w-full h-24 rounded-2xl overflow-hidden shadow-xs">
                      <img src={branding.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2 text-white">
                        <span className="text-[10px] font-black" style={{ fontFamily: selectedTitleFont }}>
                          {branding.tagline || 'Scannez • Commandez !'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 1 : MENU VIEW */}
                {previewTab === 'MENU' && (
                  <div className="p-3 space-y-3">
                    {/* Category Pills */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px] font-bold">
                      <span 
                        className="px-2.5 py-1 rounded-xl text-white shrink-0" 
                        style={{ backgroundColor: branding.primaryColor || '#FF6B00' }}
                      >
                        🍗 Nos Plats
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-black/5 text-slate-700 shrink-0">
                        🍕 Pizzas
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-black/5 text-slate-700 shrink-0">
                        🥐 Déjeuner
                      </span>
                    </div>

                    {/* Sample Dishes */}
                    <div className="space-y-2">
                      <div className="bg-white/80 border border-black/5 rounded-2xl p-2.5 shadow-2xs flex gap-2.5 items-center">
                        <img 
                          src="https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=400&q=80" 
                          alt="Dish" 
                          className="w-14 h-14 rounded-xl object-cover shrink-0" 
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-[11px] font-black truncate" style={{ fontFamily: selectedTitleFont }}>
                            Poulet Entier Braisé
                          </h5>
                          <p className="text-[9px] text-slate-500 line-clamp-1">
                            Mariné aux épices du terroir et alloco doré.
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] font-black font-mono">6 500 FCFA</span>
                            <button 
                              type="button"
                              className="text-[9px] font-black text-white px-2 py-0.5 rounded-lg"
                              style={{ backgroundColor: branding.primaryColor || '#FF6B00' }}
                            >
                              + Ajouter
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/80 border border-black/5 rounded-2xl p-2.5 shadow-2xs flex gap-2.5 items-center">
                        <img 
                          src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80" 
                          alt="Pizza" 
                          className="w-14 h-14 rounded-xl object-cover shrink-0" 
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-[11px] font-black truncate" style={{ fontFamily: selectedTitleFont }}>
                            Pizza Reine Spéciale
                          </h5>
                          <p className="text-[9px] text-slate-500 line-clamp-1">
                            Sauce tomate, mozzarella et jambon.
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] font-black font-mono">4 500 FCFA</span>
                            <button 
                              type="button"
                              className="text-[9px] font-black text-white px-2 py-0.5 rounded-lg"
                              style={{ backgroundColor: branding.primaryColor || '#FF6B00' }}
                            >
                              + Ajouter
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2 : GOOGLE REVIEW BANNER */}
                {previewTab === 'REVIEW' && (
                  <div className="p-3 space-y-3">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-3 shadow-md space-y-1">
                      <div className="flex items-center gap-1 text-[10px]">
                        <span>⭐⭐⭐⭐⭐</span>
                        <span className="bg-black/20 px-1 py-0.2 rounded font-bold text-[8px]">AVIS GOOGLE</span>
                      </div>
                      <h5 className="text-xs font-black">Vous aimez votre repas ?</h5>
                      <p className="text-[9px] text-amber-100">Laissez-nous un avis 5 étoiles en 10 secondes !</p>
                      <button 
                        type="button" 
                        className="w-full mt-2 py-1.5 bg-white text-slate-900 font-black text-[10px] rounded-xl shadow-xs"
                      >
                        Donner mon avis ⭐
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 3 : FOOTER & COORDONNÉES */}
                {previewTab === 'FOOTER' && (
                  <div className="p-3 space-y-2.5 text-[10px]">
                    <div className="bg-white/80 border border-black/5 rounded-2xl p-3 space-y-2">
                      <div className="font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-500" />
                        <span>{branding.address || 'Plateau, Dakar'}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="bg-emerald-500 text-white px-2 py-1 rounded-lg font-bold">
                          💬 WhatsApp
                        </span>
                        <span className="bg-slate-900 text-white px-2 py-1 rounded-lg font-bold">
                          📞 Appeler
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-400">
              💡 Les modifications s'appliquent en direct sans recharger le téléphone du client.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
