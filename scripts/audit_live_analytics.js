const fs = require('fs');

if (fs.existsSync('.env')) {
  const content = fs.readFileSync('.env', 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = match[2] || '';
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      process.env[match[1]] = val;
    }
  });
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        businessName: true,
        subdomain: true,
        qrScansToday: true,
        ordersToday: true,
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
            items: {
              select: { name: true, quantity: true, price: true }
            }
          }
        },
        menuItems: {
          select: { id: true, name: true, salesCount: true, viewsCount: true, price: true },
          orderBy: { salesCount: 'desc' },
          take: 3
        }
      }
    });

    console.log('=== AUDIT DES DONNÉES TEMPS RÉEL PAR RESTAURANT ===');
    let totalPlatformRevenue = 0;
    let totalPlatformOrders = 0;
    let totalPlatformScans = 0;

    for (const t of tenants) {
      const totalOrders = t.orders.length;
      const paidOrders = t.orders.filter(o => o.paymentStatus === 'PAID' || o.paymentStatus === 'SUCCESS');
      const revenue = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
      totalPlatformRevenue += revenue;
      totalPlatformOrders += totalOrders;
      totalPlatformScans += (t.qrScansToday || 0);

      // Calcul heure de pointe (distribution par tranche de 2h)
      const hoursMap = {};
      t.orders.forEach(o => {
        const h = new Date(o.createdAt).getHours();
        hoursMap[h] = (hoursMap[h] || 0) + 1;
      });

      const viewsAgg = await prisma.menuItem.aggregate({
        where: { tenantId: t.id },
        _sum: { viewsCount: true }
      });
      const totalViews = viewsAgg._sum.viewsCount || 0;

      console.log('\n📍', t.businessName, '(' + t.subdomain + ') :');
      console.log('  - Commandes totales :', totalOrders, '| Payées :', paidOrders.length);
      console.log('  - Chiffre d\'Affaires Réel :', revenue.toLocaleString('fr-FR'), 'FCFA');
      console.log('  - Scans enregistrés :', t.qrScansToday);
      console.log('  - Clics / Consultations Plats :', totalViews);
      console.log('  - Top Plats Stars :', t.menuItems.map(m => `${m.name} (${m.salesCount} ventes, ${Number(m.price).toLocaleString('fr-FR')} FCFA)`).join(' | '));
      console.log('  - Distribution horaire commandes :', JSON.stringify(hoursMap));
    }

    console.log('\n📊 TOTAUX CONSOLIDÉS PLATEFORME :');
    console.log('  - Chiffre d\'Affaires Global :', totalPlatformRevenue.toLocaleString('fr-FR'), 'FCFA');
    console.log('  - Commandes Globales :', totalPlatformOrders);
    console.log('  - Scans Globaux :', totalPlatformScans);

  } catch (err) {
    console.error('Erreur audit analytique :', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
