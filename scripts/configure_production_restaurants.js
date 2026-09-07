const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function configureProduction() {
  console.log('================================================================');
  console.log('🚀 CONFIGURATION DE PRODUCTION DES 4 RESTAURANTS OFFICIELS 🇸🇳');
  console.log('================================================================\n');

  const defaultPasswordHash = await bcrypt.hash('Pass1234!', 10);
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  // 1. MG Café Resto (Madiba)
  const madiba = await prisma.tenant.update({
    where: { id: 'tenant_madiba_restau' },
    data: {
      businessName: 'MG Café Resto (Madiba)',
      subdomain: 'mg-cafe-resto',
      phone: '+221 77 458 74 74',
      ownerName: 'Moussa Guèye',
      address: 'HLM Route de Mbour, Thiès',
      city: 'Thiès',
      email: 'moussa@mg-cafe-resto.sn',
      passwordHash: defaultPasswordHash,
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiresAt: oneYearFromNow,
      monthlyFee: 15000,
      qrScansToday: 0,
      ordersToday: 0,
      branding: {
        tagline: 'Café Gourmand, Petit-Déjeuner & Spécialités à Thiès',
        primaryColor: '#FF6B00',
        secondaryColor: '#00A86B',
        phone: '+221 77 458 74 74',
        whatsapp: '+221 77 458 74 74',
        address: 'HLM Route de Mbour, Thiès',
        fontTitle: 'Poppins',
        fontBody: 'Plus Jakarta Sans',
      }
    }
  });
  console.log(`✅ [1/4] ${madiba.businessName} configuré en PRODUCTION (Subdomain: ${madiba.subdomain})`);

  // 2. Chez Collé (Sam's)
  const sams = await prisma.tenant.update({
    where: { id: 'tenant_sams_restaurant' },
    data: {
      businessName: "Chez Collé (Sam's)",
      subdomain: 'chez-colle',
      phone: '+221 77 458 74 74',
      ownerName: 'Collé Cissé',
      address: 'Avenue Lamine Guèye, Thiès',
      city: 'Thiès',
      email: 'colle@chez-colle.sn',
      passwordHash: defaultPasswordHash,
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiresAt: oneYearFromNow,
      monthlyFee: 25000,
      qrScansToday: 0,
      ordersToday: 0,
      branding: {
        tagline: 'Grillades, Burgers, Tacos & Cuisine Authentique',
        primaryColor: '#00A86B',
        secondaryColor: '#FF6B00',
        phone: '+221 77 458 74 74',
        whatsapp: '+221 77 458 74 74',
        address: 'Avenue Lamine Guèye, Thiès',
        fontTitle: 'Montserrat',
        fontBody: 'Roboto',
      }
    }
  });
  console.log(`✅ [2/4] ${sams.businessName} configuré en PRODUCTION (Subdomain: ${sams.subdomain})`);

  // 3. Anima Pizzeria
  const anima = await prisma.tenant.update({
    where: { id: 'tenant_anima_pizzeria' },
    data: {
      businessName: 'Anima Pizzeria',
      subdomain: 'anima-pizzeria',
      phone: '+221 77 458 74 74',
      ownerName: 'Direction Anima',
      address: 'Plage BCEAO, Yoff / Guédiawaye, Dakar',
      city: 'Dakar',
      email: 'contact@anima-pizzeria.sn',
      passwordHash: defaultPasswordHash,
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiresAt: oneYearFromNow,
      monthlyFee: 45000,
      qrScansToday: 0,
      ordersToday: 0,
      branding: {
        tagline: 'Pizzas Artisanales au Feu de Bois & Vue sur Mer',
        primaryColor: '#DC2626',
        secondaryColor: '#F59E0B',
        phone: '+221 77 458 74 74',
        whatsapp: '+221 77 458 74 74',
        address: 'Plage BCEAO, Yoff, Dakar',
        fontTitle: 'Playfair Display',
        fontBody: 'Lato',
      }
    }
  });
  console.log(`✅ [3/4] ${anima.businessName} configuré en PRODUCTION (Subdomain: ${anima.subdomain})`);

  // 4. Hôtel Restaurant Cayor (Lat-Dior)
  const latDior = await prisma.tenant.update({
    where: { id: 'tenant_hotel_lat_dior' },
    data: {
      businessName: 'Hôtel Restaurant Cayor (Lat-Dior)',
      subdomain: 'hotel-cayor',
      phone: '+221 77 458 74 74',
      ownerName: 'Direction Hôtel Lat-Dior',
      address: 'Quartier Résidentiel Lat-Dior, Thiès',
      city: 'Thiès',
      email: 'direction@hotel-cayor.sn',
      passwordHash: defaultPasswordHash,
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiresAt: oneYearFromNow,
      monthlyFee: 45000,
      qrScansToday: 0,
      ordersToday: 0,
      branding: {
        tagline: 'Gastronomie Raffinée & Service Hôtelier d\'Excellence',
        primaryColor: '#D97706',
        secondaryColor: '#1E293B',
        phone: '+221 77 458 74 74',
        whatsapp: '+221 77 458 74 74',
        address: 'Quartier Résidentiel Lat-Dior, Thiès',
        fontTitle: 'Cinzel',
        fontBody: 'Plus Jakarta Sans',
      }
    }
  });
  console.log(`✅ [4/4] ${latDior.businessName} configuré en PRODUCTION (Subdomain: ${latDior.subdomain})`);

  // Nettoyage des anciennes commandes de test résiduelles
  const deletedItems = await prisma.orderItem.deleteMany({});
  const deletedOrders = await prisma.order.deleteMany({});
  const deletedCalls = await prisma.waiterCall.deleteMany({});
  console.log(`\n🧹 Nettoyage des données de test : ${deletedOrders.count} commandes et ${deletedCalls.count} appels supprimés.`);

  // S'assurer que les tables sont bien créées pour chaque restaurant
  const ensureTables = async (tenantId, count) => {
    const existing = await prisma.table.count({ where: { tenantId } });
    if (existing < count) {
      const toCreate = [];
      for (let i = existing + 1; i <= count; i++) {
        toCreate.push({
          tenantId,
          tableNumber: i,
          label: `Table ${i < 10 ? '0' + i : i}`
        });
      }
      await prisma.table.createMany({ data: toCreate });
    }
  };

  await ensureTables('tenant_madiba_restau', 12);
  await ensureTables('tenant_sams_restaurant', 14);
  await ensureTables('tenant_anima_pizzeria', 20);
  await ensureTables('tenant_hotel_lat_dior', 24);

  console.log('✅ Tables vérifiées et générées pour l\'ensemble des 4 restaurants.');
  console.log('\n================================================================');
  console.log('🎉 LES 4 RESTAURANTS SONT 100% OPÉRATIONNELS EN PRODUCTION !');
  console.log('================================================================');
}

configureProduction()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
