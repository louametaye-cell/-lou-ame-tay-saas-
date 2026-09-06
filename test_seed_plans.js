const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const FEATURES = [
  { keyName: 'MENU_DIGITAL', label: 'Menu digital avec photos', category: 'CORE', valueType: 'BOOLEAN' },
  { keyName: 'STOCK_MANAGEMENT', label: 'Gestion des stocks en 1 clic', category: 'CORE', valueType: 'BOOLEAN' },
  { keyName: 'STUDIO_CUSTOMIZATION', label: 'Personnalisation logo/couleurs (Studio)', category: 'CORE', valueType: 'BOOLEAN' },
  { keyName: 'CONSULTATION_STATS', label: 'Statistiques de consultation', category: 'CORE', valueType: 'BOOLEAN' },
  { keyName: 'TABLE_ORDERING', label: 'Commande via QR Code Table', category: 'OPERATION', valueType: 'BOOLEAN' },
  { keyName: 'EXPRESS_POS', label: 'Caisse Express (comptoir/emporter)', category: 'BILLING', valueType: 'BOOLEAN' },
  { keyName: 'BASIC_SALES_STATS', label: 'Statistiques de ventes de base', category: 'CORE', valueType: 'BOOLEAN' },
  { keyName: 'KITCHEN_DISPLAY_KDS', label: 'Écran Cuisine (KDS) complet avec alertes', category: 'OPERATION', valueType: 'BOOLEAN' },
  { keyName: 'MULTI_LANGUAGE_MENU', label: 'Traduction multilingue automatique (5 langues)', category: 'MARKETING', valueType: 'BOOLEAN' },
  { keyName: 'BLUETOOTH_PRINTING', label: 'Impression tickets Bluetooth 80mm', category: 'OPERATION', valueType: 'BOOLEAN' },
  { keyName: 'SINGLE_TV_SCREEN', label: 'Écran Menu (affichage TV) mode simple', category: 'MARKETING', valueType: 'BOOLEAN' },
  { keyName: 'ADVANCED_STATS', label: 'Statistiques de ventes complètes', category: 'BILLING', valueType: 'BOOLEAN' },
  { keyName: 'MULTI_COUNTERS', label: 'Gestion multi-guichets/multi-points de commande', category: 'OPERATION', valueType: 'BOOLEAN' },
  { keyName: 'MULTI_TV_SCREENS', label: 'Écran Menu multi-écrans', category: 'MARKETING', valueType: 'BOOLEAN' },
  { keyName: 'ADVANCED_EXPORT', label: 'Export de données avancé', category: 'BILLING', valueType: 'BOOLEAN' },
  { keyName: 'WAITER_QR', label: 'QR personnel par serveur avec traçabilité', category: 'OPERATION', valueType: 'BOOLEAN' },
  { keyName: 'MULTI_ZONE', label: 'Gestion multi-zones (piscine, plage, room-service)', category: 'OPERATION', valueType: 'BOOLEAN' },
  { keyName: 'ZONE_TV_SCREENS', label: 'Écran Menu par zone', category: 'MARKETING', valueType: 'BOOLEAN' },
  { keyName: 'MULTI_SITES', label: 'Gestion multi-sites (plusieurs points de restauration)', category: 'OPERATION', valueType: 'BOOLEAN' },
  { keyName: 'STAFF_PERFORMANCE_ANALYTICS', label: 'Export des performances staff avancé', category: 'BILLING', valueType: 'BOOLEAN' },
  { keyName: 'VIP_SUPPORT', label: 'Support VIP dédié', category: 'CORE', valueType: 'BOOLEAN' },
  { keyName: 'EVENT_AUTO_EXPIRATION', label: 'Désactivation automatique après événement', category: 'OPERATION', valueType: 'BOOLEAN' },
];

