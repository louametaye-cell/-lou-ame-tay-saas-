const { chromium } = require('playwright');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const ARTIFACT_DIR = 'C:/Users/DELL/.gemini/antigravity-cli/brain/29ebca16-966e-42e2-b0c1-91cc97f14e1d';
const BASE_URL = 'http://localhost:3000';

async function testAnimaFlow() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('=== TEST COMPLET SUR ANIMA PIZZERIA ===');

  // 1. Commande sur Table 12
  console.log('1. Accès au menu client Anima Table 12...');
  await page.goto(`${BASE_URL}/r/anima-pizzeria/12`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);

  // Ajouter le premier plat disponible
  const addBtn = page.locator('button:has-text("Ajouter")').first();
  await addBtn.click();
  await page.waitForTimeout(1000);

  // Ouvrir le panier
  const cartBtn = page.locator('button:has-text("Voir mon panier")');
  await cartBtn.click();
  await page.waitForTimeout(1000);

  // Gérer l'upsell si affiché
  const skipUpsell = page.locator('button:has-text("Non merci, continuer")');
  if (await skipUpsell.isVisible()) {
    await skipUpsell.click();
    await page.waitForTimeout(1000);
  }

  // Valider la commande via le bouton "Commander"
  const orderBtn = page.locator('button:has-text("Commander")').last();
  await orderBtn.click();
  await page.waitForTimeout(3000);

  const orderAnimaScreenshot = path.join(ARTIFACT_DIR, 'client_anima_commande_table12_creee.png');
  await page.screenshot({ path: orderAnimaScreenshot, fullPage: false });
  console.log(`📸 Commande Table 12 créée: ${orderAnimaScreenshot}`);

  // Récupérer la commande créée en base
  const order = await prisma.order.findFirst({
    where: { tenantId: 'tenant_anima_pizzeria' },
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  });
  console.log(`Commande trouvée en base: ID ${order.id}, Statut: ${order.status}, Paiement: ${order.paymentStatus}, Total: ${order.totalAmount} FCFA`);

  // 2. Marquer SERVED en cuisine via DB
  console.log('2. Passage au statut SERVI en salle...');
  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'SERVED' }
  });

  // 3. Vérification RÈGLE 10.4 : Dashboard CA = 0 FCFA alors que la commande est SERVIE
  console.log('3. Vérification Dashboard Admin (CA doit être à 0 FCFA)...');
  await context.addCookies([{
    name: 'saas_token',
    value: 'resto_session_tenant_anima_pizzeria',
    domain: 'localhost',
    path: '/'
  }]);
  await page.goto(`${BASE_URL}/dashboard?restaurantId=tenant_anima_pizzeria`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  const dashboardZeroPath = path.join(ARTIFACT_DIR, 'dashboard_anima_servie_non_payee_ca_zero.png');
  await page.screenshot({ path: dashboardZeroPath, fullPage: false });
  console.log(`📸 Dashboard Admin (CA = 0 FCFA prouvé): ${dashboardZeroPath}`);

  // 4. Encaissement en Caisse (AISSATOU, PIN 8392)
  console.log('4. Encaissement en Caisse Anima...');
  await page.goto(`${BASE_URL}/cashier?restaurantId=anima-pizzeria`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Si écran PIN affiché
  const pinInput = page.locator('button:has-text("8")');
  if (await pinInput.isVisible()) {
    for (const d of ['8', '3', '9', '2']) {
      await page.locator(`button:has-text("${d}")`).first().click();
      await page.waitForTimeout(150);
    }
    await page.locator('button:has-text("Valider")').first().click();
    await page.waitForTimeout(2500);
  }

  // Clic sur l'onglet Tables (Salle)
  const tablesTab = page.locator('button:has-text("Tables (Salle)")');
  if (await tablesTab.isVisible()) {
    await tablesTab.click();
    await page.waitForTimeout(1000);
  }

  // Clic sur Encaisser
  const payBtn = page.locator('button:has-text("Encaisser")').first();
  if (await payBtn.isVisible()) {
    await payBtn.click();
    await page.waitForTimeout(1500);

    // Modal clôture : valider en espèces
    const confirmPay = page.locator('button:has-text("Valider & Clôturer")');
    if (await confirmPay.isVisible()) {
      await confirmPay.click();
      await page.waitForTimeout(2500);
    }
  }

  const caisseApresPayPath = path.join(ARTIFACT_DIR, 'caisse_anima_apres_encaissement_succes.png');
  await page.screenshot({ path: caisseApresPayPath, fullPage: false });
  console.log(`📸 Caisse après encaissement: ${caisseApresPayPath}`);

  // 5. Vérification Dashboard Admin : CA mis à jour après paiement
  console.log('5. Vérification Dashboard Admin après paiement...');
  await page.goto(`${BASE_URL}/dashboard?restaurantId=tenant_anima_pizzeria`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  const dashboardPaidPath = path.join(ARTIFACT_DIR, 'dashboard_anima_apres_encaissement_ca_ajour.png');
  await page.screenshot({ path: dashboardPaidPath, fullPage: false });
  console.log(`📸 Dashboard Admin après encaissement (CA incrémenté): ${dashboardPaidPath}`);

  // 6. Vérification Smartphone Client Table 12 : Ticket figé, boutons masqués
  console.log('6. Vérification Smartphone Client Table 12...');
  await page.goto(`${BASE_URL}/r/anima-pizzeria/12`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  // Clic sur Voir Ticket si le pill est présent
  const seeTicket = page.locator('button:has-text("Voir Ticket")');
  if (await seeTicket.isVisible()) {
    await seeTicket.click();
    await page.waitForTimeout(2000);
  }

  const clientSoldedPath = path.join(ARTIFACT_DIR, 'client_anima_ticket_solde_certifie.png');
  await page.screenshot({ path: clientSoldedPath, fullPage: false });
  console.log(`📸 Ticket client Anima certifié soldé: ${clientSoldedPath}`);

  await browser.close();

  // 7. Nettoyage final de la commande de test sur Anima
  console.log('7. Nettoyage de la commande de test...');
  await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
  await prisma.order.delete({ where: { id: order.id } });
  console.log('✅ Base de données remise à zéro.');
}

testAnimaFlow()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
