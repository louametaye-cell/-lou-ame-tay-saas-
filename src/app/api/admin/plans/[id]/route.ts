import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/plans/[id]
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    const plan = await (prisma as any).plan.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });
    if (!plan) {
      return NextResponse.json({ error: 'Pack introuvable' }, { status: 404 });
    }
    return NextResponse.json({ plan });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT /api/admin/plans/[id]
// Modifier le prix, la description, le nom et les métadonnées du pack dans PostgreSQL Supabase
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const body = await req.json();
    const { price, description, colorTheme, isRecommended, name } = body;

    const existing = await (prisma as any).plan.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Pack introuvable' }, { status: 404 });
    }

    const updated = await (prisma as any).plan.update({
      where: { id: existing.id },
      data: {
        price: price !== undefined ? Number(price) : undefined,
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        colorTheme: colorTheme || undefined,
        isRecommended: isRecommended !== undefined ? Boolean(isRecommended) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      plan: updated,
      message: `Pack "${updated.name}" mis à jour avec succès dans la BDD !`,
    });
  } catch (error: any) {
    console.error('Erreur update plan:', error);
    return NextResponse.json({ error: error?.message || 'Erreur lors de la mise à jour du pack' }, { status: 500 });
  }
}
