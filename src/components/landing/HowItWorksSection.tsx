import React, { useState } from 'react';
import { 
  QrCode, 
  Smartphone, 
  ChefHat, 
  LayoutDashboard, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Bell, 
  Sparkles, 
  Flame,
  Layers,
  Settings,
  DollarSign
} from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const [activeScreenTab, setActiveScreenTab] = useState<'client' | 'dashboard' | 'cuisine' | 'superadmin'>('client');

  const screensInfo = [
    {
      id: 'client' as const,
      icon: Smartphone,
      title: '📱 Menu Client',
      badge: 'Expérience Client',
      shortDesc: 'Le client scanne, voit le menu, commande en 3 clics',
      fullDesc: 'Une application web ultra-fluide qui ne nécessite aucun téléchargement. Compatible avec tous les smartphones (iOS et Android), elle affiche les photos en haute définition, les ingrédients en français/wolof et les options personnalisées.',
      keyPoints: [
        'Accessible via QR code sur la table sans téléchargement',
        'Photos appétissantes des plats et boissons du Sénégal',
        'Choix des suppléments (piment doux, sauces, cuisson de viande)',
        'Validation de panier et choix de paiement (sur place ou Wave)'
      ],
      previewColor: 'from-emerald-500/10 to-teal-500/10'
    },
    {
      id: 'dashboard' as const,
      icon: LayoutDashboard,
      title: '🖥️ Dashboard Restaurateur',
      badge: 'Gestion Simplifiée',
      shortDesc: 'Gérez votre menu, vos prix, vos promotions et le plat du jour',
      fullDesc: 'Votre espace de pilotage accessible depuis votre propre téléphone ou ordinateur. Changez le tarif d\'un plat en 2 secondes, activez le « Thieb du Jour », ajoutez une promotion spéciale Tabaski ou Korité, et suivez votre chiffre d\'affaires.',
      keyPoints: [
        'Modification instantanée des prix et des descriptions',
        'Activation du « Plat du Jour » en 1 clic le matin',
        'Bouton de mise en rupture immédiate des plats épuisés',
        'Historique des ventes par journée et statistiques'
      ],
      previewColor: 'from-blue-500/10 to-indigo-500/10'
    },
    {
      id: 'cuisine' as const,
      icon: ChefHat,
      title: '👨‍🍳 Écran Cuisine (KDS)',
      badge: 'Cuisine & Fourneaux',
      shortDesc: 'Les commandes arrivent en temps réel avec la table et l\'heure',
      fullDesc: 'Installez une tablette ou un écran dans la cuisine ou au niveau du grill. Chaque nouvelle commande émet un signal sonore doux et s\'affiche avec le numéro de table bien lisible, les annotations du client et le décompte du temps.',
      keyPoints: [
        'Sonnette automatique à chaque nouvelle commande',
        'Numéro de table affiché en gros caractères',
        'Statuts en 1 clic : Reçu ➔ En préparation ➔ Prêt à servir',
        'Réduction drastique des malentendus et des oublis'
      ],
      previewColor: 'from-amber-500/10 to-orange-500/10'
    },
    {
      id: 'superadmin' as const,
      icon: Building2,
      title: '🏢 Super Admin Multi-sites',
      badge: 'Pour l\'Agence & Chaînes',
      shortDesc: 'Gérez tous vos points de vente en un seul lieu centralisé',
      fullDesc: 'Idéal pour les gérants possédant plusieurs restaurants (ex: Dakar Almadies + Thiès + Saly) ou pour notre équipe d\'accompagnement technique. Vue d\'ensemble de tous les établissements, permissions par serveur et exports comptables.',
      keyPoints: [
        'Gestion multi-restaurants et multi-terrasses',
        'Contrôle d\'accès pour les serveurs et les cuisiniers',
        'Rapports d\'activité consolidés pour la comptabilité',
        'Assistance technique à distance par nos experts'
      ],
      previewColor: 'from-purple-500/10 to-fuchsia-500/10'
    }
  ];

  const activeScreen = screensInfo.find(s => s.id === activeScreenTab)!;

  return (
    <section id="comment-ca-marche" className="py-20 bg-[#F8F9FA] border-b border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-green-50 text-[#00A86B] px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-green-200/60">
            <span>Simplicité absolue</span>
          </div>
          
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
            Comment fonctionne <span className="text-[#00A86B]">Lou Ame Tay ?</span>
          </h2>
          
          <p className="text-base sm:text-lg text-gray-500 font-normal leading-relaxed">
            En 3 clics, vos clients commandent depuis leur table. La commande arrive directement en cuisine. 
            Simple, rapide et sans contact inutile.
          </p>
        </div>

        {/* 3 Core Steps Process Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-7 border border-gray-200 shadow-xs relative group hover:border-[#00A86B] transition-all">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-[#00A86B] flex items-center justify-center font-black text-xl mb-6">
              1️⃣
            </div>
            <span className="text-xs font-extrabold text-[#00A86B] tracking-wider uppercase block mb-1">
              Étape 1 : Le client s'assoit
            </span>
            <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">
              Il scanne le QR Code
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Posé sur la table (autocollant ou chevalet rigide). L'appareil photo ouvre la carte en 1 seconde. Aucune application à installer.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-7 border border-gray-200 shadow-xs relative group hover:border-[#FF6B00] transition-all">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center font-black text-xl mb-6">
              2️⃣
            </div>
            <span className="text-xs font-extrabold text-[#FF6B00] tracking-wider uppercase block mb-1">
              Étape 2 : Il choisit avec envie
            </span>
            <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">
              Il compose son repas
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Photos alléchantes, prix en FCFA, descriptions des plats locaux et suggestions de boissons fraîches (Bissap, Bouye, sodas).
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-7 border border-gray-200 shadow-xs relative group hover:border-[#00A86B] transition-all">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-[#00A86B] flex items-center justify-center font-black text-xl mb-6">
              3️⃣
            </div>
            <span className="text-xs font-extrabold text-[#00A86B] tracking-wider uppercase block mb-1">
              Étape 3 : Le service démarre
            </span>
            <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">
              La commande file en cuisine
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Le cuisinier ou le gérant reçoit la commande avec le numéro exact de table. Les plats sont préparés sans le moindre malentendu.
            </p>
          </div>

        </div>

        {/* Section The 4 Main Screens (Ecrans de la solution) */}
        <div className="mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900">
              Les 4 écrans de la solution <span className="text-[#FF6B00]">clé en main</span>
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Une technologie complète pour chaque maillon de votre restaurant : du client jusqu'à vos comptes.
            </p>
          </div>

          {/* Screen Tabs Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {screensInfo.map((tab) => {
              const TabIcon = tab.icon;
              const isCurrent = activeScreenTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveScreenTab(tab.id)}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isCurrent
                      ? 'bg-white border-[#00A86B] shadow-md ring-2 ring-[#00A86B]/20'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${isCurrent ? 'bg-[#00A86B] text-white' : 'bg-gray-100 text-gray-700'}`}>
                      <TabIcon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      isCurrent ? 'bg-green-50 text-[#00A86B]' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm sm:text-base text-gray-900">{tab.title}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{tab.shortDesc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Screen Interactive Showcase Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Screen Description Details */}
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-green-50 text-[#00A86B] text-xs font-bold border border-green-200">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{activeScreen.badge}</span>
                  </div>
                  <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900">
                    {activeScreen.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {activeScreen.fullDesc}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                    Points forts de cet écran :
                  </span>
                  {activeScreen.keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#00A86B] shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-gray-700 font-medium">{point}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <a
                    href="#demo-live"
                    className="inline-flex items-center gap-2 text-sm font-bold text-white bg-[#00A86B] hover:bg-[#00925d] px-6 py-3 rounded-xl shadow-md shadow-[#00A86B]/20 transition-all"
                  >
                    <span>Tester cet écran en direct</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Screen Visual Live Representation */}
              <div className="lg:col-span-6">
                <div className="bg-[#1A1A1A] rounded-2xl p-4 sm:p-6 text-white shadow-xl border border-gray-800">
                  
                  {/* Mockup browser top-bar */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800 text-xs text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                      <span className="ml-2 font-mono text-[11px] text-gray-400">app.louametay.sn/{activeScreenTab}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Connecté 🟢
                    </span>
                  </div>

                  {/* Dynamic Interactive Body according to Screen */}
                  {activeScreenTab === 'client' && (
                    <div className="space-y-3 bg-[#242424] p-4 rounded-xl border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-white">Chez Fatou & Frères - Thiès</span>
                          <span className="text-[10px] text-gray-400 block">Table #03 • Scanné à 13h14</span>
                        </div>
                        <span className="bg-[#00A86B] text-[11px] font-bold px-2 py-1 rounded text-white">Menu Actif</span>
                      </div>
                      
                      <div className="space-y-2 pt-2">
                        <div className="bg-[#2D2D2D] p-2.5 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🥘</span>
                            <div>
                              <p className="text-xs font-bold">Thiéboudienne Rouge Penda Mbaye</p>
                              <p className="text-[10px] text-gray-400">Option: Piment traditionnel</p>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-[#FF6B00]">3 500 FCFA</span>
                        </div>

                        <div className="bg-[#2D2D2D] p-2.5 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🧃</span>
                            <div>
                              <p className="text-xs font-bold">Jus de Bissap Glacé Menthe</p>
                              <p className="text-[10px] text-gray-400">Grand format 50cl</p>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-[#FF6B00]">800 FCFA</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-gray-700 text-xs">
                        <span className="text-gray-300">Total panier</span>
                        <span className="font-extrabold text-white text-sm">4 300 FCFA</span>
                      </div>
                    </div>
                  )}

                  {activeScreenTab === 'dashboard' && (
                    <div className="space-y-3 bg-[#242424] p-4 rounded-xl border border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Gestion du Menu en Direct</span>
                        <span className="text-[10px] bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded">Restauration Active</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-[#2D2D2D] p-2.5 rounded-lg">
                          <span className="text-[10px] text-gray-400 block">Plat du Jour</span>
                          <span className="font-bold text-emerald-400">Dibi d'Agneau Braisé</span>
                        </div>
                        <div className="bg-[#2D2D2D] p-2.5 rounded-lg">
                          <span className="text-[10px] text-gray-400 block">Tables Occupées</span>
                          <span className="font-bold text-amber-400">11 / 15 tables</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-[#2D2D2D] rounded-lg flex items-center justify-between text-xs">
                        <span>Gestion Rupture : Thiéboudienne</span>
                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                          En Stock (Clic pour couper)
                        </span>
                      </div>
                    </div>
                  )}

                  {activeScreenTab === 'cuisine' && (
                    <div className="space-y-3 bg-[#242424] p-4 rounded-xl border border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                          <Bell className="w-3.5 h-3.5 animate-bounce text-amber-400" />
                          Nouvelle Commande Reçue !
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">13:21 (Il y a 1 min)</span>
                      </div>

                      <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-extrabold text-white text-sm bg-amber-600 px-2 py-0.5 rounded">
                            TABLE #05
                          </span>
                          <span className="text-amber-300 font-bold">2 articles</span>
                        </div>
                        <ul className="text-xs text-gray-200 space-y-1 pl-1">
                          <li>• 1x Yassa Poulet (Riz blanc bien chaud)</li>
                          <li>• 1x Portion Pastels (Sauce forte séparée)</li>
                        </ul>
                      </div>

                      <div className="flex gap-2 text-xs">
                        <button className="flex-1 bg-[#00A86B] text-white py-1.5 rounded-lg font-bold">
                          ✓ Passer en Préparation
                        </button>
                        <button className="bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg font-bold">
                          Prêt
                        </button>
                      </div>
                    </div>
                  )}

                  {activeScreenTab === 'superadmin' && (
                    <div className="space-y-3 bg-[#242424] p-4 rounded-xl border border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Vue Multi-Restaurants Sénégal</span>
                        <span className="text-[10px] bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded">3 Sites Actifs</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-2 bg-[#2D2D2D] rounded-lg flex justify-between items-center">
                          <span>📍 Restaurant Dakar Almadies</span>
                          <span className="font-bold text-emerald-400">142 500 FCFA ajd</span>
                        </div>
                        <div className="p-2 bg-[#2D2D2D] rounded-lg flex justify-between items-center">
                          <span>📍 Grill & Lounge Thiès</span>
                          <span className="font-bold text-emerald-400">98 000 FCFA ajd</span>
                        </div>
                        <div className="p-2 bg-[#2D2D2D] rounded-lg flex justify-between items-center">
                          <span>📍 Paillote Saly Mbour</span>
                          <span className="font-bold text-emerald-400">185 000 FCFA ajd</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
