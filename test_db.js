const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Digitalartswork%40mg2023@db.ghkxrrmxvhwoyodygohc.supabase.co:5432/postgres"
    }
  }
});

async function main() {
  console.log("Testing Supabase DB connection...");
  const plans = await prisma.plan.findMany();
  console.log("Plans count:", plans.length);
  console.log("Plans:", JSON.stringify(plans, null, 2));

  const tenants = await prisma.tenant.findMany();
  console.log("Tenants count:", tenants.length);
  console.log("Tenants:", JSON.stringify(tenants, null, 2));
}

main().catch(err => {
  console.error("DB Error:", err);
}).finally(() => {
  prisma.$disconnect();
});
