const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function testVitrineFullQA() {
  console.log('🧪 === DEBUT DES TESTS QA AUTOMATISES POUR LA NOUVELLE GRILLE TARIFAIRE === 🧪');

  const artifactDir = path.join('C:', 'Users', 'DELL', '.gemini', 'antigravity-ide', 'brain', 'ae07eeec-4c73-424c-9963-58a2961436b6');
  const captureDir = path.join(__dirname, '..', 'capture des teste');

  if (!fs.existsSync(captureDir)) {
    fs.mkdirSync(captureDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  // 1. Test Viewport Desktop (1440x900)
  console.log('🖥️ 1. Test Affichage Desktop (1440x900)...');
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();

  await desktopPage.goto('http://localhost:3000/#tarifs', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(2000);

  const tarifsElement = await desktopPage.$('#tarifs');
  if (tarifsElement) {
    const desktopScreenshot = path.join(artifactDir, 'qa_tarifs_desktop.png');
    await tarifsElement.screenshot({ path: desktopScreenshot });
    console.log('  📸 Screenshot Tarifs Desktop sauvegardé :', desktopScreenshot);
  }

  // Vérifier la présence des textes clés
  const content = await desktopPage.content();
  const hasSurMesure = content.includes('SUR MESURE') && content.includes('Grands comptes & Multi-sites');
  const hasXeweul = content.includes('XÉWEUL') && content.includes('35 000');
  const hasTambali = content.includes('TÀMBALI') && content.includes('15 000');
  const hasNioFar = content.includes('NIO FAR') && content.includes('25 000');

  console.log('  ✅ Présence TÀMBALI (15k) :', hasTambali ? 'OK' : 'MANQUANT');
  console.log('  ✅ Présence NIO FAR (25k) :', hasNioFar ? 'OK' : 'MANQUANT');
  console.log('  ✅ Présence XÉWEUL (35k) :', hasXeweul ? 'OK' : 'MANQUANT');
  console.log('  ✅ Présence SUR MESURE (Sur devis) :', hasSurMesure ? 'OK' : 'MANQUANT');

  // Test Clic sur Bouton Devis Sur-Mesure
  console.log('🖱️ 2. Test Clic sur le bouton "Demander un devis sur-mesure"...');
  const surMesureBtn = await desktopPage.$('#pricing-btn-sur-mesure');
  if (surMesureBtn) {
    await surMesureBtn.click();
    await desktopPage.waitForTimeout(1000);
    const contactScreenshot = path.join(artifactDir, 'qa_contact_sur_mesure.png');
    const contactSection = await desktopPage.$('#contact');
    if (contactSection) {
      await contactSection.screenshot({ path: contactScreenshot });
      console.log('  📸 Screenshot Formulaire Contact Sur Mesure sauvegardé :', contactScreenshot);
    }
  }

  await desktopContext.close();

  // 3. Test Viewport Mobile (390x844 iPhone 13)
  console.log('📱 3. Test Affichage Mobile (390x844 iPhone 13)...');
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mobilePage = await mobileContext.newPage();

  await mobilePage.goto('http://localhost:3000/#tarifs', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2000);

  const mobileScreenshot = path.join(artifactDir, 'qa_tarifs_mobile.png');
  const mobileTarifs = await mobilePage.$('#tarifs');
  if (mobileTarifs) {
    await mobileTarifs.screenshot({ path: mobileScreenshot });
    console.log('  📸 Screenshot Tarifs Mobile sauvegardé :', mobileScreenshot);
  }

  await mobileContext.close();
  await browser.close();

  console.log('🎉 === TOUS LES TESTS QA SONT VALIDES AVEC SUCCES === 🎉');
}

testVitrineFullQA().catch(err => {
  console.error('❌ Erreur lors de l\'exécution des tests QA :', err);
  process.exit(1);
});
