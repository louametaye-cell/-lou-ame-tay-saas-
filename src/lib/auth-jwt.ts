import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { isAuthorizedSuperAdmin } from './admin-auth';

const isProd = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || (isProd ? '' : 'lou_ame_tay_super_secret_jwt_key_2026_senegal');
const SUPER_ADMIN_SECRET = process.env.SUPER_ADMIN_PASSWORD_HASH || (isProd ? '' : 'admin123');

export interface UserPayload {
  userId: string;
  role: 'SUPER_ADMIN' | 'RESTAURATEUR' | 'STAFF';
  subdomain?: string;
  name: string;
  exp?: number;
  tokenType?: string;
}

function computeSignature(header: string, body: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret || 'fallback_secret_key_change_me')
    .update(`${header}.${body}`)
    .digest('base64url');
}

/**
 * Génère un Access Token sécurisé (durée 2 heures).
 */
export function signAccessToken(payload: UserPayload): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 2; // 2 heures
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = computeSignature(header, body, JWT_SECRET);
  return `${header}.${body}.${signature}`;
}

/**
 * Génère un Refresh Token (durée 30 jours).
 */
export function signRefreshToken(payload: UserPayload): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 jours
  const body = Buffer.from(JSON.stringify({ ...payload, exp, tokenType: 'refresh' })).toString('base64url');
  const signature = computeSignature(header, body, JWT_SECRET);
  return `${header}.${body}.${signature}`;
}

/**
 * Vérifie la validité cryptographique d'un token JWT.
 */
export function verifyToken(token: string): UserPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;

    // Vérification cryptographique de la signature HMAC SHA-256 avec timingSafeEqual
    const expectedSignature = computeSignature(header, body, JWT_SECRET);
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
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
  // Vérifier d'abord avec le système unifié de vérification admin
  if (isAuthorizedSuperAdmin(req)) {
    return { authorized: true };
  }

  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  // 1. Accepter le token JWT valide avec rôle SUPER_ADMIN
  if (token) {
    const payload = verifyToken(token);
    if (payload && payload.role === 'SUPER_ADMIN') {
      return { authorized: true };
    }
    if (SUPER_ADMIN_SECRET && token === SUPER_ADMIN_SECRET) {
      return { authorized: true };
    }
  }

  // 2. Bloquer tout accès non autorisé
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
