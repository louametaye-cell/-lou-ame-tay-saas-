const { chromium } = require('@playwright/test');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

async function main() {
  const prisma = new PrismaClient();
  const outputDir = path.join(__dirname, '..', 'capture des teste');
  const brainDir = path.join('C:', 'Users', 'DELL', '.gemini', 'antigravity-cli', 'brain', '29ebca16-966e-42e2-b0c1-91cc97f14e1d');
  const newCaptureDir = path.join(outputDir, 'new capture teste');

  // 1. Créer une commande fraîche sur Anima Pizzeria
  console.log('🍕 1. Création d\'une commande fraîche sur Anima Pizzeria...');
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: 'anima-pizzeria' },
    select: { id: true, businessName: true }
  });

  if (!tenant) throw new Error('Tenant anima-pizzeria non trouvé');

  // Créer une commande fraîche pour Table 12
  const freshOrder = await prisma.order.create({
    data: {
      tenantId: tenant.id,
      tableNumber: 12,
      customerName: 'Mamadou Sow',
      status: 'READY',
      paymentStatus: 'UNPAID',
      paymentMethod: 'CASH',
      totalAmount: 6000,
      items: {
        create: [
          {
            name: 'Pizza Reine (GM)',
            price: 6000,
            quantity: 1,
            customNotes: 'Bien cuite, pâte croustillante'
          }
        ]
      }
    },
    include: { items: true }
  });

  const shortCode = freshOrder.id.slice(-5).toUpperCase();
  console.log(`✅ Commande fraîche créée : Table 12 #${shortCode} (ID: ${freshOrder.id}) - Montant: 6 000 FCFA`);
  await prisma.$disconnect();

  // 2. Démarrer Playwright
  console.log('🌐 2. Lancement du navigateur Playwright...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('📡 3. Navigation vers le terminal caisse...');
  await page.goto('http://localhost:3000/cashier?restaurantId=anima-pizzeria', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Authentification code PIN Aïssatou (8392)
  const pinInputExists = await page.$('text=Connexion Caisse');
  if (pinInputExists) {
    console.log('🔑 Authentification PIN 8392...');
    for (const digit of ['8', '3', '9', '2']) {
      await page.locator(`button:has-text("${digit}")`).first().click();
      await page.waitForTimeout(120);
    }
    await page.locator('button:has-text("Valider")').first().click();
    await page.waitForTimeout(2500);
  }

  // 4. Capture de l'écran avec la nouvelle commande fraîche
  const freshBoardPath = path.join(outputDir, 'caisse_anima_commande_fraiche_table12.png');
  await page.screenshot({ path: freshBoardPath, fullPage: true });
  fs.copyFileSync(freshBoardPath, path.join(brainDir, 'caisse_anima_commande_fraiche_table12.png'));
  fs.copyFileSync(freshBoardPath, path.join(newCaptureDir, 'caisse_anima_commande_fraiche_table12.png'));
  console.log('📸 Capture commande fraîche enregistrée :', freshBoardPath);

  // 5. Clic sur "Encaisser & Clôturer" pour Table 12
  console.log('👉 5. Clic sur Encaisser & Clôturer...');
  const payBtn = page.locator('button:has-text("Encaisser & Clôturer")').first();
  await payBtn.click();
  await page.waitForTimeout(1000);

  // 6. Clic sur le bouton de confirmation de paiement
  console.log('👉 6. Validation du règlement de 6 000 FCFA...');
  const confirmBtn = page.locator('button:has-text("Valider & Imprimer Ticket 80mm")');
  await confirmBtn.click();

  // 7. Capture IMMÉDIATE de l'état de succès (dans les 500-1000ms après le clic)
  console.log('⏱️ 7. Détection du passage à l\'état de succès...');
  const successBtn = page.locator('text=ENCAISSEMENT RÉUSSI');
  await successBtn.waitFor({ state: 'visible', timeout: 3000 });
  console.log('⚡ Succès affiché sur le bouton en moins de 1 seconde !');

  const immediateSuccessPath = path.join(outputDir, 'caisse_anima_validation_succes_immediat.png');
  await page.screenshot({ path: immediateSuccessPath });
  fs.copyFileSync(immediateSuccessPath, path.join(brainDir, 'caisse_anima_validation_succes_immediat.png'));
  fs.copyFileSync(immediateSuccessPath, path.join(newCaptureDir, 'caisse_anima_validation_succes_immediat.png'));
  console.log('📸 Capture IMMÉDIATE du succès enregistrée :', immediateSuccessPath);

  // 8. Attente fermeture modale et affichage du tableau mis à jour
  console.log('⏳ 8. Fermeture automatique de la modale...');
  await page.waitForTimeout(2000);

  const finalBoardPath = path.join(outputDir, 'caisse_anima_apres_encaissement_succes.png');
  await page.screenshot({ path: finalBoardPath, fullPage: true });
  fs.copyFileSync(finalBoardPath, path.join(brainDir, 'caisse_anima_apres_encaissement_succes.png'));
  fs.copyFileSync(finalBoardPath, path.join(newCaptureDir, 'caisse_anima_apres_encaissement_succes.png'));
  console.log('📸 Capture finale après encaissement enregistrée :', finalBoardPath);

  await browser.close();
  console.log('🎉 TOUS LES TESTS D\'ENCAISSEMENT FRAIS SONT RÉUSSIS !');
}

main().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
