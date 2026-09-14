const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function searchTestOrders() {
  const testOrders = await prisma.order.findMany({
    where: {
      OR: [
        { customerName: { contains: 'Test', mode: 'insensitive' } },
        { customerName: { contains: 'Manuel', mode: 'insensitive' } },
        { customerNote: { contains: 'Test', mode: 'insensitive' } },
        { customerNote: { contains: 'Script', mode: 'insensitive' } }
      ]
    },
    include: { tenant: { select: { subdomain: true, businessName: true } } }
  });
  console.log('Commandes avec "Test" ou "Manuel" dans le nom ou note:', testOrders.length);
  testOrders.forEach(o => {
    console.log(`- [${o.tenant.subdomain}] ID: ${o.id} | Client: "${o.customerName}" | Note: "${o.customerNote}" | Total: ${o.totalAmount} FCFA | Date: ${o.createdAt.toISOString()}`);
  });
}

searchTestOrders().finally(() => prisma.$disconnect());
