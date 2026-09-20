import React from 'react';
import { motion } from 'framer-motion';
import { Globe, RefreshCw, Leaf, Award, ArrowRight } from 'lucide-react';

export const MissionSection: React.FC = () => {
  const missionPillars = [
    {
      id: 'pillar-1',
      icon: Globe,
      badge: 'Hospitalité',
      title: 'Levier Digital Universel',
      description: 'Offrir à chaque restaurateur, hôtelier et gérant du secteur CHRECA un outil simple et accessible.'
    },
    {
      id: 'pillar-2',
      icon: RefreshCw,
      badge: 'Efficacité',
      title: 'Réduction du Papier',
      description: 'Diminuer l\'usage des cartes papier imprimées et simplifier la transmission des commandes.'
    },
    {
      id: 'pillar-3',
      icon: Leaf,
      badge: 'Démarche RSE',
      title: 'Préservation de l\'Environnement',
      description: 'Contribuer à la réduction des déchets récurrents à travers une digitalisation sobre.'
    },
    {
      id: 'pillar-4',
      icon: Award,
      badge: 'Souveraineté Tech 🇸🇳',
      title: 'Conçu et hébergé au Sénégal',
      description: 'Une solution développée localement pour répondre précisément aux attentes du marché.'
    }
  ];

  return (
    <section id="vision-mission" className="py-24 bg-white border-b border-slate-200/80 relative overflow-hidden">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        
        {/* Main Banner / Headline */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto text-center space-y-3"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-[#00A86B] block">
            Engagement & Vision
          </span>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
            La transition digitale de la <span className="text-[#00A86B]">restauration</span> et de l'hôtellerie au Sénégal.
          </h2>

          <p className="text-base text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            <strong className="text-slate-900 font-bold">Lou Ame Tay ?</strong> est une solution SaaS développée au Sénégal pour accompagner la modernisation des établissements de restauration et de tourisme.
          </p>
        </motion.div>

        {/* 4 Pillars Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {missionPillars.map((pillar, index) => {
            const IconComp = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
                className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700 shadow-xs">
                      <IconComp className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    <span className="text-[10px] font-semibold uppercase text-slate-400">
                      {pillar.badge}
                    </span>
                  </div>

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

        {/* Commitment Statement Callout */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-14 max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 text-center"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-left space-y-1">
              <h4 className="font-heading font-bold text-base text-slate-900">
                Vous gérez un établissement au Sénégal ?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600">
                Découvrez comment déployer le menu digital dans votre restaurant.
              </p>
            </div>

            <a
              href="https://wa.me/221762312003?text=Bonjour%20Lou%20Ame%20Tay,%20je%20souhaite%20des%20informations%20pour%20mon%20%C3%A9tablissement."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#00A86B] hover:bg-[#008957] active:scale-98 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-colors shrink-0 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Contactez-nous sur WhatsApp</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
