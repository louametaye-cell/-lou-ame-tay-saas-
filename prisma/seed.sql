-- ==============================================================================
-- 🇸🇳 LOU AME TAY ? - SCRIPT SQL DE PURGE & IMPLANTATION DES 3 COMPTES DÉMO
-- Éditeur : MDA Arts Work / Médias Graphisme Sénégal (+221 77 458 74 74)
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- ÉTAPE 0 : ASSURER LA PRÉSENCE DES PLANS & FEATURES SAAS (SANS SUPPRESSION)
-- ------------------------------------------------------------------------------
INSERT INTO "plans" ("id", "name", "slug", "price", "currency", "description", "color_theme", "is_recommended", "is_active", "created_at", "updated_at")
VALUES
  ('plan_starter', 'Starter', 'starter', 15000.00, 'FCFA', 'Idéal pour démarrer la visibilité digitale à moindre coût (Menu consultation).', '#64748b', false, true, NOW(), NOW()),
  ('plan_pro', 'Pro', 'pro', 25000.00, 'FCFA', 'Le choix le plus populaire : cuisine en direct, alertes sonores et paiements Wave/OM.', '#FF6B00', true, true, NOW(), NOW()),
  ('plan_premium', 'Premium VIP', 'premium', 45000.00, 'FCFA', 'Pour les grands restaurants et complexes : Multi-zones, 5 Langues, Écran TV 3 Modes et VIP 24/7.', '#00A86B', false, true, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE 
SET "name" = EXCLUDED."name",
    "price" = EXCLUDED."price",
    "currency" = EXCLUDED."currency",
    "description" = EXCLUDED."description",
    "color_theme" = EXCLUDED."color_theme",
    "is_recommended" = EXCLUDED."is_recommended",
    "is_active" = EXCLUDED."is_active",
    "updated_at" = NOW();

INSERT INTO "features" ("id", "key_name", "label", "description", "category", "value_type", "created_at")
VALUES
  ('feat_photos', 'MAX_PHOTOS', 'Photos Plats HD', 'Nombre de photos de plats affichables', 'CORE', 'NUMERIC', NOW()),
  ('feat_tables', 'MAX_TABLES', 'Tables & QR Codes', 'Nombre de tables physiques équipées', 'CORE', 'NUMERIC', NOW()),
  ('feat_kds', 'KITCHEN_DISPLAY_KDS', 'Écran Cuisine KDS & Alerte Sonore', 'Envoi direct des commandes en cuisine', 'OPERATION', 'BOOLEAN', NOW()),
  ('feat_wave_om', 'WAVE_ORANGE_MONEY', 'Paiements Mobiles Wave & Orange Money', 'Encaissement direct des commandes', 'BILLING', 'BOOLEAN', NOW()),
  ('feat_basic_stats', 'BASIC_STATS', 'Statistiques de Caisse Standard', 'Suivi du CA et commandes', 'CORE', 'BOOLEAN', NOW()),
  ('feat_multizone', 'MULTI_ZONE', 'Multi-Zones (Salle, Terrasse, Piscine)', 'Segmentation des tables par zones', 'OPERATION', 'BOOLEAN', NOW()),
  ('feat_bilingual', 'BILINGUAL_MENU', 'Menu Bilingue & Multi-Langues', 'Traduction Français, Wolof et Anglais', 'MARKETING', 'BOOLEAN', NOW()),
  ('feat_multilang', 'MULTI_LANGUAGE_MENU', 'Menu Multilingue 5 Langues (FR, WO, EN, ES, IT)', 'Traduction intégrale 5 langues', 'MARKETING', 'BOOLEAN', NOW()),
  ('feat_advanced_stats', 'ADVANCED_STATS', 'Statistiques Avancées & Exports Excel', 'Analyses de rentabilité et exports', 'BILLING', 'BOOLEAN', NOW()),
  ('feat_vip_support', 'VIP_SUPPORT', 'Accompagnement VIP & Support Dédié 24/7', 'Assistance prioritaire en 15 minutes', 'CORE', 'BOOLEAN', NOW())
ON CONFLICT ("key_name") DO NOTHING;

-- ------------------------------------------------------------------------------
-- ÉTAPE 1 : "LAVAGE" PURGE COMPLÈTE DES ANCIENNES DONNÉES DE TEST
-- (Plans, Features et Super Admins sont rigoureusement préservés)
-- ------------------------------------------------------------------------------
DELETE FROM "menu_item_translations";
DELETE FROM "order_items";
DELETE FROM "orders";
DELETE FROM "table_sessions";
DELETE FROM "upsell_rules";
DELETE FROM "combo_deals";
DELETE FROM "menu_items";
DELETE FROM "categories";
DELETE FROM "tables";
DELETE FROM "payment_transactions";
DELETE FROM "tenants";

-- ------------------------------------------------------------------------------
-- ÉTAPE 2 : CRÉATION DES 3 RESTAURANTS FICTIFS & COMPTES DÉMO
-- ------------------------------------------------------------------------------

-- RESTAURANT 1 : MG Café Resto (Dakar) -> Pack STARTER
-- Login Commercial : demo.starter@louametay.sn / Demo123!
INSERT INTO "tenants" ("id", "business_name", "subdomain", "owner_name", "phone", "address", "city", "current_plan_id", "subscription_status", "monthly_fee", "logo_url", "banner_url", "subscription_expires_at", "created_at", "updated_at")
VALUES (
  'tenant_mg_cafe_resto',
  'MG Café Resto',
  'mg-cafe-resto',
  'Moussa Guèye',
  '+221 77 458 74 74',
  'Plateau, Dakar, Sénégal',
  'Dakar',
  'plan_starter',
  'ACTIVE',
  15000.00,
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
  NOW() + INTERVAL '1 year',
  NOW(),
  NOW()
);

-- RESTAURANT 2 : Chez Collé Restaurant (Thiès) -> Pack PRO
-- Login Commercial : demo.pro@louametay.sn / Demo123!
INSERT INTO "tenants" ("id", "business_name", "subdomain", "owner_name", "phone", "address", "city", "current_plan_id", "subscription_status", "monthly_fee", "logo_url", "banner_url", "subscription_expires_at", "created_at", "updated_at")
VALUES (
  'tenant_chez_colle',
  'Chez Collé Restaurant',
  'chez-colle',
  'Collé Cissé',
  '+221 77 458 74 74',
  'Avenue Lamine Guèye, Thiès, Sénégal',
  'Thiès',
  'plan_pro',
  'ACTIVE',
  25000.00,
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  NOW() + INTERVAL '1 year',
  NOW(),
  NOW()
);

-- RESTAURANT 3 : Hôtel Restaurant Cayor (Saly / Mbour) -> Pack PREMIUM (Multi-Zones & 5 Langues)
-- Login Commercial : demo.premium@louametay.sn / Demo123!
INSERT INTO "tenants" ("id", "business_name", "subdomain", "owner_name", "phone", "address", "city", "current_plan_id", "subscription_status", "monthly_fee", "logo_url", "banner_url", "subscription_expires_at", "created_at", "updated_at")
VALUES (
  'tenant_hotel_cayor',
  'Hôtel Restaurant Cayor',
  'hotel-cayor',
  'Direction Hôtel Cayor',
  '+221 77 458 74 74',
  'Zone Balnéaire, Saly Portudal / Mbour, Sénégal',
  'Saly Portudal',
  'plan_premium',
  'ACTIVE',
  45000.00,
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
  NOW() + INTERVAL '1 year',
  NOW(),
  NOW()
);

-- ------------------------------------------------------------------------------
-- TABLES PHYSIQUES (AVEC ZONES POUR HÔTEL CAYOR)
-- ------------------------------------------------------------------------------
-- Tables MG Café Resto (1 à 6)
INSERT INTO "tables" ("id", "tenant_id", "table_number", "label", "is_active", "created_at", "updated_at")
SELECT 'tbl_mg_' || i, 'tenant_mg_cafe_resto', i, 'Table ' || LPAD(i::text, 2, '0'), true, NOW(), NOW()
FROM generate_series(1, 6) AS i;

-- Tables Chez Collé (1 à 14)
INSERT INTO "tables" ("id", "tenant_id", "table_number", "label", "is_active", "created_at", "updated_at")
SELECT 'tbl_colle_' || i, 'tenant_chez_colle', i, 'Table ' || LPAD(i::text, 2, '0'), true, NOW(), NOW()
FROM generate_series(1, 14) AS i;

-- Tables Hôtel Cayor (Multi-Zones : Salle 1-8, Terrasse 9-16, Piscine 17-24)
INSERT INTO "tables" ("id", "tenant_id", "table_number", "label", "is_active", "created_at", "updated_at")
SELECT 
  'tbl_cayor_' || i, 
  'tenant_hotel_cayor', 
  i, 
  CASE 
    WHEN i <= 8 THEN 'Table ' || LPAD(i::text, 2, '0') || ' (Salle Climatisée)'
    WHEN i <= 16 THEN 'Table ' || LPAD(i::text, 2, '0') || ' (Terrasse Ombragée)'
    ELSE 'Table ' || LPAD(i::text, 2, '0') || ' (Piscine & Lounge)'
  END, 
  true, 
  NOW(), 
  NOW()
FROM generate_series(1, 24) AS i;

-- ------------------------------------------------------------------------------
-- MENUS MG CAFÉ RESTO (STARTER)
-- ------------------------------------------------------------------------------
INSERT INTO "categories" ("id", "tenant_id", "name", "icon", "display_order", "created_at", "updated_at")
VALUES
  ('cat_mg_dej', 'tenant_mg_cafe_resto', 'Petit-Déjeuner', '🥐', 1, NOW(), NOW()),
  ('cat_mg_plats', 'tenant_mg_cafe_resto', 'Plats', '🍗', 2, NOW(), NOW()),
  ('cat_mg_fast', 'tenant_mg_cafe_resto', 'Fast-food', '🌯', 3, NOW(), NOW());

INSERT INTO "menu_items" ("id", "tenant_id", "category_id", "name", "description", "price", "is_daily_special", "image_url", "is_available", "created_at", "updated_at")
VALUES
  ('item_mg_croque', 'tenant_mg_cafe_resto', 'cat_mg_dej', 'Croque-Monsieur', 'Pain toasté doré au beurre, garniture jambon de dinde et fromage fondant gratiné.', 1500.00, false, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('item_mg_omelette', 'tenant_mg_cafe_resto', 'cat_mg_dej', 'Omelette Espagnole', 'Omelette généreuse aux pommes de terre fondantes et oignons doux.', 2000.00, false, 'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('item_mg_cafe', 'tenant_mg_cafe_resto', 'cat_mg_dej', 'Café au Lait', 'Café richement torréfié mélangé à du lait chaud onctueux et mousseux.', 1500.00, false, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('item_mg_poulet', 'tenant_mg_cafe_resto', 'cat_mg_plats', 'Poulet Entier', 'Poulet entier fermier rôti et assaisonné aux épices du terroir sénégalais.', 6500.00, true, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('item_mg_dibi', 'tenant_mg_cafe_resto', 'cat_mg_plats', 'Dibi Viande 500g', '500g de viande de mouton braisée au feu de bois avec moutarde, oignons et piment.', 4000.00, false, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('item_mg_thiof', 'tenant_mg_cafe_resto', 'cat_mg_plats', 'Thiof Grillé', 'Mérou blanc Thiof frais grillé à la braise avec alloco doré et sauce verte.', 4500.00, false, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('item_mg_tacos', 'tenant_mg_cafe_resto', 'cat_mg_fast', 'Tacos Viande', 'Tacos français garni de viande hachée assaisonnée, frites croustillantes et sauce fromagère.', 2500.00, false, 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW());

-- ------------------------------------------------------------------------------
-- MENUS CHEZ COLLÉ RESTAURANT (PRO)
-- ------------------------------------------------------------------------------
INSERT INTO "categories" ("id", "tenant_id", "name", "icon", "display_order", "created_at", "updated_at")
VALUES
  ('cat_colle_entrees', 'tenant_chez_colle', 'Entrées', '🥗', 1, NOW(), NOW()),
  ('cat_colle_viandes', 'tenant_chez_colle', 'Viandes', '🥩', 2, NOW(), NOW()),
  ('cat_colle_pizzas', 'tenant_chez_colle', 'Pizzas', '🍕', 3, NOW(), NOW()),
  ('cat_colle_burgers', 'tenant_chez_colle', 'Burgers', '🍔', 4, NOW(), NOW()),
  ('cat_colle_pates', 'tenant_chez_colle', 'Pâtes', '🍝', 5, NOW(), NOW());

INSERT INTO "menu_items" ("id", "tenant_id", "category_id", "name", "description", "price", "is_daily_special", "image_url", "is_available", "created_at", "updated_at")
VALUES
  ('item_colle_nicoise', 'tenant_chez_colle', 'cat_colle_entrees', 'Salade Niçoise', 'Salade fraîcheur au thon blanc, œufs durs, olives noires, haricots verts et pommes de terre.', 3500.00, false, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('item_colle_cotedeboeuf', 'tenant_chez_colle', 'cat_colle_viandes', 'Côte de Bœuf', 'Pièce noble de bœuf sélectionné grillée à point, servie avec frites maison et sauce au poivre vert.', 6000.00, true, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('item_colle_dibi', 'tenant_chez_colle', 'cat_colle_viandes', 'Dibi 1Kg', 'Dibi d''agneau braisé au feu de bois selon la pure tradition thiessoise, oignons et piment doux.', 7000.00, false, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('item_colle_reine', 'tenant_chez_colle', 'cat_colle_pizzas', 'Pizza Reine', 'Sauce tomate mijotée, mozzarella fondante, jambon blanc et champignons frais.', 4500.00, false, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('item_colle_margherita', 'tenant_chez_colle', 'cat_colle_pizzas', 'Pizza Margherita', 'Sauce tomate maison aux herbes, mozzarella fior di latte, basilic frais et filet d''huile d''olive.', 4000.00, false, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('item_colle_simple', 'tenant_chez_colle', 'cat_colle_burgers', 'Simple', 'Burger classique avec steak pur bœuf grillé minute, salade, tomate, oignon et sauce burger.', 1300.00, false, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('item_colle_cheese', 'tenant_chez_colle', 'cat_colle_burgers', 'Cheese Burger', 'Burger gourmand avec steak pur bœuf, tranche de fromage cheddar fondu, salade et sauce onctueuse.', 1500.00, false, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('item_colle_spagh', 'tenant_chez_colle', 'cat_colle_pates', 'Spaghetti Bolognaise', 'Spaghetti al dente nappés d''une sauce bolognaise maison à la viande pur bœuf et parmesan.', 4000.00, false, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281072?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW());

-- ------------------------------------------------------------------------------
-- MENUS HÔTEL RESTAURANT CAYOR (PREMIUM - 5 LANGUES)
-- ------------------------------------------------------------------------------
INSERT INTO "categories" ("id", "tenant_id", "name", "icon", "display_order", "created_at", "updated_at")
VALUES
  ('cat_cayor_entrees', 'tenant_hotel_cayor', 'Entrées', '🥗', 1, NOW(), NOW()),
  ('cat_cayor_viandes', 'tenant_hotel_cayor', 'Viandes', '🥩', 2, NOW(), NOW()),
  ('cat_cayor_poissons', 'tenant_hotel_cayor', 'Poissons', '🐟', 3, NOW(), NOW()),
  ('cat_cayor_pizzas', 'tenant_hotel_cayor', 'Pizzas Signature', '🍕', 4, NOW(), NOW()),
  ('cat_cayor_desserts', 'tenant_hotel_cayor', 'Desserts', '🍰', 5, NOW(), NOW()),
  ('cat_cayor_boissons', 'tenant_hotel_cayor', 'Boissons', '🥤', 6, NOW(), NOW());

INSERT INTO "menu_items" ("id", "tenant_id", "category_id", "name", "description", "price", "is_daily_special", "image_url", "is_available", "created_at", "updated_at")
VALUES
  ('item_cayor_cesar', 'tenant_hotel_cayor', 'cat_cayor_entrees', 'Salade César', 'Cœur de romaine, aiguillettes de poulet grillé, croûtons dorés à l''ail, copeaux de parmesan AOP et sauce César.', 4500.00, false, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('item_cayor_filet', 'tenant_hotel_cayor', 'cat_cayor_viandes', 'Filet de Bœuf', 'Filet de bœuf tendre rôti au beurre clarifié, réduction au jus corsé, écrasé de pommes de terre et légumes glacés.', 6000.00, false, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('item_cayor_thiof', 'tenant_hotel_cayor', 'cat_cayor_poissons', 'Thiof Grillé', 'Mérou blanc de ligne braisé à la plancha, marinade aux herbes du Sine Saloum, riz blanc parfumé et alloco.', 6000.00, false, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('item_cayor_burrata', 'tenant_hotel_cayor', 'cat_cayor_pizzas', 'Pizza Burrata', 'Pizza d''exception avec une boule entière de Burrata crémeuse d''Italie, tomates confites, roquette et pesto basilic.', 9000.00, false, 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('item_cayor_dibi', 'tenant_hotel_cayor', 'cat_cayor_pizzas', 'Pizza Dibi', 'Création fusion : base crème, mozzarella, lamelles de dibi d''agneau mariné au feu de bois, oignons rouges et piment doux.', 7000.00, true, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('item_cayor_tiramisu', 'tenant_hotel_cayor', 'cat_cayor_desserts', 'Tiramisu', 'Véritable tiramisu italien maison aux biscuits imbibés au café expresso, crème mascarpone et cacao amer.', 3000.00, false, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('item_cayor_jus', 'tenant_hotel_cayor', 'cat_cayor_boissons', 'Jus Locaux', 'Assortiment de purs jus artisanaux de saison : Bissap mentholé, Bouye au lait ou Gingembre tonique.', 1500.00, false, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW());

-- TRADUCTIONS MULTILINGUES HÔTEL CAYOR (FR, EN, ES, IT, WO)
INSERT INTO "menu_item_translations" ("id", "menu_item_id", "language", "name", "description", "created_at", "updated_at")
VALUES
  ('tr_cayor_1_en', 'item_cayor_cesar', 'EN', 'Caesar Salad', 'Romaine lettuce, grilled chicken breast, garlic croutons, parmesan shavings and Caesar dressing.', NOW(), NOW()),
  ('tr_cayor_1_es', 'item_cayor_cesar', 'ES', 'Ensalada César', 'Lechuga romana, pechuga de pollo a la plancha, picatostes al ajo, parmesano y salsa César.', NOW(), NOW()),
  ('tr_cayor_1_it', 'item_cayor_cesar', 'IT', 'Insalata Cesare', 'Lattuga romana, petto di pollo grigliato, crostini all''aglio, scaglie di parmigiano e salsa Caesar.', NOW(), NOW()),
  ('tr_cayor_1_wo', 'item_cayor_cesar', 'WO', 'Salade César', 'Salat bu bees ak ginaar bu ñor ak formaas parmesan.', NOW(), NOW()),

  ('tr_cayor_2_en', 'item_cayor_filet', 'EN', 'Beef Tenderloin Fillet', 'Pan-seared tender beef fillet with rich meat jus, mashed potatoes and glazed vegetables.', NOW(), NOW()),
  ('tr_cayor_2_es', 'item_cayor_filet', 'ES', 'Solomillo de Ternera', 'Solomillo tierno de ternera con jugo concentrado, puré de patatas y verduras glaseadas.', NOW(), NOW()),
  ('tr_cayor_2_it', 'item_cayor_filet', 'IT', 'Filetto di Manzo', 'Filetto di manzo tenerissimo al burro chiarificato con purè di patate e verdure.', NOW(), NOW()),
  ('tr_cayor_2_wo', 'item_cayor_filet', 'WO', 'Filet de Bœuf bu Ñor', 'Yàpp nag bu nooy nink bu ñu toog ak pompiteer.', NOW(), NOW()),

  ('tr_cayor_3_en', 'item_cayor_thiof', 'EN', 'Grilled White Grouper (Thiof)', 'Fresh Senegalese white grouper grilled on plancha with herb marinade, fragrant white rice and plantains.', NOW(), NOW()),
  ('tr_cayor_3_es', 'item_cayor_thiof', 'ES', 'Mero Blanco a la Plancha (Thiof)', 'Mero blanco fresco a la plancha marinado con hierbas aromáticas, arroz blanco y plátano frito.', NOW(), NOW()),
  ('tr_cayor_3_it', 'item_cayor_thiof', 'IT', 'Cernia Bianca alla Griglia (Thiof)', 'Cernia bianca fresca alla piastra marinata alle erbe, riso bianco profumato e platano fritto.', NOW(), NOW()),
  ('tr_cayor_3_wo', 'item_cayor_thiof', 'WO', 'Coof bu Ñor Royal', 'Jën coof bu mag bu ñu braisé ak ceeb bu weex ak alloco.', NOW(), NOW()),

  ('tr_cayor_4_en', 'item_cayor_burrata', 'EN', 'Gourmet Burrata Pizza', 'Gourmet pizza with fresh whole Italian Burrata cheese, sun-dried tomatoes, arugula and pesto.', NOW(), NOW()),
  ('tr_cayor_4_es', 'item_cayor_burrata', 'ES', 'Pizza Gourmet de Burrata', 'Pizza gourmet con burrata fresca italiana, tomates confitados, rúcula y pesto de albahaca.', NOW(), NOW()),
  ('tr_cayor_4_it', 'item_cayor_burrata', 'IT', 'Pizza Gourmet con Burrata', 'Pizza con burrata fresca intera pugliese, pomodorini confit, rucola e pesto di basilico.', NOW(), NOW()),
  ('tr_cayor_4_wo', 'item_cayor_burrata', 'WO', 'Pizza Burrata Gourmet', 'Pizza gourmet bu am formaas burrata bu mag ak pesto.', NOW(), NOW()),

  ('tr_cayor_5_en', 'item_cayor_dibi', 'EN', 'Grilled Lamb Dibi Pizza', 'Fusion pizza with cream base, mozzarella, grilled lamb dibi slices, red onions and sweet pepper.', NOW(), NOW()),
  ('tr_cayor_5_es', 'item_cayor_dibi', 'ES', 'Pizza de Dibi a la Brasa', 'Pizza fusión con base de crema, mozzarella, láminas de carne dibi, cebolla roja y pimiento.', NOW(), NOW()),
  ('tr_cayor_5_it', 'item_cayor_dibi', 'IT', 'Pizza con Dibi di Agnello', 'Pizza fusion con base bianca, mozzarella, straccetti di agnello dibi e cipolle rosse.', NOW(), NOW()),
  ('tr_cayor_5_wo', 'item_cayor_dibi', 'WO', 'Pizza Dibi Xar', 'Pizza fusion ak dibi xar bu ñor ci matt ak formaas.', NOW(), NOW()),

  ('tr_cayor_6_en', 'item_cayor_tiramisu', 'EN', 'Homemade Tiramisu', 'Authentic homemade Italian tiramisu with coffee-soaked ladyfingers and mascarpone cream.', NOW(), NOW()),
  ('tr_cayor_6_es', 'item_cayor_tiramisu', 'ES', 'Tiramisú Casero', 'Auténtico tiramisú casero con bizcochos al café, crema de mascarpone y cacao.', NOW(), NOW()),
  ('tr_cayor_6_it', 'item_cayor_tiramisu', 'IT', 'Tiramisù Tradizionale', 'Tiramisù tradizionale fatto in casa con savoiardi al caffè espresso e crema al mascarpone.', NOW(), NOW()),
  ('tr_cayor_6_wo', 'item_cayor_tiramisu', 'WO', 'Tiramisu bu Neex', 'Dessert italien bu am crème mascarpone ak kafé.', NOW(), NOW()),

  ('tr_cayor_7_en', 'item_cayor_jus', 'EN', 'Local Fresh Juices', 'Choice of fresh Senegalese artisanal juices: Hibiscus (Bissap), Baobab (Bouye) or Ginger.', NOW(), NOW()),
  ('tr_cayor_7_es', 'item_cayor_jus', 'ES', 'Zumos Locales Frescos', 'Selección de zumos naturales locales: Bissap (hibisco), Bouye (baobab) o Jengibre fresco.', NOW(), NOW()),
  ('tr_cayor_7_it', 'item_cayor_jus', 'IT', 'Succhi Locali Freschi', 'Selezione di succhi freschi tradizionali: Bissap (ibisco), Bouye (baobab) o Zenzero.', NOW(), NOW()),
  ('tr_cayor_7_wo', 'item_cayor_jus', 'WO', 'Jus Locaux (Bissap, Buy, Jinjer)', 'Jus yu bees yu ñu defar ci réew mi : Bissap, Buy ak Jinjer.', NOW(), NOW());

COMMIT;
