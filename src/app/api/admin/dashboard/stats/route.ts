import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/dashboard/stats
// Récupère les métriques globales de monitoring et scaling pour le Super Admin
export async function GET() {
  try {
    const tenants = await (prisma as any).tenant.findMany({
      include: {
        plan: true,
      }
    });

    const active = tenants.filter((t: any) => t.subscriptionStatus === 'ACTIVE').length;
    const pastDue = tenants.filter((t: any) => t.subscriptionStatus === 'PAST_DUE').length;
    const suspended = tenants.filter((t: any) => t.subscriptionStatus === 'SUSPENDED').length;
    const trial = tenants.filter((t: any) => t.subscriptionStatus === 'TRIAL').length;

    const totalScansToday = tenants.reduce((sum: number, t: any) => sum + (t.qrScansToday || 0), 0);
    const totalOrdersToday = tenants.reduce((sum: number, t: any) => sum + (t.ordersToday || 0), 0);

    const monthlyRevenue = tenants.reduce((sum: number, t: any) => {
      if (t.subscriptionStatus === 'ACTIVE') {
        return sum + (t.plan?.price || 25000);
      }
      return sum;
    }, 0);

    const stats = {
      totalRestaurants: tenants.length,
      activeRestaurants: active,
      pastDueRestaurants: pastDue,
      suspendedRestaurants: suspended,
      trialRestaurants: trial,
      totalScansToday,
      totalOrdersToday,
      monthlyRevenue,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erreur API Stats SuperAdmin:', error);
    return NextResponse.json({ error: 'Erreur récupération statistiques' }, { status: 500 });
  }
}
