'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Tv, 
  Copy, 
  ExternalLink, 
  Check, 
  Monitor, 
  Film, 
  LayoutGrid, 
  Sparkles, 
  ArrowLeft, 
  Maximize2,
  Layers,
  HelpCircle,
  Clock,
  Wifi
} from 'lucide-react';
import { toast } from 'sonner';

const DISPLAY_MODES = [
  {
    id: 'classic',
    name: 'Mode Classique (Grille)',
    icon: LayoutGrid,
    emoji: '📋',
    badge: 'Standard & Exhaustif',
    description: 'Affiche la carte complète du menu organisée par catégories avec photos, prix et ruptures.',
    idealFor: 'Grands écrans 4K/1080p, restaurants à la carte riche',
    duration: 'Statique avec auto-refresh (30s)',
  },
  {
    id: 'slideshow',
    name: 'Mode Diaporama (1 Plat)',
    icon: Film,
    emoji: '🎬',
    badge: 'Cinématique & Immersif',
    description: 'Met en valeur chaque spécialité une par une en très grand format, avec photo HD, nom wolof et allergènes.',
    idealFor: 'Mise en valeur des plats signatures, ambiances chaleureuses & lounge',
    duration: 'Défilement automatique toutes les 6 secondes',
  },
  {
    id: 'quadrant',
    name: 'Mode Quadrant (2x2)',
    icon: Layers,
    emoji: '🖼️',
    badge: 'Dynamique & Équilibré',
    description: 'Affiche 4 plats en simultané dans une grille 2x2 contrastée avec pagination continue.',
    idealFor: 'Food courts, buffets, vitrines, entrées et espaces à fort passage',
    duration: 'Changement de page (4 plats) toutes les 10 secondes',
  },
];

export default function DisplaySettingsPage() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState('chezfatou');
  const [selectedMode, setSelectedMode] = useState<'classic' | 'slideshow' | 'quadrant'>('classic');
  const [displayUrl, setDisplayUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedResto = localStorage.getItem('louametay_resto_subdomain') || 'chezfatou';
      setRestaurantId(savedResto);
      setDisplayUrl(`${window.location.origin}/display/${savedResto}?mode=classic`);
    }
  }, []);

  const handleModeChange = (modeId: 'classic' | 'slideshow' | 'quadrant') => {
    setSelectedMode(modeId);
    if (typeof window !== 'undefined') {
      setDisplayUrl(`${window.location.origin}/display/${restaurantId}?mode=${modeId}`);
    }
  };

  const copyToClipboard = () => {
    if (!displayUrl) return;
    navigator.clipboard.writeText(displayUrl);
    setIsCopied(true);
    toast.success('📋 Lien de projection copié ! Collez-le dans le navigateur de votre TV.');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const openDisplay = () => {
    if (!displayUrl) return;
    window.open(displayUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 space-y-8 text-slate-900">
      
      {/* 1. HEADER */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
              title="Retour au Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Digital Signage TV
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <Tv className="w-8 h-8 text-emerald-600" />
            <span>🖥️ Écran Menu Public (Affichage TV)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Diffusez en continu votre menu en temps réel sur TV, vidéoprojecteur ou écran vitrine sans matériel supplémentaire.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={openDisplay}
            className="py-3 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center gap-2 active:scale-95"
          >
            <Monitor className="w-4 h-4" />
            <span>Lancer la Projection Plein Écran</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* 2. MODE SELECTION CARDS */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span>1. Choisissez le Mode d'Affichage :</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {DISPLAY_MODES.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.id;

              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => handleModeChange(mode.id as any)}
                  className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col justify-between relative shadow-xs ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 ring-4 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-4 right-4 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
                      <Check className="w-4 h-4" />
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className={`p-3 rounded-2xl text-2xl ${
                        isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {mode.emoji}
                      </div>
                      <div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-emerald-200 text-emerald-950 font-black' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {mode.badge}
                        </span>
                        <h3 className="text-base font-black text-slate-900 mt-0.5">
                          {mode.name}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {mode.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-200/80 space-y-1.5 text-[11px]">
                    <div className="text-slate-500">
                      <strong>Recommandé pour :</strong> {mode.idealFor}
                    </div>
                    <div className="text-emerald-700 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{mode.duration}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. PROJECTION LINK & SMART TV QR CODE */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span>2. Lien de Projection &amp; Connexion TV :</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            
            {/* Left 2 Cols: Link Copy Input */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="text-xs font-black uppercase text-slate-500 block mb-2">
                  URL Unique de Projection (Mode {selectedMode.toUpperCase()}) :
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-2xl p-2 shadow-inner">
                  <input
                    type="text"
                    value={displayUrl}
                    readOnly
                    className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm font-mono text-slate-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{isCopied ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 space-y-1 text-xs">
                <div className="font-black flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Astuce Projection Pro :</span>
                </div>
                <p className="text-amber-800 leading-relaxed font-medium">
                  Appuyez sur la touche <strong>« F »</strong> ou cliquez sur l'icône plein écran pour masquer l'interface du navigateur et obtenir un rendu 100% professionnel sur votre écran TV.
                </p>
              </div>
            </div>

            {/* Right Col: Smart TV QR Code */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-center flex flex-col items-center justify-center space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                📲 Accès Rapide Smart TV
              </span>
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
                <QRCodeSVG value={displayUrl || 'https://lou-ame-tay.com'} size={110} level="M" />
              </div>
              <p className="text-[11px] text-slate-500">
                Scannez ce QR Code avec l'appareil photo d'un smartphone pour ouvrir le lien sur votre TV connectée.
              </p>
            </div>
          </div>
        </div>

        {/* 4. INSTALLATION GUIDE */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <h3 className="text-base font-black flex items-center gap-2">
            <Wifi className="w-5 h-5 text-emerald-400" />
            <span>Guide d'installation simple (3 minutes)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1.5">
              <span className="font-black text-amber-400 block">Option A : Smart TV Connectée</span>
              <p className="text-slate-300">
                Ouvrez le navigateur web intégré de votre TV (LG webOS, Samsung Tizen, Android TV) et saisissez l'URL de projection.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1.5">
              <span className="font-black text-emerald-400 block">Option B : Chromecast / AirPlay</span>
              <p className="text-slate-300">
                Ouvrez la page sur votre ordinateur portable ou tablette et cliquez sur « Caster l'onglet » vers votre grand écran.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1.5">
              <span className="font-black text-sky-400 block">Option C : Câble HDMI direct</span>
              <p className="text-slate-300">
                Branchez un PC portable, Mac mini ou Raspberry Pi en HDMI sur votre écran TV et mettez la fenêtre en plein écran (touche F).
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}