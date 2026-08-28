-- ==============================================================================
-- 🇸🇳 LOU AME TAY ? - SCRIPT SQL DE PURGE & IMPLANTATION DES MENUS RÉELS
-- Éditeur : MDA Arts Work / Médias Graphisme Sénégal (+221 77 458 74 74)
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- ÉTAPE 0 : VÉRIFICATION & CRÉATION DES PLANS ET FEATURES (CONSERVÉS)
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
-- ÉTAPE 1 : "LAVAGE" PURGE COMPLÈTE DES DONNÉES DE TEST
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
-- ÉTAPE 2 : IMPLANTATION DES 4 RESTAURANTS RÉELS / DÉMOS
-- ------------------------------------------------------------------------------

-- Assurer la présence de la colonne branding JSONB
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "branding" JSONB;

-- RESTAURANT 1 : Madiba Restau / MG Café Resto (Thiès) -> Pack Starter / Pro
-- Démo Starter : demo.starter@louametay.sn / Demo123!
INSERT INTO "tenants" ("id", "business_name", "subdomain", "owner_name", "phone", "address", "city", "current_plan_id", "subscription_status", "monthly_fee", "logo_url", "banner_url", "branding", "subscription_expires_at", "created_at", "updated_at")
VALUES (
  'tenant_madiba_restau',
  'MG Café Resto (Madiba)',
  'mg-cafe-resto',
  'Moussa Guèye',
  '+221 77 458 74 74',
  'HLM Route de Mbour, Thiès',
  'Thiès',
  'plan_starter',
  'ACTIVE',
  15000.00,
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
  '{"primaryColor":"#FF6B00","secondaryColor":"#00A86B","fontTitle":"Poppins","fontBody":"Plus Jakarta Sans","googleReviewUrl":"https://maps.app.goo.gl/mgcaferesto","phone":"+221 77 458 74 74","whatsapp":"+221 77 458 74 74","address":"HLM Route de Mbour, Thiès","website":"https://louametay.sn","instagram":"mgcaferesto"}'::jsonb,
  NOW() + INTERVAL '1 year',
  NOW(),
  NOW()
);

-- RESTAURANT 2 : Sam's Restaurant / Chez Collé (Thiès) -> Pack Pro
-- Démo Pro : demo.pro@louametay.sn / Demo123!
INSERT INTO "tenants" ("id", "business_name", "subdomain", "owner_name", "phone", "address", "city", "current_plan_id", "subscription_status", "monthly_fee", "logo_url", "banner_url", "branding", "subscription_expires_at", "created_at", "updated_at")
VALUES (
  'tenant_sams_restaurant',
  'Chez Collé (Sam''s)',
  'chez-colle',
  'Collé Cissé',
  '+221 77 458 74 74',
  'Avenue Lamine Guèye, Thiès',
  'Thiès',
  'plan_pro',
  'ACTIVE',
  25000.00,
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  '{"primaryColor":"#00A86B","secondaryColor":"#FF6B00","fontTitle":"Montserrat","fontBody":"Roboto","googleReviewUrl":"https://maps.app.goo.gl/chezcolle","phone":"+221 77 458 74 74","whatsapp":"+221 77 458 74 74","address":"Avenue Lamine Guèye, Thiès","website":"https://chezcolle.sn","instagram":"chezcolle"}'::jsonb,
  NOW() + INTERVAL '1 year',
  NOW(),
  NOW()
);

-- RESTAURANT 3 : Anima Pizzeria (Dakar) -> Pack Premium
INSERT INTO "tenants" ("id", "business_name", "subdomain", "owner_name", "phone", "address", "city", "current_plan_id", "subscription_status", "monthly_fee", "logo_url", "banner_url", "branding", "subscription_expires_at", "created_at", "updated_at")
VALUES (
  'tenant_anima_pizzeria',
  'Anima Pizzeria',
  'anima-pizzeria',
  'Direction Anima',
  '+221 77 458 74 74',
  'Plage BCEAO, Yoff / Guédiawaye, Dakar',
  'Dakar',
  'plan_premium',
  'ACTIVE',
  45000.00,
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
  '{"primaryColor":"#DC2626","secondaryColor":"#F59E0B","fontTitle":"Playfair Display","fontBody":"Lato","googleReviewUrl":"https://maps.app.goo.gl/animapizzeria","phone":"+221 77 458 74 74","whatsapp":"+221 77 458 74 74","address":"Plage BCEAO, Yoff / Guédiawaye, Dakar","website":"https://animapizza.sn","instagram":"animapizzeria"}'::jsonb,
  NOW() + INTERVAL '1 year',
  NOW(),
  NOW()
);

