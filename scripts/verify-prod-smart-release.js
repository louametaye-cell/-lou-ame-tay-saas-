const { chromium } = require('playwright');
const path = require('path');

async function testProd() {
  console.log('🚀 Test de production en direct sur https://www.louametay.com...');
  const browser = await chromium.launch({ headless: true });
  
  // Nouveau contexte vierge (smartphone)
  const context = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const page = await context.newPage();

  console.log('Navigation vers Table 20 en production...');
  await page.goto('https://www.louametay.com/r/anima-pizzeria?table=20', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Capture étape 1 : Ticket ouvert ou bandeau
  const cap1 = path.join(__dirname, '../capture des teste/prod_smart_release_step1.png');
  await page.screenshot({ path: cap1, fullPage: false });
  console.log('📸 Capture 1 enregistrée:', cap1);

  // Si le ticket est ouvert, fermer ou cliquer sur Ajouter d'autres Plats pour voir le bandeau
  const addPlatsBtn = page.locator('button:has-text("Ajouter d\'autres Plats")');
  if (await addPlatsBtn.isVisible()) {
    console.log('Ticket ouvert détecté, clic sur "Ajouter d\'autres Plats"...');
    await addPlatsBtn.click();
    await page.waitForTimeout(1500);
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  const bannerVisible = await page.locator('text="Vous avez rejoint la Table 20"').isVisible();
  console.log('Bandeau session rejoint visible en production ?', bannerVisible);

  const cap2 = path.join(__dirname, '../capture des teste/prod_smart_release_step2_banner.png');
  await page.screenshot({ path: cap2, fullPage: false });
  console.log('📸 Capture 2 enregistrée:', cap2);

  // Test de la Table 3 en production (EMPTY)
  const contextEmpty = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const pageEmpty = await contextEmpty.newPage();
  await pageEmpty.goto('https://www.louametay.com/r/anima-pizzeria?table=3', { waitUntil: 'domcontentloaded' });
  await pageEmpty.waitForTimeout(3000);

  const welcomeModalVisible = await pageEmpty.locator('text="Un repas vient de se terminer ici"').isVisible();
  const bannerEmptyVisible = await pageEmpty.locator('text="Vous avez rejoint la Table"').isVisible();
  console.log('Table 3 prod - Modale visible ?', welcomeModalVisible, '(Attendu: false)');
  console.log('Table 3 prod - Bandeau visible ?', bannerEmptyVisible, '(Attendu: false)');

  const cap3 = path.join(__dirname, '../capture des teste/prod_smart_release_step3_empty_table3.png');
  await pageEmpty.screenshot({ path: cap3, fullPage: false });
  console.log('📸 Capture 3 Table 3 enregistrée:', cap3);

  await context.close();
  await contextEmpty.close();
  await browser.close();
  console.log('🎉 VÉRIFICATION EN PRODUCTION SUR LOUAMETAY.COM TERMINÉE AVEC SUCCÈS !');
}

testProd().catch(console.error);
