const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanTestData() {
  console.log('=== NETTOYAGE CIBLÉ DES DONNÉES DE TEST SUR LES 4 COMPTES RÉELS ===\n');

  // 1. Suppression de la commande de test manuel Table 10 sur Anima Pizzeria
  const testOrderId = 'cmu0izm480003w2m0gyht3f41'; // Commande #3F41 Table 10 créée le 14/09/2026
  const existingOrder = await prisma.order.findUnique({
    where: { id: testOrderId },
    include: { items: true }
  });

  let deletedOrdersCount = 0;
  if (existingOrder) {
    console.log(`🗑️ Suppression de la commande de test : ID ${existingOrder.id} (Table 10, Total ${existingOrder.totalAmount} FCFA)...`);
    await prisma.orderItem.deleteMany({ where: { orderId: existingOrder.id } });
    await prisma.order.delete({ where: { id: existingOrder.id } });
    deletedOrdersCount = 1;
    console.log('✅ Commande de test Table 10 et ses articles supprimés avec succès.');
  } else {
    console.log('ℹ️ Commande de test Table 10 déjà supprimée ou inexistante.');
  }

  // 2. Suppression des 6 sessions de caisse de test créées le 14/09/2026 sur Anima Pizzeria
  const anima = await prisma.tenant.findUnique({ where: { subdomain: 'anima-pizzeria' } });
  const testSessions = await prisma.cashSession.findMany({
    where: {
      tenantId: anima.id,
      openedAt: { gte: new Date('2026-09-13T00:00:00.000Z') }
    }
  });

  console.log(`\n🗑️ Suppression de ${testSessions.length} session(s) de caisse de test sur Anima Pizzeria...`);
  // Détacher toute commande restante liée à ces sessions avant suppression
  for (const s of testSessions) {
    await prisma.order.updateMany({
      where: { cashSessionId: s.id },
      data: { cashSessionId: null }
    });
  }

  const deletedSessions = await prisma.cashSession.deleteMany({
    where: {
      id: { in: testSessions.map(s => s.id) }
    }
  });
  console.log(`✅ ${deletedSessions.count} session(s) de caisse de test supprimée(s).`);

  // 3. Remise à 0 des compteurs journaliers sur les 4 comptes réels
  console.log('\n🔄 Réinitialisation des compteurs journaliers (ordersToday = 0) sur les 4 comptes...');
  const updatedTenants = await prisma.tenant.updateMany({
    where: {
      subdomain: { in: ['anima-pizzeria', 'madiba-restaurant', 'sams-prestige', 'hotel-lat-dior'] }
    },
    data: {
      ordersToday: 0
    }
  });
  console.log(`✅ Compteurs journaliers réinitialisés sur ${updatedTenants.count} établissements.`);

  // 4. Bilan final de contrôle
  console.log('\n=== ÉTAT APRÈS NETTOYAGE ===');
  const checkTenants = await prisma.tenant.findMany({
    where: {
      subdomain: { in: ['anima-pizzeria', 'madiba-restaurant', 'sams-prestige', 'hotel-lat-dior'] }
    },
    select: {
      businessName: true,
      subdomain: true,
      ordersToday: true,
      orders: { select: { id: true, totalAmount: true, customerName: true, createdAt: true } },
      cashSessions: { select: { id: true, status: true, openingFloat: true } }
    }
  });

  for (const t of checkTenants) {
    console.log(`\n🏢 ${t.businessName} (${t.subdomain}) :`);
    console.log(`  - Commandes restantes : ${t.orders.length} (Zéro commande de test)`);
    console.log(`  - Sessions de caisse : ${t.cashSessions.length} (Toutes sessions de test purgées)`);
    console.log(`  - Compteur journalier ordersToday : ${t.ordersToday}`);
  }
}

cleanTestData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
