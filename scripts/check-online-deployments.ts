const tenants = ['hotel-lat-dior', 'anima-pizzeria', 'madiba-restaurant', 'sams-prestige'];
const PROD_URL = 'https://www.louametay.com';

async function testProd() {
  console.log('=== TEST DU DÉPLOIEMENT EN LIGNE (PROD : https://www.louametay.com) ===\n');

  // 1. Vitrine
  try {
    const resHome = await fetch(PROD_URL, { headers: { 'User-Agent': 'LouAmeTay-QA-Auditor' } });
    console.log(`✅ Vitrine (${PROD_URL}) : Status ${resHome.status} ${resHome.statusText}`);
  } catch (e: any) {
    console.error('❌ Vitrine error:', e.message);
  }

  // 2. Les 4 comptes
  console.log('\n--- VÉRIFICATION DES 4 COMPTES RÉELS EN LIGNE ---');
  for (const t of tenants) {
    try {
      const menuUrl = `${PROD_URL}/r/${t}`;
      const brandingUrl = `${PROD_URL}/api/tenant/branding?restaurantId=${t}`;
      const cashierUrl = `${PROD_URL}/cashier?restaurantId=${t}`;

      const [resMenu, resBranding, resCashier] = await Promise.all([
        fetch(menuUrl, { headers: { 'User-Agent': 'LouAmeTay-QA-Auditor' } }),
        fetch(brandingUrl, { headers: { 'User-Agent': 'LouAmeTay-QA-Auditor' } }),
        fetch(cashierUrl, { headers: { 'User-Agent': 'LouAmeTay-QA-Auditor' } })
      ]);

      const brandingData = await resBranding.json().catch(() => ({}));

      console.log(JSON.stringify({
        tenant: t,
        businessName: brandingData.name || brandingData.businessName || 'N/A',
        plan: brandingData.plan?.slug || (brandingData.isTambali ? 'tambali' : 'standard'),
        menuOnline: `HTTP ${resMenu.status}`,
        brandingApi: `HTTP ${resBranding.status}`,
        cashierOnline: `HTTP ${resCashier.status}`
      }, null, 2));
    } catch (e: any) {
      console.error(`❌ Erreur pour ${t}:`, e.message);
    }
  }
}

testProd().catch(console.error);
