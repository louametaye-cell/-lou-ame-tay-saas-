import { isAuthorizedSuperAdmin } from './admin-auth';

/**
 * Vérifie si la requête est autorisée pour le restaurant spécifié.
 * Accepte :
 * 1. Un Super-Admin (droits transversaux complets)
 * 2. Un Gérant de restaurant possédant le cookie 'saas_token' ou l'en-tête correspondant à son tenantId.
 */
export function isAuthorizedTenant(req: Request, targetTenantId: string): boolean {
  if (!targetTenantId) return false;

  // 1. Le Super-Admin MDA Arts Work est toujours autorisé
  if (isAuthorizedSuperAdmin(req)) {
    return true;
  }

  // 2. Cookie HTTP 'saas_token' ou 'token'
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookiesList = cookieHeader.split(';').map((c) => c.trim());
    for (const c of cookiesList) {
      if (c.startsWith('saas_token=')) {
        const val = decodeURIComponent(c.replace('saas_token=', ''));
        if (
          val === `resto_session_${targetTenantId}` ||
          val === targetTenantId ||
          val.includes(targetTenantId)
        ) {
          return true;
        }
      }
      if (c.startsWith('token=')) {
        const val = decodeURIComponent(c.replace('token=', ''));
        if (
          val === `resto_session_${targetTenantId}` ||
          val === targetTenantId ||
          val.includes(targetTenantId)
        ) {
          return true;
        }
      }
    }
  } catch {}

  // 3. En-tête Authorization: Bearer resto_session_<tenantId>
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.replace('Bearer ', '').trim();
    if (
      bearer === `resto_session_${targetTenantId}` ||
      bearer === targetTenantId ||
      bearer.includes(targetTenantId)
    ) {
      return true;
    }
  }

  // 4. En-tête personnalisé x-tenant-token
  const xTenantToken = req.headers.get('x-tenant-token');
  if (
    xTenantToken === targetTenantId ||
    xTenantToken === `resto_session_${targetTenantId}` ||
    (xTenantToken && xTenantToken.includes(targetTenantId))
  ) {
    return true;
  }

  return false;
}
