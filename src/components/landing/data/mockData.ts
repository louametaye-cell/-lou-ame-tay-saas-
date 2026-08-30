import { MenuItem, ProblemSolution, PricingPlan, Testimonial, FaqItem, LiveOrder, ProspectItem, CustomerJourneyStep, CompetitorComparison, CommercialAgent } from '../types';

export const COMMERCIAL_AGENTS: CommercialAgent[] = [
  {
    id: 'comm-1',
    name: 'Moussa Diop',
    email: 'moussa.diop@louametay.sn',
    phone: '+221 77 654 32 10',
    zone: 'Thiès & Environs (Centre, Dixième, Randoulène)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'commercial',
    targetClients: 12,
    commissionRate: 20,
    accessPin: '7721',
    slug: 'moussa-diop',
    directToken: 'tok_md_thies_2026'
  },
  {
    id: 'comm-2',
    name: 'Awa Ndiaye',
    email: 'awa.ndiaye@louametay.sn',
    phone: '+221 78 876 54 32',
    zone: 'Dakar (Almadies, Plateau, Point E, Ngor)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    role: 'commercial',
    targetClients: 15,
    commissionRate: 20,
    accessPin: '7854',
    slug: 'awa-ndiaye',
    directToken: 'tok_an_dakar_2026'
  },
  {
    id: 'comm-3',
    name: 'Cheikh Fall',
    email: 'cheikh.fall@louametay.sn',
    phone: '+221 76 543 21 09',
    zone: 'Petite Côte (Saly, Mbour, Somone, Ngaparou)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    role: 'commercial',
    targetClients: 10,
    commissionRate: 20,
    accessPin: '7632',
    slug: 'cheikh-fall',
    directToken: 'tok_cf_saly_2026'
  },
  {
    id: 'admin-1',
    name: 'Super Administrateur',
    email: 'direction@louametay.sn',
    phone: '+221 77 654 32 10',
    zone: 'National (Sénégal)',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    role: 'admin',
    targetClients: 50,
    commissionRate: 0,
    accessPin: '9900',
    slug: 'admin-direction',
    directToken: 'tok_super_admin_2026'
  }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'thieb-penda',
    name: 'Thiéboudienne Penda Mbaye',
    category: 'plats',
    price: 3500,
    description: 'Riz rouge sénégalais au mérou royal, légumes frais (carotte, manioc, chou, diakhatou), beugëdj et netétou traditionnel.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isDailySpecial: true,
    preparationTime: '10-15 min',
    popular: true,
    options: [
      { name: 'Piment', choices: ['Doux', 'Pimenté traditionnel', 'Sans piment'] }
    ]
  },
  {
    id: 'yassa-poulet',
    name: 'Yassa Poulet Braisé Fermier',
    category: 'plats',
    price: 3000,
    description: 'Cuisse de poulet mariné au citron vert de Casamance, oignons caramélisés et moutarde de Dijon, servi avec riz blanc parfumé.',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    preparationTime: '15 min',
    popular: true
  },
  {
    id: 'dibi-agneau',
    name: 'Dibi d\'Agneau Grillé Thiès',
    category: 'grillades',
    price: 4500,
    description: 'Morceaux tendres d\'agneau braisés au feu de bois avec sel assaisonné, oignons émincés piquants et moutarde.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isDailySpecial: true,
    preparationTime: '20 min',
    popular: true
  },
  {
    id: 'mafe-viande',
    name: 'Mafé Viande de Bœuf Fondant',
    category: 'plats',
    price: 2800,
    description: 'Sauce onctueuse à la pâte d\'arachide grillée, tubercules de patates douces et morceaux de bœuf mijotés.',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    preparationTime: '10 min'
  },
  {
    id: 'pastels-thon',
    name: 'Portion de Pastels au Poisson (x6)',
    category: 'entrees',
    price: 1500,
    description: 'Chaussons croustillants dorés farcis au poisson assaisonné, accompagnés de la fameuse sauce tomate douce & pimentée.',
    image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    preparationTime: '5 min',
    popular: true
  },
  {
    id: 'jus-bissap',
    name: 'Jus de Bissap Maison Menthe',
    category: 'boissons',
    price: 800,
    description: 'Infusion fraîche de fleurs d\'hibiscus rouge du Sénégal, parfumée aux feuilles de menthe fraîche et fleur d\'oranger.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    preparationTime: '2 min',
    popular: true
  },
  {
    id: 'jus-bouye',
    name: 'Jus de Bouye Onctueux (Pain de Singe)',
    category: 'boissons',
    price: 1000,
    description: 'Pulpe naturelle de fruit de baobab mixée au lait frais, touche de vanille des îles et sucre de canne.',
    image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    preparationTime: '2 min'
  },
  {
    id: 'thiakry',
    name: 'Thiakry / Dégué Douceur',
    category: 'desserts',
    price: 1200,
    description: 'Couscous de mil fermenté à la vapeur nappé de yaourt sucré onctueux, muscade, raisins et lait concentré.',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    preparationTime: '2 min'
  }
];

