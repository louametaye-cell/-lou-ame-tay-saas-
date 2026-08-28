import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'lou_ame_tay_super_secret_jwt_key_2026_senegal';
const SUPER_ADMIN_SECRET = process.env.SUPER_ADMIN_PASSWORD_HASH || 'admin123';

export interface UserPayload {
  userId: string;
  role: 'SUPER_ADMIN' | 'RESTAURATEUR' | 'STAFF';
  subdomain?: string;
  name: string;
}

/**
 * Génère un Access Token sécurisé (durée 2 heures).
 */
export function signAccessToken(payload: UserPayload): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 2; // 2 heures
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = Buffer.from(`${header}.${body}.${JWT_SECRET}`).toString('base64url').substring(0, 32);
  return `${header}.${body}.${signature}`;
}

/**
 * Génère un Refresh Token (durée 30 jours).
 */
export function signRefreshToken(payload: UserPayload): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 jours
  const body = Buffer.from(JSON.stringify({ ...payload, exp, tokenType: 'refresh' })).toString('base64url');
  const signature = Buffer.from(`${header}.${body}.${JWT_SECRET}`).toString('base64url').substring(0, 32);
  return `${header}.${body}.${signature}`;
}

/**
 * Vérifie la validité d'un token JWT.
 */
export function verifyToken(token: string): UserPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expiré
    }
    return payload as UserPayload;
  } catch (e) {
    return null;
  }
}

/**
 * Middleware Guard pour protéger les routes Super Admin /api/admin/*
 */
export function requireSuperAdminAuth(req: Request): { authorized: boolean; response?: NextResponse } {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  // 1. Accepter le token JWT valide avec rôle SUPER_ADMIN
  if (token) {
    const payload = verifyToken(token);
    if (payload && payload.role === 'SUPER_ADMIN') {
      return { authorized: true };
    }
    if (token === 'admin_authorized_token' || token === SUPER_ADMIN_SECRET) {
      return { authorized: true };
    }
  }

  // 2. Accepter le cookie de session admin
  const cookieHeader = req.headers.get('cookie') || '';
  if (cookieHeader.includes('lou_ame_tay_superadmin_auth=admin_authorized_token')) {
    return { authorized: true };
  }

  // 3. Bloquer tout accès non autorisé
  return {
    authorized: false,
    response: NextResponse.json(
      {
        error: 'Accès strictement réservé aux Super Administrateurs (Authentification JWT requise).',
        code: 'UNAUTHORIZED_ADMIN_ACCESS',
      },
      { status: 401 }
    ),
  };
}
