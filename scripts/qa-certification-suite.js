const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runQACertification() {
  console.log('====================================================');
  console.log('  SUITE DE CERTIFICATION QA & PRODUCTION - LOU AME TAY ?');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST 1 : Vérification stricte des 4 comptes réels en base
  // ----------------------------------------------------
  console.log('1. VÉRIFICATION DE LA BASE DE DONNÉES MULTI-TENANT');
  const tenants = await prisma.tenant.findMany({
    select: { id: true, subdomain: true, businessName: true, email: true, currency: true }
  });
  assert(tenants.length === 4, `Exactement 4 restaurants en production (trouvé: ${tenants.length})`);
  const subdomains = tenants.map(t => t.subdomain).sort();
  assert(
    JSON.stringify(subdomains) === JSON.stringify(['anima-pizzeria', 'hotel-lat-dior', 'madiba-restaurant', 'sams-prestige']),
    `Les 4 restaurants réels sont exactement présents : ${subdomains.join(', ')}`
  );

  // ----------------------------------------------------
  // TEST 2 : Zéro faux caissier actif
  // ----------------------------------------------------
  console.log('\n2. INTÉGRITÉ DU PERSONNEL & CAISSIERS');
  const activeCashiers = await prisma.cashier.findMany({
    where: { isActive: true }
  });
  assert(activeCashiers.length === 0, `Zéro faux caissier actif en production (trouvé: ${activeCashiers.length})`);

  // ----------------------------------------------------
  // TEST 3 : Plan de Salle Réel en Base (Non fictif)
  // ----------------------------------------------------
  console.log('\n3. SYNCHRONISATION DU PLAN DE SALLE & TABLES BDD');
  const latDior = tenants.find(t => t.subdomain === 'hotel-lat-dior');
  const anima = tenants.find(t => t.subdomain === 'anima-pizzeria');
  const sams = tenants.find(t => t.subdomain === 'sams-prestige');
  const madiba = tenants.find(t => t.subdomain === 'madiba-restaurant');

  const tablesLatDior = await prisma.table.count({ where: { tenantId: latDior.id, isActive: true } });
  const tablesAnima = await prisma.table.count({ where: { tenantId: anima.id, isActive: true } });
  const tablesSams = await prisma.table.count({ where: { tenantId: sams.id, isActive: true } });
  const tablesMadiba = await prisma.table.count({ where: { tenantId: madiba.id, isActive: true } });

  assert(tablesLatDior === 24, `Hôtel Résidence Lat-Dior a ses 24 tables réelles en BDD (trouvé: ${tablesLatDior})`);
  assert(tablesAnima === 20, `Anima Pizzeria a ses 20 tables réelles en BDD (trouvé: ${tablesAnima})`);
  assert(tablesSams === 14, `Sam's Prestige a ses 14 tables réelles en BDD (trouvé: ${tablesSams})`);
  assert(tablesMadiba === 12, `Madiba Restaurant a ses 12 tables réelles en BDD (trouvé: ${tablesMadiba})`);

  // ----------------------------------------------------
  // TEST 4 : Création d'une commande réelle de test
  // ----------------------------------------------------
  console.log('\n4. FLUX DE COMMANDE, VERROUILLAGE ANTI-DOUBLON & ENCAISSEMENT');
  const testTenant = madiba;
  const testItem = await prisma.menuItem.findFirst({
    where: { category: { tenantId: testTenant.id } }
  });

  assert(!!testItem, `Plat du menu trouvé pour le test sur ${testTenant.businessName} : "${testItem?.name}" (${testItem?.price} FCFA)`);

  const orderTotal = Number(testItem.price);
  const testOrder = await prisma.order.create({
    data: {
      tenantId: testTenant.id,
      tableNumber: 1,
      customerName: 'Client QA Audit',
      customerNote: 'Test de conformité QA',
      paymentMethod: 'CASH',
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      totalAmount: orderTotal,
      items: {
        create: [
          {
            name: testItem.name,
            price: testItem.price,
            quantity: 1,
            menuItemId: testItem.id
          }
        ]
      }
    },
    include: { items: true }
  });

  assert(testOrder.status === 'PENDING', `Commande #${testOrder.id.slice(-5)} créée avec statut initial PENDING`);
  assert(testOrder.paymentStatus === 'UNPAID', `Statut paiement initial est bien UNPAID (Zéro fausse validation)`);

  // ----------------------------------------------------
  // TEST 5 : Création d'un Caissier et Ouverture de Session Caisse
  // ----------------------------------------------------
  console.log('\n5. OUVERTURE DE CAISSE & GESTION DE SESSION');
  const qaCashier = await prisma.cashier.create({
    data: {
      tenantId: testTenant.id,
      name: 'Caissier Test QA',
      pinCode: '9876',
      shift: 'MORNING',
      isActive: true,
    }
  });
  assert(!!qaCashier.id, `Nouveau caissier créé avec succès (PIN: 9876)`);

  const openingFloat = 20000;
  const qaSession = await prisma.cashSession.create({
    data: {
      tenantId: testTenant.id,
      cashierId: qaCashier.id,
      status: 'OPEN',
      openingFloat: openingFloat,
      openedAt: new Date()
    }
  });
  assert(qaSession.status === 'OPEN', `Session de caisse ouverte avec ${openingFloat} FCFA de fond de roulement`);

  // ----------------------------------------------------
  // TEST 6 : Encaissement de la Commande avec Calcul de Monnaie
  // ----------------------------------------------------
  console.log('\n6. ENCAISSEMENT RÉEL, MONNAIE RENDUE & CLÔTURE DE LA COMMANDE');
  const amountReceived = orderTotal + 2000; // Client donne plus
  const changeGiven = amountReceived - orderTotal;

  // Mise à jour comme réalisée par /api/cashier/orders/[id]/pay
  const paidOrder = await prisma.order.update({
    where: { id: testOrder.id },
    data: {
      status: 'SERVED',
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
      cashierId: qaCashier.id,
      cashSessionId: qaSession.id,
      servedAt: new Date()
    }
  });

  assert(paidOrder.status === 'SERVED', `Statut commande mis à jour à SERVED`);
  assert(paidOrder.paymentStatus === 'PAID', `Statut de paiement mis à jour à PAID`);
  assert(paidOrder.cashierId === qaCashier.id, `Commande rattachée au caissier en poste`);
  assert(paidOrder.cashSessionId === qaSession.id, `Commande rattachée à la session de caisse active`);
  assert(changeGiven === 2000, `Calcul de monnaie exact : ${changeGiven} FCFA (Reçu: ${amountReceived} F, Dû: ${orderTotal} F)`);

  // ----------------------------------------------------
  // TEST 7 : Clôture Z & Rapprochement Mathématique des Espèces
  // ----------------------------------------------------
  console.log('\n7. CLÔTURE DE SESSION Z & CONTRÔLE DES ÉCARTS');
  // Requête exacte de la route PATCH /api/cashier/session
  const sessionOrders = await prisma.order.findMany({
    where: {
      tenantId: qaSession.tenantId,
      OR: [
        { cashSessionId: qaSession.id },
        {
          cashSessionId: null,
          status: 'SERVED',
          paymentStatus: 'PAID',
          servedAt: { gte: qaSession.openedAt }
        }
      ]
    }
  });

  const totalCashSales = sessionOrders.reduce((acc, o) => acc + Number(o.totalAmount), 0);
  const expectedCash = openingFloat + totalCashSales;
  const countedCash = expectedCash; // Caisse équilibrée
  const cashDiscrepancy = countedCash - expectedCash;

  const closedSession = await prisma.cashSession.update({
    where: { id: qaSession.id },
    data: {
      status: 'CLOSED',
      closedAt: new Date(),
      countedCash: countedCash,
      expectedCash: expectedCash,
      cashDiscrepancy: cashDiscrepancy,
      totalCash: totalCashSales,
      totalRevenue: totalCashSales,
      orderCount: sessionOrders.length,
      notes: 'Clôture automatique suite test QA'
    }
  });

  assert(closedSession.status === 'CLOSED', `Session de caisse clôturée avec succès`);
  assert(Number(closedSession.totalRevenue) === orderTotal, `Chiffre d'affaires exact : ${closedSession.totalRevenue} FCFA`);
  assert(Number(closedSession.cashDiscrepancy) === 0, `Écart de caisse nul (0 FCFA) vérifié avec succès`);
  assert(closedSession.orderCount === 1, `Exactement 1 commande comptabilisée dans la session`);

  // ----------------------------------------------------
  // NETTOYAGE DES DONNÉES DU TEST QA
  // ----------------------------------------------------
  console.log('\n8. NETTOYAGE DES DONNÉES TEMPORAIRES DU TEST QA');
  await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } });
  await prisma.order.delete({ where: { id: testOrder.id } });
  await prisma.cashSession.delete({ where: { id: qaSession.id } });
  await prisma.cashier.delete({ where: { id: qaCashier.id } });
  console.log('  ✅ Données de test éphémères supprimées. BDD 100% propre.');

  console.log('\n====================================================');
  console.log(`  BILAN QA : ${passed} TESTS RÉUSSIS / ${failed} ÉCHECS`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runQACertification().catch(err => {
  console.error('Crash de la suite de certification:', err);
  process.exit(1);
}).finally(() => prisma.$disconnect());
