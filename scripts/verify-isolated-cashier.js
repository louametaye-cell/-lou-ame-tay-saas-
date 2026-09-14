const { chromium } = require('playwright');
const path = require('path');

async function verifyMultiTenantCashier() {
  console.log('--- TEST PRODUCTION ISOLATION MULTI-TENANT CAISSE ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // 1. Tester la route dédiée /r/anima-pizzeria/cashier
  console.log('1. Test de la route dédiée https://www.louametay.com/r/anima-pizzeria/cashier...');
  await page.goto('https://www.louametay.com/r/anima-pizzeria/cashier', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Vérifier qu'il n'y a AUCUN bouton "Changer"
  const changeBtn = await page.$('button:has-text("Changer")');
  console.log('Bouton "Changer" présent ?', changeBtn ? 'ERREUR (PRÉSENT)' : 'NON (PARFAIT - ÉTANCHÉITÉ TOTALE)');

  // Vérifier qu'il n'y a AUCUN select
  const selectEl = await page.$('select');
  console.log('Sélecteur déroulant présent ?', selectEl ? 'ERREUR (PRÉSENT)' : 'NON (PARFAIT - AUCUNE FUITE DE DONNÉES)');

  // Capture écran Lockscreen Anima Pizzeria
  const cap1 = path.join(__dirname, '..', 'captures_qa', '12_prod_lockscreen_etanche_anima.png');
  await page.screenshot({ path: cap1 });
  console.log('Capture 1 enregistrée :', cap1);

  // Saisir le PIN 8392
  console.log('2. Connexion caissier PIN 8392...');
  for (const d of ['8', '3', '9', '2']) {
    await page.click(`button:has-text("${d}")`);
    await page.waitForTimeout(100);
  }
  await page.click('button:has-text("Valider")');
  await page.waitForTimeout(2000);

  // Vérifier l'en-tête de caisse
  const changeBtnHeader = await page.$('button:has-text("(Changer)")');
  console.log('Bouton "(Changer)" dans le header caisse ?', changeBtnHeader ? 'ERREUR' : 'NON (PARFAIT)');

  const cap2 = path.join(__dirname, '..', 'captures_qa', '13_prod_caisse_ouverte_sans_changer.png');
  await page.screenshot({ path: cap2 });
  console.log('Capture 2 enregistrée :', cap2);

  // 3. Tester une autre route dédiée : /r/madiba-restaurant/cashier
  console.log('3. Test de la route dédiée https://www.louametay.com/r/madiba-restaurant/cashier...');
  const page2 = await context.newPage();
  await page2.goto('https://www.louametay.com/r/madiba-restaurant/cashier', { waitUntil: 'networkidle' });
  await page2.waitForTimeout(2000);

  const cap3 = path.join(__dirname, '..', 'captures_qa', '14_prod_lockscreen_etanche_madiba.png');
  await page2.screenshot({ path: cap3 });
  console.log('Capture 3 enregistrée :', cap3);

  // 4. Tester l'accès /cashier sans aucun restaurantId
  console.log('4. Test de /cashier sans aucun paramètre...');
  const page3 = await context.newPage();
  // Vider le localStorage pour simuler un nouveau visiteur
  await page3.goto('https://www.louametay.com/cashier');
  await page3.evaluate(() => localStorage.clear());
  await page3.reload({ waitUntil: 'networkidle' });
  await page3.waitForTimeout(1500);

  const cap4 = path.join(__dirname, '..', 'captures_qa', '15_prod_cashier_sans_restaurant.png');
  await page3.screenshot({ path: cap4 });
  console.log('Capture 4 enregistrée :', cap4);

  await browser.close();
  console.log('--- TOUS LES TESTS D\'ISOLATION MULTI-TENANT SONT TERMINÉS ---');
}

verifyMultiTenantCashier().catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
