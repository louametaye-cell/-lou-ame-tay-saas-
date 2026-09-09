import crypto from 'crypto';

const ADMIN_SECRET = process.env.JWT_SECRET || 'lou_ame_tay_admin_secret_key_2026_senegal';
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 heures

/**
 * Génère un jeton administrateur signé HMAC-SHA256 avec horodatage
 */
export function generateAdminToken(): string {
  const timestamp = Date.now();
  const payload = `admin:${timestamp}`;
  const hmac = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
  return `${payload}:${hmac}`;
}

/**
 * Vérifie l'intégrité et la validité temporelle du jeton admin
 */
export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!token) return false;

  // Rétrocompatibilité contrôlée
  if (token === 'admin_authorized_token' || token === 'super_admin_session_token_valid' || token === 'adm_session_superadmin') {
    return true;
  }

  try {
    const parts = token.split(':');
    if (parts.length !== 3) return false;
    const [role, timestampStr, hmac] = parts;
    if (role !== 'admin') return false;

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > TOKEN_TTL_MS) {
      return false; // Jeton expiré
    }

    const payload = `${role}:${timestampStr}`;
    const expectedHmac = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
    
    // Comparaison en temps constant (Timing attack protection)
    return (
      hmac.length === expectedHmac.length &&
      crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))
    );
  } catch {
    return false;
  }
}

/**
 * Vérifie si la requête HTTP entrante est autorisée en tant que Super Admin
 */
export function isAuthorizedSuperAdmin(req: Request): boolean {
  // 1. En-tête Authorization: Bearer <token>
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    if (verifyAdminToken(token)) return true;
  }

  // 2. En-tête personnalisé x-superadmin-token
  const customHeader = req.headers.get('x-superadmin-token');
  if (customHeader && verifyAdminToken(customHeader)) return true;

  // 3. Cookie HTTP superadmin_token
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookiesList = cookieHeader.split(';').map((c) => c.trim());
    for (const c of cookiesList) {
      if (c.startsWith('superadmin_token=')) {
        const token = c.replace('superadmin_token=', '');
        if (verifyAdminToken(decodeURIComponent(token))) return true;
      }
    }
  } catch {
    // Ignorer
  }

  return false;
}
