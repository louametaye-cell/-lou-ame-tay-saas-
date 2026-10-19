import path from 'path';
import fs from 'fs';
import { createTenantSnapshot } from '../src/lib/tenant-backup-service';

async function main() {
  const args = process.argv.slice(2);
  let tenantIdentifier = '';
  let reason = 'CLI Developer Backup';
  let outFile = '';

  for (const arg of args) {
    if (arg.startsWith('--tenant=')) {
      tenantIdentifier = arg.replace('--tenant=', '').trim();
    } else if (arg.startsWith('--reason=')) {
      reason = arg.replace('--reason=', '').trim();
    } else if (arg.startsWith('--out=')) {
      outFile = arg.replace('--out=', '').trim();
    }
  }

  if (!tenantIdentifier) {
    console.error('❌ Erreur : L\'argument --tenant=<id_ou_slug> est obligatoire.');
    console.log('Exemple: npm run tenant:backup -- --tenant=hotel-lat-dior');
    process.exit(1);
  }

  console.log(`\n🛡️ [LOU AME TAY PRA] Démarrage de la sauvegarde granulaire pour: "${tenantIdentifier}"...`);
  const startTime = Date.now();

  try {
    const snapshot = await createTenantSnapshot(tenantIdentifier, reason);
    const durationMs = Date.now() - startTime;

    console.log(`\n✅ SNAPSHOT CRÉÉ AVEC SUCCÈS en ${durationMs}ms !`);
    console.log('---------------------------------------------------------');
    console.log(`📍 Établissement      : ${snapshot.businessName} (${snapshot.subdomain})`);
    console.log(`🆔 Tenant ID          : ${snapshot.tenantId}`);
    console.log(`⏱️ Horodatage         : ${snapshot.exportedAt}`);
    console.log(`📦 Catégories         : ${snapshot.catalog.categories.length}`);
    console.log(`🍽️ Plats & Articles   : ${snapshot.catalog.menuItems.length}`);
    console.log(`🪑 Tables             : ${snapshot.spaces?.tables.length || 0}`);
    console.log(`👨‍🍳 Serveurs & Staff  : ${snapshot.staff?.waiters.length || 0} serveurs, ${snapshot.staff?.cashiers.length || 0} caissiers`);
    console.log('---------------------------------------------------------');
    console.log('🛡️ ANCRAGE FINANCIER INVIOLABLE (SANCTUAIRE FINANCIER) :');
    console.log(`   - Commandes totales : ${snapshot.financialAnchor.totalOrdersCount}`);
    console.log(`   - Commandes payées  : ${snapshot.financialAnchor.paidOrdersCount}`);
    console.log(`   - Sessions caisse   : ${snapshot.financialAnchor.cashSessionsCount}`);
    console.log(`   - Empreinte SHA-256 : ${snapshot.financialAnchor.hashAnchor.substring(0, 16)}...`);
    console.log('---------------------------------------------------------');

    if (outFile) {
      fs.writeFileSync(outFile, JSON.stringify(snapshot, null, 2), 'utf-8');
      console.log(`💾 Fichier exporté vers : ${outFile}`);
    } else {
      const defaultPath = path.join(process.cwd(), 'backups', 'tenants', snapshot.subdomain, `latest.json`);
      fs.mkdirSync(path.dirname(defaultPath), { recursive: true });
      fs.writeFileSync(defaultPath, JSON.stringify(snapshot, null, 2), 'utf-8');
      console.log(`💾 Fichier miroir 'latest.json' mis à jour : ${defaultPath}`);
    }
  } catch (error: any) {
    console.error(`\n❌ Échec de la sauvegarde :`, error.message);
    process.exit(1);
  }
}

main().catch(console.error);
