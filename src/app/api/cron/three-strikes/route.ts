import { NextResponse } from 'next/server';
import { runThreeStrikesCron } from '@/server/cron/three-strikes-checker';

// GET ou POST /api/cron/three-strikes
// Déclenchement automatique de la règle des 3 Strikes
export async function GET() {
  try {
    const result = await runThreeStrikesCron();
    return NextResponse.json({
      success: true,
      message: 'Audit Cron 3-Strikes exécuté avec succès',
      data: result,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur exécution Cron 3-Strikes' }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
