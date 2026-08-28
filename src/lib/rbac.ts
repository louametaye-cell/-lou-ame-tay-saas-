// ==============================================================================
// GESTION DES RÔLES & PERMISSIONS (RBAC ÉQUIPE SAAS)
// Lou Ame Tay ? - Séparation des pouvoirs (Admin, Support, Commercial, Comptable)
// ==============================================================================

export type StaffRole = 'SUPER_ADMIN' | 'SUPPORT_AGENT' | 'SALES_REP' | 'ACCOUNTANT';

export type Permission = 
  | 'manage_tenants'
  | 'view_tenants'
  | 'edit_plans'
  | 'view_revenue'
  | 'view_transactions'
  | 'generate_invoices'
  | 'manage_tickets'
  | 'manage_promos'
  | 'view_audit_logs'
  | 'trigger_crons';

export const ROLE_PERMISSIONS: Record<StaffRole, Permission[]> = {
  SUPER_ADMIN: [
    'manage_tenants',
    'view_tenants',
    'edit_plans',
    'view_revenue',
    'view_transactions',
    'generate_invoices',
    'manage_tickets',
    'manage_promos',
    'view_audit_logs',
    'trigger_crons',
  ],
  SUPPORT_AGENT: [
    'view_tenants',
    'manage_tickets',
  ],
  SALES_REP: [
    'view_tenants',
    'manage_promos',
  ],
  ACCOUNTANT: [
    'view_tenants',
    'view_revenue',
    'view_transactions',
    'generate_invoices',
    'view_audit_logs',
  ],
};

/**
 * Vérifie si un rôle possède une permission spécifique.
 */
export function hasPermission(role: StaffRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}
