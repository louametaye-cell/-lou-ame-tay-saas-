const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const sessions = await prisma.cashSession.findMany({
    include: {
      cashier: true,
      tenant: { select: { subdomain: true } }
    }
  });
  console.log('SESSIONS:', JSON.stringify(sessions, null, 2));

  const ordersWithCashier = await prisma.order.findMany({
    where: { cashierId: { not: null } },
    select: {
      id: true,
      tenantId: true,
      cashierId: true,
      cashSessionId: true,
      totalAmount: true,
      status: true,
      paymentStatus: true,
      servedAt: true
    }
  });
  console.log('ORDERS WITH CASHIER:', JSON.stringify(ordersWithCashier, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
