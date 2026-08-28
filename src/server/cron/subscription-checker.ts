import { saasStorage } from '@/lib/saas-storage';

/**
 * Script Cron Job de nuit (03:00 AM) pour le contrôle des abonnements.
 * Détecte les expirations, passe en SUSPENDED, et déclenche les relances PAST_DUE.
 */
export async function runSubscriptionCronJob() {
  console.log('------------------------------------------------------------');
  console.log(`[CRON 03:00 AM] 🕒 Démarrage de la vérification des abonnements...`);
  
  const result = saasStorage.runNightlySubscriptionCheck();
  
  console.log(`[CRON 03:00 AM] ✅ Exécution terminée : ${result.suspendedCount} suspendus, ${result.pastDueAlertsCount} relances envoyées.`);
  console.log('------------------------------------------------------------');
  
  return result;
}
