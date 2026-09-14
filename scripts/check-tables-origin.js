const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrigin() {
  console.log('=== INSPECTION DE L\'ORIGINE DES TABLES EN BDD ===\n');

  const tenants = await prisma.tenant.findMany({
    include: {
      tables: {
        select: { id: true, tableNumber: true, label: true, zoneId: true, createdAt: true, updatedAt: true }
      },
      zones: {
        select: { id: true, name: true, createdAt: true }
      }
    }
  });

  for (const t of tenants) {
    console.log(`--- Restaurant: ${t.businessName} (${t.subdomain}) ---`);
    console.log(`Date création restaurant: ${t.createdAt}`);
    console.log(`Nombre de tables: ${t.tables.length}`);
    if (t.tables.length > 0) {
      const minCreated = new Date(Math.min(...t.tables.map(tb => new Date(tb.createdAt))));
      const maxCreated = new Date(Math.max(...t.tables.map(tb => new Date(tb.createdAt))));
      console.log(`Dates création tables: du ${minCreated.toISOString()} au ${maxCreated.toISOString()}`);
      console.log(`Exemple tables:`, t.tables.slice(0, 3).map(tb => ({ num: tb.tableNumber, label: tb.label, createdAt: tb.createdAt })));
    }
    console.log(`Zones existantes:`, t.zones.map(z => ({ name: z.name, createdAt: z.createdAt })));
    console.log('');
  }
}

checkOrigin().catch(console.error).finally(() => prisma.$disconnect());
