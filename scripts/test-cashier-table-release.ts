import { prisma } from '../src/lib/prisma';
import { executeReleaseTable } from '../src/lib/table-release';

async function testCashierTableRelease() {
  console.log('========================================================================');
  console.log('🧪 AUDIT QA & TEST MÉTIER : LIBÉRATION DES TABLES DEPUIS LA CAISSE');
  console.log('   (Vérification sur les 4 comptes réels : Anima, Madiba, Sam\'s, Lat-Dior)');
  console.log('========================================================================\n');

  const testSubdomains = ['anima-pizzeria', 'madiba-restaurant', 'sams-prestige', 'hotel-lat-dior'];
  let allSuccess = true;

  for (const subdomain of testSubdomains) {
    console.log(`\n------------------------------------------------------------`);
    console.log(`🏢 TEST ÉTABLISSEMENT : ${subdomain}`);
    console.log(`------------------------------------------------------------`);

    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
      include: {
        cashiers: { where: { isActive: true } },
        tables: { where: { isActive: true }, orderBy: { tableNumber: 'asc' } },
        menuItems: { take: 1 }
      }
    });

    if (!tenant) {
      console.error(`❌ Établissement ${subdomain} non trouvé en BDD.`);
      allSuccess = false;
      continue;
    }

    const cashier = tenant.cashiers[0];
    const targetTable = tenant.tables[0];
    const menuItem = tenant.menuItems[0];

    if (!cashier || !targetTable || !menuItem) {
      console.error(`❌ Données manquantes pour ${subdomain} (caissier, table ou menu).`);
      allSuccess = false;
      continue;
    }

    console.log(`👤 Caissier : ${cashier.name} (ID: ${cashier.id})`);
    console.log(`🪑 Table Cible : Table ${targetTable.tableNumber} (ID: ${targetTable.id})`);

    // 1. Ouvrir une session caisse si besoin
    let session = await prisma.cashSession.findFirst({
      where: { tenantId: tenant.id, status: 'OPEN' }
    });
    if (!session) {
      session = await prisma.cashSession.create({
        data: {
          tenantId: tenant.id,
          cashierId: cashier.id,
          openingFloat: 10000,
          status: 'OPEN'
        }
      });
    }

    // 2. Étape A : Créer une commande de table ACTIVE et NON PAYÉE
    console.log(`\n▶️ Étape A : Création d'une commande active NON PAYÉE sur Table ${targetTable.tableNumber}...`);
    const unpaidOrder = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        tableNumber: targetTable.tableNumber,
        tableId: targetTable.id,
        orderType: 'TABLE',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'CASH',
        customerName: 'Client Test Impayé QA',
        totalAmount: menuItem.price,
        cashierId: cashier.id,
        cashSessionId: session.id,
        items: {
          create: [{
            menuItemId: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1
          }]
        }
      }
    });
    console.log(`   ✅ Commande impayée créée : #${unpaidOrder.id.slice(-6).toUpperCase()} (${Number(menuItem.price)} FCFA)`);

    // 3. Étape B : Tentative de libération de table par le caissier -> DOIT ÊTRE BLOQUÉE
    console.log(`▶️ Étape B : Tentative de libération par le caissier avec commande impayée...`);
    const dummyReqUnpaid = new Request('http://localhost:3000/api/cashier/tables', {
      headers: {
        'x-cashier-token': `${cashier.id}:${tenant.id}`
      }
    });

    const rejectResponse = await executeReleaseTable({
      req: dummyReqUnpaid,
      tenantIdOrSubdomain: tenant.id,
      tableNumber: targetTable.tableNumber,
      tableId: targetTable.id,
      cashierId: cashier.id,
    });

    const rejectData = await rejectResponse.json();
    if (rejectResponse.status === 400 && rejectData.code === 'UNPAID_ORDERS_EXIST') {
      console.log(`   🟢 VERROU FINANCIER PARFAIT : Libération refusée avec succès (HTTP 400).`);
      console.log(`      Message reçu : "${rejectData.error}"`);
    } else {
      console.error(`   ❌ ÉCHEC DU VERROU FINANCIER : La table a été libérée malgré une commande impayée !`, rejectData);
      allSuccess = false;
    }

    // 4. Étape C : Paiement de la commande par le caissier
    console.log(`▶️ Étape C : Encaissement de la commande #${unpaidOrder.id.slice(-6).toUpperCase()} (passage à PAID & SERVED)...`);
    await prisma.order.update({
      where: { id: unpaidOrder.id },
      data: {
        paymentStatus: 'PAID',
        status: 'SERVED',
        servedAt: new Date(),
      }
    });
    console.log(`   ✅ Commande encaissée et clôturée avec succès.`);

    // 5. Étape D : Libération de la table après encaissement -> DOIT RÉUSSIR
    console.log(`▶️ Étape D : Libération de la table par le caissier après encaissement...`);
    const dummyReqPaid = new Request('http://localhost:3000/api/cashier/tables', {
      headers: {
        'x-cashier-token': `${cashier.id}:${tenant.id}`
      }
    });

    const successResponse = await executeReleaseTable({
      req: dummyReqPaid,
      tenantIdOrSubdomain: tenant.id,
      tableNumber: targetTable.tableNumber,
      tableId: targetTable.id,
      cashierId: cashier.id,
    });

    const successData = await successResponse.json();
    if (successResponse.status === 200 && successData.success) {
      console.log(`   🟢 SUCCÈS : Table libérée avec succès (HTTP 200).`);
      console.log(`      Message : "${successData.message}"`);
      console.log(`      Statut retourné : ${successData.table.status} | clearedAt : ${successData.table.clearedAt}`);
    } else {
      console.error(`   ❌ ÉCHEC : La libération a échoué après encaissement !`, successData);
      allSuccess = false;
    }

    // 6. Étape E : Contrôle de l'état en BDD & Cohérence Dashboard Gérant
    console.log(`▶️ Étape E : Contrôle en BDD et synchronisation Espace Gérant...`);
    const refreshedTable = await prisma.table.findUnique({
      where: { id: targetTable.id },
      include: { sessions: { where: { isActive: true } } }
    });

    const isTableFreeInDb = refreshedTable?.status === 'FREE';
    const isSessionClosed = (refreshedTable?.sessions.length || 0) === 0;
    const isClearedAfterOrder = refreshedTable?.clearedAt && unpaidOrder.createdAt
      ? new Date(refreshedTable.clearedAt).getTime() >= new Date(unpaidOrder.createdAt).getTime()
      : false;

    if (isTableFreeInDb && isSessionClosed && isClearedAfterOrder) {
      console.log(`   🟢 SYNCHRONISATION CERTIFIÉE :`);
      console.log(`      - Statut Table BDD : ${refreshedTable?.status} (🟢 FREE)`);
      console.log(`      - TableSessions actives : ${refreshedTable?.sessions.length} (Clôturées)`);
      console.log(`      - clearedAt postérieur à la commande : OUI (Dashboard Gérant voit la table 🟢 LIBRE)`);
    } else {
      console.error(`   ❌ Problème de consistance BDD :`, { isTableFreeInDb, isSessionClosed, isClearedAfterOrder });
      allSuccess = false;
    }

    // 7. Nettoyage de la commande de test
    await prisma.orderItem.deleteMany({ where: { orderId: unpaidOrder.id } });
    await prisma.order.delete({ where: { id: unpaidOrder.id } });
    console.log(`🧹 Commande de test #${unpaidOrder.id.slice(-6).toUpperCase()} nettoyée.`);
  }

  console.log('\n========================================================================');
  if (allSuccess) {
    console.log('🏆 TOUS LES TESTS DE LIBÉRATION DES TABLES SONT VALIDÉS SUR LES 4 COMPTES !');
  } else {
    console.log('❌ DES ERREURS ONT ÉTÉ DÉTECTÉES LORS DE L\'AUDIT QA.');
  }
  console.log('========================================================================');
}

testCashierTableRelease()
  .catch((e) => {
    console.error('Erreur critique pendant le test:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
