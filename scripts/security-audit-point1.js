const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const TENANTS = [
  { slug: 'anima-pizzeria', name: 'Anima Pizzeria', pin: '8392' },
  { slug: 'madiba-restaurant', name: 'Madiba Café Resto', pin: '6419' },
  { slug: 'sams-prestige', name: "Sam's Prestige", pin: '7253' },
  { slug: 'hotel-lat-dior', name: 'Hôtel Résidence Lat-Dior', pin: '3841' }
];

const ADMIN_URLS = [
  '/dashboard',
  '/dashboard/menu',
  '/dashboard/stats',
  '/dashboard/zones',
  '/dashboard/waiters',
  '/dashboard/branding'
];

async function runSecurityAudit() {
  console.log('====================================================');
  console.log('AUDIT DE SÉCURITÉ : CLOISONNEMENT ADMIN / CAISSE / CUISINE');
  console.log('====================================================');

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const tenant of TENANTS) {
    console.log(`\n--- TEST DU TENANT : ${tenant.name} (${tenant.slug}) ---`);
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // 1. Connexion Caissier avec PIN
    console.log(`[Caisse] 1. Connexion caissier sur https://www.louametay.com/r/${tenant.slug}/cashier...`);
    await page.goto(`https://www.louametay.com/r/${tenant.slug}/cashier`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    for (const d of tenant.pin) {
      await page.click(`button:has-text("${d}")`);
      await page.waitForTimeout(100);
    }
    await page.click('button:has-text("Valider")');
    await page.waitForTimeout(2000);

    // Vérifier la présence du cookie cashier_token
    const cookies = await context.cookies();
    const cashierCookie = cookies.find(c => c.name === 'cashier_token');
    const saasCookie = cookies.find(c => c.name === 'saas_token');
    console.log(`[Caisse] Cookie cashier_token présent ? ${!!cashierCookie} | Cookie saas_token admin présent ? ${!!saasCookie}`);

    const tenantResult = {
      tenant: tenant.name,
      slug: tenant.slug,
      cashierUrlTests: [],
      kitchenUrlTests: []
    };

    // 2. Tenter d'accéder à chaque URL admin depuis la session caissier
    for (const adminPath of ADMIN_URLS) {
      const targetUrl = `https://www.louametay.com${adminPath}`;
      console.log(`[Caisse] Tentative d'accès à ${adminPath}...`);
      
      const response = await page.goto(targetUrl, { waitUntil: 'networkidle' });
      const finalUrl = page.url();
      const status = response ? response.status() : 'N/A';

      // Vérifier si le contenu admin est présent
      const hasAdminContent = await page.$('text=Chiffre d\'Affaires') !== null ||
                              await page.$('text=Ajouter un Plat') !== null ||
                              await page.$('text=Gestion des Serveurs') !== null ||
                              await page.$('text=Plan des Tables & Zones') !== null;

      const isBlocked = finalUrl.includes('/login') || finalUrl.includes('/cashier') || finalUrl.includes('forbidden_admin') || status === 401 || status === 403;

      console.log(`  -> URL finale : ${finalUrl} | Statut : ${status} | Contenu Admin rendu : ${hasAdminContent} | Bloqué avec succès : ${isBlocked && !hasAdminContent}`);

      tenantResult.cashierUrlTests.push({
        path: adminPath,
        finalUrl,
        status,
        hasAdminContent,
        isBlocked: isBlocked && !hasAdminContent
      });
    }

    // Capture d'écran du blocage pour ce tenant
    const capPath = path.join(__dirname, '..', 'captures_qa', `20_security_blocked_cashier_${tenant.slug}.png`);
    await page.screenshot({ path: capPath });
    console.log(`Capture enregistrée : ${capPath}`);

    // 3. Test CUISINE (KDS)
    console.log(`[Cuisine] Test de la session Cuisine https://www.louametay.com/r/${tenant.slug}/kitchen...`);
    const kitchenContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const kitchenPage = await kitchenContext.newPage();

    await kitchenPage.goto(`https://www.louametay.com/r/${tenant.slug}/kitchen`, { waitUntil: 'networkidle' });
    await kitchenPage.waitForTimeout(1000);

    // Tenter d'accéder à /dashboard
    console.log(`[Cuisine] Tentative d'accès à /dashboard...`);
    const kResp = await kitchenPage.goto('https://www.louametay.com/dashboard', { waitUntil: 'networkidle' });
    const kFinalUrl = kitchenPage.url();
    const kStatus = kResp ? kResp.status() : 'N/A';
    const kHasAdminContent = await kitchenPage.$('text=Chiffre d\'Affaires') !== null;
    const kIsBlocked = (kFinalUrl.includes('/login') || kStatus === 401) && !kHasAdminContent;

    console.log(`  -> URL finale : ${kFinalUrl} | Statut : ${kStatus} | Bloqué : ${kIsBlocked}`);

    // Tenter d'accéder à l'espace caisse sans PIN
    console.log(`[Cuisine] Tentative d'accès à /r/${tenant.slug}/cashier...`);
    await kitchenPage.goto(`https://www.louametay.com/r/${tenant.slug}/cashier`, { waitUntil: 'networkidle' });
    await kitchenPage.waitForTimeout(1500);

    const isCashierLocked = await kitchenPage.$('text=Connexion Caisse') !== null ||
                            await kitchenPage.$('text=Poste Verrouillé') !== null;
    const isOrdersHidden = await kitchenPage.$('button:has-text("Encaisser & Clôturer")') === null;

    console.log(`  -> Caisse verrouillée sous PIN ? ${isCashierLocked} | Données caisse masquées ? ${isOrdersHidden}`);

    tenantResult.kitchenUrlTests.push({
      tested: 'Cuisine vers /dashboard',
      finalUrl: kFinalUrl,
      status: kStatus,
      isBlocked: kIsBlocked
    });

    tenantResult.kitchenUrlTests.push({
      tested: 'Cuisine vers /cashier',
      isLocked: isCashierLocked,
      isOrdersHidden: isOrdersHidden,
      isIsolated: isCashierLocked && isOrdersHidden
    });

    results.push(tenantResult);
    await context.close();
    await kitchenContext.close();
  }

  await browser.close();

  console.log('\n====================================================');
  console.log('RÉSUMÉ FINAL DE L\'AUDIT DE SÉCURITÉ POINT 1');
  console.log('====================================================');
  console.log(JSON.stringify(results, null, 2));

  fs.writeFileSync(
    path.join(__dirname, '..', 'captures_qa', 'security_audit_point1_results.json'),
    JSON.stringify(results, null, 2)
  );
}

runSecurityAudit().catch(err => {
  console.error('Erreur audit:', err);
  process.exit(1);
});
