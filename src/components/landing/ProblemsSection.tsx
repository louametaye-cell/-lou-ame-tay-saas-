import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileX, 
  Users, 
  Hourglass, 
  PackageX, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ArrowRight, 
  Leaf, 
  TrendingUp, 
  ShieldCheck 
} from 'lucide-react';

interface ProblemItem {
  id: string;
  number: string;
  punchline: string;
  title: string;
  category: string;
  problemShort: string;
  problemFull: string;
  solutionTitle: string;
  solutionFull: string;
  impactMetric: string;
  rseBadge: string;
  icon: React.ElementType;
}

const PROBLEMS_DATA: ProblemItem[] = [
  {
    id: 'prob-paper',
    number: '01',
    punchline: 'Menus numériques toujours à jour',
    title: 'Menus papier détériorés et frais de réimpression récurrents',
    category: 'Gestion de la carte',
    problemShort: 'Les cartes papier s\'abîment rapidement et nécessitent des réimpressions à chaque modification tarifaire.',
    problemFull: 'En établissement de restauration ou d\'hôtellerie, les menus imprimés se détériorent sous l\'effet de l\'usage quotidien. Chaque changement de prix ou de recette impose une réimpression complète.',
    solutionTitle: 'Carte digitale modifiable en temps réel',
    solutionFull: 'Votre carte est 100% numérique et accessible via QR code. Vous ajustez vos prix, modifiez les visuels ou mettez en avant les suggestions du jour en quelques secondes depuis votre smartphone.',
    impactMetric: '0 FCFA de réimpression',
    rseBadge: 'Moins de papier, plus de marge',
    icon: FileX
  },
  {
    id: 'prob-errors',
    number: '02',
    punchline: 'Transmission directe des commandes',
    title: 'Riques d\'erreurs lors de la saisie manuelle des bons',
    category: 'Service en Salle',
    problemShort: 'En période de forte affluence, les bons manuscrits peuvent entraîner des erreurs de transmission en cuisine.',
    problemFull: 'Lors des coups de feu, l\'écriture manuscrite sur carnet et la transmission orale génèrent des erreurs de compréhension en cuisine et des oublis de consignes (cuisson, garnitures).',
    solutionTitle: 'Saisie digitale directe Table ➔ Cuisine (KDS)',
    solutionFull: 'Chaque table dispose de son identifiant QR. La commande est transmise automatiquement à l\'écran de cuisine avec le numéro de table exact et les instructions de préparation.',
    impactMetric: 'Réduction des erreurs de service',
    rseBadge: 'Sérénité et précision pour l\'équipe',
    icon: Users
  },
  {
    id: 'prob-waiting',
    number: '03',
    punchline: 'Consultation immédiate de la carte',
    title: 'Temps d\'attente initial pour accéder au menu',
    category: 'Expérience Client',
    problemShort: 'L\'attente pour obtenir la carte papier peut ralentir le démarrage du service et la rotation des tables.',
    problemFull: "L'attente initiale avant la prise en charge par un serveur peut créer de l'impatience chez les clients pressés et limiter le volume de clients servis sur un service.",
    solutionTitle: 'Accès instantané à la carte dès l\'installation',
    solutionFull: 'Dès son arrivée à table, le client flashe le QR code et consulte la carte sans délai. Il peut préparer sa commande rapidement, libérant du temps au personnel pour l\'accueil.',
    impactMetric: 'Vos serveurs se concentrent sur le service',
    rseBadge: 'Fluidité du parcours client',
    icon: Hourglass
  },
  {
    id: 'prob-stock',
    number: '04',
    punchline: 'Gestion des ruptures en temps réel',
    title: 'Indisponibilités de produits constatées après commande',
    category: 'Gestion des Stocks',
    problemShort: 'Informer un client qu\'un plat est en rupture après sa prise de commande détériore la qualité de service.',
    problemFull: 'Rien n\'est plus insatisfaisant pour un client que de choisir un plat pour apprendre quelques minutes plus tard que la cuisine n\'en dispose plus en réserve.',
    solutionTitle: 'Mise en rupture instantanée depuis le smartphone',
    solutionFull: 'Dès qu\'un plat est épuisé, vous cliquez sur "Indisponible" depuis votre tableau de bord. Le produit est automatiquement masqué ou indiqué indisponible sur l\'ensemble des cartes scannées.',
    impactMetric: 'Fini les plats épuisés annoncés trop tard',
    rseBadge: 'Gestion optimisée des stocks',
    icon: PackageX
  }
];

