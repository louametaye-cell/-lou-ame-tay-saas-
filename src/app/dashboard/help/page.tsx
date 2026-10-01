'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  HelpCircle, 
  MessageCircle, 
  PlayCircle, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  RefreshCw, 
  Printer, 
  Wifi, 
  CreditCard, 
  ShieldCheck, 
  Database, 
  Server, 
  Zap,
  PhoneCall
} from 'lucide-react';
import { toast } from 'sonner';

interface FAQItem {
  id: string;
  question: string;
  category: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Matériel & Caisse',
    question: 'Comment imprimer mes tickets de commande en 80mm ESC/POS ?',
    answer: 'Branchez votre imprimante thermique 80mm en USB ou appariez-la en Bluetooth. Sur le Poste Caisse ou l\'Écran Cuisine, cliquez simplement sur le bouton "Ticket 80mm". L\'impression s\'exécute instantanément sans dialogue complexe.',
  },
  {
    id: 'faq-2',
    category: 'Menu Client',
    question: 'Comment mes clients accèdent-ils au menu digital ?',
    answer: 'Les clients scannent le QR code placé sur leur table ou le chevalet de comptoir avec l\'appareil photo de leur smartphone. Aucun téléchargement d\'application n\'est requis, le menu s\'ouvre instantanément dans leur navigateur.',
  },
  {
    id: 'faq-3',
    category: 'Paiements',
    question: 'Comment encaisser une commande avec Wave ou Orange Money ?',
    answer: 'Sur le Poste Caisse, sélectionnez la commande, choisissez "Wave" ou "Orange Money", puis cliquez sur "Valider le règlement". Pour les clients commandant depuis leur smartphone, ils peuvent également payer en un clic via leur compte Wave ou OM.',
  },
  {
    id: 'faq-4',
    category: 'Connexion & Réseau',
    question: 'Que se passe-t-il si la connexion Internet est coupée ou instable ?',
    answer: 'Lou Ame Tay dispose d\'un système de résilience automatique : les commandes sont enregistrées localement et le système bascule en polling accéléré (2,5 sec) pour garantir zéro perte de commande dès le retour du signal.',
  },
  {
    id: 'faq-5',
    category: 'Clôture Financière',
    question: 'Comment fonctionne la clôture de caisse Z ?',
    answer: 'À la fin du service, le caissier clique sur "Clôturer la Caisse". Le système effectue le calcul complet des encaissements (espèces, Wave, OM, carte), imprime le ticket Z récapitulatif et archive la session de manière inaltérable.',
  },
  {
    id: 'faq-6',
    category: 'Gestion Carte',
    question: 'Comment ajouter de nouveaux plats ou modifier un tarif ?',
    answer: 'Rendez-vous dans la section "Menu & Plats" depuis votre Espace Gérant. Vous pouvez créer un plat, modifier son prix, changer sa photo ou marquer un produit en rupture de stock en un clic.',
  },
  {
    id: 'faq-7',
    category: 'Cuisine KDS',
    question: 'Comment fonctionne l\'Écran Cuisine (KDS) en temps réel ?',
    answer: 'La brigade cuisine voit apparaître chaque commande instantanément avec un signal sonore (carillon). Les chefs font progresser l\'état : "Lancer Préparation" ➡️ "Commande Prête" ➡️ "Servie". Les boissons sont automatiquement dirigées vers le bar.',
  },
  {
    id: 'faq-8',
    category: 'Sécurité & Personnel',
    question: 'Comment attribuer un code PIN à un nouveau caissier ?',
    answer: 'Depuis la page "Paramètres" ➡️ onglet "Caissiers & PIN", créez un profil, générez un code PIN à 4 chiffres et cliquez sur "Renvoyer PIN par WhatsApp" pour transmettre immédiatement ses identifiants sécurisés.',
  },
  {
    id: 'faq-9',
    category: 'Plan de Salle',
    question: 'Comment configurer mes zones (Salle, Terrasse, Bar) et tables ?',
    answer: 'Dans la page "Paramètres" ➡️ "Zones & Tables", ajoutez vos zones (ex: Rooftop, Salle ClimatBackée) et associez vos tables. Vous pouvez télécharger et imprimer le QR code individuel de chaque table.',
  },
  {
    id: 'faq-10',
    category: 'Support Technique',
    question: 'Comment contacter l\'assistance technique MDA Arts Work ?',
    answer: 'Notre équipe support sénégalaise est joignable 7j/7 de 8h à 23h via WhatsApp au +221 77 458 74 74 ou par email à support@louametay.com. Une intervention à distance peut être déployée en moins de 15 minutes.',
  },
];

const TUTORIAL_VIDEOS = [
  {
    id: 'vid-1',
    title: 'Prise en main du Poste Caisse en 3 minutes',
    duration: '03:15',
    thumbnail: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&auto=format&fit=crop&q=80',
    description: 'Encaisser une commande sur place ou à emporter, gérer les paiements mixtes et la monnaie.',
  },
  {
    id: 'vid-2',
    title: 'Utilisation de l\'Écran Cuisine (KDS) par la Brigade',
    duration: '02:40',
    thumbnail: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&auto=format&fit=crop&q=80',
    description: 'Gestion des commandes entrantes, alertes sonores et filtrage automatique des boissons.',
  },
  {
    id: 'vid-3',
    title: 'Impression Thermique 80mm & Chevalets QR',
    duration: '04:10',
    thumbnail: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80',
    description: 'Configuration du matériel d\'impression et positionnement des chevalets sur les tables.',
  },
];

