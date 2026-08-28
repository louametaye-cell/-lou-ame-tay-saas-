import { NextResponse } from 'next/server';
import { saasStorage } from '@/lib/saas-storage';

// GET /api/admin/plans/[id]
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const plan = saasStorage.getPlanById(params.id);
    if (!plan) {
      return NextResponse.json({ error: 'Pack introuvable' }, { status: 404 });
    }
    return NextResponse.json({ plan });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT /api/admin/plans/[id]
// Modifier le prix, la description, et cocher/décocher les fonctionnalités / limites
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = saasStorage.updatePlan(params.id, body);

    if (!updated) {
      return NextResponse.json({ error: 'Pack introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      plan: updated,
      message: `Pack "${updated.name}" mis à jour avec succès !`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du pack' }, { status: 500 });
  }
}
