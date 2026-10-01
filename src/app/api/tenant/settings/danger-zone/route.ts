import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';
import { startTimer, logApiCall, createApiErrorResponse } from '@/lib/logger';
import { invalidateMenuCache } from '@/lib/cache';

export async function POST(req: Request) {
  const timer = startTimer();
  try {
    const body = await req.json();
    const { action, restaurantId, confirmationText } = body;

    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurantId obligatoire' }, { status: 400 });
    }

    const tenant = await (prisma as any).tenant.findFirst({
      where: {
        OR: [{ id: restaurantId }, { subdomain: restaurantId }],
      },
      include: {
        categories: {
          include: { items: true },
        },
        zones: {
          include: { tables: true },
        },
        cashiers: true,
        waiters: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    if (!isAuthorizedTenant(req, tenant.id)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    // 1. EXPORT DE DONNÉES (RGPD)
    if (action === 'EXPORT_DATA') {
      const exportPayload = {
        meta: {
          exportDate: new Date().toISOString(),
          platform: 'Lou Ame Tay? - DAW Digital Arts Work — by MG',
          version: 'V2.2',
        },
        restaurant: {
          id: tenant.id,
          name: tenant.businessName,
          subdomain: tenant.subdomain,
          phone: tenant.phone,
          address: tenant.address,
          plan: tenant.planId,
          branding: tenant.branding,
        },
        categories: tenant.categories,
        zones: tenant.zones,
        cashiers: tenant.cashiers.map((c: any) => ({ id: c.id, name: c.name, shift: c.shift, isActive: c.isActive })),
        waiters: tenant.waiters.map((w: any) => ({ id: w.id, name: w.name, phone: w.phone, isActive: w.isActive })),
      };

      return NextResponse.json({
        success: true,
        data: exportPayload,
        filename: `export-louametay-${tenant.subdomain}-${new Date().toISOString().split('T')[0]}.json`,
      });
    }

    // 2. RÉINITIALISATION DU MENU
    if (action === 'RESET_MENU') {
      if (confirmationText !== 'REINITIALISER') {
        return NextResponse.json(
          { error: 'Confirmation invalide. Veuillez taper précisément "REINITIALISER".' },
          { status: 400 }
        );
      }

      // Supprimer tous les plats et catégories associés à ce tenant
      await (prisma as any).menuItem.deleteMany({
        where: { tenantId: tenant.id },
      });
      await (prisma as any).category.deleteMany({
        where: { tenantId: tenant.id },
      });

      // Recréer une catégorie initiale vide
      await (prisma as any).category.create({
        data: {
          tenantId: tenant.id,
          name: 'Nouvelle Carte',
          icon: '🍽️',
          displayOrder: 1,
        },
      });

      await invalidateMenuCache(tenant.subdomain);
      await invalidateMenuCache(tenant.id);

      logApiCall({
        method: 'POST',
        endpoint: '/api/tenant/settings/danger-zone',
        tenantId: tenant.id,
        durationMs: timer.elapsedMs(),
        statusCode: 200,
        errorMessage: 'MENU_RESET_EXECUTED',
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        message: 'Votre menu a été réinitialisé avec succès.',
      });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    return createApiErrorResponse(error, {
      method: 'POST',
      endpoint: '/api/tenant/settings/danger-zone',
      durationMs: timer.elapsedMs(),
    });
  }
}
