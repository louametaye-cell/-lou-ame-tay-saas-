const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/DELL/.gemini/antigravity-cli/brain/29ebca16-966e-42e2-b0c1-91cc97f14e1d';
const BASE_URL = 'http://localhost:3000';

async function captureOpenReceipt() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/r/sams-prestige/7`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('Attente de la synchronisation de la table (4s)...');
  await page.waitForTimeout(4500);

  // Cliquer sur le composant flottant pour ouvrir le modal
  const pillBtn = page.locator('button[aria-label*="Ouvrir le ticket"]');
  if (await pillBtn.isVisible()) {
    console.log('Bouton pill trouvé, clic...');
    await pillBtn.click();
    await page.waitForTimeout(1500);
  } else {
    console.log('Bouton pill non visible, tentative avec "Voir Ticket"...');
    const seeTicketBtn = page.locator('button:has-text("Voir Ticket")');
    if (await seeTicketBtn.isVisible()) {
      await seeTicketBtn.click();
      await page.waitForTimeout(1500);
    }
  }

  const receiptModalScreenshot = path.join(ARTIFACT_DIR, 'client_sams_modal_ticket_solde_ouvert.png');
  await page.screenshot({ path: receiptModalScreenshot, fullPage: false });
  console.log(`📸 Capture Ticket Ouvert enregistrée: ${receiptModalScreenshot}`);

  await browser.close();
}

captureOpenReceipt().catch(console.error);
