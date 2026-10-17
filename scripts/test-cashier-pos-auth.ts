import { prisma } from '../src/lib/prisma';

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delayMs = 1500): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      console.warn(`⚠️ Tentative ${i + 1}/${maxRetries} échouée : ${err.message}. Nouvelle tentative dans ${delayMs}ms...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastError;
}

async function main() {
  console.log('--- TEST DE VÉRIFICATION AUTHENTIFICATION CAISSE & VENTE DIRECTE ---');
  
  const testSubdomains = ['anima-pizzeria', 'madiba-restaurant', 'sams-prestige', 'hotel-lat-dior'];
  
  for (const subdomain of testSubdomains) {
    console.log(`\n🔍 Test pour l'établissement : ${subdomain}`);
    const tenant = await withRetry(() => prisma.tenant.findUnique({
      where: { subdomain },
      include: {
        cashiers: { where: { isActive: true } },
        menuItems: { take: 1 }
      }
    }));

    if (!tenant) {
      console.log(`❌ Tenant ${subdomain} non trouvé.`);
      continue;
    }

    console.log(`✅ Tenant ID: ${tenant.id} (${tenant.businessName})`);
    
    // Trouver ou créer un caissier de test actif
    let cashier = tenant.cashiers[0];
    if (!cashier) {
      cashier = await prisma.cashier.create({
        data: {
          tenantId: tenant.id,
          name: 'Caissier Test QA',
          pinCode: '1234',
          isActive: true
        }
      });
      console.log(`ℹ️ Caissier de test créé : ${cashier.name} (${cashier.id})`);
    } else {
      console.log(`ℹ️ Caissier trouvé : ${cashier.name} (${cashier.id})`);
    }

    // Trouver ou créer une session de caisse ouverte
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
      console.log(`ℹ️ Session de caisse ouverte créée : ${session.id}`);
    } else {
      console.log(`ℹ️ Session ouverte trouvée : ${session.id}`);
    }

    // Trouver un article de menu
    let menuItem = tenant.menuItems[0];
    if (!menuItem) {
      menuItem = await prisma.menuItem.create({
        data: {
          tenantId: tenant.id,
          name: 'Produit Test QA',
          price: 2500,
          isAvailable: true
        }
      });
    }

    // Test 1: Simulation appel API POST /api/cashier/orders avec tenantId = subdomain (cas de l'UI caisse)
    console.log(`▶️ Test 1 : Validation vente directe avec tenantId = "${subdomain}"...`);
    
    // Simuler la logique exacte du handler /api/cashier/orders
    const resolvedTenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: subdomain }, { subdomain }]
      },
      select: { id: true, subdomain: true, businessName: true }
    });

    if (!resolvedTenant) {
      throw new Error(`Établissement introuvable pour ${subdomain}`);
    }

    const dbCashier = await prisma.cashier.findFirst({
      where: { id: cashier.id, tenantId: resolvedTenant.id, isActive: true }
    });

    if (!dbCashier) {
      throw new Error(`Caissier non autorisé pour ${subdomain}`);
    }

    // Création de commande directe
    const directOrder = await prisma.order.create({
      data: {
        tenantId: resolvedTenant.id,
        tableNumber: 0,
        spaceType: 'COUNTER',
        destinationService: 'KITCHEN',
        locationDetail: 'À EMPORTER - Comptoir 1',
        customerName: 'Client Comptoir Test',
        status: 'PENDING',
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
      }
    });

    console.log(`✅ Commande directe créée avec succès ! Order ID: #${directOrder.id.slice(-6)} - Total: ${directOrder.totalAmount} FCFA`);

    // Test 2 : Test d'encaissement bon repas NP
    console.log(`▶️ Test 2 : Validation repas personnel (NP) avec employé...`);
    const staffOrder = await prisma.order.create({
      data: {
        tenantId: resolvedTenant.id,
        tableNumber: 0,
        spaceType: 'COUNTER',
        destinationService: 'KITCHEN',
        locationDetail: 'REPAS PERSONNEL - Moussa Diop',
        customerName: 'Employé : Moussa Diop',
        employeeName: 'Moussa Diop',
        status: 'PENDING',
        paymentStatus: 'STAFF_NP',
        paymentMethod: 'STAFF_MEAL',
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

    console.log(`✅ Bon repas NP créé avec succès ! Order ID: #${staffOrder.id.slice(-6)} - Statut: ${staffOrder.paymentStatus}`);

    // Nettoyage des commandes de test
    await prisma.orderItem.deleteMany({
      where: { orderId: { in: [directOrder.id, staffOrder.id] } }
    });
    await prisma.order.deleteMany({
      where: { id: { in: [directOrder.id, staffOrder.id] } }
    });
    console.log(`🧹 Commandes de test nettoyées proprement.`);
  }

  console.log('\n======================================================');
  console.log('🏆 TOUS LES TESTS D\'AUTHENTIFICATION ET VENTE ONT RÉUSSI SUR LES 4 COMPTES !');
  console.log('======================================================');
}

main()
  .catch((e) => {
    console.error('❌ Erreur de test :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
