import { NextResponse } from 'next/server';
import { saasStorage } from '@/lib/saas-storage';

// GET /api/admin/features
// Lister toutes les fonctionnalités et capacités du catalogue SaaS
export async function GET() {
  try {
    const features = saasStorage.getAllFeatures();
    return NextResponse.json({ features });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des fonctionnalités' }, { status: 500 });
  }
}
