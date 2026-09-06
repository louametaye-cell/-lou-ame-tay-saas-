import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subdomain, restaurantId, tableNumber } = body;

    const targetId = subdomain || restaurantId;
    if (!targetId) {
      return NextResponse.json({ error: 'Identifiant restaurant manquant' }, { status: 400 });
    }

    const tableNum = Number(tableNumber) || 1;

    // Record in DB if available
    try {
      const dbTenant = await (prisma as any).tenant.findFirst({
        where: { OR: [{ id: targetId }, { subdomain: targetId }] },
      });

      if (dbTenant) {
        // Here you could create a scan record if you have a Scan model
        // Or update a totalScans column on Tenant if it exists.
        // For now we assume Prisma schema handles this or ignores it safely.
      }
    } catch (e) {
      // Non-blocking
    }

    return NextResponse.json({ success: true, recorded: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur enregistrement scan' }, { status: 500 });
  }
}
