// ==============================================================================
// GESTION CENTRALISÉE DES SHIFTS DE SERVEURS & ATTRIBUTION DES TABLES
// Lou Ame Tay ? - Traçabilité & Organisation Opérationnelle
// ==============================================================================

export type ServerShiftStatus = 'ACTIVE' | 'BREAK' | 'OFF';

export interface ServerShiftMember {
  id: string;
  name: string;
  phone?: string;
  shiftHours: string;
  periodType: 'LUNCH' | 'DINNER' | 'FULL_DAY' | 'CUSTOM';
  status: ServerShiftStatus;
  assignedTables: number[];
}

export const DEFAULT_SHIFT_MEMBERS: ServerShiftMember[] = [];

function getStorageKeyMembers(tenantId?: string): string {
  const tid = tenantId || (typeof window !== 'undefined' ? localStorage.getItem('current_restaurant_id') : '') || 'global';
  return `louametay_server_shift_members_${tid}`;
}

function getStorageKeyTableMap(tenantId?: string): string {
  const tid = tenantId || (typeof window !== 'undefined' ? localStorage.getItem('current_restaurant_id') : '') || 'global';
  return `louametay_table_server_shift_${tid}`;
}

/**
 * Récupère la liste des serveurs du shift actif pour un restaurant donné
 */
export function getServerShiftMembers(tenantId?: string): ServerShiftMember[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = getStorageKeyMembers(tenantId);
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {}
  return [];
}

/**
 * Enregistre la liste des serveurs du shift
 */
export function saveServerShiftMembers(members: ServerShiftMember[], tenantId?: string) {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKeyMembers(tenantId);
    localStorage.setItem(key, JSON.stringify(members));
  } catch (e) {}
}

/**
 * Récupère la table de correspondance Table -> Nom du Serveur
 */
export function getTableServerMap(tenantId?: string): Record<number, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const key = getStorageKeyTableMap(tenantId);
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}

  // Construit depuis les membres du shift du restaurant
  const members = getServerShiftMembers(tenantId);
  const map: Record<number, string> = {};
  members.forEach((m) => {
    (m.assignedTables || []).forEach((tbl) => {
      map[tbl] = m.name;
    });
  });

  return map;
}

/**
 * Récupère le nom du serveur attribué à une table spécifique
 */
export function getAssignedServerForTable(tableNumber: number, tenantId?: string): string {
  const map = getTableServerMap(tenantId);
  return map[tableNumber] || 'Non assigné';
}

/**
 * Assigne une table à un serveur
 */
export function assignTableToServer(tableNumber: number, serverName: string, tenantId?: string) {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKeyTableMap(tenantId);
    const map = getTableServerMap(tenantId);
    map[tableNumber] = serverName;
    localStorage.setItem(key, JSON.stringify(map));
  } catch (e) {}
}

/**
 * Récupère l'ID du serveur attribué à une table spécifique
 */
export function getAssignedServerIdForTable(tableNumber: number, tenantId?: string): string {
  const serverName = getAssignedServerForTable(tableNumber, tenantId);
  const members = getServerShiftMembers(tenantId);
  const member = members.find(m => m.name === serverName);
  return member ? member.id : '';
}