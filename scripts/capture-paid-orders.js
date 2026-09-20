const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function capturePaidOrders() {
  const outputDir = path.join(__dirname, '..', 'capture des teste');
  const brainDir = path.join('C:', 'Users', 'DELL', '.gemini', 'antigravity-cli', 'brain', '29ebca16-966e-42e2-b0c1-91cc97f14e1d');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to caisse...');
  await page.goto('http://localhost:3000/cashier?restaurantId=anima-pizzeria', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Enter PIN
  const pinInputExists = await page.$('text=Connexion Caisse');
  if (pinInputExists) {
    for (const digit of ['8', '3', '9', '2']) {
      await page.locator(`button:has-text("${digit}")`).first().click();
      await page.waitForTimeout(150);
    }
    await page.locator('button:has-text("Valider")').first().click();
    await page.waitForTimeout(2500);
  }

  // Click on "Servies & Encaissées" tab
  const paidTab = page.locator('button:has-text("Servies & Encaissées")');
  if (await paidTab.isVisible()) {
    console.log('Clicking Servies & Encaissées tab...');
    await paidTab.click();
    await page.waitForTimeout(1500);
  }

  const screenshotPath = path.join(outputDir, 'caisse_anima_commandes_encaissees_qudoz.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  fs.copyFileSync(screenshotPath, path.join(brainDir, 'caisse_anima_commandes_encaissees_qudoz.png'));
  console.log('Captured:', screenshotPath);

  await browser.close();
}

capturePaidOrders().catch(console.error);
