const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany({
    include: {
      cashiers: true,
      tables: true,
      categories: {
        include: {
          items: true
        }
      }
    }
  });

  console.log('--- TOUS LES RESTAURANTS EN BDD ---');
  for (const t of tenants) {
    console.log(`\nRestaurant : "${t.businessName}"`);
    console.log(`- ID : ${t.id}`);
    console.log(`- Subdomain : ${t.subdomain}`);
    console.log(`- Tables (${t.tables.length}) :`, t.tables.map(tbl => tbl.tableNumber).slice(0, 10).join(', '));
    console.log(`- Caissiers (${t.cashiers.length}) :`);
    t.cashiers.forEach(c => {
      console.log(`  * ${c.name} | PIN: ${c.pinCode} | Actif: ${c.isActive} | Shift: ${c.shift}`);
    });
    const items = t.categories.flatMap(c => c.items);
    console.log(`- Plats au menu (${items.length}) : ex: ${items[0]?.name} (${items[0]?.price} FCFA)`);
  }
}

main().finally(() => prisma.$disconnect());
