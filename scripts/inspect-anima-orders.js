const { PrismaClient } = require('@prisma/client');

async function inspectOrders() {
  const prisma = new PrismaClient();
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: 'anima-pizzeria' },
    select: { id: true, businessName: true }
  });

  if (!tenant) {
    console.log('Tenant anima-pizzeria not found');
    return;
  }

  const orders = await prisma.order.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  });

  console.log(`Found ${orders.length} orders for ${tenant.businessName}:`);
  orders.forEach(o => {
    console.log(`- ID: ${o.id} | Table: ${o.tableNumber} | Status: ${o.status} | Payment: ${o.paymentStatus} | Total: ${o.totalAmount} FCFA | Date: ${o.createdAt.toISOString()} | Items: ${o.items.length}`);
  });

  await prisma.$disconnect();
}

inspectOrders().catch(console.error);