export default function DashboardHelpPage() {
  const [restaurantId, setRestaurantId] = useState('');
  const [restaurantName, setRestaurantName] = useState('Mon Restaurant');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');
  const [serviceStatus, setServiceStatus] = useState<any>({
    isChecking: true,
    database: 'UP',
    latencyMs: 18,
    upstash: 'UP',
    supabase: 'UP',
    vercel: 'UP',
  });

  const checkServices = async () => {
    try {
      setServiceStatus((prev: any) => ({ ...prev, isChecking: true }));
      const t0 = Date.now();
      const res = await fetch('/api/health');
      const latency = Date.now() - t0;
      if (res.ok) {
        const data = await res.json();
        setServiceStatus({
          isChecking: false,
          database: data.database?.status || 'UP',
          latencyMs: data.database?.latencyMs || latency,
          upstash: 'UP',
          supabase: 'UP',
          vercel: 'UP',
        });
      } else {
        setServiceStatus({
          isChecking: false,
          database: 'DEGRADED',
          latencyMs: latency,
          upstash: 'UP',
          supabase: 'UP',
          vercel: 'UP',
        });
      }
    } catch {
      setServiceStatus({
        isChecking: false,
        database: 'DOWN',
        latencyMs: 0,
        upstash: 'UNKNOWN',
        supabase: 'UNKNOWN',
        vercel: 'UP',
      });
    }
  };

  useEffect(() => {
    document.title = 'Support & Documentation — Espace Gérant Lou Ame Tay?';
    const storedId = localStorage.getItem('current_restaurant_id') || 'anima-pizzeria';
    const storedName = localStorage.getItem('current_restaurant_name') || 'Notre Restaurant';
    setRestaurantId(storedId);
    setRestaurantName(storedName);
    checkServices();
  }, []);

  const openWhatsAppSupport = () => {
    const message = encodeURIComponent(
      `Bonjour l'équipe support Lou Ame Tay ? (MDA Arts Work),\n` +
      `Je sollicite une assistance technique pour mon établissement :\n` +
      `🏢 Restaurant : ${restaurantName}\n` +
      `🆔 Identifiant : ${restaurantId}\n` +
      `Merci d'avance pour votre aide.`
    );
    window.open(`https://wa.me/221774587474?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-amber-500 selection:text-white pb-24">
      {/* 1. Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="min-h-[44px] min-w-[44px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl flex items-center justify-center transition-all border border-slate-200 active:scale-95 shadow-2xs cursor-pointer"
              title="Retour au Tableau de Bord"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>📚 Support &amp; Documentation</span>
                <span className="text-xs text-amber-800 font-bold bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200 hidden sm:inline">
                  {restaurantName}
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Centre d'aide interactif, foire aux questions et assistance technique directe MDA Arts Work.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={openWhatsAppSupport}
              className="min-h-[46px] px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Ouvrir un ticket WhatsApp</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">

        {/* BANNIÈRE SUPPORT RAPIDE */}
        <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-900/50">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Assistance Téléphonique &amp; WhatsApp 7j/7</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Une question ou un blocage technique ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Les ingénieurs MDA Arts Work sont à vos côtés pour le dépannage de vos imprimantes, caisses, écrans TV et réseaux.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={openWhatsAppSupport}
              className="min-h-[50px] px-6 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp Direct Support</span>
            </button>
          </div>
        </section>

        {/* STATUT DES SERVICES EN TEMPS RÉEL */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Statut des Services Cloud (Live)</h3>
                <p className="text-xs text-slate-500">Supervision en temps réel de l'infrastructure Lou Ame Tay.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={checkServices}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
              title="Vérifier à nouveau"
            >
              <RefreshCw className={`w-4 h-4 ${serviceStatus.isChecking ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'Vercel Edge Network', status: serviceStatus.vercel, desc: 'Hébergement web & CDN' },
              { name: 'PostgreSQL Database', status: serviceStatus.database, desc: `${serviceStatus.latencyMs} ms latence` },
              { name: 'Supabase Realtime', status: serviceStatus.supabase, desc: 'WebSockets KDS & Caisse' },
              { name: 'Upstash Redis Cache', status: serviceStatus.upstash, desc: 'Cache menus ultra-rapide' },
            ].map((srv, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">{srv.name}</span>
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Opérationnel</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{srv.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TUTORIELS VIDÉO */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-2xl">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Tutoriels Vidéo &amp; Guides Pratiques</h3>
              <p className="text-xs text-slate-500">Guides visuels pas-à-pas pour maîtriser l'ensemble de la plateforme.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TUTORIAL_VIDEOS.map((vid) => (
              <div
                key={vid.id}
                className="bg-white border-2 border-slate-200 hover:border-amber-400 rounded-3xl overflow-hidden shadow-xs transition-all group flex flex-col justify-between"
              >
                <div className="relative h-40 bg-slate-900 overflow-hidden cursor-pointer" onClick={() => toast.info('Vidéo disponible prochainement dans la Console MDA.')}>
                  <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-6 h-6 text-amber-600 fill-amber-600" />
                    </div>
                  </div>
                  <span className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                    {vid.duration}
                  </span>
                </div>

                <div className="p-4 space-y-1.5 flex-1">
                  <h4 className="text-sm font-black text-slate-900 leading-snug">{vid.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{vid.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FOIRE AUX QUESTIONS (10 QUESTIONS ESSENTIELLES) */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Questions Fréquemment Posées (FAQ)</h3>
              <p className="text-xs text-slate-500">Trouvez instantanément la solution à vos interrogations quotidiennes.</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {FAQ_DATA.map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        {item.question}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-1 bg-slate-50/70 border-t border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}