export const INITIAL_LIVE_ORDERS: LiveOrder[] = [
  {
    id: 'CMD-104',
    tableNumber: 4,
    customerName: 'Client Table 4',
    items: [
      { name: 'Thiéboudienne Penda Mbaye', quantity: 2, price: 3500, notes: 'Sans piment fort' },
      { name: 'Jus de Bissap Maison Menthe', quantity: 2, price: 800 }
    ],
    totalAmount: 8600,
    status: 'en_preparation',
    timestamp: 'Il y a 3 min',
    paymentMethod: 'Sur place (Espèces/Wave)'
  },
  {
    id: 'CMD-103',
    tableNumber: 7,
    customerName: 'Client Table 7',
    items: [
      { name: 'Dibi d\'Agneau Grillé Thiès', quantity: 1, price: 4500, notes: 'Bien cuit avec beaucoup d\'oignons' },
      { name: 'Portion de Pastels au Poisson', quantity: 1, price: 1500 },
      { name: 'Jus de Bouye Onctueux', quantity: 1, price: 1000 }
    ],
    totalAmount: 7000,
    status: 'pret',
    timestamp: 'Il y a 11 min',
    paymentMethod: 'Wave Direct'
  },
  {
    id: 'CMD-102',
    tableNumber: 2,
    customerName: 'Client Table 2',
    items: [
      { name: 'Yassa Poulet Braisé Fermier', quantity: 1, price: 3000 },
      { name: 'Thiakry / Dégué Douceur', quantity: 1, price: 1200 }
    ],
    totalAmount: 4200,
    status: 'servi',
    timestamp: 'Il y a 24 min',
    paymentMethod: 'Sur place (Espèces/Wave)'
  }
];

