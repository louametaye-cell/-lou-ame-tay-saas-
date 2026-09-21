import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auth/me
 * Résout l'identité du restaurant connecté à partir du cookie sécurisé HTTP-Only 'saas_token'
 * Permet au gérant d'ouvrir son Dashboard n'importe où dans le monde (smartphone, tablette, PC distant)
 * et de charger immédiatement toutes ses données réelles sans aucune dépendance au localStorage.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const explicitId = searchParams.get('restaurantId') || searchParams.get('tenantId');

    let tenantIdToSearch: string | null = explicitId?.trim() || null;

    if (!tenantIdToSearch) {
      const cookieHeader = req.headers.get('cookie') || '';
      const cookiesList = cookieHeader.split(';').map((c) => c.trim());
      for (const c of cookiesList) {
        if (c.startsWith('saas_token=')) {
          const val = decodeURIComponent(c.replace('saas_token=', ''));
          if (val.startsWith('resto_session_')) {
            tenantIdToSearch = val.replace('resto_session_', '');
            break;
          }
          tenantIdToSearch = val;
          break;
        }
      }
    }

    if (!tenantIdToSearch) {
      return NextResponse.json({ authenticated: false, restaurant: null }, { status: 401 });
    }

    const tenant = await (prisma as any).tenant.findFirst({
      where: {
        OR: [{ id: tenantIdToSearch }, { subdomain: tenantIdToSearch }],
      },
      select: {
        id: true,
        businessName: true,
        subdomain: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        logoUrl: true,
        bannerUrl: true,
        currency: true,
        currentPlanId: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        subscriptionExpiresAt: true,
        plan: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        branding: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ authenticated: false, restaurant: null }, { status: 404 });
    }

    const planSlug = (tenant.plan?.slug || '').toLowerCase();
    const isTambali = planSlug === 'tambali';

    return NextResponse.json({
      authenticated: true,
      restaurant: {
        id: tenant.id,
        name: tenant.businessName,
        subdomain: tenant.subdomain,
        email: tenant.email,
        phone: tenant.phone,
        address: tenant.address,
        city: tenant.city,
        logoUrl: tenant.logoUrl,
        bannerUrl: tenant.bannerUrl,
        currency: tenant.currency || 'FCFA',
        plan: tenant.plan,
        planSlug,
        planName: tenant.plan?.name || planSlug.toUpperCase(),
        isTambali,
        branding: tenant.branding,
      },
    });
  } catch (error) {
    console.error('Erreur résolution session /api/auth/me:', error);
    return NextResponse.json({ authenticated: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
