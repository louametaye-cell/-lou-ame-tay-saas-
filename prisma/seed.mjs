import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ------------------------------------------------------------------------------
// 1. PLANS & FEATURES SAAS (CONSERVÉS / UPSERT INTÈGRE)
// ------------------------------------------------------------------------------
const DEFAULT_PLANS = [
  {
    id: 'cmtptjeaq000mafnomi5vl8ar',
    name: 'TÀMBALI (Commencer)',
    slug: 'tambali',
    price: 15000,
    currency: 'FCFA',
    description: 'Établissement avec caisse existante, veut juste un menu digital.',
    colorTheme: '#64748b',
    isRecommended: false,
    isActive: true,
  },
  {
    id: 'cmtptjg1s001vafno5uo0k2w6',
    name: 'NIO FAR (On est ensemble)',
    slug: 'nio-far',
    price: 25000,
    currency: 'FCFA',
    description: 'Petit maquis/café : Commande QR Code table et Caisse Express comptoir.',
    colorTheme: '#0284c7',
    isRecommended: false,
    isActive: true,
  },
  {
    id: 'cmtptjhkb0034afnout2sb7np',
    name: 'XÉWEUL (Bonne affaire)',
    slug: 'xeweul',
    price: 35000,
    currency: 'FCFA',
    description: 'Restaurant, pizzeria, fastfood : KDS Cuisine, Écrans TV Retrait & Menu, Caisse Z.',
    colorTheme: '#FF6B00',
    isRecommended: true,
    isActive: true,
  },
  {
    id: 'cmtptjj2u004dafnojtynkvjk',
    name: "BAOBAB (L'arbre majestueux)",
    slug: 'baobab',
    price: 46800,
    currency: 'FCFA',
    description: 'Fastfood à forte affluence, établissements multi-comptoirs.',
    colorTheme: '#059669',
    isRecommended: false,
    isActive: true,
  },
  {
    id: 'cmtptjkqb005mafno5kczfxh6',
    name: 'TERANGA (Hospitalité)',
    slug: 'teranga',
    price: 65000,
    currency: 'FCFA',
    description: 'Hôtels, lounges et grandes terrasses : Multi-zones, QR serveurs, Support VIP.',
    colorTheme: '#7c3aed',
    isRecommended: false,
    isActive: true,
  },
  {
    id: 'cmtptjmh6006vafnoq4c5imgy',
    name: 'BUUR (Roi)',
    slug: 'buur',
    price: 80000,
    currency: 'FCFA',
    description: 'Grands hôtels, complexes multi-restaurants.',
    colorTheme: '#dc2626',
    isRecommended: false,
    isActive: true,
  },
  {
    id: 'cmtptjo9v0084afnoml0qvbs9',
    name: 'NDAJÉ (Rendez-vous)',
    slug: 'ndaje',
    price: 0,
    currency: 'FCFA',
    description: 'Prestation événementielle ponctuelle, sur devis.',
    colorTheme: '#1e293b',
    isRecommended: false,
    isActive: true,
  },
  {
    id: 'plan_starter',
    name: 'Starter (Historique)',
    slug: 'starter',
    price: 15000,
    currency: 'FCFA',
    description: 'Ancien forfait Starter',
    colorTheme: '#64748b',
    isRecommended: false,
    isActive: false,
  },
  {
    id: 'plan_pro',
    name: 'Pro (Historique)',
    slug: 'pro',
    price: 25000,
    currency: 'FCFA',
    description: 'Ancien forfait Pro',
    colorTheme: '#FF6B00',
    isRecommended: false,
    isActive: false,
  },
  {
    id: 'plan_premium',
    name: 'Premium VIP (Historique)',
    slug: 'premium',
    price: 45000,
    currency: 'FCFA',
    description: 'Ancien forfait Premium VIP',
    colorTheme: '#00A86B',
    isRecommended: false,
    isActive: false,
  },
];

