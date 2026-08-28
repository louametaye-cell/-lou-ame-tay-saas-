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

// Dictionnaire des catégories dans les 4 langues
export const CATEGORY_TRANSLATIONS: Record<string, { FR: string; EN: string; ES: string; IT: string }> = {
  'Lou Ame Tay (Plats du Jour)': {
    FR: 'Lou Ame Tay (Plats du Jour)',
    EN: 'Daily Specials (Lou Ame Tay)',
    ES: 'Especiales del Día (Lou Ame Tay)',
    IT: 'Piatti del Giorno (Lou Ame Tay)',
  },
  'Entrées & Tapas': {
    FR: 'Entrées & Tapas',
    EN: 'Starters & Tapas',
    ES: 'Entrantes y Tapas',
    IT: 'Antipasti e Tapas',
  },
  'Grillades': {
    FR: 'Grillades',
    EN: 'Grilled Meats & BBQ',
    ES: 'Carnes a la Parrilla',
    IT: 'Grigliate e Carne',
  },
  'Poissons & Fruits de Mer': {
    FR: 'Poissons & Fruits de Mer',
    EN: 'Fish & Fresh Seafood',
    ES: 'Pescados y Mariscos',
    IT: 'Pesce e Frutti di Mare',
  },
  'Plats Traditionnels': {
    FR: 'Plats Traditionnels',
    EN: 'Traditional Senegalese Stews',
    ES: 'Platos Tradicionales',
    IT: 'Piatti Tradizionali',
  },
  'Desserts': {
    FR: 'Desserts',
    EN: 'Desserts & Sweets',
    ES: 'Postres y Dulces',
    IT: 'Dolci e Dessert',
  },
  'Boissons': {
    FR: 'Boissons',
    EN: 'Drinks & Fresh Juices',
    ES: 'Bebidas y Refrescos',
    IT: 'Bevande e Succhi',
  },
};

// Dictionnaire des allergènes
export const ALLERGEN_TRANSLATIONS: Record<string, { FR: string; EN: string; ES: string; IT: string }> = {
  'POISSON': { FR: 'Poisson', EN: 'Fish', ES: 'Pescado', IT: 'Pesce' },
  'CRUSTACES': { FR: 'Crustacés', EN: 'Crustaceans', ES: 'Crustáceos', IT: 'Crostacei' },
  'MOUTARDE': { FR: 'Moutarde', EN: 'Mustard', ES: 'Mostaza', IT: 'Senape' },
  'GLUTEN': { FR: 'Gluten', EN: 'Gluten', ES: 'Gluten', IT: 'Glutine' },
  'OEUFS': { FR: 'Œufs', EN: 'Eggs', ES: 'Huevos', IT: 'Uova' },
  'SOJA': { FR: 'Soja', EN: 'Soy', ES: 'Soja', IT: 'Soia' },
  'ARACHIDES': { FR: 'Arachides', EN: 'Peanuts', ES: 'Cacahuetes', IT: 'Arachidi' },
  'LAIT': { FR: 'Lait', EN: 'Dairy / Milk', ES: 'Lácteos', IT: 'Latte' },
  'Poisson': { FR: 'Poisson', EN: 'Fish', ES: 'Pescado', IT: 'Pesce' },
  'Crustacés': { FR: 'Crustacés', EN: 'Crustaceans', ES: 'Crustáceos', IT: 'Crostacei' },
  'Moutarde': { FR: 'Moutarde', EN: 'Mustard', ES: 'Mostaza', IT: 'Senape' },
  'Gluten': { FR: 'Gluten', EN: 'Gluten', ES: 'Gluten', IT: 'Glutine' },
  'Œufs': { FR: 'Œufs', EN: 'Eggs', ES: 'Huevos', IT: 'Uova' },
  'Soja': { FR: 'Soja', EN: 'Soy', ES: 'Soja', IT: 'Soia' },
  'Arachides': { FR: 'Arachides', EN: 'Peanuts', ES: 'Cacahuetes', IT: 'Arachidi' },
  'Lait': { FR: 'Lait', EN: 'Dairy / Milk', ES: 'Lácteos', IT: 'Latte' },
};

