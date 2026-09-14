const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      subdomain: true,
      businessName: true,
      tables: {
        select: { id: true, tableNumber: true, label: true, zoneId: true, isActive: true }
      },
      zones: {
        select: { id: true, name: true }
      }
    }
  });

  for (const t of tenants) {
    console.log(`\nTenant: ${t.businessName} (${t.subdomain}) - Total Tables: ${t.tables.length}, Zones: ${t.zones.map(z => z.name).join(', ')}`);
    console.log(`Table Numbers: ${t.tables.map(tb => tb.tableNumber).sort((a,b)=>a-b).join(', ')}`);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
