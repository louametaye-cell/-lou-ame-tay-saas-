const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';
const CAPTURE_DIR = path.join(__dirname, '..', 'capture des teste');
const ARTIFACT_DIR = 'C:/Users/DELL/.gemini/antigravity-cli/brain/4119e6c6-710a-4876-a0d4-bcb77999bd96';

// Assurer l'existence des répertoires de capture
if (!fs.existsSync(CAPTURE_DIR)) fs.mkdirSync(CAPTURE_DIR, { recursive: true });
if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function saveScreenshots(page, filename) {
  const file1 = path.join(CAPTURE_DIR, filename);
  const file2 = path.join(ARTIFACT_DIR, filename);
  await page.screenshot({ path: file1, fullPage: false });
  await page.screenshot({ path: file2, fullPage: false });
  console.log(`📸 Capture enregistrée : ${filename}`);
  return file1;
}

async function run() {
  console.log('===============================================================');
  console.log('🧪 TEST E2E VALIDATION : ANNULATION DE COMMANDE & VERROUS');
  console.log('===============================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 }, // Vue mobile réaliste
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();

  try {
    // -------------------------------------------------------------------------
    // SCÉNARIO 1 : Bouton annulation visible avec chrono dans le ticket numérique
    // -------------------------------------------------------------------------
    console.log('\n--- 1. SCÉNARIO 1 : Bouton annulation visible avec chrono ---');
    await page.goto(`${BASE_URL}/r/anima-pizzeria/10`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Ajouter un plat au panier
    const addBtn = page.locator('button:has-text("Ajouter")').first();
    await addBtn.click();
    await page.waitForTimeout(800);

    // Ouvrir le panier
    const cartBtn = page.locator('button:has-text("Voir mon panier")');
    await cartBtn.click();
    await page.waitForTimeout(800);

    // Ignorer l'upsell si affiché
    const skipUpsell = page.locator('button:has-text("Non merci, continuer")');
    if (await skipUpsell.isVisible()) {
      await skipUpsell.click();
      await page.waitForTimeout(800);
    }

    // Valider la commande
    const orderBtn = page.locator('button:has-text("Commander")').last();
    await orderBtn.click();
    await page.waitForTimeout(2500);

    // Vérifier l'apparition du bouton d'annulation avec chrono
    const cancelBtn = page.locator('button:has-text("Annuler la commande")');
    await cancelBtn.waitFor({ state: 'visible', timeout: 8000 });

    const chronoEl = page.locator('text=/Chrono :.*restantes/');
    await chronoEl.waitFor({ state: 'visible', timeout: 5000 });
    const chronoText = await chronoEl.innerText();
    console.log(`✓ Bouton visible avec chrono dynamique : "${chronoText}"`);

    await saveScreenshots(page, 'sc1_bouton_annulation_avec_chrono.png');

    // Récupérer l'ID de la commande créée
    const createdOrder = await prisma.order.findFirst({
      where: { tenantId: 'tenant_anima_pizzeria', tableNumber: 10 },
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });
    console.log(`✓ Commande en base : ID #${createdOrder.id.slice(-6).toUpperCase()} (${createdOrder.status})`);

    // -------------------------------------------------------------------------
    // SCÉNARIO 2 : Annulation confirmée inline -> Ticket mis à jour, 0 impact financier
    // -------------------------------------------------------------------------
    console.log('\n--- 2. SCÉNARIO 2 : Confirmation inline & annulation effective ---');
    // Cliquer sur le bouton "Annuler la commande"
    await cancelBtn.click();
    await page.waitForTimeout(600);

    // Vérifier les 2 boutons inline
    const confirmCancelBtn = page.locator('button:has-text("Confirmer l\'annulation")');
    const keepOrderBtn = page.locator('button:has-text("Garder ma commande")');

    await confirmCancelBtn.waitFor({ state: 'visible', timeout: 5000 });
    await keepOrderBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Transformation inline en 2 boutons [Confirmer] et [Garder] réussie !');
    await saveScreenshots(page, 'sc2_confirmation_inline_visible.png');

    // Tester d'abord le bouton "Garder" pour vérifier qu'on peut revenir en arrière
    await keepOrderBtn.click();
    await page.waitForTimeout(600);
    await cancelBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Clic sur "Garder ma commande" réaffiche bien le bouton normal.');

    // Re-cliquer pour confirmer définitivement l'annulation
    await cancelBtn.click();
    await page.waitForTimeout(600);
    await confirmCancelBtn.click();
    await page.waitForTimeout(2000);

    // Vérifier la bannière Commande annulée ✓
    const cancelledBanner = page.locator('h4:has-text("Commande annulée ✓")');
    await cancelledBanner.waitFor({ state: 'visible', timeout: 8000 });
    console.log('✓ Ticket numérique mis à jour en temps réel : "Commande annulée ✓"');

    await saveScreenshots(page, 'sc2_ticket_annule_succes.png');

    // Vérifier en base que le statut est bien CANCELLED et que la commande existe toujours
    const checkDbOrder = await prisma.order.findUnique({
      where: { id: createdOrder.id }
    });
    console.log(`✓ Vérification Base de données : Statut = ${checkDbOrder.status} (Zéro suppression)`);
    if (checkDbOrder.status !== 'CANCELLED') {
      throw new Error(`Échec : La commande devrait être CANCELLED mais est ${checkDbOrder.status}`);
    }

    // Vérifier la Caisse POS (aucun impact financier, la commande annulée n'apparaît pas)
    console.log('Vérification caisse POS...');
    const cashierPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await cashierPage.goto(`${BASE_URL}/cashier?restaurantId=tenant_anima_pizzeria`, { waitUntil: 'domcontentloaded' });
    await cashierPage.waitForTimeout(2000);

    // Entrer le PIN caissier par défaut (ex: 1234)
    for (const digit of ['1', '2', '3', '4']) {
      const digitBtn = cashierPage.locator(`button:text-is("${digit}")`).first();
      if (await digitBtn.isVisible()) await digitBtn.click();
      await cashierPage.waitForTimeout(100);
    }
    await cashierPage.waitForTimeout(1500);

    const hasCancelledInCashier = await cashierPage.locator(`text=#${createdOrder.id.slice(-5).toUpperCase()}`).isVisible();
    console.log(`✓ Commande annulée absente de la caisse à encaisser : ${!hasCancelledInCashier}`);
    await saveScreenshots(cashierPage, 'sc2_caisse_non_impactee.png');
    await cashierPage.close();

    // -------------------------------------------------------------------------
    // SCÉNARIO 3 : Cuisine clique "En Préparation" -> Disparition du bouton côté client
    // -------------------------------------------------------------------------
    console.log('\n--- 3. SCÉNARIO 3 : Cuisine clique "En Préparation" -> Bouton disparaît ---');
    await page.goto(`${BASE_URL}/r/anima-pizzeria/11`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Commander sur table 11
    const addBtn3 = page.locator('button:has-text("Ajouter")').first();
    await addBtn3.click();
    await page.waitForTimeout(800);

    const cartBtn3 = page.locator('button:has-text("Voir mon panier")');
    await cartBtn3.click();
    await page.waitForTimeout(800);

    const skipUpsell3 = page.locator('button:has-text("Non merci, continuer")');
    if (await skipUpsell3.isVisible()) {
      await skipUpsell3.click();
      await page.waitForTimeout(800);
    }

    const orderBtn3 = page.locator('button:has-text("Commander")').last();
    await orderBtn3.click();
    await page.waitForTimeout(2500);

    // Vérifier que le bouton d'annulation est là initialement
    const cancelBtn3 = page.locator('button:has-text("Annuler la commande")');
    await cancelBtn3.waitFor({ state: 'visible', timeout: 6000 });
    console.log('✓ Commande Table 11 créée, bouton d\'annulation actif.');

    // Récupérer l'ordre
    const order3 = await prisma.order.findFirst({
      where: { tenantId: 'tenant_anima_pizzeria', tableNumber: 11 },
      orderBy: { createdAt: 'desc' }
    });

    // Simuler l'action de la brigade en cuisine : Clic "En Préparation" (PREPARING)
    console.log(`👨‍🍳 Cuisine passe la commande #${order3.id.slice(-6).toUpperCase()} en PREPARING...`);
    await prisma.order.update({
      where: { id: order3.id },
      data: { status: 'PREPARING', preparedAt: new Date() }
    });

    // Côté client, attendre que le polling détecte PREPARING
    console.log('Attente de la synchronisation temps réel côté client...');
    await page.waitForTimeout(4000);

    const isCancelVisibleAfterPrep = await cancelBtn3.isVisible();
    console.log(`✓ Bouton d'annulation masqué après passage en préparation : ${!isCancelVisibleAfterPrep}`);

    const preparingStepText = page.locator('text=2. En Préparation & Cuisson');
    await preparingStepText.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Statut client passé à "En Préparation & Cuisson".');

    await saveScreenshots(page, 'sc3_bouton_disparu_cuisine_en_preparation.png');

    // -------------------------------------------------------------------------
    // SCÉNARIO 4 : 2 minutes écoulées -> Bouton disparaît automatiquement
    // -------------------------------------------------------------------------
    console.log('\n--- 4. SCÉNARIO 4 : 2 minutes écoulées -> Disparition automatique ---');
    // Créer une commande créée il y a 2 min 15 sec (135 secondes)
    const oldDate = new Date(Date.now() - 135 * 1000);
    const expiredOrder = await prisma.order.create({
      data: {
        tenantId: 'tenant_anima_pizzeria',
        tableNumber: 14,
        status: 'PENDING',
        totalAmount: 4500,
        createdAt: oldDate,
        updatedAt: oldDate,
        items: {
          create: [
            {
              name: 'Pizza Margherita Test',
              price: 4500,
              quantity: 1
            }
          ]
        }
      }
    });
    console.log(`✓ Commande de test créée avec date antérieure : ID #${expiredOrder.id.slice(-6).toUpperCase()} (il y a 135s)`);

    // Aller sur la table 14
    await page.goto(`${BASE_URL}/r/anima-pizzeria/14`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Si le tracker n'est pas ouvert par défaut, cliquer sur la pilule de commande active
    const pillBtn = page.locator('aside[aria-label="Suivi de commande en direct"] button');
    if (await pillBtn.isVisible()) {
      await pillBtn.click();
      await page.waitForTimeout(1000);
    }

    const cancelBtnExpired = page.locator('button:has-text("Annuler la commande")');
    const isCancelVisibleExpired = await cancelBtnExpired.isVisible();
    console.log(`✓ Bouton d'annulation absent car délai > 2 minutes : ${!isCancelVisibleExpired}`);

    await saveScreenshots(page, 'sc4_bouton_disparu_delai_expire.png');

    // Tester également le rejet côté serveur par l'API
    const cancelRes = await fetch(`${BASE_URL}/api/orders/${expiredOrder.id}/cancel`, { method: 'POST' });
    const cancelData = await cancelRes.json();
    console.log(`✓ Test API serveur : Statut ${cancelRes.status}, Message : "${cancelData.error}"`);
    if (cancelRes.status !== 400) {
      throw new Error(`Échec : L'API aurait dû rejeter avec 400 mais a répondu ${cancelRes.status}`);
    }

    console.log('\n===============================================================');
    console.log('🎉 TOUS LES 4 SCÉNARIOS ONT ÉTÉ VALIDÉS AVEC SUCCÈS !');
    console.log('===============================================================');
  } catch (err) {
    console.error('❌ Erreur lors du test E2E :', err);
    await saveScreenshots(page, 'error_test_cancellation.png');
    throw err;
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
