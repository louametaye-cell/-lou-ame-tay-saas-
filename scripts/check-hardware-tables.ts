import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing ERP hardware models in Prisma...');
  try {
    const supports = await prisma.qRSupportCatalog.findMany();
    console.log('qr_support_catalogs count:', supports.length);
    const dotations = await prisma.tenantHardwareDotation.findMany();
    console.log('tenant_hardware_dotations count:', dotations.length);
    const invoices = await prisma.hardwareInvoice.findMany();
    console.log('hardware_invoices count:', invoices.length);
    console.log('ALL TABLES EXIST AND ARE ACCESSIBLE!');
  } catch (err: any) {
    console.error('Error querying ERP hardware tables:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
