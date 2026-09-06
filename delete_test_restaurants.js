const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanTestRestaurants() {
  console.log('Cleaning test restaurants from Supabase PostgreSQL...');

  const allTenants = await prisma.tenant.findMany({});
  console.log(`Found ${allTenants.length} total restaurants in BDD.`);

  for (const t of allTenants) {
    const nameLower = (t.businessName || '').toLowerCase();
    const subLower = (t.subdomain || '').toLowerCase();

    const isTest = 
      nameLower.includes('test') || 
      subLower.includes('test') || 
      nameLower.includes('keur ben') || 
      subLower.includes('keur') ||
      nameLower.includes('fast food buur') ||
      subLower.includes('fastfoodbuur');

    if (isTest) {
      console.log(`Deleting test restaurant: ${t.businessName} (${t.subdomain})...`);
      await prisma.tenant.delete({ where: { id: t.id } });
    }
  }

  const remaining = await prisma.tenant.findMany({ select: { businessName: true, subdomain: true } });
  console.log('Remaining Clean Production Restaurants:', remaining);
}

cleanTestRestaurants()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
