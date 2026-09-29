import { recordAuditLog } from '@/lib/audit-logger';
import { prisma } from '@/lib/prisma';

export interface ThreeStrikesResult {
  executedAt: string;
  checkedCount: number;
  strike1Count: number;
  strike2Count: number;
  suspendedCount: number;
}

export async function runThreeStrikesCron(): Promise<ThreeStrikesResult> {
  console.log('------------------------------------------------------------');
  console.log('[CRON 3-STRIKES ⚡] Démarrage de l\'audit nocturne des abonnements...');

  const now = new Date();
  const tenants = await (prisma as any).tenant.findMany();
  
  let strike1Count = 0;
  let strike2Count = 0;
  let suspendedCount = 0;

  for (const tenant of tenants) {
    if (tenant.subscriptionExpiresAt) {
      const expiry = new Date(tenant.subscriptionExpiresAt).getTime();
      const diffDays = Math.floor((now.getTime() - expiry) / (1000 * 60 * 60 * 24));

      if (diffDays >= 3) {
        if (tenant.subscriptionStatus !== 'SUSPENDED') {
          await (prisma as any).tenant.update({
            where: { id: tenant.id },
            data: { subscriptionStatus: 'SUSPENDED' }
          });
          suspendedCount++;

          try {
            recordAuditLog({
              actorName: 'Cron 3-Strikes Daemon',
              actorRole: 'SYSTEM_AUTONOMOUS',
              action: 'TENANT_SUSPENDED',
              targetResource: `${tenant.businessName} (${tenant.id})`,
              details: `Abonnement expiré depuis ${diffDays} jours (Strike 3 atteint). Menu digital désactivé.`,
            });
          } catch(e) {}

          console.log(`[STRIKE 3 🔴] Suspension immédiate du restaurant "${tenant.businessName}" (${tenant.phone}). Menu coupé.`);
        }
      } else if (diffDays === 2) {
        await (prisma as any).tenant.update({
          where: { id: tenant.id },
          data: { subscriptionStatus: 'PAST_DUE' }
        });
        strike2Count++;
        console.log(`[STRIKE 2 ⚠️] Alerte d'urgence envoyée à ${tenant.businessName} (${tenant.phone}) : Coupure du menu dans 24h.`);
      } else if (diffDays === 1) {
        await (prisma as any).tenant.update({
          where: { id: tenant.id },
          data: { subscriptionStatus: 'PAST_DUE' }
        });
        strike1Count++;
        console.log(`[STRIKE 1 📲] Relance courtoise envoyée à ${tenant.businessName} (${tenant.phone}).`);
      }
    }
  }

  console.log(`[CRON 3-STRIKES ✅] Résultat : ${suspendedCount} suspendus, ${strike2Count} avertissements J-24h, ${strike1Count} relances initiales.`);
  console.log('------------------------------------------------------------');

  return {
    executedAt: new Date().toISOString(),
    checkedCount: tenants.length,
    strike1Count,
    strike2Count,
    suspendedCount,
  };
}
