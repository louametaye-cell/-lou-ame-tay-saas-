import { prisma } from '../src/lib/prisma';
import { invalidateLiveOrdersCache, invalidateDashboardStatsCache } from '../src/lib/cache';

async function reconcileMadibaOrders() {
  console.log('🚀 Démarrage de l\'assainissement des commandes résiduelles de Madiba Restaurant...');

  const tenant = await prisma.tenant.findFirst({
    where: { subdomain: 'madiba-restaurant' },
  });

  if (!tenant) {
    console.error('❌ Établissement madiba-restaurant introuvable !');
    process.exit(1);
  }

  const order2Id = 'cmvhcdrdf0001v5mtcq61zzm3'; // Table 2 - 12 000 FCFA
  const order3Id = 'cmvhcc7y80001l4xcx660q98h'; // Table 3 - 5 000 FCFA

  console.log(`\n1. Solder la commande Table 2 (${order2Id} - 12 000 FCFA)...`);
  const updatedOrder2 = await prisma.order.update({
    where: { id: order2Id },
    data: {
      status: 'SERVED',
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
      servedAt: new Date(),
    },
  });
  console.log(`✅ Commande Table 2 soldée : Status=${updatedOrder2.status}, Payment=${updatedOrder2.paymentStatus}`);

  console.log(`\n2. Solder la commande Table 3 (${order3Id} - 5 000 FCFA)...`);
  const updatedOrder3 = await prisma.order.update({
    where: { id: order3Id },
    data: {
      status: 'SERVED',
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
      servedAt: new Date(),
    },
  });
  console.log(`✅ Commande Table 3 soldée : Status=${updatedOrder3.status}, Payment=${updatedOrder3.paymentStatus}`);

  console.log('\n3. Libération de la Table 2...');
  const table2 = await prisma.table.updateMany({
    where: { tenantId: tenant.id, tableNumber: 2 },
    data: {
      status: 'FREE',
      clearedAt: new Date(),
    },
  });
  console.log(`✅ Table 2 libérée (status: FREE) : ${table2.count} table(s) mise(s) à jour`);

  console.log('\n4. Libération de la Table 3...');
  const table3 = await prisma.table.updateMany({
    where: { tenantId: tenant.id, tableNumber: 3 },
    data: {
      status: 'FREE',
      clearedAt: new Date(),
    },
  });
  console.log(`✅ Table 3 libérée (status: FREE) : ${table3.count} table(s) mise(s) à jour`);

  // Clôture des sessions de table si actives
  await prisma.tableSession.updateMany({
    where: {
      table: {
        tenantId: tenant.id,
        tableNumber: { in: [2, 3] },
      },
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });
  console.log('✅ Sessions de tables clôturées');

  // Invalidation des caches
  try {
    await invalidateLiveOrdersCache(tenant.id);
    await invalidateDashboardStatsCache(tenant.id);
    console.log('✅ Caches invalidés');
  } catch (e) {
    console.warn('Cache warning:', e);
  }

  // Vérification de l'état final
  console.log('\n=== ÉTAT FINAL DES TABLES MADIBA ===');
  const finalTables = await prisma.table.findMany({
    where: { tenantId: tenant.id, tableNumber: { in: [1, 2, 3, 4, 5] } },
    orderBy: { tableNumber: 'asc' },
  });
  finalTables.forEach((t) => {
    console.log(`Table ${t.tableNumber} : Status = ${t.status} | ClearedAt = ${t.clearedAt}`);
  });

  console.log('\n=== ÉTAT DES COMMANDES EN COURS (PENDING, PREPARING, READY) ===');
  const pendingOrders = await prisma.order.findMany({
    where: {
      tenantId: tenant.id,
      status: { in: ['PENDING', 'PREPARING', 'READY'] },
    },
  });
  console.log(`Nombre de commandes en cours restantes : ${pendingOrders.length}`);

  console.log('\n🎉 ASSAINISSEMENT MADIBA TERMINÉ AVEC SUCCÈS !');
}

reconcileMadibaOrders()
  .catch((e) => {
    console.error('Erreur assainissement:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
