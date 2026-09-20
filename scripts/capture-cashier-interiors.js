const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/DELL/.gemini/antigravity-cli/brain/29ebca16-966e-42e2-b0c1-91cc97f14e1d';
const BASE_URL = 'http://localhost:3000';

async function captureRealCashiers() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 1. Caisse Anima Pizzeria (PIN 8392)
  console.log('Connexion Caisse Anima Pizzeria (8392)...');
  await page.goto(`${BASE_URL}/cashier?restaurantId=anima-pizzeria`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  for (const digit of ['8', '3', '9', '2']) {
    await page.locator(`button:has-text("${digit}")`).first().click();
    await page.waitForTimeout(150);
  }
  await page.locator('button:has-text("Valider")').first().click();
  await page.waitForTimeout(3500);
  const caisseAnimaPath = path.join(ARTIFACT_DIR, 'caisse_anima_dashboard_interieur_succes.png');
  await page.screenshot({ path: caisseAnimaPath, fullPage: false });
  console.log(`📸 Caisse Anima connectée: ${caisseAnimaPath}`);

  // 2. Caisse Lat-Dior (PIN 3841)
  console.log('Connexion Caisse Hôtel Lat-Dior (3841)...');
  await page.goto(`${BASE_URL}/cashier?restaurantId=hotel-lat-dior`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  for (const digit of ['3', '8', '4', '1']) {
    await page.locator(`button:has-text("${digit}")`).first().click();
    await page.waitForTimeout(150);
  }
  await page.locator('button:has-text("Valider")').first().click();
  await page.waitForTimeout(3500);
  const caisseLatDiorPath = path.join(ARTIFACT_DIR, 'caisse_lat_dior_dashboard_interieur_succes.png');
  await page.screenshot({ path: caisseLatDiorPath, fullPage: false });
  console.log(`📸 Caisse Lat-Dior connectée: ${caisseLatDiorPath}`);

  // 3. Caisse Sam's Prestige (PIN 7253)
  console.log('Connexion Caisse Sam\'s Prestige (7253)...');
  await page.goto(`${BASE_URL}/cashier?restaurantId=sams-prestige`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  for (const digit of ['7', '2', '5', '3']) {
    await page.locator(`button:has-text("${digit}")`).first().click();
    await page.waitForTimeout(150);
  }
  await page.locator('button:has-text("Valider")').first().click();
  await page.waitForTimeout(3500);
  const caisseSamsPath = path.join(ARTIFACT_DIR, 'caisse_sams_dashboard_interieur_succes.png');
  await page.screenshot({ path: caisseSamsPath, fullPage: false });
  console.log(`📸 Caisse Sam\'s Prestige connectée: ${caisseSamsPath}`);

  await browser.close();
}

captureRealCashiers().catch(console.error);
