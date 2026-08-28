import { NextResponse } from 'next/server';
import { saasStorage } from '@/lib/saas-storage';

// GET /api/admin/dashboard/stats
// Récupère les métriques globales de monitoring et scaling pour le Super Admin
export async function GET() {
  try {
    const stats = saasStorage.getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération statistiques' }, { status: 500 });
  }
}
