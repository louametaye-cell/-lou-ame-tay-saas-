const { PrismaClient, CashierShift } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding initial cashiers for active restaurants...');

  const tenants = await prisma.tenant.findMany();

  for (const tenant of tenants) {
    console.log(`Checking cashiers for: ${tenant.businessName} (${tenant.id})`);

    const existing = await prisma.cashier.findMany({
      where: { tenantId: tenant.id }
    });

    if (existing.length === 0) {
      // Create Morning Cashier
      await prisma.cashier.create({
        data: {
          tenantId: tenant.id,
          name: 'Fatou Sow',
          phone: '+221 77 123 45 67',
          pinCode: '1111',
          shift: CashierShift.MORNING,
          schedule: '08h00 - 16h00 (Lundi au Samedi)',
          isActive: true
        }
      });

      // Create Evening Cashier
      await prisma.cashier.create({
        data: {
          tenantId: tenant.id,
          name: 'Moussa Diop',
          phone: '+221 78 987 65 43',
          pinCode: '2222',
          shift: CashierShift.EVENING,
          schedule: '16h00 - 00h00 (Lundi au Samedi)',
          isActive: true
        }
      });

      // Extra default cashier with PIN 1234
      await prisma.cashier.create({
        data: {
          tenantId: tenant.id,
          name: 'Aminata Ndiaye',
          phone: '+221 76 555 44 33',
          pinCode: '1234',
          shift: CashierShift.FULL_DAY,
          schedule: 'Shift Polyvalent (10h00 - 22h00)',
          isActive: true
        }
      });

      console.log(`✅ 3 caissiers créés pour ${tenant.businessName} (PINs: 1111, 2222, 1234)`);
    } else {
      console.log(`ℹ️ ${existing.length} caissiers existent déjà pour ${tenant.businessName}`);
    }
  }

  console.log('🎉 Seeding des caissiers terminé avec succès.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
