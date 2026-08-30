import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { orderStorage } from '@/lib/order-storage';
import { invalidateMenuCache } from '@/lib/cache';
import { RestaurantBranding } from '@/types';

// Valeurs par défaut du studio de personnalisation
const DEFAULT_BRANDING: RestaurantBranding = {
  primaryColor: '#FF6B00',
  secondaryColor: '#00A86B',
  backgroundColor: '#FFF8F0',
  textColor: '#0F172A',
  fontTitle: 'Playfair Display',
  fontBody: 'Plus Jakarta Sans',
  logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
  phone: '+221 77 458 74 74',
  whatsapp: '+221 77 458 74 74',
  address: 'Sénégal',
  googleMapsUrl: 'https://maps.google.com/?q=Dakar+Senegal',
  website: 'https://louametay.com',
  instagram: 'https://instagram.com/louametay',
  facebook: 'https://facebook.com/louametay',
  tiktok: 'https://tiktok.com/@louametay',
  googleReviewUrl: 'https://g.page/r/louametay/review',
  tagline: 'Scannez • Commandez • Savourez !',
};

// GET /api/tenant/branding
// Récupère la personnalisation graphique du restaurant
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get('restaurantId') || searchParams.get('subdomain') || '';

    // 1. Recherche dans orderStorage
    const allRestaurants = orderStorage.getAllRestaurants();
    const cleanId = identifier.trim().toLowerCase();
    const matched = allRestaurants.find(
      (r) => r.id.toLowerCase() === cleanId || r.subdomain.toLowerCase() === cleanId
    ) || allRestaurants[0];

    // 2. Recherche en base Prisma
    if (identifier) {
      try {
        const tenant = await (prisma as any).tenant.findFirst({
          where: {
            OR: [
              { id: identifier },
              { subdomain: identifier },
            ],
          },
          select: {
            id: true,
            businessName: true,
            subdomain: true,
            logoUrl: true,
            bannerUrl: true,
            phone: true,
            address: true,
            branding: true,
          },
        });

        if (tenant) {
          const mergedBranding: RestaurantBranding = {
            ...DEFAULT_BRANDING,
            logoUrl: tenant.logoUrl || DEFAULT_BRANDING.logoUrl,
            bannerUrl: tenant.bannerUrl || DEFAULT_BRANDING.bannerUrl,
            phone: tenant.phone || DEFAULT_BRANDING.phone,
            address: tenant.address || DEFAULT_BRANDING.address,
            ...(typeof tenant.branding === 'object' && tenant.branding !== null ? tenant.branding : {}),
          };

          return NextResponse.json({
            success: true,
            restaurantId: tenant.id,
            subdomain: tenant.subdomain,
            name: tenant.businessName,
            branding: mergedBranding,
          });
        }
      } catch (dbErr) {
        // Fallback to in-memory matched
      }
    }

    const memoryBranding: RestaurantBranding = {
      ...DEFAULT_BRANDING,
      logoUrl: matched?.logoUrl || DEFAULT_BRANDING.logoUrl,
      bannerUrl: matched?.bannerUrl || DEFAULT_BRANDING.bannerUrl,
      phone: matched?.phone || DEFAULT_BRANDING.phone,
      address: matched?.address || DEFAULT_BRANDING.address,
      ...(matched?.branding || {}),
    };

    return NextResponse.json({
      success: true,
      restaurantId: matched?.id || 'resto_default',
      subdomain: matched?.subdomain || 'mg-cafe-resto',
      name: matched?.name || 'Restaurant',
      branding: memoryBranding,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération branding' }, { status: 500 });
  }
}

// PUT /api/tenant/branding
// Met à jour l'identité visuelle et les coordonnées du restaurant
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { restaurantId, subdomain, branding } = body;

    if (!branding || typeof branding !== 'object') {
      return NextResponse.json({ error: 'Données de branding invalides' }, { status: 400 });
    }

    const cleanSubdomain = (subdomain || restaurantId || '').trim();

    // 1. Mise à jour dans Prisma
    let updatedTenant: any = null;
    try {
      if (restaurantId || subdomain) {
        const existing = await (prisma as any).tenant.findFirst({
          where: {
            OR: [
              { id: restaurantId || 'unknown' },
              { subdomain: cleanSubdomain },
            ],
          },
        });

        if (existing) {
          updatedTenant = await (prisma as any).tenant.update({
            where: { id: existing.id },
            data: {
              logoUrl: branding.logoUrl || existing.logoUrl,
              bannerUrl: branding.bannerUrl || existing.bannerUrl,
              phone: branding.phone || existing.phone,
              address: branding.address || existing.address,
              branding: branding,
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn('Prisma branding update fallback:', dbErr);
    }

    // 2. Mise à jour dans orderStorage
    const allRestaurants = orderStorage.getAllRestaurants();
    const matched = allRestaurants.find(
      (r) => r.id === restaurantId || r.subdomain === cleanSubdomain || r.subdomain === 'mg-cafe-resto'
    );

    if (matched) {
      matched.branding = branding;
      if (branding.logoUrl) matched.logoUrl = branding.logoUrl;
      if (branding.bannerUrl) matched.bannerUrl = branding.bannerUrl;
      if (branding.phone) matched.phone = branding.phone;
      if (branding.address) matched.address = branding.address;
    }

    // 3. Invalidation du cache Redis pour rafraîchir instantanément les menus clients
    await invalidateMenuCache(cleanSubdomain || 'global');

    return NextResponse.json({
      success: true,
      message: 'Identité de marque enregistrée avec succès !',
      branding,
      tenantId: updatedTenant?.id || matched?.id,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du branding' }, { status: 500 });
  }
}
