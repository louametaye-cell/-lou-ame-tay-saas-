/**
 * 🔒 SYSTÈME DE PERMISSIONS ET VERROUILLAGE PAR PACK (PAYWALL)
 * Lou Ame Tay ? - Plateforme SaaS Médias Graphisme Sénégal
 * 
 * Source unique de vérité pour l'éligibilité des fonctionnalités selon la formule souscrite.
 */

export type PlanSlug = 
  | 'tambali'
  | 'nio-far'
  | 'xeweul'
  | 'baobab'
  | 'teranga'
  | 'buur'
  | 'ndaje';

export type FeatureKey =
  | 'MENU_MANAGEMENT'      // Gestion du menu et des plats
  | 'STOCK_MANAGEMENT'     // Gestion des stocks en 1 clic
  | 'STUDIO_BRANDING'      // Personnalisation logo, couleurs et Google Maps
  | 'CONSULTATION_STATS'   // Statistiques de vues et plats populaires
  | 'TABLE_ORDERING'       // Prise de commande QR Code à Table
  | 'CASHIER_POS'          // Terminal de caisse & comptoir express
  | 'ORDER_HISTORY'        // Historique et détails des commandes
  | 'STAFF_CASHIERS'       // Gestion de l'équipe caissiers
  | 'BASIC_SALES_STATS'    // Statistiques de vente de base
  | 'KITCHEN_KDS'          // Écran Cuisine KDS avec alertes temps réel
  | 'PICKUP_SCREEN'        // Écran TV de Retrait Guichet Fast-Food
  | 'TV_DISPLAY_SIMPLE'    // Écran Menu TV affichage dynamique (1 écran)
  | 'BLUETOOTH_PRINTING'   // Impression thermique tickets 80mm ESC/POS
  | 'MULTI_LANGUAGE'       // Traduction multilingue automatique (5 langues)
  | 'FULL_SALES_STATS'     // Statistiques de ventes complètes
  | 'MULTI_CASHIERS'       // Caisse multi-guichets simultanés
  | 'TV_DISPLAY_MULTI'     // Écran Menu TV multi-écrans synchronisés
  | 'ADVANCED_EXPORT'      // Export comptable avancé (Excel, CSV)
  | 'ZONE_MANAGEMENT'      // Gestion des zones (salle, terrasse, plage, piscine)
  | 'STAFF_WAITERS'        // Personnel serveurs et badges QR individuels
  | 'TV_DISPLAY_ZONE'      // Écran Menu TV par zone dédiée
  | 'MULTI_SITES'          // Sélecteur multi-établissements centralisé
  | 'STAFF_ANALYTICS'      // Analyse poussée des performances du personnel
  | 'VIP_SUPPORT';         // Support VIP dédié et prioritaire

export interface PlanMeta {
  slug: PlanSlug;
  name: string;
  priceMonthly: number;
  currency: string;
  level: number;
  colorTheme: string;
  badge?: string;
  description: string;
}

