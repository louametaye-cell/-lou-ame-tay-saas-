const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyLiveCategoryProd() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const liveUrl = 'https://www.louametay.com/display/anima-pizzeria?mode=fullscreen&category=pizzas';
  console.log(`🌐 Chargement de la page de production avec catégorie en direct : ${liveUrl}`);

  await page.goto(liveUrl, { waitUntil: 'networkidle', timeout: 45000 });

  await page.waitForSelector('text=Plein Écran TV', { timeout: 15000 });
  await page.waitForSelector('text=FCFA', { timeout: 15000 });

  await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );
  });

  await page.waitForTimeout(2000);

  const outDir = path.join(__dirname, '..', 'capture des teste');
  const outPath = path.join(outDir, 'prod_live_mode_fullscreen_category_pizzas_1080p.png');
  await page.screenshot({ path: outPath });
  console.log(`✅ Capture HD 1080p catégorie production enregistrée : ${outPath}`);

  const artifactDir = 'C:\\Users\\DELL\\.gemini\\antigravity-cli\\brain\\c30ccc64-608a-4ad7-b453-8a8ca6433b1c';
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(outPath, path.join(artifactDir, 'prod_live_mode_fullscreen_category_pizzas_1080p.png'));
  }

  await browser.close();
}

verifyLiveCategoryProd().catch((err) => {
  console.error('❌ Erreur :', err);
  process.exit(1);
});
