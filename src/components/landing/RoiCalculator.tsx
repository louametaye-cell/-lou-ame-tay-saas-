import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Clock, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export const RoiCalculator: React.FC = () => {
  const [tablesCount, setTablesCount] = useState<number>(12);
  const [dailyCovers, setDailyCovers] = useState<number>(60);
  const [averageTicket, setAverageTicket] = useState<number>(3500); // in FCFA

  // Calculations:
  // 1. Upsell increase (around +18% on extra drinks & appetizers like pastels and bissap)
  const monthlyRevenue = dailyCovers * averageTicket * 30;
  const estimatedUpsellRate = 0.18;
  const monthlyExtraRevenue = Math.round(monthlyRevenue * estimatedUpsellRate);

  // 2. Printing savings (approx 25 000 FCFA / quarter + laminates)
  const monthlyPrintSavings = 15000;

  // 3. Time saved per day (approx 2 minutes saved per customer table interaction)
  const dailyMinutesSaved = Math.round((dailyCovers / 2) * 2.5);
  const dailyHoursSaved = (dailyMinutesSaved / 60).toFixed(1);

  // 4. Return on investment ratio vs Pro plan (25 000 FCFA)
  const netMonthlyGain = monthlyExtraRevenue + monthlyPrintSavings - 25000;
  const roiMultiplier = Math.round(netMonthlyGain / 25000);

  return (
    <section id="calculateur" className="py-20 bg-white relative border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-[#FF6B00] px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-orange-200/60">
            <Calculator className="w-3.5 h-3.5" />
            <span>Simulateur de Rentabilité</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
            Combien allez-vous gagner avec <span className="text-[#00A86B]">Lou Ame Tay ?</span>
          </h2>

          <p className="text-base sm:text-lg text-gray-500 font-normal leading-relaxed">
            Ajustez les curseurs selon la taille de votre restaurant au Sénégal et découvrez votre gain mensuel estimé en FCFA.
          </p>
        </div>

        {/* Calculator Interactive Box */}
        <div className="mt-14 max-w-5xl mx-auto bg-[#F8F9FA] rounded-2xl border border-gray-200 shadow-xs overflow-hidden p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Sliders Input Column */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Slider 1: Tables count */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <label className="font-bold text-gray-800">Nombre de tables :</label>
                  <span className="font-extrabold text-[#00A86B] bg-green-50 px-3 py-1 rounded-md text-sm border border-green-200/60">
                    {tablesCount} tables
                  </span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={50}
                  step={1}
                  value={tablesCount}
                  onChange={(e) => setTablesCount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00A86B]"
                />
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>3 tables</span>
                  <span>25 tables</span>
                  <span>50+ tables</span>
                </div>
              </div>

              {/* Slider 2: Daily covers / customers */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <label className="font-bold text-gray-800">Clients servis par jour (Couverts) :</label>
                  <span className="font-extrabold text-[#FF6B00] bg-orange-50 px-3 py-1 rounded-md text-sm border border-orange-200/60">
                    {dailyCovers} clients/jour
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={300}
                  step={5}
                  value={dailyCovers}
                  onChange={(e) => setDailyCovers(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF6B00]"
                />
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>10 clients</span>
                  <span>150 clients</span>
                  <span>300+ clients</span>
                </div>
              </div>

              {/* Slider 3: Average Ticket */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <label className="font-bold text-gray-800">Ticket moyen par client :</label>
                  <span className="font-extrabold text-gray-900 bg-white px-3 py-1 rounded-md text-sm border border-gray-200 shadow-xs">
                    {averageTicket.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <input
                  type="range"
                  min={1500}
                  max={15000}
                  step={500}
                  value={averageTicket}
                  onChange={(e) => setAverageTicket(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00A86B]"
                />
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>1 500 FCFA</span>
                  <span>7 500 FCFA</span>
                  <span>15 000 FCFA</span>
                </div>
              </div>

              <div className="p-3.5 bg-green-50 rounded-xl border border-green-200 text-xs text-emerald-950">
                💡 <em>Source terrain :</em> +18% de vente de boissons et accompagnements grâce aux visuels HD de vos plats.
              </div>

            </div>

            {/* Calculated Results Banner */}
            <div className="lg:col-span-6 bg-[#1A1A1A] rounded-2xl p-6 sm:p-8 text-white space-y-6 shadow-xl">
              
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B00] block">
                Impact Mensuel Estimé
              </span>

              {/* Big metric */}
              <div>
                <span className="text-xs text-gray-400 block">Chiffre d'affaires additionnel estimé</span>
                <div className="text-3xl sm:text-4xl font-heading font-black text-[#00A86B] mt-1">
                  +{monthlyExtraRevenue.toLocaleString('fr-FR')} FCFA
                  <span className="text-xs text-gray-300 font-normal block sm:inline sm:ml-2">/ mois</span>
                </div>
              </div>

              {/* 3 Result Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-1.5 text-xs text-gray-300">
                    <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Temps gagné</span>
                  </div>
                  <div className="text-lg font-bold text-white mt-1">
                    ~{dailyHoursSaved}h / jour
                  </div>
                </div>

                <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-1.5 text-xs text-gray-300">
                    <FileText className="w-3.5 h-3.5 text-[#00A86B]" />
                    <span>Papier économisé</span>
                  </div>
                  <div className="text-lg font-bold text-white mt-1">
                    100% Digital
                  </div>
                </div>
              </div>

              {/* ROI Factor callout */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <span>Rentabilité du forfait Pro (25 000 FCFA) :</span>
                <span className="font-extrabold text-[#00A86B] text-sm">
                  x{Math.max(1, roiMultiplier)} de retour
                </span>
              </div>

              <a
                href="#tarifs"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#00A86B] hover:bg-[#00925d] text-white font-bold text-sm py-3.5 rounded-xl shadow-lg transition-all"
              >
                <span>Découvrir les forfaits</span>
                <ArrowRight className="w-4 h-4" />
              </a>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
