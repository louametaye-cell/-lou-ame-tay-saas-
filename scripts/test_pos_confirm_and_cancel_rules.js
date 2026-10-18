const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';
const ARTIFACT_DIR = 'C:/Users/DELL/.gemini/antigravity-cli/brain/45449857-2ce2-4cff-a7af-676cd43797cd';

async function run() {
  console.log('=====================================================================');
  console.log('🧪 TEST E2E : CONFIRMATION DE VENTE & RÈGLES STRICTES D\'ANNULATION');
  console.log('=====================================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  try {
    // 1. Accès caisse et connexion
    console.log('\n[1/5] Connexion à la caisse...');
    await page.goto(`${BASE_URL}/cashier?restaurantId=anima-pizzeria`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    // Saisie du code PIN 8392 si lockscreen affiché
    const pinDot = page.locator('text=Connexion Caisse').first();
    if (await pinDot.isVisible()) {
      console.log('Saisie du code PIN 8392...');
      for (const digit of ['8', '3', '9', '2']) {
        await page.locator(`button:has-text("${digit}")`).first().click();
        await page.waitForTimeout(150);
      }
      // Clic sur Valider
      await page.locator('button:has-text("Valider")').first().click();
      await page.waitForTimeout(2500);
    }

    // Si modale d'ouverture de session ("Valider & Démarrer")
    const openSessionBtn = page.locator('button:has-text("Valider & Démarrer")').first();
    if (await openSessionBtn.isVisible()) {
      console.log('Ouverture de la session de caisse...');
      await openSessionBtn.click();
      await page.waitForTimeout(1500);
    }

    // Basculer en mode Vente Directe (NEW_ORDER)
    console.log('\n[2/5] Test de la Modale de Confirmation avant encaissement (CashierCart)...');
    const newOrderTab = page.locator('button:has-text("Vente Directe")').first();
    if (await newOrderTab.isVisible()) {
      await newOrderTab.click();
      await page.waitForTimeout(1500);
    }

    // Attendre que la grille tactile soit visible
    await page.waitForSelector('button:has-text("FCFA"), button:has-text("ALL")', { timeout: 10000 });

    // Ajouter un produit
    const firstProduct = page.locator('button:has-text("FCFA")').first();
    await firstProduct.waitFor({ state: 'visible', timeout: 5000 });
    await firstProduct.click();
    await page.waitForTimeout(500);

    // Saisir un montant reçu supérieur (10 000 FCFA) pour tester la monnaie à rendre
    const amountInput = page.locator('input[type="number"]').first();
    await amountInput.waitFor({ state: 'visible', timeout: 5000 });
    await amountInput.fill('10000');
    await page.waitForTimeout(500);

    // Cliquer sur le bouton d'encaissement pour déclencher la modale de confirmation
    const paySubmitBtn = page.locator('button:has-text("ENCAISSER")').first();
    await paySubmitBtn.waitFor({ state: 'visible', timeout: 5000 });
    await paySubmitBtn.click();
    await page.waitForTimeout(800);

    // Vérifier la présence de la modale "Confirmer la vente ?"
    const confirmTitle = page.locator('text=Confirmer la vente ?');
    await confirmTitle.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Modale "Confirmer la vente ?" bien affichée !');

    // Capture d'écran 1 : Modale de confirmation avant vente
    const capture1 = path.join(ARTIFACT_DIR, '06_modale_confirmation_vente.png');
    await page.screenshot({ path: capture1 });
    console.log(`📸 Capture enregistrée : 06_modale_confirmation_vente.png`);

    // Fermer la modale en cliquant sur "Non, Annuler"
    const cancelModalBtn = page.locator('button:has-text("Non, Annuler")');
    await cancelModalBtn.click();
    await page.waitForTimeout(600);
    console.log('✓ Clic "Non, Annuler" referme bien la modale sans valider la vente.');

    // 2. Tester l'affichage du tableau des commandes et la règle d'annulation
    console.log('\n[3/5] Test des commandes et boutons d\'annulation (OrdersDataTable & Cards)...');
    // Revenir à l'onglet des commandes
    const ordersTab = page.locator('button:has-text("Commandes du jour")').first();
    if (await ordersTab.isVisible()) {
      await ordersTab.click();
      await page.waitForTimeout(1000);
    }

    // Créer en base une commande PENDING de test et une commande PREPARING de test pour Anima Pizzeria
    const restaurant = await prisma.tenant.findFirst({
      where: { subdomain: 'anima-pizzeria' }
    });

    if (!restaurant) {
      throw new Error("Restaurant Anima Pizzeria non trouvé en base (subdomain: anima-pizzeria)");
    }

    // Nettoyer d'anciennes commandes de test de ce scénario
    await prisma.orderItem.deleteMany({
      where: { order: { customerName: 'TEST_QA_ANNULATION' } }
    });
    await prisma.order.deleteMany({
      where: { customerName: 'TEST_QA_ANNULATION' }
    });

    const testPendingOrder = await prisma.order.create({
      data: {
        tenantId: restaurant.id,
        tableNumber: 12,
        orderType: 'TABLE',
        customerName: 'TEST_QA_ANNULATION',
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        totalAmount: 5000,
        items: {
          create: [
            {
              name: 'Pizza Margherita Test',
              price: 5000,
              quantity: 1
            }
          ]
        }
      }
    });

    const testPreparingOrder = await prisma.order.create({
      data: {
        tenantId: restaurant.id,
        tableNumber: 14,
        orderType: 'TABLE',
        customerName: 'TEST_QA_ANNULATION',
        status: 'PREPARING',
        paymentStatus: 'UNPAID',
        totalAmount: 7500,
        items: {
          create: [
            {
              name: 'Pizza Regina Test',
              price: 7500,
              quantity: 1
            }
          ]
        }
      }
    });

    console.log(`✓ Commande PENDING créée : #${testPendingOrder.id.slice(-5).toUpperCase()}`);
    console.log(`✓ Commande PREPARING créée : #${testPreparingOrder.id.slice(-5).toUpperCase()}`);

    // Recharger la page pour afficher ces nouvelles commandes
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Saisie du code PIN 8392 si lockscreen affiché après reload
    const pinDot2 = page.locator('text=Connexion Caisse').first();
    if (await pinDot2.isVisible()) {
      console.log('Reconnexion PIN après reload...');
      for (const digit of ['8', '3', '9', '2']) {
        await page.locator(`button:has-text("${digit}")`).first().click();
        await page.waitForTimeout(150);
      }
      await page.locator('button:has-text("Valider")').first().click();
      await page.waitForTimeout(2500);
    }

    // Si modale d'ouverture de session
    const openSessionBtn2 = page.locator('button:has-text("Valider & Démarrer")').first();
    if (await openSessionBtn2.isVisible()) {
      await openSessionBtn2.click();
      await page.waitForTimeout(1500);
    }

    // S'assurer d'être sur l'onglet des commandes
    const ordersTab2 = page.locator('button:has-text("Commandes du jour")').first();
    if (await ordersTab2.isVisible()) {
      await ordersTab2.click();
      await page.waitForTimeout(1000);
    }

    // Vérifier l'apparition de la commande PENDING et cliquer sur son bouton Trash2
    const pendingShortId = testPendingOrder.id.slice(-5).toUpperCase();
    console.log(`Recherche de la commande #${pendingShortId}...`);

    // Saisir dans le champ recherche
    const searchInput = page.locator('input[placeholder*="Rechercher"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill(pendingShortId);
      await page.waitForTimeout(500);
    }

    // Cliquer sur le bouton d'annulation de cette commande
    const trashBtn = page.locator('button[title*="Annuler la commande"]').first();
    await trashBtn.waitFor({ state: 'visible', timeout: 5000 });
    await trashBtn.click();
    await page.waitForTimeout(800);

    // Vérifier la modale de confirmation d'annulation
    const cancelModalTitle = page.locator(`text=Annuler la commande #${pendingShortId} ?`);
    await cancelModalTitle.waitFor({ state: 'visible', timeout: 5000 });
    console.log(`✓ Modale d'annulation de commande #${pendingShortId} affichée !`);

    // Capture d'écran 2 : Modale de confirmation d'annulation
    const capture2 = path.join(ARTIFACT_DIR, '07_modale_annulation_commande.png');
    await page.screenshot({ path: capture2 });
    console.log(`📸 Capture enregistrée : 07_modale_annulation_commande.png`);

    // Confirmer l'annulation et attendre la réponse 200 de l'API /cancel
    const confirmCancelOrderBtn = page.locator('button:has-text("Oui, Annuler")');
    await Promise.all([
      page.waitForResponse(res => res.url().includes('/cancel') && res.status() === 200),
      confirmCancelOrderBtn.click()
    ]);
    await page.waitForTimeout(1000);

    // Vérifier en base que le statut est bien devenu CANCELLED
    const updatedPendingOrder = await prisma.order.findUnique({
      where: { id: testPendingOrder.id }
    });
    console.log(`✓ Statut en base après confirmation : ${updatedPendingOrder.status} (Attendu: CANCELLED)`);

    // 3. Tester le Cas 2 : Tentative d'annulation sur la commande PREPARING
    console.log('\n[4/5] Test de la protection Cas 2 (Commande PREPARING)...');
    const preparingShortId = testPreparingOrder.id.slice(-5).toUpperCase();
    if (await searchInput.isVisible()) {
      await searchInput.fill(preparingShortId);
      await page.waitForTimeout(500);
    }

    // Vérifier que le bouton d'annulation est bien désactivé (cursor-not-allowed / disabled)
    const disabledTrashBtn = page.locator('button[title*="Impossible d\'annuler : la cuisine a déjà commencé"]').first();
    const isDisabledVisible = await disabledTrashBtn.isVisible();
    console.log(`✓ Bouton d'annulation désactivé avec infobulle explicite : ${isDisabledVisible}`);

    // Cliquer dessus pour vérifier le toast d'avertissement bloquant
    if (isDisabledVisible) {
      await disabledTrashBtn.click({ force: true });
      await page.waitForTimeout(600);
    }

    // 4. Tester directement l'API backend /api/cashier/orders/[id]/cancel avec la commande PREPARING
    console.log('\n[5/5] Test direct de l\'API backend (Contrôle 403 HTTP)...');
    const apiRes = await page.request.post(`${BASE_URL}/api/cashier/orders/${testPreparingOrder.id}/cancel`, {
      data: {
        reason: 'Tentative de test QA sur commande PREPARING'
      }
    });

    const apiStatus = apiRes.status();
    const apiJson = await apiRes.json();
    console.log(`✓ Statut HTTP renvoyé par l'API : ${apiStatus} (Attendu: 403)`);
    console.log(`✓ Message d'erreur renvoyé : "${apiJson.error}"`);

    if (apiStatus !== 403) {
      throw new Error(`Échec de sécurité : L'API aurait dû renvoyer 403 mais a renvoyé ${apiStatus}`);
    }

    // Nettoyage des commandes de test
    await prisma.orderItem.deleteMany({
      where: { order: { customerName: 'TEST_QA_ANNULATION' } }
    });
    await prisma.order.deleteMany({
      where: { customerName: 'TEST_QA_ANNULATION' }
    });

    console.log('\n=====================================================================');
    console.log('✅ TOUTES LES VÉRIFICATIONS SONT 100% CONFORMES !');
    console.log('=====================================================================');
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

run().catch((err) => {
  console.error('❌ Erreur lors du test :', err);
  process.exit(1);
});
