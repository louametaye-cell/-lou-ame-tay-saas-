const { PrismaClient } = require('@prisma/client');

async function testPort(url, desc) {
  const p = new PrismaClient({ datasources: { db: { url } } });
  try {
    const c = await p.tenant.count();
    console.log(`[OK] ${desc} -> count: ${c}`);
    await p.$disconnect();
    return true;
  } catch (err) {
    console.log(`[ERR] ${desc} -> ${err.message}`);
    await p.$disconnect();
    return false;
  }
}

async function main() {
  const pass = "Digitalartswork%40mg2023";
  const ref = "ghkxrrmxvhwoyodygohc";
  const poolerHost = "aws-0-eu-central-1.pooler.supabase.com";

  await testPort(`postgresql://postgres.${ref}:${pass}@${poolerHost}:6543/postgres?pgbouncer=true`, "Pooler 6543 pgbouncer");
  await testPort(`postgresql://postgres.${ref}:${pass}@${poolerHost}:5432/postgres`, "Pooler 5432 session");
}

main();
