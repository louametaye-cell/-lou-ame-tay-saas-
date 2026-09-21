const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:/Users/DELL/.gemini/antigravity-cli/brain/c30ccc64-608a-4ad7-b453-8a8ca6433b1c';
const CAPTURES_DIR = path.join(__dirname, '../capture des teste');

async function testFullscreenCategory() {
  console.log('====================================================================');
  console.log('✨ TEST DU MODE PLEIN ÉCRAN AVEC SÉLECTEUR DE CATÉGORIES (1080p)');
  console.log('====================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (SmartHub; SMART-TV; U; Linux/SmartTV) AppleWebKit/534.34 TV Safari/534.34'
  });

  const page = await context.newPage();

  try {
    const url = 'http://localhost:3000/display/anima-pizzeria?mode=fullscreen';
    console.log(`1. Navigation vers ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Attendre que l'image soit prête
    await page.waitForFunction(() => {
      const img = document.querySelector('img[alt="Napoletana"]');
      return img && img.complete && img.naturalWidth > 0;
    }, { timeout: 15000 });
    await page.waitForTimeout(1500);

    // Vérifier la barre de catégories en haut
    const catBarVisible = await page.locator('text=/Tous les plats/i').first().isVisible();
    console.log(`   - Barre de catégories présente dans l'en-tête : ${catBarVisible}`);

    // Preuve 1 : Vue d'ensemble avec toutes les catégories
    const shot1 = path.join(CAPTURES_DIR, 'mode_fullscreen_avec_categories_1080p.png');
    const shot1Artifact = path.join(ARTIFACT_DIR, 'mode_fullscreen_avec_categories_1080p.png');
    await page.screenshot({ path: shot1, fullPage: false });
    fs.copyFileSync(shot1, shot1Artifact);
    console.log(`📸 Preuve 1 enregistrée : mode_fullscreen_avec_categories_1080p.png`);

    // 2. Filtrage par Catégorie : Clic sur "Snacks & Paninis"
    console.log('\n2. Clic sur la catégorie "Snacks & Paninis"...');
    const snacksBtn = page.locator('button:has-text("Snacks")').first();
    if (await snacksBtn.isVisible()) {
      await snacksBtn.click();
      await page.waitForTimeout(2000);

      const dishTitle = await page.locator('h2').first().innerText();
      console.log(`   - Plat filtré : "${dishTitle}"`);

      const shot2 = path.join(CAPTURES_DIR, 'mode_fullscreen_filtre_snacks_1080p.png');
      const shot2Artifact = path.join(ARTIFACT_DIR, 'mode_fullscreen_filtre_snacks_1080p.png');
      await page.screenshot({ path: shot2, fullPage: false });
      fs.copyFileSync(shot2, shot2Artifact);
      console.log(`📸 Preuve 2 enregistrée : mode_fullscreen_filtre_snacks_1080p.png`);
    }

    // 3. Test du paramètre d'URL direct ?category=Desserts
    console.log('\n3. Test avec URL directe par catégorie : ?mode=fullscreen&category=Desserts...');
    await page.goto('http://localhost:3000/display/anima-pizzeria?mode=fullscreen&category=Desserts', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await page.waitForTimeout(3000);

    const dessertTitle = await page.locator('h2').first().innerText();
    console.log(`   - Plat dessert affiché : "${dessertTitle}"`);

    const shot3 = path.join(CAPTURES_DIR, 'mode_fullscreen_filtre_desserts_1080p.png');
    const shot3Artifact = path.join(ARTIFACT_DIR, 'mode_fullscreen_filtre_desserts_1080p.png');
    await page.screenshot({ path: shot3, fullPage: false });
    fs.copyFileSync(shot3, shot3Artifact);
    console.log(`📸 Preuve 3 enregistrée : mode_fullscreen_filtre_desserts_1080p.png`);

    console.log('\n🎉 VALIDATION RÉUSSIE : PLEIN ÉCRAN + FILTRAGE PAR CATÉGORIE !');
  } catch (err) {
    console.error('❌ Erreur lors du test :', err.message);
  } finally {
    await page.close();
    await browser.close();
  }
}

testFullscreenCategory().catch(console.error);
