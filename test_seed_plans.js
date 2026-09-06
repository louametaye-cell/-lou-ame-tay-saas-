const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.ghkxrrmxvhwoyodygohc:Digitalartswork%40mg2023@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
    }
  }
});

async function main() {
  console.log("Checking plans in Supabase...");
  const currentPlans = await prisma.plan.findMany();
  console.log("Current plans count:", currentPlans.length);
  console.log(JSON.stringify(currentPlans, null, 2));

  // Sync / Upsert 3 official plans: Starter (15k), Pro (25k), Premium (45k)
  const officialPlans = [
    {
      id: "plan_starter",
      name: "Starter",
      slug: "starter",
      price: 15000,
      currency: "FCFA",
      description: "Menu digital standard, 20 photos HD, 1 table démo et support standard.",
      colorTheme: "#64748B",
      isRecommended: false,
      isActive: true,
    },
    {
      id: "plan_pro",
      name: "Pro",
      slug: "pro",
      price: 25000,
      currency: "FCFA",
      description: "Photos illimitées, KDS Cuisine live, Paiements Wave & OM, Statistiques caisse & QR codes.",
      colorTheme: "#FF6B00",
      isRecommended: true,
      isActive: true,
    },
    {
      id: "plan_premium",
      name: "Premium VIP",
      slug: "premium",
      price: 45000,
      currency: "FCFA",
      description: "Multi-zones, Menu 5 langues, Écran TV Digital Signage 3 modes, Mode Express Caisse & Support VIP 24/7.",
      colorTheme: "#D97706",
      isRecommended: false,
      isActive: true,
    }
  ];

  for (const p of officialPlans) {
    const existing = await prisma.plan.findFirst({
      where: { OR: [{ id: p.id }, { slug: p.slug }, { name: p.name }] }
    });

    if (existing) {
      await prisma.plan.update({
        where: { id: existing.id },
        data: {
          name: p.name,
          slug: p.slug,
          price: p.price,
          currency: p.currency,
          description: p.description,
          colorTheme: p.colorTheme,
          isRecommended: p.isRecommended,
          isActive: p.isActive
        }
      });
      console.log(`Updated plan: ${p.name} (${p.price} FCFA)`);
    } else {
      await prisma.plan.create({ data: p });
      console.log(`Created plan: ${p.name} (${p.price} FCFA)`);
    }
  }

  const updatedPlans = await prisma.plan.findMany();
  console.log("Updated Plans count:", updatedPlans.length);
  console.log(JSON.stringify(updatedPlans, null, 2));
}

main().catch(err => console.error("Error:", err)).finally(() => prisma.$disconnect());
