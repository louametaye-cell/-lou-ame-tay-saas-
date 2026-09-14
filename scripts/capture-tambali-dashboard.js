const { chromium } = require('playwright');

async function captureTambaliDashboard() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  await context.addCookies([
    {
      name: 'saas_token',
      value: 'resto_session_tenant_madiba_restau',
      domain: 'localhost',
      path: '/'
    }
  ]);

  const page = await context.newPage();
  
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('current_restaurant_id', 'tenant_madiba_restau');
    localStorage.setItem('current_restaurant_name', 'MADIBA RESTAURANT');
  });

  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const capturePath = 'captures_qa/26_tambali_dashboard_clean.png';
  await page.screenshot({ path: capturePath, fullPage: true });
  console.log(`📸 Capture sauvegardée : ${capturePath}`);

  await browser.close();
}

captureTambaliDashboard().catch(console.error);