export const PROBLEMS_AND_SOLUTIONS: ProblemSolution[] = [
  {
    id: 'prob-1',
    punchline: '« Plus jamais de menu avec des prix raturés »',
    title: 'Menus papier déchirés, tachés et prix raturés',
    problem: 'Vos menus papier se salissent avec les sauces, se déchirent et coûtent une fortune à chaque fois que vous réimprimez pour ajuster un prix.',
    solution: 'Votre menu digital se met à jour en 10 secondes depuis votre téléphone. Vos prix sont toujours nets, sans rature ni réimpression.',
    iconName: 'FileX',
    impactMetric: '0 FCFA de frais d\'impression'
  },
  {
    id: 'prob-2',
    punchline: '« Fini les serveurs qui se trompent de table »',
    title: 'Serveurs qui confondent les tables au rush',
    problem: 'En plein rush du midi, les serveurs courent, inversent les assiettes entre tables ou oublient les précisions (sans piment, sauce à part).',
    solution: 'Chaque table possède son QR code dédié. La commande arrive numérotée en cuisine avec les préférences exactes saisies par le client.',
    iconName: 'Users',
    impactMetric: '-85% d\'erreurs de service'
  },
  {
    id: 'prob-3',
    punchline: '« Vos clients commandent, vous encaissez »',
    title: 'Attente interminable pour avoir la carte',
    problem: 'Les clients poireautent 15 minutes avant que quelqu\'un vienne apporter la carte, ce qui fait fuir les plus pressés et bloque vos tables.',
    solution: 'Dès qu\'ils s\'assoient, ils scannent le QR code, bavent devant les photos de vos grillades et passent commande en 3 clics chrono.',
    iconName: 'Clock',
    impactMetric: 'Gain de 15 min par table'
  },
  {
    id: 'prob-4',
    punchline: '« Plus de client déçu par un plat épuisé »',
    title: 'Ruptures de stock découvertes trop tard',
    problem: 'Un client commande le Thiéboudienne, attend 10 minutes, puis le serveur revient penaud annoncer qu\'il n\'y a plus de mérou.',
    solution: 'D\'un simple clic sur votre téléphone, marquez le plat épuisé. Il disparaît instantanément de la carte de tous les clients assis.',
    iconName: 'AlertCircle',
    impactMetric: 'Zéro déception client'
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Formule STARTER',
    badge: 'Menu Consultation',
    priceMonthly: 15000,
    priceAnnualMonthly: 12500,
    popular: false,
    description: 'Idéal pour cafés, glaciers, petits maquis et fast-foods de quartier.',
    features: [
      { text: 'Menu digital interactif HD accessible par QR Code', included: true, highlight: true },
      { text: 'Photos illimitées des plats en haute définition', included: true },
      { text: 'Bouton gestion des ruptures de stock en 1 clic (5s)', included: true, highlight: true },
      { text: 'QR codes uniques par table ou comptoir', included: true },
      { text: 'Assistance technique et support 7j/7', included: true },
      { text: 'Envoi direct des commandes en cuisine / bar', included: false },
      { text: 'Gestion multi-zones (salle, terrasse, piscine)', included: false }
    ],
    ctaText: 'Choisir la Formule Starter',
    ctaType: 'trial'
  },
  {
    id: 'pro',
    name: 'Formule PRO',
    badge: 'Recommandée',
    priceMonthly: 25000,
    priceAnnualMonthly: 20833,
    popular: true,
    description: 'Idéal pour restaurants traditionnels, grillades, dibiteries et pizzerias.',
    features: [
      { text: 'Tout le contenu de la formule Starter', included: true, highlight: true },
      { text: 'Envoi des commandes directes à la cuisine & au bar', included: true, highlight: true },
      { text: 'Écran Cuisine (KDS) avec alertes sonores de commande', included: true, highlight: true },
      { text: 'Gestion dynamique des tables et du plan de salle', included: true, highlight: true },
      { text: 'Statistiques de vente et de fréquentation en temps réel', included: true },
      { text: 'Affichage Wave & Orange Money direct pour encaissement', included: true },
      { text: 'Gestion multi-zones (salle, terrasse, piscine)', included: false }
    ],
    ctaText: 'Choisir la Formule Pro (Recommandée)',
    ctaType: 'trial'
  },
  {
    id: 'premium',
    name: 'Formule PREMIUM',
    badge: 'Multi-espaces & Hôtels',
    priceMonthly: 45000,
    priceAnnualMonthly: 37500,
    popular: false,
    description: 'Idéal pour hôtels, complexes touristiques, lounges VIP et plages.',
    features: [
      { text: 'Tout le contenu de la formule Pro', included: true, highlight: true },
      { text: 'Gestion multi-zones (Salle, Terrasse, Piscine, Room-Service)', included: true, highlight: true },
      { text: 'Menu bilingue automatique (Français / Anglais)', included: true, highlight: true },
      { text: 'Statistiques avancées par zone et export comptable', included: true, highlight: true },
      { text: 'Accompagnement VIP dédié & shooting photo saisonnier', included: true, highlight: true },
      { text: 'Assistance prioritaire 7j/7 avec déplacement sur place', included: true }
    ],
    ctaText: 'Choisir la Formule Premium',
    ctaType: 'quote'
  }
];

