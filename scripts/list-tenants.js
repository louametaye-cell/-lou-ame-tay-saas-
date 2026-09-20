const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const tenants = await prisma.tenant.findMany({ select: { id: true, subdomain: true, businessName: true } });
  console.log(JSON.stringify(tenants, null, 2));
}

run().finally(() => prisma.$disconnect());
