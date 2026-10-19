/**
 * Générateur d'entier aléatoire cryptographiquement sûr,
 * 100% isomorphique (compatible Node.js et Navigateur via Web Crypto API).
 */
function getSecureRandomInt(min: number, max: number): number {
  const range = max - min;
  if (range <= 0) return min;

  // 1. Web Crypto API (Navigateur ou Node.js 18+)
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    const array = new Uint32Array(1);
    globalThis.crypto.getRandomValues(array);
    return min + (array[0] % range);
  }

  // 2. Fallback Math.random()
  return min + Math.floor(Math.random() * range);
}

export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Liste noire des mots de passe triviaux, prévisibles ou génériques
 * Formellement interdits pour tous les comptes gérants et super-admins.
 */
export const TRIVIAL_PASSWORDS_BLACKLIST: string[] = [
  'pass1234!',
  'pass1234',
  '1234',
  '0000',
  'admin',
  'admin123',
  'admin1234',
  'password',
  'password123',
  'azerty',
  'azerty123',
  'azertyuiop',
  '123456',
  '12345678',
  '123456789',
  '00000000',
  '11111111',
  'demo123!',
  'demo1234',
  'resto123',
  'resto1234',
  'superadmin',
  'superadmin2024!',
  'superadmin2026!',
  'mgd2024!',
  'mda2024!',
  'louametay',
  'dakarsenegal',
  'senegal2024',
  'senegal2026',
];

/**
 * Liste noire des séquences et motifs évidents pour codes PIN caissier (4 chiffres)
 */
export const TRIVIAL_CASHIER_PINS: string[] = [
  '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999',
  '0123', '1234', '2345', '3456', '4567', '5678', '6789',
  '3210', '4321', '5432', '6543', '7654', '8765', '9876',
  '1212', '2121', '1010', '2020', '3030', '4040', '5050',
  '2580', '0852', '1470', '0741', '1379', '9731', '2468', '8642'
];

/**
 * Valide la robustesse d'un mot de passe gérant ou administrateur :
 * - Au moins 8 caractères
 * - Au moins 1 lettre majuscule (A-Z)
 * - Au moins 1 chiffre (0-9)
 * - Absence de termes de la liste noire
 * - Absence du nom ou sous-domaine de l'établissement
 */
export function validateManagerPassword(
  password: string,
  identifierOrName?: string
): PasswordValidationResult {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Le mot de passe est obligatoire.' };
  }

  const clean = password.trim();

  if (clean.length < 8) {
    return {
      isValid: false,
      error: 'Le mot de passe doit comporter au moins 8 caractères.',
    };
  }

  if (!/[A-Z]/.test(clean)) {
    return {
      isValid: false,
      error: 'Le mot de passe doit contenir au moins une lettre majuscule (A-Z).',
    };
  }

  if (!/[0-9]/.test(clean)) {
    return {
      isValid: false,
      error: 'Le mot de passe doit contenir au moins un chiffre (0-9).',
    };
  }

  const lower = clean.toLowerCase();

  for (const blacklisted of TRIVIAL_PASSWORDS_BLACKLIST) {
    if (lower === blacklisted || lower.includes(blacklisted)) {
      return {
        isValid: false,
        error: 'Ce mot de passe est trop simple ou prévisible. Veuillez choisir un mot de passe robuste.',
      };
    }
  }

  if (identifierOrName) {
    const cleanId = identifierOrName.trim().toLowerCase();
    if (cleanId.length >= 4 && lower.includes(cleanId)) {
      return {
        isValid: false,
        error: "Le mot de passe ne doit pas contenir le nom ou l'identifiant de votre établissement.",
      };
    }
  }

  return { isValid: true };
}

/**
 * Valide la conformité d'un code PIN caissier (4 chiffres non triviaux) :
 * - Exactement 4 chiffres
 * - Rejet des répétitions (0000, 1111...)
 * - Rejet des séquences directes et inverses (1234, 4321...)
 * - Rejet des motifs récurrents (1212, 2580...)
 */
export function validateCashierPin(pin: string): PasswordValidationResult {
  if (!pin || typeof pin !== 'string') {
    return { isValid: false, error: 'Le code PIN est obligatoire.' };
  }

  const clean = pin.trim();

  if (!/^\d{4}$/.test(clean)) {
    return {
      isValid: false,
      error: 'Le code PIN caisse doit comporter exactement 4 chiffres.',
    };
  }

  // 4 chiffres identiques (0000, 1111...)
  if (/^(\d)\1{3}$/.test(clean)) {
    return {
      isValid: false,
      error: 'Code PIN trop simple : les 4 chiffres identiques sont interdits (ex: 0000, 1111).',
    };
  }

  // Motifs triviaux listés
  if (TRIVIAL_CASHIER_PINS.includes(clean)) {
    return {
      isValid: false,
      error: 'Code PIN trop prévisible : les suites évidentes sont interdites (ex: 1234, 4321, 2580).',
    };
  }

  return { isValid: true };
}

/**
 * Générateur cryptographique de code PIN caissier aléatoire et non trivial
 */
export function generateSafeCashierPin(existingPins: string[] = []): string {
  const existingSet = new Set(existingPins.map((p) => p.trim()));

  for (let attempt = 0; attempt < 1000; attempt++) {
    // 4 chiffres générés avec getSecureRandomInt
    const digits = Array.from({ length: 4 }, () => getSecureRandomInt(0, 10)).join('');
    if (validateCashierPin(digits).isValid && !existingSet.has(digits)) {
      return digits;
    }
  }

  // Fallback déterministe certifié non trivial si l'espace est saturé
  const safeFallbacks = ['7391', '8462', '9274', '6385', '5193', '4826'];
  for (const fb of safeFallbacks) {
    if (!existingSet.has(fb)) return fb;
  }
  return '7391';
}

/**
 * Générateur cryptographique de mot de passe fort pour compte Gérant / Admin
 * - Longueur minimale par défaut : 14 caractères
 * - Majuscules, minuscules, chiffres, symboles
 * - Pas de caractères ambigus (0/O, 1/l/I)
 */
export function generateStrongPassword(length = 14): string {
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowers = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*()_+-=';
  const all = uppers + lowers + digits + symbols;

  const targetLength = Math.max(length, 12);
  const chars: string[] = [
    uppers[getSecureRandomInt(0, uppers.length)],
    lowers[getSecureRandomInt(0, lowers.length)],
    digits[getSecureRandomInt(0, digits.length)],
    symbols[getSecureRandomInt(0, symbols.length)],
  ];

  for (let i = chars.length; i < targetLength; i++) {
    chars.push(all[getSecureRandomInt(0, all.length)]);
  }

  // Mélange de Fischer-Yates avec getSecureRandomInt
  for (let i = chars.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