export const PRICING_OPTIONS = {
  extraTables: {
    title: 'Option Tables Supplémentaires',
    price: 5000,
    unit: '5 tables supplémentaires',
    description: 'Idéal si vous avez une terrasse ou plus de 25 tables en salle.'
  },
  launchPack: {
    title: 'Pack Lancement Spécial',
    discountPrice: 15000,
    normalPrice: 25000,
    spotsRemaining: 4,
    description: 'Réservé aux 10 premiers restaurateurs inscrits ce mois-ci : bénéficiez de l\'Offre Premium complète au tarif de l\'Offre Essentielle (15 000 FCFA/mois à vie) + Shooting photo offert !'
  }
};

export const PROSPECTS_DATA: ProspectItem[] = [
  {
    id: 'p-1',
    restaurantName: 'Chez Fatou & Frères',
    contactName: 'Fatou Diop',
    phone: '+221 77 123 45 67',
    city: 'Thiès (Dixième)',
    status: 'gagne',
    tablesCount: 12,
    lastContactDate: '24/08/2026',
    nextActionDate: '28/08/2026',
    nextActionNote: 'Passer vérifier le bon usage de l\'écran cuisine après 4 jours',
    interestPlan: 'premium',
    assignedCommercialId: 'comm-1',
    assignedCommercialName: 'Moussa Diop',
    priority: 'haute',
    notes: 'Cliente très satisfaite, souhaite recommander à 2 confrères à Thiès.'
  },
  {
    id: 'p-2',
    restaurantName: 'Le Teranga Grill',
    contactName: 'Chef Ibrahima Ndiaye',
    phone: '+221 78 456 78 90',
    city: 'Dakar (Almadies)',
    status: 'gagne',
    tablesCount: 20,
    lastContactDate: '22/08/2026',
    nextActionDate: '29/08/2026',
    nextActionNote: 'Envoi du rapport de ventes hebdomadaire sur WhatsApp',
    interestPlan: 'premium',
    assignedCommercialId: 'comm-2',
    assignedCommercialName: 'Awa Ndiaye',
    priority: 'haute',
    notes: 'Grand restaurant de grillades, abonnement Premium annuel validé.'
  },
  {
    id: 'p-3',
    restaurantName: 'Dibiterie Centrale Thiès',
    contactName: 'Mamadou Ba',
    phone: '+221 76 333 22 11',
    city: 'Thiès (Randoulène)',
    status: 'en_negociation',
    tablesCount: 8,
    lastContactDate: '25/08/2026',
    nextActionDate: '27/08/2026',
    nextActionNote: 'Rendez-vous démo avec les serveurs à 11h',
    interestPlan: 'essentielle',
    assignedCommercialId: 'comm-1',
    assignedCommercialName: 'Moussa Diop',
    priority: 'haute',
    notes: 'Intéressé surtout par la commande rapide sans attendre le carnet.'
  },
  {
    id: 'p-4',
    restaurantName: 'L\'Oasis de Saly',
    contactName: 'Awa Sène',
    phone: '+221 77 888 99 00',
    city: 'Saly Portudal',
    status: 'gagne',
    tablesCount: 16,
    lastContactDate: '20/08/2026',
    nextActionDate: '30/08/2026',
    nextActionNote: 'Proposer l\'option parrainage pour un confrère à Mbour',
    interestPlan: 'premium',
    assignedCommercialId: 'comm-3',
    assignedCommercialName: 'Cheikh Fall',
    priority: 'moyenne',
    notes: 'Touristes et clientèle locale, menu bilingue apprécié.'
  },
  {
    id: 'p-5',
    restaurantName: 'Fast-Food Le Baobab',
    contactName: 'Ousmane Cissé',
    phone: '+221 70 555 44 33',
    city: 'Thiès (Avenue Caen)',
    status: 'a_relancer',
    tablesCount: 6,
    lastContactDate: '18/08/2026',
    nextActionDate: '28/08/2026',
    nextActionNote: 'Relancer avec l\'argument du Pack Lancement à 15 000 FCFA',
    interestPlan: 'essentielle',
    assignedCommercialId: 'comm-1',
    assignedCommercialName: 'Moussa Diop',
    priority: 'moyenne',
    notes: 'A hésité sur le tarif, le Pack Lancement va débloquer la vente.'
  },
  {
    id: 'p-6',
    restaurantName: 'Restaurant Le Djolof',
    contactName: 'Khady Fall',
    phone: '+221 77 999 11 22',
    city: 'Dakar (Point E)',
    status: 'contacte',
    tablesCount: 14,
    lastContactDate: '26/08/2026',
    nextActionDate: '28/08/2026',
    nextActionNote: 'Envoyer la vidéo de démo de 2 min sur WhatsApp',
    interestPlan: 'premium',
    assignedCommercialId: 'comm-2',
    assignedCommercialName: 'Awa Ndiaye',
    priority: 'normale',
    notes: 'Demande si l\'impression des chevalets QR est comprise.'
  },
  {
    id: 'p-7',
    restaurantName: 'La Pergola Gourmande',
    contactName: 'Patrick Gomis',
    phone: '+221 78 222 33 44',
    city: 'Mbour',
    status: 'en_negociation',
    tablesCount: 18,
    lastContactDate: '23/08/2026',
    nextActionDate: '29/08/2026',
    nextActionNote: 'Devis pour 18 tables + shooting photo des poissons braisés',
    interestPlan: 'premium',
    assignedCommercialId: 'comm-3',
    assignedCommercialName: 'Cheikh Fall',
    priority: 'haute',
    notes: 'Gros potentiel de recommandation sur le front de mer.'
  },
  {
    id: 'p-8',
    restaurantName: 'Café & Pastels Thiès',
    contactName: 'Aminata Ndao',
    phone: '+221 76 111 88 99',
    city: 'Thiès (Centre-ville)',
    status: 'a_relancer',
    tablesCount: 5,
    lastContactDate: '15/08/2026',
    nextActionDate: '27/08/2026',
    nextActionNote: 'Lui proposer 14 jours d\'essai gratuit sans engagement',
    interestPlan: 'essentielle',
    assignedCommercialId: 'comm-1',
    assignedCommercialName: 'Moussa Diop',
    priority: 'moyenne',
    notes: 'Petite structure très fréquentée le matin et à 16h.'
  }
];

