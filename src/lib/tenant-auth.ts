import { isAuthorizedSuperAdmin } from './admin-auth';

/**
 * Vérifie si la requête est autorisée pour le restaurant spécifié.
 * Accepte :
 * 1. Un Super-Admin (droits transversaux complets)
 * 2. Un Gérant de restaurant possédant le cookie 'saas_token' ou l'en-tête correspondant à son tenantId.
 */
export function isAuthorizedTenant(req: Request, targetTenantId: string, targetSubdomain?: string): boolean {
  if (!targetTenantId) return false;

  // 1. Le Super-Admin MDA Arts Work est toujours autorisé
  if (isAuthorizedSuperAdmin(req)) {
    return true;
  }

  const validIdentifiers = [targetTenantId];
  if (targetSubdomain && targetSubdomain !== targetTenantId) {
    validIdentifiers.push(targetSubdomain);
  }

  const matchesAny = (val: string) => {
    return validIdentifiers.some(
      (id) =>
        val === id ||
        val === `resto_session_${id}` ||
        val === `cashier_session_${id}` ||
        val === `kds_session_${id}` ||
        val.includes(id)
    );
  };

  // 2. Cookie HTTP 'saas_token' ou 'token'
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookiesList = cookieHeader.split(';').map((c) => c.trim());
    for (const c of cookiesList) {
      if (c.startsWith('saas_token=') || c.startsWith('token=') || c.startsWith('cashier_token=') || c.startsWith('kds_token=')) {
        const val = decodeURIComponent(c.split('=')[1] || '');
        if (matchesAny(val)) {
          return true;
        }
      }
    }
  } catch {}

  // 3. En-tête Authorization: Bearer resto_session_<tenantId>
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.replace('Bearer ', '').trim();
    if (matchesAny(bearer)) {
      return true;
    }
  }

  // 4. En-tête personnalisé x-tenant-token
  const xTenantToken = req.headers.get('x-tenant-token');
  if (xTenantToken && matchesAny(xTenantToken)) {
    return true;
  }

  // 5. Jeton de session Caissier opérationnel (validé sous code PIN)
  const cashierToken = req.headers.get('x-cashier-token');
  if (cashierToken && matchesAny(cashierToken)) {
    return true;
  }

  // 6. Jeton de poste Cuisine KDS opérationnel
  const kdsToken = req.headers.get('x-kds-token');
  if (kdsToken && matchesAny(kdsToken)) {
    return true;
  }

  return false;
}
