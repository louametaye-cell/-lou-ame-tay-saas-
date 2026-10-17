import { prisma } from '../src/lib/prisma';

async function migrate() {
  console.log('🔄 Application de la migration order_type sur la base de données...');
  
  try {
    // 1. Créer le type enum OrderType s'il n'existe pas
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "OrderType" AS ENUM ('TABLE', 'TAKEAWAY');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Type enum OrderType vérifié/créé.');

    // 2. Ajouter la colonne order_type à la table orders
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "order_type" "OrderType" DEFAULT 'TABLE';
    `);
    console.log('✅ Colonne order_type vérifiée/ajoutée sur la table orders.');

    // 3. Créer l'index
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "orders_tenant_id_order_type_idx" ON "orders"("tenant_id", "order_type");
    `);
    console.log('✅ Index orders_tenant_id_order_type_idx vérifié/créé.');

    // 4. Mettre à jour les anciennes commandes
    const updatedCount = await prisma.$executeRawUnsafe(`
      UPDATE "orders"
      SET "order_type" = 'TAKEAWAY'
      WHERE "table_number" = 0 OR "table_number" IS NULL;
    `);
    console.log(`✅ ${updatedCount} ancienne(s) commande(s) comptoir mise(s) à jour en TAKEAWAY.`);

    console.log('🎉 Migration complétée avec succès !');
  } catch (err: any) {
    console.error('❌ Erreur lors de la migration :', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
