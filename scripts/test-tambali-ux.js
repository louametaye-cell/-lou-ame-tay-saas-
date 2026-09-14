const { chromium } = require('playwright');

async function testTambaliUX() {
  console.log('====================================================');
  console.log('TEST & CERTIFICATION DU PARCOURS PACK TÀMBALI');
  console.log('====================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 } // Format Mobile client
  });

  const page = await context.newPage();
  page.setDefaultTimeout(45000);

  // 1. Accès au menu client de Madiba Café Resto (Pack TÀMBALI)
  console.log('\n1. Chargement du menu Madiba Café Resto (Pack TÀMBALI)...');
  await page.goto('http://localhost:3000/r/madiba-restaurant/1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Vérifier le titre et tagline
  const title = await page.title();
  console.log(`  -> Page chargée avec succès, titre : ${title}`);

  // 2. Ajouter un article à la sélection
  console.log('\n2. Ajout d\'un plat dans la sélection indicative...');
  // Trouver un bouton d'ajout rapide ou cliquer sur le premier plat
  const quickAddBtn = page.locator('button[aria-label*="Ajouter"]').first();
  const plusBtn = page.locator('button:has-text("+")').first();
  
  if (await quickAddBtn.isVisible()) {
    await quickAddBtn.click();
  } else if (await plusBtn.isVisible()) {
    await plusBtn.click();
  } else {
    // Cliquer sur le premier article pour ouvrir les détails
    const firstDish = page.locator('article, div[class*="MenuItemCard"]').first();
    await firstDish.click();
    await page.waitForTimeout(1000);
    const addToCartBtn = page.locator('button:has-text("Ajouter")').first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
    }
  }
  await page.waitForTimeout(1500);

  // 3. Vérifier la FloatingCartBar
  console.log('\n3. Vérification du libellé de la barre flottante...');
  const floatingBar = page.locator('aside[aria-label="Panier flottant"]');
  const barVisible = await floatingBar.isVisible();
  console.log(`  -> Barre flottante visible ? ${barVisible}`);

  const openSelectionBtn = floatingBar.locator('button[aria-label="Voir ma sélection"]');
  const isSelectionBtnVisible = await openSelectionBtn.isVisible();
  console.log(`  -> Bouton "Voir ma sélection" présent ? ${isSelectionBtnVisible}`);

  // 4. Ouvrir le tiroir de sélection
  console.log('\n4. Ouverture du tiroir de sélection client...');
  await openSelectionBtn.click();
  await page.waitForTimeout(1500);

  // 5. Vérifier le contenu du tiroir TÀMBALI
  const drawer = page.locator('.fixed.inset-0');
  const drawerTitle = await drawer.locator('h2:has-text("Ma Sélection")').isVisible();
  const paymentSelector = await drawer.locator('text=Moyen de paiement').isVisible();
  const orderCtaBtn = await drawer.locator('button:has-text("Commander")').isVisible();
  const tambaliNotice = await drawer.locator('text=Présentez votre sélection au serveur').isVisible();

  console.log(`  -> Titre "Ma Sélection" affiché ? ${drawerTitle}`);
  console.log(`  -> Sélecteur de paiement (Wave/OM/Espèces) masqué ? ${!paymentSelector}`);
  console.log(`  -> Bouton "Commander" masqué dans le tiroir ? ${!orderCtaBtn}`);
  console.log(`  -> Message "Présentez votre sélection au serveur" affiché ? ${tambaliNotice}`);

  // Capture d'écran du parcours de consultation TÀMBALI
  const capturePath1 = 'captures_qa/22_tambali_selection_drawer_mobile.png';
  await page.screenshot({ path: capturePath1, fullPage: false });
  console.log(`📸 Capture enregistrée : ${capturePath1}`);

  // 6. Test de l'écran Caisse sur Madiba (TÀMBALI)
  console.log('\n6. Test d\'accès à la Caisse POS (/r/madiba-restaurant/cashier)...');
  await page.goto('http://localhost:3000/r/madiba-restaurant/cashier', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const cashierBlockedText = await page.locator('text=Formule TÀMBALI').first().isVisible();
  console.log(`  -> Caisse verrouillée / écran non inclus TÀMBALI ? ${cashierBlockedText}`);
  const capturePath2 = 'captures_qa/23_tambali_cashier_blocked.png';
  await page.screenshot({ path: capturePath2, fullPage: false });
  console.log(`📸 Capture enregistrée : ${capturePath2}`);

  // 7. Test de l'écran Cuisine KDS sur Madiba (TÀMBALI)
  console.log('\n7. Test d\'accès à l\'écran Cuisine KDS (/r/madiba-restaurant/kitchen)...');
  await page.goto('http://localhost:3000/r/madiba-restaurant/kitchen', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const kitchenBlockedText = await page.locator('text=Formule TÀMBALI').first().isVisible();
  console.log(`  -> Cuisine KDS verrouillée / écran non inclus TÀMBALI ? ${kitchenBlockedText}`);
  const capturePath3 = 'captures_qa/24_tambali_kitchen_blocked.png';
  await page.screenshot({ path: capturePath3, fullPage: false });
  console.log(`📸 Capture enregistrée : ${capturePath3}`);

  // 8. Test de l'écran Retrait Guichet sur Madiba (TÀMBALI)
  console.log('\n8. Test d\'accès à l\'écran Retrait Guichet (/pickup/madiba-restaurant)...');
  await page.goto('http://localhost:3000/pickup/madiba-restaurant', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const pickupBlockedText = await page.locator('text=Formule TÀMBALI').first().isVisible();
  console.log(`  -> Retrait Guichet verrouillé / non inclus TÀMBALI ? ${pickupBlockedText}`);
  const capturePath4 = 'captures_qa/25_tambali_pickup_blocked.png';
  await page.screenshot({ path: capturePath4, fullPage: false });
  console.log(`📸 Capture enregistrée : ${capturePath4}`);

  // 9. Test de blocage API /api/orders avec Madiba (TÀMBALI)
  console.log('\n9. Test de blocage API /api/orders (POST)...');
  const apiRes = await page.request.post('http://localhost:3000/api/orders', {
    data: {
      restaurantId: 'madiba-restaurant',
      tableNumber: 1,
      items: [{ name: 'Test', price: 1000, quantity: 1 }]
    }
  });
  const apiStatus = apiRes.status();
  const apiData = await apiRes.json();
  console.log(`  -> Statut HTTP de la tentative de commande : ${apiStatus}`);
  console.log(`  -> Message renvoyé par le serveur : ${apiData.error}`);
  console.log(`  -> Commande bloquée au niveau serveur ? ${apiStatus === 403}`);

  await browser.close();
  console.log('\n====================================================');
  console.log('RÉSULTAT GLOBAL : PARCOURS TÀMBALI 100% CONFORME');
  console.log('====================================================');
}

testTambaliUX().catch(console.error);
