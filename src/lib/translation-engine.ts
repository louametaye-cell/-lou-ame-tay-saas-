// ==============================================================================
// MOTEUR DE TRADUCTION MULTILINGUE HYBRIDE (FR / WO / EN / ES / IT)
// Lou Ame Tay ? - Lexique Culinaire Sénégalais, Wolof & Devises
// ==============================================================================

import { Language } from '@/types';

export interface DishTranslationResult {
  FR: { name: string; description: string };
  WO: { name: string; description: string };
  EN: { name: string; description: string };
  ES: { name: string; description: string };
  IT: { name: string; description: string };
}

// Dictionnaire des catégories dans les 5 langues
export const CATEGORY_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Lou Ame Tay (Plats du Jour)': {
    FR: '🌟 Lou Ame Tay (Plats du Jour)',
    WO: '🌟 Lou am tay ? (Ñam yu tey)',
    EN: '🌟 Daily Specials (Lou Ame Tay)',
    ES: '🌟 Especiales del Día (Lou Ame Tay)',
    IT: '🌟 Piatti del Giorno (Lou Ame Tay)',
  },
  'Plats du Jour': {
    FR: '🌟 Plats du Jour',
    WO: '🌟 Ñam yu tey',
    EN: '🌟 Daily Specials',
    ES: '🌟 Especiales del Día',
    IT: '🌟 Piatti del Giorno',
  },
  'Entrées & Tapas': {
    FR: 'Entrées & Tapas',
    WO: 'Ndoor yi ak Tapas',
    EN: 'Starters & Tapas',
    ES: 'Entrantes y Tapas',
    IT: 'Antipasti e Tapas',
  },
  'Grillades': {
    FR: 'Grillades & Dibi',
    WO: 'Dibi ak Lakk yi',
    EN: 'Grilled Meats & BBQ',
    ES: 'Carnes a la Parrilla',
    IT: 'Grigliate e Carne',
  },
  'Poissons & Fruits de Mer': {
    FR: 'Poissons & Fruits de Mer',
    WO: 'Jën ak Meññeefu Géej',
    EN: 'Fish & Fresh Seafood',
    ES: 'Pescados y Mariscos',
    IT: 'Pesce e Frutti di Mare',
  },
  'Plats Traditionnels': {
    FR: 'Plats Traditionnels',
    WO: 'Ñam yu Maam yi (Ceeb, Yaasa)',
    EN: 'Traditional Senegalese Stews',
    ES: 'Platos Tradicionales',
    IT: 'Piatti Tradizionali',
  },
  'Desserts': {
    FR: 'Desserts & Douceurs',
    WO: 'Ñam yu Neex (Désert)',
    EN: 'Desserts & Sweets',
    ES: 'Postres y Dulces',
    IT: 'Dolci e Dessert',
  },
  'Boissons': {
    FR: 'Boissons & Jus Frais',
    WO: 'Naan yi (Bissap, Bouye)',
    EN: 'Drinks & Fresh Juices',
    ES: 'Bebidas y Refrescos',
    IT: 'Bevande e Succhi',
  },
};

// Dictionnaire des allergènes
export const ALLERGEN_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'POISSON': { FR: 'Poisson', WO: 'Jën', EN: 'Fish', ES: 'Pescado', IT: 'Pesce' },
  'CRUSTACES': { FR: 'Crustacés', WO: 'Sipax / Kankaran', EN: 'Crustaceans', ES: 'Crustáceos', IT: 'Crostacei' },
  'MOUTARDE': { FR: 'Moutarde', WO: 'Mutaar', EN: 'Mustard', ES: 'Mostaza', IT: 'Senape' },
  'GLUTEN': { FR: 'Gluten', WO: 'Gluten (Dugub)', EN: 'Gluten', ES: 'Gluten', IT: 'Glutine' },
  'OEUFS': { FR: 'Œufs', WO: 'Nen', EN: 'Eggs', ES: 'Huevos', IT: 'Uova' },
  'SOJA': { FR: 'Soja', WO: 'Soja', EN: 'Soy', ES: 'Soja', IT: 'Soia' },
  'ARACHIDES': { FR: 'Arachides', WO: 'Gerte', EN: 'Peanuts', ES: 'Cacahuetes', IT: 'Arachidi' },
  'LAIT': { FR: 'Lait', WO: 'Meew', EN: 'Dairy / Milk', ES: 'Lácteos', IT: 'Latte' },
  'Poisson': { FR: 'Poisson', WO: 'Jën', EN: 'Fish', ES: 'Pescado', IT: 'Pesce' },
  'Crustacés': { FR: 'Crustacés', WO: 'Sipax', EN: 'Crustaceans', ES: 'Crustáceos', IT: 'Crostacei' },
  'Moutarde': { FR: 'Moutarde', WO: 'Mutaar', EN: 'Mustard', ES: 'Mostaza', IT: 'Senape' },
  'Gluten': { FR: 'Gluten', WO: 'Gluten', EN: 'Gluten', ES: 'Gluten', IT: 'Glutine' },
  'Œufs': { FR: 'Œufs', WO: 'Nen', EN: 'Eggs', ES: 'Huevos', IT: 'Uova' },
  'Soja': { FR: 'Soja', WO: 'Soja', EN: 'Soy', ES: 'Soja', IT: 'Soia' },
  'Arachides': { FR: 'Arachides', WO: 'Gerte', EN: 'Peanuts', ES: 'Cacahuetes', IT: 'Arachidi' },
  'Lait': { FR: 'Lait', WO: 'Meew', EN: 'Dairy / Milk', ES: 'Lácteos', IT: 'Latte' },
};

