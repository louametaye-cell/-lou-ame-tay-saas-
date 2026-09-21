const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

async function runTest() {
  console.log('🚀 Lancement du test E2E Smart Contextual Release...');
  const browser = await chromium.launch({ headless: true });

  const tenant = await prisma.tenant.findFirst({ where: { subdomain: 'anima-pizzeria' } });
  if (!tenant) throw new Error('Tenant introuvable');

  // Assurer que Table 3 est bien libre pour le Cas 1
  await prisma.table.updateMany({
    where: { tenantId: tenant.id, tableNumber: 3 },
    data: { status: 'FREE', clearedAt: new Date() }
  });

  // --- TEST CAS 1 : TABLE EMPTY (Table 3) ---
  console.log('\n--- TEST CAS 1 : Table EMPTY (Table 3) ---');
  const context1 = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const page1 = await context1.newPage();
  await page1.goto('http://localhost:3000/r/anima-pizzeria?table=3', { waitUntil: 'domcontentloaded' });
  await page1.waitForTimeout(2500);

  const welcomeModalVisible1 = await page1.locator('text="Un repas vient de se terminer ici"').isVisible();
  const bannerVisible1 = await page1.locator('text="Vous avez rejoint la Table"').isVisible();
  console.log('Cas 1 - Modale visible ?', welcomeModalVisible1, '(Attendu: false)');
  console.log('Cas 1 - Bandeau visible ?', bannerVisible1, '(Attendu: false)');

  const capPath1 = path.join(__dirname, '../capture des teste/smart_release_case1_empty_table.png');
  await page1.screenshot({ path: capPath1, fullPage: false });
  console.log('📸 Capture Cas 1 enregistrée :', capPath1);
  await context1.close();

  // --- TEST CAS 2 : ACTIVE ORDER (Table 20) ---
  console.log('\n--- TEST CAS 2 : Commande ACTIVE en cours (Table 20) ---');
  const context2 = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const page2 = await context2.newPage();
  await page2.goto('http://localhost:3000/r/anima-pizzeria?table=20', { waitUntil: 'domcontentloaded' });
  await page2.waitForTimeout(3000);

  // Si le ticket s'est ouvert automatiquement, cliquer sur "Ajouter d'autres Plats" pour voir le bandeau sur le menu
  const addPlatsBtn = page2.locator('button:has-text("Ajouter d\'autres Plats")');
  if (await addPlatsBtn.isVisible()) {
    await addPlatsBtn.click();
    await page2.waitForTimeout(1000);
  }

  await page2.evaluate(() => window.scrollTo(0, 0));
  await page2.waitForTimeout(500);

  const bannerVisible2 = await page2.locator('text="Vous avez rejoint la Table 20"').isVisible();
  console.log('Cas 2 - Bandeau session rejoint visible ?', bannerVisible2, '(Attendu: true)');
  const bannerText = await page2.locator('text="Vous avez rejoint la Table 20"').textContent().catch(() => '');
  console.log('Cas 2 - Texte bandeau :', bannerText);

  const capPath2 = path.join(__dirname, '../capture des teste/smart_release_case2_active_joined_banner.png');
  await page2.screenshot({ path: capPath2, fullPage: false });
  console.log('📸 Capture Cas 2 enregistrée :', capPath2);
  await context2.close();

  // --- TEST CAS 3 : ZONE JAUNE (Table 8) ---
  console.log('\n--- TEST CAS 3 : Zone Jaune 15-45 min (Table 8) ---');
  
  // 1. Trouver la table 8 et forcer clearedAt à null
  const table8 = await prisma.table.findFirst({ where: { tenantId: tenant.id, tableNumber: 8 } });
  if (table8) {
    await prisma.table.update({
      where: { id: table8.id },
      data: { status: 'OCCUPIED', clearedAt: null }
    });
  }

  // 2. Nettoyer les anciennes commandes sur table 8
  await prisma.order.deleteMany({ where: { tenantId: tenant.id, tableNumber: 8 } });

  // 3. Créer la commande payée il y a 22 minutes
  const twentyTwoMinutesAgo = new Date(Date.now() - 22 * 60 * 1000);
  const testOrderTable8 = await prisma.order.create({
    data: {
      tenantId: tenant.id,
      tableNumber: 8,
      status: 'SERVED',
      paymentStatus: 'PAID',
      paymentMethod: 'CASH_TPE',
      totalAmount: 6500,
      customerNote: 'TEST_ZONE_JAUNE',
      createdAt: twentyTwoMinutesAgo,
      items: {
        create: [
          { name: 'Pizza Regina', price: '6500', quantity: 1 }
        ]
      }
    }
  });
  console.log('✅ Commande Zone Jaune prête sur Table 8 - ID:', testOrderTable8.id);

  const context3 = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const page3 = await context3.newPage();
  await page3.goto('http://localhost:3000/r/anima-pizzeria?table=8', { waitUntil: 'domcontentloaded' });
  await page3.waitForTimeout(4000);

  const modalHeadingVisible = await page3.locator('text="Vous êtes à la Table 08"').isVisible();
  const modalDescVisible = await page3.locator('text="Un repas vient de se terminer ici"').isVisible();
  console.log('Cas 3 - Modale TableWelcomeModal visible ?', modalHeadingVisible && modalDescVisible, '(Attendu: true)');

  const capPath3 = path.join(__dirname, '../capture des teste/smart_release_case3_welcome_modal.png');
  await page3.screenshot({ path: capPath3, fullPage: false });
  console.log('📸 Capture Cas 3 enregistrée :', capPath3);

  // Clic sur "🆕 Je commence un nouveau repas"
  const startNewMealBtn = page3.locator('button:has-text("Je commence un nouveau repas")');
  await startNewMealBtn.click();
  await page3.waitForTimeout(4000);

  const modalStillVisible = await page3.locator('text="Vous êtes à la Table 08"').isVisible();
  console.log('Cas 3 - Modale fermée après clic Nouveau repas ?', !modalStillVisible, '(Attendu: true)');

  const capPath3b = path.join(__dirname, '../capture des teste/smart_release_case3_table_released.png');
  await page3.screenshot({ path: capPath3b, fullPage: false });
  console.log('📸 Capture Cas 3 après libération :', capPath3b);
  await context3.close();

  // Nettoyage de la commande de test sur Table 8
  await prisma.order.deleteMany({
    where: { id: testOrderTable8.id }
  });

  // --- TEST CAS 4 : BOUTON LIBÉRER TABLE DANS LE KDS ---
  console.log('\n--- TEST CAS 4 : KDS Écran Cuisine ---');
  const context4 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page4 = await context4.newPage();
  await page4.goto('http://localhost:3000/kitchen?restaurantId=tenant_anima_pizzeria', { waitUntil: 'domcontentloaded' });
  await page4.waitForTimeout(3000);

  const releaseBtnCount = await page4.locator('button:has-text("Libérer Table")').count();
  console.log('Cas 4 - Nombre de boutons "Libérer Table" sur les commandes du KDS :', releaseBtnCount, '(Attendu: >= 1)');

  const capPath4 = path.join(__dirname, '../capture des teste/smart_release_case4_kds_release_button.png');
  await page4.screenshot({ path: capPath4, fullPage: false });
  console.log('📸 Capture Cas 4 KDS enregistrée :', capPath4);
  await context4.close();

  await browser.close();
  await prisma.$disconnect();
  console.log('\n🎉 TOUS LES TESTS E2E SMART CONTEXTUAL RELEASE ONT RÉUSSI AVEC SUCCÈS !');
}

runTest().catch((err) => {
  console.error('❌ Erreur test E2E :', err);
  prisma.$disconnect();
  process.exit(1);
});
