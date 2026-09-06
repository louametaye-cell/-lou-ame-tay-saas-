import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/plans
// Récupérer la liste des packs directement depuis PostgreSQL Supabase
export async function GET() {
  try {
    const plans = await (prisma as any).plan.findMany({
      include: {
        planFeatures: {
          include: {
            feature: true,
          },
        },
      },
    });

    const formatted = plans.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      currency: p.currency || 'FCFA',
      description: p.description,
      colorTheme: p.colorTheme || '#FF6B00',
      isRecommended: p.isRecommended,
      isActive: p.isActive,
      features: p.planFeatures ? p.planFeatures.map((pf: any) => ({
        id: pf.feature?.id || pf.id,
        keyName: pf.feature?.keyName || '',
        label: pf.feature?.label || '',
        isActive: pf.isActive,
        limitValue: pf.limitValue,
      })) : [],
    }));

    return NextResponse.json({ plans: formatted });
  } catch (error) {
    console.error('Erreur GET admin plans:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des packs' }, { status: 500 });
  }
}

// POST /api/admin/plans
// Créer un nouveau pack tarifaire personnalisé dans la BDD Supabase
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, price, description, colorTheme, isRecommended } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Le nom et le prix du pack sont obligatoires' }, { status: 400 });
    }

    const created = await (prisma as any).plan.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        price: Number(price),
        currency: 'FCFA',
        description: description || '',
        colorTheme: colorTheme || '#FF6B00',
        isRecommended: Boolean(isRecommended),
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        plan: created,
        message: `Pack "${created.name}" créé avec succès !`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erreur POST admin plan:', error);
    return NextResponse.json({ error: error?.message || 'Erreur lors de la création du pack' }, { status: 500 });
  }
}
