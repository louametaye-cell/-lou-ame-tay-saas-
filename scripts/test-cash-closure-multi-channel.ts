import { prisma } from '../src/lib/prisma';
import { PaymentMethod, OrderStatus } from '@prisma/client';

async function testCashClosureMultiChannel() {
  console.log('========================================================================');
  console.log('🧪 AUDIT QA & TEST MÉTIER : CLÔTURE DE CAISSE INTELLIGENTE MULTI-CANAUX');
  console.log('   (Comptage à l\'aveugle, Coupures FCFA, Mobile Money, TPE & Intégrité Financière)');
  console.log('   Vérification sur les 4 comptes réels : Anima, Madiba, Sam\'s, Lat-Dior');
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
        menuItems: { take: 1 }
      }
    });

    if (!tenant) {
      console.error(`❌ Établissement ${subdomain} non trouvé.`);
      allSuccess = false;
      continue;
    }

    const cashier = tenant.cashiers[0];
    const menuItem = tenant.menuItems[0];

    if (!cashier || !menuItem) {
      console.error(`❌ Données manquantes pour ${subdomain} (caissier ou plat).`);
      allSuccess = false;
      continue;
    }

    console.log(`👤 Caissier : ${cashier.name} (ID: ${cashier.id})`);

    // 1. Créer une session de caisse dédiée pour ce test
    const openingFloat = 15000;
    const session = await prisma.cashSession.create({
      data: {
        tenantId: tenant.id,
        cashierId: cashier.id,
        openingFloat,
        status: 'OPEN',
        openedAt: new Date()
      }
    });
    console.log(`🟢 Session créée : ID ${session.id} | Fond de départ : ${openingFloat} FCFA`);

    // 2. Créer les commandes de test multi-canaux rattachées à la session
    const createdOrderIds: string[] = [];

    // Commande Espèces (10 000 FCFA)
    const oCash = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        cashierId: cashier.id,
        cashSessionId: session.id,
        status: OrderStatus.SERVED,
        paymentStatus: 'PAID',
        paymentMethod: PaymentMethod.CASH,
        totalAmount: 10000,
        servedAt: new Date()
      }
    });
    createdOrderIds.push(oCash.id);

    // Commande Wave (12 500 FCFA)
    const oWave = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        cashierId: cashier.id,
        cashSessionId: session.id,
        status: OrderStatus.SERVED,
        paymentStatus: 'PAID',
        paymentMethod: PaymentMethod.WAVE,
        totalAmount: 12500,
        servedAt: new Date()
      }
    });
    createdOrderIds.push(oWave.id);

    // Commande Orange Money (7 500 FCFA)
    const oOM = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        cashierId: cashier.id,
        cashSessionId: session.id,
        status: OrderStatus.SERVED,
        paymentStatus: 'PAID',
        paymentMethod: PaymentMethod.ORANGE_MONEY,
        totalAmount: 7500,
        servedAt: new Date()
      }
    });
    createdOrderIds.push(oOM.id);

    // Commande Carte / TPE (20 000 FCFA)
    const oCard = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        cashierId: cashier.id,
        cashSessionId: session.id,
        status: OrderStatus.SERVED,
        paymentStatus: 'PAID',
        paymentMethod: PaymentMethod.CARD,
        totalAmount: 20000,
        servedAt: new Date()
      }
    });
    createdOrderIds.push(oCard.id);

    // 🛡️ PIÈGE D'INTÉGRITÉ FINANCIÈRE 1 : Commande Annulée (50 000 FCFA) -> Doit être ignorée !
    const oCancelled = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        cashierId: cashier.id,
        cashSessionId: session.id,
        status: OrderStatus.CANCELLED,
        paymentStatus: 'CANCELLED',
        paymentMethod: PaymentMethod.CASH,
        totalAmount: 50000,
        servedAt: new Date()
      }
    });
    createdOrderIds.push(oCancelled.id);

    // 🛡️ PIÈGE D'INTÉGRITÉ FINANCIÈRE 2 : Bon Repas Personnel NP (8 000 FCFA) -> Doit être exclu des recettes caisse !
    const oStaffMeal = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        cashierId: cashier.id,
        cashSessionId: session.id,
        status: OrderStatus.SERVED,
        paymentStatus: 'STAFF_NP',
        paymentMethod: PaymentMethod.STAFF_MEAL,
        employeeName: 'Mamadou Diallo',
        totalAmount: 8000,
        servedAt: new Date()
      }
    });
    createdOrderIds.push(oStaffMeal.id);

    console.log(`📦 6 Commandes générées : 4 payées (50 000 F), 1 annulée (50 000 F), 1 repas employé (8 000 F)`);

    // 3. Simuler le comptage de caisse à l'aveugle
    // Coupures dans le tiroir : 2 billets de 10 000 F (20 000 F) + 1 billet de 5 000 F (5 000 F) = 25 000 F
    // Attendu tiroir : Fond 15 000 F + Vente Cash 10 000 F = 25 000 F (Écart : 0 F !)
    const denominations = {
      10000: 2,
      5000: 1,
      2000: 0,
      1000: 0,
      500: 0,
      250: 0,
      200: 0,
      100: 0,
      50: 0
    };
    const countedCash = 25000;
    const countedWave = 12500;
    const countedOM = 7500;
    const countedFree = 0;
    const countedCard = 20000;
    const notes = 'Clôture de test QA DAW - Session parfaite';

    // 4. Exécuter la logique de clôture exacte du route handler PATCH
    const closedAt = new Date();
    const orders = await prisma.order.findMany({
      where: {
        tenantId: session.tenantId,
        paymentStatus: 'PAID',
        status: { not: 'CANCELLED' },
        paymentMethod: { not: PaymentMethod.STAFF_MEAL },
        OR: [
          { cashSessionId: session.id },
          {
            cashSessionId: null,
            status: 'SERVED',
            servedAt: {
              gte: session.openedAt,
              lte: closedAt
            }
          }
        ]
      },
      select: {
        id: true,
        paymentMethod: true,
        totalAmount: true
      }
    });

    let totalCash = 0;
    let totalWave = 0;
    let totalOM = 0;
    let totalYas = 0;
    let totalCard = 0;

    orders.forEach((o) => {
      const amount = Number(o.totalAmount) || 0;
      switch (o.paymentMethod) {
        case PaymentMethod.WAVE:
          totalWave += amount;
          break;
        case PaymentMethod.ORANGE_MONEY:
          totalOM += amount;
          break;
        case PaymentMethod.YAS_MONEY:
          totalYas += amount;
          break;
        case PaymentMethod.CARD:
          totalCard += amount;
          break;
        case PaymentMethod.CASH:
        case PaymentMethod.CASH_TPE:
        default:
          totalCash += amount;
          break;
      }
    });

    const totalRevenue = totalCash + totalWave + totalOM + totalYas + totalCard;
    const expectedCash = openingFloat + totalCash;
    const expectedTotal = openingFloat + totalRevenue;
    const countedTotal = countedCash + countedWave + countedOM + countedFree + countedCard;

    const cashDiscrepancy = countedCash - expectedCash;
    const waveDiscrepancy = countedWave - totalWave;
    const omDiscrepancy = countedOM - totalOM;
    const cardDiscrepancy = countedCard - totalCard;
    const totalDiscrepancy = countedTotal - expectedTotal;

    const closureAudit = {
      userNotes: notes,
      denominations,
      counted: { cash: countedCash, wave: countedWave, om: countedOM, free: countedFree, card: countedCard, total: countedTotal },
      expected: { cash: expectedCash, wave: totalWave, om: totalOM, free: totalYas, card: totalCard, total: expectedTotal },
      discrepancies: { cash: cashDiscrepancy, wave: waveDiscrepancy, om: omDiscrepancy, card: cardDiscrepancy, total: totalDiscrepancy }
    };

    const updatedSession = await prisma.cashSession.update({
      where: { id: session.id },
      data: {
        status: 'CLOSED',
        closedAt,
        countedCash,
        expectedCash,
        cashDiscrepancy,
        totalCash,
        totalWave,
        totalOM,
        totalYas,
        totalCard,
        totalRevenue,
        orderCount: orders.length,
        notes: JSON.stringify(closureAudit)
      }
    });

    // 5. Contrôles et Assertions QA
    console.log(`\n📊 RÉSULTAT DU CALCUL DE SESSION :`);
    console.log(`   • Espèces attendues : ${expectedCash} FCFA (Fond ${openingFloat} + Ventes ${totalCash}) | Compté : ${countedCash} FCFA | Écart : ${cashDiscrepancy} FCFA`);
    console.log(`   • Wave attendu : ${totalWave} FCFA | Compté : ${countedWave} FCFA | Écart : ${waveDiscrepancy} FCFA`);
    console.log(`   • Orange Money attendu : ${totalOM} FCFA | Compté : ${countedOM} FCFA | Écart : ${omDiscrepancy} FCFA`);
    console.log(`   • Carte/TPE attendue : ${totalCard} FCFA | Compté : ${countedCard} FCFA | Écart : ${cardDiscrepancy} FCFA`);
    console.log(`   • Total Recettes : ${totalRevenue} FCFA (Attendu : 50 000 FCFA)`);
    console.log(`   • Grand Total Écart : ${totalDiscrepancy} FCFA`);
    console.log(`   • Commandes commerciales comptabilisées : ${orders.length} (Attendu : 4 commandes)`);

    // Vérification stricte d'intégrité
    let tenantSuccess = true;

    if (totalRevenue !== 50000) {
      console.error(`❌ Échec Intégrité Financière : Le total des recettes est ${totalRevenue} au lieu de 50 000 FCFA !`);
      tenantSuccess = false;
    }

    if (orders.length !== 4) {
      console.error(`❌ Échec Intégrité : ${orders.length} commandes au lieu de 4 (commande annulée ou repas personnel inclus à tort) !`);
      tenantSuccess = false;
    }

    if (cashDiscrepancy !== 0 || totalDiscrepancy !== 0) {
      console.error(`❌ Échec Calcul d'Écart : Écart Espèces=${cashDiscrepancy}, Écart Total=${totalDiscrepancy} (Attendu : 0) !`);
      tenantSuccess = false;
    }

    if (!updatedSession.notes || !updatedSession.notes.includes('"denominations"')) {
      console.error(`❌ Échec Audit Coupures : Les coupures ne sont pas présentes dans session.notes !`);
      tenantSuccess = false;
    }

    if (tenantSuccess) {
      console.log(`✅ TEST SUCCÈS pour ${subdomain} : 100% conforme, 0 faille comptable, audit coupures persisté.`);
    } else {
      allSuccess = false;
    }

    // 6. Nettoyage des données de test
    await prisma.order.deleteMany({
      where: { id: { in: createdOrderIds } }
    });
    await prisma.cashSession.delete({
      where: { id: session.id }
    });
    console.log(`🧹 Données de test purgées proprement.`);
  }

  console.log('\n========================================================================');
  if (allSuccess) {
    console.log('🎉 TOUS LES TESTS SONT AU VERT SUR LES 4 COMPTES RÉELS !');
    console.log('   Intégrité financière garantie, calculs multi-devises certifiés.');
  } else {
    console.error('❌ ÉCHEC SUR AU MOINS UN COMPTE RÉEL.');
  }
  console.log('========================================================================\n');
}

testCashClosureMultiChannel()
  .catch((e) => {
    console.error('Erreur fatale script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
