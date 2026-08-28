import { NextResponse } from 'next/server';
import { autoTranslateDish } from '@/lib/translation-engine';

// POST /api/translate/auto
// Traduction automatique instantanée d'un plat dans les 4 langues (FR, EN, ES, IT)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Le nom du plat en français est obligatoire' }, { status: 400 });
    }

    const translations = await autoTranslateDish(name, description || '');

    return NextResponse.json({
      success: true,
      translations,
      message: 'Traduction automatique générée avec succès pour 🇫🇷 FR, 🇬🇧 EN, 🇪🇸 ES, 🇮🇹 IT.',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la traduction automatique' }, { status: 500 });
  }
}
