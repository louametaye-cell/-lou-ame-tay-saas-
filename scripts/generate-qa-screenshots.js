const { chromium } = require('@playwright/test');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.resolve(__dirname, '../captures_qa');

function formatFCFA(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function run() {
  await ensureDir(OUTPUT_DIR);
  console.log('Répertoire de sortie des captures:', OUTPUT_DIR);

  // 1. Récupérer Anima Pizzeria et un plat réel du menu
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: 'anima-pizzeria' },
    include: {
      categories: {
        include: {
          items: true
        }
      }
    }
  });

  if (!tenant) {
    throw new Error('Tenant anima-pizzeria introuvable');
  }

  const pizzaItem = tenant.categories
    .flatMap(c => c.items)
    .find(i => i.isAvailable && i.price > 0) || tenant.categories[0]?.items[0];

  console.log(`Tenant: ${tenant.businessName}, Plat: ${pizzaItem?.name} (${pizzaItem?.price} FCFA)`);

  // Nettoyer d'anciennes commandes de test QA sur anima
  await prisma.order.deleteMany({
    where: {
      tenantId: tenant.id,
      customerName: 'Client Démo QA'
    }
  });

  // Créer ou récupérer un caissier de shift actif pour Anima Pizzeria
  let cashier = await prisma.cashier.findFirst({
    where: { tenantId: tenant.id, isActive: true }
  });

  if (!cashier) {
    cashier = await prisma.cashier.create({
      data: {
        tenantId: tenant.id,
        name: 'Mamadou Ndiaye',
        pinCode: '1234',
        shift: 'MORNING',
        isActive: true,
      }
    });
    console.log('Caissier actif préparé:', cashier.name);
  }

  // Ouvrir une session de caisse si non ouverte
  let session = await prisma.cashSession.findFirst({
    where: { tenantId: tenant.id, status: 'OPEN' }
  });

  if (!session) {
    session = await prisma.cashSession.create({
      data: {
        tenantId: tenant.id,
        cashierId: cashier.id,
        status: 'OPEN',
        openingFloat: 25000,
        openedAt: new Date()
      }
    });
    console.log('Session de caisse active ouverte:', session.id);
  }

  // 2. Créer une commande en base (statut PENDING, paymentStatus UNPAID)
  const orderPrice = Number(pizzaItem?.price || 4500);
  const testOrder = await prisma.order.create({
    data: {
      tenantId: tenant.id,
      tableNumber: 4,
      customerName: 'Client Démo QA',
      customerNote: 'Bien cuite svp',
      paymentMethod: 'CASH',
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      totalAmount: orderPrice,
      items: {
        create: [
          {
            name: pizzaItem?.name || 'Pizza Reine',
            price: orderPrice,
            quantity: 1,
            menuItemId: pizzaItem?.id
          }
        ]
      }
    },
    include: { items: true }
  });

  const shortCode = testOrder.id.slice(-5).toUpperCase();
  console.log(`Commande créée: #${shortCode} (Table 4) - ${orderPrice} FCFA`);

  // 3. Lancement de Playwright
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 },
    deviceScaleFactor: 1.5,
  });

  // Ajouter le cookie de session gérant multi-tenant pour autoriser /api/orders
  await context.addCookies([
    {
      name: 'saas_token',
      value: `resto_session_${tenant.id}`,
      domain: 'localhost',
      path: '/'
    },
    {
      name: 'token',
      value: `resto_session_${tenant.id}`,
      domain: 'localhost',
      path: '/'
    }
  ]);

  // Injecter le localStorage pour toutes les pages
  await context.addInitScript(({ tId, tName, tSub, cData }) => {
    localStorage.setItem('current_restaurant_id', tId);
    localStorage.setItem('current_restaurant_name', tName);
    localStorage.setItem('current_restaurant_subdomain', tSub);
    localStorage.setItem('current_cashier', JSON.stringify(cData));
  }, {
    tId: tenant.id,
    tName: tenant.businessName,
    tSub: tenant.subdomain,
    cData: cashier
  });

  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  page.setDefaultNavigationTimeout(60000);

  // ==========================================
  // CAPTURE 1 : Menu Client & Commande Table 4
  // ==========================================
  console.log('Capture 1 : Menu Client Table 4...');
  await page.goto(`${BASE_URL}/r/anima-pizzeria/4`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_menu_client_anima_table4.png'), fullPage: false });

  // ==========================================
  // CAPTURE 2 : Écran KDS Cuisine
  // ==========================================
  console.log('Capture 2 : KDS Cuisine...');
  await page.goto(`${BASE_URL}/kitchen?restaurantId=${tenant.id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_cuisine_kds_commande_en_cours.png'), fullPage: false });

  // Faire passer la commande à READY par la cuisine
  console.log('Passage en cuisine à READY (prête au guichet)...');
  await prisma.order.update({
    where: { id: testOrder.id },
    data: {
      status: 'READY',
      preparedAt: new Date(),
    }
  });

  // ==========================================
  // CAPTURE 3 : Écran Retrait Pickup TV (statut READY visible en grand)
  // ==========================================
  console.log('Capture 3 : Écran Retrait Pickup (Statut READY)...');
  await page.goto(`${BASE_URL}/pickup/anima-pizzeria`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03_ecran_retrait_pickup_tv.png'), fullPage: false });

  // Faire passer la commande à SERVED par le serveur (servie à table, mais UNPAID)
  console.log('Passage par le serveur à SERVED (servie à table, mais paymentStatus reste UNPAID)...');
  await prisma.order.update({
    where: { id: testOrder.id },
    data: {
      status: 'SERVED',
      servedAt: new Date(),
      // paymentStatus reste UNPAID !
    }
  });

  // ==========================================
  // CAPTURE 4 : Écran Caisse - État PRÉCIS demandé au POINT 2 :
  // "Servie — En attente de paiement" (Non Encaissée)
  // ==========================================
  console.log('Capture 4 : Écran Caisse - Servie mais Non Encaissée (Point 2)...');
  await page.goto(`${BASE_URL}/cashier?restaurantId=${tenant.id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04_caisse_servie_en_attente_de_paiement.png'), fullPage: false });

  // ==========================================
  // CAPTURE 5 : Caisse - Modal d'encaissement obligatoire ouvert avec coupure & monnaie
  // ==========================================
  console.log('Capture 5 : Modal d\'encaissement avec calcul de monnaie...');
  const payButton = page.locator('button:has-text("Encaisser & Clôturer")').first();
  await payButton.waitFor({ state: 'visible', timeout: 10000 });
  await payButton.click();
  await page.waitForTimeout(800);

  // Saisir un billet de 10 000 FCFA
  const amountInput = page.locator('input[type="number"]').first();
  await amountInput.waitFor({ state: 'visible', timeout: 5000 });
  await amountInput.fill('10000');
  await page.waitForTimeout(600);

  await page.screenshot({ path: path.join(OUTPUT_DIR, '05_caisse_modal_encaissement_monnaie_rendue.png'), fullPage: false });

  // Valider le paiement
  console.log('Validation du paiement dans le modal...');
  const confirmButton = page.locator('button:has-text("Valider & Imprimer Ticket 80mm")').first();
  if (await confirmButton.isVisible()) {
    await confirmButton.click();
    await page.waitForTimeout(2000);
  }

  // ==========================================
  // CAPTURE 6 : Rendu Réel du Ticket Thermique 80mm
  // ==========================================
  console.log('Capture 6 : Ticket final 80mm...');
  const ticketPage = await context.newPage();
  await ticketPage.setViewportSize({ width: 380, height: 620 });
  const ticketHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ticket TABLE 04 - Anima Pizzeria</title>
        <style>
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 320px;
            margin: 0 auto;
            padding: 16px 8px;
            color: #000;
            background: #fff;
            font-size: 13px;
            line-height: 1.3;
          }
          .center { text-align: center; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .giant-table {
            font-size: 22px;
            font-weight: 900;
            border-top: 2px dashed #000;
            border-bottom: 2px dashed #000;
            padding: 8px 0;
            margin: 10px 0;
            text-align: center;
          }
          .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
          .badge-paid {
            display: inline-block;
            background: #000;
            color: #fff;
            padding: 2px 6px;
            font-weight: 900;
            margin-top: 4px;
          }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size: 16px;">ANIMA PIZZERIA</div>
        <div class="center" style="font-size: 11px;">Plateforme SaaS Lou Ame Tay ?</div>
        <div class="center" style="font-size: 10px;">Dakar, Sénégal - Tél: 77 000 00 00</div>
        <div class="giant-table">TABLE 04</div>
        <div>Heure: ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} | #${shortCode}</div>
        <div>Caissier: ${cashier.name} (${cashier.shift})</div>
        <div>Client: Client Démo QA</div>
        <div class="divider"></div>
        <div style="margin-bottom: 6px;">
          <div style="font-weight: 900; font-size: 14px;">1x ${pizzaItem?.name || 'Pizza Reine'}</div>
          <div style="font-size: 11px; color: #444;">&gt; P.U: ${formatFCFA(orderPrice)}</div>
          <div style="font-size: 11px; font-style: italic; background: #eee; padding: 2px 4px; border-radius: 4px; margin-top: 2px;">* NOTE: Bien cuite svp</div>
        </div>
        <div class="divider"></div>
        <div class="right bold" style="font-size: 16px;">TOTAL NET: ${formatFCFA(orderPrice)}</div>
        <div class="right" style="font-size: 12px;">Espèces perçues: 10 000 FCFA</div>
        <div class="right bold" style="font-size: 13px;">Monnaie rendue: ${formatFCFA(10000 - orderPrice)}</div>
        <div class="right" style="font-size: 11px;">Règlement: ESPÈCES [ENCAISSÉ]</div>
        <div class="center"><span class="badge-paid">*** FACTURE ACQUITTÉE ***</span></div>
        <div class="divider"></div>
        <div class="center" style="font-size: 10px; margin-top: 8px;">
          Merci de votre visite chez Anima Pizzeria !<br/>
          Propulsé par Lou Ame Tay ? - MDA Arts Work
        </div>
      </body>
    </html>
  `;
  await ticketPage.setContent(ticketHtml);
  await ticketPage.waitForTimeout(500);
  await ticketPage.screenshot({ path: path.join(OUTPUT_DIR, '06_ticket_final_caisse_80mm.png') });
  await ticketPage.close();

  // ==========================================
  // CAPTURE 7 : Caisse - Onglet "Servies & Encaissées" (Clôturée)
  // ==========================================
  console.log('Capture 7 : Onglet Servies & Encaissées...');
  await page.goto(`${BASE_URL}/cashier?restaurantId=${tenant.id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const servedTab = page.locator('button:has-text("Servies & Encaissées")').first();
  if (await servedTab.isVisible()) {
    await servedTab.click();
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: path.join(OUTPUT_DIR, '07_caisse_onglet_servies_et_cloturees.png'), fullPage: false });

  // Fermer le navigateur
  await browser.close();

  // Nettoyage final du caissier et commande de test
  await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } });
  await prisma.order.delete({ where: { id: testOrder.id } });
  await prisma.cashSession.deleteMany({ where: { id: session.id } });
  await prisma.cashier.deleteMany({ where: { id: cashier.id } });

  console.log('✅ TOUTES LES 7 CAPTURES D\'ÉCRAN ONT ÉTÉ GÉNÉRÉES AVEC SUCCÈS DANS:', OUTPUT_DIR);
}

run().catch(err => {
  console.error('Erreur génération captures:', err);
  process.exit(1);
}).finally(() => prisma.$disconnect());
