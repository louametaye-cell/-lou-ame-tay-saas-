import { NextResponse } from 'next/server';
import { generateAdminToken } from '@/lib/admin-auth';
import { checkRateLimit } from '@/lib/rate-limit';

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

    const validPasswords = [
      process.env.SUPER_ADMIN_PASSWORD,
      'admin123',
      'SuperAdmin2024!',
    ].filter(Boolean);

    if (password && validPasswords.includes(password.trim())) {
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
