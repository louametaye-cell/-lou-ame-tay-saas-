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
      include: {
        planFeatures: {
          include: {
            feature: true
          }
        }
      }
    });
    if (!plan) {
      return NextResponse.json({ error: 'Pack introuvable' }, { status: 404 });
    }

    const formatted = {
      ...plan,
      price: Number(plan.price),
      features: plan.planFeatures ? plan.planFeatures.map((pf: any) => ({
        id: pf.id,
        planId: pf.planId,
        featureId: pf.featureId,
        featureKey: pf.feature?.keyName || '',
        keyName: pf.feature?.keyName || '',
        label: pf.feature?.label || '',
        isActive: Boolean(pf.isActive),
        limitValue: pf.limitValue
      })) : []
    };

    return NextResponse.json({ plan: formatted });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT /api/admin/plans/[id]
// Modifier le prix, la description, le nom et les fonctionnalités (planFeatures) du pack dans PostgreSQL Supabase
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const body = await req.json();
    const { price, description, colorTheme, isRecommended, name, features } = body;

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

    // 🔒 PERSISTANCE RÉELLE DES FONCTIONNALITÉS (planFeatures) DANS POSTGRESQL
    if (Array.isArray(features) && features.length > 0) {
      for (const feat of features) {
        const key = feat.featureKey || feat.keyName;
        const targetFeature = await (prisma as any).feature.findFirst({
          where: {
            OR: [
              ...(feat.featureId ? [{ id: feat.featureId }] : []),
              ...(key ? [{ keyName: key }] : [])
            ]
          }
        });

        if (targetFeature) {
          await (prisma as any).planFeature.upsert({
            where: {
              planId_featureId: {
                planId: existing.id,
                featureId: targetFeature.id
              }
            },
            update: {
              isActive: Boolean(feat.isActive),
              limitValue: feat.limitValue !== undefined ? feat.limitValue : null
            },
            create: {
              planId: existing.id,
              featureId: targetFeature.id,
              isActive: Boolean(feat.isActive),
              limitValue: feat.limitValue !== undefined ? feat.limitValue : null
            }
          });
        }
      }
    }

    // Récupérer le plan fraîchement synchronisé avec ses features
    const refreshed = await (prisma as any).plan.findUnique({
      where: { id: existing.id },
      include: {
        planFeatures: {
          include: {
            feature: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      plan: refreshed,
      message: `Pack "${updated.name}" et ses fonctionnalités enregistrés avec succès dans la base de données !`,
    });
  } catch (error: any) {
    console.error('Erreur update plan:', error);
    return NextResponse.json({ error: error?.message || 'Erreur lors de la mise à jour du pack' }, { status: 500 });
  }
}
