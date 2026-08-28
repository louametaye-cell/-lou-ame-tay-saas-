// ==============================================================================
// JOURNAL D'AUDIT LÉGAL & SÉCURITÉ (AUDIT LOGS)
// Lou Ame Tay ? - Traçabilité complète des actions administratives et litiges
// ==============================================================================

export interface AuditLogEntry {
  id: string;
  actorName: string;
  actorRole: string;
  action: 'PLAN_PRICE_CHANGE' | 'TENANT_SUSPENDED' | 'TENANT_UPGRADED' | 'PROMO_CREATED' | 'DATABASE_BACKUP';
  targetResource: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

declare global {
  var globalAuditLogs: AuditLogEntry[] | undefined;
}

if (!globalThis.globalAuditLogs) {
  globalThis.globalAuditLogs = [
    {
      id: 'audit_01',
      actorName: 'Super Admin Agence',
      actorRole: 'SUPER_ADMIN',
      action: 'TENANT_UPGRADED',
      targetResource: 'Chez Fatou & Frères (tenant_pro_01)',
      details: 'Passage automatique du pack Starter au pack Pro après validation Wave (25 000 FCFA).',
      ipAddress: '197.234.221.14',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'audit_02',
      actorName: 'Agent Commercial Dakar',
      actorRole: 'SALES_REP',
      action: 'PROMO_CREATED',
      targetResource: 'Code Promo TERANGA50',
      details: 'Création d\'un coupon de -50% pour la campagne de prospection Almadies.',
      ipAddress: '41.82.170.89',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
  ];
}

export function recordAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
  const newLog: AuditLogEntry = {
    ...entry,
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  if (!globalThis.globalAuditLogs) globalThis.globalAuditLogs = [];
  globalThis.globalAuditLogs.unshift(newLog);

  console.log(`[AUDIT LOG 📜] ${newLog.action} par ${newLog.actorName} (${newLog.actorRole}) : ${newLog.details}`);
  return newLog;
}

export function getAllAuditLogs(): AuditLogEntry[] {
  return globalThis.globalAuditLogs || [];
}
