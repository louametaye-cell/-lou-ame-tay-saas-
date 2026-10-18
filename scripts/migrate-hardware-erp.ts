import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runMigration() {
  console.log('--- MIGRATION DATABASE : ERP SUPPORTS PHYSIQUES & FACTURATION ---');

  // 1. Types ENUM
  console.log('1. Création des Enums...');
  const enums = [
    `DO $$ BEGIN
      CREATE TYPE "MaterialType" AS ENUM ('BOIS', 'ACRYLIQUE', 'ALUMINIUM');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "TargetSpace" AS ENUM ('TABLE', 'ROOM', 'POOL', 'BEACH', 'BAR', 'COUNTER');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "FinishType" AS ENUM ('STANDARD', 'MARINE_VERNIS');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "HardwareInvoiceType" AS ENUM ('SETUP', 'SAV', 'PARRAINAGE');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
  ];

  for (const q of enums) {
    await prisma.$executeRawUnsafe(q);
  }
  console.log('✓ Enums vérifiés/créés.');

  // 2. Table qr_support_catalogs
  console.log('2. Création de la table qr_support_catalogs...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "qr_support_catalogs" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "material" "MaterialType" NOT NULL DEFAULT 'BOIS',
      "target_space" "TargetSpace" NOT NULL DEFAULT 'TABLE',
      "finish_type" "FinishType" NOT NULL DEFAULT 'STANDARD',
      "cost_price" DECIMAL(10, 2) NOT NULL DEFAULT 0,
      "selling_price" DECIMAL(10, 2) NOT NULL DEFAULT 0,
      "stock_quantity" INTEGER NOT NULL DEFAULT 0,
      "packaging_included" BOOLEAN NOT NULL DEFAULT true,
      "anti_theft_engraving" BOOLEAN NOT NULL DEFAULT true,
      "image_url" TEXT,
      "is_sav_pack" BOOLEAN NOT NULL DEFAULT false,
      "is_active" BOOLEAN NOT NULL DEFAULT true,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✓ Table qr_support_catalogs prête.');

  // 3. Table tenant_hardware_dotations
  console.log('3. Création de la table tenant_hardware_dotations...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "tenant_hardware_dotations" (
      "id" TEXT PRIMARY KEY,
      "tenant_id" TEXT NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
      "support_id" TEXT NOT NULL REFERENCES "qr_support_catalogs"("id") ON DELETE CASCADE,
      "quantity" INTEGER NOT NULL DEFAULT 1,
      "unit_price" DECIMAL(10, 2) NOT NULL,
      "total_price" DECIMAL(10, 2) NOT NULL,
      "is_setup_invoiced" BOOLEAN NOT NULL DEFAULT false,
      "invoice_type" TEXT NOT NULL DEFAULT 'SETUP',
      "is_sponsored" BOOLEAN NOT NULL DEFAULT false,
      "notes" TEXT,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "tenant_hardware_dotations_tenant_id_idx" ON "tenant_hardware_dotations"("tenant_id")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "tenant_hardware_dotations_support_id_idx" ON "tenant_hardware_dotations"("support_id")
  `);
  console.log('✓ Table tenant_hardware_dotations prête.');

  // 4. Table hardware_invoices
  console.log('4. Création de la table hardware_invoices...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "hardware_invoices" (
      "id" TEXT PRIMARY KEY,
      "tenant_id" TEXT NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
      "invoice_number" TEXT UNIQUE NOT NULL,
      "invoice_type" "HardwareInvoiceType" NOT NULL DEFAULT 'SETUP',
      "amount" DECIMAL(10, 2) NOT NULL,
      "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
      "payment_method" "PaymentMethod" NOT NULL DEFAULT 'CASH',
      "pdf_url" TEXT,
      "notes" TEXT,
      "items" JSONB,
      "paid_at" TIMESTAMP(3),
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "hardware_invoices_tenant_id_idx" ON "hardware_invoices"("tenant_id")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "hardware_invoices_status_idx" ON "hardware_invoices"("status")
  `);
  console.log('✓ Table hardware_invoices prête.');

  // 5. Colonnes sur tables et tenants
  console.log('5. Vérification/Ajout des colonnes sur tenants et tables...');
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "parrainage_credits" INTEGER NOT NULL DEFAULT 0;
    EXCEPTION
      WHEN duplicate_column THEN null;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "tables" ADD COLUMN IF NOT EXISTS "scans_today" INTEGER NOT NULL DEFAULT 0;
    EXCEPTION
      WHEN duplicate_column THEN null;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "tables" ADD COLUMN IF NOT EXISTS "total_scans" INTEGER NOT NULL DEFAULT 0;
    EXCEPTION
      WHEN duplicate_column THEN null;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "tables" ADD COLUMN IF NOT EXISTS "support_id" TEXT REFERENCES "qr_support_catalogs"("id") ON DELETE SET NULL;
    EXCEPTION
      WHEN duplicate_column THEN null;
    END $$;
  `);
  console.log('✓ Colonnes sur tables et tenants vérifiées.');

  // 6. Insertion des supports par défaut au catalogue si vide
  const count = await prisma.qRSupportCatalog.count();
  if (count === 0) {
    console.log('6. Initialisation du catalogue de supports par défaut...');
    const defaultSupports = [
      {
        id: 'supp_cube_bois_table',
        name: 'Cube VIP Bois Exotique (Tables)',
        description: 'Cube en bois massif avec gravure laser QR 4 faces, vernis protecteur mat et pochette jute offerte.',
        material: 'BOIS' as const,
        targetSpace: 'TABLE' as const,
        finishType: 'STANDARD' as const,
        costPrice: 2500,
        sellingPrice: 5000,
        stockQuantity: 120,
        packagingIncluded: true,
        antiTheftEngraving: true,
        isSavPack: false,
      },
      {
        id: 'supp_chevalet_marine_piscine',
        name: 'Chevalet Bord de Piscine & Plage (Finition Marine)',
        description: 'Chevalet acrylique haute densité ou bois traité bord de mer résistant aux UV, sel marin et chlore.',
        material: 'ACRYLIQUE' as const,
        targetSpace: 'POOL' as const,
        finishType: 'MARINE_VERNIS' as const,
        costPrice: 3500,
        sellingPrice: 7500,
        stockQuantity: 65,
        packagingIncluded: true,
        antiTheftEngraving: true,
        isSavPack: false,
      },
      {
        id: 'supp_standee_chambre_hotel',
        name: 'Standee Chambre d\'Hôtel & Suite VIP',
        description: 'Plaque pupitre design en acrylique fumé / socle bois pour tables de chevet ou bureaux de chambre.',
        material: 'ACRYLIQUE' as const,
        targetSpace: 'ROOM' as const,
        finishType: 'STANDARD' as const,
        costPrice: 3000,
        sellingPrice: 6000,
        stockQuantity: 80,
        packagingIncluded: true,
        antiTheftEngraving: true,
        isSavPack: false,
      },
      {
        id: 'supp_pack_secours_sav',
        name: 'Kit de Secours & Remplacement SAV (3 unités)',
        description: 'Lot de 3 supports de secours pré-gravés et numérotés d\'avance pour parer immédiatement à toute perte ou casse.',
        material: 'BOIS' as const,
        targetSpace: 'TABLE' as const,
        finishType: 'STANDARD' as const,
        costPrice: 4000,
        sellingPrice: 9000,
        stockQuantity: 40,
        packagingIncluded: true,
        antiTheftEngraving: true,
        isSavPack: true,
      },
    ];

    for (const s of defaultSupports) {
      await prisma.qRSupportCatalog.create({ data: s });
      console.log(`  + Support créé : ${s.name} (${s.sellingPrice} FCFA)`);
    }
  } else {
    console.log(`6. Catalogue déjà peuplé (${count} articles).`);
  }

  console.log('====================================================');
  console.log('✅ MIGRATION BASE DE DONNÉES ERP SUPPORTS 100% SUCCÈS');
  console.log('====================================================');
}

runMigration()
  .catch((err) => {
    console.error('❌ Erreur de migration:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
