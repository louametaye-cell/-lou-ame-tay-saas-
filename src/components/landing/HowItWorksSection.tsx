import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ScanLine, 
  Utensils, 
  ChefHat, 
  Smartphone, 
  LayoutDashboard, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Bell, 
  Check, 
  MapPin, 
  UtensilsCrossed, 
  Coffee 
} from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const [activeScreenTab, setActiveScreenTab] = useState<'client' | 'dashboard' | 'cuisine' | 'superadmin'>('client');

  const screensInfo = [
    {
      id: 'client' as const,
      icon: Smartphone,
      title: 'Menu Client',
      badge: 'Interface Client',
      shortDesc: 'Consultation du menu et commande sur smartphone',
      fullDesc: 'Application web ultra-fluide sans aucun téléchargement requis. Compatible avec tous les smartphones (iOS et Android), elle présente les plats avec visuels HD, détails d\'ingrédients et options de personnalisation.',
      keyPoints: [
        'Accès direct via QR code sur table sans application',
        'Présentation claire des plats, spécialités et boissons',
        'Choix des options et suppléments (cuisson, garnitures)',
        'Validation de la commande avec choix de règlement'
      ]
    },
    {
      id: 'dashboard' as const,
      icon: LayoutDashboard,
      title: 'Dashboard Restaurateur',
      badge: 'Gestion Centralisée',
      shortDesc: 'Pilotage des cartes, des tarifs et des stocks',
      fullDesc: 'Espace d\'administration accessible depuis smartphone, tablette ou ordinateur. Permet de modifier les tarifs en quelques secondes, de mettre en avant le plat du jour et de gérer les disponibilités.',
      keyPoints: [
        'Mise à jour immédiate des tarifs et descripteurs',
        'Mise en avant facile des suggestions du jour',
        'Gestion en un clic des indisponibilités de stock',
        'Suivi statistique de l\'activité et des ventes'
      ]
    },
    {
      id: 'cuisine' as const,
      icon: ChefHat,
      title: 'Écran Cuisine (KDS)',
      badge: 'Écran Brigade',
      shortDesc: 'Réception des commandes en temps réel',
      fullDesc: 'Écran tactile ou tablette installé en zone de préparation. Les nouvelles commandes s\'affichent automatiquement avec l\'identification de la table, l\'heure et les instructions particulières.',
      keyPoints: [
        'Alerte sonore discrète lors de chaque commande',
        'Affichage lisible des numéros de table',
        'Mise à jour des statuts (Reçu ➔ En cours ➔ Prêt)',
        'Réduction des erreurs de transmission'
      ]
    },
    {
      id: 'superadmin' as const,
      icon: Building2,
      title: 'Super Admin Multi-sites',
      badge: 'Gestion Multi-établissements',
      shortDesc: 'Supervision centralisée de plusieurs points de vente',
      fullDesc: 'Solution adaptée aux groupes et chaînes d\'établissements (ex: Dakar, Thiès, Saly). Vue consolidée des performances, gestion centralisée des accès et exportations comptables.',
      keyPoints: [
        'Pilotage multi-sites et multi-terrasses',
        'Gestion des droits d\'accès par rôle',
        'Rapports d\'activité financiers consolidés',
        'Support et assistance technique dédiés'
      ]
    }
  ];

  const activeScreen = screensInfo.find(s => s.id === activeScreenTab)!;

  return (
    <section id="comment-ca-marche" className="py-24 bg-white border-b border-slate-200/80 relative overflow-hidden">
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
            Fonctionnement Global
          </span>
          
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Comment fonctionne <span className="text-[#00A86B]">Lou Ame Tay ?</span>
          </h2>
          
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Une transmission fluide et instantanée depuis la table du client jusqu'à la cuisine.
          </p>
        </motion.div>

        {/* 3 Core Steps Process Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {/* Step 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700 font-bold shadow-xs">
                <ScanLine className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <span className="text-xs font-bold text-slate-400 font-mono">01</span>
            </div>
            
            <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
              Le client scanne le QR Code
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Posé sur la table (chevalet ou sticker vinyle). L'appareil photo ouvre la carte instantanément sans téléchargement.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700 font-bold shadow-xs">
                <Utensils className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <span className="text-xs font-bold text-slate-400 font-mono">02</span>
            </div>

            <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
              Il choisit ses plats
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Consultation des catégories, des visuels HD, des détails d'ingrédients et sélection des boissons et suppléments.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700 font-bold shadow-xs">
                <ChefHat className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <span className="text-xs font-bold text-slate-400 font-mono">03</span>
            </div>

            <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
              La commande arrive en cuisine
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Le cuisinier ou le gérant reçoit les détails avec le numéro exact de table et les consignes particulières.
            </p>
          </motion.div>

        </div>

        {/* Section The 4 Main Screens (Ecrans de la solution) */}
        <div className="mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-2xl mx-auto mb-10"
          >
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
              Les 4 interfaces de la plateforme
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Un système complet adapté à chaque intervenant de votre établissement.
            </p>
          </motion.div>

          {/* Screen Tabs Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {screensInfo.map((tab) => {
              const TabIcon = tab.icon;
              const isCurrent = activeScreenTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveScreenTab(tab.id)}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    isCurrent
                      ? 'bg-white border-[#00A86B] shadow-xs ring-1 ring-[#00A86B]/30'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${isCurrent ? 'bg-[#00A86B] text-white' : 'bg-slate-100 text-slate-700'}`}>
                      <TabIcon className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                    <span className="text-[10px] font-semibold uppercase text-slate-500">
                      {tab.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-slate-900">{tab.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{tab.shortDesc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Screen Interactive Showcase Card */}
          <motion.div 
            key={activeScreenTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Screen Description Details */}
              <div className="lg:col-span-6 space-y-5">
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#00A86B] block">
                    {activeScreen.badge}
                  </span>
                  <h3 className="font-heading text-2xl font-bold text-slate-900">
                    {activeScreen.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-normal">
                    {activeScreen.fullDesc}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Fonctionnalités clés :
                  </span>
                  {activeScreen.keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#00A86B] shrink-0 mt-0.5" strokeWidth={1.75} />
                      <span className="text-xs sm:text-sm text-slate-700 font-medium">{point}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <a
                    href="#demo-live"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-[#00A86B] hover:bg-[#008957] px-5 py-2.5 rounded-xl transition-colors shadow-xs"
                  >
                    <span>Voir la démonstration</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                  </a>
                </div>
              </div>

              {/* Screen Visual Live Representation */}
              <div className="lg:col-span-6">
                <div className="bg-slate-900 rounded-xl p-4 sm:p-5 text-white shadow-xs border border-slate-800">
                  
                  {/* Mockup browser top-bar */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                      <span className="ml-2 font-mono text-[11px] text-slate-400">app.louametay.sn/{activeScreenTab}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      ● Actif
                    </span>
                  </div>

                  {/* Dynamic Interactive Body according to Screen */}
                  {activeScreenTab === 'client' && (
                    <div className="space-y-3 bg-slate-800/80 p-4 rounded-lg border border-slate-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-white">Chez Fatou & Frères</span>
                          <span className="text-[10px] text-slate-400 block">Table #03 • Thiès</span>
                        </div>
                        <span className="bg-[#00A86B] text-[10px] font-bold px-2 py-0.5 rounded text-white">Menu Actif</span>
                      </div>
                      
                      <div className="space-y-2 pt-2">
                        <div className="bg-slate-800 p-2.5 rounded flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UtensilsCrossed className="w-4 h-4 text-amber-500 shrink-0" strokeWidth={1.75} />
                            <div>
                              <p className="text-xs font-bold">Thiéboudienne Rouge</p>
                              <p className="text-[10px] text-slate-400">Piment doux</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-200">3 500 FCFA</span>
                        </div>

                        <div className="bg-slate-800 p-2.5 rounded flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Coffee className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={1.75} />
                            <div>
                              <p className="text-xs font-bold">Jus de Bissap Glacé</p>
                              <p className="text-[10px] text-slate-400">50cl</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-200">800 FCFA</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-700 text-xs">
                        <span className="text-slate-400">Total panier</span>
                        <span className="font-bold text-white text-sm">4 300 FCFA</span>
                      </div>
                    </div>
                  )}

                  {activeScreenTab === 'dashboard' && (
                    <div className="space-y-3 bg-slate-800/80 p-4 rounded-lg border border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Gestion du Menu</span>
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">Supervision</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-800 p-2.5 rounded">
                          <span className="text-[10px] text-slate-400 block">Suggestion du jour</span>
                          <span className="font-bold text-emerald-400">Dibi d'Agneau</span>
                        </div>
                        <div className="bg-slate-800 p-2.5 rounded">
                          <span className="text-[10px] text-slate-400 block">Tables en service</span>
                          <span className="font-bold text-slate-200">11 / 15 tables</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-800 rounded flex items-center justify-between text-xs">
                        <span>Thiéboudienne : Disponibilité</span>
                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                          En Stock
                        </span>
                      </div>
                    </div>
                  )}

                  {activeScreenTab === 'cuisine' && (
                    <div className="space-y-3 bg-slate-800/80 p-4 rounded-lg border border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                          <Bell className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.75} />
                          Nouvelle Commande
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">13:21</span>
                      </div>

                      <div className="p-3 bg-slate-800 border border-slate-700 rounded space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white text-xs bg-slate-700 px-2 py-0.5 rounded">
                            TABLE #05
                          </span>
                          <span className="text-slate-300">2 articles</span>
                        </div>
                        <ul className="text-xs text-slate-300 space-y-1 pl-1 font-mono">
                          <li>• 1x Yassa Poulet</li>
                          <li>• 1x Portion Pastels</li>
                        </ul>
                      </div>

                      <div className="flex gap-2 text-xs">
                        <button className="flex-1 bg-[#00A86B] text-white py-1.5 rounded font-bold flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5" strokeWidth={2} />
                          <span>Préparation</span>
                        </button>
                        <button className="bg-slate-700 text-slate-300 px-3 py-1.5 rounded font-medium">
                          Terminé
                        </button>
                      </div>
                    </div>
                  )}

                  {activeScreenTab === 'superadmin' && (
                    <div className="space-y-3 bg-slate-800/80 p-4 rounded-lg border border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Supervision Multi-établissements</span>
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">3 Sites</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-2 bg-slate-800 rounded flex justify-between items-center">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                            <span>Dakar Almadies</span>
                          </span>
                          <span className="font-bold text-slate-200">142 500 FCFA</span>
                        </div>
                        <div className="p-2 bg-slate-800 rounded flex justify-between items-center">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                            <span>Thiès Centre</span>
                          </span>
                          <span className="font-bold text-slate-200">98 000 FCFA</span>
                        </div>
                        <div className="p-2 bg-slate-800 rounded flex justify-between items-center">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                            <span>Saly Portudal</span>
                          </span>
                          <span className="font-bold text-slate-200">185 000 FCFA</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
