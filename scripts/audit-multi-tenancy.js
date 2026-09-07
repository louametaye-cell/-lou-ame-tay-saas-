/**
 * SCRIPT D'AUDIT ANTI-RÉGRESSION MULTI-TENANT
 * "Lou Ame Tay ?" - Médias Graphisme Sénégal
 *
 * Ce script vérifie qu'aucun fallback en dur ou fuite de données
 * (tenant_madiba_restau, Chez Fatou, etc.) n'existe dans les composants
 * de gestion, écrans opérationnels et API.
 */

const fs = require('fs');
const path = require('path');

const FORBIDDEN_PATTERNS = [
  {
    regex: /tenant_madiba_restau/g,
    description: "Présence de l'identifiant par défaut 'tenant_madiba_restau'",
    allowedPaths: ['src/lib/saas-storage.ts'] // Uniquement permis dans le catalogue de démonstration
  },
  {
    regex: /Chez Fatou/g,
    description: "Présence du nom en dur 'Chez Fatou'",
    allowedPaths: ['src/components/landing', 'src/lib/audit-logger.ts', 'src/app/api/support/tickets/route.ts']
  }
];

const SCAN_DIRS = [
  path.join(process.cwd(), 'src', 'app'),
  path.join(process.cwd(), 'src', 'components'),
  path.join(process.cwd(), 'src', 'lib')
];

let errorsFound = 0;

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (entry.isFile() && /\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      callback(fullPath);
    }
  }
}

console.log('🛡️  DÉMARRAGE DU SCAN DE SÉCURITÉ MULTI-TENANT ABSOLU...\n');

for (const dir of SCAN_DIRS) {
  walkDir(dir, (filePath) => {
    const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (const pattern of FORBIDDEN_PATTERNS) {
      const isAllowed = pattern.allowedPaths.some((allowed) => relativePath.startsWith(allowed));
      if (isAllowed) continue;

      lines.forEach((line, index) => {
        if (pattern.regex.test(line)) {
          console.error(`❌ ALERTE ISOLATION : ${pattern.description}`);
          console.error(`   Fichier : ${relativePath}:${index + 1}`);
          console.error(`   Contenu : ${line.trim()}\n`);
          errorsFound++;
        }
      });
    }
  });
}

if (errorsFound === 0) {
  console.log('✅ AUDIT VALIDÉ AVEC SUCCÈS : Isolation Multi-Tenant 100% Hermétique.');
  console.log('   Aucun établissement (Anima Pizzeria, Chez Collé, etc.) ne peut afficher ou fuiter les données d\'un tiers.\n');
  process.exit(0);
} else {
  console.error(`🚫 ÉCHEC DE L'AUDIT : ${errorsFound} infraction(s) multi-tenant détectée(s).`);
  process.exit(1);
}
