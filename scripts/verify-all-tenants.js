const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany({
    select: { id: true, businessName: true, subdomain: true, currentPlanId: true, plan: { select: { name: true, slug: true } } }
  });
  console.log('--- ÉTAT DES 4 ÉTABLISSEMENTS RÉELS ---');
  for (const t of tenants) {
    const orders = await prisma.order.count({ where: { tenantId: t.id } });
    const calls = await prisma.waiterCall.count({ where: { tenantId: t.id } });
    const sessions = await prisma.cashSession.count({ where: { tenantId: t.id, status: 'OPEN' } });
    const items = await prisma.menuItem.count({ where: { tenantId: t.id } });
    console.log(`- [${t.subdomain}] "${t.businessName}" | Plan: ${t.plan ? t.plan.slug : t.currentPlanId} | Commandes en base: ${orders} | Appels: ${calls} | Sessions caisse ouvertes: ${sessions} | Plats au menu: ${items}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
