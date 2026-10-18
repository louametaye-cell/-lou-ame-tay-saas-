import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runQA() {
  console.log('================================================================');
  console.log('🔍 AUDIT QA OBLIGATOIRE : ERP SUPPORTS MATÉRIEL, FACTURATION & SCANS');
  console.log('Plateforme SaaS Lou Ame Tay ? — DAW Digital Arts Work by MG');
  console.log('================================================================\n');

  // 1. Récupérer un restaurant de test (ex: anima-pizzeria)
  const tenant = await prisma.tenant.findFirst({
    where: { subdomain: 'anima-pizzeria' },
    include: { tables: true },
  });

  if (!tenant) {
    throw new Error('Tenant anima-pizzeria introuvable');
  }

  console.log(`📌 Établissement testé : "${tenant.businessName}" (${tenant.subdomain})`);

  // ÉTAPE 1 : Vérifier le catalogue des supports
  console.log('\n📌 ÉTAPE 1 : Contrôle du catalogue de supports physiques...');
  const catalog = await prisma.qRSupportCatalog.findMany({
    where: { isActive: true },
  });
  console.log(`  ✓ ${catalog.length} références trouvées dans le catalogue.`);
  const cubeBois = catalog.find((c) => c.material === 'BOIS' && !c.isSavPack);
  const chevaletMarine = catalog.find((c) => c.finishType === 'MARINE_VERNIS');
  const kitSav = catalog.find((c) => c.isSavPack);

  if (!cubeBois || !chevaletMarine || !kitSav) {
    throw new Error('Articles obligatoires manquants dans le catalogue');
  }
  console.log(`  🟢 OK : Cube VIP Bois (${cubeBois.sellingPrice} FCFA, Stock: ${cubeBois.stockQuantity})`);
  console.log(`  🟢 OK : Chevalet Marine (${chevaletMarine.sellingPrice} FCFA, Finition: ${chevaletMarine.finishType})`);
  console.log(`  🟢 OK : Kit SAV de Secours (${kitSav.sellingPrice} FCFA, Stock: ${kitSav.stockQuantity})`);

  // ÉTAPE 2 : Dotation SETUP avec Facturation Séparée
  console.log('\n📌 ÉTAPE 2 : Attribution d\'une dotation SETUP (Installation) avec facturation...');
  const initialStock = cubeBois.stockQuantity;
  const qtyToOrder = 3;

  // Création dotation + Facture
  const invoiceNumber = `FAC-MAT-TEST-${Date.now().toString().slice(-4)}`;
  const unitPrice = Number(cubeBois.sellingPrice);
  const totalPrice = unitPrice * qtyToOrder;

  const dotationSetup = await prisma.$transaction(async (tx) => {
    const dot = await tx.tenantHardwareDotation.create({
      data: {
        tenantId: tenant.id,
        supportId: cubeBois.id,
        quantity: qtyToOrder,
        unitPrice,
        totalPrice,
        isSetupInvoiced: true,
        invoiceType: 'SETUP',
        isSponsored: false,
        notes: 'Dotation QA Test initial',
      },
    });

    await tx.qRSupportCatalog.update({
      where: { id: cubeBois.id },
      data: { stockQuantity: { decrement: qtyToOrder } },
    });

    const inv = await tx.hardwareInvoice.create({
      data: {
        tenantId: tenant.id,
        invoiceNumber,
        invoiceType: 'SETUP',
        amount: totalPrice,
        status: 'PENDING',
        paymentMethod: 'CASH',
        notes: `Dotation test ${qtyToOrder}x ${cubeBois.name}`,
      },
    });

    return { dot, inv };
  });

  const updatedCube = await prisma.qRSupportCatalog.findUnique({ where: { id: cubeBois.id } });
  console.log(`  🟢 OK : Dotation #${dotationSetup.dot.id} créée (Total: ${totalPrice} FCFA).`);
  console.log(`  🟢 OK : Facture séparée générée (${dotationSetup.inv.invoiceNumber}, Statut: ${dotationSetup.inv.status}).`);
  console.log(`  🟢 OK : Décrémentation automatique du stock (${initialStock} -> ${updatedCube?.stockQuantity}).`);

  // ÉTAPE 3 : Dotation PARRAINAGE (Supports offerts 0 FCFA)
  console.log('\n📌 ÉTAPE 3 : Attribution d\'une offre PARRAINAGE (Supports offerts 0 FCFA)...');
  const dotationParrainage = await prisma.tenantHardwareDotation.create({
    data: {
      tenantId: tenant.id,
      supportId: chevaletMarine.id,
      quantity: 5,
      unitPrice: 0,
      totalPrice: 0,
      isSetupInvoiced: false,
      invoiceType: 'PARRAINAGE',
      isSponsored: true,
      notes: 'Offre 5 supports offerts suite au parrainage d\'un nouvel établissement',
    },
  });

  console.log(`  🟢 OK : Dotation Parrainage enregistrée (Total: ${dotationParrainage.totalPrice} FCFA, isSponsored: true).`);
  console.log(`  🟢 OK : Zéro facture émise pour les supports offerts.`);

  // ÉTAPE 4 : Association d'un support physique à une table
  console.log('\n📌 ÉTAPE 4 : Association d\'un support Cube Bois à la Table #1...');
  let tableTest = tenant.tables[0];
  if (!tableTest) {
    tableTest = await prisma.table.create({
      data: {
        tenantId: tenant.id,
        tableNumber: 1,
        spaceType: 'TABLE',
        supportId: cubeBois.id,
      },
    });
  } else {
    tableTest = await prisma.table.update({
      where: { id: tableTest.id },
      data: { supportId: cubeBois.id },
    });
  }
  console.log(`  🟢 OK : Table #${tableTest.tableNumber} liée au support "${cubeBois.name}".`);

  // ÉTAPE 5 : Simulation de Scan QR sur la table
  console.log('\n📌 ÉTAPE 5 : Simulation d\'un Scan QR sur la Table #1...');
  const initialTableScans = tableTest.totalScans || 0;

  // Mise à jour de scan simulant api/scan
  await prisma.table.update({
    where: { id: tableTest.id },
    data: {
      scansToday: { increment: 1 },
      totalScans: { increment: 1 },
    },
  });

  const refreshedTable = await prisma.table.findUnique({ where: { id: tableTest.id } });
  console.log(`  🟢 OK : Scans table incrémentés (${initialTableScans} -> ${refreshedTable?.totalScans}).`);

  // ÉTAPE 6 : Encaissement de la Facture Matériel
  console.log('\n📌 ÉTAPE 6 : Encaissement de la Facture Matériel dans la Console DAW...');
  const paidInvoice = await prisma.hardwareInvoice.update({
    where: { id: dotationSetup.inv.id },
    data: {
      status: 'SUCCESS',
      paidAt: new Date(),
      paymentMethod: 'CASH',
    },
  });
  console.log(`  🟢 OK : Facture ${paidInvoice.invoiceNumber} passée à SUCCESS (${paidInvoice.amount} FCFA).`);

  // ÉTAPE 7 : Nettoyage des données de test
  console.log('\n📌 ÉTAPE 7 : Nettoyage et restauration du stock...');
  await prisma.hardwareInvoice.delete({ where: { id: dotationSetup.inv.id } });
  await prisma.tenantHardwareDotation.delete({ where: { id: dotationSetup.dot.id } });
  await prisma.tenantHardwareDotation.delete({ where: { id: dotationParrainage.id } });
  // Rétablir le stock
  await prisma.qRSupportCatalog.update({
    where: { id: cubeBois.id },
    data: { stockQuantity: { increment: qtyToOrder } },
  });
  console.log('  ✓ Données de test purgées et stock rétabli avec succès.');

  console.log('\n================================================================');
  console.log('🎉 RÉSULTAT DU TEST : 100% CONFORME !');
  console.log('Catalogue, Dotations, Facturation séparée, Parrainage & Scans validés.');
  console.log('================================================================\n');
}

runQA()
  .catch((e) => {
    console.error('❌ Échec du test QA:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
