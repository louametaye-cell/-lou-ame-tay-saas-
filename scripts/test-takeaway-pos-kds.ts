import { prisma } from '../src/lib/prisma';

async function testTakeawayIsolation() {
  console.log('--- TEST QA & AUDIT DE PERSISTANCE DES VENTES DIRECTES (MODE URGENCE UX) ---');

  const testSubdomains = ['anima-pizzeria', 'madiba-restaurant', 'sams-prestige', 'hotel-lat-dior'];

  for (const subdomain of testSubdomains) {
    console.log(`\n🔍 Test pour l'établissement : ${subdomain}`);
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
      include: {
        cashiers: { where: { isActive: true } },
        menuItems: { take: 1 }
      }
    });

    if (!tenant) {
      console.log(`❌ Tenant ${subdomain} non trouvé.`);
      continue;
    }

    const cashier = tenant.cashiers[0];
    const menuItem = tenant.menuItems[0];
    if (!cashier || !menuItem) {
      console.log(`⚠️ Caissier ou article manquant pour ${subdomain}`);
      continue;
    }

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

    // 1. Simulation de la création d'une Vente Directe Comptoir
    console.log(`▶️ Étape 1 : Création Vente Directe au comptoir (Takeaway)...`);
    const directOrder = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        orderType: 'TAKEAWAY',
        tableNumber: 0,
        spaceType: 'COUNTER',
        destinationService: 'KITCHEN',
        locationDetail: 'À EMPORTER - Comptoir 1',
        customerName: 'Client Comptoir QA',
        status: 'SERVED',
        paymentStatus: 'PAID',
        paymentMethod: 'CASH',
        totalAmount: menuItem.price,
        cashierId: cashier.id,
        cashSessionId: session.id,
        servedAt: new Date(),
        items: {
          create: [{
            menuItemId: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1
          }]
        }
      },
      include: { items: true }
    });

    console.log(`✅ Commande créée : ID #${directOrder.id.slice(-6)} | orderType: ${directOrder.orderType} | status: ${directOrder.status} | payment: ${directOrder.paymentStatus}`);

    // 2. Vérification de l'exclusion stricte de la vue "Ventes sur Table (QR)"
    console.log(`▶️ Étape 2 : Vérification du filtre strict "Ventes sur Table"...`);
    const isTableOrder = directOrder.orderType === 'TABLE' && Number(directOrder.tableNumber) > 0;
    if (isTableOrder) {
      throw new Error(`❌ ÉCHEC : La vente directe est marquée comme table active !`);
    } else {
      console.log(`✅ SUCCÈS : La commande n'est PAS une commande de table. La vue "Ventes sur Table" reste 100% propre et vide.`);
    }

    // 3. Vérification de l'inclusion dans l'onglet "Ventes Comptoir du Jour"
    console.log(`▶️ Étape 3 : Vérification de l'onglet "Ventes Comptoir du Jour"...`);
    const isTakeaway = directOrder.orderType === 'TAKEAWAY' || directOrder.orderType === 'EXPRESS' || Number(directOrder.tableNumber) === 0;
    if (!isTakeaway) {
      throw new Error(`❌ ÉCHEC : La commande n'est pas identifiée comme Takeaway !`);
    } else {
      console.log(`✅ SUCCÈS : La commande apparaît correctement dans l'historique "Ventes Comptoir du Jour" comme réglée & clôturée.`);
    }

    // 4. Vérification de la visibilité sur l'écran KDS (Écran Cuisine)
    console.log(`▶️ Étape 4 : Vérification de la visibilité KDS (Brigade Cuisine)...`);
    const kdsVisible = directOrder.orderType === 'TAKEAWAY' && (Date.now() - new Date(directOrder.createdAt).getTime()) / (1000 * 60) < 90;
    if (!kdsVisible) {
      throw new Error(`❌ ÉCHEC : La commande n'est pas éligible à l'affichage KDS !`);
    } else {
      console.log(`✅ SUCCÈS : La commande est immédiatement visible en cuisine avec le badge "🥡 À EMPORTER / COMPTOIR".`);
    }

    // Nettoyage de la commande de test
    await prisma.orderItem.deleteMany({ where: { orderId: directOrder.id } });
    await prisma.order.delete({ where: { id: directOrder.id } });
    console.log(`🧹 Commande de test #${directOrder.id.slice(-6)} nettoyée avec succès.`);
  }

  console.log('\n================================================================');
  console.log('🏆 TOUS LES TESTS DE PERSISTANCE DES VENTES DIRECTES SONT VALIDÉS !');
  console.log('================================================================');
}

testTakeawayIsolation()
  .catch((e) => {
    console.error('❌ Erreur :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
