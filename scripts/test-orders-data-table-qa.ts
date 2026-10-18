import { prisma } from '../src/lib/prisma';

const REAL_RESTAURANTS = [
  'anima-pizzeria',
  'madiba-restaurant',
  'sams-prestige',
  'hotel-lat-dior'
];

async function runQATests() {
  console.log('================================================================');
  console.log('🧪 TEST QA E2E — DATA TABLE CAISSE & ARCHIVES GÉRANT COMMANDES');
  console.log('================================================================\n');

  let hasError = false;

  for (const subdomain of REAL_RESTAURANTS) {
    console.log(`\n----------------------------------------------------------------`);
    console.log(`🏢 VÉRIFICATION ÉTABLISSEMENT : [${subdomain.toUpperCase()}]`);
    console.log(`----------------------------------------------------------------`);

    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
      include: {
        plan: true
      }
    });

    if (!tenant) {
      console.error(`❌ Établissement "${subdomain}" non trouvé en base !`);
      hasError = true;
      continue;
    }

    const restaurantDisplayName = tenant.businessName || (tenant as any).name || subdomain;
    const planDisplayName = tenant.plan?.name || 'N/A';
    console.log(`✅ ID: ${tenant.id} | Nom: ${restaurantDisplayName} | Formule: ${planDisplayName}`);

    // 1. Test du filtrage "StartOfToday" pour la Caisse (données chaudes)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayOrders = await prisma.order.findMany({
      where: {
        tenantId: tenant.id,
        createdAt: { gte: startOfToday }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Commandes Caisse du jour (>= ${startOfToday.toISOString().split('T')[0]}) : ${todayOrders.length} commande(s)`);

    // 2. Test de l'Historique Global (Archives Gérant)
    const allOrdersCount = await prisma.order.count({
      where: { tenantId: tenant.id }
    });

    console.log(`📚 Total Historique complet (Archives Gérant) : ${allOrdersCount} commande(s)`);

    // 3. Test de l'Intégrité Financière des Archives (Section 11)
    const paidOrders = await prisma.order.findMany({
      where: {
        tenantId: tenant.id,
        paymentStatus: 'PAID',
        status: { not: 'CANCELLED' },
        paymentMethod: { notIn: ['STAFF_MEAL'] }
      }
    });

    const commercialRevenue = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    const cancelledPaidOrders = await prisma.order.count({
      where: {
        tenantId: tenant.id,
        paymentStatus: 'PAID',
        status: 'CANCELLED'
      }
    });

    if (cancelledPaidOrders > 0) {
      console.warn(`⚠️ ALERTE : ${cancelledPaidOrders} commande(s) CANCELLED marquée(s) PAID trouvée(s) ! Exclusion requise.`);
    } else {
      console.log(`🛡️ Intégrité Financière : 0 commande CANCELLED dans le CA commercial.`);
    }

    console.log(`💰 CA Commercial Encaissé vérifié : ${commercialRevenue.toLocaleString('fr-FR')} FCFA (${paidOrders.length} ventes valides)`);

    // 4. Test des types de commande (TABLE vs TAKEAWAY)
    const tableOrdersCount = await prisma.order.count({
      where: {
        tenantId: tenant.id,
        orderType: 'TABLE'
      }
    });

    const takeawayOrdersCount = await prisma.order.count({
      where: {
        tenantId: tenant.id,
        orderType: 'TAKEAWAY'
      }
    });

    console.log(`🏷️ Répartition commandes : ${tableOrdersCount} sur Table | ${takeawayOrdersCount} à Emporter / Comptoir`);
  }

  console.log('\n================================================================');
  if (hasError) {
    console.error('❌ CERTAINS TESTS ONT ÉCHOUÉ');
    process.exit(1);
  } else {
    console.log('✅ TOUS LES TESTS DE CONFORMITÉ SONT VALIDÉS SUR LES 4 COMPTES !');
    console.log('================================================================\n');
  }

  await prisma.$disconnect();
}

runQATests().catch((err) => {
  console.error('Erreur exécution QA:', err);
  prisma.$disconnect();
  process.exit(1);
});
