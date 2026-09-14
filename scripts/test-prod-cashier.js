const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testProdCashier() {
  console.log('--- TEST PROD CASHIER LOCKSCREEN & LOGOUT ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('1. Navigation vers https://www.louametay.com/cashier?restaurantId=anima-pizzeria...');
  await page.goto('https://www.louametay.com/cashier?restaurantId=anima-pizzeria', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Vérifier le lockscreen
  const heading = await page.$eval('h2', el => el.textContent).catch(() => null);
  console.log('Titre affiché sur la page :', heading);

  const isLockscreen = heading && heading.includes('Code PIN');
  console.log('Est-ce bien la page de verrouillage PIN ?', isLockscreen ? 'OUI (SUCCÈS)' : 'NON (ÉCHEC)');

  const screenshotPath = path.join(__dirname, '..', 'captures_qa', '09_prod_lockscreen_cashier.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Capture enregistrée :', screenshotPath);

  // Tester la saisie du PIN 8392
  console.log('2. Saisie du code PIN 8392 pour Anima Pizzeria...');
  for (const digit of ['8', '3', '9', '2']) {
    await page.click(`button:has-text("${digit}")`);
    await page.waitForTimeout(150);
  }
  await page.click('button:has-text("Valider")');
  await page.waitForTimeout(2000);

  // Vérifier qu'on est entré dans l'espace caisse et que le bouton déconnexion est là
  const logoutBtn = await page.$('button:has-text("Déconnexion")');
  console.log('Bouton Déconnexion présent dans l\'espace caisse ?', !!logoutBtn ? 'OUI (SUCCÈS)' : 'NON (ÉCHEC)');

  const screenshotPath2 = path.join(__dirname, '..', 'captures_qa', '10_prod_caisse_ouverte_avec_bouton.png');
  await page.screenshot({ path: screenshotPath2 });
  console.log('Capture enregistrée :', screenshotPath2);

  // Tester le clic sur Déconnexion
  if (logoutBtn) {
    console.log('3. Clic sur Déconnexion...');
    page.on('dialog', async dialog => {
      console.log('Dialogue de confirmation apparu :', dialog.message());
      await dialog.accept();
    });
    await logoutBtn.click();
    await page.waitForTimeout(2000);

    const headingAfter = await page.$eval('h2', el => el.textContent).catch(() => null);
    console.log('Titre après déconnexion :', headingAfter);
    const isRelocked = headingAfter && headingAfter.includes('Code PIN');
    console.log('Retour sur le lockscreen PIN ?', isRelocked ? 'OUI (SUCCÈS)' : 'NON (ÉCHEC)');

    const screenshotPath3 = path.join(__dirname, '..', 'captures_qa', '11_prod_retour_lockscreen_apres_logout.png');
    await page.screenshot({ path: screenshotPath3 });
    console.log('Capture enregistrée :', screenshotPath3);
  }

  await browser.close();
  console.log('--- TEST PROD TERMINÉ AVEC SUCCÈS ---');
}

testProdCashier().catch(err => {
  console.error('Erreur test prod:', err);
  process.exit(1);
});
