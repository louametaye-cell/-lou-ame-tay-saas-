export interface SalesPitchStep {
  id: string;
  stepNumber: number;
  title: string;
  duration: string;
  objective: string;
  action: string;
  frenchScript: string;
  wolofScript?: string;
  tips: string[];
}

export interface ObjectionHandler {
  id: string;
  objection: string;
  context: string;
  responseFr: string;
  responseWolof?: string;
  keyArguments: string[];
}

export interface OfficialPricingOffer {
  id: string;
  name: string;
  targetAudience: string;
  monthlyPrice: number; // in FCFA
  annualPrice: number; // in FCFA (2 months free)
  recommended?: boolean;
  keyFeatures: string[];
}

export interface InstallationPack {
  price: number; // 50,000 FCFA
  title: string;
  inclusions: string[];
}

export const OFFICIAL_INSTALLATION_PACK: InstallationPack = {
  price: 50000,
  title: 'Pack d\'Installation & Mise en Service Initiale',
  inclusions: [
    'Création et configuration du compte restaurant sécurisé.',
    'Saisie et intégration complète du menu existant (plats, catégories, photos, prix).',
    'Fourniture et impression de 15 à 25 supports de table personnalisés (chevalets rigides en plexiglas ou stickers vinyle haute résistance pelliculés anti-taches avec logo et QR codes uniques par numéro de table).',
    'Formation complète du gérant et de l\'équipe de salle / cuisine (30 minutes sur place à Thiès, Dakar, Saly ou en vidéo).'
  ]
};

export const OFFICIAL_OFFERS: OfficialPricingOffer[] = [
  {
    id: 'starter',
    name: 'Formule STARTER (Menu Consultation)',
    targetAudience: 'Cafés, Glaciers, Petits Maquis, Fast-foods de quartier',
    monthlyPrice: 15000,
    annualPrice: 150000,
    recommended: false,
    keyFeatures: [
      'Menu digital interactif HD complet accessible instantanément par QR Code',
      'Photos illimitées des plats en haute définition',
      'Bouton gestion des ruptures de stock en 1 clic (5 secondes)',
      'QR codes uniques par table',
      'Support technique et assistance 7j/7'
    ]
  },
  {
    id: 'pro',
    name: 'Formule PRO (Menu + Commande à Table)',
    targetAudience: 'Restaurants traditionnels, Grillades, Salons de thé, Pizzerias',
    monthlyPrice: 25000,
    annualPrice: 250000,
    recommended: true,
    keyFeatures: [
      'Tout le contenu de la formule STARTER',
      'Envoi des commandes directes de la table vers la cuisine / bar / comptoir',
      'Écran Cuisine (KDS) en direct avec alertes sonores de nouvelle commande',
      'Gestion dynamique des tables et du plan de salle',
      'Statistiques de vente et de fréquentation en temps réel'
    ]
  },
  {
    id: 'premium',
    name: 'Formule PREMIUM (Multi-espaces & Hôtels)',
    targetAudience: 'Hôtels, Complexes touristiques, Plages, Lounges VIP',
    monthlyPrice: 45000,
    annualPrice: 450000,
    recommended: false,
    keyFeatures: [
      'Tout le contenu de la formule PRO',
      'Gestion multi-zones (Salle principale, Terrasse, Piscine, Plage, Room-Service)',
      'Menu multilingue automatique (Français / Anglais)',
      'Statistiques avancées, segmentation des ventes par espace & export comptable',
      'Accompagnement VIP dédié & shooting photo saisonnier'
    ]
  }
];

