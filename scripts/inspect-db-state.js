const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const tenants = await prisma.tenant.findMany({
    select: { id: true, businessName: true, subdomain: true }
  });
  console.log('Tenants in DB:', tenants.length);
  for (const t of tenants) {
    const orders = await prisma.order.findMany({
      where: { tenantId: t.id },
      select: { id: true, tableNumber: true, customerName: true, status: true, paymentStatus: true, totalAmount: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    const calls = await prisma.waiterCall.findMany({
      where: { tenantId: t.id },
      select: { id: true, tableNumber: true, status: true, createdAt: true, resolvedAt: true }
    });
    console.log(`\n=== [${t.subdomain}] "${t.businessName}" (${t.id}) ===`);
    console.log(`  Orders (${orders.length}):`);
    orders.forEach(o => {
      console.log(`    - ID: ${o.id}, Table: ${o.tableNumber}, Client: ${o.customerName}, Status: ${o.status}, PayStatus: ${o.paymentStatus}, Total: ${o.totalAmount}, Date: ${o.createdAt}`);
    });
    console.log(`  WaiterCalls (${calls.length}):`);
    calls.forEach(c => {
      console.log(`    - ID: ${c.id}, Table: ${c.tableNumber}, Status: ${c.status}, Date: ${c.createdAt}, ResolvedAt: ${c.resolvedAt}`);
    });
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
