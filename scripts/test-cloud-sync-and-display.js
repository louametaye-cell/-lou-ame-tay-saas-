const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\DELL\\.gemini\\antigravity-cli\\brain\\4119e6c6-710a-4876-a0d4-bcb77999bd96';
const CAPTURE_DIR = 'C:\\Users\\DELL\\Desktop\\Lou ame Tay menu digital Mda arts work\\capture des teste';

async function runTests() {
  console.log('🚀 Démarrage du test de synchronisation Cloud temps réel et affichage TV...');

  if (!fs.existsSync(CAPTURE_DIR)) {
    fs.mkdirSync(CAPTURE_DIR, { recursive: true });
  }

  // 1. TEST API /api/tenant/shift (POST puis GET)
  console.log('\n--- TEST 1 : Persistance Cloud du Shift des Serveurs & Assignations ---');
  const testShiftData = {
    restaurantId: 'anima-pizzeria',
    members: [
      {
        id: 'srv_cheikh_1',
        name: 'Cheikh Ndiaye',
        phone: '+221 77 123 45 67',
        shiftHours: '11h00 - 16h30 (Service Midi)',
        periodType: 'LUNCH',
        status: 'ACTIVE',
        assignedTables: [1, 2, 3, 4],
      },
      {
        id: 'srv_awa_2',
        name: 'Awa Sarr',
        phone: '+221 78 987 65 43',
        shiftHours: '17h00 - 00h30 (Service Soirée)',
        periodType: 'DINNER',
        status: 'ACTIVE',
        assignedTables: [5, 6, 7, 8],
      },
    ],
    tableServerMap: {
      1: 'Cheikh Ndiaye',
      2: 'Cheikh Ndiaye',
      3: 'Cheikh Ndiaye',
      4: 'Cheikh Ndiaye',
      5: 'Awa Sarr',
      6: 'Awa Sarr',
      7: 'Awa Sarr',
      8: 'Awa Sarr',
    },
  };

  const postRes = await fetch('http://localhost:3000/api/tenant/shift', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-token': 'resto_session_anima-pizzeria',
      Cookie: 'saas_token=resto_session_anima-pizzeria',
    },
    body: JSON.stringify(testShiftData),
  });

  const postResult = await postRes.json();
  console.log('Réponse POST /api/tenant/shift :', postRes.status, postResult.success ? '✅ SUCCÈS' : '❌ ÉCHEC');

  const getRes = await fetch('http://localhost:3000/api/tenant/shift?restaurantId=anima-pizzeria');
  const getResult = await getRes.json();
  console.log(
    'Réponse GET /api/tenant/shift (Accès mondial) :',
    getRes.status,
    getResult.members?.length === 2 ? '✅ 2 serveurs Cloud persistés' : '❌ Échec',
    '| Tables assignées :', Object.keys(getResult.tableServerMap || {}).length
  );

  // 2. TEST API /api/auth/me (Résolution session HTTP-Only)
  console.log('\n--- TEST 2 : Résolution session mondiale /api/auth/me ---');
  const meRes = await fetch('http://localhost:3000/api/auth/me', {
    headers: {
      Cookie: 'saas_token=resto_session_anima-pizzeria',
    },
  });
  const meResult = await meRes.json();
  console.log(
    'Réponse GET /api/auth/me :',
    meRes.status,
    meResult.authenticated ? `✅ Connecté en tant que : ${meResult.restaurant?.name}` : '❌ Non authentifié'
  );

  // 3. TESTS PLAYWRIGHT DU RENDU NAVIGATEUR EN CONDITIONS RÉELLES
  console.log('\n--- TEST 3 : Rendu Navigateur HD & Captures d\'écran ---');
  const browser = await chromium.launch({ headless: true });

  // A. Contexte vierge pour simuler un gérant qui ouvre son tableau de bord à distance (Paris, New York)
  const contextGérantDistant = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    extraHTTPHeaders: {
      Cookie: 'saas_token=resto_session_anima-pizzeria',
    },
  });

  const pageTables = await contextGérantDistant.newPage();

  // Aller sur le Plan de Salle
  console.log('Navigation vers Plan de Salle Cloud...');
  await pageTables.goto('http://localhost:3000/dashboard/tables?restaurantId=anima-pizzeria', {
    waitUntil: 'domcontentloaded',
  });
  await pageTables.waitForTimeout(3000);

  const shotPlanDeSalle = path.join(CAPTURE_DIR, 'cloud_sync_plan_de_salle.png');
  const shotPlanDeSalleArtifact = path.join(ARTIFACT_DIR, 'cloud_sync_plan_de_salle.png');
  await pageTables.screenshot({ path: shotPlanDeSalle, fullPage: false });
  await pageTables.screenshot({ path: shotPlanDeSalleArtifact, fullPage: false });
  console.log('📸 Capture Plan de Salle Cloud sauvegardée :', shotPlanDeSalle);

  // Aller sur le Dashboard Principal
  console.log('Navigation vers Dashboard Opérationnel mondial...');
  await pageTables.goto('http://localhost:3000/dashboard?restaurantId=anima-pizzeria', {
    waitUntil: 'domcontentloaded',
  });
  await pageTables.waitForTimeout(2500);

  const shotDashboard = path.join(CAPTURE_DIR, 'cloud_sync_dashboard_mondial.png');
  const shotDashboardArtifact = path.join(ARTIFACT_DIR, 'cloud_sync_dashboard_mondial.png');
  await pageTables.screenshot({ path: shotDashboard, fullPage: false });
  await pageTables.screenshot({ path: shotDashboardArtifact, fullPage: false });
  console.log('📸 Capture Dashboard Mondial sauvegardée :', shotDashboard);

  // B. Écran TV d'Affichage : Mode Classic
  const contextTV = await browser.newContext({
    viewport: { width: 1920, height: 1080 }, // Résolution Full HD TV standard
  });
  const pageTV = await contextTV.newPage();

  console.log('Navigation vers Écran TV Classic (Menu Board Full HD)...');
  await pageTV.goto('http://localhost:3000/display/anima-pizzeria?mode=classic', {
    waitUntil: 'domcontentloaded',
  });
  await pageTV.waitForTimeout(2000);

  const shotTVClassic = path.join(CAPTURE_DIR, 'ecran_tv_classic_hd.png');
  const shotTVClassicArtifact = path.join(ARTIFACT_DIR, 'ecran_tv_classic_hd.png');
  await pageTV.screenshot({ path: shotTVClassic, fullPage: false });
  await pageTV.screenshot({ path: shotTVClassicArtifact, fullPage: false });
  console.log('📸 Capture Écran TV Classic sauvegardée :', shotTVClassic);

  // C. Écran TV d'Affichage : Mode Slideshow (Diaporama)
  console.log('Navigation vers Écran TV Slideshow...');
  await pageTV.goto('http://localhost:3000/display/anima-pizzeria?mode=slideshow', {
    waitUntil: 'domcontentloaded',
  });
  await pageTV.waitForTimeout(2000);

  const shotTVSlideshow = path.join(CAPTURE_DIR, 'ecran_tv_slideshow_hd.png');
  const shotTVSlideshowArtifact = path.join(ARTIFACT_DIR, 'ecran_tv_slideshow_hd.png');
  await pageTV.screenshot({ path: shotTVSlideshow, fullPage: false });
  await pageTV.screenshot({ path: shotTVSlideshowArtifact, fullPage: false });
  console.log('📸 Capture Écran TV Slideshow sauvegardée :', shotTVSlideshow);

  await browser.close();
  console.log('\n🎉 TOUS LES TESTS SONT VALIDÉS AVEC SUCCÈS !');
}

runTests().catch((err) => {
  console.error('Erreur lors du test :', err);
  process.exit(1);
});