export const SALES_PITCH_STEPS: SalesPitchStep[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    title: 'La Prise de Contact & Brise-glace',
    duration: '30 secondes',
    objective: 'Identifier le décideur (Gérant, Propriétaire ou Maître d\'Hôtel) et susciter une curiosité immédiate sans être intrusif.',
    action: 'Saluer avec le sourire, se présenter au nom de Médias Graphisme Sénégal et demander 2 minutes.',
    frenchScript: '« Bonjour Monsieur/Madame ! Je suis [Votre Nom], conseiller pour la solution sénégalaise Lou Ame Tay ?, éditée par Médias Graphisme Sénégal. Nous accompagnons les meilleurs restaurants de [Thiès / Dakar / Mbour / Saly] pour moderniser leur accueil client, réduire leurs coûts de menu et augmenter leur chiffre d\'affaires. Avez-vous 2 petites minutes pour découvrir comment vos confrères gagnent jusqu\'à 30 minutes de service par table ? »',
    wolofScript: '« Salamalekum Patron ! Man la [Votre Nom], ma ngi ñëw ci turu plateforme Lou Ame Tay ?. Dañuy accompagner restaurants yi pour digitaliser sen carte, ba client bi bu toogé ci table bi, dafay scanne QR code bi rek gis lépp lu ngeen am tay ci ay photo yu rafet ak prix yi. Mën naala wone ci 10 secondes ni mu koy déffé ? »',
    tips: [
      'Toujours demander à parler au propriétaire ou au gérant en salle.',
      'Adapter la langue (Français ou Wolof) selon l\'ambiance du restaurant.',
      'Garder une posture professionnelle, dynamique et chaleureuse.'
    ]
  },
  {
    id: 'step-2',
    stepNumber: 2,
    title: 'Le Diagnostic Flash & Questions d\'Impact',
    duration: '1 minute',
    objective: 'Poser 2 ou 3 questions simples qui mettent en lumière les pertes financières et la frustration du gérant avec le papier.',
    action: 'Écouter attentivement le restaurateur et rebondir sur ses réponses.',
    frenchScript: '1. « Combien dépensez-vous chaque année pour réimprimer ou plastifier vos menus papier qui s\'abîment avec les sauces et l\'eau ? »\n2. « Arrive-t-il que vos serveurs prennent la commande d\'un plat qui est en réalité en rupture en cuisine ? Quelle est la réaction du client quand on lui annonce après 10 minutes d\'attente ? »\n3. « Les jours d\'affluence (vendredi, week-end ou rush de midi), est-ce que vos serveurs ont parfois du mal à servir tout le monde rapidement ? »',
    wolofScript: '1. « Ñaata ngeen di génné chaque année pour réimprimer menu papier yi nga xamné dafay tilim walla xottiku ? »\n2. « Ndax dafa lay dal yenn saay client commander plat bo xamné jeex na ci cuisine bi té serveur bi yëgu ko ? »\n3. « Bu amé affluence bu mag ci midi bi, ndax serveurs yi dañuy tarder ci joxé cartes yi ? »',
    tips: [
      'Ne pas interrompre le gérant : laissez-le exprimer ses difficultés.',
      'Noter mentalement son plus gros problème pour personnaliser la démo.'
    ]
  },
  {
    id: 'step-3',
    stepNumber: 3,
    title: 'La Démonstration Flash « Effet Waouh »',
    duration: '2 minutes',
    objective: 'Faire vivre l\'expérience client en direct sur le smartphone du restaurateur.',
    action: 'Sortir son smartphone de démonstration ou tendre un chevalet QR Code de test au restaurateur.',
    frenchScript: '« Regardez, mettez-vous à la place de votre client qui s\'assoit à la table n°4. Il approche simplement l\'appareil photo de son téléphone... et hop ! Le menu complet s\'affiche instantanément avec de superbes photos, les prix à jour et les suggestions de boissons fraîches.\n\nEt si votre thieboudienne ou vos brochettes sont finies ? Vous appuyez sur ce bouton dans votre espace gérant, et le plat disparaît instantanément de la vue des clients. Fini les réclamations ! »',
    wolofScript: '« Xoolal fi patron, bo toogé ci table 4 bi, sa appareil photo rek ngay tekk ci QR code bi... mu ubbiku légui léggi ak ay photo yu leer naññ ! Té bu Thieb bi jeexé, danga ciy cliquer rek mu dëddoo ci carte bi. Zéro réclamation ! »',
    tips: [
      'Tendre le téléphone ou laisser le gérant scanner lui-même : l\'action physique ancre l\'adoption.',
      'Montrer la rapidité du passage en rupture de stock en direct.'
    ]
  }
];

