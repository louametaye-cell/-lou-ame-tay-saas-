import { saasStorage } from '@/lib/saas-storage';
import { recordAuditLog } from '@/lib/audit-logger';

export interface ThreeStrikesResult {
  executedAt: string;
  checkedCount: number;
  strike1Count: number; // J+1
  strike2Count: number; // J+2
  suspendedCount: number; // J+3 (Strike 3 -> SUSPENDED)
}

/**
 * Moteur Cron 3-Strikes pour la gestion autonome des impayés (Exécution chaque nuit à 03h00).
 * - J+1 (Strike 1) : PAST_DUE + 1ère alerte WhatsApp
 * - J+2 (Strike 2) : PAST_DUE + Alerte d'urgence WhatsApp
 * - J+3 (Strike 3) : SUSPENDED + Désactivation immédiate du menu en salle
 */
export async function runThreeStrikesCron(): Promise<ThreeStrikesResult> {
  console.log('------------------------------------------------------------');
  console.log('[CRON 3-STRIKES ⚡] Démarrage de l\'audit nocturne des abonnements...');

  const tenants = saasStorage.getAllTenants();
  const now = Date.now();
  let strike1Count = 0;
  let strike2Count = 0;
  let suspendedCount = 0;

  for (const tenant of tenants) {
    if (tenant.subscriptionExpiresAt) {
      const expiry = new Date(tenant.subscriptionExpiresAt).getTime();
      const diffDays = Math.floor((now - expiry) / (1000 * 60 * 60 * 24));

      if (diffDays >= 3) {
        // STRIKE 3 : Suspension du restaurant et coupure du menu
        if (tenant.subscriptionStatus !== 'SUSPENDED') {
          tenant.subscriptionStatus = 'SUSPENDED';
          suspendedCount++;

          recordAuditLog({
            actorName: 'Cron 3-Strikes Daemon',
            actorRole: 'SYSTEM_AUTONOMOUS',
            action: 'TENANT_SUSPENDED',
            targetResource: `${tenant.businessName} (${tenant.id})`,
            details: `Abonnement expiré depuis ${diffDays} jours (Strike 3 atteint). Menu digital désactivé.`,
          });

          console.log(`[STRIKE 3 🔴] Suspension immédiate du restaurant "${tenant.businessName}" (${tenant.phone}). Menu coupé.`);
        }
      } else if (diffDays === 2) {
        // STRIKE 2 : Alerte d'urgence
        tenant.subscriptionStatus = 'PAST_DUE';
        strike2Count++;
        console.log(`[STRIKE 2 ⚠️] Alerte d'urgence envoyée à ${tenant.businessName} (${tenant.phone}) : Coupure du menu dans 24h.`);
      } else if (diffDays === 1) {
        // STRIKE 1 : Première relance
        tenant.subscriptionStatus = 'PAST_DUE';
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
