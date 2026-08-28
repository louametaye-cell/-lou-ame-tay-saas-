import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. ROUTES PUBLIQUES (AUCUN MOT DE PASSE REQUIS POUR LES CLIENTS)
  const isPublicRoute =
    pathname.startsWith('/r/') ||          // Menu client QR Code
    pathname.startsWith('/menu/') ||       // Menu alternatif
    pathname.startsWith('/display/') ||    // Écrans TV
    pathname.startsWith('/pay/') ||        // Paiement mobile client
    pathname.startsWith('/login') ||       // Page de connexion restaurateur
    pathname.startsWith('/super-admin/login') ||
    pathname.startsWith('/api/') ||        // APIs publiques
    pathname.startsWith('/_next') ||
    pathname.includes('/favicon.ico') ||
    pathname === '/';

  // Si c'est une route publique, on laisse passer immédiatement
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 2. ROUTES DU TABLEAU DE BORD RESTAURATEUR (/dashboard, /cashier, /kitchen)
  const token = request.cookies.get('saas_token')?.value || request.cookies.get('token')?.value;

  if (!token && (pathname.startsWith('/dashboard') || pathname.startsWith('/cashier') || pathname.startsWith('/kitchen'))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. ROUTES DU SUPER-ADMIN
  if (pathname.startsWith('/super-admin') && !pathname.startsWith('/super-admin/login')) {
    const adminToken = request.cookies.get('super_admin_token')?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
