const { PrismaClient } = require('@prisma/client');

async function testUrl(url, name) {
  console.log(`Testing ${name}...`);
  const prisma = new PrismaClient({
    datasources: { db: { url } }
  });
  try {
    const count = await prisma.tenant.count();
    console.log(`SUCCESS ${name}! Count:`, count);
    await prisma.$disconnect();
    return true;
  } catch (err) {
    console.error(`FAILED ${name}:`, err.message);
    await prisma.$disconnect();
    return false;
  }
}

async function runTests() {
  const password = "Digitalartswork%40mg2023";
  const ref = "ghkxrrmxvhwoyodygohc";
  
  // 1. Direct host
  await testUrl(`postgresql://postgres:${password}@db.${ref}.supabase.co:5432/postgres`, "Direct 5432");

  // 2. Direct host with pgbouncer
  await testUrl(`postgresql://postgres.${ref}:${password}@db.${ref}.supabase.co:6543/postgres?pgbouncer=true`, "Direct 6543 pgbouncer");

  // 3. Pooler regions
  const regions = ["eu-central-1", "us-east-1", "us-west-1", "ap-southeast-1", "eu-west-1", "eu-west-3"];
  for (const r of regions) {
    const poolerUrl = `postgresql://postgres.${ref}:${password}@aws-0-${r}.pooler.supabase.com:6543/postgres?pgbouncer=true`;
    await testUrl(poolerUrl, `Pooler ${r} 6543`);
  }
}

runTests();
