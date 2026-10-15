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
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  console.log('1. Capture de la page de Connexion Gérant (/login)...');
  await page.goto('https://www.louametay.com/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const loginPath = path.join(artifactDir, 'screenshot-login.png');
  await page.screenshot({ path: loginPath, fullPage: false });
  console.log('✅ Capture enregistrée :', loginPath);

  console.log('2. Capture de la Console DAW Super-Admin déverrouillée (/super-admin)...');
  await page.goto('https://www.louametay.com/super-admin', { waitUntil: 'domcontentloaded' });
  await page.fill('input[type="password"]', 'LouAmeTay@2026!Admin');
  await page.click('button:has-text("Déverrouiller")');
  await page.waitForTimeout(3000);
  const superAdminPath = path.join(artifactDir, 'screenshot-super-admin.png');
  await page.screenshot({ path: superAdminPath, fullPage: false });
  console.log('✅ Capture enregistrée :', superAdminPath);

  console.log('3. Connexion et Capture de l\'Espace Gérant Restaurant (/dashboard)...');
  await page.goto('https://www.louametay.com/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.fill('input[type="text"]', 'sams-prestige');
  await page.fill('input[type="password"]', 'Pass1234!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  // Navigation directe avec le paramètre
  await page.goto('https://www.louametay.com/dashboard?restaurantId=tenant_sams_restaurant', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const dashboardPath = path.join(artifactDir, 'screenshot-dashboard.png');
  await page.screenshot({ path: dashboardPath, fullPage: false });
  console.log('✅ Capture enregistrée :', dashboardPath);

  console.log('4. Capture du Menu Client Mobile (/r/sams-prestige/table-1)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('https://www.louametay.com/r/sams-prestige/table-1', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(4000);
  const menuPath = path.join(artifactDir, 'screenshot-menu-client.png');
  await mobilePage.screenshot({ path: menuPath, fullPage: false });
  console.log('✅ Capture enregistrée :', menuPath);

  await browser.close();
  console.log('🎯 TOUTES LES CAPTURES DE CONTRÔLE QA SONT RÉALISÉES AVEC SUCCÈS !');
}

run().catch((err) => {
  console.error('Erreur Playwright :', err);
  process.exit(1);
});
