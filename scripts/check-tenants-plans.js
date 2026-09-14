const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const tenants = await p.tenant.findMany({
    select: {
      id: true,
      businessName: true,
      subdomain: true,
      currentPlanId: true,
      subscriptionStatus: true,
      plan: true
    }
  });
  console.log('Tenants et leurs plans:');
  console.log(JSON.stringify(tenants, null, 2));

  // Vérifions aussi s'il y a un modèle Plan dans la base
  try {
    const plans = await p.plan.findMany();
    console.log('Plans disponibles:');
    console.log(JSON.stringify(plans, null, 2));
  } catch (e) {
    console.log('Pas de table plan ou erreur:', e.message);
  }

  await p.$disconnect();
}

main().catch(console.error);
