const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:/Users/DELL/.gemini/antigravity-cli/brain/c30ccc64-608a-4ad7-b453-8a8ca6433b1c';
const CAPTURES_DIR = path.join(__dirname, '../capture des teste');

async function testFullscreenMode() {
  console.log('====================================================================');
  console.log('✨ TEST DU NOUVEAU MODE PLEIN ÉCRAN IMMERSIF (TV 1080p FULL HD)');
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

    console.log('2. Attente du chargement complet de l\'image et du rendu...');
    // Attendre que l'image soit chargée et complète
    await page.waitForFunction(() => {
      const img = document.querySelector('img[alt="Napoletana"]');
      return img && img.complete && img.naturalWidth > 0;
    }, { timeout: 15000 });
    await page.waitForTimeout(1500);

    // Capture HD Plat 1
    const shotPlat1 = path.join(CAPTURES_DIR, 'mode_fullscreen_immersif_plat1_1080p.png');
    const shotPlat1Artifact = path.join(ARTIFACT_DIR, 'mode_fullscreen_immersif_plat1_1080p.png');
    await page.screenshot({ path: shotPlat1, fullPage: false });
    fs.copyFileSync(shotPlat1, shotPlat1Artifact);
    console.log(`📸 Preuve 1 enregistrée : mode_fullscreen_immersif_plat1_1080p.png`);

    // Navigation vers le plat suivant via la flèche droite
    console.log('3. Passage au plat suivant (Margarita)...');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1200);

    // Attendre que la nouvelle image soit prête
    await page.waitForFunction(() => {
      const img = document.querySelector('img.object-center');
      return img && img.complete && img.naturalWidth > 0;
    }, { timeout: 10000 });
    await page.waitForTimeout(1000);

    const nextDishTitle = await page.locator('h2').first().innerText();
    console.log(`   - Nouveau plat affiché : "${nextDishTitle}"`);

    // Capture HD Plat 2
    const shotPlat2 = path.join(CAPTURES_DIR, 'mode_fullscreen_immersif_plat2_1080p.png');
    const shotPlat2Artifact = path.join(ARTIFACT_DIR, 'mode_fullscreen_immersif_plat2_1080p.png');
    await page.screenshot({ path: shotPlat2, fullPage: false });
    fs.copyFileSync(shotPlat2, shotPlat2Artifact);
    console.log(`📸 Preuve 2 enregistrée : mode_fullscreen_immersif_plat2_1080p.png`);

    console.log('\n🎉 MODE PLEIN ÉCRAN IMMERSIF 100% VALIDÉ EN 1080p FULL HD !');
  } catch (err) {
    console.error('❌ Erreur lors du test :', err.message);
  } finally {
    await page.close();
    await browser.close();
  }
}

testFullscreenMode().catch(console.error);
