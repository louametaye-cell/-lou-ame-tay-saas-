import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MessageCircle, 
  Sparkles, 
  Phone, 
  MapPin, 
  Copy, 
  Check, 
  Gift, 
  TrendingUp,
  Share2
} from 'lucide-react';
import { CUSTOMER_JOURNEY_STEPS } from '@/components/landing/data/mockData';
import { CustomerJourneyStep } from '@/components/landing/types';

export const CustomerJourneySection: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<CustomerJourneyStep>(CUSTOMER_JOURNEY_STEPS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customRestaurant, setCustomRestaurant] = useState('Le Teranga Grill');
  const [customGerant, setCustomGerant] = useState('M. Ndiaye');

  const handleCopyMessage = (text: string, id: string) => {
    const formatted = text
      .replace(/\[Nom_Gerant\]/g, customGerant)
      .replace(/\[Nom_Restaurant\]/g, customRestaurant)
      .replace(/\[Plat_Star\]/g, 'Thiéboudienne Penda Mbaye');
      
    navigator.clipboard.writeText(formatted);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <section id="parcours-client" className="py-20 bg-white border-b border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-green-50 text-[#00A86B] px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-green-200/60">
            <span>Onboarding & Accompagnement</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
            Votre réussite pas à pas, <span className="text-[#00A86B]">de J0 à J45</span>
          </h2>

          <p className="text-base sm:text-lg text-gray-500 font-normal leading-relaxed">
            Nous ne vous laissons jamais seul avec une technologie inconnue. Découvrez notre protocole d'accompagnement terrain éprouvé sur plus de 45 restaurants.
          </p>
        </div>

        {/* 4 Steps Quick Onboarding summary */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-gray-200 relative">
            <span className="w-8 h-8 rounded-full bg-gray-900 text-white font-black text-xs flex items-center justify-center mb-3">1</span>
            <h4 className="font-heading font-bold text-sm text-gray-900">Envoi du menu actuel</h4>
            <p className="text-xs text-gray-500 mt-1">Photo de votre carte papier ou liste des plats envoyée sur WhatsApp.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-gray-200 relative">
            <span className="w-8 h-8 rounded-full bg-[#00A86B] text-white font-black text-xs flex items-center justify-center mb-3">2</span>
            <h4 className="font-heading font-bold text-sm text-gray-900">Numérisation 24h</h4>
            <p className="text-xs text-gray-500 mt-1">Création de vos catégories, saisie des prix FCFA et shooting photo HD.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-gray-200 relative">
            <span className="w-8 h-8 rounded-full bg-[#FF6B00] text-white font-black text-xs flex items-center justify-center mb-3">3</span>
            <h4 className="font-heading font-bold text-sm text-gray-900">Pose & Formation 15 min</h4>
            <p className="text-xs text-gray-500 mt-1">Livraison des chevalets QR Code et formation de votre équipe en salle.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-gray-200 relative">
            <span className="w-8 h-8 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center mb-3">4</span>
            <h4 className="font-heading font-bold text-sm text-gray-900">Suivi & Résultats 7j/7</h4>
            <p className="text-xs text-gray-500 mt-1">Check-up réguliers, bilan de scans et support WhatsApp ultra-réactif.</p>
          </div>
        </div>

        {/* Interactive Timeline & WhatsApp script tester */}
        <div className="mt-14 bg-[#F8F9FA] rounded-3xl p-6 sm:p-10 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Left: Interactive Timeline Selector */}
            <div className="w-full lg:w-5/12 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                  Chronologie du suivi client
                </span>
                <span className="text-xs text-[#00A86B] font-bold">Cliquez sur une étape</span>
              </div>

              {CUSTOMER_JOURNEY_STEPS.map((step) => {
                const isCurrent = selectedStep.id === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setSelectedStep(step)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer ${
                      isCurrent
                        ? 'bg-white border-[#00A86B] shadow-md ring-2 ring-[#00A86B]/10'
                        : 'bg-white/60 border-gray-200 hover:bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold ${
                      isCurrent ? 'bg-[#00A86B] text-white' : 'bg-gray-100 text-gray-700'
                    }`}>
                      <span className="text-xs font-black">{step.dayLabel.split(' ')[0]}</span>
                      <span className="text-[10px] opacity-80">{step.dayLabel.split(' ')[1]}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-heading font-extrabold text-sm text-gray-900 truncate">
                          {step.title}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          step.channel === 'Sur place' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-green-100 text-[#008957]'
                        }`}>
                          {step.channel}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {step.objective}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: WhatsApp message simulation & customization */}
            <div className="w-full lg:w-7/12 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm sm:text-base text-gray-900">
                      {selectedStep.title} ({selectedStep.dayLabel})
                    </h4>
                    <span className="text-xs text-gray-500">Canal : {selectedStep.channel} • Objectif : {selectedStep.objective}</span>
                  </div>
                </div>

                <span className="text-xs font-bold bg-green-50 text-[#00A86B] px-3 py-1 rounded-full border border-green-200">
                  Étape {selectedStep.dayNumber === 0 ? 'Lancement' : `J+${selectedStep.dayNumber}`}
                </span>
              </div>

              {/* Dynamic personalization parameters */}
              <div className="bg-gray-50 p-4 rounded-xl mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-gray-600 block mb-1">Nom du Gérant :</label>
                  <input
                    type="text"
                    value={customGerant}
                    onChange={(e) => setCustomGerant(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-[#00A86B]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-600 block mb-1">Nom de l'établissement :</label>
                  <input
                    type="text"
                    value={customRestaurant}
                    onChange={(e) => setCustomRestaurant(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-[#00A86B]"
                  />
                </div>
              </div>

              {/* WhatsApp Bubble Preview */}
              <div className="p-5 rounded-2xl bg-[#EFEAE2] border border-[#d1c7b8] mb-6 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-gray-600 pb-1 border-b border-black/10">
                  <span className="font-bold text-gray-800">Lou Ame Tay Assistance 🇸🇳</span>
                  <span>Aujourd'hui à 11:30</span>
                </div>

                <div className="bg-white p-4 rounded-xl rounded-tl-none shadow-xs text-xs sm:text-sm text-gray-900 leading-relaxed whitespace-pre-line border border-black/5">
                  {selectedStep.messageTemplate
                    .replace(/\[Nom_Gerant\]/g, customGerant)
                    .replace(/\[Nom_Restaurant\]/g, customRestaurant)
                    .replace(/\[Plat_Star\]/g, 'Thiéboudienne Penda Mbaye')}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => handleCopyMessage(selectedStep.messageTemplate, selectedStep.id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  {copiedId === selectedStep.id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Message copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copier le texte du message</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://wa.me/221776543210?text=${encodeURIComponent(
                    selectedStep.messageTemplate
                      .replace(/\[Nom_Gerant\]/g, customGerant)
                      .replace(/\[Nom_Restaurant\]/g, customRestaurant)
                      .replace(/\[Plat_Star\]/g, 'Thiéboudienne Penda Mbaye')
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Tester l'envoi sur WhatsApp</span>
                </a>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
