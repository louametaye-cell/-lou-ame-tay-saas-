const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log('=== NETTOYAGE DES FAUX CAISSIERS DE SEED ===');

  // 1. Identifier les caissiers de test sans aucune session ni commande
  const cashiersToDelete = await prisma.cashier.findMany({
    where: {
      name: { in: ['Fatou Sow', 'Moussa Diop', 'Aminata Ndiaye'] },
      sessions: { none: {} },
      orders: { none: {} }
    },
    include: { tenant: { select: { subdomain: true } } }
  });

  console.log(`Trouvé ${cashiersToDelete.length} faux caissiers sans historique à supprimer.`);
  for (const c of cashiersToDelete) {
    await prisma.cashier.delete({ where: { id: c.id } });
    console.log(`- Supprimé: ${c.name} (${c.tenant?.subdomain}) [ID: ${c.id}]`);
  }

  // 2. Traiter les caissiers ayant un historique de session test
  const remaining = await prisma.cashier.findMany({
    where: {
      name: { in: ['Fatou Sow', 'Moussa Diop', 'Aminata Ndiaye'] }
    },
    include: { tenant: { select: { subdomain: true } }, _count: { select: { sessions: true, orders: true } } }
  });

  console.log(`\nTrouvé ${remaining.length} caissier(s) de test avec historique (désactivation stricte) :`);
  for (const c of remaining) {
    const updated = await prisma.cashier.update({
      where: { id: c.id },
      data: {
        isActive: false,
        name: `${c.name} (Archivé - Test QA)`,
      }
    });
    console.log(`- Désactivé et archivé: ${updated.name} (${c.tenant?.subdomain}) [Sessions: ${c._count.sessions}, Orders: ${c._count.orders}]`);
  }

  // 3. Vérification finale
  const activeCashiers = await prisma.cashier.findMany({
    where: { isActive: true },
    include: { tenant: { select: { subdomain: true } } }
  });
  console.log(`\nTOTAL CAISSIERS ACTIFS DANS TOUS LES RESTAURANTS : ${activeCashiers.length}`);
  for (const c of activeCashiers) {
    console.log(`- [${c.tenant?.subdomain}] ${c.name} (PIN: ${c.pinCode})`);
  }
}

cleanup().catch(console.error).finally(() => prisma.$disconnect());
