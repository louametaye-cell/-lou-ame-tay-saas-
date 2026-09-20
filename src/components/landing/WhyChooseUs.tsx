import React from 'react';
import { 
  Check, 
  Flag, 
  Clock, 
  TrendingUp, 
  HeartHandshake, 
  Leaf, 
  X 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { COMPETITOR_COMPARISONS } from '@/components/landing/data/mockData';

export const WhyChooseUs: React.FC = () => {
  const pillars = [
    {
      icon: Flag,
      title: 'Conçu au Sénégal, pour le Sénégal',
      subtitle: 'Conçu localement',
      description: 'Menu QR code multilingue et tarifs FCFA adaptés aux habitudes locales.'
    },
    {
      icon: Clock,
      title: 'Vos serveurs se concentrent sur le service',
      subtitle: 'Efficacité opérationnelle',
      description: 'Moins de déplacements inutiles en salle et accueil chaleureux de vos clients.'
    },
    {
      icon: TrendingUp,
      title: 'Encaissez plus par table, sans effort',
      subtitle: 'Visuels & Suggestions',
      description: 'Photos de plats attrayantes qui incitent naturellement aux commandes complémentaires.'
    },
    {
      icon: HeartHandshake,
      title: 'Support local 7j/7',
      subtitle: 'Présence à Thiès & Dakar',
      description: 'Équipe locale disponible sur place et sur WhatsApp 7 jours sur 7.'
    },
    {
      icon: Leaf,
      title: 'Moins de papier, plus de marge',
      subtitle: 'Économie & Marge',
      description: 'Suppression des frais de réimpression et réduction de l\'usage du papier.'
    }
  ];

  return (
    <section id="pourquoi-nous" className="py-24 bg-slate-50/50 border-b border-slate-200/80 relative">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-[#00A86B] block">
            Accompagnement & Proximité
          </span>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Une présence locale à <span className="text-[#00A86B]">Thiès & Dakar</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Une solution pensée pour répondre aux exigences réelles des établissements de restauration et d'hôtellerie au Sénégal.
          </p>
        </motion.div>

        {/* Super Power Proximity Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-12 max-w-4xl mx-auto bg-[#064E3B] text-white rounded-2xl p-8 sm:p-10 shadow-sm relative overflow-hidden border border-emerald-900"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300 block">
                Notre différence : l'hyper-proximité
              </span>
              <h3 className="font-heading font-bold text-xl sm:text-2xl text-white leading-snug">
                Un accompagnement direct et humain dans votre établissement.
              </h3>
              <p className="text-sm text-emerald-100/90 leading-relaxed font-normal">
                Notre équipe intervient directement sur place pour la configuration, la création de vos cartes et la formation de votre personnel à Thiès, Dakar et sur la Petite Côte.
              </p>
            </div>

            <a
              href="https://wa.me/221762312003?text=Bonjour%20Lou%20Ame%20Tay,%20j'aimerais%20une%20présentation%20dans%20mon%20établissement."
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 bg-white hover:bg-slate-100 text-[#064E3B] font-bold text-sm px-6 py-3.5 rounded-xl transition-colors text-center cursor-pointer shadow-xs"
            >
              Prendre RDV sur place
            </a>
          </div>
        </motion.div>

        {/* 5 Pillars Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {pillars.map((pillar, idx) => {
            const IconComponent = pillar.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
                className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700 mb-4 shadow-xs">
                    <IconComponent className="w-5 h-5" strokeWidth={1.75} />
                  </div>

                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    {pillar.subtitle}
                  </span>
                  <h3 className="font-heading font-bold text-base text-slate-900 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Competitor Comparison Table */}
        <div className="mt-16 max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6 sm:p-8">
          <div className="mb-6">
            <h3 className="font-heading font-bold text-xl text-slate-900">
              Pourquoi choisir Lou Ame Tay ?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Comparatif factuel entre Lou Ame Tay, les plateformes distantes et le menu papier traditionnel.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[580px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-3.5 font-bold text-slate-700 w-1/3">Critère</th>
                  <th className="p-3.5 font-bold text-[#00A86B] text-center">
                    Lou Ame Tay 🇸🇳
                  </th>
                  <th className="p-3.5 font-medium text-slate-500 text-center">Plateformes distantes A</th>
                  <th className="p-3.5 font-medium text-slate-500 text-center">Logiciels en ligne B</th>
                  <th className="p-3.5 font-medium text-slate-500 text-center">Menu Papier classique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPETITOR_COMPARISONS.map((row, rIdx) => {
                  const isKdsRow = row.feature.includes('KDS') || row.feature.includes('Écran Cuisine');
                  return (
                    <tr key={rIdx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 text-slate-900 font-medium">
                        {row.feature}
                      </td>
                      <td className="p-3.5 text-[#00A86B] font-bold text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <div className="flex items-center justify-center gap-1">
                            <Check className="w-4 h-4 text-[#00A86B]" strokeWidth={2} />
                            <span>{String(row.louAmeTay)}</span>
                          </div>
                          {isKdsRow && (
                            <span className="text-emerald-700 italic text-xs block font-normal leading-tight mt-0.5">
                              Économie de 40 000 FCFA vs concurrents qui facturent le KDS en option.
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-500 text-center">
                        {isKdsRow ? (
                          <span className="text-red-600 text-xs bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md inline-block font-semibold">
                            {String(row.scaniFood)}
                          </span>
                        ) : (
                          String(row.scaniFood)
                        )}
                      </td>
                      <td className="p-3.5 text-slate-500 text-center">
                        {isKdsRow ? (
                          <span className="text-red-600 text-xs bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md inline-block font-semibold">
                            {String(row.xolalMenu)}
                          </span>
                        ) : (
                          String(row.xolalMenu)
                        )}
                      </td>
                      <td className="p-3.5 text-slate-400 text-center">
                        {String(row.menuPapier)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust numbers banner */}
        <div className="mt-12 max-w-4xl mx-auto bg-white rounded-2xl p-8 border border-slate-200 shadow-xs">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-heading font-extrabold text-slate-900">15 ans</div>
              <span className="text-xs text-slate-500 mt-1 block font-normal">D'expérience dans l'IT au Sénégal</span>
            </div>
            <div>
              <div className="text-3xl font-heading font-extrabold text-[#00A86B]">+45</div>
              <span className="text-xs text-slate-500 mt-1 block font-normal">Établissements accompagnés</span>
            </div>
            <div>
              <div className="text-3xl font-heading font-extrabold text-slate-900">0 FCFA</div>
              <span className="text-xs text-slate-500 mt-1 block font-normal">Coût de réimpression papier</span>
            </div>
            <div>
              <div className="text-3xl font-heading font-extrabold text-[#00A86B]">24h</div>
              <span className="text-xs text-slate-500 mt-1 block font-normal">Délai moyen de mise en service</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

