import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ restaurantId: string }> | { restaurantId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const rawId = resolvedParams.restaurantId;
    if (!rawId) {
      return NextResponse.json({ error: 'Identifiant restaurant manquant' }, { status: 400 });
    }

    const searchId = rawId.toLowerCase();
    const cacheKey = `display:${searchId}`;

    // 1. Rate Limiting (200 req/min pour écrans TV)
    try {
      const rate = await checkRateLimit(req, 'display');
      if (!rate.success) {
        return NextResponse.json(
          { error: 'Trop de requêtes TV.' },
          { status: 429, headers: { 'Retry-After': String(rate.reset) } }
        );
      }
    } catch {}

    // 2. Vérification Cache Redis
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
      }
    } catch {}

    // 3. Requête Base de Données Prisma
    const tenant = await (prisma as any).tenant.findFirst({
      where: {
        OR: [
          { id: searchId },
          { subdomain: searchId },
        ],
      },
      include: {
        plan: {
          select: { slug: true, name: true }
        },
        categories: {
          orderBy: { displayOrder: 'asc' },
          include: {
            items: {
              where: { isAvailable: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });
    }

    // 🔒 Contrôle Paywall : L'Écran Menu TV nécessite XÉWEUL ou supérieur
    const { hasAccessToFeature, getFeaturePaywallInfo } = await import('@/lib/plan-permissions');
    const currentPlan = tenant.plan?.slug?.toLowerCase() || 'tambali';
    if (!hasAccessToFeature(currentPlan, 'TV_DISPLAY_SIMPLE')) {
      const paywall = getFeaturePaywallInfo('TV_DISPLAY_SIMPLE');
      return NextResponse.json(
        {
          error: `La diffusion sur Écran Menu TV nécessite la formule ${paywall.requiredPlanName} ou supérieure.`,
          paywall,
          requiredPlan: paywall.requiredPlanName,
          currentPlan: tenant.plan?.name || 'TÀMBALI',
          isBlockedByPaywall: true
        },
        { status: 403 }
      );
    }

    const branding = (tenant.branding as any) || {};
    const displaySettings = branding.displaySettings || {
      isEnabled: true,
      mode: 'slideshow',
      slideDuration: 6,
      maxScreens: 1,
    };

    // Si l'affichage Écran TV est désactivé par le Super-Admin
    if (displaySettings.isEnabled === false) {
      return NextResponse.json({
        restaurantId: tenant.id,
        restaurantName: tenant.businessName,
        subdomain: tenant.subdomain,
        isEnabled: false,
        displaySettings,
        message: "L'affichage Écran TV n'est pas activé pour cet établissement par le Super-Admin.",
      });
    }

    const formattedCategories = (tenant.categories || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon || '🍽️',
      items: (cat.items || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        nameWolof: item.nameWolof || undefined,
        description: item.description || '',
        price: Number(item.price) || 0,
        imageUrl: item.imageUrl || '/images/placeholder-small.jpg',
        isAvailable: item.isAvailable ?? true,
        isSpecial: Boolean(item.isSpecialOfTheDay),
        allergens: item.allergens || [],
      })),
    }));

    // Liste aplatie pour modes diaporama et quadrant
    const availableSlides: any[] = [];
    formattedCategories.forEach((cat: any) => {
      cat.items.forEach((item: any) => {
        if (item.isAvailable) {
          availableSlides.push({
            id: item.id,
            name: item.name,
            nameWolof: item.nameWolof,
            description: item.description || '',
            price: item.price,
            imageUrl: item.imageUrl || '/images/placeholder-small.jpg',
            isSpecial: item.isSpecial,
            allergens: item.allergens || [],
            category: cat.name,
          });
        }
      });
    });

    const responsePayload = {
      restaurantId: tenant.id,
      restaurantName: tenant.businessName,
      subdomain: tenant.subdomain,
      restaurantAddress: tenant.address || 'Thiès / Dakar, Sénégal',
      restaurantPhone: tenant.phone || '+221 77 458 74 74',
      logoUrl: tenant.logoUrl,
      bannerUrl: tenant.bannerUrl,
      currency: tenant.currency || 'FCFA',
      isEnabled: true,
      displaySettings,
      categories: formattedCategories,
      items: availableSlides,
      updatedAt: new Date().toISOString(),
    };

    // Sauvegarde en cache Redis (TTL 300s)
    try {
      await redis.set(cacheKey, responsePayload, { ex: 300 });
    } catch {}

    return NextResponse.json(responsePayload, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (error: any) {
    console.error('Erreur GET /api/display/[restaurantId]:', error);
    return NextResponse.json({ error: 'Erreur serveur display' }, { status: 500 });
  }
}