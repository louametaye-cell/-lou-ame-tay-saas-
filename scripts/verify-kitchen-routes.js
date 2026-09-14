const { chromium } = require('playwright');
const path = require('path');

async function testKitchenRoutes() {
  console.log('--- TEST PRODUCTION ÉCRAN CUISINE KDS MULTI-TENANT ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });

  // 1. Tester /r/anima-pizzeria/kitchen
  console.log('1. Test de https://www.louametay.com/r/anima-pizzeria/kitchen...');
  const page1 = await context.newPage();
  await page1.goto('https://www.louametay.com/r/anima-pizzeria/kitchen', { waitUntil: 'networkidle' });
  await page1.waitForTimeout(2000);

  const cap1 = path.join(__dirname, '..', 'captures_qa', '16_prod_kds_cuisine_anima.png');
  await page1.screenshot({ path: cap1 });
  console.log('Capture 1 enregistrée :', cap1);

  // 2. Tester /r/madiba-restaurant/kitchen
  console.log('2. Test de https://www.louametay.com/r/madiba-restaurant/kitchen...');
  const page2 = await context.newPage();
  await page2.goto('https://www.louametay.com/r/madiba-restaurant/kitchen', { waitUntil: 'networkidle' });
  await page2.waitForTimeout(2000);

  const cap2 = path.join(__dirname, '..', 'captures_qa', '17_prod_kds_cuisine_madiba.png');
  await page2.screenshot({ path: cap2 });
  console.log('Capture 2 enregistrée :', cap2);

  // 3. Tester /kitchen sans paramètre (visiteur anonyme)
  console.log('3. Test de https://www.louametay.com/kitchen sans paramètre...');
  const page3 = await context.newPage();
  await page3.goto('https://www.louametay.com/kitchen');
  await page3.evaluate(() => localStorage.clear());
  await page3.reload({ waitUntil: 'networkidle' });
  await page3.waitForTimeout(1500);

  const cap3 = path.join(__dirname, '..', 'captures_qa', '18_prod_kitchen_sans_restaurant.png');
  await page3.screenshot({ path: cap3 });
  console.log('Capture 3 enregistrée :', cap3);

  await browser.close();
  console.log('--- TEST PRODUCTION CUISINE TERMINÉ AVEC SUCCÈS ---');
}

testKitchenRoutes().catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
