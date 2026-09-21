const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyLiveProd() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const liveUrl = 'https://www.louametay.com/display/anima-pizzeria?mode=fullscreen';
  console.log(`🌐 Chargement de la page de production en direct : ${liveUrl}`);

  await page.goto(liveUrl, { waitUntil: 'networkidle', timeout: 45000 });

  // Attendre l'apparition du conteneur plein écran et du prix
  await page.waitForSelector('text=Plein Écran TV', { timeout: 15000 });
  await page.waitForSelector('text=FCFA', { timeout: 15000 });

  // Attendre que l'image principale soit chargée
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
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'prod_live_mode_fullscreen_1080p.png');
  await page.screenshot({ path: outPath });
  console.log(`✅ Capture HD 1080p de production enregistrée : ${outPath}`);

  // Copie vers le dossier artifacts
  const artifactDir = 'C:\\Users\\DELL\\.gemini\\antigravity-cli\\brain\\c30ccc64-608a-4ad7-b453-8a8ca6433b1c';
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(outPath, path.join(artifactDir, 'prod_live_mode_fullscreen_1080p.png'));
    console.log(`✅ Copie artifact créée`);
  }

  await browser.close();
}

verifyLiveProd().catch((err) => {
  console.error('❌ Erreur :', err);
  process.exit(1);
});
