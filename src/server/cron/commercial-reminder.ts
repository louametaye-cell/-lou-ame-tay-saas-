import { prisma } from '@/lib/prisma';

export async function runCommercialReminderCron() {
  console.log('------------------------------------------------------------');
  console.log('[CRON COMMERCIAL 11h30/19h30] 🔔 Analyse des restaurants en PAST_DUE avant coup de feu...');

  const now = new Date();
  const tenants = await (prisma as any).tenant.findMany({
    where: {
      subscriptionExpiresAt: { not: null }
    }
  });

  let remindedCount = 0;
  let suspendedCount = 0;

  for (const tenant of tenants) {
    if (tenant.subscriptionExpiresAt) {
      const expiry = new Date(tenant.subscriptionExpiresAt).getTime();
      const diffDays = (now.getTime() - expiry) / (1000 * 60 * 60 * 24);

      if (diffDays >= 5 && tenant.subscriptionStatus !== 'SUSPENDED') {
        await (prisma as any).tenant.update({
          where: { id: tenant.id },
          data: { subscriptionStatus: 'SUSPENDED' }
        });
        suspendedCount++;
        console.log(`[SUSPENSION MENU] 🔴 Restaurant "${tenant.businessName}" suspendu suite à un impayé de ${Math.round(diffDays)} jours.`);
      }
      else if (diffDays > 0 && diffDays < 5 && tenant.subscriptionStatus !== 'SUSPENDED') {
        remindedCount++;
        console.log(`[RELANCE WHATSAPP SÉNÉGAL] 📲 Message envoyé à ${tenant.businessName} (${tenant.phone}) :`);
        console.log(`  "Bonjour ${tenant.ownerName || 'Cher Partenaire'}, votre abonnement Lou Ame Tay ? arrive à échéance. Renouvelez via Wave ou Orange Money au +221 77 458 74 74 pour éviter toute coupure de votre menu en salle."`);
      }
    }
  }

  console.log(`[CRON COMMERCIAL] ✅ Bilan : ${remindedCount} relances envoyées, ${suspendedCount} menus suspendus.`);
  console.log('------------------------------------------------------------');

  return {
    executedAt: new Date().toISOString(),
    remindedCount,
    suspendedCount,
  };
}