export const PLANS_REGISTRY: Record<PlanSlug, PlanMeta> = {
  'tambali': {
    slug: 'tambali',
    name: 'TÀMBALI',
    priceMonthly: 15000,
    currency: 'FCFA',
    level: 1,
    colorTheme: '#64748b',
    description: 'Menu digital vitrine, gestion des stocks et personnalisation de marque.'
  },
  'nio-far': {
    slug: 'nio-far',
    name: 'NIO FAR',
    priceMonthly: 25000,
    currency: 'FCFA',
    level: 2,
    colorTheme: '#0284c7',
    description: 'Commande QR à table, caisse comptoir express et gestion des commandes.'
  },
  'xeweul': {
    slug: 'xeweul',
    name: 'XÉWEUL',
    priceMonthly: 35000,
    currency: 'FCFA',
    level: 3,
    colorTheme: '#FF6B00',
    badge: 'Recommandé',
    description: 'Écran cuisine KDS, retrait guichet TV, impression 80mm et multilingue.'
  },
  'baobab': {
    slug: 'baobab',
    name: 'BAOBAB',
    priceMonthly: 46800,
    currency: 'FCFA',
    level: 4,
    colorTheme: '#059669',
    description: 'Multi-guichets caisse, affichage multi-écrans TV et exports comptables.'
  },
  'teranga': {
    slug: 'teranga',
    name: 'TERANGA',
    priceMonthly: 65000,
    currency: 'FCFA',
    level: 5,
    colorTheme: '#7c3aed',
    description: 'Gestion multi-zones, badges QR serveurs avec traçabilité et TV par zone.'
  },
  'buur': {
    slug: 'buur',
    name: 'BUUR',
    priceMonthly: 80000,
    currency: 'FCFA',
    level: 6,
    colorTheme: '#dc2626',
    description: 'Supervision multi-sites, reporting staff avancé et support VIP 24/7.'
  },
  'ndaje': {
    slug: 'ndaje',
    name: 'NDAJÉ',
    priceMonthly: 0,
    currency: 'FCFA',
    level: 0, // Cas spécial événementiel hors échelle linéaire
    colorTheme: '#0f172a',
    badge: 'Événementiel',
    description: 'Prestation événementielle sur mesure avec menu et cuisine temporaires.'
  }
};

export interface FeaturePaywall {
  key: FeatureKey;
  name: string;
  requiredPlan: PlanSlug;
  requiredPlanName: string;
  requiredPlanPrice: string;
  benefit: string;
  concreteUnlocks: string[];
}

