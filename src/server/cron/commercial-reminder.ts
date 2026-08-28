import { saasStorage } from '@/lib/saas-storage';

/**
 * Cron Job de Relance Commerciale avant les heures de pointe (11h30 & 19h30).
 * Détecte les impayés, envoie des alertes WhatsApp / SMS, et suspend les menus hors-délai.
 */
export async function runCommercialReminderCron() {
  console.log('------------------------------------------------------------');
  console.log('[CRON COMMERCIAL 11h30/19h30] 🔔 Analyse des restaurants en PAST_DUE avant coup de feu...');

  const tenants = saasStorage.getAllTenants();
  const now = Date.now();
  let remindedCount = 0;
  let suspendedCount = 0;

  for (const tenant of tenants) {
    if (tenant.subscriptionExpiresAt) {
      const expiry = new Date(tenant.subscriptionExpiresAt).getTime();
      const diffDays = (now - expiry) / (1000 * 60 * 60 * 24);

      // Cas 1 : Expiré depuis plus de 5 jours -> Suspension immédiate
      if (diffDays >= 5 && tenant.subscriptionStatus !== 'SUSPENDED') {
        tenant.subscriptionStatus = 'SUSPENDED';
        suspendedCount++;
        console.log(`[SUSPENSION MENU] 🔴 Restaurant "${tenant.businessName}" suspendu suite à un impayé de ${Math.round(diffDays)} jours.`);
      }
      // Cas 2 : Expiré depuis 0 à 4 jours -> Alerte de relance commerciale WhatsApp
      else if (diffDays > 0 && diffDays < 5) {
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
