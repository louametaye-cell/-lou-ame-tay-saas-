const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const tenants = await prisma.tenant.findMany();
  console.log(tenants.map(t => ({subdomain: t.subdomain, email: t.email, pass: t.passwordHash})));
}
run().finally(() => prisma.$disconnect());
