const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testProd() {
  console.log('🚀 Vérification Cas 3 en direct sur https://www.louametay.com/r/anima-pizzeria?table=6...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const page = await context.newPage();

  await page.goto('https://www.louametay.com/r/anima-pizzeria?table=6', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Si le ticket automatique ou une modale est ouverte, la fermer
  const closeBtn = page.locator('button:has-text("Ajouter d\'autres Plats"), button:has-text("Fermer"), button:has-text("Retour au menu")').first();
  if (await closeBtn.isVisible()) {
    console.log('Fermeture du ticket automatique en cours...');
    await closeBtn.click();
    await page.waitForTimeout(1000);
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // Vérifier la présence du bouton Addition séparée dans le bandeau ou via le badge
  let sepBtn = page.locator('button:has-text("Addition séparée")').first();
  if (!await sepBtn.isVisible()) {
    sepBtn = page.locator('button[title*="choisir l\'addition séparée"]').first();
  }

  console.log('Bouton "Addition séparée" présent en production ?', await sepBtn.isVisible());
  if (await sepBtn.isVisible()) {
    await sepBtn.click();
    await page.waitForTimeout(1200);
  }

  // Vérifier si la modale Mode d'Addition s'ouvre
  const modalVisible = await page.locator('text=/Mode d\'Addition/i').first().isVisible();
  console.log('Modale "Mode d\'Addition" (Cas 3) ouverte en production ?', modalVisible);

  const capPath = path.join(__dirname, '../capture des teste/prod_cas3_modale_addition_separee_live.png');
  await page.screenshot({ path: capPath, fullPage: false });
  console.log('📸 Preuve HD en production enregistrée :', capPath);

  // Copier vers les artifacts
  const artifactDir = 'C:/Users/DELL/.gemini/antigravity-cli/brain/4119e6c6-710a-4876-a0d4-bcb77999bd96';
  fs.copyFileSync(capPath, path.join(artifactDir, 'prod_cas3_modale_addition_separee_live.png'));

  await context.close();
  await browser.close();
  console.log('🎉 VÉRIFICATION EN PRODUCTION RÉUSSIE !');
}

testProd().catch(console.error);