export const CUSTOMER_JOURNEY_STEPS: CustomerJourneyStep[] = [
  {
    id: 'j-0',
    dayLabel: 'Jour J (J0)',
    dayNumber: 0,
    title: 'Installation & Formation sur place',
    objective: 'Poser les QR codes, tester la cuisine et former les serveurs en 15 minutes chrono.',
    channel: 'Sur place',
    messageTemplate: 'Bonjour [Nom_Gerant] ! C\'est l\'équipe Lou Ame Tay. Vos QR codes sont posés et votre cuisine est connectée. Toute l\'équipe est formée. Bon service pour ce midi ! On reste en veille sur WhatsApp si besoin.'
  },
  {
    id: 'j-3',
    dayLabel: 'Jour 3 (J3)',
    dayNumber: 3,
    title: 'Check-up de satisfaction',
    objective: 'S\'assurer que les serveurs ont le réflexe et lever les petits doutes.',
    channel: 'WhatsApp',
    messageTemplate: 'Bonjour [Nom_Gerant] ! 👋 Comment se sont passés les 3 premiers jours avec le menu QR Code ? Les clients apprécient ? Avez-vous besoin d\'ajuster un prix ou un plat ? On est là !'
  },
  {
    id: 'j-7',
    dayLabel: 'Jour 7 (J7)',
    dayNumber: 7,
    title: 'Bilan de la première semaine',
    objective: 'Montrer la valeur avec les chiffres concrets (scans, commandes, gain de temps).',
    channel: 'WhatsApp',
    messageTemplate: '📊 Bilan Semaine 1 pour [Nom_Restaurant] :\n• 342 scans de menu enregistrés\n• Plat le plus commandé : [Plat_Star]\n• Temps estimé gagné par vos serveurs : 6 heures !\nBravo à toute l\'équipe ! 🚀'
  },
  {
    id: 'j-15',
    dayLabel: 'Jour 15 (J15)',
    dayNumber: 15,
    title: 'Fin d\'essai gratuit & Validation',
    objective: 'Confirmer la satisfaction et basculer sur l\'abonnement mensuel sans friction.',
    channel: 'WhatsApp',
    messageTemplate: 'Bonjour [Nom_Gerant], vos 14 jours d\'essai gratuit arrivent à terme ! Vu les résultats positifs, souhaitez-vous activer votre abonnement mensuel ? Règlement simple par Wave ou Orange Money sur facture.'
  },
  {
    id: 'j-30',
    dayLabel: 'Jour 30 (J30)',
    dayNumber: 30,
    title: 'Offre Parrainage (1 mois offert)',
    objective: 'Transformer le client satisfait en ambassadeur auprès de son réseau de restaurateurs.',
    channel: 'WhatsApp',
    messageTemplate: '🎁 Offre Spéciale Ambassadeur :\nRecommandez Lou Ame Tay à un confrère restaurateur à Thiès ou Dakar. Dès son installation, vous gagnez 1 mois d\'abonnement 100% offert !'
  },
  {
    id: 'j-45',
    dayLabel: 'Jour 45 (J45)',
    dayNumber: 45,
    title: 'Relance et fidélisation continue',
    objective: 'Reconduire l\'abonnement et proposer de nouvelles photos de plats saisonniers.',
    channel: 'WhatsApp',
    messageTemplate: 'Bonjour [Nom_Gerant] ! C\'est l\'heure du renouvellement mensuel pour [Nom_Restaurant]. Avez-vous de nouveaux plats à ajouter à la carte ce mois-ci ? Envoyez-nous juste la photo et le prix sur WhatsApp !'
  }
];