export const ProblemsSection: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>('prob-paper');
  const [activeTabMap, setActiveTabMap] = useState<{ [key: string]: 'solution' | 'problem' }>({
    'prob-paper': 'solution',
    'prob-errors': 'solution',
    'prob-waiting': 'solution',
    'prob-stock': 'solution'
  });

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const setTab = (id: string, tab: 'solution' | 'problem', e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTabMap(prev => ({ ...prev, [id]: tab }));
  };

  return (
    <section id="pourquoi" className="py-24 bg-slate-50/50 border-b border-slate-200/80 relative overflow-hidden">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-[#00A86B] block">
            Enjeux & Solutions
          </span>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Optimisez le déroulement de vos services au quotidien
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            Découvrez comment <strong className="text-slate-900">Lou Ame Tay ?</strong> répond aux 4 principaux défis opérationnels des établissements au Sénégal.
          </p>
        </motion.div>

        {/* 4 Interactive Accordion Cards */}
        <div className="mt-12 space-y-3 max-w-4xl mx-auto">
          {PROBLEMS_DATA.map((item, index) => {
            const isExpanded = expandedId === item.id;
            const activeTab = activeTabMap[item.id] || 'solution';
            const IconComp = item.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
                onClick={() => toggleExpand(item.id)}
                className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer ${
                  isExpanded
                    ? 'border-slate-300 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Card Header (Visible Always) */}
                <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700 shrink-0 shadow-xs">
                      <IconComp className="w-5 h-5" strokeWidth={1.75} />
                    </div>

                    {/* Title & Punchline */}
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-[#00A86B] uppercase tracking-wider block mb-0.5 truncate">
                        {item.punchline}
                      </span>
                      <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 leading-snug truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 hidden sm:block font-normal">
                        {item.problemShort}
                      </p>
                    </div>
                  </div>

                  {/* Impact Metric Pill & Chevron Toggle */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden md:inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                      <TrendingUp className="w-3.5 h-3.5 text-[#00A86B]" strokeWidth={1.75} />
                      {item.impactMetric}
                    </span>

                    <button
                      className={`p-2 rounded-lg transition-all ${
                        isExpanded
                          ? 'bg-slate-100 text-slate-900 rotate-180'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                      aria-label="Afficher les détails"
                    >
                      <ChevronDown className="w-5 h-5 transition-transform duration-200" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>

                {/* Collapsible Content Area */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-5 pb-6 sm:px-6 sm:pb-6 pt-0 border-t border-slate-100 bg-slate-50/50"
                    >
                      {/* Interactive Tab Selector (Before vs After) */}
                      <div className="pt-4 flex items-center justify-between gap-4 flex-wrap">
                        <div className="bg-slate-200/70 p-1 rounded-lg inline-flex text-xs font-semibold text-slate-700">
                          <button
                            onClick={(e) => setTab(item.id, 'solution', e)}
                            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 cursor-pointer ${
                              activeTab === 'solution'
                                ? 'bg-white text-slate-900 shadow-xs font-bold'
                                : 'hover:text-slate-900'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00A86B]" strokeWidth={2} />
                            <span>Solution Lou Ame Tay</span>
                          </button>
                          <button
                            onClick={(e) => setTab(item.id, 'problem', e)}
                            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 cursor-pointer ${
                              activeTab === 'problem'
                                ? 'bg-white text-slate-900 shadow-xs font-bold'
                                : 'hover:text-slate-900'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                            <span>Fonctionnement traditionnel</span>
                          </button>
                        </div>

                        <span className="text-xs text-slate-500 font-medium">
                          {item.rseBadge}
                        </span>
                      </div>

                      {/* Dynamic Tab Body Content */}
                      <div className="mt-4">
                        {activeTab === 'solution' ? (
                          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                            <h4 className="font-heading font-bold text-base text-slate-900">
                              {item.solutionTitle}
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                              {item.solutionFull}
                            </p>

                            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                              <span className="text-slate-500 font-medium flex items-center gap-1">
                                <ShieldCheck className="w-4 h-4 text-[#00A86B]" strokeWidth={1.75} />
                                Résultat : <strong className="text-slate-900 font-bold">{item.impactMetric}</strong>
                              </span>

                              <a
                                href="#demo-live"
                                className="text-[#00A86B] hover:text-[#008957] font-bold flex items-center gap-1 transition-colors"
                              >
                                <span>Découvrir cette fonction</span>
                                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-100 p-5 rounded-xl border border-slate-200 space-y-2">
                            <h4 className="font-heading font-bold text-base text-slate-800">
                              Contrainte actuelle
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                              {item.problemFull}
                            </p>
                          </div>
                        )}
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
