import { NextResponse } from 'next/server';
import { runSubscriptionCronJob } from '@/server/cron/subscription-checker';

// GET ou POST /api/cron/subscription-check
// Déclencheur du Cron Job 03:00 AM pour la gestion des abonnements
export async function GET(req: Request) {
  try {
    const result = await runSubscriptionCronJob();
    return NextResponse.json({
      success: true,
      message: 'Cron job nocturne 03:00 AM exécuté avec succès',
      data: result,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur exécution Cron job' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
