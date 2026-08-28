import { NextResponse } from 'next/server';
import { saasStorage } from '@/lib/saas-storage';

// GET /api/admin/tenants
// Récupérer la liste des restaurants avec tri par lastSeenAt et métriques temps réel
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sortByLastSeen = searchParams.get('sortBy') === 'lastSeenAt';

    const tenants = saasStorage.getAllTenants(sortByLastSeen);
    const plans = saasStorage.getAllPlans();

    const populated = tenants.map((t) => {
      const plan = plans.find((p) => p.id === t.currentPlanId);
      return {
        ...t,
        plan: plan || { name: 'Starter', price: 15000, colorTheme: '#64748b' },
      };
    });

    return NextResponse.json({ tenants: populated });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des locataires' }, { status: 500 });
  }
}
