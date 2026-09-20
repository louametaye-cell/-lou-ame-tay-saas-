const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanAllTestOrders() {
  console.log('--- DÉBUT DU NETTOYAGE DES COMMANDES DE TEST (4 ÉTABLISSEMENTS) ---');

  // 1. Supprimer tous les OrderItems des commandes de test
  const deletedItems = await prisma.orderItem.deleteMany({});
  console.log(`✅ ${deletedItems.count} articles de commande (OrderItem) supprimés.`);

  // 2. Supprimer toutes les commandes
  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`✅ ${deletedOrders.count} commandes (Order) supprimées.`);

  // 3. Supprimer tous les appels serveurs (WaiterCall)
  const deletedCalls = await prisma.waiterCall.deleteMany({});
  console.log(`✅ ${deletedCalls.count} appels serveurs (WaiterCall) supprimés.`);

  // 4. Mettre à jour les sessions de caisse ouvertes pour qu'elles aient 0 ventes et 0 commandes
  const updatedSessions = await prisma.cashSession.updateMany({
    where: { status: 'OPEN' },
    data: {
      totalCash: 0,
      totalWave: 0,
      totalOM: 0,
      totalYas: 0,
      totalCard: 0,
      totalRevenue: 0,
      orderCount: 0
    }
  });
  console.log(`✅ ${updatedSessions.count} sessions de caisse ouvertes remises à zéro (0 FCFA de ventes).`);

  // 5. Invalider les caches Redis
  try {
    const { Redis } = require('@upstash/redis');
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN
      });
      // Invalider les clés de stats et commandes
      const keys = await redis.keys('*');
      const statKeys = keys.filter(k => k.startsWith('stats:') || k.startsWith('live_orders:') || k.startsWith('menu:'));
      if (statKeys.length > 0) {
        await redis.del(...statKeys);
        console.log(`✅ ${statKeys.length} clés de cache Redis invalidées.`);
      }
    }
  } catch (e) {
    console.log('⚠️ Redis cache cleanup notice:', e.message);
  }

  console.log('--- VÉRIFICATION POST-NETTOYAGE ---');
  const tenants = await prisma.tenant.findMany({
    select: { id: true, businessName: true, subdomain: true }
  });
  for (const t of tenants) {
    const remainingOrders = await prisma.order.count({ where: { tenantId: t.id } });
    const remainingCalls = await prisma.waiterCall.count({ where: { tenantId: t.id } });
    console.log(`[${t.subdomain}] "${t.businessName}": ${remainingOrders} commande(s), ${remainingCalls} appel(s)`);
  }
}

cleanAllTestOrders()
  .catch((err) => {
    console.error('Erreur lors du nettoyage:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
