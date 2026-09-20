const { PrismaClient } = require('@prisma/client');

async function cleanOrders() {
  const prisma = new PrismaClient();
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: 'anima-pizzeria' },
    select: { id: true, businessName: true }
  });

  if (!tenant) {
    console.error('Tenant anima-pizzeria non trouvé');
    return;
  }

  // 1. Supprimer les waiterCalls liés
  const deletedCalls = await prisma.waiterCall.deleteMany({
    where: { tenantId: tenant.id }
  });
  console.log(`🧹 Appels serveurs nettoyés : ${deletedCalls.count}`);

  // 2. Supprimer les commandes de test
  const deletedOrders = await prisma.order.deleteMany({
    where: { tenantId: tenant.id }
  });
  console.log(`🧹 Commandes de test supprimées pour ${tenant.businessName} : ${deletedOrders.count}`);

  // 3. Vérification du solde restant
  const remaining = await prisma.order.count({
    where: { tenantId: tenant.id }
  });
  console.log(`✅ Commandes restantes pour ${tenant.businessName} : ${remaining}`);

  await prisma.$disconnect();
}

cleanOrders().catch(console.error);
