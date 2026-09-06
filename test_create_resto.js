const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function run() {
  try {
    let dbPlan = await prisma.plan.findFirst();
    if (!dbPlan) {
      dbPlan = await prisma.plan.create({
        data: {
          name: 'Pro',
          slug: 'pro',
          price: 25000,
        }
      });
    }

    const newTenant = await prisma.tenant.create({
      data: {
        businessName: 'Test Name',
        subdomain: 'testsub',
        email: 'test@testsub.sn',
        passwordHash: await bcrypt.hash('Pass1234!', 10),
        ownerName: '',
        phone: '',
        address: '',
        currentPlanId: dbPlan.id,
        subscriptionStatus: 'ACTIVE',
      }
    });

    console.log('Created tenant:', newTenant.id);

    const tablesToCreate = [];
    for (let i = 1; i <= 2; i++) {
      tablesToCreate.push({
        tenantId: newTenant.id,
        tableNumber: i,
        label: `Table ${i}`
      });
    }
    
    await prisma.table.createMany({
      data: tablesToCreate
    });
    
    console.log('Created tables');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
