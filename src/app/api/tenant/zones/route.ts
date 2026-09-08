import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';

// GET /api/tenant/zones?tenantId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId est obligatoire' }, { status: 400 });
    }

    if (!isAuthorizedTenant(req, tenantId)) {
      return NextResponse.json({ error: 'Accès non autorisé pour ce restaurant' }, { status: 401 });
    }

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
    const { name, type, tenantId } = body;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId est obligatoire' }, { status: 400 });
    }

    if (!isAuthorizedTenant(req, tenantId)) {
      return NextResponse.json({ error: 'Accès non autorisé pour ce restaurant' }, { status: 401 });
    }

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
