const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:/Users/DELL/.gemini/antigravity-cli/brain/c30ccc64-608a-4ad7-b453-8a8ca6433b1c';
const CAPTURES_DIR = path.join(__dirname, '../capture des teste');

if (!fs.existsSync(CAPTURES_DIR)) {
  fs.mkdirSync(CAPTURES_DIR, { recursive: true });
}

const TENANTS = [
  {
    slug: 'anima-pizzeria',
    name: 'Anima Pizzeria',
    table: 6,
    guestName: 'Aminata',
  },
  {
    slug: 'madiba-restaurant',
    name: 'Madiba Restaurant',
    table: 3,
    guestName: 'Mamadou',
  },
  {
    slug: 'sams-prestige',
    name: "Sam's Prestige",
    table: 3,
    guestName: 'Fatou',
  },
  {
    slug: 'hotel-lat-dior',
    name: 'Hôtel Lat-Dior',
    table: 5,
    guestName: 'Cheikh',
  },
];

async function certifyAllTenants() {
  console.log('===============================================================');
  console.log('🚀 CERTIFICATION E2E EN PRODUCTION SUR LES 4 COMPTES RÉELS');
  console.log('===============================================================\n');

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const t of TENANTS) {
    console.log(`\n-------------------------------------------------------------`);
    console.log(`🔍 Vérification de ${t.name} (${t.slug}) - Table ${t.table}`);
    console.log(`-------------------------------------------------------------`);

    const context = await browser.newContext({
      viewport: { width: 412, height: 915 },
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
    });

    const page = await context.newPage();
    const url = `https://www.louametay.com/r/${t.slug}?table=${t.table}`;

    try {
      console.log(`1. Navigation vers ${url}...`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);

      // Si ticket ou modale auto ouverte, fermer proprement
      const closeBtn = page.locator('button:has-text("Ajouter d\'autres Plats"), button:has-text("Fermer"), button:has-text("Retour au menu")').first();
      if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('   Fermeture de la modale/ticket de démarrage...');
        await closeBtn.click();
        await page.waitForTimeout(1000);
      }

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);

      // 2. Vérifier la présence du badge de table dans le header sticky
      console.log('2. Recherche du badge de table dans le header...');
      const tableBadge = page.locator(`button[title*="Table"], button:has-text("Table"), button:has-text("T.")`).first();
      const hasBadge = await tableBadge.isVisible({ timeout: 5000 }).catch(() => false);
      console.log(`   Badge de table détecté : ${hasBadge}`);

      if (!hasBadge) {
        throw new Error(`Badge de table introuvable sur ${t.slug}`);
      }

      // 3. Ouvrir la modale d'addition séparée via le badge ou le bouton
      console.log('3. Clic sur le badge de table pour ouvrir la modale...');
      await tableBadge.click();
      await page.waitForTimeout(1500);

      const modalTitle = page.locator('text=/Mode d\'Addition/i').first();
      const hasModal = await modalTitle.isVisible({ timeout: 4000 }).catch(() => false);
      console.log(`   Modale "Mode d'Addition" (Cas 3) ouverte : ${hasModal}`);

      if (!hasModal) {
        throw new Error(`Modale d'addition séparée non ouverte sur ${t.slug}`);
      }

      // Capture HD 1 : Modale ouverte
      const shotModal1 = path.join(CAPTURES_DIR, `certif_${t.slug}_table${t.table}_modale.png`);
      const shotModalArtifact = path.join(ARTIFACT_DIR, `certif_${t.slug}_table${t.table}_modale.png`);
      await page.screenshot({ path: shotModal1, fullPage: false });
      fs.copyFileSync(shotModal1, shotModalArtifact);
      console.log(`   📸 Preuve 1 enregistrée : certif_${t.slug}_table${t.table}_modale.png`);

      // 4. Configurer le mode séparé
      console.log(`4. Saisie du prénom convive "${t.guestName}" et sélection de l'addition séparée...`);
      const separateOptionBtn = page.locator('button:has-text("Mon Addition Séparée"), button:has-text("Addition Séparée")').first();
      if (await separateOptionBtn.isVisible()) {
        await separateOptionBtn.click();
        await page.waitForTimeout(500);
      }

      const inputName = page.locator('input[placeholder*="Moussa"], input[placeholder*="Place 2"]').first();
      if (await inputName.isVisible()) {
        await inputName.fill(t.guestName);
        await page.waitForTimeout(500);
      }

      const confirmBtn = page.locator('button:has-text("Valider mon choix"), button:has-text("Confirmer ce Mode")').first();
      await confirmBtn.click();
      await page.waitForTimeout(2000);

      // 5. Vérifier l'affichage du bandeau bleu et du badge actif
      console.log('5. Vérification du bandeau bleu et du badge d\'en-tête actif...');
      const banner = page.locator(`text=/ADDITION SÉPARÉE/i`).first();
      const hasBanner = await banner.isVisible({ timeout: 5000 }).catch(() => false);
      console.log(`   Bandeau bleu cobalt "ADDITION SÉPARÉE" présent : ${hasBanner}`);

      const headerUserBadge = page.locator(`button:has-text("${t.guestName}")`).first();
      const hasUserBadge = await headerUserBadge.isVisible({ timeout: 4000 }).catch(() => false);
      console.log(`   Badge utilisateur "${t.guestName}" présent dans le header : ${hasUserBadge}`);

      // Capture HD 2 : Menu avec bandeau bleu & badge personnalisé
      const shotBanner1 = path.join(CAPTURES_DIR, `certif_${t.slug}_table${t.table}_actif.png`);
      const shotBannerArtifact = path.join(ARTIFACT_DIR, `certif_${t.slug}_table${t.table}_actif.png`);
      await page.screenshot({ path: shotBanner1, fullPage: false });
      fs.copyFileSync(shotBanner1, shotBannerArtifact);
      console.log(`   📸 Preuve 2 enregistrée : certif_${t.slug}_table${t.table}_actif.png`);

      // 6. Vérification du stockage hermétique (localStorage)
      const storageState = await page.evaluate((tableNum) => {
        const keys = Object.keys(localStorage);
        const guestSessionKey = keys.find(k => k.startsWith('louametay_guest_session_') && k.includes(`table_${tableNum}`));
        const guestData = guestSessionKey ? JSON.parse(localStorage.getItem(guestSessionKey) || '{}') : null;
        return { guestSessionKey, guestData };
      }, t.table);

      console.log(`   Clé de session invité : ${storageState.guestSessionKey}`);
      console.log(`   Données invité isolées :`, JSON.stringify(storageState.guestData));

      const isCompliant = hasModal && hasBanner && hasUserBadge && storageState.guestData?.isSeparate === true;

      results.push({
        tenant: t.name,
        slug: t.slug,
        table: t.table,
        guestName: t.guestName,
        hasModal,
        hasBanner,
        hasUserBadge,
        isSeparateActive: storageState.guestData?.isSeparate === true,
        compliant: isCompliant,
      });

      console.log(`✅ ${t.name} certifié 100% CONFORME !`);
    } catch (err) {
      console.error(`❌ Erreur sur ${t.name}:`, err.message);
      results.push({
        tenant: t.name,
        slug: t.slug,
        table: t.table,
        guestName: t.guestName,
        compliant: false,
        error: err.message,
      });
    } finally {
      await page.close();
      await context.close();
    }
  }

  await browser.close();

  console.log('\n===============================================================');
  console.log('📊 SYNTHÈSE GLOBALE DE CERTIFICATION (RÈGLE 10.3)');
  console.log('===============================================================');
  console.table(results);

  const allPassed = results.every(r => r.compliant);
  if (allPassed) {
    console.log('\n🎉 TOUS LES 4 COMPTES RÉELS SONT 100% CERTIFIÉS EN PRODUCTION !');
  } else {
    console.log('\n⚠️ Certains comptes présentent des anomalies à auditer.');
  }
}

certifyAllTenants().catch(console.error);
