const { chromium } = require('playwright');

async function capturePricing() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 }
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000/#tarifs', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const pricingSection = page.locator('#tarifs');
  const capturePath = 'captures_qa/27_tarifs_tambali_corrected.png';
  await pricingSection.screenshot({ path: capturePath });
  console.log(`📸 Capture de la grille tarifaire enregistrée : ${capturePath}`);

  await browser.close();
}

capturePricing().catch(console.error);
