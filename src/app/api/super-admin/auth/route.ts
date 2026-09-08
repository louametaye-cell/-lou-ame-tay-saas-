import { NextResponse } from 'next/server';
import { generateAdminToken, isAuthorizedSuperAdmin } from '@/lib/admin-auth';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * GET /api/super-admin/auth
 * Vérifie si la session Super Admin est active et valide (cookie ou header).
 */
export async function GET(req: Request) {
  try {
    const authorized = isAuthorizedSuperAdmin(req);
    if (authorized) {
      return NextResponse.json({ authenticated: true });
    }
    return NextResponse.json(
      { authenticated: false, error: 'Session non autorisée ou expirée' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, error: 'Erreur de vérification de session' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/super-admin/auth
 * Déconnexion sécurisée : supprime le cookie HttpOnly de session.
 */
export async function DELETE() {
  const res = NextResponse.json({
    success: true,
    message: 'Session Super-Admin fermée avec succès',
  });

  res.cookies.delete('superadmin_token');
  return res;
}


export async function POST(req: Request) {
  try {
    // 1. Anti-Brute Force Rate Limiting (5 tentatives / min max par IP)
    const rate = await checkRateLimit(req, 'auth');
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Trop de tentatives échouées. Accès temporairement suspendu pour 1 minute.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rate.reset) },
        }
      );
    }

    const body = await req.json();
    const { password } = body;

    const isProd = process.env.NODE_ENV === 'production';
    const configuredSecret = process.env.SUPER_ADMIN_PASSWORD?.trim();

    const validPasswords: string[] = isProd
      ? (configuredSecret ? [configuredSecret] : [])
      : ([configuredSecret, 'admin123', 'SuperAdmin2024!'].filter(Boolean) as string[]);

    if (isProd && !configuredSecret) {
      console.error('CRITICAL: SUPER_ADMIN_PASSWORD is not configured in production environment variables.');
    }

    if (password && validPasswords.length > 0 && validPasswords.includes(password.trim())) {
      const token = generateAdminToken();

      const res = NextResponse.json({
        success: true,
        token,
        message: 'Authentification Super-Admin réussie',
      });

      // Cookie sécurisé HttpOnly
      res.cookies.set('superadmin_token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24h
      });

      return res;
    }

    return NextResponse.json(
      { error: 'Identifiants Super-Admin invalides' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de l\'authentification' },
      { status: 500 }
    );
  }
}
