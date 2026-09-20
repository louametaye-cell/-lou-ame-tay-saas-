const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSessions() {
  const sessions = await prisma.cashSession.findMany({
    select: {
      id: true,
      tenantId: true,
      cashierId: true,
      status: true,
      openingFloat: true,
      totalCash: true,
      totalRevenue: true,
      orderCount: true,
      openedAt: true,
      closedAt: true
    }
  });
  console.log('Cash sessions in DB:', sessions);
}

checkSessions().catch(console.error).finally(() => prisma.$disconnect());
