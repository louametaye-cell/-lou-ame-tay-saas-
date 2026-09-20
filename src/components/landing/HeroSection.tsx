import React, { useState } from 'react';
import { 
  PhoneCall, 
  ArrowRight, 
  QrCode, 
  CheckCircle2, 
  Smartphone, 
  Clock, 
  ShieldCheck, 
  ChefHat, 
  Plus, 
  LayoutDashboard, 
  Zap, 
  Rocket 
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
      className="relative pt-28 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-slate-50/50 border-b border-slate-200/80"
    >
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Main Split Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-start">
          
          {/* Left Column: Headlines, Value proposition, CTA buttons & Split Features */}
          <div className="lg:col-span-7 flex flex-col items-start pt-2">
            
            {/* Top Official Brand Badge */}
            <div className="inline-flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs mb-6">
              <OfficialLogo variant="icon-only" size="sm" />
              <span className="text-xs font-semibold text-slate-700">
                Lou Ame Tay ? • SaaS 100% Sénégalais 🇸🇳
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.15] mb-6 tracking-tight text-slate-900">
              La transition digitale de la <span className="text-[#00A86B]">restauration</span> et de l'hôtellerie.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-xl leading-relaxed font-normal">
              Une solution de commande sur table par QR code, conçue pour optimiser la gestion de vos cartes, réduire l'usage du papier et fluidifier le service.
            </p>

            {/* 2 Big Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-8">
              <a
                id="hero-cta-discover-btn"
                href="#comment-ca-marche"
                className="bg-[#00A86B] hover:bg-[#008957] active:scale-98 text-white px-7 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-center text-sm shadow-xs"
              >
                <span>Découvrir la solution</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </a>

              <a
                id="hero-cta-demo-btn"
                href="https://wa.me/221762312003?text=Bonjour%20Lou%20Ame%20Tay,%20je%20suis%20restaurateur%20et%20je%20souhaite%20r%C3%A9server%20une%20d%C3%A9mo%20de%2010%20minutes."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 active:scale-98 px-7 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-center text-sm shadow-xs"
              >
                <PhoneCall className="w-4 h-4 text-slate-600" strokeWidth={1.75} />
                <span>Demander une démo</span>
              </a>
            </div>

            {/* Reassurance pills */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-500 mb-8">
              <span className="flex items-center gap-1.5 font-medium bg-white px-3 py-1 rounded-full border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00A86B]" strokeWidth={2} />
                14 jours d'essai gratuit
              </span>
              <span className="flex items-center gap-1.5 font-medium bg-white px-3 py-1 rounded-full border border-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00A86B]" strokeWidth={2} />
                Sans engagement
              </span>
              <span className="flex items-center gap-1.5 font-medium bg-white px-3 py-1 rounded-full border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-[#00A86B]" strokeWidth={2} />
                Mise en service rapide
              </span>
            </div>

            {/* Split Feature Tiles Grid */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden shadow-xs mt-2">
              <div className="bg-white p-5 hover:bg-slate-50/50 transition-colors">
                <div className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700 mb-3 shadow-xs">
                  <Smartphone className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <h3 className="font-heading font-bold text-sm text-slate-900 mb-1">Menu Client</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">Consultation et sélection par le client depuis sa table.</p>
              </div>

              <div className="bg-white p-5 hover:bg-slate-50/50 transition-colors">
                <div className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700 mb-3 shadow-xs">
                  <ChefHat className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <h3 className="font-heading font-bold text-sm text-slate-900 mb-1">Écran Cuisine</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">Transmission instantanée des bons en zone de préparation.</p>
              </div>

              <div className="bg-white p-5 hover:bg-slate-50/50 transition-colors">
                <div className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700 mb-3 shadow-xs">
                  <LayoutDashboard className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <h3 className="font-heading font-bold text-sm text-slate-900 mb-1">Tableau de bord</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">Ajustement des tarifs et disponibilités en temps réel.</p>
              </div>

              <div className="bg-white p-5 hover:bg-slate-50/50 transition-colors">
                <div className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700 mb-3 shadow-xs">
                  <Zap className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <h3 className="font-heading font-bold text-sm text-slate-900 mb-1">Gain de temps</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">Optimisation des rotations et fluidification du service.</p>
              </div>
            </div>

          </div>

          {/* Right Column: Phone Simulator */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            
            {/* iPhone Shell */}
            <div className="relative w-full max-w-[320px] sm:max-w-[340px] mx-auto select-none">
              
              <div className="relative bg-slate-900 p-[3px] rounded-[44px] shadow-sm border border-slate-700">
                
                {/* Display Screen */}
                <div className="bg-white rounded-[40px] overflow-hidden text-slate-900 flex flex-col h-[570px] relative border border-slate-200">
                  
                  {/* Dynamic Island Notch */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-30" />

                  {/* Top Header Restaurant Info */}
                  <div className="bg-[#00A86B] p-4 pt-8 text-white shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-heading font-bold text-sm tracking-tight">Le Teranga Grill</span>
                        </div>
                        <p className="text-[10px] text-emerald-100 font-normal">Thiès • Grillades & Cuisine locale</p>
                      </div>

                      {/* Table badge */}
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-emerald-100 font-medium">Table</span>
                        <div className="bg-white text-[#00A86B] font-bold text-xs px-2 py-0.5 rounded shadow-xs">
                          <span>#04</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category navigation pills */}
                  <div className="flex items-center gap-1.5 p-2 bg-slate-50 border-b border-slate-100 overflow-x-auto text-[11px] font-medium text-slate-600 no-scrollbar">
                    {(['tous', 'plats', 'grillades', 'boissons'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1 rounded-md capitalize transition-colors shrink-0 ${
                          selectedCategory === cat
                            ? 'bg-[#00A86B] text-white font-bold'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span>{cat === 'tous' ? 'Tous' : cat}</span>
                      </button>
                    ))}
                  </div>

                  {/* Dish list inside simulated phone */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {filteredDishes.map((dish) => (
                      <div
                        key={dish.id}
                        className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs flex gap-2.5 items-center"
                      >
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-14 h-14 rounded-md object-cover shrink-0 border border-slate-100"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 truncate">{dish.name}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 font-normal">{dish.description}</p>
                          
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs font-bold text-slate-900">
                              {dish.price.toLocaleString('fr-FR')} FCFA
                            </span>
                            <button
                              onClick={() => handleSimulatedOrderClick(dish.name)}
                              className="bg-[#00A86B] hover:bg-[#008957] text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
                            >
                              <Plus className="w-3 h-3" strokeWidth={2} />
                              <span>Ajouter</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Toast Notification */}
                  {addedItemName && (
                    <div className="absolute bottom-16 left-4 right-4 bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-sm flex items-center justify-between z-20">
                      <span className="truncate">✓ {addedItemName} ajouté</span>
                      <span className="text-emerald-400 text-[10px]">Table #04</span>
                    </div>
                  )}

                  {/* Phone Bottom Cart Bar */}
                  <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-normal">Panier actif</span>
                      <span className="font-bold text-slate-900">6 500 FCFA</span>
                    </div>
                    <a
                      href="#demo-live"
                      className="bg-[#00A86B] hover:bg-[#008957] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Commander</span>
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                    </a>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
