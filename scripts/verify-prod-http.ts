async function checkProductionEndpoints() {
  console.log('--- VÉRIFICATION HTTP 200 PRODUCTION VERCEL ---');
  const urls = [
    'https://www.louametay.com/cashier',
    'https://www.louametay.com/kitchen',
    'https://www.louametay.com/super-admin/plans',
    'https://lou-ame-tay-menu-digital-mda-arts-work-16d5xzf7l-mgartswork.vercel.app/cashier',
    'https://lou-ame-tay-menu-digital-mda-arts-work-16d5xzf7l-mgartswork.vercel.app/kitchen',
    'https://lou-ame-tay-menu-digital-mda-arts-work-16d5xzf7l-mgartswork.vercel.app/super-admin/plans'
  ];

  let allSuccess = true;
  for (const u of urls) {
    try {
      const res = await fetch(u, { redirect: 'follow' });
      const status = res.status;
      const ok = status >= 200 && status < 400;
      console.log(`${ok ? '✓ [HTTP ' + status + ']' : '❌ [HTTP ' + status + ']'} ${u}`);
      if (!ok) allSuccess = false;
    } catch (e: any) {
      console.error(`❌ [ERR] ${u} : ${e.message}`);
      allSuccess = false;
    }
  }

  if (allSuccess) {
    console.log('\n✅ TOUS LES ENDPOINTS DE PRODUCTION RÉPONDENT PARFAITEMENT !');
  } else {
    console.error('\n⚠️ Certains endpoints ont rencontré un problème.');
  }
}

checkProductionEndpoints();
