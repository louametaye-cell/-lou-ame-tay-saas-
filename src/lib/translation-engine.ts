// ==============================================================================
// MOTEUR DE TRADUCTION MULTILINGUE HYBRIDE (FR / EN / ES / IT)
// Lou Ame Tay ? - Google Cloud Translation API v2 & Lexique Culinaire Sénégalais
// ==============================================================================

import { Language } from '@/types';

export interface DishTranslationResult {
  FR: { name: string; description: string };
  EN: { name: string; description: string };
  ES: { name: string; description: string };
  IT: { name: string; description: string };
}

// Dictionnaire culinaire sénégalais de référence (Gastronomie UEMOA)
const SENEGALESE_CULINARY_LEXICON: Record<string, { EN: string; ES: string; IT: string }> = {
  'thieboudienne': {
    EN: 'Senegalese Red Jollof Rice with Braised Grouper Fish & Root Vegetables',
    ES: 'Arroz Rojo Senegalés con Mero y Verduras Tradicionales',
    IT: 'Riso Rosso Senegalese con Cernia e Verdure Tradizionali',
  },
  'ceebu jen': {
    EN: 'Authentic Senegalese Rice & Fresh Fish',
    ES: 'Auténtico Arroz Senegalés con Pescado Fresco',
    IT: 'Autentico Riso Senegalese con Pesce Fresco',
  },
  'thieb': {
    EN: 'Traditional Senegalese Jollof Rice',
    ES: 'Arroz Tradicional Senegalés',
    IT: 'Riso Tradizionale Senegalese',
  },
  'yassa': {
    EN: 'Caramelized Onion & Lemon Mustard Sauce',
    ES: 'Salsa de Cebolla Caramelizada al Limón y Mostaza',
    IT: 'Salsa di Cipolle Caramellate al Limone e Senape',
  },
  'mafe': {
    EN: 'Rich Creamy Peanut Butter Stew with Beef',
    ES: 'Guiso Cremoso de Mantequilla de Cacahuete y Ternera',
    IT: 'Stufato Cremoso di Burro d\'Arachidi e Manzo',
  },
  'pastels': {
    EN: 'Crispy Stuffed Fish Pastries with Spicy Tomato Sauce',
    ES: 'Empanadillas Crujientes de Pescado con Salsa Picante',
    IT: 'Fagottini Croccanti Ripieni di Pesce con Salsa Piccante',
  },
  'dibi': {
    EN: 'Charcoal-Grilled Spiced Lamb Chops with Sliced Onions',
    ES: 'Cordero a la Parrilla de Carbón con Cebollas Frescas',
    IT: 'Agnello Grigliato al Carbone con Cipolle Fresche',
  },
  'bissap': {
    EN: 'Chilled Hibiscus Flower Juice with Fresh Mint',
    ES: 'Jugo Refrescante de Flores de Hibisco con Menta',
    IT: 'Succo Fresco di Fiori di Ibisco con Menta',
  },
  'bouye': {
    EN: 'Natural Creamy Baobab Fruit Drink with Vanilla',
    ES: 'Bebida Cremosa Natural de Fruta de Baobab con Vainilla',
    IT: 'Bevanda Cremosa Naturale al Frutto di Baobab con Vaniglia',
  },
  'thiacry': {
    EN: 'Millet Couscous Pudding with Sweet Creamy Fromage Blanc',
    ES: 'Postre de Cuscús de Mijo con Crema Dulce de Queso',
    IT: 'Dolce di Couscous di Miglio con Crema Dolce di Formaggio',
  },
};

/**
 * Appel direct à Google Cloud Translation API v2
 */
async function translateWithGoogleApi(texts: string[], targetLang: 'en' | 'es' | 'it', apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: texts,
        target: targetLang,
        source: 'fr',
        format: 'text',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.data?.translations) {
        return data.data.translations.map((t: { translatedText: string }) => t.translatedText);
      }
    } else {
      console.warn(`[GoogleTranslate API] Code HTTP ${res.status}:`, await res.text());
    }
  } catch (err) {
    console.warn(`[GoogleTranslate API Error ${targetLang}]`, err);
  }
  return texts;
}

