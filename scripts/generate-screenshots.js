const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function captureScreenshots() {
  const outputDir = path.join(__dirname, '../public/screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🚀 Démarrage de la capture des rendus visuels avec Chromium...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  const pagesToCapture = [
    { name: '1_accueil', url: 'http://localhost:3000/' },
    { name: '2_menu_client', url: 'http://localhost:3000/r/chezfatou/table-1' },
    { name: '3_connexion', url: 'http://localhost:3000/login' },
    { name: '4_cuisine_kds', url: 'http://localhost:3000/kitchen' },
    { name: '5_super_admin', url: 'http://localhost:3000/super-admin' },
  ];

  for (const item of pagesToCapture) {
    try {
      console.log(`📸 Capture de ${item.name} (${item.url})...`);
      await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(outputDir, `${item.name}.png`), fullPage: false });
      console.log(`✅ Sauvée : public/screenshots/${item.name}.png`);
    } catch (err) {
      console.error(`⚠️ Erreur lors de la capture de ${item.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('🎉 Captures terminées avec succès dans public/screenshots/ !');
}

captureScreenshots();
