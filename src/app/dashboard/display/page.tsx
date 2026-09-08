'use client';

import React, { useState, useEffect } from 'react';
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
  Layers,
  Lock,
  ShieldCheck,
  Phone,
  Clock,
  Wifi,
  PlusCircle,
  Volume2,
  ChefHat,
  ShoppingBag,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface DisplayData {
  restaurantId: string;
  restaurantName: string;
  subdomain: string;
  isEnabled: boolean;
  displaySettings?: {
    isEnabled: boolean;
    mode: 'classic' | 'slideshow' | 'quadrant';
    slideDuration?: number;
    maxScreens?: number;
  };
}

const DISPLAY_MODES_INFO = {
  slideshow: {
    name: 'Mode Diaporama (1 Plat Grand Format)',
    icon: Film,
    emoji: '🎬',
    badge: 'Cinématique & Immersif',
    description: 'Met en valeur chaque spécialité une par une en très grand format avec photo HD, nom wolof, prix et allergènes.',
    idealFor: 'Mise en valeur des plats signatures, ambiances lounge & dîners',
    cadence: 'Défilement automatique calibré toutes les 6 secondes',
  },
  quadrant: {
    name: 'Mode Quadrant (Grille Dynamique 2x2)',
    icon: Layers,
    emoji: '🖼️',
    badge: 'Dynamique & Équilibré',
    description: 'Affiche 4 plats en simultané dans une grille 2x2 contrastée avec rotation automatique par page.',
    idealFor: 'Food courts, buffets, vitrines et zones à fort passage',
    cadence: 'Changement de page (4 plats) toutes les 10 secondes',
  },
  classic: {
    name: 'Mode Grille Classique (Carte Complète)',
    icon: LayoutGrid,
    emoji: '📋',
    badge: 'Standard & Exhaustif',
    description: 'Affiche la carte complète organisée par catégories avec photos, prix et ruptures en direct.',
    idealFor: 'Grands écrans 4K/1080p, restaurants à la carte riche',
    cadence: 'Statique avec auto-refresh en temps réel',
  },
};

