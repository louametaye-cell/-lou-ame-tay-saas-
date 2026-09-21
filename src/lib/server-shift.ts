// ==============================================================================
// GESTION CENTRALISÉE DES SHIFTS DE SERVEURS & ATTRIBUTION DES TABLES
// Lou Ame Tay ? - Traçabilité Cloud & Synchronisation Temps Réel Multi-Écrans
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

// Cache en mémoire pour synchronisation ultra-rapide
const memoryShiftCache: Record<string, ServerShiftMember[]> = {};
const memoryTableMapCache: Record<string, Record<number, string>> = {};

function getEffectiveTenantId(tenantId?: string): string {
  return (
    tenantId ||
    (typeof window !== 'undefined' ? localStorage.getItem('current_restaurant_id') : '') ||
    'global'
  );
}

/**
 * 🌐 CLOUD SYNC : Récupère le shift actif depuis l'API Cloud PostgreSQL
 */
export async function fetchCloudServerShift(
  tenantId?: string
): Promise<{ members: ServerShiftMember[]; tableServerMap: Record<number, string> }> {
  const tid = getEffectiveTenantId(tenantId);
  if (!tid || tid === 'global') {
    return { members: memoryShiftCache[tid] || [], tableServerMap: memoryTableMapCache[tid] || {} };
  }

  try {
    const res = await fetch(`/api/tenant/shift?restaurantId=${encodeURIComponent(tid)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        const members: ServerShiftMember[] = Array.isArray(data.members) ? data.members : [];
        const tableServerMap: Record<number, string> =
          typeof data.tableServerMap === 'object' && data.tableServerMap !== null
            ? data.tableServerMap
            : {};

        memoryShiftCache[tid] = members;
        memoryTableMapCache[tid] = tableServerMap;

        // Backup local de secours en cas de perte totale de réseau
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`louametay_server_shift_members_${tid}`, JSON.stringify(members));
            localStorage.setItem(`louametay_table_server_shift_${tid}`, JSON.stringify(tableServerMap));
          } catch {}
        }

        return { members, tableServerMap };
      }
    }
  } catch (e) {
    console.error('Erreur synchronisation Cloud shift:', e);
  }

  return { members: getServerShiftMembers(tid), tableServerMap: getTableServerMap(tid) };
}

/**
 * 🌐 CLOUD SYNC : Enregistre le shift actif vers l'API Cloud PostgreSQL
 */
export async function saveCloudServerShift(
  members: ServerShiftMember[],
  tableServerMap: Record<number, string>,
  tenantId?: string
): Promise<boolean> {
  const tid = getEffectiveTenantId(tenantId);
  memoryShiftCache[tid] = members;
  memoryTableMapCache[tid] = tableServerMap;

  // Backup local immédiat
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`louametay_server_shift_members_${tid}`, JSON.stringify(members));
      localStorage.setItem(`louametay_table_server_shift_${tid}`, JSON.stringify(tableServerMap));
    } catch {}
  }

  if (!tid || tid === 'global') return true;

  try {
    const res = await fetch('/api/tenant/shift', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-token': `resto_session_${tid}`,
      },
      body: JSON.stringify({
        restaurantId: tid,
        members,
        tableServerMap,
      }),
    });
    return res.ok;
  } catch (e) {
    console.error('Erreur sauvegarde Cloud shift:', e);
    return false;
  }
}

/**
 * Récupère la liste des serveurs du shift (mémoire puis fallback)
 */
export function getServerShiftMembers(tenantId?: string): ServerShiftMember[] {
  const tid = getEffectiveTenantId(tenantId);
  if (memoryShiftCache[tid] && memoryShiftCache[tid].length > 0) {
    return memoryShiftCache[tid];
  }

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(`louametay_server_shift_members_${tid}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          memoryShiftCache[tid] = parsed;
          return parsed;
        }
      }
    } catch (e) {}
  }
  return [];
}

/**
 * Enregistre la liste des serveurs du shift
 */
export function saveServerShiftMembers(members: ServerShiftMember[], tenantId?: string) {
  const tid = getEffectiveTenantId(tenantId);
  memoryShiftCache[tid] = members;

  const currentMap = getTableServerMap(tid);
  // Persistance asynchrone dans le Cloud en arrière-plan
  saveCloudServerShift(members, currentMap, tid).catch(() => {});
}

/**
 * Récupère la table de correspondance Table -> Nom du Serveur
 */
export function getTableServerMap(tenantId?: string): Record<number, string> {
  const tid = getEffectiveTenantId(tenantId);
  if (memoryTableMapCache[tid] && Object.keys(memoryTableMapCache[tid]).length > 0) {
    return memoryTableMapCache[tid];
  }

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(`louametay_table_server_shift_${tid}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          memoryTableMapCache[tid] = parsed;
          return parsed;
        }
      }
    } catch (e) {}
  }

  const members = getServerShiftMembers(tid);
  const map: Record<number, string> = {};
  members.forEach((m) => {
    (m.assignedTables || []).forEach((tbl) => {
      map[tbl] = m.name;
    });
  });

  memoryTableMapCache[tid] = map;
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
 * Assigne une table à un serveur avec persistance Cloud
 */
export function assignTableToServer(tableNumber: number, serverName: string, tenantId?: string) {
  const tid = getEffectiveTenantId(tenantId);
  const map = { ...getTableServerMap(tid), [tableNumber]: serverName };
  memoryTableMapCache[tid] = map;

  const members = getServerShiftMembers(tid);
  saveCloudServerShift(members, map, tid).catch(() => {});
}

/**
 * Récupère l'ID du serveur attribué à une table spécifique
 */
export function getAssignedServerIdForTable(tableNumber: number, tenantId?: string): string {
  const serverName = getAssignedServerForTable(tableNumber, tenantId);
  const members = getServerShiftMembers(tenantId);
  const member = members.find((m) => m.name === serverName);
  return member ? member.id : '';
}