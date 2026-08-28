import { NextResponse } from 'next/server';
import { runCommercialReminderCron } from '@/server/cron/commercial-reminder';

// GET ou POST /api/cron/commercial-reminder
// Déclencheur automatique pour 11h30 et 19h30
export async function GET() {
  try {
    const result = await runCommercialReminderCron();
    return NextResponse.json({
      success: true,
      message: 'Cron de relance commerciale 11h30/19h30 exécuté avec succès',
      data: result,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de l\'exécution du cron commercial' }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
