import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';
import { startTimer, logApiCall, createApiErrorResponse } from '@/lib/logger';
import { invalidateMenuCache } from '@/lib/cache';

// Helper pour résoudre le tenant
async function resolveTenant(req: Request, restaurantId?: string | null, subdomain?: string | null) {
  let candidate = restaurantId || subdomain;
  if (!candidate) {
    try {
      const cookieHeader = req.headers.get('cookie') || '';
      const cookiesList = cookieHeader.split(';').map((c) => c.trim());
      for (const c of cookiesList) {
        if (c.startsWith('saas_token=')) {
          const val = decodeURIComponent(c.replace('saas_token=', ''));
          if (val.startsWith('resto_session_')) candidate = val.replace('resto_session_', '');
          else candidate = val;
        }
      }
    } catch {}
  }

  if (!candidate) return null;

  return await (prisma as any).tenant.findFirst({
    where: {
      OR: [
        { id: candidate },
        { subdomain: candidate },
      ],
    },
    include: {
      plan: true,
      categories: {
        include: {
          items: true,
        },
      },
      zones: {
        include: {
          tables: true,
        },
      },
      cashiers: true,
    },
  });
}

// GET /api/tenant/settings?restaurantId=...
export async function GET(req: Request) {
  const timer = startTimer();
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');
    const subdomain = searchParams.get('subdomain');

    const tenant = await resolveTenant(req, restaurantId, subdomain);
    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    const branding = (tenant.branding as any) || {};

    const settings = {
      // 1. Identité
      identity: {
        id: tenant.id,
        name: tenant.businessName,
        subdomain: tenant.subdomain,
        address: tenant.address || branding.address || '',
        phone: tenant.phone || branding.phone || '',
        email: tenant.email || branding.email || '',
        logoUrl: tenant.logoUrl || branding.logoUrl || '',
        bannerUrl: tenant.bannerUrl || branding.bannerUrl || '',
      },

      // 2. Horaires d'ouverture
      openingHours: branding.openingHours || {
        monday: { isOpen: true, open: '11:00', close: '23:00' },
        tuesday: { isOpen: true, open: '11:00', close: '23:00' },
        wednesday: { isOpen: true, open: '11:00', close: '23:00' },
        thursday: { isOpen: true, open: '11:00', close: '23:00' },
        friday: { isOpen: true, open: '11:00', close: '23:30' },
        saturday: { isOpen: true, open: '11:00', close: '00:00' },
        sunday: { isOpen: true, open: '12:00', close: '23:00' },
      },
      exceptionalClosure: branding.exceptionalClosure || {
        isClosed: false,
        date: '',
        reason: '',
      },

      // 3. Paiement & Devise
      payment: {
        currency: branding.currency || 'FCFA',
        methods: branding.paymentMethods || {
          cash: true,
          wave: true,
          orangeMoney: true,
          card: false,
        },
        merchants: {
          waveMerchantId: tenant.waveMerchantId || branding.waveMerchantId || '',
          omMerchantNumber: tenant.omMerchantNumber || branding.omMerchantNumber || '',
        },
      },

      // 4. Notifications & Sons KDS
      notifications: {
        kdsSoundEnabled: branding.kdsSoundEnabled !== false,
        kdsSoundType: branding.kdsSoundType || 'carillon', // 'carillon' | 'dingdong' | 'alert'
        whatsappNotifications: Boolean(branding.whatsappNotifications),
        whatsappAlertNumber: branding.whatsappAlertNumber || tenant.phone || '',
      },

      // Métadonnées
      plan: tenant.plan?.slug?.toUpperCase() || 'TAMBALI',
      planName: tenant.plan?.name || 'TÀMBALI',
    };

    logApiCall({
      method: 'GET',
      endpoint: '/api/tenant/settings',
      tenantId: tenant.id,
      durationMs: timer.elapsedMs(),
      statusCode: 200,
    }).catch(() => {});

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return createApiErrorResponse(error, {
      method: 'GET',
      endpoint: '/api/tenant/settings',
      durationMs: timer.elapsedMs(),
    });
  }
}