export default function DisplaySettingsPage() {
  const [restaurantId, setRestaurantId] = useState('mg-cafe-resto');
  const [data, setData] = useState<DisplayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScreen, setSelectedScreen] = useState(1);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [copiedPickupUrl, setCopiedPickupUrl] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
      const savedResto = localStorage.getItem('current_restaurant_subdomain') || localStorage.getItem('louametay_resto_subdomain') || 'mg-cafe-resto';
      setRestaurantId(savedResto);

      fetch(`/api/display/${savedResto}`)
        .then((res) => res.json())
        .then((json) => {
          setData(json);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  const isEnabled = data ? (data.isEnabled !== false && data.displaySettings?.isEnabled !== false) : true;
  const currentMode = data?.displaySettings?.mode || 'slideshow';
  const maxScreens = data?.displaySettings?.maxScreens || 1;
  const activeModeInfo = DISPLAY_MODES_INFO[currentMode] || DISPLAY_MODES_INFO.slideshow;

  const getScreenUrl = (screenNum: number) => {
    if (!baseUrl) return '';
    if (maxScreens <= 1) {
      return `${baseUrl}/display/${restaurantId}`;
    }
    return `${baseUrl}/display/${restaurantId}?screen=${screenNum}`;
  };

  const copyToClipboard = (url: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success('📋 Lien de projection copié ! Collez-le dans le navigateur de votre TV.');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const openDisplay = (url: string) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-700 space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold">Chargement de la configuration Écran TV...</p>
      </div>
    );
  }

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
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Digital Signage TV
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <Tv className="w-8 h-8 text-emerald-600" />
            <span>🖥️ Écran Menu Public (Affichage TV)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Diffusez votre carte en direct sur Smart TV ou écran vitrine dans votre restaurant.
          </p>
        </div>

        {isEnabled && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => openDisplay(getScreenUrl(selectedScreen))}
              className="py-3 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Monitor className="w-4 h-4" />
              <span>Lancer la Projection Plein Écran</span>
            </button>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto space-y-8">

        {/* SI L'OPTION EST DÉSACTIVÉE PAR LE SUPER-ADMIN */}
        {!isEnabled ? (
          <div className="bg-white rounded-3xl border-2 border-amber-300 p-8 shadow-sm text-center max-w-2xl mx-auto space-y-5">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-xs">
              <Lock className="w-8 h-8 stroke-[2.5]" />
            </div>
            
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                Fonctionnalité Réservée
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                Option Écran TV Non Activée
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
                L&apos;option de diffusion dynamique sur Écran TV (Digital Signage) n&apos;est pas activée sur votre formule actuelle ou est en attente d&apos;attribution par votre agence MG Digital Arts Work.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ce que comprend l&apos;option Écran TV :</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside pl-1">
                <li>Diffusion continue en temps réel de votre menu sur Smart TV ou projecteur</li>
                <li>Design immersif HD adapté à l&apos;ambiance de votre restaurant</li>
                <li>Mise à jour instantanée des prix et ruptures de stock sans rafraîchir la page</li>
                <li>Possibilité de connecter plusieurs écrans en simultané (Salle, Bar, Vitrine)</li>
              </ul>
            </div>

            <a
              href="https://wa.me/221774587474?text=Bonjour%20MG%20Digital%20Arts%20Work%20je%20souhaite%20activer%20l'option%20Ecran%20TV%20pour%20mon%20restaurant"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm rounded-2xl shadow-md transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Demander l&apos;Activation de l&apos;Écran TV (WhatsApp +221 77 458 74 74)</span>
            </a>
          </div>
        ) : (
          <>
            {/* 1. CARTE DU STYLE ACTUEL FIXÉ PAR LE SUPER-ADMIN */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 text-2xl border border-amber-200">
                    {activeModeInfo.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>Style Certifié par Super-Admin</span>
                      </span>
                      <span className="text-xs text-slate-500 font-bold">
                        MG Digital Arts Work
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mt-0.5">
                      {activeModeInfo.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Diffusion Active</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-bold block">Description du Rendu :</span>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {activeModeInfo.description}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 flex flex-col justify-between">
                  <div>
                    <span className="text-slate-500 font-bold block">Rythme de Transition :</span>
                    <p className="text-slate-800 font-bold flex items-center gap-1.5 text-emerald-700 pt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{activeModeInfo.cadence}</span>
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                    🔒 <em>Le style et la vitesse de transition sont administrés par MG Digital Arts Work pour garantir une visibilité optimale sur écran géant.</em>
                  </p>
                </div>
              </div>
            </div>

            {/* 2. LIENS DE DIFFUSION & ÉCRANS CONNECTÉS AUTORISÉS */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>Vos Écrans Connectés Autorisés :</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Votre forfait comprend <strong>{maxScreens} écran(s) de diffusion simultané{maxScreens > 1 ? 's' : ''}</strong>.
                  </p>
                </div>

                {maxScreens > 1 && (
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                    {Array.from({ length: maxScreens }, (_, i) => i + 1).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedScreen(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                          selectedScreen === s
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Écran {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Affichage des URLs d'écrans */}
              <div className="space-y-4">
                {Array.from({ length: maxScreens }, (_, i) => i + 1).map((screenNum) => {
                  const url = getScreenUrl(screenNum);
                  const isCopied = copiedUrl === url;
                  const isHighlighted = maxScreens === 1 || selectedScreen === screenNum;

                  return (
                    <div
                      key={screenNum}
                      className={`p-5 rounded-2xl border-2 transition-all space-y-4 ${
                        isHighlighted
                          ? 'border-emerald-500 bg-emerald-50/20 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                            #{screenNum}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900">
                              Écran {screenNum} {screenNum === 1 ? '(Poste Principal)' : screenNum === 2 ? '(Comptoir / Bar)' : `(Zone ${screenNum})`}
                            </h4>
                            <span className="text-[11px] text-slate-500">
                              Lien direct prêt pour navigateur Smart TV ou HDMI
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(url)}
                            className="py-2 px-3.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-all"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'Copié !' : 'Copier'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openDisplay(url)}
                            className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Projeter</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center pt-2 border-t border-slate-200/60">
                        <div className="lg:col-span-2">
                          <input
                            type="text"
                            value={url}
                            readOnly
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 outline-none select-all"
                          />
                        </div>

                        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200">
                          <QRCodeSVG value={url || 'https://lou-ame-tay.com'} size={50} level="M" />
                          <div className="text-[11px] text-slate-600 leading-tight">
                            <span className="font-bold text-slate-900 block">Smart TV QR</span>
                            Scannez pour ouvrir le lien sur votre TV
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Extension d'écrans supplémentaires */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-orange-600" />
                    <span>Besoin d&apos;écrans supplémentaires (Terrasse, Vitrine, Salle VIP) ?</span>
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    Commandez des licences d&apos;écrans additionnelles auprès de MG Digital Arts Work.
                  </p>
                </div>

                <a
                  href="https://wa.me/221774587474?text=Bonjour%20MG%20Digital%20Arts%20Work%20je%20souhaite%20ajouter%20un%20ecran%20TV%20supplementaire%20a%20mon%20restaurant"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Commander un écran (+221 77 458 74 74)</span>
                </a>
              </div>
            </div>

            {/* 2.5 NOUVEAU : ÉCRAN TV RETRAIT FAST-FOOD / GUICHET (ORDER STATUS BOARD) */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white rounded-3xl border-2 border-blue-500/30 p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded-2xl">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/40">
                        QSR Fast-Food &amp; Guichet
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Carillon &amp; Voix Actifs
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                      📢 Écran TV Retrait des Commandes (Status Board)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Affiche en direct deux colonnes géantes : « EN PRÉPARATION » et « PRÊT À RETIRER » avec carillon Ding-Dong et appel vocal du numéro au guichet.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const pickupUrl = `${baseUrl}/pickup/${restaurantId}`;
                      navigator.clipboard.writeText(pickupUrl);
                      setCopiedPickupUrl(true);
                      toast.success('📋 Lien de l\'Écran Retrait copié !');
                      setTimeout(() => setCopiedPickupUrl(false), 2000);
                    }}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    {copiedPickupUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedPickupUrl ? 'Copié !' : 'Copier le Lien'}</span>
                  </button>

                  <a
                    href={`/pickup/${restaurantId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Lancer l&apos;Écran Retrait Plein Écran</span>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                <div className="lg:col-span-2 space-y-2">
                  <span className="text-xs font-bold text-slate-400 block">
                    URL de projection TV en salle :
                  </span>
                  <input
                    type="text"
                    value={`${baseUrl}/pickup/${restaurantId}`}
                    readOnly
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-blue-300 outline-none select-all"
                  />
                  <p className="text-[11px] text-slate-500">
                    💡 <em>Astuce : Ouvrez cette page sur votre Smart TV au-dessus du comptoir. Le son et la voix informeront vos clients sans que vos équipes n&apos;aient à crier.</em>
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                  <QRCodeSVG value={`${baseUrl}/pickup/${restaurantId}` || 'https://lou-ame-tay.com'} size={50} level="M" />
                  <div className="text-[11px] text-slate-400 leading-tight">
                    <span className="font-bold text-white block">QR Écran Retrait</span>
                    Scannez pour ouvrir directement sur votre TV ou tablette
                  </div>
                </div>
              </div>
            </div>

            {/* 3. GUIDE D'INSTALLATION SMART TV */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Wifi className="w-5 h-5 text-emerald-600" />
                <span>Guide de Connexion &amp; Diffusion TV :</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-900 block text-sm">Option A : Smart TV Connectée</span>
                  <p className="text-slate-600 leading-relaxed">
                    Ouvrez le navigateur web intégré de votre téléviseur (Samsung Tizen, LG webOS, Android TV, Google TV) et saisissez directement votre lien de projection.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-900 block text-sm">Option B : Câble HDMI / Boîtier TV</span>
                  <p className="text-slate-600 leading-relaxed">
                    Branchez un ordinateur ou une clé HDMI (Chromecast, Xiaomi TV Stick) sur l&apos;écran, ouvrez l&apos;URL et appuyez sur la touche <strong>« F »</strong> du clavier pour le plein écran complet.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}