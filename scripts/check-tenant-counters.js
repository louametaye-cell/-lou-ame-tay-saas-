const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCounters() {
  const tenants = await prisma.tenant.findMany({
    where: {
      subdomain: { in: ['anima-pizzeria', 'madiba-restaurant', 'sams-prestige', 'hotel-lat-dior'] }
    },
    select: {
      id: true,
      businessName: true,
      subdomain: true,
      ordersToday: true,
      qrScansToday: true
    }
  });
  console.log('Compteurs actuels des tenants :');
  console.log(JSON.stringify(tenants, null, 2));
}

checkCounters().finally(() => prisma.$disconnect());
