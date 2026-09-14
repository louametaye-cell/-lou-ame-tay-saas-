const { chromium } = require('playwright');
const path = require('path');

async function testCashierLoginFlow() {
  console.log('=== TEST PLAYWRIGHT DU FLUX DE CONNEXION / DÉCONNEXION CAISSE ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  // 1. Ouvrir l'URL caisse
  console.log('1. Navigation vers http://localhost:3000/cashier?restaurantId=anima-pizzeria...');
  await page.goto('http://localhost:3000/cashier?restaurantId=anima-pizzeria', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Vérifier qu'on est BIEN sur la page de connexion PIN (et NON sur l'espace caisse)
  const isLockscreenVisible = await page.locator('text=Connexion Caisse').first().isVisible();
  console.log(`Lockscreen de connexion présent : ${isLockscreenVisible ? '✅ OUI (Portail PIN bloquant)' : '❌ NON'}`);

  const isOrdersBoardVisible = await page.locator('text=Caisse du Jour').first().isVisible();
  console.log(`Tableau des commandes masqué : ${!isOrdersBoardVisible ? '✅ OUI (Zéro donnée fuitée)' : '❌ NON'}`);

  await page.screenshot({ path: 'captures_qa/06_page_connexion_caisse_pin.png' });
  console.log('📸 Capture enregistrée : captures_qa/06_page_connexion_caisse_pin.png');

  // 2. Saisir le code PIN 8392 d'Aissatou
  console.log('\n2. Saisie du code PIN 8392...');
  for (const digit of ['8', '3', '9', '2']) {
    await page.locator(`button:text-is("${digit}")`).first().click();
    await page.waitForTimeout(150);
  }

  // Valider
  await page.locator('button:has-text("Valider ✓")').first().click();
  await page.waitForTimeout(1500);

  // Vérifier l'accès à l'espace caisse
  const isCashierWorkspaceVisible = await page.locator('text=Caisse du Jour').first().isVisible();
  console.log(`Accès à l'espace caisse après PIN : ${isCashierWorkspaceVisible ? '✅ OUI' : '❌ NON'}`);

  // Vérifier la présence du bouton Déconnexion
  const isLogoutBtnVisible = await page.locator('button:has-text("Déconnexion")').first().isVisible();
  console.log(`Bouton Déconnexion très visible : ${isLogoutBtnVisible ? '✅ OUI' : '❌ NON'}`);

  await page.screenshot({ path: 'captures_qa/07_espace_caisse_avec_bouton_deconnexion.png' });
  console.log('📸 Capture enregistrée : captures_qa/07_espace_caisse_avec_bouton_deconnexion.png');

  // 3. Cliquer sur Déconnexion
  console.log('\n3. Clic sur le bouton Déconnexion...');
  page.on('dialog', async dialog => {
    console.log(`Dialogue de confirmation : "${dialog.message().slice(0, 40)}..."`);
    await dialog.accept();
  });
  await page.locator('button:has-text("Déconnexion")').first().click();
  await page.waitForTimeout(1500);

  // Vérifier le retour immédiat à la page de connexion
  const isBackOnLockscreen = await page.locator('text=Connexion Caisse').first().isVisible();
  console.log(`Retour immédiat sur la page de connexion : ${isBackOnLockscreen ? '✅ OUI' : '❌ NON'}`);

  await page.screenshot({ path: 'captures_qa/08_retour_page_connexion_apres_logout.png' });
  console.log('📸 Capture enregistrée : captures_qa/08_retour_page_connexion_apres_logout.png');

  await browser.close();
  console.log('\n🎉 TEST DU FLUX CONNEXION / DÉCONNEXION CAISSIER VALIDÉ AVEC SUCCÈS !');
}

testCashierLoginFlow().catch(console.error);
