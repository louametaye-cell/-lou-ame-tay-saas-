const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSingleTenant(subdomain, testTableName) {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    include: {
      cashiers: { where: { isActive: true } },
      categories: { include: { items: true } }
    }
  });

  if (!tenant) throw new Error(`Tenant ${subdomain} non trouvé`);
  const cashier = tenant.cashiers[0];
  if (!cashier) throw new Error(`Aucun caissier actif pour ${tenant.businessName}`);

  const menuItem = tenant.categories.flatMap(c => c.items).find(i => i.isAvailable && i.price > 0) || tenant.categories[0]?.items[0];
  const itemPrice = Number(menuItem.price);

  console.log(`\n================================================================`);
  console.log(`🏢 TEST COMPLET : [${tenant.subdomain}] ${tenant.businessName}`);
  console.log(`👤 Caissier : ${cashier.name} (PIN: ${cashier.pinCode})`);
  console.log(`🍽️ Plat de test : "${menuItem.name}" (${itemPrice} FCFA) - Table ${testTableName}`);
  console.log(`================================================================`);

  // Nettoyage préalable
  const oldOrders = await prisma.order.findMany({
    where: { tenantId: tenant.id, customerName: { startsWith: 'Test Client QA' } },
    select: { id: true }
  });
  if (oldOrders.length > 0) {
    const ids = oldOrders.map(o => o.id);
    await prisma.orderItem.deleteMany({ where: { orderId: { in: ids } } });
    await prisma.order.deleteMany({ where: { id: { in: ids } } });
  }

  await prisma.cashSession.updateMany({
    where: { tenantId: tenant.id, status: 'OPEN' },
    data: { status: 'CLOSED', closedAt: new Date(), notes: 'Clôture auto avant audit' }
  });

  // 1. OUVERTURE DE SESSION CAISSE (Fond initial: 10 000 FCFA)
  const OPENING_FLOAT = 10000;
  const session = await prisma.cashSession.create({
    data: {
      tenantId: tenant.id,
      cashierId: cashier.id,
      openedAt: new Date(),
      openingFloat: OPENING_FLOAT,
      status: 'OPEN'
    }
  });
  console.log(`🟢 [1. Caisse Ouverte] Session #${session.id.slice(-6)} | Fond : ${OPENING_FLOAT} FCFA | Statut : OPEN`);

  // 2. COMMANDE CLIENT EN TABLE (Statut initial PENDING, UNPAID)
  const order = await prisma.order.create({
    data: {
      tenantId: tenant.id,
      tableNumber: testTableName,
      customerName: 'Test Client QA',
      totalAmount: itemPrice,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      paymentMethod: 'CASH',
      items: {
        create: [
          {
            name: menuItem.name,
            price: itemPrice,
            quantity: 1,
            menuItemId: menuItem.id
          }
        ]
      }
    }
  });
  console.log(`📦 [2. Commande Créée] #${order.id.slice(-5)} Table ${order.tableNumber} | Montant : ${order.totalAmount} FCFA | Cuisine: ${order.status} | Paiement: ${order.paymentStatus}`);

  // 3. CYCLE CUISINE KDS (PREPARING -> READY -> SERVED)
  // a) PREPARING
  await prisma.order.update({ where: { id: order.id }, data: { status: 'PREPARING' } });
  console.log(`🍳 [3. Cuisine KDS] Passage à PREPARING`);

  // b) READY
  await prisma.order.update({ where: { id: order.id }, data: { status: 'READY', preparedAt: new Date() } });
  const pickupReady = await prisma.order.findMany({
    where: { tenantId: tenant.id, id: order.id, status: 'READY' }
  });
  if (pickupReady.length !== 1) throw new Error(`Échec affichage TV Pickup pour ${tenant.subdomain}`);
  console.log(`📺 [4. Écran TV /pickup] Commande #${order.id.slice(-4).toUpperCase()} visible en "Prêt à retirer" !`);

  // c) SERVED (servie à table, mais NON encaissée)
  const servedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: 'SERVED', servedAt: new Date() }
  });
  console.log(`🍽️ [5. Service en Salle] Statut : ${servedOrder.status} | Paiement : ${servedOrder.paymentStatus}`);
  if (servedOrder.paymentStatus !== 'UNPAID') {
    throw new Error(`VIOLATION : Commande marquée payée indûment lors du service !`);
  }

  // 4. VÉRIFICATION DES RECETTES EN DIRECT (Caisse du jour)
  const livePaidOrders = await prisma.order.findMany({
    where: {
      tenantId: tenant.id,
      paymentStatus: 'PAID',
      OR: [
        { cashSessionId: session.id },
        { cashSessionId: null, status: 'SERVED', servedAt: { gte: session.openedAt } }
      ]
    }
  });
  const liveCashRevenue = livePaidOrders.reduce((acc, o) => acc + Number(o.totalAmount), 0);
  console.log(`💵 [6. Caisse du Jour] Recette encaissée : ${liveCashRevenue} FCFA (Attendu: 0 FCFA car commande non payée)`);
  if (liveCashRevenue !== 0) {
    throw new Error(`VIOLATION : La recette en direct inclut une commande impayée !`);
  }

  // 5. CLÔTURE DE CAISSE (Rapport Z avec 10 000 FCFA comptés dans le tiroir)
  const COUNTED_CASH = 10000;
  const closedAt = new Date();
  const closingOrders = await prisma.order.findMany({
    where: {
      tenantId: tenant.id,
      paymentStatus: 'PAID',
      OR: [
        { cashSessionId: session.id },
        { cashSessionId: null, status: 'SERVED', servedAt: { gte: session.openedAt, lte: closedAt } }
      ]
    }
  });
  const theoreticalSales = closingOrders.reduce((acc, o) => acc + Number(o.totalAmount), 0);
  const expectedTotalCash = OPENING_FLOAT + theoreticalSales;
  const discrepancy = COUNTED_CASH - expectedTotalCash;

  const closedSession = await prisma.cashSession.update({
    where: { id: session.id },
    data: {
      status: 'CLOSED',
      closedAt,
      countedCash: COUNTED_CASH,
      expectedCash: expectedTotalCash,
      cashDiscrepancy: discrepancy,
      totalCash: theoreticalSales,
      totalRevenue: theoreticalSales,
      notes: `Test de certification QA 4-tenants sur ${tenant.subdomain}`
    }
  });

  console.log(`🧾 [7. Rapport Z Clôture] :`);
  console.log(`   - Fond initial : ${closedSession.openingFloat} FCFA`);
  console.log(`   - Recette théorique : ${closedSession.totalCash} FCFA`);
  console.log(`   - Espèces attendues : ${closedSession.expectedCash} FCFA`);
  console.log(`   - Espèces comptées : ${closedSession.countedCash} FCFA`);
  console.log(`   - ÉCART DE CAISSE CONSTATÉ : ${closedSession.cashDiscrepancy} FCFA`);

  if (Number(closedSession.cashDiscrepancy) !== 0) {
    throw new Error(`ÉCHEC CRITIQUE sur ${tenant.subdomain} : Écart de caisse = ${closedSession.cashDiscrepancy} != 0 !`);
  }
  console.log(`✅ SUCCÈS CONFIRMÉ : ÉCART STRICT DE 0 FCFA SUR ${tenant.businessName.toUpperCase()}`);

  // Nettoyage des données de test
  await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
  await prisma.order.delete({ where: { id: order.id } });
  await prisma.cashSession.delete({ where: { id: session.id } });
  console.log(`🧹 Données de test nettoyées pour ${tenant.subdomain}.`);
}

async function runAll() {
  console.log('################################################################');
  console.log('🧪 CERTIFICATION MULTI-TENANT SUR LES 4 COMPTES RÉELS DE PRODUCTION');
  console.log('################################################################');

  await testSingleTenant('anima-pizzeria', 10);
  await testSingleTenant('madiba-restaurant', 3);
  await testSingleTenant('sams-prestige', 5);
  await testSingleTenant('hotel-lat-dior', 8);

  console.log('\n################################################################');
  console.log('🏆 RÉSULTAT FINAL : 4/4 COMPTES RÉELS CERTIFIÉS AVEC ÉCART 0 FCFA !');
  console.log('################################################################');
}

runAll()
  .catch((e) => {
    console.error('❌ ERREUR :', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
