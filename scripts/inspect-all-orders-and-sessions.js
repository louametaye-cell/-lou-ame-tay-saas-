const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectData() {
  const tenants = await prisma.tenant.findMany({
    where: {
      subdomain: { in: ['anima-pizzeria', 'madiba-restaurant', 'sams-prestige', 'hotel-lat-dior'] }
    },
    select: {
      id: true,
      businessName: true,
      subdomain: true,
      orders: {
        select: {
          id: true,
          customerName: true,
          totalAmount: true,
          status: true,
          paymentStatus: true,
          paymentMethod: true,
          tableNumber: true,
          cashierId: true,
          cashSessionId: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      },
      cashSessions: {
        select: {
          id: true,
          status: true,
          openingFloat: true,
          countedCash: true,
          expectedCash: true,
          cashDiscrepancy: true,
          cashier: {
            select: { name: true }
          },
          openedAt: true,
          closedAt: true,
          orders: {
            select: {
              id: true,
              totalAmount: true
            }
          }
        },
        orderBy: {
          openedAt: 'desc'
        }
      }
    }
  });

  console.log('=== RAPPORT D\'INSPECTION DES COMMANDES ET SESSIONS DE CAISSE ===\n');

  for (const t of tenants) {
    console.log(`\n================================================================`);
    console.log(`🏢 Restaurant : ${t.businessName} (${t.subdomain}) - ID: ${t.id}`);
    console.log(`================================================================`);
    
    console.log(`\n📦 COMMANDES (${t.orders.length}) :`);
    if (t.orders.length === 0) {
      console.log('  (Aucune commande)');
    } else {
      for (const o of t.orders) {
        const shortCode = o.id.slice(-4).toUpperCase();
        const isTest = 
          (o.customerName && (o.customerName.toLowerCase().includes('test') || o.customerName.toLowerCase().includes('manuel'))) ||
          ['Z4EA', 'ZZ4EA', 'T3F41', 'FKPZ', '3Z1X', 'ZDAL', 'BJ9V'].some(code => shortCode.includes(code)) ||
          o.source === 'POS_EXPRESS_TEST' ||
          o.source === 'TEST_SCRIPT';

        console.log(`  - #${shortCode} (ID: ${o.id}) | Table: ${o.tableNumber || 'N/A'} | Client: "${o.customerName || 'N/A'}" | Total: ${o.totalAmount} FCFA | Statut: ${o.status} | Payé: ${o.paymentStatus} (${o.paymentMethod || 'N/A'}) | Date: ${o.createdAt.toISOString()} | [${isTest ? '⚠️ TEST' : '✅ VRAIE COMMANDE CLIENT'}]`);
      }
    }

    console.log(`\n💵 SESSIONS DE CAISSE (${t.cashSessions.length}) :`);
    if (t.cashSessions.length === 0) {
      console.log('  (Aucune session)');
    } else {
      for (const s of t.cashSessions) {
        console.log(`  - Session ${s.id} | Caissier: ${s.cashier?.name || 'N/A'} | Statut: ${s.status} | Fond: ${s.openingFloat} FCFA | Attendu: ${s.expectedCash ?? 'N/A'} FCFA | Compté: ${s.countedCash ?? 'N/A'} FCFA | Écart: ${s.cashDiscrepancy ?? 'N/A'} FCFA | Commandes rattachées: ${s.orders.length} | Ouverte le: ${s.openedAt.toISOString()}`);
      }
    }
  }
}

inspectData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
