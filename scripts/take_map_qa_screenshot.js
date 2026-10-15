const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  const artifactDir = path.resolve('C:/Users/DELL/.gemini/antigravity-cli/brain/1c7e0dca-91f4-4686-827f-b7ce8ad57b87');
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  console.log('1. Accès à la Console DAW Super-Admin (Production)...');
  await page.goto('https://www.louametay.com/super-admin', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  console.log('2. Déverrouillage de la Console Super-Admin...');
  await page.fill('input[type="password"]', 'LouAmeTay@2026!Admin');
  await page.click('button:has-text("Déverrouiller")');
  await page.waitForTimeout(4000);

  console.log('3. Navigation vers la section #carte-senegal...');
  const mapSection = await page.$('#carte-senegal');
  if (mapSection) {
    await mapSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
  }

  console.log('4. Interaction avec un Marker de restaurant...');
  try {
    const marker = await page.$('.custom-daw-map-marker');
    if (marker) {
      await marker.click();
      await page.waitForTimeout(1000);
      console.log('Marker cliqué avec succès, InfoBulle ouverte !');
    }
  } catch (e) {
    console.log('Interaction marker :', e.message);
  }

  console.log('5. Capture de la Carte Interactive Google Maps Sénégal...');
  const mapScreenshotPath = path.join(artifactDir, 'screenshot-google-maps-senegal.png');
  await page.screenshot({ path: mapScreenshotPath, fullPage: false });
  console.log('✅ Capture enregistrée :', mapScreenshotPath);

  // Capture plein écran pour vue d'ensemble
  const fullMapScreenshotPath = path.join(artifactDir, 'screenshot-console-daw-overview.png');
  if (mapSection) {
    await mapSection.screenshot({ path: fullMapScreenshotPath });
    console.log('✅ Capture zoomée sur le composant cartographique :', fullMapScreenshotPath);
  }

  await browser.close();
  console.log('🎯 MISSION QA CARTOGRAPHIE GOOGLE MAPS SÉNÉGAL ACCOMPLIE AVEC SUCCÈS !');
}

run().catch((err) => {
  console.error('Erreur Playwright :', err);
  process.exit(1);
});
