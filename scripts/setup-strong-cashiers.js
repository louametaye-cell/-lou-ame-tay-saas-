const { PrismaClient, CashierShift } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupStrongCashiers() {
  console.log('=== CONFIGURATION DES CAISSIERS RÉELS AVEC PINS FORTS ET UNIQUES ===\n');

  // 1. ANIMA PIZZERIA : Remplacement du PIN 0000 d'Aissatou par un code fort
  const anima = await prisma.tenant.findUnique({ where: { subdomain: 'anima-pizzeria' } });
  const aissatou = await prisma.cashier.findFirst({ where: { tenantId: anima.id, name: 'AISSATOU' } });
  if (aissatou) {
    const updatedAissatou = await prisma.cashier.update({
      where: { id: aissatou.id },
      data: {
        pinCode: '8392',
        isActive: true,
        phone: '+221 77 458 74 74'
      }
    });
    console.log(`✅ [Anima Pizzeria] Aissatou mise à jour avec PIN fort : ${updatedAissatou.pinCode} (Ancien : 0000 désactivé)`);
  }

  // 2. MADIBA RESTAURANT (MG Café Resto) : Création caissier
  const madiba = await prisma.tenant.findUnique({ where: { subdomain: 'madiba-restaurant' } });
  let cashierMadiba = await prisma.cashier.findFirst({ where: { tenantId: madiba.id, name: 'Abdoulaye Diallo' } });
  if (!cashierMadiba) {
    cashierMadiba = await prisma.cashier.create({
      data: {
        tenantId: madiba.id,
        name: 'Abdoulaye Diallo',
        phone: '+221 77 812 34 56',
        pinCode: '6419',
        shift: CashierShift.MORNING,
        schedule: '08h00 - 16h00 (Service Continu)',
        isActive: true
      }
    });
  } else {
    cashierMadiba = await prisma.cashier.update({
      where: { id: cashierMadiba.id },
      data: { pinCode: '6419', isActive: true }
    });
  }
  console.log(`✅ [MADIBA RESTAURANT] Caissier : ${cashierMadiba.name} (PIN fort : ${cashierMadiba.pinCode})`);

  // 3. SAM'S PRESTIGE (Chez Collé) : Création caissier
  const sams = await prisma.tenant.findUnique({ where: { subdomain: 'sams-prestige' } });
  let cashierSams = await prisma.cashier.findFirst({ where: { tenantId: sams.id, name: 'Khady Sy' } });
  if (!cashierSams) {
    cashierSams = await prisma.cashier.create({
      data: {
        tenantId: sams.id,
        name: 'Khady Sy',
        phone: '+221 78 541 23 89',
        pinCode: '7253',
        shift: CashierShift.FULL_DAY,
        schedule: '11h00 - 23h00 (Prestige Service)',
        isActive: true
      }
    });
  } else {
    cashierSams = await prisma.cashier.update({
      where: { id: cashierSams.id },
      data: { pinCode: '7253', isActive: true }
    });
  }
  console.log(`✅ [Sam's Prestige] Caissière : ${cashierSams.name} (PIN fort : ${cashierSams.pinCode})`);

  // 4. HÔTEL LAT-DIOR (Hôtel Restaurant Cayor) : Création caissier
  const latDior = await prisma.tenant.findUnique({ where: { subdomain: 'hotel-lat-dior' } });
  let cashierLatDior = await prisma.cashier.findFirst({ where: { tenantId: latDior.id, name: 'Cheikh Ndiaye' } });
  if (!cashierLatDior) {
    cashierLatDior = await prisma.cashier.create({
      data: {
        tenantId: latDior.id,
        name: 'Cheikh Ndiaye',
        phone: '+221 76 987 12 34',
        pinCode: '3841',
        shift: CashierShift.FULL_DAY,
        schedule: '07h00 - 22h00 (Hôtellerie / Restaurant)',
        isActive: true
      }
    });
  } else {
    cashierLatDior = await prisma.cashier.update({
      where: { id: cashierLatDior.id },
      data: { pinCode: '3841', isActive: true }
    });
  }
  console.log(`✅ [Hôtel Résidence Lat-Dior] Caissier : ${cashierLatDior.name} (PIN fort : ${cashierLatDior.pinCode})`);

  console.log('\n🎉 Tous les 4 restaurants ont désormais un caissier actif avec un PIN robuste et unique !');
}

setupStrongCashiers().finally(() => prisma.$disconnect());