export const FEATURES_CATALOG: Record<FeatureKey, FeaturePaywall> = {
  MENU_MANAGEMENT: {
    key: 'MENU_MANAGEMENT',
    name: 'Gestion du Menu',
    requiredPlan: 'tambali',
    requiredPlanName: 'TÀMBALI',
    requiredPlanPrice: '15 000 FCFA / mois',
    benefit: 'Modifiez vos plats, prix et descriptions en temps réel.',
    concreteUnlocks: ['Photos illimitées', 'Formules combinées', 'Catégories personnalisées']
  },
  STOCK_MANAGEMENT: {
    key: 'STOCK_MANAGEMENT',
    name: 'Gestion des Stocks',
    requiredPlan: 'tambali',
    requiredPlanName: 'TÀMBALI',
    requiredPlanPrice: '15 000 FCFA / mois',
    benefit: 'Évitez les déceptions en masquant un plat épuisé en 1 clic.',
    concreteUnlocks: ['Désactivation instantanée', 'Alertes de rupture', 'Zéro friction en salle']
  },
  STUDIO_BRANDING: {
    key: 'STUDIO_BRANDING',
    name: 'Studio de Marque',
    requiredPlan: 'tambali',
    requiredPlanName: 'TÀMBALI',
    requiredPlanPrice: '15 000 FCFA / mois',
    benefit: 'Personnalisez votre menu aux couleurs exactes de votre établissement.',
    concreteUnlocks: ['Logo HD & Bannière', 'Palette de couleurs personnalisée', 'Lien Avis Google Maps']
  },
  CONSULTATION_STATS: {
    key: 'CONSULTATION_STATS',
    name: 'Statistiques de Consultation',
    requiredPlan: 'tambali',
    requiredPlanName: 'TÀMBALI',
    requiredPlanPrice: '15 000 FCFA / mois',
    benefit: 'Découvrez vos plats les plus consultés et optimisez votre carte.',
    concreteUnlocks: ['Nombre de scans QR quotidiens', 'Top 5 des plats consultés', 'Horaires d\'affluence']
  },
  TABLE_ORDERING: {
    key: 'TABLE_ORDERING',
    name: 'Commande QR Code à Table',
    requiredPlan: 'nio-far',
    requiredPlanName: 'NIO FAR',
    requiredPlanPrice: '25 000 FCFA / mois',
    benefit: 'Vos clients commandent directement depuis leur table sans attendre un serveur.',
    concreteUnlocks: [
      'Génération de QR codes personnalisés par table',
      'Validation de commande avec panier interactif',
      'Encaissement direct Wave, Orange Money ou espèces'
    ]
  },
  CASHIER_POS: {
    key: 'CASHIER_POS',
    name: 'Terminal Caisse & Comptoir Express',
    requiredPlan: 'nio-far',
    requiredPlanName: 'NIO FAR',
    requiredPlanPrice: '25 000 FCFA / mois',
    benefit: 'Encaissez les commandes à emporter et au comptoir avec ouverture et clôture de caisse.',
    concreteUnlocks: [
      'Mode Express pour vente rapide au comptoir',
      'Gestion du fond de caisse initial et clôture Z',
      'Connexion sécurisée par code PIN caissier'
    ]
  },
  ORDER_HISTORY: {
    key: 'ORDER_HISTORY',
    name: 'Historique des Commandes',
    requiredPlan: 'nio-far',
    requiredPlanName: 'NIO FAR',
    requiredPlanPrice: '25 000 FCFA / mois',
    benefit: 'Consultez et filtrez l\'ensemble des commandes passées dans votre restaurant.',
    concreteUnlocks: [
      'Statuts détaillés (En attente, En préparation, Servi, Payé)',
      'Détail des articles et suppléments par table',
      'Exportation du journal de vente journalier'
    ]
  },
  STAFF_CASHIERS: {
    key: 'STAFF_CASHIERS',
    name: 'Gestion de l\'Équipe Caissiers',
    requiredPlan: 'nio-far',
    requiredPlanName: 'NIO FAR',
    requiredPlanPrice: '25 000 FCFA / mois',
    benefit: 'Créez des accès caisse nominatifs protégés par code PIN.',
    concreteUnlocks: [
      'Attribution de codes PIN confidentiels à 4 chiffres',
      'Définition des shifts (Matin, Soir, Journée entière)',
      'Traçabilité complète des encaissements par caissier'
    ]
  },
  BASIC_SALES_STATS: {
    key: 'BASIC_SALES_STATS',
    name: 'Statistiques de Ventes de Base',
    requiredPlan: 'nio-far',
    requiredPlanName: 'NIO FAR',
    requiredPlanPrice: '25 000 FCFA / mois',
    benefit: 'Visualisez votre chiffre d\'affaires journalier et votre panier moyen.',
    concreteUnlocks: [
      'Chiffre d\'affaires total en FCFA en temps réel',
      'Nombre de couverts et commandes encaissées',
      'Comparatif par rapport à la veille'
    ]
  },
  KITCHEN_KDS: {
    key: 'KITCHEN_KDS',
    name: 'Écran Cuisine KDS en Direct',
    requiredPlan: 'xeweul',
    requiredPlanName: 'XÉWEUL',
    requiredPlanPrice: '35 000 FCFA / mois',
    benefit: 'Vos cuisiniers reçoivent les commandes en direct sur tablette ou écran sans tickets papier perdus.',
    concreteUnlocks: [
      'Affichage chronologique avec alertes sonores de nouvelles commandes',
      'Chrono temps réel du temps de préparation',
      'Passage en 1 clic au statut Prêt pour le service'
    ]
  },
  PICKUP_SCREEN: {
    key: 'PICKUP_SCREEN',
    name: 'Écran TV Retrait Guichet',
    requiredPlan: 'xeweul',
    requiredPlanName: 'XÉWEUL',
    requiredPlanPrice: '35 000 FCFA / mois',
    benefit: 'Affichez les numéros de commande prêts sur écran TV avec carillon sonore et annonce vocale.',
    concreteUnlocks: [
      'Numéros géants visibles à plus de 10 mètres en salle',
      'Carillon Ding-Dong synthétisé automatique',
      'Annonce vocale féminine en français des commandes prêtes'
    ]
  },
  TV_DISPLAY_SIMPLE: {
    key: 'TV_DISPLAY_SIMPLE',
    name: 'Écran Menu TV (Mode Simple)',
    requiredPlan: 'xeweul',
    requiredPlanName: 'XÉWEUL',
    requiredPlanPrice: '35 000 FCFA / mois',
    benefit: 'Diffusez votre menu digital en continu sur grand écran TV ou vidéoprojecteur.',
    concreteUnlocks: [
      '3 modes de diffusion : Menu Complet, Diaporama HD et Grille 4 Quadrants',
      'Mise à jour instantanée dès qu\'un plat est modifié sur le tableau de bord',
      'Affichage de l\'heure et des plats du jour « Lou Ame Tay ? »'
    ]
  },
  BLUETOOTH_PRINTING: {
    key: 'BLUETOOTH_PRINTING',
    name: 'Impression Thermique 80mm',
    requiredPlan: 'xeweul',
    requiredPlanName: 'XÉWEUL',
    requiredPlanPrice: '35 000 FCFA / mois',
    benefit: 'Imprimez des tickets de caisse et bons de cuisine sur imprimante Bluetooth ESC/POS.',
    concreteUnlocks: [
      'Format standard 80mm avec logo et coordonnées du restaurant',
      'Découpage automatique des bons de cuisine par table',
      'Rapport de clôture de caisse Z imprimable en fin de journée'
    ]
  },
  MULTI_LANGUAGE: {
    key: 'MULTI_LANGUAGE',
    name: 'Traduction Multilingue Automatique',
    requiredPlan: 'xeweul',
    requiredPlanName: 'XÉWEUL',
    requiredPlanPrice: '35 000 FCFA / mois',
    benefit: 'Offrez une expérience internationale à vos clients en Wolof, Anglais, Espagnol et Italien.',
    concreteUnlocks: [
      'Sélecteur de langue instantané sans rechargement',
      'Traduction automatique et personnalisable des descriptions',
      'Devises étrangères converties en temps réel (EUR, USD)'
    ]
  },
  FULL_SALES_STATS: {
    key: 'FULL_SALES_STATS',
    name: 'Statistiques de Ventes Complètes',
    requiredPlan: 'xeweul',
    requiredPlanName: 'XÉWEUL',
    requiredPlanPrice: '35 000 FCFA / mois',
    benefit: 'Analysez vos ventes par tranche horaire, par catégorie et par moyen de paiement.',
    concreteUnlocks: [
      'Graphiques d\'évolution hebdomadaire et mensuelle',
      'Répartition des règlements Wave vs Orange Money vs Espèces',
      'Taux de rotation des tables et temps moyen de service'
    ]
  },
  MULTI_CASHIERS: {
    key: 'MULTI_CASHIERS',
    name: 'Caisse Multi-Guichets Simultanés',
    requiredPlan: 'baobab',
    requiredPlanName: 'BAOBAB',
    requiredPlanPrice: '46 800 FCFA / mois',
    benefit: 'Ouvrez plusieurs guichets de caisse en simultané pour fluidifier les heures de pointe.',
    concreteUnlocks: [
      'Sessions de caisse indépendantes par point d\'encaissement',
      'Gestion distincte des fonds de tiroir-caisse par guichet',
      'Clôtures individuelles et consolidation globale en fin de journée'
    ]
  },
  TV_DISPLAY_MULTI: {
    key: 'TV_DISPLAY_MULTI',
    name: 'Affichage TV Multi-Écrans',
    requiredPlan: 'baobab',
    requiredPlanName: 'BAOBAB',
    requiredPlanPrice: '46 800 FCFA / mois',
    benefit: 'Gérez plusieurs écrans TV avec des affichages différents (ex: Écran 1 Plats, Écran 2 Boissons).',
    concreteUnlocks: [
      'Synchronisation de jusqu\'à 5 écrans TV simultanés',
      'Attribution d\'une catégorie spécifique par écran',
      'Gestion centrale depuis le tableau de bord'
    ]
  },
  ADVANCED_EXPORT: {
    key: 'ADVANCED_EXPORT',
    name: 'Export de Données Avancé',
    requiredPlan: 'baobab',
    requiredPlanName: 'BAOBAB',
    requiredPlanPrice: '46 800 FCFA / mois',
    benefit: 'Exportez vos données comptables et historiques complets aux formats Excel et CSV.',
    concreteUnlocks: [
      'Grand livre des ventes pour votre comptable',
      'Export des clôtures de caisse et écarts de caisse',
      'Fichiers de performance des ventes pour tableur'
    ]
  },
  ZONE_MANAGEMENT: {
    key: 'ZONE_MANAGEMENT',
    name: 'Gestion Multi-Zones Avancée',
    requiredPlan: 'teranga',
    requiredPlanName: 'TERANGA',
    requiredPlanPrice: '65 000 FCFA / mois',
    benefit: 'Segmentez votre établissement par espaces distincts : Terrasse, Piscine, Plage, Salle VIP.',
    concreteUnlocks: [
      'Cartographie sur mesure de chaque zone',
      'Attribution de QR codes de tables ou de zone libre sans numéro fixe',
      'Filtres de commandes par zone d\'origine'
    ]
  },
  STAFF_WAITERS: {
    key: 'STAFF_WAITERS',
    name: 'Badges QR Serveurs & Affectation',
    requiredPlan: 'teranga',
    requiredPlanName: 'TERANGA',
    requiredPlanPrice: '65 000 FCFA / mois',
    benefit: 'Suivez qui sert quelle table, fidélisez vos serveurs et facilitez le pourboire.',
    concreteUnlocks: [
      'Génération de badges QR plastifiés individuels pour chaque serveur',
      'Attribution dynamique des tables aux serveurs en début de service',
      'Traçabilité du serveur responsable sur chaque ticket de commande'
    ]
  },
  TV_DISPLAY_ZONE: {
    key: 'TV_DISPLAY_ZONE',
    name: 'Écran Menu TV par Zone',
    requiredPlan: 'teranga',
    requiredPlanName: 'TERANGA',
    requiredPlanPrice: '65 000 FCFA / mois',
    benefit: 'Diffusez une carte adaptée à chaque zone (ex: carte Bar & Cocktails côté piscine).',
    concreteUnlocks: [
      'Affectation d\'un écran TV à une zone précise de votre établissement',
      'Affichage sélectif des catégories propres à l\'espace',
      'Contrôle indépendant de chaque écran'
    ]
  },
  MULTI_SITES: {
    key: 'MULTI_SITES',
    name: 'Sélecteur Multi-Établissements',
    requiredPlan: 'buur',
    requiredPlanName: 'BUUR',
    requiredPlanPrice: '80 000 FCFA / mois',
    benefit: 'Pilotez tous vos restaurants et franchises depuis un compte unique et consolidé.',
    concreteUnlocks: [
      'Basculement en 1 clic entre vos différents établissements',
      'Tableau de bord consolidé du chiffre d\'affaires de l\'ensemble du groupe',
      'Gestion centralisée des accès directeurs et superviseurs'
    ]
  },
  STAFF_ANALYTICS: {
    key: 'STAFF_ANALYTICS',
    name: 'Audit de Performance Staff Avancé',
    requiredPlan: 'buur',
    requiredPlanName: 'BUUR',
    requiredPlanPrice: '80 000 FCFA / mois',
    benefit: 'Mesurez la rapidité de service et le chiffre d\'affaires généré par chaque employé.',
    concreteUnlocks: [
      'Classement des serveurs par chiffre d\'affaires et panier moyen',
      'Temps moyen de prise en charge et de délivrance des plats',
      'Export des rapports d\'intéressement et pourboires'
    ]
  },
  VIP_SUPPORT: {
    key: 'VIP_SUPPORT',
    name: 'Support VIP Dédié 24/7',
    requiredPlan: 'buur',
    requiredPlanName: 'BUUR',
    requiredPlanPrice: '80 000 FCFA / mois',
    benefit: 'Bénéficiez d\'un conseiller dédié chez Médias Graphisme Sénégal disponible 7j/7.',
    concreteUnlocks: [
      'Ligne WhatsApp directe avec temps de réponse prioritaire (< 15 min)',
      'Interventions techniques d\'urgence sur place à Dakar et Thiès',
      'Mises à jour prioritaires de votre carte par notre studio graphique'
    ]
  }
};

