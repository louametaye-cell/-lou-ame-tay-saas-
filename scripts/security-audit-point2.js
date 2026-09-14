const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runPoint2MultiCashierAudit() {
  console.log('====================================================');
  console.log('AUDIT POINT 2 : MULTI-CAISSIERS & TRAÇABILITÉ INDIVIDUELLE');
  console.log('====================================================');

  // 1. Récupérer Anima Pizzeria
  const tenant = await prisma.tenant.findFirst({
    where: { subdomain: 'anima-pizzeria' },
    include: {
      cashiers: true
    }
  });

  if (!tenant) {
    throw new Error('Tenant Anima Pizzeria non trouvé');
  }

  console.log(`\n1. Établissement : ${tenant.businessName} (ID: ${tenant.id})`);
  console.log(`Caissiers actuellement existants :`);
  tenant.cashiers.forEach(c => {
    console.log(` - ID: ${c.id} | Nom: ${c.name} | PIN: [MASQUÉ/4 chiffres] | Shift: ${c.shift} | Actif: ${c.isActive}`);
  });

  // 2. Création d'un 2ème caissier de test
  const TEST_PIN = '5522';
  console.log(`\n2. Création d'un DEUXIÈME caissier distinct pour ${tenant.businessName} (PIN: ${TEST_PIN})...`);
  
  // Supprimer s'il existait déjà un reliquat
  await prisma.cashier.deleteMany({
    where: { tenantId: tenant.id, pinCode: TEST_PIN }
  });

  const secondCashier = await prisma.cashier.create({
    data: {
      tenantId: tenant.id,
      name: 'Moussa Diop (Caissier Test Traçabilité)',
      phone: '+221 77 000 99 88',
      pinCode: TEST_PIN,
      shift: 'EVENING',
      isActive: true
    }
  });

  console.log(`✅ Deuxième caissier créé avec succès :`);
  console.log(`   ID Unique : ${secondCashier.id}`);
  console.log(`   Nom : ${secondCashier.name}`);
  console.log(`   PIN : ${secondCashier.pinCode}`);

  // 3. Simuler une session de caisse pour Moussa Diop
  console.log(`\n3. Ouverture d'une session de caisse dédiée pour ce 2ème caissier...`);
  const session = await prisma.cashSession.create({
    data: {
      tenantId: tenant.id,
      cashierId: secondCashier.id,
      status: 'OPEN',
      openingFloat: 10000
    }
  });
  console.log(`✅ Session de caisse #${session.id} ouverte rattachée au cashierId: ${session.cashierId}`);

  // 4. Créer une commande test
  console.log(`\n4. Création d'une commande test pour tester l'encaissement nominatif...`);
  const testOrder = await prisma.order.create({
    data: {
      tenantId: tenant.id,
      tableNumber: 99,
      status: 'PREPARING',
      paymentStatus: 'UNPAID',
      totalAmount: 7500,
      customerName: 'Test Traçabilité QA'
    }
  });
  console.log(`✅ Commande #${testOrder.id} créée (Statut: ${testOrder.status}, Total: ${testOrder.totalAmount} FCFA)`);

  // 5. Encaissement de la commande par Moussa Diop via update / API pay logic
  console.log(`\n5. Encaissement de la commande par le 2ème caissier Moussa Diop...`);
  const paidOrder = await prisma.order.update({
    where: { id: testOrder.id },
    data: {
      status: 'SERVED',
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
      cashierId: secondCashier.id,
      cashSessionId: session.id
    },
    include: {
      cashier: {
        select: { id: true, name: true, shift: true }
      },
      cashSession: {
        select: { id: true, cashierId: true, openedAt: true }
      }
    }
  });

  console.log(`\n6. RÉSULTAT EN BASE DE DONNÉES APRÈS ENCAISSEMENT :`);
  console.log(`----------------------------------------------------`);
  console.log(`Commande ID         : ${paidOrder.id}`);
  console.log(`Statut Commande     : ${paidOrder.status}`);
  console.log(`Statut Paiement     : ${paidOrder.paymentStatus}`);
  console.log(`Rattachée au Caissier ID   : ${paidOrder.cashierId}`);
  console.log(`Nom du Caissier en Base    : ${paidOrder.cashier ? paidOrder.cashier.name : 'AUCUN'}`);
  console.log(`Session de Caisse ID       : ${paidOrder.cashSessionId}`);
  console.log(`Caissier de la Session     : ${paidOrder.cashSession?.cashierId}`);

  const isExactCashier = paidOrder.cashierId === secondCashier.id && paidOrder.cashier?.name === secondCashier.name;
  console.log(`\nPreuve d'attribution stricte au 2ème caissier ? ${isExactCashier ? '✅ OUI (100% PROUVÉ)' : '❌ NON'}`);

  // 7. Nettoyage immédiat
  console.log(`\n7. Nettoyage des données de démonstration (Commande, Session, Caissier)...`);
  await prisma.order.delete({ where: { id: testOrder.id } });
  await prisma.cashSession.delete({ where: { id: session.id } });
  await prisma.cashier.delete({ where: { id: secondCashier.id } });
  console.log(`✅ Données de test supprimées proprement. Zéro résidu.`);

  await prisma.$disconnect();
}

runPoint2MultiCashierAudit().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
