// ==============================================================================
// 🇸🇳 LOU AME TAY ? - SCRIPT PRISMA SEED EXHAUSTIF (PILOTES THIÈS & DAKAR)
// Éditeur : MDA Arts Work / Médias Graphisme Sénégal (+221 77 458 74 74)
// Menus complets avec prix réels certifiés et traductions multilingues
// ==============================================================================

import { PrismaClient, Language, ValueType, SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ------------------------------------------------------------------------------
// 1. PLANS & FEATURES SAAS (CONSERVÉS / UPSERT INTÈGRE)
// ------------------------------------------------------------------------------
const DEFAULT_PLANS = [
  {
    id: 'plan_starter',
    name: 'Starter',
    slug: 'starter',
    price: 15000,
    currency: 'FCFA',
    description: 'Idéal pour démarrer la visibilité digitale à moindre coût (Menu consultation).',
    colorTheme: '#64748b',
    isRecommended: false,
    isActive: true,
  },
  {
    id: 'plan_pro',
    name: 'Pro',
    slug: 'pro',
    price: 25000,
    currency: 'FCFA',
    description: 'Le choix le plus populaire : cuisine en direct, alertes sonores et paiements Wave/OM.',
    colorTheme: '#FF6B00',
    isRecommended: true,
    isActive: true,
  },
  {
    id: 'plan_premium',
    name: 'Premium VIP',
    slug: 'premium',
    price: 45000,
    currency: 'FCFA',
    description: 'Pour les grands restaurants et complexes : Multi-zones, 5 Langues, Écran TV 3 Modes et VIP 24/7.',
    colorTheme: '#00A86B',
    isRecommended: false,
    isActive: true,
  },
];

const DEFAULT_FEATURES = [
  { id: 'feat_photos', keyName: 'MAX_PHOTOS', label: 'Photos Plats HD', category: 'CORE', valueType: 'NUMERIC' as ValueType },
  { id: 'feat_tables', keyName: 'MAX_TABLES', label: 'Tables & QR Codes', category: 'CORE', valueType: 'NUMERIC' as ValueType },
  { id: 'feat_kds', keyName: 'KITCHEN_DISPLAY_KDS', label: 'Écran Cuisine KDS & Alerte Sonore', category: 'OPERATION', valueType: 'BOOLEAN' as ValueType },
  { id: 'feat_wave_om', keyName: 'WAVE_ORANGE_MONEY', label: 'Paiements Mobiles Wave & Orange Money', category: 'BILLING', valueType: 'BOOLEAN' as ValueType },
  { id: 'feat_basic_stats', keyName: 'BASIC_STATS', label: 'Statistiques de Caisse Standard', category: 'CORE', valueType: 'BOOLEAN' as ValueType },
  { id: 'feat_multizone', keyName: 'MULTI_ZONE', label: 'Multi-Zones (Salle, Terrasse, Piscine)', category: 'OPERATION', valueType: 'BOOLEAN' as ValueType },
  { id: 'feat_bilingual', keyName: 'BILINGUAL_MENU', label: 'Menu Bilingue & Multi-Langues', category: 'MARKETING', valueType: 'BOOLEAN' as ValueType },
  { id: 'feat_multilang', keyName: 'MULTI_LANGUAGE_MENU', label: 'Menu Multilingue 5 Langues (FR, WO, EN, ES, IT)', category: 'MARKETING', valueType: 'BOOLEAN' as ValueType },
  { id: 'feat_advanced_stats', keyName: 'ADVANCED_STATS', label: 'Statistiques Avancées & Exports Excel', category: 'BILLING', valueType: 'BOOLEAN' as ValueType },
  { id: 'feat_vip_support', keyName: 'VIP_SUPPORT', label: 'Accompagnement VIP & Support Dédié 24/7', category: 'CORE', valueType: 'BOOLEAN' as ValueType },
];

// ------------------------------------------------------------------------------
// 2. DONNÉES INTÉGRALES DES RESTAURANTS PILOTES / DÉMOS
// ------------------------------------------------------------------------------
const RESTAURANTS_DATA = [
  // ============================================================================
  // RESTAURANT 1 : Madiba Restau / MG Café Resto (Thiès / Dakar) -> Pack STARTER / PRO
  // Compte Démo Commercial : demo.starter@louametay.sn / Demo123!
  // ============================================================================
  {
    id: 'tenant_madiba_restau',
    businessName: 'MG Café Resto (Madiba)',
    subdomain: 'mg-cafe-resto',
    ownerName: 'Moussa Guèye',
    phone: '+221 77 458 74 74',
    address: 'HLM Route de Mbour, Thiès / Plateau, Dakar',
    city: 'Thiès',
    currentPlanId: 'plan_starter',
    subscriptionStatus: 'ACTIVE' as SubscriptionStatus,
    monthlyFee: 15000,
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
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
  // RESTAURANT 2 : Sam's Restaurant / Chez Collé (Thiès) -> Pack PRO
  // Compte Démo Commercial : demo.pro@louametay.sn / Demo123!
  // ============================================================================
  {
    id: 'tenant_sams_restaurant',
    businessName: "Chez Collé (Sam's)",
    subdomain: 'chez-colle',
    ownerName: "Collé Cissé",
    phone: '+221 77 458 74 74',
    address: 'Avenue Lamine Guèye, Thiès, Sénégal',
    city: 'Thiès',
    currentPlanId: 'plan_pro',
    subscriptionStatus: 'ACTIVE' as SubscriptionStatus,
    monthlyFee: 25000,
    logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
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
  // RESTAURANT 3 : Anima Pizzeria (Dakar - Plage BCEAO) -> Pack PREMIUM
  // ============================================================================
  {
    id: 'tenant_anima_pizzeria',
    businessName: 'Anima Pizzeria',
    subdomain: 'anima-pizzeria',
    ownerName: 'Direction Anima',
    phone: '+221 77 458 74 74',
    address: 'Plage BCEAO, Yoff / Guédiawaye, Dakar',
    city: 'Dakar',
    currentPlanId: 'plan_premium',
    subscriptionStatus: 'ACTIVE' as SubscriptionStatus,
    monthlyFee: 45000,
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
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
  // RESTAURANT 4 : Hôtel Résidence Lat-Dior / Hôtel Cayor -> Pack PREMIUM (5 Langues)
  // Compte Démo Commercial : demo.premium@louametay.sn / Demo123!
  // ============================================================================
  {
    id: 'tenant_hotel_lat_dior',
    businessName: 'Hôtel Restaurant Cayor (Lat-Dior)',
    subdomain: 'hotel-cayor',
    ownerName: 'Direction Hôtel Cayor',
    phone: '+221 77 458 74 74',
    address: 'Quartier Résidentiel Lat-Dior, Thiès / Saly Portudal',
    city: 'Thiès',
    currentPlanId: 'plan_premium',
    subscriptionStatus: 'ACTIVE' as SubscriptionStatus,
    monthlyFee: 45000,
    logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
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
          {
            name: 'Salade Niçoise',
            description: 'Salade méditerranéenne au thon blanc, œufs durs, olives noires et haricots verts.',
            price: 4000,
            imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Niçoise Salad', description: 'Mediterranean salad with white tuna, boiled eggs and olives.' },
              ES: { name: 'Ensalada Nicosiada', description: 'Ensalada tradicional con atún, huevos cocidos y aceitunas.' },
              IT: { name: 'Insalata Nizzarda', description: 'Insalata classica con tonno, uova sode e olive.' },
              WO: { name: 'Salade Niçoise', description: 'Salat bu am jën thon ak nen ak pompiteer.' },
            }
          },
          {
            name: 'Salade César',
            description: 'Cœur de romaine, aiguillettes de poulet grillé, croûtons à l\'ail et copeaux de parmesan.',
            price: 4500,
            imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Caesar Salad', description: 'Romaine lettuce, grilled chicken breast, garlic croutons and parmesan.' },
              ES: { name: 'Ensalada César', description: 'Lechuga romana, pechuga de pollo a la plancha, picatostes y parmesano.' },
              IT: { name: 'Insalata Cesare', description: 'Lattuga romana, petto di pollo grigliato, crostini e parmigiano.' },
              WO: { name: 'Salade César', description: 'Salat bu bees ak ginaar bu ñor ak formaas parmesan.' },
            }
          },
          {
            name: 'Salade de Crudités',
            description: 'Légumes croquants du potager et vinaigrette légère aux herbes.',
            price: 3500,
            imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Fresh Garden Salad', description: 'Fresh raw garden vegetables with herb vinaigrette.' },
              ES: { name: 'Ensalada de Crudités', description: 'Verduras frescas de la huerta con vinagreta de hierbas.' },
              IT: { name: 'Insalata di Crudité', description: 'Verdure fresche dell\'orto con vinaigrette alle erbe.' },
              WO: { name: 'Salade de Crudités', description: 'Salat légum yu bees ak vinaigrette.' },
            }
          },
          {
            name: 'Assiette de Nems',
            description: 'Nems croustillants faits maison avec sauce nuoc-mâm et menthe fraîche.',
            price: 3500,
            imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Crispy Spring Rolls', description: 'Homemade crispy spring rolls with dipping sauce.' },
              ES: { name: 'Plato de Nems Crujientes', description: 'Rollitos de primavera caseros con salsa.' },
              IT: { name: 'Involtini Primavera', description: 'Involtini croccanti fatti in casa con salsa.' },
              WO: { name: 'Nems Ginaar', description: 'Nems bu saf ak ginaar ak sauce.' },
            }
          },
          {
            name: 'Potage du Jour',
            description: 'Velouté chaud réconfortant préparé selon le marché du matin.',
            price: 1500,
            imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Soup of the Day', description: 'Fresh comforting vegetable soup prepared daily.' },
              ES: { name: 'Sopa del Día', description: 'Sopa casera caliente preparada con verduras frescas.' },
              IT: { name: 'Zuppa del Giorno', description: 'Zuppa calda confortante preparata con verdure di stagione.' },
              WO: { name: 'Soup bu Tang', description: 'Soup bu tang bu neex ak légum.' },
            }
          },
        ]
      },
      {
        name: 'Viandes & Poulet',
        icon: '🥩',
        displayOrder: 2,
        items: [
          {
            name: 'Escalope de Poulet Pané',
            description: 'Escalope de poulet tendre enrobée d\'une panure dorée et croustillante.',
            price: 5000,
            imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Breaded Chicken Cutlet', description: 'Tender chicken cutlet in a crispy golden breading.' },
              ES: { name: 'Escalope de Pollo Empanado', description: 'Escalope tierno de pollo con empanado dorado y crujiente.' },
              IT: { name: 'Cotoletta di Pollo Impanata', description: 'Cotoletta di pollo tenera con panatura dorata croccante.' },
              WO: { name: 'Poulet Pané', description: 'Ginaar bu ñu pané ba mu croustillant.' },
            }
          },
          {
            name: 'Poulet Grillé à l\'Estragon',
            description: 'Morceaux de poulet grillés nappés d\'une sauce crémeuse à l\'estragon frais.',
            price: 4500,
            imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Tarragon Grilled Chicken', description: 'Grilled chicken breast with fresh creamy tarragon sauce.' },
              ES: { name: 'Pollo a la Plancha con Estragón', description: 'Pollo a la plancha con salsa cremosa de estragón.' },
              IT: { name: 'Pollo alla Griglia all\'Estragone', description: 'Pollo alla griglia con salsa cremosa all\'estragone fresco.' },
              WO: { name: 'Poulet Grillé Estragon', description: 'Ginaar bu ñu grillé ak sauce crème estragon.' },
            }
          },
          {
            name: 'Cordon Bleu',
            description: 'Escalope fourrée au jambon et fromage fondant, panée et dorée au beurre.',
            price: 6000,
            imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Classic Cordon Bleu', description: 'Chicken schnitzel filled with turkey ham and melted cheese.' },
              ES: { name: 'Cordon Bleu Casero', description: 'Escalope relleno de jamón y queso fundido empanado.' },
              IT: { name: 'Cordon Bleu Tradizionale', description: 'Scaloppina ripiena di prosciutto e formaggio fuso impanata.' },
              WO: { name: 'Cordon Bleu', description: 'Cordon bleu ak yàpp ak formaas bu seey.' },
            }
          },
          {
            name: 'Brochette de Poulet',
            description: 'Brochettes de suprême de poulet mariné aux herbes et grillé minute.',
            price: 4500,
            imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Chicken Skewers', description: 'Marinated chicken breast skewers grilled to perfection.' },
              ES: { name: 'Brochetas de Pollo', description: 'Brochetas de pechuga de pollo marinada a la brasa.' },
              IT: { name: 'Spiedini di Pollo', description: 'Spiedini di pollo marinati alle erbe grigliati a puntino.' },
              WO: { name: 'Brochette Ginaar', description: 'Brochette ginaar bu ñu grillé ci grill.' },
            }
          },
          {
            name: 'Filet de Bœuf',
            description: 'Pièce maîtresse de filet de bœuf extra-tendre avec réduction au jus corsé.',
            price: 6000,
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Prime Beef Tenderloin Fillet', description: 'Pan-seared tender beef fillet with rich meat jus and potatoes.' },
              ES: { name: 'Solomillo de Ternera', description: 'Solomillo tierno de ternera con jugo concentrado y patatas.' },
              IT: { name: 'Filetto di Manzo alla Griglia', description: 'Filetto di manzo tenerissimo con purè e riduzione di sugo.' },
              WO: { name: 'Filet de Bœuf bu Ñor', description: 'Yàpp nag bu nooy nink bu ñu toog ak pompiteer.' },
            }
          },
          {
            name: 'Entrecôte Grillé à la Crème',
            description: 'Entrecôte généreuse grillée accompagnée d\'une sauce onctueuse à la crème.',
            price: 7500,
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Grilled Ribeye with Cream Sauce', description: 'Generous ribeye steak with rich cream sauce and fries.' },
              ES: { name: 'Entrecot a la Plancha con Crema', description: 'Entrecot jugoso a la plancha con salsa cremosa.' },
              IT: { name: 'Entrecôte alla Griglia con Crema', description: 'Entrecôte succosa alla brace con salsa alla crema.' },
              WO: { name: 'Entrecôte Grillé', description: 'Entrecôte nag bu mag bu ñu grillé ak sauce crème.' },
            }
          },
        ]
      },
      {
        name: 'Poissons',
        icon: '🐟',
        displayOrder: 3,
        items: [
          {
            name: 'Thiof Grillé à la Citronnelle',
            description: 'Mérou blanc Thiof braisé parfumé à la citronnelle fraîche et alloco.',
            price: 6000,
            isDailySpecial: true,
            imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Lemongrass Grilled Grouper (Thiof)', description: 'Fresh white grouper grilled with lemongrass and plantains.' },
              ES: { name: 'Mero a la Parrilla con Hierba Luisa', description: 'Mero blanco fresco a la parrilla con hierba de limón y plátano.' },
              IT: { name: 'Cernia Bianca alla Citronella', description: 'Cernia bianca fresca alla brace aromatizzata alla citronella.' },
              WO: { name: 'Coof bu Ñor Citronnelle', description: 'Jën coof bu mag bu ñu grillé ak citronnelle ak alloco.' },
            }
          },
          {
            name: 'Daurade Grillé',
            description: 'Daurade royale entière grillée au feu de bois avec riz parfumé.',
            price: 5000,
            imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Grilled Sea Bream', description: 'Whole grilled sea bream with seasoned aromatic rice.' },
              ES: { name: 'Dorada a la Plancha', description: 'Dorada fresca a la plancha con arroz blanco aromático.' },
              IT: { name: 'Orata alla Griglia', description: 'Orata fresca intera cotta alla griglia con riso.' },
              WO: { name: 'Daurade bu Ñor', description: 'Daurade bu bees bu ñu grillé ak ceeb.' },
            }
          },
          {
            name: 'Lotte Pané',
            description: 'Morceaux tendres de lotte panés servis avec sauce tartare maison.',
            price: 5000,
            imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Crispy Breaded Monkfish', description: 'Tender breaded monkfish nuggets served with tartar sauce.' },
              ES: { name: 'Rape Empanado Crujiente', description: 'Trozos de rape empanado con salsa tártara casera.' },
              IT: { name: 'Rana Pescatrice Impanata', description: 'Bocconcini di rana pescatrice impanati con salsa tartara.' },
              WO: { name: 'Lotte Pané', description: 'Jën lotte bu ñu pané ak sauce tartare.' },
            }
          },
        ]
      },
      {
        name: 'Pâtes & Pizzas',
        icon: '🍝',
        displayOrder: 4,
        items: [
          {
            name: 'Spaghetti Bolognaise',
            description: 'Spaghetti al dente avec coulis de tomates mûres et pur bœuf haché.',
            price: 5000,
            imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281072?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Spaghetti Bolognese', description: 'Al dente spaghetti with slow-cooked beef ragù.' },
              ES: { name: 'Espaguetis a la Boloñesa', description: 'Espaguetis con salsa boloñesa tradicional de ternera.' },
              IT: { name: 'Spaghetti alla Bolognese', description: 'Spaghetti al dente con ragù tradizionale di manzo.' },
              WO: { name: 'Spaghetti Bolognaise', description: 'Spaghetti ak sauce yàpp bu saf.' },
            }
          },
          {
            name: 'Lasagnes',
            description: 'Lasagnes maison gratinées au four avec pur bœuf, béchamel et mozzarella.',
            price: 6000,
            imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281072?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Homemade Baked Lasagna', description: 'Layers of fresh pasta, beef ragù, béchamel and melted mozzarella.' },
              ES: { name: 'Lasaña Casera al Horno', description: 'Lasaña tradicional con carne de ternera, bechamel y queso fundido.' },
              IT: { name: 'Lasagne alla Bolognese', description: 'Lasagne tradizionali al forno con ragù di carne e besciamella.' },
              WO: { name: 'Lasagne Maison', description: 'Lasagne bu am yàpp ak béchamel ak formaas.' },
            }
          },
          {
            name: 'Pizza Reine',
            description: 'Sauce tomate mijotée, mozzarella, jambon blanc et champignons.',
            price: 4000,
            imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Regina Pizza', description: 'Tomato sauce, mozzarella, ham and fresh mushrooms.' },
              ES: { name: 'Pizza Reina', description: 'Salsa de tomate, mozzarella, jamón y champiñones.' },
              IT: { name: 'Pizza Regina', description: 'Pomodoro, mozzarella, prosciutto cotto e funghi.' },
              WO: { name: 'Pizza Reine', description: 'Pizza ak tomate, mozzarella ak yàpp.' },
            }
          },
          {
            name: 'Pizza Fruits de Mer',
            description: 'Garniture généreuse de crevettes, calamars et moules avec mozzarella.',
            price: 4500,
            imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Seafood Pizza', description: 'Tomato sauce, mozzarella, fresh shrimps and squid.' },
              ES: { name: 'Pizza de Mariscos', description: 'Salsa de tomate, mozzarella y mariscos variados.' },
              IT: { name: 'Pizza ai Frutti di Mare', description: 'Pomodoro, mozzarella, gamberi e calamari freschi.' },
              WO: { name: 'Pizza Jën ak Crevettes', description: 'Pizza ak crevettes ak jën ak mozzarella.' },
            }
          },
          {
            name: 'Pizza Orientale',
            description: 'Merguez épicées, poivrons doux, oignons caramélisés et fromage.',
            price: 4500,
            imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Oriental Spicy Pizza', description: 'Spicy sausage, bell peppers, onions and mozzarella.' },
              ES: { name: 'Pizza Oriental Especiada', description: 'Salchicha picante, pimientos, cebolla y queso.' },
              IT: { name: 'Pizza Orientale Piccante', description: 'Salsiccia speziata, peperoni, cipolla e mozzarella.' },
              WO: { name: 'Pizza Orientale', description: 'Pizza ak merguez ak poivrons ak formaas.' },
            }
          },
        ]
      },
      {
        name: 'Desserts',
        icon: '🍰',
        displayOrder: 5,
        items: [
          {
            name: 'Crêpe au Chocolat',
            description: 'Crêpe fine tiède généreusement nappée de chocolat et chantilly.',
            price: 3000,
            imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Chocolate Crepe', description: 'Warm French crepe with melted chocolate and whipped cream.' },
              ES: { name: 'Crepe de Chocolate', description: 'Crepe caliente con chocolate derretido y nata.' },
              IT: { name: 'Crêpe al Cioccolato', description: 'Crêpe calda con cioccolato fuso e panna montata.' },
              WO: { name: 'Crêpe Chocolat', description: 'Crêpe bu tang ak chocolat ak crème.' },
            }
          },
          {
            name: 'Salade de Fruits',
            description: 'Mélange de fruits exotiques frais parfumés à la menthe.',
            price: 2500,
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Tropical Fruit Salad', description: 'Freshly diced tropical fruits with mint syrup.' },
              ES: { name: 'Macedonia de Frutas Tropicales', description: 'Frutas tropicales frescas con sirope de menta.' },
              IT: { name: 'Macedonia di Frutta Fresca', description: 'Frutta tropicale fresca tagliata con menta.' },
              WO: { name: 'Salade de Fruits', description: 'Fruits yu bees yu ñu dagg ak menthe.' },
            }
          },
          {
            name: 'Moelleux au Chocolat',
            description: 'Gâteau coulant pur cacao servi avec une boule de glace vanille.',
            price: 3500,
            imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Molten Chocolate Lava Cake', description: 'Warm molten chocolate cake with vanilla ice cream.' },
              ES: { name: 'Volcán de Chocolate', description: 'Pastel caliente con corazón de chocolate y helado de vainilla.' },
              IT: { name: 'Tortino al Cioccolato dal Cuore Caldo', description: 'Tortino al cioccolato con gelato alla vaniglia.' },
              WO: { name: 'Moelleux Chocolat', description: 'Gâteau chocolat bu seey ak glace vanille.' },
            }
          },
          {
            name: 'Tiramisu',
            description: 'Véritable tiramisu italien au mascarpone et café espresso.',
            price: 4000,
            imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Authentic Tiramisu', description: 'Traditional Italian espresso tiramisu with mascarpone cream.' },
              ES: { name: 'Tiramisú Auténtico', description: 'Tiramisú italiano tradicional con mascarpone y café espresso.' },
              IT: { name: 'Tiramisù Tradizionale', description: 'Tiramisù tradizionale fatto in casa con savoiardi e mascarpone.' },
              WO: { name: 'Tiramisu', description: 'Dessert italien bu am crème mascarpone ak kafé.' },
            }
          },
        ]
      },
      {
        name: 'Formules',
        icon: '🍽️',
        displayOrder: 6,
        items: [
          {
            name: 'Yassa Poulet ou Poisson',
            description: 'Formule déjeuner rapide : Yassa authentique au poulet ou poisson frais.',
            price: 3000,
            imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: 'Yassa Lunch Special (Chicken or Fish)', description: 'Quick lunch formula: Authentic Yassa with caramelized lime onions.' },
              ES: { name: 'Menú Yassa (Pollo o Pescado)', description: 'Fórmula de mediodía: Yassa tradicional con cebolla y lima.' },
              IT: { name: 'Menu Pranzo Yassa (Pollo o Pesce)', description: 'Formula pranzo veloce: Yassa tradizionale marinato al lime.' },
              WO: { name: 'Formule Yassa Ginaar / Jën', description: 'Yassa ginaar walla jën bu ñor ci midi.' },
            }
          },
          {
            name: 'Plat du jour',
            description: 'Création du chef selon le marché du matin (ex: Ceebu Jën Pëndaa Mbaye, Mafé ou Dibi).',
            price: 3000,
            isDailySpecial: true,
            imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
            translations: {
              EN: { name: "Daily Chef's Special (Lou Ame Tay)", description: "Daily chef special prepared with fresh morning market products." },
              ES: { name: 'Plato del Día del Chef', description: 'Plato del día especial elaborado con productos frescos del mercado.' },
              IT: { name: 'Piatto del Giorno dello Chef', description: 'Piatto del giorno dello Chef con prodotti freschi del mercato.' },
              WO: { name: 'Plat du jour (Lou Ame Tay ?)', description: 'Ceeb bu xonq walla maffe bu toog tay ci suba.' },
            }
          },
        ]
      },
    ]
  },
];

