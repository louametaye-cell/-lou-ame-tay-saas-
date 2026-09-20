const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Ajout des colonnes status et cleared_at sur la table tables...');
  await prisma.$executeRawUnsafe(`ALTER TABLE tables ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'FREE';`);
  await prisma.$executeRawUnsafe(`ALTER TABLE tables ADD COLUMN IF NOT EXISTS cleared_at TIMESTAMP WITHOUT TIME ZONE;`);
  console.log('Colonnes ajoutées avec succès !');
  const check = await prisma.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tables' AND column_name IN ('status', 'cleared_at');`;
  console.log('Colonnes créées:', check);
}

main().catch(console.error).finally(() => prisma.$disconnect());
