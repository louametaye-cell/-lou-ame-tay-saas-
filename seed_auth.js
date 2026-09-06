const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany();
  const hashedPassword = await bcrypt.hash('Pass1234!', 10);
  
  for (const t of tenants) {
    const defaultEmail = `contact@${t.subdomain}.sn`;
    await prisma.tenant.update({
      where: { id: t.id },
      data: {
        email: t.email || defaultEmail,
        passwordHash: t.passwordHash || hashedPassword,
      }
    });
    console.log(`Updated tenant ${t.subdomain} with email ${defaultEmail}`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
