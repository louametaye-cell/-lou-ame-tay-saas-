import { prisma } from '../src/lib/prisma';

async function inspect() {
  const tenant = await prisma.tenant.findFirst({
    where: { subdomain: 'madiba-restaurant' },
    include: {
      tables: {
        orderBy: { tableNumber: 'asc' }
      },
      orders: {
        orderBy: { createdAt: 'desc' },
        include: { items: true }
      },
      cashSessions: {
        orderBy: { openedAt: 'desc' },
        take: 3,
        include: { orders: true }
      }
    }
  });

  if (!tenant) {
    console.log('Tenant madiba-restaurant non trouvé');
    return;
  }

  console.log('=== TENANT ===', tenant.id, tenant.businessName);
  console.log('\n=== TABLES OCCUPÉES / TOUTES TABLES ===');
  tenant.tables.forEach(t => {
    if (t.status === 'OCCUPIED' || t.tableNumber <= 6) {
      console.log(`Table ${t.tableNumber} (ID: ${t.id}) | Status: ${t.status} | clearedAt: ${t.clearedAt}`);
    }
  });

  console.log(`\n=== COMMANDES (${tenant.orders.length} au total) ===`);
  tenant.orders.forEach(o => {
    console.log(`Order ID: ${o.id} | Table: ${o.tableNumber} | Type: ${o.orderType} | Status: ${o.status} | PayStatus: ${o.paymentStatus} | Total: ${o.totalAmount} | Created: ${o.createdAt.toISOString()}`);
    console.log(`  -> Items: ${o.items.map(i => i.quantity + 'x ' + (i.name || i.menuItemId)).join(', ')}`);
  });

  console.log('\n=== SESSIONS DE CAISSE RÉCENTES ===');
  tenant.cashSessions.forEach(cs => {
    console.log(`Session ID: ${cs.id} | Status: ${cs.status} | Fond: ${cs.openingCash} | Ouverte: ${cs.openedAt.toISOString()} | ClosedAt: ${cs.closedAt ? cs.closedAt.toISOString() : 'ACTIVE'} | OrdersCount: ${cs.orders.length}`);
  });
}

inspect().finally(() => prisma.$disconnect());
