import { prisma } from '../src/lib/prisma';

async function migrate() {
  console.log('--- MIGRATION DDL : AJOUT STATION KITCHEN / BAR SUR CATEGORY, MENU_ITEM, ORDER_ITEM ---');

  // 1. Enum StationType
  await (prisma as any).$executeRawUnsafe(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StationType') THEN
        CREATE TYPE "StationType" AS ENUM ('KITCHEN', 'BAR');
      END IF;
    END $$;
  `);
  console.log('✓ Enum StationType vérifié/créé');

  // 2. Colonne station sur categories
  await (prisma as any).$executeRawUnsafe(`
    ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "station" "StationType" DEFAULT 'KITCHEN';
  `);
  console.log('✓ Colonne station ajoutée sur categories');

  // 3. Colonne station sur menu_items
  await (prisma as any).$executeRawUnsafe(`
    ALTER TABLE "menu_items" ADD COLUMN IF NOT EXISTS "station" "StationType" DEFAULT 'KITCHEN';
  `);
  console.log('✓ Colonne station ajoutée sur menu_items');

  // 4. Colonne station et status sur order_items
  await (prisma as any).$executeRawUnsafe(`
    ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "station" "StationType" DEFAULT 'KITCHEN';
  `);
  await (prisma as any).$executeRawUnsafe(`
    ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "status" "OrderStatus" DEFAULT 'PENDING';
  `);
  console.log('✓ Colonnes station et status ajoutées sur order_items');

  // 5. Mise à jour des catégories boissons vers station = 'BAR'
  const updatedCategoriesCount = await (prisma as any).$executeRawUnsafe(`
    UPDATE "categories" SET "station" = 'BAR'
    WHERE LOWER("name") LIKE '%boisson%'
       OR LOWER("name") LIKE '%cocktail%'
       OR LOWER("name") LIKE '%jus%'
       OR LOWER("name") LIKE '%café%'
       OR LOWER("name") LIKE '%cafe%'
       OR LOWER("name") LIKE '%thé%'
       OR LOWER("name") LIKE '%the%'
       OR LOWER("name") LIKE '%vin%'
       OR LOWER("name") LIKE '%bière%'
       OR LOWER("name") LIKE '%biere%'
       OR LOWER("name") LIKE '%soft%'
       OR LOWER("name") LIKE '%soda%'
       OR LOWER("name") LIKE '%eau%'
       OR LOWER("name") LIKE '%bar%';
  `);
  console.log(`✓ ${updatedCategoriesCount} catégories mises à jour vers station = BAR`);

  // 6. Mise à jour des menu_items correspondants
  const updatedItemsCount = await (prisma as any).$executeRawUnsafe(`
    UPDATE "menu_items" SET "station" = 'BAR'
    WHERE "category_id" IN (SELECT "id" FROM "categories" WHERE "station" = 'BAR')
       OR LOWER("name") LIKE '%cocktail%'
       OR LOWER("name") LIKE '%bissap%'
       OR LOWER("name") LIKE '%bouye%'
       OR LOWER("name") LIKE '%gingembre%'
       OR LOWER("name") LIKE '%soda%'
       OR LOWER("name") LIKE '%coca%'
       OR LOWER("name") LIKE '%sprite%'
       OR LOWER("name") LIKE '%fanta%'
       OR LOWER("name") LIKE '%café%'
       OR LOWER("name") LIKE '%espresso%'
       OR LOWER("name") LIKE '%bière%'
       OR LOWER("name") LIKE '%gazelle%'
       OR LOWER("name") LIKE '%flag%';
  `);
  console.log(`✓ ${updatedItemsCount} articles du menu mis à jour vers station = BAR`);

  console.log('✅ MIGRATION BASE DE DONNÉES RÉUSSIE !');
  process.exit(0);
}

migrate().catch(e => {
  console.error('Erreur migration:', e);
  process.exit(1);
});