// Dictionnaire des textes de l'interface (UI)
export const UI_TRANSLATIONS: Record<Language, Record<string, string>> = {
  FR: {
    menuLang: 'Langue du Menu :',
    scanChooseOrder: 'Scannez, choisissez, commandez.',
    searchPlaceholder: 'Rechercher un plat, spécialité ou boisson...',
    table: 'Table',
    callWaiter: 'Appeler le serveur',
    specialOfTheDay: '🌟 Lou Ame Tay',
    dailySpecialTitle: '🌟 Lou Ame Tay ? — Plats du Jour',
    dailySpecialBadge: 'Cuisiné Frais ⏱️',
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
    comboFormulaTitle: '🍱 Formule Midi Téranga (Entrée + Plat + Boisson)',
    comboFormulaSubtitle: 'Composez votre déjeuner complet à tarif préférentiel.',
  },
  WO: {
    menuLang: 'Làkku Menu bi :',
    scanChooseOrder: 'Skaneel, tànnal, komandeel léegi.',
    searchPlaceholder: 'Seet lëkk, ceebe, mbaxal mba naan...',
    table: 'Taabal',
    callWaiter: 'Wo serveer bi',
    specialOfTheDay: '🌟 Lou am tay ?',
    dailySpecialTitle: '🌟 Lou am tay ? (Ñam yu tey)',
    dailySpecialBadge: 'Ñam yu bees ⏱️',
    prepTime: 'min',
    homemade: '🌿 Ñam bu ñu toog ak bëgg-bëgg',
    price: 'Njëg',
    add: 'Yokku',
    added: 'Yokku na',
    outOfStock: 'Jeex na tey',
    viewCart: 'Xool sa panie',
    yourOrder: 'Sa Komand',
    articles: 'ñam',
    article: 'ñam',
    emptyCartTitle: 'Sa panie amul dara ba tey',
    emptyCartSubtitle: 'Tànnal ñam yu neex ngir door sa komand.',
    kitchenNoteLabel: 'Xalaat ngir toogkat bi ? (Bëgg-bëgg)',
    kitchenNotePlaceholder: 'Misaal: Kaani bu bari, soble bu néew...',
    totalToPay: 'Lii ngay fay',
    sendOrder: 'Yónnee komand bi ci kwisin bi 🚀',
    dishDetails: 'Détay yu ñam bi',
    allergensPresent: 'Li ciy jur gàllankoor :',
    specialInstructions: 'Ndoxum kwisin / Kaani :',
    specialInstructionsPlaceholder: 'Misaal: Bumu am soble, kaani bi ci wét...',
    callWaiterTitle: 'Wo Serveer bi',
    callWaiterSent: 'Wo nañu serveer bi !',
    callWaiterSubtitle: 'Serveer bi dafay ñëw ci sa taabal léegi.',
    callReasonBill: 'Fay lii (Facture bi)',
    callReasonWater: 'Ndox mu sedd / Gelas',
    callReasonHelp: 'Ndëpp / Ndimbal ci menu bi',
    callReasonOther: 'Leneen lu la soxla',
    orderSuccessTitle: 'Komand bi Yónnee na ! 🍽️',
    orderSuccessSubtitle: 'Kwisin bi jot na sa komand bu baax',
    orderStep1Title: '1. Jot nañu ko ci kwisin bi',
    orderStep1Desc: 'Bip bi sonné na ci toogkat bi.',
    orderStep2Title: '2. Ñu ngi koy toog',
    orderStep2Desc: 'Sa ñam ak sa naan ñu ngi koy pareel.',
    orderStep3Title: '3. Paréna ! Ñu ngi lay yóbbal',
    orderStep3Desc: 'Serveer bi dafay indi sa ñam mu tàng ci sa taabal.',
    orderSummary: 'Limbug ñam yi',
    orderMore: 'Yokku yeneen ñam / naan',
    closeWindow: 'Tëj palanteer bii',
    comboFormulaTitle: '🍱 Menu Téranga (Ndoor + Ñam + Naan)',
    comboFormulaSubtitle: 'Tànnal sa ndoor, sa ñam ak sa naan ci njëg bu yomb.',
  },
  EN: {
    menuLang: 'Menu Language:',
    scanChooseOrder: 'Scan, choose, order directly.',
    searchPlaceholder: 'Search dish, specialty or drink...',
    table: 'Table',
    callWaiter: 'Call waiter',
    specialOfTheDay: '🌟 Today\'s Special',
    dailySpecialTitle: '🌟 Today\'s Specials — Lou Ame Tay ?',
    dailySpecialBadge: 'Freshly Cooked ⏱️',
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
    comboFormulaTitle: '🍱 Lunch Téranga Combo (Starter + Main + Drink)',
    comboFormulaSubtitle: 'Build your complete 3-course lunch at a special price.',
  },
  ES: {
    menuLang: 'Idioma del Menú:',
    scanChooseOrder: 'Escanea, elige, pide directamente.',
    searchPlaceholder: 'Buscar plato, especialidad o bebida...',
    table: 'Mesa',
    callWaiter: 'Llamar al camarero',
    specialOfTheDay: '🌟 Especial del Día',
    dailySpecialTitle: '🌟 Especiales del Día — Lou Ame Tay ?',
    dailySpecialBadge: 'Recién Cocinado ⏱️',
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
    callWaiterSubtitle: 'Un camarero llegará a su mesa en breves instantes.',
    callReasonBill: 'Pedir la cuenta',
    callReasonWater: 'Jarra de agua / Hielo',
    callReasonHelp: 'Ayuda / Recomendación del menú',
    callReasonOther: 'Otra petición especial',
    orderSuccessTitle: '¡Pedido Enviado! 🍽️',
    orderSuccessSubtitle: 'La cocina ha recibido su pedido con éxito',
    orderStep1Title: '1. Recibido y notificado en cocina',
    orderStep1Desc: 'Aviso sonoro transmitido al cocinero con sus notas.',
    orderStep2Title: '2. En preparación',
    orderStep2Desc: 'Sus platos y bebidas se están preparando al momento.',
    orderStep3Title: '3. Servido en su mesa',
    orderStep3Desc: 'El camarero le llevará sus platos calientes directamente.',
    orderSummary: 'Resumen de platos',
    orderMore: 'Pedir más platos / bebidas',
    closeWindow: 'Cerrar esta ventana',
    comboFormulaTitle: '🍱 Menú Mediodía Téranga (Entrante + Plato + Bebida)',
    comboFormulaSubtitle: 'Componga su almuerzo completo a precio especial.',
  },
  IT: {
    menuLang: 'Lingua del Menu:',
    scanChooseOrder: 'Scansiona, scegli, ordina direttamente.',
    searchPlaceholder: 'Cerca un piatto, specialità o bevanda...',
    table: 'Tavolo',
    callWaiter: 'Chiama cameriere',
    specialOfTheDay: '🌟 Piatto del Giorno',
    dailySpecialTitle: '🌟 Piatti del Giorno — Lou Ame Tay ?',
    dailySpecialBadge: 'Appena Cotto ⏱️',
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
    comboFormulaTitle: '🍱 Menu Pranzo Téranga (Antipasto + Piatto + Bevanda)',
    comboFormulaSubtitle: 'Componi il tuo pranzo completo a prezzo speciale.',
  },
};

