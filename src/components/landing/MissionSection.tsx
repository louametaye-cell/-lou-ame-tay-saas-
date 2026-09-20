import React from 'react';
import { motion } from 'framer-motion';
import { Globe, RefreshCw, Leaf, Award, ArrowRight, ShieldCheck } from 'lucide-react';

export const MissionSection: React.FC = () => {
  const missionPillars = [
    {
      id: 'pillar-1',
      icon: Globe,
      iconBg: 'bg-emerald-50 text-[#00A86B] border border-emerald-200',
      badge: 'Hospitalité & CHRECA',
      title: 'Levier Digital Universel',
      description: 'Offrir à chaque restaurateur, hôtelier et acteur touristique du Sénégal un véritable tremplin vers le digital.',
      colorBorder: 'border-emerald-200 hover:border-[#00A86B]'
    },
    {
      id: 'pillar-2',
      icon: RefreshCw,
      iconBg: 'bg-amber-50 text-[#FF6B00] border border-amber-200',
      badge: 'Zéro Papier',
      title: 'Réduction du Papier',
      description: 'Réduire durablement l\'usage du papier dans le service quotidien et moderniser la prise de commande.',
      colorBorder: 'border-amber-200 hover:border-[#FF6B00]'
    },
    {
      id: 'pillar-3',
      icon: Leaf,
      iconBg: 'bg-teal-50 text-teal-600 border border-teal-200',
      badge: 'Éco-Responsable',
      title: 'Préservation de l\'Environnement',
      description: 'Contribuer à la préservation de l\'environnement à travers une digitalisation éthique et responsable.',
      colorBorder: 'border-teal-200 hover:border-teal-500'
    },
    {
      id: 'pillar-4',
      icon: Award,
      iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      badge: 'Souveraineté Tech 🇸🇳',
      title: 'Standards Internationaux',
      description: 'Démontrer qu\'une solution pensée et conçue au Sénégal rivalise avec les meilleurs logiciels mondiaux.',
      colorBorder: 'border-emerald-200 hover:border-[#00A86B]'
    }
  ];

  return (
    <section id="vision-mission" className="py-20 bg-gradient-to-b from-white via-[#F8F9FA] to-white border-b border-gray-100 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00A86B]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#FF6B00]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        
        {/* Main Banner / Headline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#00A86B] text-xs font-bold uppercase tracking-wider shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#00A86B]" />
            <span>Engagé pour le Sénégal 🇸🇳</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A] leading-tight tracking-tight">
            La transition digitale du secteur de la <span className="text-[#00A86B]">restauration</span>, de l'hôtellerie et du tourisme.
          </h2>

          <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed max-w-3xl mx-auto">
            <strong className="text-[#1A1A1A]">Lou Ame Tay ?</strong> est la plateforme SaaS 100% sénégalaise conçue pour accompagner la modernisation de notre hospitalité. 
            Face à un secteur encore largement dépendant du papier et des méthodes traditionnelles, nous portons une véritable campagne de digitalisation, pensée et conçue localement, pour et par les acteurs sénégalais.
          </p>
        </motion.div>

        {/* 4 Pillars Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {missionPillars.map((pillar, index) => {
            const IconComp = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white rounded-2xl p-6 border ${pillar.colorBorder} shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${pillar.iconBg} group-hover:scale-110 transition-transform shadow-xs`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="font-heading font-extrabold text-lg text-gray-900 mb-2">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center text-xs font-bold text-[#00A86B] group-hover:text-[#008957]">
                  <span>En savoir plus</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Commitment Statement Callout */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 max-w-4xl mx-auto bg-white border-2 border-emerald-500/20 rounded-2xl p-6 sm:p-8 shadow-lg text-center relative"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-left space-y-1">
              <h4 className="font-heading font-extrabold text-lg text-gray-900">
                Vous êtes restaurateur, hôtelier ou acteur du tourisme au Sénégal ?
              </h4>
              <p className="text-xs sm:text-sm text-gray-600">
                Rejoignez le mouvement de la digitalisation responsable et découvrez notre offre sur-mesure.
              </p>
            </div>

            <a
              href="https://wa.me/221762312003?text=Bonjour%20Lou%20Ame%20Tay,%20je%20souhaite%20m'associer%20%C3%A0%20la%20campagne%20de%20digitalisation%20au%20S%C3%A9n%C3%A9gal."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#00A86B] hover:bg-[#00925d] active:scale-95 text-white px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 flex items-center gap-2 hover:scale-[1.02]"
            >
              <span>Rejoindre la campagne 🇸🇳</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