const DEFAULT_FEATURES = [
  { id: 'feat_photos', keyName: 'MAX_PHOTOS', label: 'Photos Plats HD', category: 'CORE', valueType: 'NUMERIC' },
  { id: 'feat_tables', keyName: 'MAX_TABLES', label: 'Tables & QR Codes', category: 'CORE', valueType: 'NUMERIC' },
  { id: 'feat_kds', keyName: 'KITCHEN_DISPLAY_KDS', label: 'Écran Cuisine KDS & Alerte Sonore', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_wave_om', keyName: 'WAVE_ORANGE_MONEY', label: 'Paiements Mobiles Wave & Orange Money', category: 'BILLING', valueType: 'BOOLEAN' },
  { id: 'feat_basic_stats', keyName: 'BASIC_STATS', label: 'Statistiques de Caisse Standard', category: 'CORE', valueType: 'BOOLEAN' },
  { id: 'feat_multizone', keyName: 'MULTI_ZONE', label: 'Multi-Zones (Salle, Terrasse, Piscine)', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_bilingual', keyName: 'BILINGUAL_MENU', label: 'Menu Bilingue & Multi-Langues', category: 'MARKETING', valueType: 'BOOLEAN' },
  { id: 'feat_multilang', keyName: 'MULTI_LANGUAGE_MENU', label: 'Menu Multilingue 5 Langues (FR, WO, EN, ES, IT)', category: 'MARKETING', valueType: 'BOOLEAN' },
  { id: 'feat_advanced_stats', keyName: 'ADVANCED_STATS', label: 'Statistiques Avancées & Exports Excel', category: 'BILLING', valueType: 'BOOLEAN' },
  { id: 'feat_vip_support', keyName: 'VIP_SUPPORT', label: 'Accompagnement VIP & Support Dédié 24/7', category: 'CORE', valueType: 'BOOLEAN' },
];

// ------------------------------------------------------------------------------
// 2. DONNÉES DES 4 RESTAURANTS PILOTES / DÉMOS AVEC MENUS EXACTS
// ------------------------------------------------------------------------------
const RESTAURANTS_DATA = [
  // ============================================================================
  // RESTAURANT 1 : Madiba Restau (Thiès) -> Pack STARTER (ou Pro) / Démo Starter
  // Compte Démo : demo.starter@louametay.sn / Demo123!
  // ============================================================================
  {
    id: 'tenant_madiba_restau',
    businessName: 'MG Café Resto (Madiba)',
    subdomain: 'mg-cafe-resto',
    ownerName: 'Moussa Guèye',
    phone: '+221 77 458 74 74',
    address: 'HLM Route de Mbour, Thiès',
    city: 'Thiès',
    currentPlanId: 'cmtptjeaq000mafnomi5vl8ar', // TÀMBALI
    subscriptionStatus: 'ACTIVE',
    monthlyFee: 15000,
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    branding: {
      primaryColor: '#FF6B00',
      secondaryColor: '#00A86B',
      fontTitle: 'Poppins',
      fontBody: 'Plus Jakarta Sans',
      googleReviewUrl: 'https://maps.app.goo.gl/mgcaferesto',
      phone: '+221 77 458 74 74',
      whatsapp: '+221 77 458 74 74',
      address: 'HLM Route de Mbour, Thiès',
      website: 'https://louametay.sn',
      instagram: 'mgcaferesto'
    },
    tablesCount: 12,
    zones: null,
    categories: [
      {
        name: 'Petit-Déjeuner',
        icon: '🥐',
        displayOrder: 1,
        items: [
          { name: 'Croque-Monsieur', description: 'Pain toasté doré au beurre, garniture jambon de dinde et fromage fondant.', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80' },
          { name: 'Croque Madame', description: 'Croque-monsieur gourmand surmonté d\'un œuf au plat coulant.', price: 2000, imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80' },
          { name: 'Omelette Espagnole', description: 'Omelette généreuse aux pommes de terre fondantes et oignons doux.', price: 2000, imageUrl: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80' },
          { name: 'Omelette Nature', description: 'Omelette baveuse ou bien cuite avec herbes fraîches et beurre.', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80' },
        ]
      },
      {
        name: 'Boissons Chaudes',
        icon: '☕',
        displayOrder: 2,
        items: [
          { name: 'Café au Lait', description: 'Café richement torréfié mélangé à du lait chaud onctueux et mousseux.', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80' },
          { name: 'Café Expresso', description: 'Expresso serré intense pur arabica d\'Afrique.', price: 800, imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80' },
          { name: 'Café Stick', description: 'Café soluble rapide et tonique.', price: 500, imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80' },
          { name: 'Thé Lipton', description: 'Thé noir chaud ou thé vert servi avec sucre et menthe.', price: 500, imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80' },
        ]
      },
      {
        name: 'Nos Plats',
        icon: '🍗',
        displayOrder: 3,
        items: [
          { name: 'Poulet Entier', description: 'Poulet fermier entier mariné aux aromates et rôti à point.', price: 6500, isDailySpecial: true, imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80' },
          { name: 'Demi Poulet', description: 'Demi-poulet braisé aux épices et jus d\'oignons caramélisés.', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80' },
          { name: 'Poulet Pané Entier', description: 'Poulet entier croustillant avec panure dorée maison.', price: 8000, imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80' },
          { name: 'Demi-Poulet Pané', description: 'Demi-poulet ultra croustillant servi avec sauce tartare.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80' },
          { name: 'Filet de Bœuf Roquefort', description: 'Filet de bœuf tendre nappé d\'une sauce onctueuse au roquefort.', price: 5500, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
          { name: 'Filet de Bœuf Nature', description: 'Pièce de filet de bœuf pur grillée selon cuisson désirée.', price: 4500, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
          { name: 'Fricassée à la Crevette', description: 'Crevettes fraîches sautées à l\'ail, poivrons et sauce tomate légère.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80' },
          { name: 'Fricassée de Poulet', description: 'Émincé de poulet mijoté aux petits légumes et crème aromatique.', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80' },
          { name: 'Brochettes de Bœuf', description: 'Brochettes de bœuf mariné au piment doux et oignons braisés.', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80' },
          { name: 'Brochettes de Poulet', description: 'Brochettes de blancs de poulet marinés et dorés au grill.', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80' },
          { name: 'Thof Grillé', description: 'Mérou blanc Thiof frais grillé avec alloco et sauce verte.', price: 4500, imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80' },
          { name: 'Daurade Grillé', description: 'Daurade royale entière grillée au feu de bois.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80' },
          { name: 'Dibi Viande 1K', description: '1 Kilo de viande de mouton braisée au feu de bois façon thiessoise.', price: 8000, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80' },
          { name: 'Dibi Viande 500G', description: '500g de dibi de mouton grillé avec oignons et moutarde.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80' },
          { name: 'Poulet Entier Dibi', description: 'Poulet entier façon dibiterie braisé aux oignons piquants.', price: 6500, imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80' },
          { name: 'Demi-Poulet Dibi', description: 'Demi-poulet braisé à la moutarde et piment vert.', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80' },
        ]
      },
      {
        name: 'Pizzas',
        icon: '🍕',
        displayOrder: 4,
        items: [
          { name: 'Pizza Reine', description: 'Sauce tomate, mozzarella, jambon blanc et champignons frais.', price: 4500, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pizza Fruits de Mer', description: 'Sauce tomate, crevettes, calamars, moules et mozzarella.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pizza Madiba', description: 'Recette spéciale : viande épicée, poivrons, oignons et double fromage.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pizza Bolognaise', description: 'Sauce bolognaise pur bœuf mijotée et mozzarella.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pizza Volaille', description: 'Crème, émincé de poulet rôti, champignons et fromage.', price: 4500, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pizza Marguerita', description: 'Sauce tomate classique, mozzarella et basilic frais.', price: 3000, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pizza Chawarma', description: 'Viande marinée chawarma, crème à l\'ail, oignons et mozzarella.', price: 4500, imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pizza Oriental', description: 'Merguez épicées, poivrons, oignons, sauce tomate et mozzarella.', price: 4500, imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80' },
        ]
      },
      {
        name: 'Pâtes',
        icon: '🍝',
        displayOrder: 5,
        items: [
          { name: 'Spaghetti Bolognaise', description: 'Spaghetti al dente avec sauce bolognaise maison.', price: 3000, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281072?auto=format&fit=crop&w=800&q=80' },
          { name: 'Spaghetti à la Viande', description: 'Spaghetti aux morceaux de bœuf braisé et sauce tomate.', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281072?auto=format&fit=crop&w=800&q=80' },
          { name: 'Spaghetti au Poulet', description: 'Spaghetti sautés avec émincé de poulet et légumes.', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281072?auto=format&fit=crop&w=800&q=80' },
          { name: 'Vermicelle Viande', description: 'Vermicelles de blé vapeur avec sauce riche à la viande.', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80' },
          { name: 'Vermicelle Poulet', description: 'Vermicelles cuits vapeur avec morceaux de poulet doré.', price: 2000, imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80' },
          { name: 'Couscous Viande', description: 'Couscous de mil ou blé avec ragoût de viande de bœuf.', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80' },
          { name: 'Couscous Poulet', description: 'Couscous fin avec sauce au poulet et légumes mijotés.', price: 2000, imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80' },
        ]
      },
    ]
  },

  // ============================================================================
  // RESTAURANT 2 : Sam's Restaurant (Thiès) -> Pack PRO / Démo Pro
  // Compte Démo : demo.pro@louametay.sn / Demo123!
  // ============================================================================
  {
    id: 'tenant_sams_restaurant',
    businessName: "Chez Collé (Sam's)",
    subdomain: 'chez-colle',
    ownerName: "Collé Cissé",
    phone: '+221 77 458 74 74',
    address: 'Avenue Lamine Guèye, Thiès',
    city: 'Thiès',
    currentPlanId: 'cmtptjg1s001vafno5uo0k2w6', // NIO FAR
    subscriptionStatus: 'ACTIVE',
    monthlyFee: 25000,
    logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    branding: {
      primaryColor: '#00A86B',
      secondaryColor: '#FF6B00',
      fontTitle: 'Montserrat',
      fontBody: 'Roboto',
      googleReviewUrl: 'https://maps.app.goo.gl/chezcolle',
      phone: '+221 77 458 74 74',
      whatsapp: '+221 77 458 74 74',
      address: 'Avenue Lamine Guèye, Thiès',
      website: 'https://chezcolle.sn',
      instagram: 'chezcolle'
    },
    tablesCount: 14,
    zones: null,
    categories: [
      {
        name: 'Entrées Froides',
        icon: '🥗',
        displayOrder: 1,
        items: [
          { name: "Salade Sam's Prestige", description: 'Mesclun croquant, poulet grillé, maïs, tomates cerises et vinaigrette prestige.', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80' },
          { name: 'Salade de Crudités', description: 'Assortiment de légumes frais râpés de saison avec vinaigrette légère.', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80' },
          { name: 'Salade Océane', description: 'Fruits de mer marinés au citron vert sur lit de salade croquante.', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80' },
          { name: 'Salade d\'Avocat au Thon', description: 'Demi-avocats mûrs garnis de thon blanc émietté et mayonnaise.', price: 3900, imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80' },
          { name: 'Salade de Crevette', description: 'Grosses crevettes fraîches de l\'Atlantique, pamplemousse et sauce cocktail.', price: 3900, imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80' },
          { name: 'Salade Fermière', description: 'Salade gourmande avec aiguillettes de poulet, fromage et œufs durs.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80' },
          { name: 'Salade Niçoise', description: 'Thon blanc, œufs durs, olives noires, pommes de terre et haricots verts.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80' },
          { name: 'Salade Fruits de Mer', description: 'Cocktail de crevettes, calamars et poulpe mariné.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80' },
        ]
      },
      {
        name: 'Entrées Chaudes / Locaux',
        icon: '🍲',
        displayOrder: 2,
        items: [
          { name: 'Assiette de Nems', description: 'Nems croustillants faits maison avec sauce aigre-douce et menthe.', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80' },
          { name: 'Soupe à la Sénégalaise', description: 'Bouillon traditionnel parfumé aux aromates du terroir et morceaux de viande.', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80' },
          { name: 'Beignet de Crevette', description: 'Beignets de crevettes enrobés d\'une pâte légère et croustillante.', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80' },
          { name: 'Yassa Poulet', description: 'Plat national au poulet mariné au citron vert et oignons caramélisés.', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80' },
          { name: 'Yassa Dorade', description: 'Dorade fraîche braisée servie avec une sauce aux oignons et citron.', price: 2000, imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80' },
          { name: 'Thiéboudiène / Athieke Poulet', description: 'Riz au poisson authentique ou attiéké ivoirien avec poulet doré.', price: 2500, isDailySpecial: true, imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80' },
        ]
      },
      {
        name: 'Viandes & Grillades',
        icon: '🥩',
        displayOrder: 3,
        items: [
          { name: 'Côte de Bœuf Grillé', description: 'Belle pièce de bœuf grillée servie avec frites maison et sauce poivre.', price: 6000, isDailySpecial: true, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
          { name: 'Filet de Bœuf Nature', description: 'Filet de bœuf tendre cuit selon votre convenance.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
          { name: "Brochette Sam's", description: 'Brochettes mixtes bœuf et poulet marinées aux épices du chef.', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80' },
          { name: 'Dibi 1Kg', description: '1 Kilo de dibi d\'agneau braisé au feu de bois avec moutarde et oignons.', price: 7000, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80' },
          { name: 'Dibi 500g', description: '500g de dibi de mouton grillé et assaisonné.', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80' },
          { name: 'Poulet Entier', description: 'Poulet fermier entier rôti aux épices.', price: 7000, imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80' },
          { name: 'Poulet Basquaise', description: 'Poulet mijoté dans une sauce tomate aux poivrons et oignons doux.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80' },
          { name: 'Demi-Poulet Pané', description: 'Demi-poulet pané croustillant servi avec sauce maison.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80' },
        ]
      },
      {
        name: 'Burgers & Sandwiches',
        icon: '🍔',
        displayOrder: 4,
        items: [
          { name: 'Simple Burger', description: 'Steak pur bœuf grillé, salade, tomate et sauce burger.', price: 1300, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
          { name: 'Double Burger', description: 'Double steak haché pur bœuf, double fromage et garniture fraîche.', price: 3000, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
          { name: 'Royal Burger', description: 'Steak de bœuf, bacon de volaille, cheddar fondant et œuf à cheval.', price: 1800, imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80' },
          { name: 'Cheese Burger', description: 'Steak pur bœuf, tranche de cheddar fondu et sauce spéciale.', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80' },
          { name: 'Chicken Burger', description: 'Filet de poulet pané croustillant avec sauce mayonnaise et salade.', price: 2000, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
          { name: 'Sandwich Steak', description: 'Pain baguette, steak émincé sauté aux oignons et frites.', price: 1300, imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80' },
          { name: 'Sandwich Poulet', description: 'Pain baguette, émincé de poulet mariné et sauce crème.', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80' },
        ]
      },
      {
        name: 'Pizzas',
        icon: '🍕',
        displayOrder: 5,
        items: [
          { name: "Pizza Sam's Prestiga", description: 'Sauce tomate, mozzarella, bœuf haché, poulet fumé, olives et origan.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pizza Margherita', description: 'Sauce tomate maison, mozzarella fior di latte et basilic frais.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pizza Thon', description: 'Sauce tomate, thon émietté, oignons, olives noires et mozzarella.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pizza Viande Hachée', description: 'Sauce tomate, viande hachée pur bœuf, poivrons et mozzarella.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' },
        ]
      },
      {
        name: 'Tacos & Wraps',
        icon: '🌯',
        displayOrder: 6,
        items: [
          { name: 'Tacos Viande', description: 'Tacos avec viande hachée assaisonnée, frites et sauce fromagère.', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80' },
          { name: 'Tacos Poulet', description: 'Tacos avec émincé de poulet grillé, frites et sauce fromagère.', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80' },
          { name: 'Tacos Mixte', description: 'Tacos double viande (bœuf et poulet) avec frites et sauce fromagère.', price: 3000, imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80' },
          { name: 'Wrap\'s Poulet', description: 'Galette de blé avec poulet pané croustillant et crudités fraîches.', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80' },
          { name: 'Wrap\'s Viande', description: 'Galette de blé avec lamelles de bœuf assaisonné et crudités.', price: 2000, imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80' },
          { name: 'Wrap\'s Sam\'s', description: 'Wrap signature avec mélange viandes, fromage fondant et sauce chef.', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80' },
        ]
      },
    ]
  },

  // ============================================================================
  // RESTAURANT 3 : Anima Pizzeria (Dakar) -> Pack PREMIUM
  // ============================================================================
  {
    id: 'tenant_anima_pizzeria',
    businessName: 'Anima Pizzeria',
    subdomain: 'anima-pizzeria',
    ownerName: 'Direction Anima',
    phone: '+221 77 458 74 74',
    address: 'Plage BCEAO, Yoff / Guédiawaye, Dakar',
    city: 'Dakar',
    currentPlanId: 'cmtptjhkb0034afnout2sb7np', // XÉWEUL
    subscriptionStatus: 'ACTIVE',
    monthlyFee: 35000,
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
    branding: {
      primaryColor: '#DC2626',
      secondaryColor: '#F59E0B',
      fontTitle: 'Playfair Display',
      fontBody: 'Lato',
      googleReviewUrl: 'https://maps.app.goo.gl/animapizzeria',
      phone: '+221 77 458 74 74',
      whatsapp: '+221 77 458 74 74',
      address: 'Plage BCEAO, Yoff / Guédiawaye, Dakar',
      website: 'https://animapizza.sn',
      instagram: 'animapizzeria'
    },
    tablesCount: 20,
    zones: null,
    categories: [
      {
        name: 'Pizzas Signature',
        icon: '🍕',
        displayOrder: 1,
        items: [
          { name: 'Napoletana', description: 'Sauce tomate San Marzano, mozzarella, anchois, câpres et huile d\'olive.', price: 5000, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80' },
          { name: 'Margarita (GM)', description: 'Grand format : Sauce tomate, mozzarella et basilic frais.', price: 4500, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80' },
          { name: 'Margarita (PM)', description: 'Petit format : Sauce tomate, mozzarella et basilic frais.', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80' },
          { name: 'Dakaroise (GM)', description: 'Grand format : Base crème, dibi d\'agneau mariné, oignons rouges et piment doux.', price: 5000, isDailySpecial: true, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' },
          { name: 'Dakaroise (PM)', description: 'Petit format : Base crème, dibi d\'agneau mariné, oignons rouges et piment doux.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pollo Bianco (GM)', description: 'Grand format : Sauce blanche, émincé de poulet mariné et fromage.', price: 5000, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pollo Bianco (PM)', description: 'Petit format : Sauce blanche, émincé de poulet mariné et fromage.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' },
          { name: 'Quattro Formaggi (GM)', description: 'Grand format : Mozzarella, gorgonzola, parmesan et chèvre.', price: 6000, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
          { name: 'Quattro Formaggi (PM)', description: 'Petit format : Mozzarella, gorgonzola, parmesan et chèvre.', price: 5000, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
          { name: 'Calzone', description: 'Pizza soufflée fermée garnie jambon, œuf, champignons et fromage.', price: 5000, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
          { name: 'Al Tonno', description: 'Sauce tomate, thon blanc, oignons confits, olives et mozzarella.', price: 5000, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
          { name: 'Quattro Stagioni (GM)', description: 'Grand format 4 Saisons : Jambon, champignons, cœurs d\'artichauts et olives.', price: 6000, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
          { name: 'Quattro Stagioni (PM)', description: 'Petit format 4 Saisons : Jambon, champignons, cœurs d\'artichauts et olives.', price: 5000, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
          { name: 'Fiesta (GM)', description: 'Grand format festif : Viandes mixtes, poivrons, piments et double fromage.', price: 7500, imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80' },
          { name: 'Fiesta (PM)', description: 'Petit format festif : Viandes mixtes, poivrons, piments et double fromage.', price: 5500, imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80' },
          { name: 'Marémonti (GM)', description: 'Grand format Mer & Montagne : Crevettes et champignons sautés.', price: 6000, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' },
          { name: 'Marémonti (PM)', description: 'Petit format Mer & Montagne : Crevettes et champignons sautés.', price: 5000, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pesce (GM)', description: 'Grand format Fruits de Mer : Calamars, crevettes et moules.', price: 6000, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pesce (PM)', description: 'Petit format Fruits de Mer : Calamars, crevettes et moules.', price: 5000, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' },
          { name: 'Reine (GM)', description: 'Grand format : Jambon blanc, champignons frais et mozzarella.', price: 5000, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
          { name: 'Reine (PM)', description: 'Petit format : Jambon blanc, champignons frais et mozzarella.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
          { name: 'Primavera (GM)', description: 'Grand format Végétarienne : Tomates fraîches, roquette et légumes grillés.', price: 5000, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80' },
          { name: 'Primavera (PM)', description: 'Petit format Végétarienne : Tomates fraîches, roquette et légumes grillés.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80' },
          { name: 'Anima (GM)', description: 'Grand format Signature Anima : Garniture d\'exception du chef.', price: 8000, imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80' },
          { name: 'Anima (PM)', description: 'Petit format Signature Anima : Garniture d\'exception du chef.', price: 6000, imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pizza Burrata', description: 'Pizza gastronomique avec Burrata fraîche entière, roquette et pesto.', price: 9000, imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pizza Dibi (GM)', description: 'Grand format : Dibi d\'agneau braisé, sauce crème et oignons doux.', price: 7000, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pizza Dibi (PM)', description: 'Petit format : Dibi d\'agneau braisé, sauce crème et oignons doux.', price: 5500, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' },
        ]
      },
      {
        name: 'Snacks & Paninis',
        icon: '🍟',
        displayOrder: 2,
        items: [
          { name: 'Poutine Dibi Viande (GM)', description: 'Grand format : Frites, fromage coulant, sauce brune et dibi d\'agneau.', price: 5000, imageUrl: 'https://images.unsplash.com/photo-1586805608485-add336722759?auto=format&fit=crop&w=800&q=80' },
          { name: 'Poutine Dibi Viande (PM)', description: 'Petit format : Frites, fromage coulant, sauce brune et dibi d\'agneau.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1586805608485-add336722759?auto=format&fit=crop&w=800&q=80' },
          { name: 'Lotte Pané', description: 'Morceaux de lotte fraîche panée servis avec frites et sauce tartare.', price: 6000, imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80' },
          { name: 'Panini Viande', description: 'Pain panini grillé, bœuf haché assaisonné et fromage fondu.', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80' },
          { name: 'Panini Poulet', description: 'Pain panini croustillant, poulet mariné et mozzarella fondante.', price: 3000, imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80' },
          { name: 'Panini Mix', description: 'Panini double garniture bœuf et poulet avec sauce spéciale.', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80' },
          { name: 'Tacos Viande', description: 'Tacos français garni de viande de bœuf, frites et sauce fromagère.', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80' },
          { name: 'Tacos Poulet', description: 'Tacos garni de poulet grillé, frites et sauce fromagère.', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80' },
          { name: 'Tacos Mix', description: 'Tacos généreux mixte bœuf et poulet avec frites.', price: 3000, imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80' },
        ]
      },
      {
        name: 'Desserts & Collations',
        icon: '🍰',
        displayOrder: 3,
        items: [
          { name: 'Tiramisu', description: 'Véritable tiramisu italien maison au café espresso et mascarpone.', price: 3000, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pizza Nutella', description: 'Pizza tiède nappée de Nutella fondant et bananes fraîches.', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
          { name: 'Cake', description: 'Part de gâteau moelleux maison.', price: 1000, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80' },
          { name: 'Salade de Fruits', description: 'Fruits frais de saison découpés (mangue, ananas, papaye).', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
          { name: 'Chocolat Fondant & Glace', description: 'Cœur coulant au chocolat noir servi avec boule de glace vanille.', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80' },
          { name: 'Cocktail', description: 'Cocktail de fruits frais pressés sans alcool.', price: 2000, imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80' },
          { name: 'Jus Locaux', description: 'Jus de Bissap, Bouye ou Gingembre frais maison.', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80' },
        ]
      },
    ]
  },

  // ============================================================================
  // RESTAURANT 4 : Hôtel Résidence Lat-Dior (Thiès) -> Pack PREMIUM (5 Langues)
  // Compte Démo : demo.premium@louametay.sn / Demo123!
  // ============================================================================
  {
    id: 'tenant_hotel_lat_dior',
    businessName: 'Hôtel Restaurant Cayor (Lat-Dior)',
    subdomain: 'hotel-cayor',
    ownerName: 'Direction Hôtel Cayor',
    phone: '+221 77 458 74 74',
    address: 'Quartier Résidentiel Lat-Dior, Thiès',
    city: 'Thiès',
    currentPlanId: 'cmtptjkqb005mafno5kczfxh6', // TERANGA
    subscriptionStatus: 'ACTIVE',
    monthlyFee: 45000,
    logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    branding: {
      primaryColor: '#D97706',
      secondaryColor: '#1E293B',
      fontTitle: 'Cinzel',
      fontBody: 'Plus Jakarta Sans',
      googleReviewUrl: 'https://maps.app.goo.gl/hotelcayor',
      phone: '+221 77 458 74 74',
      whatsapp: '+221 77 458 74 74',
      address: 'Quartier Résidentiel Lat-Dior, Thiès',
      instagram: 'hotelcayor',
      grandfathered: {
        isGrandfathered: true,
        guaranteedMonthlyFee: 45000,
        catalogPrice: 65000,
        grandfatheredUntil: '2027-09-08T00:00:00.000Z',
        targetPlanSlug: 'teranga',
        reviewNote: 'Tarif préférentiel garanti 12 mois à 45 000 FCFA au lieu de 65 000 FCFA. Réexamen le 08/09/2027 par la direction MDA Arts Work.',
      }
    },
    tablesCount: 24,
    zones: [
      { name: 'Salle Climatisée', start: 1, end: 8 },
      { name: 'Terrasse Ombragée', start: 9, end: 16 },
      { name: 'Piscine & Lounge', start: 17, end: 24 },
    ],
    categories: [
      {
        name: 'Entrées',
        icon: '🥗',
        displayOrder: 1,
        items: [
          { name: 'Salade Niçoise', description: 'Salade méditerranéenne au thon blanc, œufs durs, olives noires et haricots verts.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80' },
          { name: 'Salade César', description: 'Cœur de romaine, aiguillettes de poulet grillé, croûtons à l\'ail et copeaux de parmesan.', price: 4500, imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80' },
          { name: 'Salade de Crudités', description: 'Légumes croquants du potager et vinaigrette légère aux herbes.', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80' },
          { name: 'Assiette de Nems', description: 'Nems croustillants faits maison avec sauce nuoc-mâm et menthe fraîche.', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80' },
          { name: 'Potage du Jour', description: 'Velouté chaud réconfortant préparé selon le marché du matin.', price: 1500, imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80' },
        ]
      },
      {
        name: 'Viandes & Poulet',
        icon: '🥩',
        displayOrder: 2,
        items: [
          { name: 'Escalope de Poulet Pané', description: 'Escalope de poulet tendre enrobée d\'une panure dorée et croustillante.', price: 5000, imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80' },
          { name: 'Poulet Grillé à l\'Estragon', description: 'Morceaux de poulet grillés nappés d\'une sauce crémeuse à l\'estragon frais.', price: 4500, imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80' },
          { name: 'Cordon Bleu', description: 'Escalope fourrée au jambon et fromage fondant, panée et dorée au beurre.', price: 6000, imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80' },
          { name: 'Brochette de Poulet', description: 'Brochettes de suprême de poulet mariné aux herbes et grillé minute.', price: 4500, imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80' },
          { name: 'Filet de Bœuf', description: 'Pièce maîtresse de filet de bœuf extra-tendre avec réduction au jus corsé.', price: 6000, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
          { name: 'Entrecôte Grillé à la Crème', description: 'Entrecôte généreuse grillée accompagnée d\'une sauce onctueuse à la crème.', price: 7500, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
        ]
      },
      {
        name: 'Poissons',
        icon: '🐟',
        displayOrder: 3,
        items: [
          { name: 'Thiof Grillé à la Citronnelle', description: 'Mérou blanc Thiof braisé parfumé à la citronnelle fraîche et alloco.', price: 6000, isDailySpecial: true, imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80' },
          { name: 'Daurade Grillé', description: 'Daurade royale entière grillée au feu de bois avec riz parfumé.', price: 5000, imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80' },
          { name: 'Lotte Pané', description: 'Morceaux tendres de lotte panés servis avec sauce tartare maison.', price: 5000, imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80' },
        ]
      },
      {
        name: 'Pâtes & Pizzas',
        icon: '🍝',
        displayOrder: 4,
        items: [
          { name: 'Spaghetti Bolognaise', description: 'Spaghetti al dente avec coulis de tomates mûres et pur bœuf haché.', price: 5000, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281072?auto=format&fit=crop&w=800&q=80' },
          { name: 'Lasagnes', description: 'Lasagnes maison gratinées au four avec pur bœuf, béchamel et mozzarella.', price: 6000, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281072?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pizza Reine', description: 'Sauce tomate mijotée, mozzarella, jambon blanc et champignons.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pizza Fruits de Mer', description: 'Garniture généreuse de crevettes, calamars et moules avec mozzarella.', price: 4500, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' },
          { name: 'Pizza Orientale', description: 'Merguez épicées, poivrons doux, oignons caramélisés et fromage.', price: 4500, imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80' },
        ]
      },
      {
        name: 'Desserts',
        icon: '🍰',
        displayOrder: 5,
        items: [
          { name: 'Crêpe au Chocolat', description: 'Crêpe fine tiède généreusement nappée de chocolat et chantilly.', price: 3000, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
          { name: 'Salade de Fruits', description: 'Mélange de fruits exotiques frais parfumés à la menthe.', price: 2500, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
          { name: 'Moelleux au Chocolat', description: 'Gâteau coulant pur cacao servi avec une boule de glace vanille.', price: 3500, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80' },
          { name: 'Tiramisu', description: 'Véritable tiramisu italien au mascarpone et café espresso.', price: 4000, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80' },
        ]
      },
      {
        name: 'Formules',
        icon: '🍽️',
        displayOrder: 6,
        items: [
          { name: 'Yassa Poulet ou Poisson', description: 'Formule déjeuner rapide : Yassa authentique au poulet ou poisson frais.', price: 3000, imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80' },
          { name: 'Plat du jour', description: 'Création du chef selon le marché du matin (ex: Ceebu Jën Pëndaa Mbaye, Mafé ou Dibi).', price: 3000, isDailySpecial: true, imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80' },
        ]
      },
    ]
  }
];

async function main() {
  console.log('🚀 LOU AME TAY ? - DÉMARRAGE DU SEED DES DONNÉES RÉELLES...');

  for (const plan of DEFAULT_PLANS) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        description: plan.description,
        colorTheme: plan.colorTheme,
        isRecommended: plan.isRecommended,
        isActive: plan.isActive,
      },
      create: plan,
    });
  }

  for (const feat of DEFAULT_FEATURES) {
    await prisma.feature.upsert({
      where: { keyName: feat.keyName },
      update: {
        label: feat.label,
        category: feat.category,
        valueType: feat.valueType,
      },
      create: feat,
    });
  }

  console.log('🧹 Purge des données...');
  await prisma.menuItemTranslation.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.tableSession.deleteMany();
  await prisma.upsellRule.deleteMany();
  await prisma.comboDeal.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.tenant.deleteMany();

  for (const rData of RESTAURANTS_DATA) {
    const tenant = await prisma.tenant.create({
      data: {
        id: rData.id,
        businessName: rData.businessName,
        subdomain: rData.subdomain,
        ownerName: rData.ownerName,
        phone: rData.phone,
        address: rData.address,
        city: rData.city,
        currentPlanId: rData.currentPlanId,
        subscriptionStatus: rData.subscriptionStatus,
        monthlyFee: rData.monthlyFee,
        logoUrl: rData.logoUrl,
        bannerUrl: rData.bannerUrl,
        branding: rData.branding || null,
        subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        lastSeenAt: new Date(),
      },
    });

    for (let tableNum = 1; tableNum <= rData.tablesCount; tableNum++) {
      let label = `Table ${tableNum < 10 ? '0' + tableNum : tableNum}`;
      if (rData.zones) {
        const foundZone = rData.zones.find(z => tableNum >= z.start && tableNum <= z.end);
        if (foundZone) {
          label = `${label} (${foundZone.name})`;
        }
      }

      await prisma.table.create({
        data: {
          tenantId: tenant.id,
          tableNumber: tableNum,
          label: label,
          isActive: true,
        },
      });
    }

    for (const catData of rData.categories) {
      const category = await prisma.category.create({
        data: {
          tenantId: tenant.id,
          name: catData.name,
          icon: catData.icon,
          displayOrder: catData.displayOrder,
        },
      });

      for (const itemData of catData.items) {
        await prisma.menuItem.create({
          data: {
            tenantId: tenant.id,
            categoryId: category.id,
            name: itemData.name,
            description: itemData.description,
            price: itemData.price,
            imageUrl: itemData.imageUrl,
            isDailySpecial: itemData.isDailySpecial ?? false,
            isAvailable: true,
          },
        });
      }
    }
  }

  console.log('✅ Seed terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('Erreur :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