export const COMPETITOR_COMPARISONS: CompetitorComparison[] = [
  {
    feature: 'Proximité physique & intervention sur place',
    louAmeTay: 'Oui (Basés à Thiès & Dakar, déplacement en 30 min)',
    scaniFood: 'Non (Support distant / plateforme en ligne)',
    xolalMenu: 'Non (Basé à distance)',
    menuPapier: 'Imprimeur distant',
    isHighlight: true
  },
  {
    feature: 'Séance photo professionnelle offerte sur place',
    louAmeTay: 'Oui (Inclus dans l\'Offre Premium)',
    scaniFood: 'Non (À faire soi-même)',
    xolalMenu: 'En supplément très cher',
    menuPapier: 'Non',
    isHighlight: true
  },
  {
    feature: 'Mise à jour du menu par simple message WhatsApp',
    louAmeTay: 'Oui (Envoyez la photo et le prix, on s\'occupe de tout)',
    scaniFood: 'Non (À faire soi-même sur PC)',
    xolalMenu: 'Non',
    menuPapier: 'Impossible sans réimprimer',
    isHighlight: true
  },
  {
    feature: 'Paiements acceptés au Sénégal',
    louAmeTay: 'Wave, Orange Money, Espèces sur facture',
    scaniFood: 'Carte bancaire obligatoire',
    xolalMenu: 'Virement / CB',
    menuPapier: 'Espèces',
    isHighlight: false
  },
  {
    feature: 'Tarif mensuel transparent',
    louAmeTay: '15 000 à 25 000 FCFA / mois',
    scaniFood: '14 900 FCFA + options',
    xolalMenu: '40 000+ FCFA',
    menuPapier: '30 000 à 60 000 FCFA / réimpression',
    isHighlight: false
  },
  {
    feature: 'Écran Cuisine (KDS) en direct inclus',
    louAmeTay: 'Inclus dès 15 000 FCFA',
    scaniFood: 'Non',
    xolalMenu: 'Option payante',
    menuPapier: 'Bons papier perdus',
    isHighlight: true
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'fatou',
    name: 'Fatou Diop',
    role: 'Gérante & Fondatrice',
    restaurant: 'Chez Fatou & Frères',
    city: 'Thiès (Quartier Dixième)',
    quote: 'Avec Lou Ame Tay, j\'ai gagné 2 heures par jour ! Les clients n\'attendent plus debout pour savoir ce qu\'il y a au menu. Les commandes tombent directes en cuisine, nos serveurs sont beaucoup plus détendus.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    metrics: '+35% de rapidité de service'
  },
  {
    id: 'ibrahima',
    name: 'Chef Ibrahima Ndiaye',
    role: 'Chef Propriétaire',
    restaurant: 'Le Teranga Grill & Lounge',
    city: 'Dakar (Almadies)',
    quote: 'Le ticket moyen a augmenté de 25% dès le premier mois. Pourquoi ? Parce que les clients voient les superbes photos de nos grillades et ajoutent spontanément des pastels, des jus de bissap et des desserts.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    metrics: '+25% de chiffre d\'affaires'
  },
  {
    id: 'awa',
    name: 'Awa Sène',
    role: 'Directrice d\'exploitation',
    restaurant: 'L\'Oasis & Restaurant Plage',
    city: 'Saly Portudal (Mbour)',
    quote: 'La gestion des ruptures en 1 clic a sauvé nos dimanches midi bondés. Dès que le mérou du Thieb est fini, on appuie sur le bouton et aucun client n\'est déçu. L\'assistance locale à Thiès est ultra réactive.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    metrics: '0 erreur de commande'
  }
];

