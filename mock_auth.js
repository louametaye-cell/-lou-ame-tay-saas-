const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function run() {
  const identifier = 'mg-cafe-resto';
  const cleanInput = identifier.toLowerCase();
  try {
    const dbTenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { email: cleanInput },
          { subdomain: cleanInput },
          { phone: { contains: cleanInput } },
        ]
      }
    });
    console.log("Tenant found:", dbTenant ? dbTenant.subdomain : 'No');
  } catch(e) {
    console.error("Prisma Error:", e);
  }
}

run().finally(() => prisma.$disconnect());