/**
 * Traduit automatiquement un nom et une description de plat dans les 4 langues.
 */
export async function autoTranslateDish(nameFr: string, descFr: string = ''): Promise<DishTranslationResult> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  const cleanName = nameFr.toLowerCase();

  // 1. Détection dans le lexique sénégalais
  let matchedLexicon: { EN: string; ES: string; IT: string } | null = null;
  for (const [key, trans] of Object.entries(SENEGALESE_CULINARY_LEXICON)) {
    if (cleanName.includes(key)) {
      matchedLexicon = trans;
      break;
    }
  }

  // 2. Si clé Google Cloud Translate configurée
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const texts = [nameFr, descFr || 'Plat traditionnel préparé chaque jour avec des ingrédients frais du marché.'];
      const [resEn, resEs, resIt] = await Promise.all([
        translateWithGoogleApi(texts, 'en', apiKey),
        translateWithGoogleApi(texts, 'es', apiKey),
        translateWithGoogleApi(texts, 'it', apiKey),
      ]);

      return {
        FR: { name: nameFr, description: descFr },
        EN: { 
          name: matchedLexicon ? `${nameFr} (${matchedLexicon.EN.split(' with ')[0]})` : resEn[0], 
          description: resEn[1] || (matchedLexicon ? matchedLexicon.EN : descFr) 
        },
        ES: { 
          name: matchedLexicon ? `${nameFr} (${matchedLexicon.ES.split(' con ')[0]})` : resEs[0], 
          description: resEs[1] || (matchedLexicon ? matchedLexicon.ES : descFr) 
        },
        IT: { 
          name: matchedLexicon ? `${nameFr} (${matchedLexicon.IT.split(' con ')[0]})` : resIt[0], 
          description: resIt[1] || (matchedLexicon ? matchedLexicon.IT : descFr) 
        },
      };
    } catch (e) {
      console.warn('[AutoTranslate] Erreur Google Translate API, bascule sur le moteur culinaire local.');
    }
  }

  // 3. Moteur culinaire sénégalais hors-ligne (Fallback instantané)
  const nameEn = matchedLexicon ? `${nameFr} (${matchedLexicon.EN.split(' with ')[0]})` : `${nameFr}`;
  const nameEs = matchedLexicon ? `${nameFr} (${matchedLexicon.ES.split(' con ')[0]})` : `${nameFr}`;
  const nameIt = matchedLexicon ? `${nameFr} (${matchedLexicon.IT.split(' con ')[0]})` : `${nameFr}`;

  const descEn = matchedLexicon 
    ? `${matchedLexicon.EN}. ${descFr ? `Served fresh: ${descFr}` : 'Authentic Senegalese recipe.'}`
    : (descFr ? `${descFr} (English translation)` : 'Delicious traditional dish prepared fresh daily.');

  const descEs = matchedLexicon 
    ? `${matchedLexicon.ES}. ${descFr ? `Preparado fresco: ${descFr}` : 'Receta tradicional senegalesa.'}`
    : (descFr ? `${descFr} (Traducción al español)` : 'Delicioso plato tradicional preparado fresco.');

  const descIt = matchedLexicon 
    ? `${matchedLexicon.IT}. ${descFr ? `Preparato fresco: ${descFr}` : 'Ricetta tradizionale senegalese.'}`
    : (descFr ? `${descFr} (Traduzione in italiano)` : 'Squisito piatto tradizionale preparato fresco ogni giorno.');

  return {
    FR: { name: nameFr, description: descFr },
    EN: { name: nameEn, description: descEn },
    ES: { name: nameEs, description: descEs },
    IT: { name: nameIt, description: descIt },
  };
}
