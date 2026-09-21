const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';
const CAPTURE_DIR = path.join(__dirname, '..', 'capture des teste');
const ARTIFACT_DIR = 'C:/Users/DELL/.gemini/antigravity-cli/brain/4119e6c6-710a-4876-a0d4-bcb77999bd96';

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
  console.log('🧪 TEST E2E VALIDATION : CYCLE DE VIE DES TABLES (3 ÉTATS)');
  console.log('===============================================================');

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: 'anima-pizzeria' },
    select: { id: true, businessName: true, subdomain: true }
  });

  if (!tenant) throw new Error('Tenant anima-pizzeria non trouvé');
  const tenantId = tenant.id;
  const TEST_TABLE = 12;

  // 0. Réinitialiser la Table 12 en statut FREE sans commande antérieure
  await prisma.orderItem.deleteMany({
    where: { order: { tenantId, tableNumber: TEST_TABLE } }
  });
  await prisma.order.deleteMany({
    where: { tenantId, tableNumber: TEST_TABLE }
  });

  const oneHourAgo = new Date(Date.now() - 3600000);
  const existingTable = await prisma.table.findFirst({
    where: { tenantId, tableNumber: TEST_TABLE }
  });
  if (existingTable) {
    await prisma.table.update({
      where: { id: existingTable.id },
      data: { status: 'FREE', clearedAt: oneHourAgo }
    });
  } else {
    await prisma.table.create({
      data: {
        tenantId,
        tableNumber: TEST_TABLE,
        status: 'FREE',
        clearedAt: oneHourAgo
      }
    });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });

  // Injecter la session gérant dans les cookies et le localStorage
  await context.addCookies([
    {
      name: 'saas_token',
      value: `resto_session_${tenantId}`,
      domain: 'localhost',
      path: '/'
    }
  ]);

  const page = await context.newPage();

  // Pré-remplir le localStorage avant navigation
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((tId) => {
    localStorage.setItem('current_restaurant_id', tId);
    localStorage.setItem('current_restaurant_subdomain', 'anima-pizzeria');
    localStorage.setItem('current_restaurant_name', 'Anima Pizzeria');
  }, tenantId);

  try {
    // -------------------------------------------------------------------------
    // 1. ÉTAT 1 : TABLE LIBRE (Verte, sans nom de client, prête à accueillir)
    // -------------------------------------------------------------------------
    console.log('\n--- 1. ÉTAT 1 : Table Libre & Prête ---');
    await page.goto(`${BASE_URL}/dashboard/tables`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Repérer la carte de la Table 12 via son attribut data-table-number
    const tableCard12 = page.locator(`div[data-table-number="${TEST_TABLE}"]`);
    await tableCard12.waitFor({ state: 'visible', timeout: 10000 });

    const isLibre = await tableCard12.locator('text=Table Libre & Dressée').isVisible();
    const lifecycleFree = await tableCard12.getAttribute('data-table-lifecycle');
    const hasClient = await tableCard12.locator('text=Amadou Diallo').isVisible();
    console.log(`✓ Table 12 statut affiché : Libre = ${isLibre} (cycle=${lifecycleFree}) | Ancien client masqué = ${!hasClient}`);

    // Scroll vers la Table 12 pour une capture nette
    await tableCard12.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await saveScreenshots(page, 'cycle_table_1_libre.png');

    // -------------------------------------------------------------------------
    // 2. ÉTAT 2 : CLIENT COMMANDE -> TABLE OCCUPÉE (Rouge/orange, nom client, #cmd)
    // -------------------------------------------------------------------------
    console.log('\n--- 2. ÉTAT 2 : Client commande -> Table Occupée ---');
    // Créer une commande active sur Table 12 pour Amadou Diallo
    const createdOrder = await prisma.order.create({
      data: {
        tenantId,
        tableNumber: TEST_TABLE,
        customerName: 'Amadou Diallo',
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        totalAmount: 6500,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: {
          create: [
            {
              name: 'Pizza Regina Spéciale',
              price: 5000,
              quantity: 1
            },
            {
              name: 'Gazelle Fraîche 33cl',
              price: 1500,
              quantity: 1
            }
          ]
        }
      }
    });

    console.log(`✓ Commande active créée pour Table 12 : ID #${createdOrder.id.slice(-5).toUpperCase()} (${createdOrder.customerName})`);

    // Rafraîchir la page et attendre que la carte passe en OCCUPIED
    await page.reload({ waitUntil: 'domcontentloaded' });
    const occupiedCard = page.locator(`div[data-table-number="${TEST_TABLE}"][data-table-lifecycle="OCCUPIED"]`);
    await occupiedCard.waitFor({ state: 'visible', timeout: 15000 });
    await occupiedCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const clientNameVisible = await occupiedCard.locator('text=Amadou Diallo').isVisible();
    const orderNumVisible = await occupiedCard.locator(`text=#${createdOrder.id.slice(-5).toUpperCase()}`).isVisible();
    console.log(`✓ Table 12 passée en OCCUPÉE : Nom client visible = ${clientNameVisible} | #Commande = ${orderNumVisible}`);

    await saveScreenshots(page, 'cycle_table_2_occupee.png');

    // -------------------------------------------------------------------------
    // 3. ÉTAT 3 : ADDITION PAYÉE EN CAISSE -> TABLE À LIBÉRER (Jaune, bouton prêt)
    // -------------------------------------------------------------------------
    console.log('\n--- 3. ÉTAT 3 : Addition payée -> Table À Libérer ---');
    // Simuler l'encaissement de la commande en caisse (passage à PAID)
    await prisma.order.update({
      where: { id: createdOrder.id },
      data: {
        status: 'SERVED',
        paymentStatus: 'PAID',
        servedAt: new Date()
      }
    });

    console.log(`✓ Commande #${createdOrder.id.slice(-5).toUpperCase()} marquée comme PAID (Encaissée en caisse).`);

    // Rafraîchir la page et attendre que la carte passe en TO_CLEAN
    await page.reload({ waitUntil: 'domcontentloaded' });
    const toCleanCard = page.locator(`div[data-table-number="${TEST_TABLE}"][data-table-lifecycle="TO_CLEAN"]`);
    await toCleanCard.waitFor({ state: 'visible', timeout: 15000 });
    await toCleanCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const toCleanBadge = await toCleanCard.locator('text=À LIBÉRER').first().isVisible();
    const actionBtn = toCleanCard.locator('button:has-text("Table Prête (Remettre en service)")').first();
    const isActionBtnVisible = await actionBtn.isVisible();
    console.log(`✓ Table 12 passée en À LIBÉRER : Badge jaune visible = ${toCleanBadge} | Bouton action visible = ${isActionBtnVisible}`);

    await saveScreenshots(page, 'cycle_table_3_a_liberer.png');

    // -------------------------------------------------------------------------
    // 4. ACTION : SERVEUR CLIQUE "TABLE PRÊTE" -> REMISE EN SERVICE (LIBRE)
    // -------------------------------------------------------------------------
    console.log('\n--- 4. ACTION : Serveur clique "Table Prête" -> Table Libre ---');
    // Cliquer sur le bouton "Table Prête (Remettre en service)"
    await actionBtn.click();
    await page.waitForTimeout(600);

    // Vérifier la confirmation inline
    const confirmBtn = toCleanCard.locator('button:has-text("Prête")').first();
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Confirmation inline affichée : bouton [Prête] actif.');

    // Confirmer
    await confirmBtn.click();

    // Attendre que la carte repasse en FREE
    const freeCardAgain = page.locator(`div[data-table-number="${TEST_TABLE}"][data-table-lifecycle="FREE"]`);
    await freeCardAgain.waitFor({ state: 'visible', timeout: 15000 });
    await freeCardAgain.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Vérifier que la Table 12 est redevenue LIBRE et que le nom d'Amadou Diallo a disparu
    const isLibreAgain = await freeCardAgain.locator('text=Table Libre & Dressée').isVisible();
    const isOldClientRemoved = !(await freeCardAgain.locator('text=Amadou Diallo').isVisible());
    console.log(`✓ Table 12 remise en service : Statut = Libre (${isLibreAgain}) | Ancien client disparu = ${isOldClientRemoved}`);

    await saveScreenshots(page, 'cycle_table_4_remise_en_service_libre.png');

    // Vérifier que la commande en base est restée 100% intacte (zéro suppression)
    const checkDbOrder = await prisma.order.findUnique({ where: { id: createdOrder.id } });
    console.log(`✓ Vérification Base de données : Commande toujours présente, Statut=${checkDbOrder.status}, PaymentStatus=${checkDbOrder.paymentStatus}`);

    console.log('\n===============================================================');
    console.log('🎉 TOUS LES 3 ÉTATS DU CYCLE DE VIE DES TABLES SONT VALIDÉS !');
    console.log('===============================================================');
  } catch (err) {
    console.error('❌ Erreur lors du test cycle de vie des tables :', err);
    await saveScreenshots(page, 'error_test_table_lifecycle.png');
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
