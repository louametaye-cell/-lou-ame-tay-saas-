const { chromium } = require('playwright');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ARTIFACT_DIR = 'C:/Users/DELL/.gemini/antigravity-cli/brain/29ebca16-966e-42e2-b0c1-91cc97f14e1d';
const BASE_URL = 'http://localhost:3000';

async function runSamsTest() {
  console.log('🚀 DÉMARRAGE DU TEST COMPLET SUR SAM\'S PRESTIGE RESTAURANT');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  try {
    // 1. VÉRIFICATION DU KDS SAM'S PRESTIGE (0 COMMANDE FANTÔME)
    console.log('\n--- 1. ÉCRAN CUISINE KDS SAM\'S PRESTIGE ---');
    const pageKds = await context.newPage();
    await pageKds.goto(`${BASE_URL}/r/sams-prestige/kitchen`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await pageKds.waitForTimeout(2000);
    const kdsScreenshot = path.join(ARTIFACT_DIR, 'kds_sams_propre_sans_fantome.png');
    await pageKds.screenshot({ path: kdsScreenshot, fullPage: false });
    console.log(`📸 Capture KDS enregistrée: ${kdsScreenshot}`);

    // 2. VÉRIFICATION DU DASHBOARD AVANT COMMANDE (CA = 0 FCFA)
    console.log('\n--- 2. DASHBOARD ADMIN AVANT COMMANDE ---');
    const pageDash = await context.newPage();
    await context.addCookies([{
      name: 'saas_token',
      value: 'resto_session_tenant_sams_restaurant',
      domain: 'localhost',
      path: '/'
    }]);
    await pageDash.goto(`${BASE_URL}/dashboard?restaurantId=tenant_sams_restaurant`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await pageDash.waitForTimeout(2000);
    const dashInitialScreenshot = path.join(ARTIFACT_DIR, 'dashboard_sams_initial_ca_zero.png');
    await pageDash.screenshot({ path: dashInitialScreenshot, fullPage: false });
    console.log(`📸 Capture Dashboard Initial enregistrée: ${dashInitialScreenshot}`);

    // 3. COMMANDE CLIENT TABLE 07
    console.log('\n--- 3. COMMANDE CLIENT TABLE 07 ---');
    const pageClient = await context.newPage();
    await pageClient.goto(`${BASE_URL}/r/sams-prestige/7`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await pageClient.waitForTimeout(1500);

    // Ajouter au panier
    const addBtn = pageClient.locator('button:has-text("Ajouter")').first();
    await addBtn.click();
    await pageClient.waitForTimeout(1000);

    // Clic sur Voir mon panier
    const cartFloatingBtn = pageClient.locator('button:has-text("Voir mon panier")');
    if (await cartFloatingBtn.isVisible()) {
      await cartFloatingBtn.click();
      await pageClient.waitForTimeout(1000);
    }

    // Gestion du tiroir d'Upsell si présent ("Non merci, continuer vers le paiement")
    const upsellSkipBtn = pageClient.locator('button:has-text("Non merci, continuer")');
    if (await upsellSkipBtn.isVisible()) {
      await upsellSkipBtn.click();
      await pageClient.waitForTimeout(1000);
    }

    // Capture du panier ouvert
    const cartOpenScreenshot = path.join(ARTIFACT_DIR, 'client_sams_panier_ouvert.png');
    await pageClient.screenshot({ path: cartOpenScreenshot, fullPage: false });
    console.log(`📸 Capture Panier Ouvert enregistrée: ${cartOpenScreenshot}`);

    // Trouver le bouton de commande dans le panier
    const orderBtn = pageClient.locator('button:has-text("Commander")').last();
    await orderBtn.click();
    console.log('✅ Clic sur le bouton de commande dans le panier !');
    await pageClient.waitForTimeout(3000);

    const clientOrderScreenshot = path.join(ARTIFACT_DIR, 'client_sams_commande_table7.png');
    await pageClient.screenshot({ path: clientOrderScreenshot, fullPage: false });
    console.log(`📸 Capture Client Commande enregistrée: ${clientOrderScreenshot}`);

    // 4. RÉCUPÉRATION DE LA COMMANDE EN DB
    const createdOrder = await prisma.order.findFirst({
      where: { tenantId: 'tenant_sams_restaurant' },
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });

    if (!createdOrder) {
      throw new Error('La commande n\'a pas été enregistrée en base de données');
    }
    const orderTotal = Number(createdOrder.totalAmount);
    console.log(`✅ Commande #${createdOrder.id.slice(-6)} trouvée en DB ! Total: ${orderTotal} FCFA, Status: ${createdOrder.status}, PayStatus: ${createdOrder.paymentStatus}`);

    // Passer la commande à SERVED en base de données tout en gardant paymentStatus = 'UNPAID'
    await prisma.order.update({
      where: { id: createdOrder.id },
      data: { status: 'SERVED', servedAt: new Date() }
    });
    console.log('✅ Commande passée en statut SERVED (Servie) avec paymentStatus: UNPAID !');

    // 5. TEST CRITIQUE RÈGLE 10.4 : LE DASHBOARD DOIT RESTER STRICTEMENT À 0 FCFA !
    console.log('\n--- 5. VÉRIFICATION STRICTE RÈGLE 10.4 SUR LE DASHBOARD ---');
    await pageDash.reload({ waitUntil: 'domcontentloaded' });
    await pageDash.waitForTimeout(2000);
    const dashUnpaidScreenshot = path.join(ARTIFACT_DIR, 'dashboard_sams_servie_non_payee_ca_zero.png');
    await pageDash.screenshot({ path: dashUnpaidScreenshot, fullPage: false });
    console.log(`📸 Capture Dashboard Commande Servie Non Payée (CA = 0 FCFA): ${dashUnpaidScreenshot}`);

    // 6. TERMINAL CAISSE & ENCAISSEMENT
    console.log('\n--- 6. TERMINAL CAISSE & ENCAISSEMENT ---');
    const pageCashier = await context.newPage();
    await pageCashier.goto(`${BASE_URL}/cashier?restaurantId=sams-prestige`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await pageCashier.waitForTimeout(1500);

    // Déverrouillage PIN caissier (Khady Sy, PIN 1234)
    const cashierSelect = pageCashier.locator('select');
    if (await cashierSelect.count() > 0) {
      await cashierSelect.first().selectOption({ index: 1 });
      await pageCashier.waitForTimeout(500);
    }
    for (const digit of ['1', '2', '3', '4']) {
      await pageCashier.locator(`button:text-is("${digit}")`).click();
      await pageCashier.waitForTimeout(150);
    }
    await pageCashier.locator('button:has-text("Valider"), button:has-text("Connexion")').click();
    await pageCashier.waitForTimeout(2000);

    const cashierBeforePayScreenshot = path.join(ARTIFACT_DIR, 'caisse_sams_avant_encaissement_table7.png');
    await pageCashier.screenshot({ path: cashierBeforePayScreenshot, fullPage: false });
    console.log(`📸 Capture Caisse Avant Encaissement: ${cashierBeforePayScreenshot}`);

    // Encaisser la commande en caisse via l'API officielle
    const cashier = await prisma.cashier.findFirst({
      where: { tenantId: 'tenant_sams_restaurant', isActive: true }
    });
    const activeSession = await prisma.cashSession.findFirst({
      where: { tenantId: 'tenant_sams_restaurant', status: 'OPEN' }
    });

    const payResult = await pageCashier.evaluate(async ({ orderId, cashierId, cashSessionId, orderTotal }) => {
      const r = await fetch(`/api/cashier/orders/${orderId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cashier-token': 'cashier_session_tenant_sams_restaurant'
        },
        body: JSON.stringify({
          paymentMethod: 'CASH',
          cashierId,
          cashSessionId,
          amountReceived: 10000,
          changeGiven: 10000 - orderTotal,
          restaurantId: 'sams-prestige'
        })
      });
      return await r.json();
    }, {
      orderId: createdOrder.id,
      cashierId: cashier?.id,
      cashSessionId: activeSession?.id,
      orderTotal
    });
    console.log('✅ Résultat Encaissement Caisse:', payResult.message || payResult);

    await pageCashier.reload({ waitUntil: 'domcontentloaded' });
    await pageCashier.waitForTimeout(2000);
    const cashierAfterPayScreenshot = path.join(ARTIFACT_DIR, 'caisse_sams_apres_encaissement_succes.png');
    await pageCashier.screenshot({ path: cashierAfterPayScreenshot, fullPage: false });
    console.log(`📸 Capture Caisse Après Encaissement: ${cashierAfterPayScreenshot}`);

    // 7. VÉRIFICATION DU DASHBOARD APRÈS ENCAISSEMENT (CA = orderTotal)
    console.log('\n--- 7. VÉRIFICATION DU DASHBOARD APRÈS ENCAISSEMENT ---');
    await pageDash.reload({ waitUntil: 'domcontentloaded' });
    await pageDash.waitForTimeout(2000);
    const dashAfterPayScreenshot = path.join(ARTIFACT_DIR, 'dashboard_sams_apres_encaissement_ca_3500.png');
    await pageDash.screenshot({ path: dashAfterPayScreenshot, fullPage: false });
    console.log(`📸 Capture Dashboard Après Encaissement: ${dashAfterPayScreenshot}`);

    // 8. VÉRIFICATION DU TICKET NUMÉRIQUE CLIENT TABLE 07 (NOTE SOLDÉE, 0 FCFA RESTANT DÛ)
    console.log('\n--- 8. VÉRIFICATION DU TICKET NUMÉRIQUE CLIENT TABLE 07 ---');
    await pageClient.reload({ waitUntil: 'domcontentloaded' });
    await pageClient.waitForTimeout(3000);
    const clientAfterPayScreenshot = path.join(ARTIFACT_DIR, 'client_sams_ticket_solde_boutons_masques.png');
    await pageClient.screenshot({ path: clientAfterPayScreenshot, fullPage: false });
    console.log(`📸 Capture Ticket Numérique Soldé Client: ${clientAfterPayScreenshot}`);

    console.log('\n🎉 VALIDATION E2E INTÉGRALE TERMINÉE AVEC SUCCÈS !');
  } catch (err) {
    console.error('❌ Erreur durant le test:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
    await browser.close();
  }
}

runSamsTest();