const PLANS = [
  {
    name: 'TÀMBALI (Commencer)',
    slug: 'tambali',
    price: 15000,
    description: 'Établissement avec caisse existante, veut juste un menu digital',
    colorTheme: '#64748b',
    isRecommended: false,
    activeFeatures: [
      'MENU_DIGITAL',
      'STOCK_MANAGEMENT',
      'STUDIO_CUSTOMIZATION',
      'CONSULTATION_STATS'
    ]
  },
  {
    name: 'NIO FAR (On est ensemble)',
    slug: 'nio-far',
    price: 25000,
    description: 'Petit maquis/café sans système de caisse',
    colorTheme: '#0284c7',
    isRecommended: false,
    activeFeatures: [
      'MENU_DIGITAL',
      'STOCK_MANAGEMENT',
      'STUDIO_CUSTOMIZATION',
      'CONSULTATION_STATS',
      'TABLE_ORDERING',
      'EXPRESS_POS',
      'BASIC_SALES_STATS'
    ]
  },
  {
    name: 'XÉWEUL (Bonne affaire)',
    slug: 'xeweul',
    price: 35000,
    description: 'Restaurant, pizzeria, fastfood (Le meilleur rapport qualité-prix)',
    colorTheme: '#FF6B00',
    isRecommended: true,
    activeFeatures: [
      'MENU_DIGITAL',
      'STOCK_MANAGEMENT',
      'STUDIO_CUSTOMIZATION',
      'CONSULTATION_STATS',
      'TABLE_ORDERING',
      'EXPRESS_POS',
      'BASIC_SALES_STATS',
      'KITCHEN_DISPLAY_KDS',
      'MULTI_LANGUAGE_MENU',
      'BLUETOOTH_PRINTING',
      'SINGLE_TV_SCREEN',
      'ADVANCED_STATS'
    ]
  },
  {
    name: 'BAOBAB (L\'arbre majestueux)',
    slug: 'baobab',
    price: 46800,
    description: 'Fastfood à forte affluence, établissements multi-comptoirs',
    colorTheme: '#059669',
    isRecommended: false,
    activeFeatures: [
      'MENU_DIGITAL',
      'STOCK_MANAGEMENT',
      'STUDIO_CUSTOMIZATION',
      'CONSULTATION_STATS',
      'TABLE_ORDERING',
      'EXPRESS_POS',
      'BASIC_SALES_STATS',
      'KITCHEN_DISPLAY_KDS',
      'MULTI_LANGUAGE_MENU',
      'BLUETOOTH_PRINTING',
      'SINGLE_TV_SCREEN',
      'ADVANCED_STATS',
      'MULTI_COUNTERS',
      'MULTI_TV_SCREENS',
      'ADVANCED_EXPORT'
    ]
  },
  {
    name: 'TERANGA (Hospitalité)',
    slug: 'teranga',
    price: 65000,
    description: 'Hôtels, lounges et grandes terrasses',
    colorTheme: '#7c3aed',
    isRecommended: false,
    activeFeatures: [
      'MENU_DIGITAL',
      'STOCK_MANAGEMENT',
      'STUDIO_CUSTOMIZATION',
      'CONSULTATION_STATS',
      'TABLE_ORDERING',
      'EXPRESS_POS',
      'BASIC_SALES_STATS',
      'KITCHEN_DISPLAY_KDS',
      'MULTI_LANGUAGE_MENU',
      'BLUETOOTH_PRINTING',
      'SINGLE_TV_SCREEN',
      'ADVANCED_STATS',
      'MULTI_COUNTERS',
      'MULTI_TV_SCREENS',
      'ADVANCED_EXPORT',
      'WAITER_QR',
      'MULTI_ZONE',
      'ZONE_TV_SCREENS'
    ]
  },
  {
    name: 'BUUR (Roi)',
    slug: 'buur',
    price: 80000,
    description: 'Grands hôtels, complexes multi-restaurants',
    colorTheme: '#dc2626',
    isRecommended: false,
    activeFeatures: [
      'MENU_DIGITAL',
      'STOCK_MANAGEMENT',
      'STUDIO_CUSTOMIZATION',
      'CONSULTATION_STATS',
      'TABLE_ORDERING',
      'EXPRESS_POS',
      'BASIC_SALES_STATS',
      'KITCHEN_DISPLAY_KDS',
      'MULTI_LANGUAGE_MENU',
      'BLUETOOTH_PRINTING',
      'SINGLE_TV_SCREEN',
      'ADVANCED_STATS',
      'MULTI_COUNTERS',
      'MULTI_TV_SCREENS',
      'ADVANCED_EXPORT',
      'WAITER_QR',
      'MULTI_ZONE',
      'ZONE_TV_SCREENS',
      'MULTI_SITES',
      'STAFF_PERFORMANCE_ANALYTICS',
      'VIP_SUPPORT'
    ]
  },
  {
    name: 'NDAJÉ (Rendez-vous)',
    slug: 'ndaje',
    price: 0,
    description: 'Prestation événementielle ponctuelle, sur devis (pas un abonnement)',
    colorTheme: '#1e293b',
    isRecommended: false,
    activeFeatures: [
      'MENU_DIGITAL',
      'TABLE_ORDERING',
      'KITCHEN_DISPLAY_KDS',
      'SINGLE_TV_SCREEN',
      'EVENT_AUTO_EXPIRATION'
    ]
  }
];

async function seed() {
  console.log('Seeding Features...');
  const featureMap = {};
  for (const f of FEATURES) {
    const feat = await prisma.feature.upsert({
      where: { keyName: f.keyName },
      update: { label: f.label, category: f.category, valueType: f.valueType },
      create: { keyName: f.keyName, label: f.label, category: f.category, valueType: f.valueType },
    });
    featureMap[f.keyName] = feat.id;
  }

  console.log('Seeding 7 Official SaaS Plans...');
  for (const p of PLANS) {
    const plan = await prisma.plan.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        price: p.price,
        description: p.description,
        colorTheme: p.colorTheme,
        isRecommended: p.isRecommended,
        isActive: true,
      },
      create: {
        name: p.name,
        slug: p.slug,
        price: p.price,
        currency: 'FCFA',
        description: p.description,
        colorTheme: p.colorTheme,
        isRecommended: p.isRecommended,
        isActive: true,
      },
    });

    // Link Plan Features
    for (const f of FEATURES) {
      const isAct = p.activeFeatures.includes(f.keyName);
      const featId = featureMap[f.keyName];
      await prisma.planFeature.upsert({
        where: { uq_plan_feature: { planId: plan.id, featureId: featId } },
        update: { isActive: isAct },
        create: { planId: plan.id, featureId: featId, isActive: isAct },
      });
    }
    console.log(`✓ Plan ${p.name} (${p.slug}) seeded with features!`);
  }

  console.log('Seeding Completed Successfully!');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
