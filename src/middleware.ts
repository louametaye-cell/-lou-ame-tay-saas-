import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. VÉRIFICATION DE SÉCURITÉ POUR LES APIS SUPER-ADMIN & ADMIN
  const isSuperAdminApi =
    (pathname.startsWith('/api/super-admin') || pathname.startsWith('/api/admin')) &&
    !pathname.startsWith('/api/super-admin/auth');

  if (isSuperAdminApi) {
    const adminToken =
      request.cookies.get('superadmin_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.headers.get('x-superadmin-token');

    if (!adminToken) {
      return NextResponse.json(
        { error: 'Accès non autorisé : Session Super-Admin requise' },
        { status: 401 }
      );
    }
  }

  // 2. SÉCURISATION DES APIS RESTAURATEUR SENSIBLES (/api/dashboard/*, /api/tenant/cashiers/*, /api/tenant/cash-sessions/*, etc.)
  const isProtectedTenantApi =
    pathname.startsWith('/api/dashboard') ||
    pathname.startsWith('/api/tenant/cashiers') ||
    pathname.startsWith('/api/tenant/cash-sessions') ||
    pathname.startsWith('/api/tenant/waiters') ||
    pathname.startsWith('/api/tenant/zones');

  if (isProtectedTenantApi) {
    const tenantToken =
      request.cookies.get('saas_token')?.value ||
      request.cookies.get('superadmin_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!tenantToken) {
      return NextResponse.json(
        { error: 'Accès non autorisé : Authentification requise' },
        { status: 401 }
      );
    }
  }

  // 3. ROUTES PUBLIQUES (AUCUN MOT DE PASSE REQUIS POUR LES CLIENTS DU RESTAURANT)
  const isPublicRoute =
    pathname.startsWith('/r/') ||          // Menu client QR Code
    pathname.startsWith('/menu/') ||       // Menu alternatif
    pathname.startsWith('/display/') ||    // Écrans TV
    pathname.startsWith('/pay/') ||        // Paiement mobile client
    pathname.startsWith('/login') ||       // Page de connexion restaurateur
    pathname.startsWith('/super-admin') || // Écran de login Super-Admin client
    (pathname.startsWith('/api/') && !isSuperAdminApi && !isProtectedTenantApi) || // APIs publiques
    pathname.startsWith('/_next') ||
    pathname.includes('/favicon.ico') ||
    pathname === '/';

  // Si c'est une route publique, on laisse passer immédiatement
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 4. ROUTES DU TABLEAU DE BORD RESTAURATEUR (/dashboard, /cashier, /kitchen)
  const token = request.cookies.get('saas_token')?.value || request.cookies.get('token')?.value;

  if (!token && (pathname.startsWith('/dashboard') || pathname.startsWith('/cashier') || pathname.startsWith('/kitchen'))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
