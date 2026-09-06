import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedSuperAdmin } from '@/lib/admin-auth';

// GET /api/admin/tenants
// Récupération de tous les restaurants clients directement depuis la BDD PostgreSQL Supabase avec Prisma
export async function GET(req: Request) {
  try {
    if (!isAuthorizedSuperAdmin(req)) {
      return NextResponse.json({ error: 'Accès non autorisé : Droits Super-Admin requis' }, { status: 401 });
    }

    const tenants = await (prisma as any).tenant.findMany({
      include: {
        plan: true,
        tables: true,
        orders: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = tenants.map((t: any) => ({
      id: t.id,
      businessName: t.businessName,
      subdomain: t.subdomain,
      email: t.email,
      ownerName: t.ownerName,
      phone: t.phone,
      address: t.address,
      city: t.city || 'Dakar',
      logoUrl: t.logoUrl,
      bannerUrl: t.bannerUrl,
      currency: t.currency,
      currentPlanId: t.currentPlanId,
      subscriptionStatus: t.subscriptionStatus,
      subscriptionExpiresAt: t.subscriptionExpiresAt,
      monthlyFee: t.monthlyFee,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      lastSeenAt: t.lastSeenAt ? t.lastSeenAt.toISOString() : null,
      tablesCount: t.tables?.length || 0,
      ordersCount: t.orders?.length || 0,
      plan: t.plan
        ? {
            id: t.plan.id,
            name: t.plan.name,
            slug: t.plan.slug,
            price: t.plan.price,
            colorTheme: t.plan.colorTheme || '#FF6B00',
          }
        : { id: 'plan_pro', name: 'Pro', slug: 'pro', price: 25000, colorTheme: '#FF6B00' },
    }));

    return NextResponse.json({ tenants: formatted, source: 'database' });
  } catch (error) {
    console.error('Erreur GET admin tenants:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des locataires' }, { status: 500 });
  }
}
