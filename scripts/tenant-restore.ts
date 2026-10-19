import fs from 'fs';
import path from 'path';
import {
  restoreTenantFromSnapshot,
  listLocalSnapshots,
  RestoreMode,
  TenantSnapshot,
} from '../src/lib/tenant-backup-service';

async function main() {
  const args = process.argv.slice(2);
  let tenantIdentifier = '';
  let filePath = '';
  let mode: RestoreMode = 'MENU_CATALOG';

  for (const arg of args) {
    if (arg.startsWith('--tenant=')) {
      tenantIdentifier = arg.replace('--tenant=', '').trim();
    } else if (arg.startsWith('--file=')) {
      filePath = arg.replace('--file=', '').trim();
    } else if (arg.startsWith('--mode=')) {
      const rawMode = arg.replace('--mode=', '').trim().toUpperCase();
      if (rawMode === 'FULL_CONFIG' || rawMode === 'FULL') {
        mode = 'FULL_CONFIG';
      } else {
        mode = 'MENU_CATALOG';
      }
    }
  }

  if (!tenantIdentifier) {
    console.error('❌ Erreur : L\'argument --tenant=<id_ou_slug> est obligatoire.');
    console.log('Exemple: npm run tenant:restore -- --tenant=hotel-lat-dior --mode=menu_catalog');
    process.exit(1);
  }

  // Résolution du fichier de snapshot
  if (!filePath) {
    const defaultLatest = path.join(process.cwd(), 'backups', 'tenants', tenantIdentifier, 'latest.json');
    if (fs.existsSync(defaultLatest)) {
      filePath = defaultLatest;
    } else {
      const localSnapshots = listLocalSnapshots(tenantIdentifier);
      if (localSnapshots.length > 0) {
        filePath = localSnapshots[0].path;
      }
    }
  }

  if (!filePath || !fs.existsSync(filePath)) {
    console.error(`❌ Erreur : Aucun fichier de snapshot valide trouvé pour "${tenantIdentifier}".`);
    console.log('Veuillez spécifier le chemin exact avec --file=path/to/snapshot.json');
    process.exit(1);
  }

  console.log(`\n🔄 [LOU AME TAY PRA] Démarrage de la restauration d'urgence :`);
  console.log(`📍 Établissement : "${tenantIdentifier}"`);
  console.log(`📂 Fichier Source : ${filePath}`);
  console.log(`⚙️ Mode          : ${mode} (${mode === 'MENU_CATALOG' ? 'Carte & Plats Seuls' : 'Configuration Intégrale'})`);
  console.log(`🛡️ Règle Or     : Sanctuaire Financier Inviolable (ZÉRO altération des flux d'argent)`);

  const raw = fs.readFileSync(filePath, 'utf-8');
  const snapshot: TenantSnapshot = JSON.parse(raw);

  const startTime = Date.now();
  try {
    const result = await restoreTenantFromSnapshot(tenantIdentifier, snapshot, mode);
    const durationMs = Date.now() - startTime;

    console.log(`\n🎉 RESTAURATION ACCOMPLIE AVEC SUCCÈS en ${durationMs}ms ! (${(durationMs / 1000).toFixed(2)}s)`);
    console.log('---------------------------------------------------------');
    console.log(`📍 Établissement restauré : ${result.subdomain}`);
    console.log(`⚙️ Mode appliqué          : ${result.mode}`);
    console.log(`📦 Catégories traitées    : ${result.summary.categoriesProcessed}`);
    console.log(`🍽️ Plats réalignés/créés  : ${result.summary.menuItemsCreatedOrUpdated}`);
    if (result.summary.tablesProcessed) {
      console.log(`🪑 Tables réalignées      : ${result.summary.tablesProcessed}`);
    }
    console.log('---------------------------------------------------------');
    console.log('🛡️ CERTIFICATION DU SANCTUAIRE FINANCIER :');
    console.log(`   - Conformité vérifiée : ${result.summary.financialSanctuaryVerified ? '✅ 100% CONFORME' : '❌ ANOMALIE'}`);
    console.log(`   - Commandes préservées: ${result.summary.preservedOrdersCount} (Payées : ${result.summary.preservedPaidOrdersCount})`);
    console.log(`   - Sessions caisse     : ${result.summary.preservedSessionsCount}`);
    console.log('---------------------------------------------------------');
    console.log('🚀 Les données ont été rétablies sans aucun impact financier collatéral.\n');
  } catch (error: any) {
    console.error(`\n🚨 ÉCHEC DE LA RESTAURATION (Rollback Automatique) :`, error.message);
    process.exit(1);
  }
}

main().catch(console.error);
