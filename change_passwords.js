const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function run() {
  const hash = await bcrypt.hash('1234', 10);
  
  const result = await prisma.tenant.updateMany({
    data: {
      passwordHash: hash
    }
  });

  console.log(`Updated ${result.count} tenants with new password hash.`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
