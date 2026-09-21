const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:/Users/DELL/.gemini/antigravity-cli/brain/c30ccc64-608a-4ad7-b453-8a8ca6433b1c';
const CAPTURES_DIR = path.join(__dirname, '../capture des teste');

if (!fs.existsSync(CAPTURES_DIR)) {
  fs.mkdirSync(CAPTURES_DIR, { recursive: true });
}

async function verifyPickupAndTvDisplay() {
  console.log('====================================================================');
  console.log('📺 AUDIT E2E EN PRODUCTION : ÉCRAN TV RETRAIT & DIGITAL SIGNAGE');
  console.log('====================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const results = [];

  // Contexte TV 1080p Full HD (1920x1080)
  const contextTV = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (SmartHub; SMART-TV; U; Linux/SmartTV; Maple2012) AppleWebKit/534.34 (KHTML, like Gecko) TV Safari/534.34'
  });

  // --------------------------------------------------------------------------
  // TEST 1 : Écran Retrait Guichet (/pickup) sur Anima Pizzeria (Pack Éligible)
  // --------------------------------------------------------------------------
  console.log('--------------------------------------------------------------------');
  console.log('1. Test de l\'Écran TV Retrait Guichet (/pickup/anima-pizzeria)');
  console.log('--------------------------------------------------------------------');

  const pagePickup = await contextTV.newPage();
  try {
    const url = 'https://www.louametay.com/pickup/anima-pizzeria';
    console.log(`Navigation vers ${url}...`);
    const res = await pagePickup.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`Statut HTTP : ${res.status()}`);
    await pagePickup.waitForTimeout(3000);

    // Vérifier les éléments clés du tableau d'affichage
    const brandTitle = await pagePickup.locator('text=/Anima Pizzeria/i').first().isVisible({ timeout: 5000 }).catch(() => false);
    const colPreparing = await pagePickup.locator('text=/EN PRÉPARATION/i').first().isVisible({ timeout: 5000 }).catch(() => false);
    const colReady = await pagePickup.locator('text=/PRÊT À RETIRER/i').first().isVisible({ timeout: 5000 }).catch(() => false);
    const clockVisible = await pagePickup.locator('text=/:/').first().isVisible({ timeout: 5000 }).catch(() => false);
    const soundBtn = await pagePickup.locator('button[title*="Son"], button:has-text("Son"), button:has-text("Activer"), button:has-text("Couper")').first().isVisible({ timeout: 5000 }).catch(() => false);

    console.log(`   Marque Anima Pizzeria affichée : ${brandTitle}`);
    console.log(`   Colonne "EN PRÉPARATION" présente : ${colPreparing}`);
    console.log(`   Colonne "PRÊT À RETIRER" présente : ${colReady}`);
    console.log(`   Horloge temps réel visible : ${clockVisible}`);

    const shotPickup = path.join(CAPTURES_DIR, 'pickup_screen_anima_pizzeria_1080p.png');
    const shotPickupArtifact = path.join(ARTIFACT_DIR, 'pickup_screen_anima_pizzeria_1080p.png');
    await pagePickup.screenshot({ path: shotPickup, fullPage: false });
    fs.copyFileSync(shotPickup, shotPickupArtifact);
    console.log(`   📸 Preuve HD 1080p enregistrée : pickup_screen_anima_pizzeria_1080p.png`);

    results.push({
      ecran: 'Écran Retrait Guichet (/pickup)',
      etablissement: 'Anima Pizzeria',
      resolution: '1920x1080 (Full HD)',
      statut: colPreparing && colReady ? '100% OPÉRATIONNEL ✅' : 'Échec partiel ❌'
    });
  } catch (err) {
    console.error('Erreur Test 1:', err.message);
  } finally {
    await pagePickup.close();
  }

  // --------------------------------------------------------------------------
  // TEST 2 : Sécurité Paywall (Pack Guard) sur Madiba Restaurant (Non éligible)
  // --------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------');
  console.log('2. Test de Protection Paywall Serveur (/pickup/madiba-restaurant)');
  console.log('--------------------------------------------------------------------');

  const pagePaywall = await contextTV.newPage();
  try {
    const url = 'https://www.louametay.com/pickup/madiba-restaurant';
    console.log(`Navigation vers ${url}...`);
    const res = await pagePaywall.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`Statut HTTP de la page : ${res.status()}`);
    await pagePaywall.waitForTimeout(3000);

    // Vérifier si le message de verrouillage ou l'écran bloqué apparaît
    const paywallMsg = await pagePaywall.locator('text=/XÉWEUL/i, text=/formule/i, text=/Verrouillé/i, text=/Accès réservé/i').first().isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`   Message de verrouillage / Paywall détecté : ${paywallMsg}`);

    const shotPaywall = path.join(CAPTURES_DIR, 'pickup_screen_paywall_madiba_1080p.png');
    const shotPaywallArtifact = path.join(ARTIFACT_DIR, 'pickup_screen_paywall_madiba_1080p.png');
    await pagePaywall.screenshot({ path: shotPaywall, fullPage: false });
    fs.copyFileSync(shotPaywall, shotPaywallArtifact);
    console.log(`   📸 Preuve Paywall enregistrée : pickup_screen_paywall_madiba_1080p.png`);

    results.push({
      ecran: 'Protection Paywall Pack (/pickup)',
      etablissement: 'Madiba Restaurant',
      resolution: '1920x1080 (Full HD)',
      statut: paywallMsg ? 'CONFORME (Bloqué proprement) 🔒' : 'À auditer'
    });
  } catch (err) {
    console.error('Erreur Test 2:', err.message);
  } finally {
    await pagePaywall.close();
  }

  // --------------------------------------------------------------------------
  // TEST 3 : Digital Signage - Mode Classic (/display/anima-pizzeria?mode=classic)
  // --------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------');
  console.log('3. Test Digital Signage - Mode Classic Full HD');
  console.log('--------------------------------------------------------------------');

  const pageClassic = await contextTV.newPage();
  try {
    const url = 'https://www.louametay.com/display/anima-pizzeria?mode=classic';
    console.log(`Navigation vers ${url}...`);
    await pageClassic.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await pageClassic.waitForTimeout(3000);

    const hasContent = await pageClassic.locator('main, [class*="grid"], h1, h2').first().isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`   Contenu Menu Board Classic rendu : ${hasContent}`);

    const shotClassic = path.join(CAPTURES_DIR, 'display_tv_classic_anima_1080p.png');
    const shotClassicArtifact = path.join(ARTIFACT_DIR, 'display_tv_classic_anima_1080p.png');
    await pageClassic.screenshot({ path: shotClassic, fullPage: false });
    fs.copyFileSync(shotClassic, shotClassicArtifact);
    console.log(`   📸 Preuve Classic enregistrée : display_tv_classic_anima_1080p.png`);

    results.push({
      ecran: 'Menu Board Classic (/display?mode=classic)',
      etablissement: 'Anima Pizzeria',
      resolution: '1920x1080 (Full HD)',
      statut: hasContent ? '100% OPÉRATIONNEL ✅' : 'Échec rendu ❌'
    });
  } catch (err) {
    console.error('Erreur Test 3:', err.message);
  } finally {
    await pageClassic.close();
  }

  // --------------------------------------------------------------------------
  // TEST 4 : Digital Signage - Mode Slideshow (/display/anima-pizzeria?mode=slideshow)
  // --------------------------------------------------------------------------
  console.log('\n--------------------------------------------------------------------');
  console.log('4. Test Digital Signage - Mode Slideshow Cinématique');
  console.log('--------------------------------------------------------------------');

  const pageSlideshow = await contextTV.newPage();
  try {
    const url = 'https://www.louametay.com/display/anima-pizzeria?mode=slideshow';
    console.log(`Navigation vers ${url}...`);
    await pageSlideshow.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await pageSlideshow.waitForTimeout(3000);

    const hasSlide = await pageSlideshow.locator('img, h1, h2, [class*="slide"]').first().isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`   Plat en vedette Slideshow rendu : ${hasSlide}`);

    const shotSlideshow = path.join(CAPTURES_DIR, 'display_tv_slideshow_anima_1080p.png');
    const shotSlideshowArtifact = path.join(ARTIFACT_DIR, 'display_tv_slideshow_anima_1080p.png');
    await pageSlideshow.screenshot({ path: shotSlideshow, fullPage: false });
    fs.copyFileSync(shotSlideshow, shotSlideshowArtifact);
    console.log(`   📸 Preuve Slideshow enregistrée : display_tv_slideshow_anima_1080p.png`);

    results.push({
      ecran: 'Diaporama Cinématique (/display?mode=slideshow)',
      etablissement: 'Anima Pizzeria',
      resolution: '1920x1080 (Full HD)',
      statut: hasSlide ? '100% OPÉRATIONNEL ✅' : 'Échec rendu ❌'
    });
  } catch (err) {
    console.error('Erreur Test 4:', err.message);
  } finally {
    await pageSlideshow.close();
  }

  await browser.close();

  console.log('\n====================================================================');
  console.log('📊 SYNTHÈSE DES TESTS ÉCRANS TV & RETRAIT (OPTION 3)');
  console.log('====================================================================');
  console.table(results);
}

verifyPickupAndTvDisplay().catch(console.error);
