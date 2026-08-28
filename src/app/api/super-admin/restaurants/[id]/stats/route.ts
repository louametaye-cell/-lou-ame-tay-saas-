import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { orderStorage } from '@/lib/order-storage';
import { SAMPLE_RESTAURANTS } from '@/lib/sample-data';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const resto = orderStorage.getRestaurantById(id) || SAMPLE_RESTAURANTS.find((r) => r.id === id || r.subdomain === id);

    if (!resto) {
      return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });
    }

    const totalScans = resto.totalScans || resto.stats?.totalScans || 348;
    const totalOrders = resto.totalOrders || resto.stats?.totalOrders || 174;
    const totalRevenue = resto.totalRevenue || resto.stats?.totalRevenue || 642000;
    const conversionRate = totalScans > 0 ? Number(((totalOrders / totalScans) * 100).toFixed(1)) : 0;
    const averageBasket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const statsPayload = {
      totalScans,
      totalOrders,
      totalRevenue,
      conversionRate,
      averageBasket,
      peakHour: resto.stats?.peakHour || 13,
      peakHoursDistribution: resto.stats?.peakHoursDistribution || [
        { hour: '11h', count: 14 },
        { hour: '12h', count: 48 },
        { hour: '13h', count: 86 },
        { hour: '14h', count: 52 },
        { hour: '15h', count: 18 },
        { hour: '19h', count: 32 },
        { hour: '20h', count: 64 },
        { hour: '21h', count: 45 },
        { hour: '22h', count: 21 },
      ],
      scansHistory30d: resto.stats?.scansHistory30d || Array.from({ length: 30 }, (_, i) => ({
        date: `J-${30 - i}`,
        scans: 8 + Math.floor(Math.sin(i / 3) * 6 + i * 0.3 + Math.random() * 4),
      })),
      ordersHistory30d: resto.stats?.ordersHistory30d || Array.from({ length: 30 }, (_, i) => {
        const ords = 4 + Math.floor(Math.sin(i / 3) * 3 + i * 0.15 + Math.random() * 2);
        return {
          date: `J-${30 - i}`,
          orders: ords,
          revenue: ords * averageBasket,
        };
      }),
      dailyHistory: resto.stats?.dailyHistory || [],
      scansByTable: resto.stats?.scansByTable || [],
    };

    return NextResponse.json({ success: true, stats: statsPayload });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération stats' }, { status: 500 });
  }
}