-- RESTAURANT 4 : Hôtel Résidence Lat-Dior / Hôtel Cayor (Thiès) -> Pack Premium (5 Langues)
-- Démo Premium : demo.premium@louametay.sn / Demo123!
INSERT INTO "tenants" ("id", "business_name", "subdomain", "owner_name", "phone", "address", "city", "current_plan_id", "subscription_status", "monthly_fee", "logo_url", "banner_url", "branding", "subscription_expires_at", "created_at", "updated_at")
VALUES (
  'tenant_hotel_lat_dior',
  'Hôtel Restaurant Cayor (Lat-Dior)',
  'hotel-cayor',
  'Direction Hôtel Cayor',
  '+221 77 458 74 74',
  'Quartier Résidentiel Lat-Dior, Thiès',
  'Thiès',
  'plan_premium',
  'ACTIVE',
  45000.00,
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
  '{"primaryColor":"#D97706","secondaryColor":"#1E293B","fontTitle":"Cinzel","fontBody":"Plus Jakarta Sans","googleReviewUrl":"https://maps.app.goo.gl/hotelcayor","phone":"+221 77 458 74 74","whatsapp":"+221 77 458 74 74","address":"Quartier Résidentiel Lat-Dior, Thiès","website":"https://hotelcayor.sn","instagram":"hotelcayor"}'::jsonb,
  NOW() + INTERVAL '1 year',
  NOW(),
  NOW()
);

-- ------------------------------------------------------------------------------
-- TABLES PHYSIQUES (AVEC ZONES MULTI-ZONES POUR HÔTEL CAYOR)
-- ------------------------------------------------------------------------------
-- Tables Madiba / MG (1 à 12)
INSERT INTO "tables" ("id", "tenant_id", "table_number", "label", "is_active", "created_at", "updated_at")
SELECT 'tbl_mg_' || i, 'tenant_madiba_restau', i, 'Table ' || LPAD(i::text, 2, '0'), true, NOW(), NOW()
FROM generate_series(1, 12) AS i;

-- Tables Sam's / Chez Collé (1 à 14)
INSERT INTO "tables" ("id", "tenant_id", "table_number", "label", "is_active", "created_at", "updated_at")
SELECT 'tbl_colle_' || i, 'tenant_sams_restaurant', i, 'Table ' || LPAD(i::text, 2, '0'), true, NOW(), NOW()
FROM generate_series(1, 14) AS i;

-- Tables Anima Pizzeria (1 à 20)
INSERT INTO "tables" ("id", "tenant_id", "table_number", "label", "is_active", "created_at", "updated_at")
SELECT 'tbl_anima_' || i, 'tenant_anima_pizzeria', i, 'Table ' || LPAD(i::text, 2, '0'), true, NOW(), NOW()
FROM generate_series(1, 20) AS i;

-- Tables Hôtel Lat-Dior / Cayor (Multi-Zones : Salle 1-8, Terrasse 9-16, Piscine 17-24)
INSERT INTO "tables" ("id", "tenant_id", "table_number", "label", "is_active", "created_at", "updated_at")
SELECT 
  'tbl_cayor_' || i, 
  'tenant_hotel_lat_dior', 
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
-- MENUS MADIBA RESTAU / MG CAFÉ RESTO
-- ------------------------------------------------------------------------------
INSERT INTO "categories" ("id", "tenant_id", "name", "icon", "display_order", "created_at", "updated_at")
VALUES
  ('cat_mg_dej', 'tenant_madiba_restau', 'Petit-Déjeuner', '🥐', 1, NOW(), NOW()),
  ('cat_mg_boiss', 'tenant_madiba_restau', 'Boissons Chaudes', '☕', 2, NOW(), NOW()),
  ('cat_mg_plats', 'tenant_madiba_restau', 'Nos Plats', '🍗', 3, NOW(), NOW()),
  ('cat_mg_pizzas', 'tenant_madiba_restau', 'Pizzas', '🍕', 4, NOW(), NOW()),
  ('cat_mg_pates', 'tenant_madiba_restau', 'Pâtes', '🍝', 5, NOW(), NOW());

