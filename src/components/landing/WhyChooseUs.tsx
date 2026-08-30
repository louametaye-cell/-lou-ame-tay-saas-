import React from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Headphones, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Smartphone,
  Check,
  X,
  Building2
} from 'lucide-react';
import { COMPETITOR_COMPARISONS } from '@/components/landing/data/mockData';

export const WhyChooseUs: React.FC = () => {
  const pillars = [
    {
      icon: '🇸🇳',
      title: '100% Conçu pour le Sénégal',
      subtitle: 'Adapté aux réalités du terrain',
      description: 'Optimisé pour les connexions mobiles Orange, Free et Expresso. Affichage des prix en FCFA, devises locales, et intégration des habitudes de commande sénégalaises.',
      accent: 'border-green-200 bg-white'
    },
    {
      icon: '⏱️',
      title: 'Gain de temps spectaculaire',
      subtitle: 'Plus de va-et-vient inutiles',
      description: 'Vos serveurs ne passent plus leur temps à porter des menus physiques et à répéter les plats. Ils se concentrent sur un accueil chaleureux (Teranga) et le service.',
      accent: 'border-orange-200 bg-white'
    },
    {
      icon: '📈',
      title: 'Augmentation du ticket moyen',
      subtitle: '+25% de ventes additionnelles',
      description: 'Les clients sont tentés par les belles photos HD de vos grillades, pastels, jus de bissap et desserts maison. Ils commandent spontanément plus d\'extras.',
      accent: 'border-green-200 bg-white'
    },
    {
      icon: '🤝',
      title: 'Assistance locale & Proximité',
      subtitle: 'Basés à Thiès & Dakar',
      description: 'Pas de centre d\'appel à l\'autre bout du monde. Notre équipe se déplace dans votre restaurant pour former vos équipes et reste joignable 7j/7 sur WhatsApp.',
      accent: 'border-gray-200 bg-white'
    }
  ];

  return (
    <section id="pourquoi-nous" className="py-20 bg-[#F8F9FA] border-b border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-green-50 text-[#00A86B] px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-green-200/60">
            <span>Différenciation & Proximité</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
            Votre voisin de confiance à <span className="text-[#00A86B]">Thiès & Dakar</span>
          </h2>

          <p className="text-base sm:text-lg text-gray-500 font-normal leading-relaxed">
            15 ans d'expérience terrain en restauration et digitalisation à Thiès, Mbour, Saly et Dakar.
          </p>
        </div>

        {/* Super Power Proximity Banner */}
        <div className="mt-10 max-w-5xl mx-auto bg-gradient-to-r from-emerald-900 to-green-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/20 text-3xl">
              📍
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#00A86B] bg-white px-3 py-1 rounded-md inline-block">
                Notre Super-Pouvoir : L'Hyper-Proximité
              </span>
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
                « Nous ne sommes pas une startup à l'autre bout du monde. Nous sommes vos voisins à Thiès. »
              </h3>
              <p className="text-sm sm:text-base text-emerald-100 leading-relaxed font-normal">
                Si vous avez une question, un menu à modifier ou un nouveau serveur à former, nous venons directement vous aider en personne dans votre restaurant, pas au travers d'un formulaire impersonnel.
              </p>
            </div>

            <a
              href="https://wa.me/221776543210?text=Bonjour%20Lou%20Ame%20Tay,%20j'aimerais%20une%20visite%20dans%20mon%20restaurant."
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 bg-[#FF6B00] hover:bg-[#e05e00] active:scale-95 text-white font-bold text-sm px-6 py-4 rounded-xl shadow-lg transition-all text-center cursor-pointer"
            >
              Prendre RDV sur place
            </a>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className={`p-7 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${pillar.accent}`}
            >
              <div className="text-3xl mb-4">{pillar.icon}</div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
                {pillar.subtitle}
              </span>
              <h3 className="font-heading font-bold text-lg sm:text-xl text-gray-900 mb-2">
                {pillar.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>

        {/* Competitor Comparison Table */}
        <div className="mt-16 max-w-5xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-8">
          <div className="mb-6">
            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-gray-900">
              Pourquoi choisir Lou Ame Tay plutôt qu'une autre solution ?
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Comparatif direct entre Lou Ame Tay, les plateformes génériques distantes et le menu papier traditionnel.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="p-3.5 font-bold text-gray-700 w-1/3">Critère</th>
                  <th className="p-3.5 font-extrabold text-[#00A86B] bg-green-50/80 border-x border-green-200 text-center">
                    Lou Ame Tay 🇸🇳
                  </th>
                  <th className="p-3.5 font-semibold text-gray-500 text-center">Plateformes en ligne A</th>
                  <th className="p-3.5 font-semibold text-gray-500 text-center">Logiciels distants B</th>
                  <th className="p-3.5 font-semibold text-gray-500 text-center">Menu Papier classique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {COMPETITOR_COMPARISONS.map((row, rIdx) => (
                  <tr key={rIdx} className={row.isHighlight ? 'bg-emerald-50/20 font-medium' : 'hover:bg-gray-50/50'}>
                    <td className="p-3.5 text-gray-900 font-semibold flex items-center gap-1.5">
                      {row.isHighlight && <span className="text-[#00A86B]">★</span>}
                      <span>{row.feature}</span>
                    </td>
                    <td className="p-3.5 text-[#00A86B] font-bold bg-green-50/40 border-x border-green-100 text-center">
                      ✓ {String(row.louAmeTay)}
                    </td>
                    <td className="p-3.5 text-gray-600 text-center">
                      {String(row.scaniFood)}
                    </td>
                    <td className="p-3.5 text-gray-600 text-center">
                      {String(row.xolalMenu)}
                    </td>
                    <td className="p-3.5 text-gray-500 text-center">
                      {String(row.menuPapier)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust numbers banner */}
        <div className="mt-12 bg-white rounded-2xl p-8 border border-gray-200 shadow-xs">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-heading font-black text-[#00A86B]">15 ans</div>
              <span className="text-xs font-semibold text-gray-500 mt-1 block">D'expérience terrain au Sénégal</span>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-heading font-black text-[#FF6B00]">+45</div>
              <span className="text-xs font-semibold text-gray-500 mt-1 block">Restaurants & Fast-foods partenaires</span>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-heading font-black text-[#00A86B]">0 FCFA</div>
              <span className="text-xs font-semibold text-gray-500 mt-1 block">Frais de réimpression papier</span>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-heading font-black text-[#1A1A1A]">24h</div>
              <span className="text-xs font-semibold text-gray-500 mt-1 block">Délai moyen de mise en service</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

