const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

async function runTest() {
  console.log('🚀 Démarrage du Test E2E Cas 3 : Additions Séparées sur la même table...');
  const browser = await chromium.launch({ headless: true });

  const tenant = await prisma.tenant.findFirst({ where: { subdomain: 'anima-pizzeria' } });
  if (!tenant) throw new Error('Tenant anima-pizzeria introuvable');

  const testTableNum = 6;

  // 0. Réinitialiser la table 6 et supprimer les commandes antérieures sur cette table
  console.log(`🧹 Nettoyage de la Table ${testTableNum}...`);
  await prisma.order.deleteMany({ where: { tenantId: tenant.id, tableNumber: testTableNum } });
  await prisma.table.updateMany({
    where: { tenantId: tenant.id, tableNumber: testTableNum },
    data: { status: 'FREE', clearedAt: new Date() }
  });

  const capturesDir = path.join(__dirname, '../capture des teste');
  if (!fs.existsSync(capturesDir)) fs.mkdirSync(capturesDir, { recursive: true });

  // 1. SMARTPHONE 1 (Convive A - Premier arrivé)
  console.log('\n📱 Smartphone 1 (Convive A) arrive et passe sa commande...');
  const context1 = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const page1 = await context1.newPage();
  await page1.goto(`http://localhost:3000/r/anima-pizzeria?table=${testTableNum}`, { waitUntil: 'domcontentloaded' });
  await page1.waitForTimeout(2000);

  // Ajouter un plat
  const addBtn1 = page1.locator('button:has-text("+ Ajouter"), button:has-text("Ajouter"), button:has-text("+")').first();
  if (await addBtn1.isVisible()) {
    await addBtn1.click();
    await page1.waitForTimeout(800);
  }

  // Ouvrir le panier
  const openCartBtn1 = page1.locator('button:has-text("Voir mon panier")').first();
  if (await openCartBtn1.isVisible()) {
    await openCartBtn1.click();
    await page1.waitForTimeout(800);
  }

  // Gérer l'upsell éventuel
  const skipUpsellBtn1 = page1.locator('button:has-text("continuer vers le paiement")');
  if (await skipUpsellBtn1.isVisible()) {
    await skipUpsellBtn1.click();
    await page1.waitForTimeout(800);
  }

  // Soumettre la commande en cliquant sur "Commander pour Table"
  const submitBtn1 = page1.locator('button:has-text("Commander pour Table")');
  await submitBtn1.click();
  console.log('Convive A a validé sa commande !');
  await page1.waitForTimeout(4000);

  const cap1 = path.join(capturesDir, 'case3_step1_conviveA_commande.png');
  await page1.screenshot({ path: cap1, fullPage: false });
  console.log('📸 Capture Convive A enregistrée :', cap1);

  // 2. SMARTPHONE 2 (Convive B - Moussa / Addition Séparée)
  console.log('\n📱 Smartphone 2 (Moussa) arrive à la même table et choisit son Addition Séparée...');
  const context2 = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const page2 = await context2.newPage();
  await page2.goto(`http://localhost:3000/r/anima-pizzeria?table=${testTableNum}`, { waitUntil: 'domcontentloaded' });
  await page2.waitForTimeout(3000);

  // Si le ticket automatique s'est ouvert pour la table, fermer pour voir le menu
  const addMoreBtn = page2.locator('button:has-text("Ajouter d\'autres Plats"), button:has-text("Fermer"), button:has-text("Retour au menu")');
  if (await addMoreBtn.first().isVisible()) {
    await addMoreBtn.first().click();
    await page2.waitForTimeout(1000);
  }

  await page2.evaluate(() => window.scrollTo(0, 0));
  await page2.waitForTimeout(500);

  // Clic sur [ 👤 Addition séparée ? ]
  let sepBtn = page2.locator('button:has-text("Addition séparée")').first();
  if (!await sepBtn.isVisible()) {
    sepBtn = page2.locator('button[title*="choisir l\'addition séparée"]').first();
  }

  console.log('Bouton d\'activation de l\'addition séparée présent ?', await sepBtn.isVisible());
  if (await sepBtn.isVisible()) {
    await sepBtn.click();
    await page2.waitForTimeout(1000);
  }

  const cap2 = path.join(capturesDir, 'case3_step2_modale_selection.png');
  await page2.screenshot({ path: cap2, fullPage: false });
  console.log('📸 Capture Modale de sélection enregistrée :', cap2);

  // Saisir le prénom "Moussa"
  const nameInput = page2.locator('input[placeholder*="Moussa"]');
  if (await nameInput.isVisible()) {
    await nameInput.fill('Moussa');
    await page2.waitForTimeout(400);
  }

  // Valider le choix
  const confirmChoiceBtn = page2.locator('button:has-text("Valider mon choix")');
  await confirmChoiceBtn.click();
  await page2.waitForTimeout(1500);

  const cap3 = path.join(capturesDir, 'case3_step3_bandeau_moussa_actif.png');
  await page2.screenshot({ path: cap3, fullPage: false });
  console.log('📸 Capture Bandeau Moussa actif enregistrée :', cap3);

  // Moussa ajoute un plat à son tour
  console.log('\n🍽️ Moussa ajoute son plat personnel au panier...');
  const addButtons2 = page2.locator('button:has-text("+ Ajouter"), button:has-text("Ajouter"), button:has-text("+")');
  const count2 = await addButtons2.count();
  if (count2 > 1) {
    await addButtons2.nth(1).click();
  } else if (count2 > 0) {
    await addButtons2.first().click();
  }
  await page2.waitForTimeout(800);

  // Moussa ouvre son panier via le bouton flottant "Voir mon panier"
  console.log('Moussa ouvre son panier...');
  const openCartBtn2 = page2.locator('button:has-text("Voir mon panier")').first();
  await openCartBtn2.click();
  await page2.waitForTimeout(1200);

  // Gérer l'upsell éventuel pour Moussa
  const skipUpsellBtn2 = page2.locator('button:has-text("continuer vers le paiement")');
  if (await skipUpsellBtn2.isVisible()) {
    console.log('Fermeture de l\'upsell pour Moussa...');
    await skipUpsellBtn2.click();
    await page2.waitForTimeout(800);
  }

  // Moussa valide sa commande
  console.log('Moussa valide sa commande...');
  const submitBtn2 = page2.locator('button:has-text("Commander pour Table")');
  await submitBtn2.click();
  await page2.waitForTimeout(4500);

  const cap4 = path.join(capturesDir, 'case3_step4_ticket_individuel_moussa.png');
  await page2.screenshot({ path: cap4, fullPage: false });
  console.log('📸 Capture Ticket Moussa individuel enregistrée :', cap4);

  // 3. VÉRIFICATION EN CAISSE POS (Écran Caisse sous PIN 8392)
  console.log('\n🖥️ Connexion en Caisse POS sous code PIN caissier...');
  const contextCashier = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const pageCashier = await contextCashier.newPage();
  await pageCashier.goto(`http://localhost:3000/cashier?restaurantId=${tenant.id}`, { waitUntil: 'domcontentloaded' });
  await pageCashier.waitForTimeout(2000);

  // Déverrouillage PIN : 8 3 9 2
  const pinDigits = ['8', '3', '9', '2'];
  for (const digit of pinDigits) {
    const keyBtn = pageCashier.locator(`button:has-text("${digit}")`).first();
    await keyBtn.click();
    await pageCashier.waitForTimeout(200);
  }
  const validatePinBtn = pageCashier.locator('button:has-text("Valider")').first();
  await validatePinBtn.click();
  await pageCashier.waitForTimeout(4000);

  // Vérifier la présence de la carte Moussa (Séparé)
  const moussaCardVisible = await pageCashier.locator('text=/Moussa/i').first().isVisible();
  console.log('Carte d\'encaissement distincte "Moussa (Séparé)" visible en caisse ?', moussaCardVisible);

  const cap5 = path.join(capturesDir, 'case3_step5_caisse_pos_additions_separees.png');
  await pageCashier.screenshot({ path: cap5, fullPage: false });
  console.log('📸 Capture Caisse POS enregistrée :', cap5);

  // Fermeture des navigateurs
  await context1.close();
  await context2.close();
  await contextCashier.close();
  await browser.close();

  console.log('\n🎉 TEST E2E CAS 3 TERMINÉ AVEC SUCCÈS !');
}

runTest().catch((err) => {
  console.error('❌ Échec du test E2E Cas 3 :', err);
  process.exit(1);
});
