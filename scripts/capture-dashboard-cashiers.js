const { chromium } = require('playwright');

async function captureCashiersDashboard() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  await context.addCookies([
    {
      name: 'saas_token',
      value: 'resto_session_tenant_anima_pizzeria',
      domain: 'www.louametay.com',
      path: '/'
    }
  ]);

  const page = await context.newPage();
  
  await page.goto('https://www.louametay.com/dashboard', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('current_restaurant_id', 'tenant_anima_pizzeria');
    localStorage.setItem('current_restaurant_name', 'Anima Pizzeria');
  });

  await page.goto('https://www.louametay.com/dashboard/cashiers', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const capturePath = 'captures_qa/21_dashboard_cashiers_management.png';
  await page.screenshot({ path: capturePath, fullPage: true });
  console.log(`Capture sauvegardée : ${capturePath}`);

  await browser.close();
}

captureCashiersDashboard().catch(console.error);
