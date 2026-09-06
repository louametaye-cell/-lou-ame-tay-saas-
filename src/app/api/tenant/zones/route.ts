import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tenant/zones?tenantId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || 'resto_thies_01'; // Fallback for dev

    const zones = await prisma.zone.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tables: true, orders: true }
        }
      }
    });

    return NextResponse.json({ zones });
  } catch (error) {
    console.error('Erreur récupération des zones:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/tenant/zones
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, type, tenantId = 'resto_thies_01' } = body;

    if (!name) {
      return NextResponse.json({ error: 'Le nom de la zone est requis' }, { status: 400 });
    }

    const zone = await prisma.zone.create({
      data: {
        tenantId,
        name,
        type: type || 'TABLES',
      },
    });

    return NextResponse.json({ zone }, { status: 201 });
  } catch (error) {
    console.error('Erreur création zone:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
