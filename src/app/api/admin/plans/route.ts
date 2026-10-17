import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/plans
// Récupérer la liste des formules officielles Wolof depuis PostgreSQL Supabase
export async function GET() {
  try {
    const plans = await (prisma as any).plan.findMany({
      where: { isActive: true },
      include: {
        planFeatures: {
          include: {
            feature: true,
          },
        },
      },
    });

    // Ordre officiel canonique des formules Wolof
    const CANONICAL_ORDER: Record<string, number> = {
      'tambali': 1,
      'nio-far': 2,
      'xeweul': 3,
      'baobab': 4,
      'teranga': 5,
      'buur': 6,
      'ndaje': 7,
    };

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
        id: pf.id,
        planId: pf.planId,
        featureId: pf.featureId || pf.feature?.id,
        featureKey: pf.feature?.keyName || '',
        keyName: pf.feature?.keyName || '',
        label: pf.feature?.label || '',
        isActive: Boolean(pf.isActive),
        limitValue: pf.limitValue,
      })) : [],
    }));

    formatted.sort((a: any, b: any) => {
      const orderA = CANONICAL_ORDER[a.slug] ?? (a.price === 0 ? 99 : a.price);
      const orderB = CANONICAL_ORDER[b.slug] ?? (b.price === 0 ? 99 : b.price);
      return orderA - orderB;
    });

    return NextResponse.json({ plans: formatted });
  } catch (error) {
    console.error('Erreur GET admin plans (activation fallback résilient) :', error);
    const fallbackPlans = [
      { id: 'p_tambali', name: 'TÀMBALI', slug: 'tambali', price: 15000, currency: 'FCFA', description: 'Menu digital vitrine, gestion des stocks et personnalisation de marque.', colorTheme: '#64748b', isRecommended: false, isActive: true, features: [] },
      { id: 'p_niofar', name: 'NIO FAR', slug: 'nio-far', price: 25000, currency: 'FCFA', description: 'Commande QR à table, caisse comptoir express et gestion des commandes.', colorTheme: '#0284c7', isRecommended: false, isActive: true, features: [] },
      { id: 'p_xeweul', name: 'XÉWEUL', slug: 'xeweul', price: 35000, currency: 'FCFA', description: 'Écran cuisine KDS, retrait guichet TV, impression 80mm et multilingue.', colorTheme: '#FF6B00', isRecommended: true, isActive: true, features: [] },
      { id: 'p_baobab', name: 'BAOBAB', slug: 'baobab', price: 46800, currency: 'FCFA', description: 'Multi-guichets caisse, affichage multi-écrans TV et exports comptables.', colorTheme: '#059669', isRecommended: false, isActive: true, features: [] },
      { id: 'p_teranga', name: 'TERANGA', slug: 'teranga', price: 65000, currency: 'FCFA', description: 'Gestion multi-zones, badges QR serveurs avec traçabilité et TV par zone.', colorTheme: '#7c3aed', isRecommended: false, isActive: true, features: [] },
      { id: 'p_buur', name: 'BUUR', slug: 'buur', price: 80000, currency: 'FCFA', description: 'Supervision multi-sites, reporting staff avancé et support VIP 24/7.', colorTheme: '#dc2626', isRecommended: false, isActive: true, features: [] },
      { id: 'p_ndaje', name: 'NDAJÉ', slug: 'ndaje', price: 120000, currency: 'FCFA', description: 'Formule sur mesure, multi-établissements illimité et intégration ERP complète.', colorTheme: '#0f172a', isRecommended: false, isActive: true, features: [] },
    ];
    return NextResponse.json({ plans: fallbackPlans, source: 'resilient_fallback' });
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