export const FAQS: FaqItem[] = [
  {
    category: 'Général',
    question: 'Mes clients doivent-ils télécharger une application ?',
    answer: 'Non, absolument pas ! Vos clients scannent simplement le QR code avec l\'appareil photo de leur téléphone (iPhone ou Android). Le menu s\'ouvre instantanément dans leur navigateur sans rien installer.'
  },
  {
    category: 'Technique',
    question: 'Que se passe-t-il si la connexion internet est faible au restaurant ?',
    answer: 'Lou Ame Tay est optimisé pour les réseaux 3G/4G sénégalais (Orange, Free, Expresso). La page est ultra-légère (moins de 1 Mo) et se charge en moins de 2 secondes même avec une connexion ralentie.'
  },
  {
    category: 'Matériel',
    question: 'Comment sont fabriqués les QR codes pour les tables ?',
    answer: 'Nous vous fournissons des fichiers haute définition prêts à imprimer ou un pack de chevalets / autocollants étanches et lavables, conçus pour résister à l\'eau, au soleil et aux nettoyages fréquents de vos tables.'
  },
  {
    category: 'Paiement',
    question: 'Les clients peuvent-ils payer par Wave ou Orange Money ?',
    answer: 'Oui ! Vous pouvez afficher vos numéros marchands Wave et Orange Money directement à la fin de la commande, ou continuer d\'encaisser en espèces comme d\'habitude selon vos préférences.'
  },
  {
    category: 'Accompagnement',
    question: 'Qui m\'aide à créer mon menu la première fois ?',
    answer: 'Notre équipe locale basée à Thiès et Dakar s\'occupe de tout : nous venons chez vous ou saisissons vos plats, vos photos et configurons vos tables en moins de 24 heures.'
  },
  {
    category: 'Abonnement',
    question: 'Y a-t-il un engagement de durée ?',
    answer: 'Aucun engagement ! Vous pouvez arrêter votre abonnement quand vous le souhaitez. Vous bénéficiez de 14 jours d\'essai 100% gratuit sans carte bancaire pour tester la solution.'
  }
];