/**
 * Normalise et retourne le niveau d'un pack donné.
 */
export function getPlanLevel(slug?: string | null): number {
  if (!slug) return 1; // Défaut TÀMBALI
  const cleanSlug = slug.toLowerCase().trim() as PlanSlug;
  const plan = PLANS_REGISTRY[cleanSlug];
  if (!plan) return 1;
  return plan.level;
}

/**
 * 🔒 VÉRIFICATION CENTRALE DES DROITS D'ACCÈS PAR FONCTIONNALITÉ
 * 
 * @param currentPlanSlug - Le slug du plan du restaurant (ex: 'tambali', 'nio-far', 'xeweul', etc.)
 * @param featureKey - La fonctionnalité à vérifier
 * @returns boolean - true si la fonctionnalité est incluse et débloquée, false sinon
 */
export function hasAccessToFeature(
  currentPlanSlug: string | undefined | null,
  featureKey: FeatureKey
): boolean {
  const cleanPlanSlug = (currentPlanSlug || 'tambali').toLowerCase().trim() as PlanSlug;
  const feature = FEATURES_CATALOG[featureKey];
  if (!feature) return false;

  // Cas particulier : Pack NDAJÉ (Prestation événementielle isolée)
  if (cleanPlanSlug === 'ndaje') {
    // NDAJÉ a ses propres règles isolées :
    const ndajeAllowed: FeatureKey[] = [
      'MENU_MANAGEMENT',
      'TABLE_ORDERING',
      'KITCHEN_KDS',
      'TV_DISPLAY_SIMPLE',
      'ORDER_HISTORY'
    ];
    return ndajeAllowed.includes(featureKey);
  }

  // Échelle standard par niveau hiérarchique :
  const userLevel = getPlanLevel(cleanPlanSlug);
  const requiredLevel = getPlanLevel(feature.requiredPlan);

  return userLevel >= requiredLevel;
}

