import React, { useState } from 'react';
import { 
  Sparkles, 
  PhoneCall, 
  ArrowRight, 
  QrCode, 
  CheckCircle2, 
  Star, 
  Flame, 
  Smartphone, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  ChefHat,
  Eye,
  Plus
} from 'lucide-react';
import { INITIAL_MENU_ITEMS } from '@/components/landing/data/mockData';
import { OfficialLogo } from './OfficialLogo';

interface HeroSectionProps {
  onOpenTrial: () => void;
  onOpenQrModal: () => void;
  onSelectInteractiveDish?: (dishName: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  onOpenTrial, 
  onOpenQrModal 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'tous' | 'plats' | 'grillades' | 'boissons'>('tous');
  const [phoneActiveTable, setPhoneActiveTable] = useState<number>(4);
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  const filteredDishes = selectedCategory === 'tous'
    ? INITIAL_MENU_ITEMS.slice(0, 4)
    : INITIAL_MENU_ITEMS.filter(d => d.category === selectedCategory).slice(0, 4);

  const handleSimulatedOrderClick = (dishName: string) => {
    setAddedItemName(dishName);
    setTimeout(() => {
      setAddedItemName(null);
    }, 2500);
  };

  return (
    <section 
      id="hero" 
      className="relative pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden bg-[#F8F9FA] border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Main Split Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-start">
          
          {/* Left Column: Headlines, Value proposition, CTA buttons & Split Features */}
          <div className="lg:col-span-7 flex flex-col items-start pt-2">
            
            {/* Top Official Brand Badge */}
            <div className="flex items-center gap-3 bg-white p-2 sm:p-2.5 pr-4 rounded-2xl border border-gray-200/80 shadow-xs mb-6 hover:border-emerald-300 transition-all">
              <OfficialLogo variant="icon-only" size="sm" />
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                  <span>Lou Ame Tay ?</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">Officiel 🇸🇳</span>
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  La solution digitale des restaurateurs de Thiès & Dakar
                </span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight text-[#1A1A1A]">
              Le menu digital qui fait tourner votre <span className="text-[#00A86B]">restaurant</span>.
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-500 mb-8 max-w-xl leading-relaxed font-normal">
              Fini les menus papier déchirés et les erreurs de commande. Vos clients scannent le QR code de leur table et commandent directement depuis leur smartphone.
            </p>

            {/* 2 Big Action Buttons as requested */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-8">
              <a
                id="hero-cta-discover-btn"
                href="#comment-ca-marche"
                className="bg-[#00A86B] hover:bg-[#00925d] active:scale-95 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-green-900/10 transition-all text-center"
              >
                <span>🚀 Découvrir la solution</span>
                <ArrowRight className="w-5 h-5" />
              </a>

              <a
                id="hero-cta-demo-btn"
                href="https://wa.me/221776543210?text=Bonjour%20Lou%20Ame%20Tay,%20je%20suis%20restaurateur%20et%20je%20souhaite%20r%C3%A9server%20une%20d%C3%A9mo%20de%2010%20minutes."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border-2 border-[#FF6B00] text-[#FF6B00] hover:bg-orange-50 active:scale-95 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-center"
              >
                <PhoneCall className="w-5 h-5" />
                <span>📞 Demander une démo</span>
              </a>
            </div>

            {/* Reassurance pills */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-gray-500 mb-8">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#00A86B]" />
                14 jours d'essai gratuit
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
                Sans engagement
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-[#00A86B]" />
                Installé en 15 minutes
              </span>
            </div>

            {/* Split Feature Tiles Grid (Recipe 11 split pattern) */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-2 gap-px bg-gray-200/80 border border-gray-200/80 rounded-2xl overflow-hidden shadow-xs mt-2">
              <div className="bg-white p-6 hover:bg-[#FAFBFB] transition-colors">
                <div className="text-2xl mb-2">📱</div>
                <h3 className="font-heading font-bold text-base text-gray-900 mb-1">Menu Client</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Scan, choix et commande en 3 clics par vos clients.</p>
              </div>

              <div className="bg-white p-6 hover:bg-[#FAFBFB] transition-colors">
                <div className="text-2xl mb-2">👨‍🍳</div>
                <h3 className="font-heading font-bold text-base text-gray-900 mb-1">Écran Cuisine</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Transmission instantanée pour zéro erreur de service.</p>
              </div>

              <div className="bg-white p-6 hover:bg-[#FAFBFB] transition-colors">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-heading font-bold text-base text-gray-900 mb-1">Dashboard</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Gérez vos prix et stocks en temps réel depuis Thiès.</p>
              </div>

              <div className="bg-white p-6 hover:bg-[#FAFBFB] transition-colors">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-heading font-bold text-base text-gray-900 mb-1">Gain de Temps</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Optimisez la rotation de vos tables jusqu'à +25%.</p>
              </div>
            </div>

          </div>

          {/* Right Column: Split Aside Phone Simulator & Live Ordering */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            
            {/* Smartphone Mockup */}
            <div className="relative w-full max-w-[340px] sm:max-w-[360px] bg-black p-3.5 rounded-[44px] shadow-2xl shadow-gray-900/20 border-4 border-gray-800">
              
              {/* Dynamic island */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#1A1A1A] mr-2" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
              </div>

              {/* Phone Screen */}
              <div className="bg-[#F8F9FA] rounded-[34px] overflow-hidden text-gray-900 flex flex-col h-[570px] select-none border border-gray-200">
                
                {/* Phone Header Restaurant Info */}
                <div className="bg-[#00A86B] p-4 text-white pt-7 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-extrabold text-base tracking-tight">Le Teranga Grill</span>
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">4.9 ★</span>
                      </div>
                      <p className="text-[11px] text-emerald-100">Thiès • Restaurant & Grillades</p>
                    </div>

                    {/* Table badge */}
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-emerald-100 uppercase font-semibold">Votre Table</span>
                      <div className="bg-white text-[#00A86B] font-extrabold text-xs px-2.5 py-1 rounded-full shadow-xs">
                        <span>Table #{phoneActiveTable}</span>
                      </div>
                    </div>
                  </div>

                  {/* Search / Status bar */}
                  <div className="mt-3 flex items-center justify-between text-[11px] bg-white/15 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-white font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping inline-block" />
                      Cuisine ouverte • Service en continu
                    </span>
                    <span className="text-emerald-200">10-15 min</span>
                  </div>
                </div>

                {/* Category navigation pills */}
                <div className="flex items-center gap-1.5 p-2 bg-white border-b border-gray-100 overflow-x-auto text-[11px] font-semibold text-gray-600 no-scrollbar">
                  {(['tous', 'plats', 'grillades', 'boissons'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full capitalize transition-all shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-[#00A86B] text-white shadow-xs'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {cat === 'tous' ? '✨ Tous' : cat}
                    </button>
                  ))}
                </div>

                {/* Dish list inside simulated phone */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                  {filteredDishes.map((dish) => (
                    <div
                      key={dish.id}
                      className="bg-white p-2.5 rounded-2xl border border-gray-100 shadow-xs hover:border-[#00A86B]/40 transition-all flex gap-2.5 items-center group"
                    >
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-gray-900 truncate">{dish.name}</h4>
                        <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{dish.description}</p>
                        
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs font-extrabold text-[#FF6B00]">
                            {dish.price.toLocaleString('fr-FR')} FCFA
                          </span>
                          <button
                            onClick={() => handleSimulatedOrderClick(dish.name)}
                            className="bg-[#00A86B] hover:bg-[#00925d] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 active:scale-90 transition-transform cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Ajouter</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Interactive Toast Notification */}
                {addedItemName && (
                  <div className="absolute bottom-20 left-6 right-6 bg-[#1A1A1A] text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                    <span className="truncate">✓ {addedItemName} ajouté !</span>
                    <span className="text-[#00A86B] text-[10px]">Table #{phoneActiveTable}</span>
                  </div>
                )}

                {/* Phone Bottom Cart Bar */}
                <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 block">Panier actif (Table #{phoneActiveTable})</span>
                    <span className="text-xs font-extrabold text-gray-900">2 articles • 6 500 FCFA</span>
                  </div>
                  <a
                    href="#demo-live"
                    className="bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1 active:scale-95 transition-transform"
                  >
                    <span>Commander</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>

              {/* Floating Badge (Left) */}
              <div className="absolute -left-6 top-16 bg-white border border-gray-200/90 rounded-2xl p-2.5 shadow-xl flex items-center gap-2.5 max-w-[180px]">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center shrink-0 font-bold">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-gray-900 block leading-tight">Flash & Commande</span>
                  <span className="text-[9px] text-gray-500">Sans installer d'app</span>
                </div>
              </div>

              {/* Floating Badge (Right) */}
              <div className="absolute -right-6 bottom-20 bg-white border border-gray-200/90 rounded-2xl p-2.5 shadow-xl flex items-center gap-2 max-w-[180px]">
                <div className="w-8 h-8 rounded-xl bg-green-50 text-[#00A86B] flex items-center justify-center shrink-0">
                  <ChefHat className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-900 block">Écran Cuisine KDS</span>
                  <span className="text-[9px] text-emerald-600 font-semibold">Temps réel ⚡</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