INSERT INTO "menu_items" ("id", "tenant_id", "category_id", "name", "description", "price", "is_daily_special", "image_url", "is_available", "created_at", "updated_at")
VALUES
  -- Petit-Déjeuner
  ('it_mg_01', 'tenant_madiba_restau', 'cat_mg_dej', 'Croque-Monsieur', 'Pain toasté doré au beurre, jambon de dinde et fromage fondant.', 1500.00, false, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_02', 'tenant_madiba_restau', 'cat_mg_dej', 'Croque Madame', 'Croque-monsieur gourmand surmonté d''un œuf au plat coulant.', 2000.00, false, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_03', 'tenant_madiba_restau', 'cat_mg_dej', 'Omelette Espagnole', 'Omelette généreuse aux pommes de terre fondantes et oignons.', 2000.00, false, 'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_04', 'tenant_madiba_restau', 'cat_mg_dej', 'Omelette Nature', 'Omelette baveuse avec herbes fraîches et beurre.', 1500.00, false, 'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  -- Boissons Chaudes
  ('it_mg_05', 'tenant_madiba_restau', 'cat_mg_boiss', 'Café au Lait', 'Café fraîchement torréfié au lait chaud onctueux.', 1500.00, false, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_06', 'tenant_madiba_restau', 'cat_mg_boiss', 'Café Expresso', 'Expresso serré intense pur arabica.', 800.00, false, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_07', 'tenant_madiba_restau', 'cat_mg_boiss', 'Café Stick', 'Café soluble rapide et tonique.', 500.00, false, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_08', 'tenant_madiba_restau', 'cat_mg_boiss', 'Thé Lipton', 'Thé noir chaud ou thé vert avec menthe fraîche.', 500.00, false, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  -- Nos Plats
  ('it_mg_09', 'tenant_madiba_restau', 'cat_mg_plats', 'Poulet Entier', 'Poulet entier mariné aux épices locales et rôti à point.', 6500.00, true, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_10', 'tenant_madiba_restau', 'cat_mg_plats', 'Demi Poulet', 'Demi-poulet rôti aux épices et jus d''oignons.', 3500.00, false, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_11', 'tenant_madiba_restau', 'cat_mg_plats', 'Poulet Pané Entier', 'Poulet entier croustillant avec panure dorée maison.', 8000.00, false, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_12', 'tenant_madiba_restau', 'cat_mg_plats', 'Demi-Poulet Pané', 'Demi-poulet pané croustillant avec sauce tartare.', 4000.00, false, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_13', 'tenant_madiba_restau', 'cat_mg_plats', 'Filet de Bœuf Roquefort', 'Filet de bœuf tendre avec sauce au roquefort crémeuse.', 5500.00, false, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_14', 'tenant_madiba_restau', 'cat_mg_plats', 'Filet de Bœuf Nature', 'Filet de bœuf grillé minute avec frites.', 4500.00, false, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_15', 'tenant_madiba_restau', 'cat_mg_plats', 'Fricassée à la Crevette', 'Crevettes fraîches sautées à l''ail et aux poivrons.', 4000.00, false, 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_16', 'tenant_madiba_restau', 'cat_mg_plats', 'Fricassée de Poulet', 'Émincé de poulet mijoté aux légumes croquants.', 3500.00, false, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_17', 'tenant_madiba_restau', 'cat_mg_plats', 'Brochettes de Bœuf', 'Brochettes de bœuf mariné et grillé au feu.', 3500.00, false, 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_18', 'tenant_madiba_restau', 'cat_mg_plats', 'Brochettes de Poulet', 'Brochettes de suprême de poulet mariné.', 3500.00, false, 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_19', 'tenant_madiba_restau', 'cat_mg_plats', 'Thof Grillé', 'Mérou blanc Thiof grillé avec alloco et sauce verte.', 4500.00, false, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_20', 'tenant_madiba_restau', 'cat_mg_plats', 'Daurade Grillé', 'Daurade royale entière grillée au feu de bois.', 4000.00, false, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_21', 'tenant_madiba_restau', 'cat_mg_plats', 'Dibi Viande 1K', '1 Kilo de dibi d''agneau braisé au feu de bois.', 8000.00, false, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_22', 'tenant_madiba_restau', 'cat_mg_plats', 'Dibi Viande 500G', '500g de dibi de mouton grillé avec oignons.', 4000.00, false, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_23', 'tenant_madiba_restau', 'cat_mg_plats', 'Poulet Entier Dibi', 'Poulet entier façon dibiterie braisé aux oignons.', 6500.00, false, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_24', 'tenant_madiba_restau', 'cat_mg_plats', 'Demi-Poulet Dibi', 'Demi-poulet braisé à la moutarde et piment.', 3500.00, false, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  -- Pizzas
  ('it_mg_25', 'tenant_madiba_restau', 'cat_mg_pizzas', 'Pizza Reine', 'Sauce tomate, mozzarella, jambon et champignons frais.', 4500.00, false, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_26', 'tenant_madiba_restau', 'cat_mg_pizzas', 'Pizza Fruits de Mer', 'Sauce tomate, crevettes, calamars et mozzarella.', 4000.00, false, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_27', 'tenant_madiba_restau', 'cat_mg_pizzas', 'Pizza Madiba', 'Viande épicée, poivrons, oignons et double fromage.', 4000.00, false, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_28', 'tenant_madiba_restau', 'cat_mg_pizzas', 'Pizza Bolognaise', 'Sauce bolognaise pur bœuf et mozzarella.', 4000.00, false, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_29', 'tenant_madiba_restau', 'cat_mg_pizzas', 'Pizza Volaille', 'Crème, poulet rôti, champignons et fromage.', 4500.00, false, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_30', 'tenant_madiba_restau', 'cat_mg_pizzas', 'Pizza Marguerita', 'Sauce tomate classique, mozzarella et basilic.', 3000.00, false, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_31', 'tenant_madiba_restau', 'cat_mg_pizzas', 'Pizza Chawarma', 'Viande chawarma, crème ail, oignons et fromage.', 4500.00, false, 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_32', 'tenant_madiba_restau', 'cat_mg_pizzas', 'Pizza Oriental', 'Merguez épicées, poivrons, sauce tomate et mozzarella.', 4500.00, false, 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  -- Pâtes
  ('it_mg_33', 'tenant_madiba_restau', 'cat_mg_pates', 'Spaghetti Bolognaise', 'Spaghetti avec sauce bolognaise maison.', 3000.00, false, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281072?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_34', 'tenant_madiba_restau', 'cat_mg_pates', 'Spaghetti à la Viande', 'Spaghetti aux morceaux de bœuf braisé.', 2500.00, false, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281072?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_35', 'tenant_madiba_restau', 'cat_mg_pates', 'Spaghetti au Poulet', 'Spaghetti sautés avec émincé de poulet.', 2500.00, false, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281072?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_36', 'tenant_madiba_restau', 'cat_mg_pates', 'Vermicelle Viande', 'Vermicelles vapeur avec sauce riche à la viande.', 2500.00, false, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_37', 'tenant_madiba_restau', 'cat_mg_pates', 'Vermicelle Poulet', 'Vermicelles vapeur avec poulet doré.', 2000.00, false, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_38', 'tenant_madiba_restau', 'cat_mg_pates', 'Couscous Viande', 'Couscous avec ragoût de viande de bœuf.', 2500.00, false, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW()),
  ('it_mg_39', 'tenant_madiba_restau', 'cat_mg_pates', 'Couscous Poulet', 'Couscous fin avec sauce au poulet.', 2000.00, false, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80', true, NOW(), NOW());

COMMIT;
