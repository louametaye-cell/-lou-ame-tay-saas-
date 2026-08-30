import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { PROBLEMS_AND_SOLUTIONS } from '@/components/landing/data/mockData';

export const ProblemsSection: React.FC = () => {
  const [viewMode, setViewMode] = useState<'both' | 'before' | 'after'>('both');
  const [hoveredProblemId, setHoveredProblemId] = useState<string | null>(null);

  // Helper pour attribuer les icônes aux problèmes
  const getProblemIcon = (id: string) => {
    switch (id) {
      case 'prob_paper_menu':
        return <FileXIcon className="w-5 h-5" />;
      case 'prob_waiter_error':
        return <Users className="w-5 h-5" />;
      case 'prob_slow_billing':
        return <Clock className="w-5 h-5" />;
      case 'prob_out_of_stock':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <HelpCircle className="w-5 h-5" />;
    }
  };

  return (
    <section id="pourquoi" className="py-24 bg-[#FAFAFA] border-b border-slate-100 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-[#00A86B]/5 rounded-full blur-3xl pointer-events-none -ml-40" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-[#FF6B00]/5 rounded-full blur-3xl pointer-events-none -mr-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-[#FF6B00] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Problème → Solution concrète</span>
          </div>
          
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Pourquoi les restaurateurs choisissent <span className="text-[#00A86B] relative inline-block">Lou Ame Tay ?<span className="absolute bottom-1 left-0 w-full h-1.5 bg-[#00A86B]/15 rounded-full" /></span>
          </h2>
          
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-medium max-w-2xl mx-auto">
            Vous n'achetez pas un simple "menu digital" : vous éliminez définitivement les pertes de temps, les erreurs de service et les coûts d'impression récurrents.
          </p>

          {/* 3 Value Punchlines pills */}
          <div className="pt-3 flex flex-wrap justify-center items-center gap-2 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-slate-200/80 text-slate-700 font-bold text-xs shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Fini les serveurs perdus
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-slate-200/80 text-slate-700 font-bold text-xs shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#00A86B]" />
              Commande directe instantanée
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-slate-200/80 text-slate-700 font-bold text-xs shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Zéro rature de prix
            </span>
          </div>

          {/* Sliding toggle filter */}
          <div className="pt-6 flex justify-center items-center">
            <div className="bg-slate-200/60 p-1.5 rounded-2xl inline-flex text-xs font-bold text-slate-600 border border-slate-200/40 shadow-2xs">
              <button
                onClick={() => setViewMode('both')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'both' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Vue Comparaison
              </button>
              <button
                onClick={() => setViewMode('before')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'before' ? 'bg-white text-rose-600 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Les Problèmes</span>
              </button>
              <button
                onClick={() => setViewMode('after')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'after' ? 'bg-white text-[#00A86B] shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
                <span>Les Solutions</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Problems & Solutions Bento Grid */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {PROBLEMS_AND_SOLUTIONS.map((item, index) => {
            const isSelected = hoveredProblemId === item.id;
            
            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredProblemId(item.id)}
                onMouseLeave={() => setHoveredProblemId(null)}
                className={`group rounded-3xl border transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between relative bg-white ${
                  isSelected 
                    ? 'border-[#00A86B]/30 shadow-xl shadow-slate-200/50 -translate-y-1' 
                    : 'border-slate-200/80 shadow-xs hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Card Header & Impact Badge */}
                  <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 font-extrabold flex items-center justify-center text-xs border border-slate-100 group-hover:bg-[#00A86B]/10 group-hover:text-[#00A86B] group-hover:border-[#00A86B]/20 transition-all">
                        0{index + 1}
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-[#FF6B00] uppercase tracking-wider block mb-0.5">
                          {item.punchline}
                        </span>
                        <h3 className="font-heading font-black text-lg sm:text-xl text-slate-900 tracking-tight leading-tight">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <span className="shrink-0 text-[11px] font-bold text-[#00A86B] bg-[#00A86B]/10 border border-[#00A86B]/20 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-2xs">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {item.impactMetric}
                    </span>
                  </div>

                  {/* Problem / Solution comparative layout (Responsive Grid columns) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                    {/* Before (Problem) */}
                    {(viewMode === 'both' || viewMode === 'before') && (
                      <div className={`p-4.5 rounded-2xl transition-all duration-300 flex flex-col justify-between border ${
                        viewMode === 'before' ? 'col-span-2' : ''
                      } bg-rose-50/30 border-rose-100/50 hover:bg-rose-50/50`}>
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-rose-700 bg-rose-500/10 px-2.5 py-1 rounded-md">
                            <XCircle className="w-3 h-3" />
                            Avant (Menu Papier)
                          </span>
                          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                            {item.problem}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* After (Solution) */}
                    {(viewMode === 'both' || viewMode === 'after') && (
                      <div className={`p-4.5 rounded-2xl transition-all duration-300 flex flex-col justify-between border ${
                        viewMode === 'after' ? 'col-span-2' : ''
                      } bg-emerald-50/30 border-emerald-100/50 hover:bg-emerald-50/50`}>
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-[#00A86B]/10 px-2.5 py-1 rounded-md">
                            <CheckCircle2 className="w-3 h-3 text-[#00A86B]" />
                            Avec Lou Ame Tay
                          </span>
                          <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                            {item.solution}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Quick Feature Highlight */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Zap className="w-4 h-4 text-[#FF6B00]" />
                    Mise en place immédiate
                  </span>
                  <a
                    href="#demo-live"
                    className="font-bold text-[#00A86B] hover:text-[#008957] inline-flex items-center gap-1 group/link cursor-pointer transition-colors"
                  >
                    <span>Tester en direct</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Highlight quote banner */}
        <div className="mt-16 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute left-0 bottom-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="space-y-2 text-center md:text-left relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#FF6B00] text-[10px] font-black uppercase tracking-wider">
              <TrendingDown className="w-3.5 h-3.5" />
              Constat terrain au Sénégal 🇸🇳
            </span>
            <p className="text-base sm:text-lg font-bold text-slate-100 max-w-2xl leading-relaxed">
              « Un restaurateur à Dakar et Thiès réimprime en moyenne sa carte 4 fois par an et perd jusqu'à 15% de son chiffre d'affaires à cause des temps d'attente lors du service. »
            </p>
          </div>

          <a
            href="#calculateur"
            className="shrink-0 inline-flex items-center gap-2 bg-[#00A86B] hover:bg-[#00925d] active:scale-95 text-white font-bold text-sm px-6 py-4 rounded-xl shadow-lg shadow-[#00A86B]/25 transition-all cursor-pointer relative z-10"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Calculer mes économies</span>
          </a>
        </div>

      </div>
    </section>
  );
};

// Icône de secours pour le menu
const FileXIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="m9 15 6-6" />
    <path d="m15 15-6-6" />
  </svg>
);