export function getUIText(lang: Language = 'FR') {
  return UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.FR;
}

export function translateCategoryName(catName: string, lang: Language = 'FR'): string {
  const cleanName = catName.replace(/^[^\s]+\s/, '').trim();
  const match = Object.entries(CATEGORY_TRANSLATIONS).find(([key]) => 
    catName.toLowerCase().includes(key.toLowerCase()) || cleanName.toLowerCase().includes(key.toLowerCase())
  );
  if (match) {
    return match[1][lang] || match[1].FR;
  }
  return catName;
}

export function translateAllergenLabel(label: string, lang: Language = 'FR'): string {
  const match = ALLERGEN_TRANSLATIONS[label] || ALLERGEN_TRANSLATIONS[label.toUpperCase()];
  if (match) {
    return match[lang] || match.FR;
  }
  return label;
}

export function getSynchronousDishTranslation(
  name: string,
  description: string = '',
  lang: Language = 'FR'
): { name: string; description: string } {
  if (lang === 'FR') {
    return { name, description };
  }

  const cleanName = name.toLowerCase();
  
  if (cleanName.includes('thieboudienne') || cleanName.includes('ceebu') || cleanName.includes('thiéboudienne')) {
    if (lang === 'WO') return { name: 'Ceebu Jën bu xonq', description: 'Ceebe ak jën bu neex, xeeñ diwtiir ak lejum yu tàng.' };
    if (lang === 'EN') return { name: 'Thiéboudienne (Senegalese Fish & Jollof Rice)', description: 'Braised fresh sea fish, fragrant spiced red broken rice, cassava, carrots, tamarind sauce.' };
    if (lang === 'ES') return { name: 'Thiéboudienne (Arroz con Pescado Senegalés)', description: 'Pescado fresco, arroz rojo aromatizado con verduras tradicionales y salsa tamarindo.' };
    if (lang === 'IT') return { name: 'Thiéboudienne (Riso Rosso con Pesce Senegalese)', description: 'Pesce fresco cotto a fuoco lento con riso rosso speziato, manioca e verdure.' };
  }

  if (cleanName.includes('yassa')) {
    if (lang === 'WO') return { name: 'Yaasa Ginaar / Yaasa Jën', description: 'Ginaar bu ñu lakk ak soble bu neex, limong ak mutaar.' };
    if (lang === 'EN') return { name: 'Yassa (Caramelized Onion & Lemon Mustard Sauce)', description: 'Grilled chicken or fish in sweet caramelized Dijon mustard & lime onion sauce with white rice.' };
    if (lang === 'ES') return { name: 'Yassa (Pollo/Pescado a la Mostaza y Limón)', description: 'Marinado con lima de Casamance y salsa espesa de cebollas caramelizadas con arroz blanco.' };
    if (lang === 'IT') return { name: 'Yassa (Pollo/Pesce con Cipolle al Limone e Senape)', description: 'Carne o pesce marinato al lime e senape con salsa di cipolle caramellate e riso bianco.' };
  }

  if (cleanName.includes('mafe') || cleanName.includes('mafé')) {
    if (lang === 'WO') return { name: 'Màfe Yàpp', description: 'Yàpp bu ñu toog ak gerte bu neex ak kaani.' };
    if (lang === 'EN') return { name: 'Mafé (Savory Peanut Butter Stew)', description: 'Tender beef slow-cooked in rich creamy roasted groundnut paste and root vegetables with white rice.' };
    if (lang === 'ES') return { name: 'Mafé (Guiso de Mantequilla de Cacahuete)', description: 'Ternera tierna guisada en crema de cacahuetes tostados y verduras con arroz.' };
    if (lang === 'IT') return { name: 'Mafé (Stufato di Manzo al Burro d\'Arachidi)', description: 'Tenero manzo cotto a fuoco lento in salsa cremosa di arachidi tostate e verdure.' };
  }

  if (cleanName.includes('dibi')) {
    if (lang === 'WO') return { name: 'Dibi Xar bu Lakk', description: 'Dibi xar bu ñu lakk ci kërëñ ak soble ak mutaar.' };
    if (lang === 'EN') return { name: 'Dibi (Charcoal Grilled Lamb)', description: 'Tender lamb cuts grilled over wood charcoal, served with sliced raw onions and spicy mustard.' };
    if (lang === 'ES') return { name: 'Dibi (Cordero a la Parrilla de Carbón)', description: 'Trozos de cordero marinados y asados al carbón con cebolla fresca y mostaza picante.' };
    if (lang === 'IT') return { name: 'Dibi (Agnello alla Brace)', description: 'Bocconcini di agnello marinati e cotti alla brace, serviti con cipolla e senape piccante.' };
  }

  if (cleanName.includes('pastels') || cleanName.includes('fataya')) {
    if (lang === 'WO') return { name: 'Pastels Jën ak Kaani', description: 'Pastels bu bees bu ñu xorom ak jën ak sos kaani.' };
    if (lang === 'EN') return { name: 'Fish Pastels (Crispy Stuffed Beignets)', description: 'Crispy golden pastries stuffed with spiced minced fish, served with spicy tomato relish.' };
    if (lang === 'ES') return { name: 'Pasteles de Pescado (Empanadillas Crujientes)', description: 'Empanadillas doradas rellenas de pescado desmenuzado con salsa de tomate picante.' };
    if (lang === 'IT') return { name: 'Pastels di Pesce (Fagottini Croccanti)', description: 'Fagottini dorati e croccanti ripieni di pesce speziato con salsa al pomodoro piccante.' };
  }

  if (cleanName.includes('bissap')) {
    if (lang === 'WO') return { name: 'Bissap bu Sedd Guy', description: 'Bissap bu xonq ak naana ak sukar.' };
    if (lang === 'EN') return { name: 'Hibiscus Flower Juice (Bissap)', description: 'Chilled refreshing infusion of Senegalese red hibiscus flowers, fresh mint and vanilla.' };
    if (lang === 'ES') return { name: 'Jugo de Flor de Hibisco (Bissap)', description: 'Bebida refrescante tradicional de flores de hibisco con menta fresca y vainilla.' };
    if (lang === 'IT') return { name: 'Succo di Fiori di Ibisco (Bissap)', description: 'Bevanda rinfrescante ai fiori di ibisco rosso senegalese con menta e vaniglia.' };
  }

  if (cleanName.includes('bouye') || cleanName.includes('buy')) {
    if (lang === 'WO') return { name: 'Naanu Buy', description: 'Buy bu ñu jaxase ak meew ak sukar.' };
    if (lang === 'EN') return { name: 'Baobab Fruit Nectar (Bouye)', description: 'Creamy sweet and tangy superfruit nectar crafted from pure wild baobab fruit pulp.' };
    if (lang === 'ES') return { name: 'Néctar de Fruta de Baobab (Bouye)', description: 'Bebida cremosa y dulce elaborada con pulpa pura de fruto de baobab silvestre.' };
    if (lang === 'IT') return { name: 'Nettare di Frutto di Baobab (Bouye)', description: 'Bevanda cremosa e vellutata a base di polpa pura di baobab selvatico.' };
  }

  if (cleanName.includes('thiof') || cleanName.includes('poisson braise') || cleanName.includes('poisson braisé')) {
    if (lang === 'WO') return { name: 'Cof bu Lakk', description: 'Cof bu bees bu ñu lakk ci kërëñ ak aloko ak sos kaani.' };
    if (lang === 'EN') return { name: 'Grilled White Grouper (Thiof)', description: 'Fresh Senegalese white grouper grilled over charcoal with plantains and spicy Kaani relish.' };
    if (lang === 'ES') return { name: 'Mero Blanco a la Parrilla (Thiof)', description: 'Mero blanco fresco a las brasas con plátano frito y salsa Kaani picante.' };
    if (lang === 'IT') return { name: 'Cernia Bianca alla Griglia (Thiof)', description: 'Cernia bianca fresca cotta alla brace con platano fritto e salsa Kaani.' };
  }

  if (cleanName.includes('thiacry') || cleanName.includes('thiakry') || cleanName.includes('degue')) {
    if (lang === 'WO') return { name: 'Caakri ak Meew', description: 'Dugub bu ñu toog ak sow mu neex ak sukar.' };
    if (lang === 'EN') return { name: 'Thiacry (Sweet Millet & Yogurt Dessert)', description: 'Steamed sweet millet couscous layered with creamy fermented sweetened yogurt and nutmeg.' };
    if (lang === 'ES') return { name: 'Thiacry (Postre de Mijo y Yogur Dulce)', description: 'Cuscús de mijo dulce al vapor con yogur cremoso especiado con nuez moscada.' };
    if (lang === 'IT') return { name: 'Thiacry (Dessert di Miglio e Yogurt Dolce)', description: 'Couscous di miglio dolce al vapore con yogurt cremoso aromatizzato alla noce moscata.' };
  }

  return { name, description };
}

export async function autoTranslateDish(name: string, description: string = ''): Promise<DishTranslationResult> {
  const syncFR = getSynchronousDishTranslation(name, description, 'FR');
  const syncWO = getSynchronousDishTranslation(name, description, 'WO');
  const syncEN = getSynchronousDishTranslation(name, description, 'EN');
  const syncES = getSynchronousDishTranslation(name, description, 'ES');
  const syncIT = getSynchronousDishTranslation(name, description, 'IT');

  return {
    FR: syncFR,
    WO: syncWO,
    EN: syncEN,
    ES: syncES,
    IT: syncIT,
  };
}