// PUT /api/tenant/settings
export async function PUT(req: Request) {
  const timer = startTimer();
  try {
    const body = await req.json();
    const { restaurantId, subdomain, identity, openingHours, exceptionalClosure, payment, notifications } = body;

    const tenant = await resolveTenant(req, restaurantId, subdomain);
    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    if (!isAuthorizedTenant(req, tenant.id)) {
      return NextResponse.json({ error: 'Accès non autorisé pour cet établissement' }, { status: 401 });
    }

    const currentBranding = (tenant.branding as any) || {};

    // Mettre à jour le branding avec les nouvelles sections
    const updatedBranding = {
      ...currentBranding,
      ...(identity?.address ? { address: identity.address.trim() } : {}),
      ...(identity?.phone ? { phone: identity.phone.trim() } : {}),
      ...(identity?.email ? { email: identity.email.trim() } : {}),
      ...(identity?.logoUrl ? { logoUrl: identity.logoUrl } : {}),
      ...(identity?.bannerUrl ? { bannerUrl: identity.bannerUrl } : {}),
      ...(openingHours ? { openingHours } : {}),
      ...(exceptionalClosure ? { exceptionalClosure } : {}),
      ...(payment?.currency ? { currency: payment.currency } : {}),
      ...(payment?.methods ? { paymentMethods: payment.methods } : {}),
      ...(payment?.merchants?.waveMerchantId ? { waveMerchantId: payment.merchants.waveMerchantId } : {}),
      ...(payment?.merchants?.omMerchantNumber ? { omMerchantNumber: payment.merchants.omMerchantNumber } : {}),
      ...(notifications ? {
        kdsSoundEnabled: notifications.kdsSoundEnabled,
        kdsSoundType: notifications.kdsSoundType,
        whatsappNotifications: notifications.whatsappNotifications,
        whatsappAlertNumber: notifications.whatsappAlertNumber,
      } : {}),
    };

    const updateData: any = {
      branding: updatedBranding,
    };

    if (identity?.name && typeof identity.name === 'string') {
      updateData.businessName = identity.name.trim();
    }
    if (identity?.phone && typeof identity.phone === 'string') {
      updateData.phone = identity.phone.trim();
    }
    if (identity?.address && typeof identity.address === 'string') {
      updateData.address = identity.address.trim();
    }
    if (identity?.email && typeof identity.email === 'string') {
      updateData.email = identity.email.trim();
    }
    if (identity?.logoUrl) {
      updateData.logoUrl = identity.logoUrl;
    }
    if (identity?.bannerUrl) {
      updateData.bannerUrl = identity.bannerUrl;
    }
    if (payment?.merchants?.waveMerchantId) {
      updateData.waveMerchantId = payment.merchants.waveMerchantId.trim();
    }
    if (payment?.merchants?.omMerchantNumber) {
      updateData.omMerchantNumber = payment.merchants.omMerchantNumber.trim();
    }

    const updated = await (prisma as any).tenant.update({
      where: { id: tenant.id },
      data: updateData,
    });

    // Invalider les caches Redis
    await invalidateMenuCache(tenant.subdomain);
    await invalidateMenuCache(tenant.id);

    logApiCall({
      method: 'PUT',
      endpoint: '/api/tenant/settings',
      tenantId: tenant.id,
      durationMs: timer.elapsedMs(),
      statusCode: 200,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Paramètres enregistrés avec succès !',
      restaurant: {
        id: updated.id,
        name: updated.businessName,
        subdomain: updated.subdomain,
      },
    });
  } catch (error) {
    return createApiErrorResponse(error, {
      method: 'PUT',
      endpoint: '/api/tenant/settings',
      durationMs: timer.elapsedMs(),
    });
  }
}
