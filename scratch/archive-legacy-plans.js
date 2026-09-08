const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement manuellement depuis .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  });
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const legacyIds = ['plan_institution', 'plan_starter', 'plan_pro', 'plan_premium'];
  console.log('--- Archivage des 4 anciens plans :', legacyIds);

  const updateRes = await prisma.plan.updateMany({
    where: { id: { in: legacyIds } },
    data: { isActive: false }
  });
  console.log('Packs archivés mis à jour (isActive: false) :', updateRes.count);

  // S'assurer que les 7 formules Wolof restent actives
  const wolofSlugs = ['tambali', 'nio-far', 'xeweul', 'baobab', 'teranga', 'buur', 'ndaje'];
  await prisma.plan.updateMany({
    where: { slug: { in: wolofSlugs } },
    data: { isActive: true }
  });

  const activePlans = await prisma.plan.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, price: true, isActive: true },
    orderBy: { price: 'asc' }
  });
  console.log('\n--- PACKS ACTIFS DÉSORMAIS (' + activePlans.length + ') ---');
  console.table(activePlans.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    isActive: p.isActive
  })));

  const archivedPlans = await prisma.plan.findMany({
    where: { isActive: false },
    select: { id: true, name: true, slug: true, price: true, isActive: true }
  });
  console.log('\n--- PACKS ARCHIVÉS (' + archivedPlans.length + ') ---');
  console.table(archivedPlans.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    isActive: p.isActive
  })));

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Erreur archivage :', err);
  process.exit(1);
});
