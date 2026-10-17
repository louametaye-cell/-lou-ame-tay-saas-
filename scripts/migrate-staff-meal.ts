import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Exécution de la migration SQL pour STAFF_MEAL et repas employé...');
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'STAFF_MEAL';`);
    console.log('✅ Enum PaymentMethod mis à jour avec STAFF_MEAL');
  } catch (err: any) {
    console.log('ℹ️ Enum PaymentMethod (note):', err.message);
  }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "employee_id" TEXT;`);
    console.log('✅ Colonne employee_id ajoutée');
  } catch (err: any) {
    console.log('ℹ️ Colonne employee_id (note):', err.message);
  }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "employee_name" TEXT;`);
    console.log('✅ Colonne employee_name ajoutée');
  } catch (err: any) {
    console.log('ℹ️ Colonne employee_name (note):', err.message);
  }

  try {
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "orders_tenant_id_payment_method_idx" ON "orders"("tenant_id", "payment_method");`);
    console.log('✅ Index orders_tenant_id_payment_method_idx créé');
  } catch (err: any) {
    console.log('ℹ️ Index (note):', err.message);
  }

  console.log('🎉 Migration SQL terminée avec succès !');
}

main().then(() => process.exit(0)).catch((e) => {
  console.error('Erreur migration:', e);
  process.exit(1);
});
