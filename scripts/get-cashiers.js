const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cashiers = await prisma.cashier.findMany({
    include: {
      tenant: { select: { subdomain: true, businessName: true } }
    }
  });
  console.log('--- CAISSIERS ENREGISTRÉS ---');
  for (const c of cashiers) {
    console.log(`[${c.tenant.subdomain}] Nom: ${c.name}, PIN: "${c.pinCode}", Actif: ${c.isActive}, Shift: ${c.shift}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
