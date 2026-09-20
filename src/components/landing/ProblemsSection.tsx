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
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Flame
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
  gradientBg: string;
  iconBg: string;
  iconColor: string;
}

const PROBLEMS_DATA: ProblemItem[] = [
  {
    id: 'prob-paper',
    number: '01',
    punchline: '« Plus jamais de menu avec des prix raturés »',
    title: 'Menus papier tachés, déchirés et coûts de réimpression',
    category: 'Gestion de la carte',
    problemShort: 'Menus papier qui se salissent avec les sauces et nécessitent une réimpression coûteuse à chaque changement de tarif.',
    problemFull: 'En restaurant comme en hôtel, les cartes papier s\'abîment vite sous l\'effet du gras, du jus ou de l\'eau. De plus, chaque modification de prix ou d\'ingrédient oblige à réimprimer l\'intégralité des menus chez l\'imprimeur.',
    solutionTitle: 'Menu Digital dynamique mis à jour en 10 secondes',
    solutionFull: 'Votre carte est 100% numérique et accessible via QR code. Vous modifiez vos prix, ajoutez des visuels ou mettez en avant le plat du jour depuis votre smartphone en 10 secondes chrono. Vos clients voient toujours des prix nets et impeccables.',
    impactMetric: '0 FCFA de réimpression',
    rseBadge: 'Zéro papier jeté (Démarche Éco-Responsable)',
    icon: FileX,
    gradientBg: 'from-[#00A86B]/10 to-[#00A86B]/5',
    iconBg: 'bg-rose-100 border-rose-300',
    iconColor: 'text-rose-600'
  },
  {
    id: 'prob-errors',
    number: '02',
    punchline: '« Fini les serveurs qui se trompent de table en rush »',
    title: 'Inversions de commandes et bons papier illisibles',
    category: 'Service en Salle',
    problemShort: 'En plein rush du midi, les serveurs courent, perdent des carnets papier et inversent les assiettes entre tables.',
    problemFull: 'Lors des coups de feu, l\'écriture manuscrite sur les carnets génère des erreurs de compréhension en cuisine. Les préférences clients (sans piment, sauce à part, bien cuit) sont souvent oubliées.',
    solutionTitle: 'Transmission numérique directe Table ➡️ Cuisine (KDS)',
    solutionFull: 'Chaque table possède son QR code dédié. La commande passe instantanément du téléphone client à l\'écran cuisine avec le numéro de table exact et toutes les consignes de préparation. Moins de stress en salle, zéro confusion.',
    impactMetric: '-85% d\'erreurs de service',
    rseBadge: 'Qualité de service & sérénité de l\'équipe',
    icon: Users,
    gradientBg: 'from-[#FF6B00]/10 to-[#FF6B00]/5',
    iconBg: 'bg-amber-100 border-amber-300',
    iconColor: 'text-amber-700'
  },
  {
    id: 'prob-waiting',
    number: '03',
    punchline: '« Vos clients commandent, vous encaissez sans attente »',
    title: 'Attente interminable pour recevoir le menu et commander',
    category: 'Expérience Client',
    problemShort: 'Les clients poireautent 15 minutes avant qu\'un serveur n\'apporte le menu, ce qui ralentit la rotation des tables.',
    problemFull: 'L\'attente initiale pour obtenir le menu agace les clients pressés et réduit le nombre de personnes que vous pouvez servir pendant la pause déjeuner.',
    solutionTitle: 'Accès instantané au menu & prise de commande en 3 clics',
    solutionFull: 'Dès que le client s\'assied à sa table, il flashe le QR code et consulte le menu immédiatement. Il passe sa commande en quelques secondes, ce qui libère vos serveurs pour l\'accueil et l\'encaissement.',
    impactMetric: '+25% de rotation des tables',
    rseBadge: 'Fluidité & Bien-être client',
    icon: Hourglass,
    gradientBg: 'from-orange-500/10 to-orange-500/5',
    iconBg: 'bg-orange-100 border-orange-300',
    iconColor: 'text-orange-600'
  },
  {
    id: 'prob-stock',
    number: '04',
    punchline: '« Plus aucun client déçu par un plat épuisé »',
    title: 'Ruptures de stock découvertes après la commande',
    category: 'Gestion des Stocks',
    problemShort: 'Un client commande le Thiéboudienne, attend 10 minutes, puis le serveur revient annoncer qu\'il n\'y a plus de mérou.',
    problemFull: 'Rien n\'est plus frustrant pour un client que d\'attendre un plat qu\'il se réjouissait de déguster, pour apprendre tardivement que la cuisine est en rupture.',
    solutionTitle: 'Gestion des ruptures de stock en 1 clic sur mobile',
    solutionFull: 'Dès qu\'une assiette ou un ingrédient est épuisé, vous appuyez sur "Mettre en rupture" depuis votre téléphone. Le plat est automatiquement masqué ou grisé sur tous les menus scannés en salle.',
    impactMetric: 'Zéro déception client',
    rseBadge: 'Anti-Gaspillage Alimentaire RSE',
    icon: PackageX,
    gradientBg: 'from-red-500/10 to-red-500/5',
    iconBg: 'bg-red-100 border-red-300',
    iconColor: 'text-red-600'
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
    <section id="pourquoi" className="py-24 bg-gradient-to-b from-[#FAFAFA] via-white to-[#FAFAFA] border-b border-gray-100 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-[#00A86B]/5 rounded-full blur-3xl pointer-events-none -ml-40" />
      <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-[#FF6B00]/5 rounded-full blur-3xl pointer-events-none -mr-40" />

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF6B00] text-xs font-bold uppercase tracking-wider shadow-xs">
            <Flame className="w-4 h-4 text-[#FF6B00]" />
            <span>Frictions Terrain ➔ Solutions Concrètes</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A] tracking-tight leading-tight">
            Transformez les contraintes du papier en <span className="text-[#00A86B] relative inline-block">rentabilité <span className="absolute bottom-1 left-0 w-full h-2 bg-[#00A86B]/15 rounded-full" /></span>.
          </h2>

          <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed max-w-2xl mx-auto">
            Découvrez comment <strong className="text-[#1A1A1A]">Lou Ame Tay ?</strong> résout les 4 plus grands défis quotidiens des établissements de restauration, d'hôtellerie et du tourisme au Sénégal.
          </p>

          <p className="text-xs font-semibold text-gray-500 italic pt-1">
            👉 Cliquez sur une carte ci-dessous pour découvrir la solution et son impact métier :
          </p>
        </motion.div>

        {/* 4 Interactive Accordion Cards */}
        <div className="mt-12 space-y-4 max-w-5xl mx-auto">
          {PROBLEMS_DATA.map((item, index) => {
            const isExpanded = expandedId === item.id;
            const activeTab = activeTabMap[item.id] || 'solution';
            const IconComp = item.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => toggleExpand(item.id)}
                className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                  isExpanded
                    ? 'border-[#00A86B] shadow-xl shadow-[#00A86B]/10 ring-2 ring-[#00A86B]/20'
                    : 'border-gray-200/90 shadow-sm hover:border-[#00A86B]/40 hover:shadow-md'
                }`}
              >
                {/* Card Header (Visible Always) */}
                <div className="p-5 sm:p-7 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    {/* Number & Icon badge */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-black text-gray-400 font-mono hidden sm:inline">
                        {item.number}
                      </span>
                      <div className={`p-3 rounded-2xl border ${item.iconBg} ${item.iconColor} shadow-xs`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Title & Punchline */}
                    <div className="min-w-0">
                      <span className="text-[11px] font-black text-[#FF6B00] uppercase tracking-wider block mb-0.5 truncate">
                        {item.punchline}
                      </span>
                      <h3 className="font-heading font-extrabold text-base sm:text-xl text-gray-900 leading-snug truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 hidden sm:block">
                        {item.problemShort}
                      </p>
                    </div>
                  </div>

                  {/* Impact Metric Pill & Chevron Toggle */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden md:inline-flex items-center gap-1 text-xs font-extrabold text-[#00A86B] bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {item.impactMetric}
                    </span>

                    <button
                      className={`p-2.5 rounded-full transition-all ${
                        isExpanded
                          ? 'bg-[#00A86B] text-white shadow-md rotate-180'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      aria-label="Afficher les détails"
                    >
                      <ChevronDown className="w-5 h-5 transition-transform duration-300" />
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
                      transition={{ duration: 0.3 }}
                      className="px-5 pb-6 sm:px-7 sm:pb-8 pt-0 border-t border-gray-100 bg-[#FAFAFA]/70"
                    >
                      {/* Interactive Tab Selector (Before vs After) */}
                      <div className="pt-4 flex items-center justify-between gap-4 flex-wrap">
                        <div className="bg-gray-200/70 p-1 rounded-xl inline-flex text-xs font-bold text-gray-700">
                          <button
                            onClick={(e) => setTab(item.id, 'solution', e)}
                            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                              activeTab === 'solution'
                                ? 'bg-[#00A86B] text-white shadow-sm'
                                : 'hover:text-gray-900'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Avec Lou Ame Tay (Solution)</span>
                          </button>
                          <button
                            onClick={(e) => setTab(item.id, 'problem', e)}
                            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                              activeTab === 'problem'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'hover:text-gray-900'
                            }`}
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Méthode Papier (Problème)</span>
                          </button>
                        </div>

                        {/* RSE Badge */}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold">
                          <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                          {item.rseBadge}
                        </span>
                      </div>

                      {/* Dynamic Tab Body Content */}
                      <div className="mt-5">
                        {activeTab === 'solution' ? (
                          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-emerald-200 shadow-sm space-y-3">
                            <div className="flex items-center gap-2 text-[#00A86B]">
                              <Sparkles className="w-5 h-5" />
                              <h4 className="font-heading font-extrabold text-base sm:text-lg text-gray-900">
                                {item.solutionTitle}
                              </h4>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
                              {item.solutionFull}
                            </p>

                            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 text-xs">
                              <span className="text-gray-500 font-semibold flex items-center gap-1">
                                <ShieldCheck className="w-4 h-4 text-[#00A86B]" />
                                Gain mesuré : <strong className="text-[#00A86B] font-extrabold">{item.impactMetric}</strong>
                              </span>

                              <a
                                href="#demo-live"
                                className="bg-[#00A86B] hover:bg-[#00925d] text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02]"
                              >
                                <span>Tester cette fonction en direct</span>
                                <ArrowRight className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-rose-50/70 p-5 sm:p-6 rounded-2xl border border-rose-200 space-y-3">
                            <div className="flex items-center gap-2 text-rose-700">
                              <XCircle className="w-5 h-5" />
                              <h4 className="font-heading font-extrabold text-base sm:text-lg text-rose-950">
                                Friction actuelle du papier au quotidien
                              </h4>
                            </div>
                            <p className="text-xs sm:text-sm text-rose-900 font-normal leading-relaxed">
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

        {/* Bottom Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-14 max-w-4xl mx-auto bg-[#1A1A1A] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-gray-800"
        >
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider">Constat sur le terrain au Sénégal 🇸🇳</span>
            <p className="text-sm sm:text-base font-bold text-gray-200">
              « Un établissement réimprime sa carte 4 fois par an et perd 15% de CA lors des temps d'attente. »
            </p>
          </div>

          <a
            href="#calculateur"
            className="bg-[#00A86B] hover:bg-[#00925d] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shrink-0 shadow-lg transition-all flex items-center gap-2 hover:scale-[1.03]"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Calculer mes économies FCFA</span>
          </a>
        </motion.div>

      </div>
    </section>
  );
};
