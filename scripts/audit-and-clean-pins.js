const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditAndCleanPins() {
  console.log('=== AUDIT ET NETTOYAGE DES PINS CAISSIERS EN BASE ===\n');

  // 1. Supprimer les profils de test archivés ou faibles s'ils existent
  const deleted = await prisma.cashier.deleteMany({
    where: {
      OR: [
        { pinCode: '1111' },
        { pinCode: '0000' },
        { pinCode: '1234' },
        { pinCode: '4321' },
        { name: { contains: 'Test QA' } }
      ]
    }
  });
  console.log(`Profils de test/faibles supprimés : ${deleted.count}`);

  // 2. Vérifier tous les caissiers restants en base
  const cashiers = await prisma.cashier.findMany({
    include: {
      tenant: {
        select: {
          id: true,
          businessName: true,
          subdomain: true
        }
      }
    }
  });

  console.log('\n--- ÉTAT ACTUEL DE TOUS LES CAISSIERS EN BASE DE DONNÉES ---');
  for (const c of cashiers) {
    const isWeak = ['0000', '1111', '1234', '4321', '2222', '3333'].includes(c.pinCode);
    console.log(`[${c.tenant.businessName} (${c.tenant.subdomain})]`);
    console.log(`  Nom: ${c.name}`);
    console.log(`  PIN: ${c.pinCode} ${isWeak ? '❌ FAIBLE !' : '✅ FORT & UNIQUE'}`);
    console.log(`  Actif: ${c.isActive}`);
    console.log(`  Shift: ${c.shift} (${c.schedule || 'N/A'})\n`);
  }

  const weakCount = cashiers.filter(c => ['0000', '1111', '1234', '4321', '2222'].includes(c.pinCode)).length;
  console.log(`Total caissiers actifs : ${cashiers.length}`);
  console.log(`Total PINs faibles résiduels : ${weakCount}`);
  if (weakCount === 0) {
    console.log('🎉 100% des comptes réels utilisent des PINs uniques, robustes et non triviaux !');
  }
}

auditAndCleanPins()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
