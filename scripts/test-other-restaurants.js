const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/DELL/.gemini/antigravity-cli/brain/29ebca16-966e-42e2-b0c1-91cc97f14e1d';
const BASE_URL = 'http://localhost:3000';

async function verifyOtherTenants() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('--- 1. VÉRIFICATION ANIMA PIZZERIA (KDS & CAISSE) ---');
  // KDS Anima
  await page.goto(`${BASE_URL}/r/anima-pizzeria/kitchen`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  const kdsAnimaPath = path.join(ARTIFACT_DIR, 'kds_anima_pizzeria_verification_propre.png');
  await page.screenshot({ path: kdsAnimaPath, fullPage: false });
  console.log(`📸 Capture KDS Anima enregistrée: ${kdsAnimaPath}`);

  // Caisse Anima
  await page.goto(`${BASE_URL}/cashier?restaurantId=cmfek2z0q0000ugv8k2t24018`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  // Saisir PIN si nécessaire
  const pin1234Anima = page.locator('button:has-text("1")');
  if (await pin1234Anima.isVisible()) {
    await page.locator('button:has-text("1")').first().click();
    await page.locator('button:has-text("2")').first().click();
    await page.locator('button:has-text("3")').first().click();
    await page.locator('button:has-text("4")').first().click();
    await page.waitForTimeout(1500);
  }
  const caisseAnimaPath = path.join(ARTIFACT_DIR, 'caisse_anima_verification_propre.png');
  await page.screenshot({ path: caisseAnimaPath, fullPage: false });
  console.log(`📸 Capture Caisse Anima enregistrée: ${caisseAnimaPath}`);

  console.log('--- 2. VÉRIFICATION MADIBA RESTAURANT (PACK TÀMBALI VITRINE PURE) ---');
  await page.goto(`${BASE_URL}/r/madiba-restaurant/1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  const menuMadibaPath = path.join(ARTIFACT_DIR, 'menu_madiba_pack_tambali_vitrine.png');
  await page.screenshot({ path: menuMadibaPath, fullPage: false });
  console.log(`📸 Capture Menu Madiba (Tàmbali) enregistrée: ${menuMadibaPath}`);

  console.log('--- 3. VÉRIFICATION HÔTEL LAT-DIOR (KDS & CAISSE) ---');
  // KDS Lat-Dior
  await page.goto(`${BASE_URL}/r/hotel-lat-dior/kitchen`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  const kdsLatDiorPath = path.join(ARTIFACT_DIR, 'kds_lat_dior_verification_propre.png');
  await page.screenshot({ path: kdsLatDiorPath, fullPage: false });
  console.log(`📸 Capture KDS Lat-Dior enregistrée: ${kdsLatDiorPath}`);

  // Caisse Lat-Dior
  await page.goto(`${BASE_URL}/cashier?restaurantId=cmffolb4v0002ug8s0r8w4i7f`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  const pin1234LatDior = page.locator('button:has-text("1")');
  if (await pin1234LatDior.isVisible()) {
    await page.locator('button:has-text("1")').first().click();
    await page.locator('button:has-text("2")').first().click();
    await page.locator('button:has-text("3")').first().click();
    await page.locator('button:has-text("4")').first().click();
    await page.waitForTimeout(1500);
  }
  const caisseLatDiorPath = path.join(ARTIFACT_DIR, 'caisse_lat_dior_verification_propre.png');
  await page.screenshot({ path: caisseLatDiorPath, fullPage: false });
  console.log(`📸 Capture Caisse Lat-Dior enregistrée: ${caisseLatDiorPath}`);

  await browser.close();
  console.log('--- VÉRIFICATION PLAYWRIGHT DES AUTRES ÉTABLISSEMENTS TERMINÉE ---');
}

verifyOtherTenants().catch(console.error);
