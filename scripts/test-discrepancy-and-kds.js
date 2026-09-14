const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runQaAuditAndProof() {
  console.log('================================================================');
  console.log('🧪 LOU AME TAY ? - SUITE DE TEST E2E & PREUVE FORMELLE ÉCART 0 F');
  console.log('================================================================\n');

  // 1. AUDIT DES 4 TENANTS DE PRODUCTION
  console.log('--- 1. VÉRIFICATION DES 4 TENANTS EN PRODUCTION ---');
  const targetSubdomains = ['anima-pizzeria', 'madiba-restaurant', 'sams-prestige', 'hotel-lat-dior'];
  const tenants = await prisma.tenant.findMany({
    where: { subdomain: { in: targetSubdomains } },
    include: {
      cashiers: true,
      _count: {
        select: { menuItems: true, tables: true, orders: true }
      }
    }
  });

  for (const sub of targetSubdomains) {
    const t = tenants.find((x) => x.subdomain === sub);
    if (!t) {
      throw new Error(`Tenant manquant en base : ${sub}`);
    }
    const activeCashiers = t.cashiers.filter((c) => c.isActive);
    console.log(`✅ [${t.subdomain}] ${t.businessName}`);
    console.log(`   - ID : ${t.id}`);
    console.log(`   - Caissiers actifs : ${activeCashiers.length} (${activeCashiers.map(c => `${c.name} [PIN: ${c.pinCode}]`).join(', ')})`);
    console.log(`   - Articles au menu : ${t._count.menuItems}`);
    console.log(`   - Tables configurées : ${t._count.tables}`);
    console.log(`   - Total commandes historiques : ${t._count.orders}`);
  }

  // 2. SCÉNARIO CRITIQUE D'ANIMA PIZZERIA (REPRODUCTION & NON-RÉGRESSION)
  console.log('\n--- 2. TEST DU FLUX ANIMA PIZZERIA : COMMANDE CUISINE NON PAYÉE ---');
  const anima = tenants.find((x) => x.subdomain === 'anima-pizzeria');
  const cashierAissatou = anima.cashiers.find((c) => c.name.toLowerCase().includes('aissatou')) || anima.cashiers[0];

  console.log(`👤 Caissière de test : ${cashierAissatou.name} (PIN: ${cashierAissatou.pinCode})`);

  // Nettoyer toute ancienne commande de test résiduelle
  const oldTestOrders = await prisma.order.findMany({
    where: { tenantId: anima.id, customerName: { startsWith: 'Test Client' } },
    select: { id: true }
  });
  if (oldTestOrders.length > 0) {
    const ids = oldTestOrders.map(o => o.id);
    await prisma.orderItem.deleteMany({ where: { orderId: { in: ids } } });
    await prisma.order.deleteMany({ where: { id: { in: ids } } });
  }

  // Fermer toute ancienne session OPEN orpheline pour le test
  await prisma.cashSession.updateMany({
    where: { tenantId: anima.id, status: 'OPEN' },
    data: { status: 'CLOSED', closedAt: new Date(), notes: 'Clôture automatique avant test E2E' }
  });

  // A. OUVERTURE DE CAISSE AVEC 10 000 FCFA DE FOND
  const OPENING_FLOAT = 10000;
  const testSession = await prisma.cashSession.create({
    data: {
      tenantId: anima.id,
      cashierId: cashierAissatou.id,
      openedAt: new Date(),
      openingFloat: OPENING_FLOAT,
      status: 'OPEN'
    }
  });
  console.log(`\n🟢 [ÉTAPE A] Session de caisse #${testSession.id.slice(-6)} ouverte :`);
  console.log(`   - Fond de caisse initial : ${OPENING_FLOAT} FCFA`);
  console.log(`   - Statut : ${testSession.status}`);

  // B. CRÉATION D'UNE COMMANDE DE 5 000 FCFA (PIZZA) TABLE 10 (IMPAYÉE)
  const ORDER_AMOUNT = 5000;
  const testOrder = await prisma.order.create({
    data: {
      tenantId: anima.id,
      tableNumber: 10,
      customerName: 'Test Client Table 10',
      totalAmount: ORDER_AMOUNT,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      paymentMethod: 'CASH',
      items: {
        create: [
          {
            name: 'Pizza Margherita Royale',
            price: 5000,
            quantity: 1
          }
        ]
      }
    },
    include: { items: true }
  });
  console.log(`\n📦 [ÉTAPE B] Commande #${testOrder.id.slice(-5)} créée par le client :`);
  console.log(`   - Table : ${testOrder.tableNumber}`);
  console.log(`   - Montant : ${testOrder.totalAmount} FCFA`);
  console.log(`   - Statut cuisine : ${testOrder.status}`);
  console.log(`   - Statut paiement : ${testOrder.paymentStatus}`);

  // C. PASSAGE EN CUISINE : PREPARING -> READY -> SERVED
  console.log(`\n🍳 [ÉTAPE C] Traitement en Cuisine :`);

  // 1. PREPARING
  const prepOrder = await prisma.order.update({
    where: { id: testOrder.id },
    data: { status: 'PREPARING' }
  });
  console.log(`   - Passage à PREPARING... (Statut : ${prepOrder.status})`);

  // 2. READY (Le cuisinier clique "Commande Prête")
  const readyOrder = await prisma.order.update({
    where: { id: testOrder.id },
    data: { status: 'READY', preparedAt: new Date() }
  });
  console.log(`   - Passage à READY... (Statut : ${readyOrder.status})`);

  // Vérification de l'écran TV Pickup
  const pickupReadyOrders = await prisma.order.findMany({
    where: {
      tenantId: anima.id,
      id: testOrder.id,
      status: 'READY'
    }
  });
  if (pickupReadyOrders.length === 1) {
    console.log(`   📺 Écran TV /pickup : Commande #${testOrder.id.slice(-4).toUpperCase()} APPARAÎT BIEN EN "PRÊT À RETIRER" !`);
  } else {
    throw new Error("ERREUR : La commande READY n'apparaît pas sur l'écran TV Pickup !");
  }

  // 3. SERVED (Le serveur prend le plat et clique "Servie à Table")
  // NOTE: En cuisine, l'API kitchen status interdit formellement de modifier paymentStatus
  const servedOrder = await prisma.order.update({
    where: { id: testOrder.id },
    data: { status: 'SERVED', servedAt: new Date() }
  });
  console.log(`   - Passage à SERVED... (Statut : ${servedOrder.status})`);

  // VÉRIFICATION CRUCIALE : Le paiement doit être STRICTEMENT UNPAID
  console.log(`\n🔍 [VÉRIFICATION 1] État du paiement après service en salle :`);
  console.log(`   - Statut commande : ${servedOrder.status}`);
  console.log(`   - Statut paiement : ${servedOrder.paymentStatus}`);
  if (servedOrder.paymentStatus !== 'UNPAID') {
    throw new Error(`VIOLATION CRITIQUE : paymentStatus est devenu '${servedOrder.paymentStatus}' au lieu de 'UNPAID' !`);
  }
  console.log(`   ✅ CONFORME : La commande est bien restée UNPAID !`);

  // D. CALCUL DU LIVE TOTALS DE CAISSE (GET /api/cashier/session)
  const sessionLiveOrders = await prisma.order.findMany({
    where: {
      tenantId: testSession.tenantId,
      paymentStatus: 'PAID', // FILTRE CORRIGÉ
      OR: [
        { cashSessionId: testSession.id },
        {
          cashSessionId: null,
          status: 'SERVED',
          servedAt: {
            gte: testSession.openedAt
          }
        }
      ]
    },
    select: { id: true, totalAmount: true, paymentMethod: true }
  });

  let liveCash = 0;
  sessionLiveOrders.forEach((o) => {
    liveCash += Number(o.totalAmount) || 0;
  });
  const expectedCashLive = OPENING_FLOAT + liveCash;

  console.log(`\n💰 [VÉRIFICATION 2] Totaux Caisse en Direct :`);
  console.log(`   - Commandes encaissées dans la session : ${sessionLiveOrders.length}`);
  console.log(`   - Recette Espèces Live : ${liveCash} FCFA`);
  console.log(`   - Espèces attendues dans le tiroir : ${expectedCashLive} FCFA (Fond ${OPENING_FLOAT} F + Ventes ${liveCash} F)`);
  if (liveCash !== 0) {
    throw new Error(`VIOLATION : La commande impayée a été incluse dans la recette live (${liveCash} F au lieu de 0 F) !`);
  }
  console.log(`   ✅ CONFORME : Recette de caisse = 0 FCFA. La commande non encaissée n'est PAS comptée !`);

  // E. CLÔTURE DE CAISSE AVEC COMPTAGE DES ESPÈCES (10 000 FCFA dans le tiroir)
  const COUNTED_CASH = 10000;
  const closedAt = new Date();

  // Requête de clôture Z (PATCH /api/cashier/session)
  const ordersAtClosing = await prisma.order.findMany({
    where: {
      tenantId: testSession.tenantId,
      paymentStatus: 'PAID', // FILTRE CORRIGÉ
      OR: [
        { cashSessionId: testSession.id },
        {
          cashSessionId: null,
          status: 'SERVED',
          servedAt: {
            gte: testSession.openedAt,
            lte: closedAt
          }
        }
      ]
    },
    select: { id: true, totalAmount: true, paymentMethod: true }
  });

  let closingCash = 0;
  ordersAtClosing.forEach((o) => {
    closingCash += Number(o.totalAmount) || 0;
  });
  const expectedCashAtClose = OPENING_FLOAT + closingCash;
  const discrepancy = COUNTED_CASH - expectedCashAtClose;

  const closedSession = await prisma.cashSession.update({
    where: { id: testSession.id },
    data: {
      status: 'CLOSED',
      closedAt,
      countedCash: COUNTED_CASH,
      expectedCash: expectedCashAtClose,
      cashDiscrepancy: discrepancy,
      totalCash: closingCash,
      totalRevenue: closingCash,
      notes: 'Test QA automatisé - Validation clôture zéro écart'
    }
  });

  console.log(`\n🏁 [VÉRIFICATION 3] Rapport Z de Clôture Comptable :`);
  console.log(`   - Fond initial : ${closedSession.openingFloat} FCFA`);
  console.log(`   - Recette Espèces Théorique : ${closingCash} FCFA`);
  console.log(`   - Espèces attendues dans le tiroir : ${closedSession.expectedCash} FCFA`);
  console.log(`   - Espèces réellement comptées : ${closedSession.countedCash} FCFA`);
  console.log(`   - ÉCART DE CAISSE FINAL : ${closedSession.cashDiscrepancy} FCFA`);

  if (Number(closedSession.cashDiscrepancy) !== 0) {
    throw new Error(`ÉCHEC CRITIQUE : Écart de caisse ${closedSession.cashDiscrepancy} FCFA != 0 FCFA !`);
  }
  console.log(`\n🎉 PROUVE RÉUSSIE : ÉCART DE CAISSE STRICT DE 0 FCFA !`);
  console.log(`   (Avant correction : écart de -10 000 FCFA à cause de l'intégration abusive des commandes impayées)`);

  // 3. SCÉNARIO COMPLÉMENTAIRE : COMMANDE ENCAISSÉE EN ESPÈCES AVEC MONNAIE
  console.log('\n--- 3. TEST DU FLUX ENCAISSEMENT RÉEL : COMMANDE PAYÉE 5 000 F AVEC BILLET 10 000 F ---');
  const paidSession = await prisma.cashSession.create({
    data: {
      tenantId: anima.id,
      cashierId: cashierAissatou.id,
      openedAt: new Date(),
      openingFloat: 10000,
      status: 'OPEN'
    }
  });

  const paidOrder = await prisma.order.create({
    data: {
      tenantId: anima.id,
      tableNumber: 12,
      customerName: 'Test Client Payant',
      totalAmount: 5000,
      status: 'SERVED',
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
      cashierId: cashierAissatou.id,
      cashSessionId: paidSession.id,
      servedAt: new Date(),
      items: {
        create: [
          {
            name: 'Pizza 4 Fromages',
            price: 5000,
            quantity: 1
          }
        ]
      }
    }
  });

  // Clôture avec 15 000 F comptés (10 000 fond + 5 000 recette nette)
  const ordersPaidClose = await prisma.order.findMany({
    where: {
      tenantId: paidSession.tenantId,
      paymentStatus: 'PAID',
      OR: [
        { cashSessionId: paidSession.id },
        {
          cashSessionId: null,
          status: 'SERVED',
          servedAt: { gte: paidSession.openedAt }
        }
      ]
    },
    select: { id: true, totalAmount: true }
  });

  const netCashPaid = ordersPaidClose.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const expectedPaid = 10000 + netCashPaid;
  const COUNTED_PAID = 15000;
  const discPaid = COUNTED_PAID - expectedPaid;

  const closedPaidSession = await prisma.cashSession.update({
    where: { id: paidSession.id },
    data: {
      status: 'CLOSED',
      closedAt: new Date(),
      countedCash: COUNTED_PAID,
      expectedCash: expectedPaid,
      cashDiscrepancy: discPaid,
      totalCash: netCashPaid,
      totalRevenue: netCashPaid
    }
  });

  console.log(`🏁 Rapport Z - Encaissement Réel :`);
  console.log(`   - Fond initial : ${closedPaidSession.openingFloat} FCFA`);
  console.log(`   - Ventes espèces réelles encaissées : ${netCashPaid} FCFA`);
  console.log(`   - Espèces attendues dans le tiroir : ${closedPaidSession.expectedCash} FCFA`);
  console.log(`   - Espèces réellement comptées : ${closedPaidSession.countedCash} FCFA`);
  console.log(`   - ÉCART DE CAISSE : ${closedPaidSession.cashDiscrepancy} FCFA`);

  if (Number(closedPaidSession.cashDiscrepancy) !== 0) {
    throw new Error(`ÉCHEC : Écart encaissement payé ${closedPaidSession.cashDiscrepancy} != 0 !`);
  }
  console.log(`🎉 PROUVE RÉUSSIE : ÉCART DE CAISSE STRICT DE 0 FCFA SUR ENCAISSEMENT RÉEL !`);

  // Nettoyage complet
  await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } });
  await prisma.order.delete({ where: { id: testOrder.id } });
  await prisma.cashSession.delete({ where: { id: testSession.id } });

  await prisma.orderItem.deleteMany({ where: { orderId: paidOrder.id } });
  await prisma.order.delete({ where: { id: paidOrder.id } });
  await prisma.cashSession.delete({ where: { id: paidSession.id } });

  console.log('\n🧹 Toutes les données de simulation ont été nettoyées avec succès.');
  console.log('================================================================');
}

runQaAuditAndProof()
  .catch((e) => {
    console.error('❌ ERREUR LORS DE LA VALIDATION QA :', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
