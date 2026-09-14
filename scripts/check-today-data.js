const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTodayOrders() {
  const since = new Date('2026-09-13T00:00:00.000Z');
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: since } },
    include: { tenant: { select: { subdomain: true, businessName: true } } }
  });
  console.log(`Commandes créées depuis le 13/09/2026 : ${orders.length}`);
  orders.forEach(o => {
    console.log(`- [${o.tenant.subdomain}] #${o.id.slice(-4).toUpperCase()} | Table: ${o.tableNumber} | Client: ${o.customerName} | Note: ${o.customerNote} | Total: ${o.totalAmount} | Statut: ${o.status}`);
  });

  const sessions = await prisma.cashSession.findMany({
    where: { openedAt: { gte: since } },
    include: { tenant: { select: { subdomain: true } } }
  });
  console.log(`\nSessions de caisse créées depuis le 13/09/2026 : ${sessions.length}`);
  sessions.forEach(s => {
    console.log(`- [${s.tenant.subdomain}] Session ${s.id} | Statut: ${s.status} | Fond: ${s.openingFloat} | Attendu: ${s.expectedCash} | Compté: ${s.countedCash} | Date: ${s.openedAt.toISOString()}`);
  });
}

checkTodayOrders()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