export const OBJECTION_HANDLERS: ObjectionHandler[] = [
  {
    id: 'obj-1',
    objection: '« Mes clients sénégalais préfèrent toucher le papier, ils ne sont pas habitués. »',
    context: 'Habitude culturelle et attachement au support physique classique.',
    responseFr: '« C\'est une excellente remarque ! Mais observez vos clients aujourd\'hui : 95% d\'entre eux ont leur smartphone posé sur la table dès qu\'ils s\'assoient. Le scan est devenu un réflexe naturel avec Wave et WhatsApp.\n\nDe plus, notre menu digital ne supprime pas le contact avec le serveur, il libère au contraire vos serveurs des tâches répétitives pour qu\'ils se concentrent sur un accueil chaleureux et des conseils personnalisés. Vous pouvez d\'ailleurs conserver 2 ou 3 menus papier pour les personnes âgées, tandis que 90% de vos tables utiliseront le digital avec enthousiasme. »',
    responseWolof: '« Deug la patron ! Waaye xoolal sa clients yi tay : 95% ci ñoom sen téléphone dafa tegu ci table bi ndax Wave ak WhatsApp. Menu bi duko remplacer serveur bi, dafay tax serveur bi am temps pour accueillir clients yi bu baax. Mën nga bayyi 2 menus papier pour mag yi, té jeunesse bi ak ñi am smartphone di utiliser QR code bi ! »',
    keyArguments: [
      '95% des clients ont leur smartphone à table (réflexe Wave/WhatsApp).',
      'Le digital n\'élimine pas le serveur, il le libère pour un meilleur accueil.',
      'Possibilité de garder 2-3 menus papier d\'appoint.'
    ]
  },
  {
    id: 'obj-2',
    objection: '« Et si le client n\'a pas de forfait internet sur son téléphone ? »',
    context: 'Crainte sur l\'accessibilité technique et les données mobiles.',
    responseFr: '« Notre application est ultra-légère et optimisée pour consommer moins de 0,5 Mo par consultation. De plus, si vous disposez d\'un Wifi restaurant, nous pouvons intégrer les codes d\'accès directement sur le chevalet de table. En pratique, plus de 90% des clients de restaurants ont une connexion mobile active. »',
    responseWolof: '« Site bi dafa oyof lool, dafay consommer moins de 0,5 Mo de pass. Té bo amé Wifi ci restaurant bi, dañuy intégrer code Wifi bi ci chevalet bi directement pour ñu connecter facile. »',
    keyArguments: [
      'Page ultra-légère optimisée (< 0,5 Mo).',
      'Intégration du Wifi restaurant direct sur le chevalet.',
      'Plus de 90% des clients de restaurant disposent d\'une connexion mobile.'
    ]
  },
  {
    id: 'obj-3',
    objection: '« 25 000 F CFA par mois, c\'est une charge de plus pour mon restaurant. »',
    context: 'Sensibilité au prix et perception d\'une charge plutôt que d\'un investissement.',
    responseFr: '« Regardons les chiffres ensemble : 25 000 F CFA par mois, cela représente seulement 830 F CFA par jour, soit le prix d\'un seul café ou d\'une canette ! Si notre menu avec photos donne envie à seulement un ou deux clients de plus par jour de commander un dessert ou une boisson supplémentaire, votre abonnement est déjà totalement remboursé et vous générez du bénéfice net. C\'est un investissement rentable dès le premier week-end. »',
    responseWolof: '« Xoolal calcul bi patron : 25 000 F CFA ci weer bi, 830 F CFA rek la par jour, maanaam prix boîte canette cannelle ! Su fékké photo yu rafet yi dafay tax benn wala ñaari clients commander dessert wala jus bu gënë bari chaque jour, sa abonnement payer na boppam té nga am bénéfice ci kaw ! »',
    keyArguments: [
      'Seulement 830 F CFA / jour (le prix d\'un café ou soda).',
      'Rentabilisé dès 1 boisson ou 1 dessert additionnel par jour (+20% de panier moyen).',
      'Économie totale sur les réimpressions papier abîmées.'
    ]
  },
  {
    id: 'obj-4',
    objection: '« Mon menu change tous les jours selon les arrivages du marché. »',
    context: 'Variation quotidienne des plats cuisinés selon les produits frais du jour.',
    responseFr: '« C\'est exactement pour cela que nous avons appelé l\'application Lou Ame Tay ? ! Sur un menu papier, changer de plat chaque jour est un cauchemar ou nécessite d\'écrire à la main sur une ardoise. Avec notre outil, vous tapez le nouveau plat du jour sur votre téléphone à 10h du matin, et à 10h01 il est visible sur toutes les tables de votre restaurant ! »',
    responseWolof: '« Loolu mox tax ñu tudde ko Lou Ame Tay ? ! Ci papier bi, changer plat chaque jour dafa jafe. Ak plateforme bi, ngay bind reer bi ci sa téléphone ci 10h ci suba, ci 10h01 mu fégne ci bépp table ! »',
    keyArguments: [
      'Origine du nom « Lou Ame Tay ? » (Le Plat du Jour).',
      'Mise à jour en 10 secondes depuis le smartphone du gérant.',
      'Fini les ardoises effacées et les ratures.'
    ]
  }
];

export const CONTRACT_ORDER_FORM_FIELDS = {
  documentTitle: 'FICHE D\'INSCRIPTION & BON DE COMMANDE « LOU AME TAY ? »',
  editor: 'MÉDIAS GRAPHISME SÉNÉGAL',
  headquarters: 'Liberté 6 Extension VDN, Dakar',
  contactPhones: '+221 77 458 74 74 / +221 77 130 36 78',
  contactEmail: 'contact@mgartswork.site',
  website: 'www.mgartswork.site',
  initialSetupFee: 50000,
  checklistItems: [
    'Prendre une photo nette de la fiche d\'inscription signée.',
    'Récupérer les photos du menu papier actuel du restaurant (ou fichier PDF/texte).',
    'Récupérer le logo du restaurant en bonne qualité (sur WhatsApp ou email).',
    'Noter le nombre exact de tables et la numérotation souhaitée (ex : Table 1 à 20, Terrasse 1 à 10).',
    'Transmettre le pack complet sur le groupe WhatsApp commercial ou à contact@mgartswork.site pour livraison en 48h.'
  ]
};