/**
 * Récupère les métadonnées de paywall pour une fonctionnalité donnée.
 */
export function getFeaturePaywallInfo(featureKey: FeatureKey): FeaturePaywall {
  return FEATURES_CATALOG[featureKey] || {
    key: featureKey,
    name: 'Fonctionnalité Avancée',
    requiredPlan: 'xeweul',
    requiredPlanName: 'XÉWEUL',
    requiredPlanPrice: '35 000 FCFA / mois',
    benefit: 'Débloquez cette fonctionnalité pour optimiser votre restaurant.',
    concreteUnlocks: ['Accès complet', 'Support inclus', 'Activation immédiate']
  };
}

/**
 * Construit l'URL WhatsApp pré-remplie vers l'agence pour la demande de mise à niveau.
 */
export function buildUpgradeWhatsAppUrl(
  restaurantName: string,
  currentPlanSlug: string | undefined | null,
  targetPlanSlug: string,
  featureName?: string
): string {
  const currentPlanMeta = PLANS_REGISTRY[(currentPlanSlug || 'tambali').toLowerCase().trim() as PlanSlug] || PLANS_REGISTRY['tambali'];
  const targetPlanMeta = PLANS_REGISTRY[targetPlanSlug as PlanSlug] || PLANS_REGISTRY['xeweul'];

  const message = `Bonjour Lou Ame Tay ? / Médias Graphisme Sénégal,

Je suis le gérant de l'établissement *${restaurantName || 'Mon Restaurant'}*.
Nous sommes actuellement sous la formule *${currentPlanMeta.name}* (${currentPlanMeta.priceMonthly.toLocaleString('fr-FR')} FCFA/mois).

Je souhaite faire évoluer notre abonnement vers la formule supérieure *${targetPlanMeta.name}* (${targetPlanMeta.priceMonthly.toLocaleString('fr-FR')} FCFA/mois)${featureName ? ` afin de débloquer : *${featureName}*` : ''}.

Merci de nous recontacter pour finaliser l'activation et la configuration.`;

  return `https://wa.me/221762312003?text=${encodeURIComponent(message)}`;
}
