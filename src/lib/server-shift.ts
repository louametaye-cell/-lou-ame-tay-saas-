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

export const DEFAULT_SHIFT_MEMBERS: ServerShiftMember[] = [
  {
    id: 'srv_1',
    name: 'Modou Faye',
    phone: '+221 77 450 11 22',
    shiftHours: '11h00 - 23h30 (Journée Complète)',
    periodType: 'FULL_DAY',
    status: 'ACTIVE',
    assignedTables: [1, 2, 3, 4],
  },
  {
    id: 'srv_2',
    name: 'Fatou Diop',
    phone: '+221 78 120 33 44',
    shiftHours: '11h00 - 16h30 (Service Midi)',
    periodType: 'LUNCH',
    status: 'ACTIVE',
    assignedTables: [5, 6, 7, 8],
  },
  {
    id: 'srv_3',
    name: 'Moussa Sall',
    phone: '+221 70 890 55 66',
    shiftHours: '17h00 - 00h30 (Service Soirée)',
    periodType: 'DINNER',
    status: 'ACTIVE',
    assignedTables: [9, 10, 11, 12],
  },
  {
    id: 'srv_4',
    name: 'Awa Ndiaye',
    phone: '+221 76 340 77 88',
    shiftHours: '12h00 - 20h00 (Renfort)',
    periodType: 'CUSTOM',
    status: 'BREAK',
    assignedTables: [],
  },
];

const STORAGE_KEY_MEMBERS = 'louametay_server_shift_members_v2';
const STORAGE_KEY_TABLE_MAP = 'louametay_table_server_shift';

/**
 * Récupère la liste des serveurs du shift actif
 */
export function getServerShiftMembers(): ServerShiftMember[] {
  if (typeof window === 'undefined') return DEFAULT_SHIFT_MEMBERS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_MEMBERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  return DEFAULT_SHIFT_MEMBERS;
}

/**
 * Enregistre la liste des serveurs du shift
 */
export function saveServerShiftMembers(members: ServerShiftMember[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
  } catch (e) {}
}

/**
 * Récupère la table de correspondance Table -> Nom du Serveur
 */
export function getTableServerMap(): Record<number, string> {
  if (typeof window === 'undefined') {
    return {
      1: 'Modou Faye', 2: 'Modou Faye', 3: 'Modou Faye', 4: 'Modou Faye',
      5: 'Fatou Diop', 6: 'Fatou Diop', 7: 'Fatou Diop', 8: 'Fatou Diop',
      9: 'Moussa Sall', 10: 'Moussa Sall', 11: 'Moussa Sall', 12: 'Moussa Sall',
    };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY_TABLE_MAP);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}

  // Construit depuis les membres
  const members = getServerShiftMembers();
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
export function getAssignedServerForTable(tableNumber: number): string {
  const map = getTableServerMap();
  if (map[tableNumber]) return map[tableNumber];

  // Règle par défaut si non assigné
  if (tableNumber <= 4) return 'Modou Faye';
  if (tableNumber <= 8) return 'Fatou Diop';
  return 'Moussa Sall';
}

/**
 * Assigne une table à un serveur
 */
export function assignTableToServer(tableNumber: number, serverName: string) {
  if (typeof window === 'undefined') return;
  try {
    const map = getTableServerMap();
    map[tableNumber] = serverName;
    localStorage.setItem(STORAGE_KEY_TABLE_MAP, JSON.stringify(map));
  } catch (e) {}
}