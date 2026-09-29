import { prisma } from '@/lib/prisma';

export async function runSubscriptionCronJob() {
  console.log('------------------------------------------------------------');
  console.log(`[CRON 03:00 AM] 🕒 Démarrage de la vérification des abonnements...`);
  
  const now = new Date();
  
  // Find tenants that are ACTIVE but their subscriptionExpiresAt is in the past
  const expiredTenants = await (prisma as any).tenant.findMany({
    where: {
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiresAt: { lt: now }
    }
  });

  let suspendedCount = 0;

  for (const tenant of expiredTenants) {
    // In a real system, maybe PAST_DUE first, but here we simplify
    await (prisma as any).tenant.update({
      where: { id: tenant.id },
      data: { subscriptionStatus: 'SUSPENDED' }
    });
    suspendedCount++;
  }
  
  console.log(`[CRON 03:00 AM] ✅ Exécution terminée : ${suspendedCount} suspendus.`);
  console.log('------------------------------------------------------------');
  
  return { suspendedCount, pastDueAlertsCount: 0 };
}
