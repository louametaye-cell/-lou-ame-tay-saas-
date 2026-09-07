import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');
    const subdomain = searchParams.get('subdomain');

    if (!restaurantId && !subdomain) {
      return NextResponse.json({ error: 'restaurantId ou subdomain requis' }, { status: 400 });
    }

    const tenant = await (prisma as any).tenant.findFirst({
      where: {
        OR: [
          ...(restaurantId ? [{ id: restaurantId }] : []),
          ...(subdomain ? [{ subdomain }] : []),
        ],
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Restaurant introuvable' }, { status: 404 });
    }

    const brandingData = (tenant.branding as any) || {};

    return NextResponse.json({
      success: true,
      name: tenant.businessName,
      subdomain: tenant.subdomain,
      logoUrl: tenant.logoUrl || brandingData.logoUrl,
      bannerUrl: tenant.bannerUrl || brandingData.bannerUrl,
      establishmentType: brandingData.establishmentType || 'Restaurant',
      branding: {
        ...brandingData,
        logoUrl: tenant.logoUrl || brandingData.logoUrl,
        bannerUrl: tenant.bannerUrl || brandingData.bannerUrl,
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/tenant/branding:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { restaurantId, subdomain, name, establishmentType, branding } = body;

    if (!restaurantId && !subdomain) {
      return NextResponse.json({ error: 'restaurantId ou subdomain requis' }, { status: 400 });
    }

    const tenant = await (prisma as any).tenant.findFirst({
      where: {
        OR: [
          ...(restaurantId ? [{ id: restaurantId }] : []),
          ...(subdomain ? [{ subdomain }] : []),
        ],
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Restaurant introuvable' }, { status: 404 });
    }

    const currentBranding = (tenant.branding as any) || {};
    const updatedBranding = {
      ...currentBranding,
      ...(branding || {}),
      ...(establishmentType ? { establishmentType } : {}),
    };

    const updateData: any = {
      branding: updatedBranding,
    };

    if (name && typeof name === 'string' && name.trim().length > 0) {
      updateData.businessName = name.trim();
    }

    if (branding?.logoUrl) {
      updateData.logoUrl = branding.logoUrl;
    }

    if (branding?.bannerUrl) {
      updateData.bannerUrl = branding.bannerUrl;
    }

    const updated = await (prisma as any).tenant.update({
      where: { id: tenant.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      restaurant: {
        id: updated.id,
        name: updated.businessName,
        subdomain: updated.subdomain,
        logoUrl: updated.logoUrl,
        branding: updated.branding,
      },
    });
  } catch (error) {
    console.error('Erreur PUT /api/tenant/branding:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du branding' }, { status: 500 });
  }
}