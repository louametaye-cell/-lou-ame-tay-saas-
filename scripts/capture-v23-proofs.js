const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  const outputDir = path.resolve(__dirname, '../preuves_deploiement');
  const artifactDir = path.resolve('C:/Users/DELL/.gemini/antigravity-cli/brain/6b43b739-c616-499e-a7fa-8235729c42e0');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  console.log('🚀 Lancement de Chromium Playwright...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  // Injecter le cookie de session pour l'espace Gérant
  await context.addCookies([
    {
      name: 'saas_token',
      value: 'resto_session_tenant_anima_pizzeria',
      domain: 'www.louametay.com',
      path: '/',
    },
    {
      name: 'restaurant_id',
      value: 'tenant_anima_pizzeria',
      domain: 'www.louametay.com',
      path: '/',
    }
  ]);

  const page = await context.newPage();

  // 1. Super-Admin Plans & Verrous
  console.log('📸 1. Capture /super-admin/plans...');
  await page.goto('https://www.louametay.com/super-admin/plans', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const passwordInput = await page.$('input[type="password"]');
  if (passwordInput) {
    await page.fill('input[type="password"]', 'LouAmeTay@2026!Admin');
    await page.click('button:has-text("Déverrouiller")');
    await page.waitForTimeout(3000);
  }
  const file1 = path.join(outputDir, '01_super_admin_plans.png');
  await page.screenshot({ path: file1, fullPage: false });
  fs.copyFileSync(file1, path.join(artifactDir, '01_super_admin_plans.png'));
  console.log('✅ Capture 1 enregistrée :', file1);

  // 2. Caisse POS V2.3 Déverrouillée (PIN Aïssatou : 8392)
  console.log('📸 2. Capture /cashier Déverrouillée (Anima Pizzeria)...');
  await page.goto('https://www.louametay.com/cashier?restaurantId=tenant_anima_pizzeria', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const pinDigits = ['8', '3', '9', '2'];
  for (const d of pinDigits) {
    const btn = page.locator(`button:has-text("${d}")`).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(150);
    }
  }
  const validateBtn = page.locator('button:has-text("Valider")').first();
  if (await validateBtn.isVisible()) {
    await validateBtn.click();
    await page.waitForTimeout(3000);
  }

  const file2 = path.join(outputDir, '02_cashier_pos_unlocked.png');
  await page.screenshot({ path: file2, fullPage: false });
  fs.copyFileSync(file2, path.join(artifactDir, '02_cashier_pos_unlocked.png'));
  console.log('✅ Capture 2 enregistrée :', file2);

  // 3. Modale Repas Personnel NP & Options Caisse
  console.log('📸 3. Capture Modale Encaissement Repas NP...');
  const payFirstBtn = page.locator('button:has-text("Encaisser")').first();
  if (await payFirstBtn.isVisible()) {
    await payFirstBtn.click();
    await page.waitForTimeout(1500);
    const staffMealBtn = page.locator('button:has-text("Repas NP")').first();
    if (await staffMealBtn.isVisible()) {
      await staffMealBtn.click();
      await page.waitForTimeout(1000);
    }
    const file3 = path.join(outputDir, '03_cashier_modal_staff_meal.png');
    await page.screenshot({ path: file3, fullPage: false });
    fs.copyFileSync(file3, path.join(artifactDir, '03_cashier_modal_staff_meal.png'));
    console.log('✅ Capture 3 enregistrée :', file3);

    // Fermer la modale
    const cancelBtn = page.locator('button:has-text("Annuler")').first();
    if (await cancelBtn.isVisible()) await cancelBtn.click();
    await page.waitForTimeout(1000);
  }

  // 4. Espace Gérant - Repas du personnel NP (/dashboard/staff-meals)
  console.log('📸 4. Capture /dashboard/staff-meals (Anima Pizzeria)...');
  await page.goto('https://www.louametay.com/dashboard/staff-meals?restaurantId=tenant_anima_pizzeria', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  const file4 = path.join(outputDir, '04_dashboard_staff_meals.png');
  await page.screenshot({ path: file4, fullPage: false });
  fs.copyFileSync(file4, path.join(artifactDir, '04_dashboard_staff_meals.png'));
  console.log('✅ Capture 4 enregistrée :', file4);

  // 5. KDS Cuisine (/kitchen)
  console.log('📸 5. Capture /kitchen (Anima Pizzeria)...');
  await page.goto('https://www.louametay.com/kitchen?restaurantId=tenant_anima_pizzeria', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  const file5 = path.join(outputDir, '05_kitchen_kds.png');
  await page.screenshot({ path: file5, fullPage: false });
  fs.copyFileSync(file5, path.join(artifactDir, '05_kitchen_kds.png'));
  console.log('✅ Capture 5 enregistrée :', file5);

  await browser.close();
  console.log('🎉 Preuves photographiques HD V2.3 complètes enregistrées !');
}

run().catch((err) => {
  console.error('❌ Erreur Playwright :', err);
  process.exit(1);
});
