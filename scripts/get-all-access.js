const { PrismaClient } = require('@prisma/client');

async function getAllAccess() {
  const prisma = new PrismaClient();

  const tenants = await prisma.tenant.findMany({
    include: {
      plan: true,
      cashiers: true,
    }
  });

  console.log('=== LISTE DES 4 RESTAURANTS ===\n');

  for (const t of tenants) {
    console.log(`--------------------------------------------------`);
    console.log(`RESTAURANT : ${t.businessName} (${t.subdomain})`);
    console.log(`Formule active : ${t.plan?.name || t.currentPlanId} (Slug: ${t.plan?.slug})`);
    console.log(`Email gérant : ${t.email}`);
    console.log(`Propriétaire : ${t.ownerName}`);
    console.log(`Téléphone : ${t.phone}`);
    console.log(`Hash mot de passe gérant : ${t.passwordHash?.substring(0, 20)}...`);
    console.log(`CAISSIERS DÉDIÉS :`);
    t.cashiers.forEach(c => {
      console.log(`  - Nom: ${c.name} | Shift: ${c.shift} | PIN: ${c.pinCode} | Actif: ${c.isActive} | ID: ${c.id}`);
    });
    console.log(`--------------------------------------------------\n`);
  }

  await prisma.$disconnect();
}

getAllAccess().catch(console.error);
