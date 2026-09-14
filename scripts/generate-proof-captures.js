const { chromium } = require('@playwright/test');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.resolve(__dirname, '../captures_qa');

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function run() {
  await ensureDir(OUTPUT_DIR);
  console.log('Répertoire des captures réelles :', OUTPUT_DIR);

  // 1. Préparation d'Anima Pizzeria
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: 'anima-pizzeria' },
    include: { cashiers: { where: { isActive: true } } }
  });

  if (!tenant) throw new Error('Tenant anima-pizzeria non trouvé');
  const cashier = tenant.cashiers[0];
  console.log(`Restaurant : ${tenant.businessName} | Caissier : ${cashier.name} (PIN: ${cashier.pinCode})`);

  // Nettoyage préalable de sessions et commandes de test
  await prisma.order.deleteMany({
    where: { tenantId: tenant.id, customerName: { startsWith: 'Client Test Manuel' } }
  });
  await prisma.cashSession.updateMany({
    where: { tenantId: tenant.id, status: 'OPEN' },
    data: { status: 'CLOSED', closedAt: new Date(), notes: 'Clôture préparatoire test captures' }
  });

  // Création de la commande réelle Table 10 Pizza 5 000 FCFA
  const testOrder = await prisma.order.create({
    data: {
      tenantId: tenant.id,
      tableNumber: 10,
      customerName: 'Client Test Manuel Table 10',
      totalAmount: 5000,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      paymentMethod: 'CASH',
      items: {
        create: [
          {
            name: 'Pizza Margherita Royale',
            price: 5000,
            quantity: 1
          }
        ]
      }
    },
    include: { items: true }
  });
  console.log(`Commande créée : #${testOrder.id.slice(-5).toUpperCase()} Table 10 (5 000 FCFA)`);

  // Lancement du navigateur Playwright
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 820 },
    deviceScaleFactor: 1.5
  });

  // Cookies et localStorage
  await context.addInitScript(({ tId, tName, tSub }) => {
    localStorage.clear();
    localStorage.setItem('current_restaurant_id', tId);
    localStorage.setItem('current_restaurant_name', tName);
    localStorage.setItem('current_restaurant_subdomain', tSub);
  }, {
    tId: tenant.id,
    tName: tenant.businessName,
    tSub: tenant.subdomain
  });

  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  // =========================================================================
  // CAPTURE 1 : Ouverture de caisse avec code PIN fort & fond de 10 000 FCFA
  // =========================================================================
  console.log('\n📸 Capture 1 : Ouverture de caisse (PIN & Fond initial)...');
  await page.goto(`${BASE_URL}/cashier?restaurantId=${tenant.id}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // S'assurer de partir d'un état déconnecté
  const releveBtn = page.locator('button:has-text("(Relève)")').first();
  if (await releveBtn.isVisible()) {
    await releveBtn.click();
    await page.waitForTimeout(800);
  }

  // Ouvrir modal PIN si non ouvert
  const openPinBtn = page.locator('button:has-text("S\'identifier avec code PIN")').first();
  const closedBtn = page.locator('button:has-text("Caisse Fermée")').first();

  if (await openPinBtn.isVisible()) {
    await openPinBtn.click();
    await page.waitForTimeout(800);
  } else if (await closedBtn.isVisible()) {
    await closedBtn.click();
    await page.waitForTimeout(800);
  }

  // Attendre le pavé tactile et saisir le PIN fort '8392'
  const firstDigitBtn = page.locator(`button:text-is("${cashier.pinCode[0]}")`).first();
  await firstDigitBtn.waitFor({ state: 'visible', timeout: 10000 });

  for (const digit of cashier.pinCode) {
    await page.locator(`button:text-is("${digit}")`).first().click();
    await page.waitForTimeout(200);
  }
  await page.locator('button:has-text("Valider ✓")').click();
  await page.waitForTimeout(1200);

  // Le modal d'ouverture de caisse apparaît
  const floatInput = page.locator('input[placeholder="20000"]').first();
  await floatInput.waitFor({ state: 'visible', timeout: 5000 });
  await floatInput.fill('10000');
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(OUTPUT_DIR, '01_ouverture_caisse_pin_et_fond.png'),
    fullPage: false
  });
  console.log('✅ Capture 1 enregistrée : 01_ouverture_caisse_pin_et_fond.png');

  // Valider l'ouverture
  await page.locator('button:has-text("Valider & Démarrer")').click();
  await page.waitForTimeout(1500);

  // =========================================================================
  // CAPTURE 2 : Écran Cuisine KDS - Commande en Préparation (ZÉRO PRIX FCFA)
  // =========================================================================
  console.log('\n📸 Capture 2 : KDS Cuisine - Commande en cours...');
  await page.goto(`${BASE_URL}/kitchen?restaurantId=${tenant.id}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Passer à PREPARING
  const prepBtn = page.locator('button:has-text("Lancer Préparation")').first();
  await prepBtn.waitFor({ state: 'visible', timeout: 10000 });
  await prepBtn.click();
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: path.join(OUTPUT_DIR, '02_kds_cuisine_en_preparation_zero_fcfa.png'),
    fullPage: false
  });
  console.log('✅ Capture 2 enregistrée : 02_kds_cuisine_en_preparation_zero_fcfa.png');

  // Passer à READY (Commande Prête)
  const readyBtn = page.locator('button:has-text("Commande Prête")').first();
  await readyBtn.waitFor({ state: 'visible', timeout: 10000 });
  await readyBtn.click();
  await page.waitForTimeout(2000);

  // =========================================================================
  // CAPTURE 3 : Écran Retrait TV Guichet (/pickup) - Affichage READY XXL Vert
  // =========================================================================
  console.log('\n📸 Capture 3 : Écran TV Retrait Guichet (/pickup)...');
  await page.goto(`${BASE_URL}/pickup/anima-pizzeria`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: path.join(OUTPUT_DIR, '03_ecran_tv_pickup_commande_prete_xxl.png'),
    fullPage: false
  });
  console.log('✅ Capture 3 enregistrée : 03_ecran_tv_pickup_commande_prete_xxl.png');

  // Retourner en cuisine et passer à SERVED
  await page.goto(`${BASE_URL}/kitchen?restaurantId=${tenant.id}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const servedBtn = page.locator('button:has-text("Servie à Table")').first();
  await servedBtn.waitFor({ state: 'visible', timeout: 5000 });
  await servedBtn.click();
  await page.waitForTimeout(1500);

  // =========================================================================
  // CAPTURE 4 : Écran Caisse - Servie en Attente de Paiement (Caisse du Jour = 0 F)
  // =========================================================================
  console.log('\n📸 Capture 4 : Écran Caisse - Servie mais Impayée (Caisse du Jour: 0 FCFA)...');
  await page.goto(`${BASE_URL}/cashier?restaurantId=${tenant.id}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: path.join(OUTPUT_DIR, '04_caisse_servie_non_encaissee_0fcfa.png'),
    fullPage: false
  });
  console.log('✅ Capture 4 enregistrée : 04_caisse_servie_non_encaissee_0fcfa.png');

  // =========================================================================
  // CAPTURE 5 : Modal Clôture Z - Comptage 10 000 F et Écart à 0 FCFA
  // =========================================================================
  console.log('\n📸 Capture 5 : Modal Clôture Z avec Écart 0 FCFA...');
  const closeZBtn = page.locator('button:has-text("Clôturer la Caisse (Z)")').first();
  await closeZBtn.waitFor({ state: 'visible', timeout: 5000 });
  await closeZBtn.click();
  await page.waitForTimeout(1000);

  // Saisir 10 000 FCFA dans le montant compté
  const countedInput = page.locator('input[placeholder="Ex: 85000"]').first();
  await countedInput.waitFor({ state: 'visible', timeout: 5000 });
  await countedInput.fill('10000');
  await page.waitForTimeout(800);

  await page.screenshot({
    path: path.join(OUTPUT_DIR, '05_modal_cloture_z_ecart_0fcfa.png'),
    fullPage: false
  });
  console.log('✅ Capture 5 enregistrée : 05_modal_cloture_z_ecart_0fcfa.png');

  // Clôturer officiellement
  await page.locator('button:has-text("Imprimer Ticket Z & Clôturer")').click();
  await page.waitForTimeout(2000);

  await browser.close();

  // Nettoyage BDD
  await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } });
  await prisma.order.delete({ where: { id: testOrder.id } });

  console.log('\n🎉 TOUTES LES CAPTURES ONT ÉTÉ GÉNÉRÉES DANS :', OUTPUT_DIR);
}

run()
  .catch((e) => {
    console.error('❌ ERREUR CAPTURES :', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
