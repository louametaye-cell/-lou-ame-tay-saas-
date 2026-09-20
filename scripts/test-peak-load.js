const { PrismaClient } = require('@prisma/client');

const TENANTS = ['anima-pizzeria', 'madiba-restaurant', 'sams-prestige', 'hotel-lat-dior'];

async function simulatePeakHour(prisma, label) {
  console.log(`\n===============================================================`);
  console.log(`🚀 [${label}] SIMULATION HEURE DE POINTE SUR LES 4 ÉTABLISSEMENTS`);
  console.log(`===============================================================`);
  const tStart = Date.now();

  const operations = [];

  for (const sub of TENANTS) {
    // 1. Simulation Écran Caisse : lecture session caisse + 10 dernières commandes avec items
    operations.push((async () => {
      const t0 = Date.now();
      const tenant = await prisma.tenant.findUnique({ where: { subdomain: sub }, select: { id: true, businessName: true } });
      if (!tenant) throw new Error(`Tenant ${sub} introuvable`);
      
      const orders = await prisma.order.findMany({
        where: { tenantId: tenant.id },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { items: true }
      });
      return { type: 'CAISSE_POS', tenant: sub, duration: Date.now() - t0, count: orders.length };
    })());

    // 2. Simulation Écran Cuisine KDS : polling commandes PENDING / PREPARING / READY avec items
    operations.push((async () => {
      const t0 = Date.now();
      const tenant = await prisma.tenant.findUnique({ where: { subdomain: sub }, select: { id: true, businessName: true } });
      if (!tenant) throw new Error(`Tenant ${sub} introuvable`);
      
      const kdsOrders = await prisma.order.findMany({
        where: {
          tenantId: tenant.id,
          status: { in: ['PENDING', 'PREPARING', 'READY'] }
        },
        take: 20,
        include: { items: true }
      });
      return { type: 'CUISINE_KDS', tenant: sub, duration: Date.now() - t0, count: kdsOrders.length };
    })());

    // 3. Simulation Menu Client Mobile : chargement catalogue (Catégories + Plats disponibles)
    operations.push((async () => {
      const t0 = Date.now();
      const tenant = await prisma.tenant.findUnique({
        where: { subdomain: sub },
        include: {
          categories: {
            include: {
              items: {
                where: { isAvailable: true }
              }
            }
          }
        }
      });
      const totalItems = tenant?.categories?.reduce((acc, c) => acc + (c.items?.length || 0), 0) || 0;
      return { type: 'MENU_CLIENT', tenant: sub, duration: Date.now() - t0, count: totalItems };
    })());

    // 4. Simulation Écran TV Retrait : polling commandes prêtes au guichet
    operations.push((async () => {
      const t0 = Date.now();
      const tenant = await prisma.tenant.findUnique({ where: { subdomain: sub }, select: { id: true, businessName: true } });
      if (!tenant) throw new Error(`Tenant ${sub} introuvable`);
      
      const readyOrders = await prisma.order.findMany({
        where: { tenantId: tenant.id, status: 'READY' },
        select: { id: true, tableNumber: true, customerName: true, totalAmount: true }
      });
      return { type: 'ECRAN_TV_RETRAIT', tenant: sub, duration: Date.now() - t0, count: readyOrders.length };
    })());
  }

  // 16 opérations ultra-lourdes lancées exactement en même temps
  const results = await Promise.allSettled(operations);
  const totalTime = Date.now() - tStart;

  const fulfilled = results.filter(r => r.status === 'fulfilled').map(r => r.value);
  const rejected = results.filter(r => r.status === 'rejected').map(r => r.reason);

  console.log(`\n📊 RÉSULTATS POUR [${label}] :`);
  console.log(`- Durée totale : ${totalTime}ms`);
  console.log(`- Requêtes réussies : ${fulfilled.length}/${operations.length}`);
  console.log(`- Requêtes échouées : ${rejected.length}/${operations.length}`);

  if (rejected.length > 0) {
    console.error(`❌ ÉCHECS RENCONTRÉS :`);
    rejected.forEach((err, idx) => console.error(`  [${idx + 1}] ${err.message || err}`));
  } else {
    console.log(`✅ TOUS LES FLUX DES 4 COMPTES ONT RÉPONDU SANS AUCUNE ERREUR :`);
    fulfilled.forEach(f => {
      console.log(`  • [${f.tenant.padEnd(17)}] ${f.type.padEnd(16)} -> ${f.count} enregistrements en ${f.duration}ms`);
    });
  }

  return { fulfilled: fulfilled.length, rejected: rejected.length, totalTime };
}

async function run() {
  console.log('⚡ DÉBUT DU TEST COMPARATIF DE SURCHARGE ⚡\n');

  // TEST 1 : Port 5432 avec connection_limit=3
  const prismaLimit3 = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://postgres.ghkxrrmxvhwoyodygohc:Digitalartswork%40mg2023@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?connection_limit=3&pool_timeout=20'
      }
    }
  });

  try {
    await simulatePeakHour(prismaLimit3, 'PORT 5432 | LIMIT=3');
  } catch (e) {
    console.error('Crash Limit 3:', e.message);
  } finally {
    await prismaLimit3.$disconnect();
  }

  // Pause de 3 secondes pour laisser les connexions se fermer
  await new Promise(r => setTimeout(r, 3000));

  // TEST 2 : Port 5432 avec connection_limit=6
  const prismaLimit6 = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://postgres.ghkxrrmxvhwoyodygohc:Digitalartswork%40mg2023@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?connection_limit=6&pool_timeout=20'
      }
    }
  });

  try {
    await simulatePeakHour(prismaLimit6, 'PORT 5432 | LIMIT=6');
  } catch (e) {
    console.error('Crash Limit 6:', e.message);
  } finally {
    await prismaLimit6.$disconnect();
  }

  // Pause de 3 secondes
  await new Promise(r => setTimeout(r, 3000));

  // TEST 3 : Port 6543 Transaction Mode avec connection_limit=10, pgbouncer=true
  const prismaPort6543 = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://postgres.ghkxrrmxvhwoyodygohc:Digitalartswork%40mg2023@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=20'
      }
    }
  });

  try {
    await simulatePeakHour(prismaPort6543, 'PORT 6543 TRANSACTION MODE | LIMIT=10 | PGBOUNCER=TRUE');
  } catch (e) {
    console.error('Crash Port 6543:', e.message);
  } finally {
    await prismaPort6543.$disconnect();
  }
}

run();
