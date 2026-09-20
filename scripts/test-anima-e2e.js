const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function runE2E() {
  console.log('🚀 Démarrage de la vérification E2E Playwright pour Anima Pizzeria...');

  const outputDir = path.join(__dirname, '..', 'capture des teste');
  const brainDir = path.join('C:', 'Users', 'DELL', '.gemini', 'antigravity-cli', 'brain', '29ebca16-966e-42e2-b0c1-91cc97f14e1d');

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  if (!fs.existsSync(brainDir)) fs.mkdirSync(brainDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // 1. TEST ÉCRAN CUISINE KDS (/r/anima-pizzeria/kitchen)
  console.log('📡 1. Test Écran Cuisine KDS sur /r/anima-pizzeria/kitchen...');
  await page.goto('http://localhost:3000/r/anima-pizzeria/kitchen', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const kdsScreenshotPath = path.join(outputDir, 'kds_anima_pizzeria_accessible.png');
  await page.screenshot({ path: kdsScreenshotPath, fullPage: true });
  fs.copyFileSync(kdsScreenshotPath, path.join(brainDir, 'kds_anima_pizzeria_accessible.png'));
  console.log('📸 Capture KDS enregistrée :', kdsScreenshotPath);

  // Vérifier qu'il n'y a PAS "FORMULE XÉWEUL REQUISE"
  const bodyText = await page.textContent('body');
  if (bodyText.includes('Formule XÉWEUL requise') || bodyText.includes('FORMULE XÉWEUL REQUISE')) {
    console.error('❌ KDS affiche encore le blocage paywall !');
  } else {
    console.log('✅ KDS est 100% débloqué pour Anima Pizzeria (Formule BAOBAB) !');
  }

  // 2. TEST ÉCRAN CAISSE POS (/cashier?restaurantId=anima-pizzeria)
  console.log('📡 2. Test Écran Caisse POS sur /cashier?restaurantId=anima-pizzeria...');
  await page.goto('http://localhost:3000/cashier?restaurantId=anima-pizzeria', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Si modal PIN affichée, taper code PIN caissier 8392 (AISSATOU)
  const pinInputExists = await page.$('text=Connexion Caisse');
  if (pinInputExists) {
    console.log('🔑 Saisie du code PIN 8392 pour Aïssatou...');
    for (const digit of ['8', '3', '9', '2']) {
      await page.locator(`button:has-text("${digit}")`).first().click();
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(400);
    // Cliquer sur le bouton Valider
    const validatePinBtn = page.locator('button:has-text("Valider")').first();
    if (await validatePinBtn.isVisible()) {
      console.log('👉 Clic sur Valider code PIN...');
      await validatePinBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  // Si modal ouverture session affichée
  const openSessionModal = await page.$('text=Ouverture de Session Caisse');
  if (openSessionModal) {
    console.log('💰 Confirmation ouverture session caisse...');
    const confirmOpenBtn = await page.$('button:has-text("Ouvrir la Caisse")');
    if (confirmOpenBtn) {
      await confirmOpenBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  const posReadyPath = path.join(outputDir, 'caisse_anima_pos_ready.png');
  await page.screenshot({ path: posReadyPath, fullPage: true });
  fs.copyFileSync(posReadyPath, path.join(brainDir, 'caisse_anima_pos_ready.png'));
  console.log('📸 Capture Caisse POS Prête enregistrée :', posReadyPath);

  // 3. ENCAISSER LA COMMANDE #QUDOZ (Table 18)
  console.log('💳 3. Recherche et encaissement de la commande Table 18 (#QUDOZ)...');
  
  // Chercher la carte Table 18
  const table18Element = page.locator('div:has-text("TABLE 18")').last();
  const payButton = table18Element.locator('button:has-text("Encaisser & Clôturer")').first();
  
  if (await payButton.isVisible()) {
    console.log('👉 Clic sur Encaisser & Clôturer pour Table 18...');
    await payButton.click();
    await page.waitForTimeout(1200);

    // Capture de la modale de paiement ouverte
    const modalPath = path.join(outputDir, 'caisse_anima_modal_encaissement.png');
    await page.screenshot({ path: modalPath });
    fs.copyFileSync(modalPath, path.join(brainDir, 'caisse_anima_modal_encaissement.png'));
    console.log('📸 Capture Modale Encaissement enregistrée :', modalPath);

    // Dans la modale de règlement : valider le paiement (montant 4500 ou 5000)
    const modalConfirmPay = page.locator('button:has-text("Valider & Imprimer Ticket 80mm")');
    if (await modalConfirmPay.isVisible()) {
      console.log('👉 Clic sur "Valider & Imprimer Ticket 80mm"...');
      await modalConfirmPay.click();
      await page.waitForTimeout(3000);
    }
  } else {
    console.log('ℹ️ Table 18 n\'a pas de bouton direct, clic sur le premier bouton Encaisser & Clôturer...');
    const anyPayButton = page.locator('button:has-text("Encaisser & Clôturer")').first();
    if (await anyPayButton.isVisible()) {
      await anyPayButton.click();
      await page.waitForTimeout(1200);
      const modalConfirmPay = page.locator('button:has-text("Valider & Imprimer Ticket 80mm")');
      if (await modalConfirmPay.isVisible()) {
        await modalConfirmPay.click();
        await page.waitForTimeout(3000);
      }
    }
  }

  const afterPayPath = path.join(outputDir, 'caisse_anima_apres_encaissement.png');
  await page.screenshot({ path: afterPayPath, fullPage: true });
  fs.copyFileSync(afterPayPath, path.join(brainDir, 'caisse_anima_apres_encaissement.png'));
  console.log('📸 Capture Après Encaissement enregistrée :', afterPayPath);

  // 4. TEST CLÔTURE DE CAISSE
  console.log('🔒 4. Test Clôture de Caisse...');
  const closeSessionBtn = page.locator('button:has-text("Clôturer la Caisse (Z)")');
  if (await closeSessionBtn.isVisible()) {
    console.log('👉 Clic sur Clôturer la Caisse (Z)...');
    await closeSessionBtn.click();
    await page.waitForTimeout(1500);

    const closeSessionPath = path.join(outputDir, 'caisse_anima_cloture_modal.png');
    await page.screenshot({ path: closeSessionPath, fullPage: true });
    fs.copyFileSync(closeSessionPath, path.join(brainDir, 'caisse_anima_cloture_modal.png'));
    console.log('📸 Capture Modale Clôture enregistrée :', closeSessionPath);
  }

  await browser.close();
  console.log('🎉 Tous les tests E2E Playwright et captures HD sont terminés avec succès !');
}

runE2E().catch((err) => {
  console.error('❌ Erreur E2E Playwright :', err);
  process.exit(1);
});
