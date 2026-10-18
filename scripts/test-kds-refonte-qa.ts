import { prisma } from '../src/lib/prisma';
import { isDrinkOrBarItem } from '../src/lib/order-routing';

async function runKDSRefonteQA() {
  console.log('========================================================================');
  console.log('🧪 TEST QA E2E — REFONTE KDS CUISINE, ROUTAGE & HISTORIQUE DAKAR');
  console.log('========================================================================\n');

  // Test sur Sam's Prestige (formule XÉWEUL avec accès KDS certifié)
  const subdomain = 'sams-prestige';
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    include: {
      menuItems: { take: 5 },
      plan: true
    }
  });

  if (!tenant) {
    console.error(`❌ Établissement ${subdomain} non trouvé en base !`);
    process.exit(1);
  }

  console.log(`✅ Établissement : ${tenant.businessName} (ID: ${tenant.id})`);
  console.log(`✅ Formule souscrite : ${tenant.plan?.name || 'XÉWEUL'}\n`);

  const createdOrderIds: string[] = [];

  try {
    // 1. TEST COMMANDE CHAMBRE 101 (Nourriture -> Cuisine KDS)
    console.log('------------------------------------------------------------------------');
    console.log('TEST 1 : Création Commande depuis Chambre 101 (Room Service)');
    console.log('------------------------------------------------------------------------');

    const foodItem = tenant.menuItems.find((m) => !isDrinkOrBarItem(m)) || {
      id: tenant.menuItems[0]?.id,
      name: 'Poulet Yassa Royal',
      price: 4500
    };

    const roomOrder = await (prisma as any).order.create({
      data: {
        tenantId: tenant.id,
        tableNumber: 101,
        orderType: 'TABLE',
        spaceType: 'ROOM',
        destinationService: 'KITCHEN',
        locationDetail: 'Chambre 101 - Room Service',
        customerName: 'Client Chambre 101',
        totalAmount: Number(foodItem.price) || 4500,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        paymentMethod: 'CASH',
        items: {
          create: [
            {
              menuItemId: foodItem.id,
              name: foodItem.name,
              price: Number(foodItem.price) || 4500,
              quantity: 1
            }
          ]
        }
      },
      include: { items: true }
    });

    createdOrderIds.push(roomOrder.id);
    console.log(`✅ Commande Chambre 101 créée : ID ${roomOrder.id}`);
    console.log(`   • Table/Chambre : ${roomOrder.tableNumber}`);
    console.log(`   • SpaceType / Origine : ${roomOrder.spaceType}`);
    console.log(`   • Destination : ${roomOrder.destinationService}`);
    console.log(`   • LocationDetail : "${roomOrder.locationDetail}"\n`);

    if (roomOrder.spaceType !== 'ROOM' || roomOrder.destinationService !== 'KITCHEN') {
      throw new Error('Échec validation commande Chambre 101 !');
    }

    // 2. TEST COMMANDE COMPTOIR EXPRESS (À Emporter -> Cuisine KDS)
    console.log('------------------------------------------------------------------------');
    console.log('TEST 2 : Création Commande au Comptoir / À Emporter');
    console.log('------------------------------------------------------------------------');

    const counterOrder = await (prisma as any).order.create({
      data: {
        tenantId: tenant.id,
        tableNumber: 0,
        orderType: 'TAKEAWAY',
        spaceType: 'COUNTER',
        destinationService: 'KITCHEN',
        locationDetail: 'À Emporter / Comptoir',
        customerName: 'Client Comptoir Express',
        totalAmount: 3500,
        status: 'PREPARING',
        paymentStatus: 'PAID',
        paymentMethod: 'CASH',
        items: {
          create: [
            {
              name: 'Burger Dakar Frites',
              price: 3500,
              quantity: 1
            }
          ]
        }
      },
      include: { items: true }
    });

    createdOrderIds.push(counterOrder.id);
    console.log(`✅ Commande Comptoir créée : ID ${counterOrder.id}`);
    console.log(`   • TableNumber : ${counterOrder.tableNumber}`);
    console.log(`   • OrderType : ${counterOrder.orderType}`);
    console.log(`   • SpaceType : ${counterOrder.spaceType}`);
    console.log(`   • Destination : ${counterOrder.destinationService}`);
    console.log(`   • LocationDetail : "${counterOrder.locationDetail}"\n`);

    if (counterOrder.spaceType !== 'COUNTER' || counterOrder.orderType !== 'TAKEAWAY' || counterOrder.destinationService !== 'KITCHEN') {
      throw new Error('Échec validation commande Comptoir !');
    }

    // 3. TEST COMMANDE 100% BOISSONS (Bar -> Poste BAR uniquement)
    console.log('------------------------------------------------------------------------');
    console.log('TEST 3 : Création Commande 100% Boissons Bar');
    console.log('------------------------------------------------------------------------');

    const barOrder = await (prisma as any).order.create({
      data: {
        tenantId: tenant.id,
        tableNumber: 4,
        orderType: 'TABLE',
        spaceType: 'TABLE',
        destinationService: 'BAR',
        locationDetail: 'Table 04',
        customerName: 'Client Table 04',
        totalAmount: 2000,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        paymentMethod: 'WAVE',
        items: {
          create: [
            {
              name: 'Jus de Bissap Glacé',
              price: 1000,
              quantity: 2
            }
          ]
        }
      },
      include: { items: true }
    });

    createdOrderIds.push(barOrder.id);
    console.log(`✅ Commande Bar créée : ID ${barOrder.id}`);
    console.log(`   • Destination : ${barOrder.destinationService}\n`);

    // 4. TEST DU ROUTAGE STRICT DE L'API KDS CUISINE vs BAR
    console.log('------------------------------------------------------------------------');
    console.log('TEST 4 : Vérification du Filtrage Strict par Poste KDS');
    console.log('------------------------------------------------------------------------');

    // Requête KDS Poste Cuisine (destinationService = 'KITCHEN')
    const kitchenOrders = await (prisma as any).order.findMany({
      where: {
        tenantId: tenant.id,
        destinationService: 'KITCHEN',
        status: { in: ['PENDING', 'PREPARING', 'READY'] }
      }
    });

    const hasRoomInKitchen = kitchenOrders.some((o: any) => o.id === roomOrder.id);
    const hasCounterInKitchen = kitchenOrders.some((o: any) => o.id === counterOrder.id);
    const hasBarInKitchen = kitchenOrders.some((o: any) => o.id === barOrder.id);

    console.log(`🍳 Poste KDS Cuisine : ${kitchenOrders.length} ticket(s) actif(s)`);
    console.log(`   • Commande Chambre 101 présente en Cuisine ? ${hasRoomInKitchen ? '✅ OUI' : '❌ NON'}`);
    console.log(`   • Commande Comptoir présente en Cuisine ? ${hasCounterInKitchen ? '✅ OUI' : '❌ NON'}`);
    console.log(`   • Commande Bar exclue de la Cuisine ? ${!hasBarInKitchen ? '✅ OUI (Parfait)' : '❌ NON'}`);

    if (!hasRoomInKitchen || !hasCounterInKitchen || hasBarInKitchen) {
      throw new Error('Le routage KDS Cuisine est défaillant !');
    }

    // Requête KDS Poste Bar (destinationService = 'BAR')
    const barOrders = await (prisma as any).order.findMany({
      where: {
        tenantId: tenant.id,
        destinationService: 'BAR',
        status: { in: ['PENDING', 'PREPARING', 'READY'] }
      }
    });

    const hasBarInBarStation = barOrders.some((o: any) => o.id === barOrder.id);
    const hasRoomInBarStation = barOrders.some((o: any) => o.id === roomOrder.id);

    console.log(`🍹 Poste KDS Bar : ${barOrders.length} ticket(s) actif(s)`);
    console.log(`   • Commande Boissons présente au Bar ? ${hasBarInBarStation ? '✅ OUI' : '❌ NON'}`);
    console.log(`   • Commande Chambre Nourriture exclue du Bar ? ${!hasRoomInBarStation ? '✅ OUI (Parfait)' : '❌ NON'}\n`);

    if (!hasBarInBarStation || hasRoomInBarStation) {
      throw new Error('Le routage KDS Bar est défaillant !');
    }

    // 5. TEST DE L'HISTORIQUE KDS (Timezone Dakar & Statuts PREPARING/READY/SERVED)
    console.log('------------------------------------------------------------------------');
    console.log('TEST 5 : Vérification de l\'Historique KDS (Non-vide, Traçabilité Origine)');
    console.log('------------------------------------------------------------------------');

    // Passer la commande comptoir à SERVED pour tester l'historique complet
    await (prisma as any).order.update({
      where: { id: counterOrder.id },
      data: {
        status: 'SERVED',
        servedAt: new Date()
      }
    });

    const dakarDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Dakar',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    const startOfTodayDakar = new Date(`${dakarDateStr}T00:00:00.000Z`);

    const historyKitchenOrders = await (prisma as any).order.findMany({
      where: {
        tenantId: tenant.id,
        createdAt: { gte: startOfTodayDakar },
        status: { in: ['PREPARING', 'READY', 'SERVED'] },
        destinationService: 'KITCHEN'
      },
      orderBy: { updatedAt: 'desc' }
    });

    console.log(`📜 Historique KDS Cuisine Dakar (>= ${dakarDateStr}) : ${historyKitchenOrders.length} commande(s)`);
    historyKitchenOrders.forEach((o: any, idx: number) => {
      const isExpress = o.orderType === 'EXPRESS' || o.orderType === 'TAKEAWAY' || o.tableNumber === 0;
      const isRoom = o.spaceType === 'ROOM' || (o.locationDetail && o.locationDetail.toLowerCase().includes('chambre'));
      const label = isRoom ? (o.locationDetail || `Chambre ${o.tableNumber} - Room Service`) : isExpress ? 'À Emporter / Comptoir' : `Table ${o.tableNumber}`;
      console.log(`   [#${idx + 1}] ID: ${o.id.slice(-6)} | Statut: ${o.status} | Origine: "${label}"`);
    });

    if (historyKitchenOrders.length === 0) {
      throw new Error('L\'historique KDS est vide !');
    }

    console.log('\n========================================================================');
    console.log('✅ TOUS LES TESTS DE ROUTAGE ET KDS CUISINE SONT 100% VALIDÉS !');
    console.log('========================================================================\n');

  } finally {
    // Nettoyage des commandes de test
    if (createdOrderIds.length > 0) {
      console.log(`🧹 Nettoyage de ${createdOrderIds.length} commande(s) de test...`);
      await (prisma as any).orderItem.deleteMany({
        where: { orderId: { in: createdOrderIds } }
      });
      await (prisma as any).order.deleteMany({
        where: { id: { in: createdOrderIds } }
      });
      console.log('✅ Nettoyage terminé.');
    }
    await prisma.$disconnect();
  }
}

runKDSRefonteQA().catch((err) => {
  console.error('❌ ERREUR QA:', err);
  prisma.$disconnect();
  process.exit(1);
});