// Dictionnaire des textes de l'interface (UI)
export const UI_TRANSLATIONS = {
  FR: {
    menuLang: 'Langue du Menu :',
    scanChooseOrder: 'Scannez, choisissez, commandez.',
    searchPlaceholder: 'Rechercher un plat, spécialité ou boisson...',
    table: 'Table',
    callWaiter: 'Appeler le serveur',
    specialOfTheDay: '🌟 Lou Ame Tay',
    prepTime: 'min',
    homemade: '🌿 Fait maison avec passion',
    price: 'Prix',
    add: 'Ajouter',
    added: 'Ajouté',
    outOfStock: 'Momentanément Épuisé',
    viewCart: 'Voir mon panier',
    yourOrder: 'Votre Commande',
    articles: 'articles',
    article: 'article',
    emptyCartTitle: 'Votre panier est encore vide',
    emptyCartSubtitle: 'Ajoutez de délicieux plats pour débuter votre commande.',
    kitchenNoteLabel: 'Une remarque pour le chef ? (Optionnel)',
    kitchenNotePlaceholder: 'Ex: Piment bien fort, servi sans couverts...',
    totalToPay: 'Total à régler',
    sendOrder: 'Transmettre ma commande 🚀',
    dishDetails: 'Détails du plat',
    allergensPresent: 'Allergènes présents :',
    specialInstructions: 'Instructions particulières pour la cuisine :',
    specialInstructionsPlaceholder: 'Ex: Sans oignons, bien pimenté, sauce à part...',
    callWaiterTitle: 'Appeler le Serveur',
    callWaiterSent: 'Appel transmis au comptoir !',
    callWaiterSubtitle: 'Un serveur arrive à votre table d\'ici quelques instants.',
    callReasonBill: 'Demander l\'addition (Note)',
    callReasonWater: 'Une carafe d\'eau / Glaçons',
    callReasonHelp: 'Besoin d\'aide / Conseil menu',
    callReasonOther: 'Autre demande particulière',
    orderSuccessTitle: 'Commande Transmise ! 🍽️',
    orderSuccessSubtitle: 'La cuisine a reçu votre commande avec succès',
    orderStep1Title: '1. Reçue & Notifiée en cuisine',
    orderStep1Desc: 'Bip sonore transmis au cuisinier avec vos instructions.',
    orderStep2Title: '2. En cours de préparation',
    orderStep2Desc: 'Vos plats et boissons sont en cours de dressage.',
    orderStep3Title: '3. Service à votre table',
    orderStep3Desc: 'Le serveur vous apporte vos plats chauds directement.',
    orderSummary: 'Récapitulatif des plats',
    orderMore: 'Ajouter d\'autres plats / boissons',
    closeWindow: 'Fermer cette fenêtre',
  },
  EN: {
    menuLang: 'Menu Language:',
    scanChooseOrder: 'Scan, choose, order directly.',
    searchPlaceholder: 'Search dish, specialty or drink...',
    table: 'Table',
    callWaiter: 'Call waiter',
    specialOfTheDay: '🌟 Today\'s Special',
    prepTime: 'min',
    homemade: '🌿 Homemade with passion',
    price: 'Price',
    add: 'Add',
    added: 'Added',
    outOfStock: 'Currently Out of Stock',
    viewCart: 'View my cart',
    yourOrder: 'Your Order',
    articles: 'items',
    article: 'item',
    emptyCartTitle: 'Your cart is currently empty',
    emptyCartSubtitle: 'Add delicious dishes to start your order.',
    kitchenNoteLabel: 'Special note for the chef? (Optional)',
    kitchenNotePlaceholder: 'E.g.: Extra spicy, no onions, sauce on the side...',
    totalToPay: 'Total Amount',
    sendOrder: 'Send my order to kitchen 🚀',
    dishDetails: 'Dish Details',
    allergensPresent: 'Allergens present:',
    specialInstructions: 'Special instructions for the kitchen:',
    specialInstructionsPlaceholder: 'E.g.: Extra spicy, sauce on the side...',
    callWaiterTitle: 'Call the Waiter',
    callWaiterSent: 'Request sent to counter!',
    callWaiterSubtitle: 'A server will be at your table in a few moments.',
    callReasonBill: 'Request the bill / payment',
    callReasonWater: 'Water jug / Ice cubes',
    callReasonHelp: 'Need help / Menu recommendation',
    callReasonOther: 'Other specific request',
    orderSuccessTitle: 'Order Placed! 🍽️',
    orderSuccessSubtitle: 'The kitchen has successfully received your order',
    orderStep1Title: '1. Received & Notified to kitchen',
    orderStep1Desc: 'Sound chime sent to the chef with your notes.',
    orderStep2Title: '2. Being prepared',
    orderStep2Desc: 'Your dishes and drinks are being freshly cooked.',
    orderStep3Title: '3. Served at your table',
    orderStep3Desc: 'The waiter brings your hot dishes directly to your table.',
    orderSummary: 'Dishes Summary',
    orderMore: 'Order more food / drinks',
    closeWindow: 'Close this window',
  },
  ES: {
    menuLang: 'Idioma del Menú:',
    scanChooseOrder: 'Escanea, elige, pide directamente.',
    searchPlaceholder: 'Buscar plato, especialidad o bebida...',
    table: 'Mesa',
    callWaiter: 'Llamar al camarero',
    specialOfTheDay: '🌟 Especial del Día',
    prepTime: 'min',
    homemade: '🌿 Hecho en casa con pasión',
    price: 'Precio',
    add: 'Añadir',
    added: 'Añadido',
    outOfStock: 'Temporalmente Agotado',
    viewCart: 'Ver mi carrito',
    yourOrder: 'Su Pedido',
    articles: 'artículos',
    article: 'artículo',
    emptyCartTitle: 'Tu carrito está vacío',
    emptyCartSubtitle: 'Añade deliciosos platos para comenzar tu pedido.',
    kitchenNoteLabel: '¿Nota especial para el chef? (Opcional)',
    kitchenNotePlaceholder: 'Ej: Muy picante, salsa aparte...',
    totalToPay: 'Total a pagar',
    sendOrder: 'Enviar pedido a la cocina 🚀',
    dishDetails: 'Detalles del plato',
    allergensPresent: 'Alérgenos presentes:',
    specialInstructions: 'Instrucciones especiales para la cocina:',
    specialInstructionsPlaceholder: 'Ej: Sin cebolla, salsa aparte...',
    callWaiterTitle: 'Llamar al Camarero',
    callWaiterSent: '¡Aviso enviado al mostrador!',
    callWaiterSubtitle: 'Un camarero llegará a su mesa en unos momentos.',
    callReasonBill: 'Pedir la cuenta / pagar',
    callReasonWater: 'Jarra de agua / Hielo',
    callReasonHelp: 'Ayuda / Recomendación del menú',
    callReasonOther: 'Otra petición especial',
    orderSuccessTitle: '¡Pedido Enviado! 🍽️',
    orderSuccessSubtitle: 'La cocina ha recibido su pedido con éxito',
    orderStep1Title: '1. Recibido y notificado en cocina',
    orderStep1Desc: 'Aviso sonoro transmitido al cocinero con sus notas.',
    orderStep2Title: '2. En preparación',
    orderStep2Desc: 'Sus platos y bebidas se están preparando.',
    orderStep3Title: '3. Servido en su mesa',
    orderStep3Desc: 'El camarero le servirá directamente en su mesa.',
    orderSummary: 'Resumen de platos',
    orderMore: 'Pedir más platos / bebidas',
    closeWindow: 'Cerrar esta ventana',
  },
  IT: {
    menuLang: 'Lingua del Menu:',
    scanChooseOrder: 'Scansiona, scegli, ordina direttamente.',
    searchPlaceholder: 'Cerca un piatto, specialità o bevanda...',
    table: 'Tavolo',
    callWaiter: 'Chiama cameriere',
    specialOfTheDay: '🌟 Piatto del Giorno',
    prepTime: 'min',
    homemade: '🌿 Fatto in casa con passione',
    price: 'Prezzo',
    add: 'Aggiungi',
    added: 'Aggiunto',
    outOfStock: 'Momentaneamente Esaurito',
    viewCart: 'Visualizza il carrello',
    yourOrder: 'Il Tuo Ordine',
    articles: 'articoli',
    article: 'articolo',
    emptyCartTitle: 'Il tuo carrello è vuoto',
    emptyCartSubtitle: 'Aggiungi piatti deliziosi per iniziare l\'ordine.',
    kitchenNoteLabel: 'Nota per lo chef? (Opzionale)',
    kitchenNotePlaceholder: 'Es: Molto piccante, salsa a parte...',
    totalToPay: 'Totale da saldare',
    sendOrder: 'Invia il mio ordine in cucina 🚀',
    dishDetails: 'Dettagli del piatto',
    allergensPresent: 'Allergeni presenti:',
    specialInstructions: 'Istruzioni speciali per la cucina:',
    specialInstructionsPlaceholder: 'Es: Senza cipolla, salsa a parte...',
    callWaiterTitle: 'Chiama il Cameriere',
    callWaiterSent: 'Chiamata inviata al banco!',
    callWaiterSubtitle: 'Un cameriere arriverà al vostro tavolo a breve.',
    callReasonBill: 'Richiedere il conto',
    callReasonWater: 'Caraffa d\'acqua / Ghiaccio',
    callReasonHelp: 'Aiuto / Consiglio sul menu',
    callReasonOther: 'Altra richiesta specifica',
    orderSuccessTitle: 'Ordine Inviato! 🍽️',
    orderSuccessSubtitle: 'La cucina ha ricevuto il tuo ordine con successo',
    orderStep1Title: '1. Ricevuto e notificato in cucina',
    orderStep1Desc: 'Segnale acustico inviato al cuoco con le tue note.',
    orderStep2Title: '2. In corso di preparazione',
    orderStep2Desc: 'I tuoi piatti e bevande sono in preparazione.',
    orderStep3Title: '3. Servito al tuo tavolo',
    orderStep3Desc: 'Il cameriere porta i tuoi piatti caldi direttamente al tavolo.',
    orderSummary: 'Riepilogo dei piatti',
    orderMore: 'Ordina altri piatti / bevande',
    closeWindow: 'Chiudi questa finestra',
  },
};

export function getUIText(lang: Language = 'FR') {
  return UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.FR;
}

export function translateCategoryName(catName: string, lang: Language = 'FR'): string {
  const cleanName = catName.replace(/^[^\s]+\s/, '').trim();
  const match = Object.entries(CATEGORY_TRANSLATIONS).find(([key]) => 
    catName.includes(key) || cleanName.includes(key)
  );
  if (match) {
    return match[1][lang] || match[1].FR;
  }
  return cleanName;
}

export function translateAllergenLabel(label: string, lang: Language = 'FR'): string {
  const match = ALLERGEN_TRANSLATIONS[label] || ALLERGEN_TRANSLATIONS[label.toUpperCase()];
  if (match) {
    return match[lang] || match.FR;
  }
  return label;
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