// ------------------------------------------------------------------------------
// 3. EXÉCUTION DU SEED
// ------------------------------------------------------------------------------
async function main() {
  console.log('🚀 =========================================================');
  console.log('🇸🇳 LOU AME TAY ? - SEEDING DES MENUS RÉELS & COMPTES DÉMO');
  console.log('🏢 ÉDITEUR : MDA ARTS WORK / MÉDIAS GRAPHISME SÉNÉGAL');
  console.log('=========================================================\n');

  // 1. Sauvegarde et mise à jour des Plans et Features
  console.log('📦 Synchronisation des Plans et Features...');
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
  console.log('✅ Plans et Features préservés intacts !\n');

  // 2. Purge des anciennes données
  console.log('🧹 Purge des anciennes tables opérationnelles...');
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
  console.log('✅ Purge terminée avec succès !\n');

  // 3. Implantation des restaurants et menus
  console.log('🍽️ Implantation des menus réels...');
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
        subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        lastSeenAt: new Date(),
      },
    });

    console.log(`  🏢 Restaurant créé : [${tenant.businessName}] (${tenant.subdomain})`);

    // Tables
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

    // Catégories & Plats
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
        const menuItem = await prisma.menuItem.create({
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

        // Traductions multilingues
        const translations = (itemData as any).translations;
        if (translations) {
          const translationsToInsert: { language: Language; name: string; description: string }[] = [
            { language: 'FR', name: itemData.name, description: itemData.description },
            { language: 'EN', name: translations.EN?.name || itemData.name, description: translations.EN?.description || '' },
            { language: 'ES', name: translations.ES?.name || itemData.name, description: translations.ES?.description || '' },
            { language: 'IT', name: translations.IT?.name || itemData.name, description: translations.IT?.description || '' },
            { language: 'WO', name: translations.WO?.name || itemData.name, description: translations.WO?.description || '' },
          ];

          for (const tr of translationsToInsert) {
            await prisma.menuItemTranslation.create({
              data: {
                menuItemId: menuItem.id,
                language: tr.language,
                name: tr.name,
                description: tr.description,
              },
            });
          }
        }
      }
    }
  }

  console.log('\n🎉 =========================================================');
  console.log('✅ SEEDING TERMINÉ AVEC SUCCÈS !');
  console.log('3 Comptes Démo Commerciaux Configurés :');
  console.log('  1. Démo Starter : demo.starter@louametay.sn / Demo123!');
  console.log('     -> Restaurant : MG Café Resto (Madiba) | Pack Starter (15k)');
  console.log('     -> URL Client : /r/mg-cafe-resto/table-1');
  console.log('');
  console.log('  2. Démo Pro     : demo.pro@louametay.sn / Demo123!');
  console.log('     -> Restaurant : Chez Collé (Sam\'s) | Pack Pro (25k)');
  console.log('     -> URL Client : /r/chez-colle/table-1');
  console.log('');
  console.log('  3. Démo Premium : demo.premium@louametay.sn / Demo123!');
  console.log('     -> Restaurant : Hôtel Restaurant Cayor (Lat-Dior) | Pack Premium (45k)');
  console.log('     -> URL Client : /r/hotel-cayor/table-1 (Multi-Zones & 5 Langues)');
  console.log('=========================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
