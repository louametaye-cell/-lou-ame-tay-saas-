const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    where: { tenantId: 'tenant_anima_pizzeria' },
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  });
  console.log(`Total commandes Anima Pizzeria : ${orders.length}`);
  orders.forEach(o => {
    console.log(`\nID: ${o.id} (Code: ${o.id.slice(-4).toUpperCase()})`);
    console.log(`  Date: ${o.createdAt.toISOString()}`);
    console.log(`  Table: ${o.tableNumber} | Client: "${o.customerName}" | Note: "${o.customerNote}"`);
    console.log(`  Total: ${o.totalAmount} FCFA | Statut: ${o.status} | Paiement: ${o.paymentStatus} (${o.paymentMethod})`);
    o.items.forEach(it => console.log(`   - ${it.name} x${it.quantity} (${it.price} FCFA)`));
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
