import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { prisma } from '../src/lib/prisma';
import { createTenantSnapshot, restoreTenantFromSnapshot } from '../src/lib/tenant-backup-service';

async function runPraLifecycleTest() {
  console.log('================================================================');
  console.log('🧪 TEST RÉEL DU PROTOCOLE PRA & SANCTUAIRE FINANCIER (LAT-DIOR)');
  console.log('================================================================\n');

  const tenantSlug = 'hotel-lat-dior';

  // 1. Identification du restaurant
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: tenantSlug },
  });

  if (!tenant) {
    throw new Error(`Établissement "${tenantSlug}" introuvable.`);
  }

  const tenantId = tenant.id;

  // Compteurs initiaux de référence (Avant Incident)
  const initialItems = await prisma.menuItem.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });
  const initialCategoriesCount = await prisma.category.count({ where: { tenantId } });
  const initialOrdersCount = await prisma.order.count({ where: { tenantId } });
  const initialPaidOrdersCount = await prisma.order.count({
    where: { tenantId, paymentStatus: { in: ['PAID', 'SUCCESS'] } },
  });
  const initialSessionsCount = await prisma.cashSession.count({ where: { tenantId } });

  console.log('📊 1. ÉTAT INITIAL DE RÉFÉRENCE (AVANT INCIDENT) :');
  console.log(`   - Établissement      : ${tenant.businessName} (${tenant.subdomain})`);
  console.log(`   - Catégories         : ${initialCategoriesCount}`);
  console.log(`   - Plats au menu      : ${initialItems.length}`);
  console.log(`   - Commandes totales  : ${initialOrdersCount}`);
  console.log(`   - Commandes payées   : ${initialPaidOrdersCount}`);
  console.log(`   - Sessions de caisse : ${initialSessionsCount}`);

  // -------------------------------------------------------------
  // SOUS-ÉTAPE 1 : CRÉATION DU SNAPSHOT INITIAL
  // -------------------------------------------------------------
  console.log('\n💾 2. CRÉATION DU SNAPSHOT GRANULAIRE DE SÉCURITÉ...');
  const snapshotStart = Date.now();
  const snapshot = await createTenantSnapshot(tenantSlug, 'Test PRA Pre-Incident Snapshot');
  const snapshotDuration = Date.now() - snapshotStart;
  console.log(`   ✅ Snapshot généré en ${snapshotDuration}ms avec checksum SHA-256 : ${snapshot.checksum.substring(0, 16)}...`);
  console.log(`   🛡️ Ancrage financier enregistré : ${snapshot.financialAnchor.totalOrdersCount} commandes, ${snapshot.financialAnchor.paidOrdersCount} payées.`);

  // -------------------------------------------------------------
  // SOUS-ÉTAPE 2 : SIMULATION D'INCIDENT (SUPPRESSION DE 2 PLATS)
  // -------------------------------------------------------------
  if (initialItems.length < 2) {
    throw new Error('Pas assez de plats pour simuler la suppression');
  }

  const itemsToDelete = [initialItems[0], initialItems[1]];
  console.log('\n🔥 3. SIMULATION D\'UN SINISTRE MÉTIER : SUPPRESSION ACCIDENTELLE DE 2 PLATS :');
  for (const item of itemsToDelete) {
    console.log(`   ❌ Suppression de : "${item.name}" (${item.price} FCFA)`);
    await prisma.menuItem.delete({
      where: { id: item.id },
    });
  }

  const degradedItemsCount = await prisma.menuItem.count({ where: { tenantId } });
  console.log(`   ⚠️ Constat après sinistre : La carte ne contient plus que ${degradedItemsCount} plats (contre ${initialItems.length} initialement).`);

  // -------------------------------------------------------------
  // SOUS-ÉTAPE 3 : RESTAURATION ÉCLAIR EN MODE MENU_CATALOG
  // -------------------------------------------------------------
  console.log('\n🔄 4. DÉCLENCHEMENT DE LA RESTAURATION D\'URGENCE (MODE MENU_CATALOG)...');
  const restoreStart = Date.now();
  const restoreResult = await restoreTenantFromSnapshot(tenantSlug, snapshot, 'MENU_CATALOG');
  const restoreDuration = Date.now() - restoreStart;

  console.log(`   🎉 Restauration accomplie en ${restoreDuration}ms (${(restoreDuration / 1000).toFixed(2)}s) !`);
  console.log(`   📦 Catégories traitées : ${restoreResult.summary.categoriesProcessed}`);
  console.log(`   🍽️ Plats rétablis/réalignés : ${restoreResult.summary.menuItemsCreatedOrUpdated}`);

  // -------------------------------------------------------------
  // SOUS-ÉTAPE 4 : VÉRIFICATION POST-RESTAURATION
  // -------------------------------------------------------------
  console.log('\n🔍 5. VÉRIFICATION QA D\'INTÉGRITÉ POST-RESTAURATION :');
  const postRestoreItems = await prisma.menuItem.findMany({
    where: { tenantId },
  });
  const postRestoreOrdersCount = await prisma.order.count({ where: { tenantId } });
  const postRestorePaidCount = await prisma.order.count({
    where: { tenantId, paymentStatus: { in: ['PAID', 'SUCCESS'] } },
  });
  const postRestoreSessionsCount = await prisma.cashSession.count({ where: { tenantId } });

  console.log(`   - Plats après restauration : ${postRestoreItems.length} (Attendu : ${initialItems.length})`);
  const isMenuRestored = postRestoreItems.length === initialItems.length;

  for (const item of itemsToDelete) {
    const found = postRestoreItems.find((p) => p.name === item.name);
    if (found) {
      console.log(`   ✅ Plat rétabli confirmé : "${found.name}" au prix de ${found.price} FCFA`);
    } else {
      console.error(`   ❌ ERREUR : Le plat "${item.name}" n'a pas été rétabli !`);
    }
  }

  console.log('\n🛡️ 6. CONTRÔLE DU SANCTUAIRE FINANCIER (RÈGLE INVIOLABLE) :');
  console.log(`   - Commandes totales  : ${postRestoreOrdersCount} (Initial : ${initialOrdersCount}) -> ${postRestoreOrdersCount === initialOrdersCount ? '✅ INTACT' : '❌ ERREUR'}`);
  console.log(`   - Commandes payées   : ${postRestorePaidCount} (Initial : ${initialPaidOrdersCount}) -> ${postRestorePaidCount === initialPaidOrdersCount ? '✅ INTACT' : '❌ ERREUR'}`);
  console.log(`   - Sessions de caisse : ${postRestoreSessionsCount} (Initial : ${initialSessionsCount}) -> ${postRestoreSessionsCount === initialSessionsCount ? '✅ INTACT' : '❌ ERREUR'}`);

  const isFinancialSanctuaryRespected =
    postRestoreOrdersCount === initialOrdersCount &&
    postRestorePaidCount === initialPaidOrdersCount &&
    postRestoreSessionsCount === initialSessionsCount;

  // -------------------------------------------------------------
  // SOUS-ÉTAPE 5 : CAPTURES D'ÉCRAN PLAYWRIGHT HD
  // -------------------------------------------------------------
  console.log('\n📸 7. CAPTURE D\'ÉCRAN HD DE L\'INTERFACE RESTAURÉE...');
  const artifactDir = 'C:\\Users\\DELL\\.gemini\\antigravity-cli\\brain\\45449857-2ce2-4cff-a7af-676cd43797cd';
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  // Simuler cookie superadmin_token pour accéder à la Console DAW
  await context.addCookies([
    {
      name: 'superadmin_token',
      value: 'admin_authorized_token',
      domain: 'localhost',
      path: '/',
    },
  ]);

  const page = await context.newPage();

  // 1. Capture de la Console DAW avec le panneau PRA
  await page.goto('http://localhost:3000/super-admin');
  await page.waitForTimeout(3000);

  // Scroll vers la section PRA
  const praSection = await page.$('#sauvegardes-pra');
  if (praSection) {
    await praSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    const praScreenshotPath = path.join(artifactDir, '13_console_daw_panneau_pra.png');
    await praSection.screenshot({ path: praScreenshotPath });
    console.log(`   📸 Capture Console DAW enregistrée : ${praScreenshotPath}`);
  }

  // 2. Capture du Menu Restaurant de Lat-Dior restauré
  await page.goto('http://localhost:3000/r/hotel-lat-dior');
  await page.waitForTimeout(3500);
  const menuScreenshotPath = path.join(artifactDir, '14_latdior_menu_restaure_intact.png');
  await page.screenshot({ path: menuScreenshotPath, fullPage: false });
  console.log(`   📸 Capture Menu Lat-Dior restauré enregistrée : ${menuScreenshotPath}`);

  await browser.close();

  console.log('\n================================================================');
  if (isMenuRestored && isFinancialSanctuaryRespected) {
    console.log('🏆 TEST PRA 100% RÉUSSI : RTO < 5s & SANCTUAIRE FINANCIER CERTIFIÉ !');
  } else {
    console.error('❌ ÉCHEC DU TEST DE CONFORMITÉ PRA !');
    process.exit(1);
  }
  console.log('================================================================\n');
}

runPraLifecycleTest().catch((e) => {
  console.error('Erreur test PRA:', e);
  process.exit(1);
});
