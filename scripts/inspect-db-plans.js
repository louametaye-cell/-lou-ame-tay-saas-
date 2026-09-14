const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.plan.findMany({
    where: { slug: { in: ['tambali', 'nio-far'] } },
    include: {
      planFeatures: {
        include: { feature: true }
      }
    }
  });

  for (const p of plans) {
    console.log(`\n=== PLAN: ${p.slug} (${p.name}) - ${p.price} ${p.currency} ===`);
    console.log(`Description: ${p.description}`);
    for (const pf of p.planFeatures) {
      console.log(`  - [${pf.isActive ? 'OUI' : 'NON'}] ${pf.feature?.keyName}: ${pf.feature?.label}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
