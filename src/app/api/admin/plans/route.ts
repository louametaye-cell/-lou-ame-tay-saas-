import { NextResponse } from 'next/server';
import { saasStorage } from '@/lib/saas-storage';
import { SaaSPlan } from '@/types/saas';

// GET /api/admin/plans
// Récupérer la liste des packs avec leurs fonctionnalités et limites
export async function GET() {
  try {
    const plans = saasStorage.getAllPlans();
    return NextResponse.json({ plans });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des packs' }, { status: 500 });
  }
}

// POST /api/admin/plans
// Créer un nouveau pack tarifaire personnalisé
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, price, description, colorTheme, isRecommended, features } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Le nom et le prix du pack sont obligatoires' }, { status: 400 });
    }

    const newPlan: SaaSPlan = {
      id: `plan_${slug || name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      price: Number(price),
      currency: 'FCFA',
      description: description || '',
      colorTheme: colorTheme || '#FF6B00',
      isRecommended: Boolean(isRecommended),
      isActive: true,
      features: features || [],
    };

    const created = saasStorage.createPlan(newPlan);
    return NextResponse.json({
      success: true,
      plan: created,
      message: `Pack "${created.name}" créé avec succès !`,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création du pack' }, { status: 500 });
  }
}
