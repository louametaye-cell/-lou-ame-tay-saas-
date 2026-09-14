// scripts/qa-paywall-proofs.mjs
import { chromium } from 'playwright';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const OUTPUT_DIR = path.resolve('C:/Users/DELL/.gemini/antigravity-cli/brain/75de7c6c-7d49-45e7-8d44-20e944055fef');

async function setTenantSession(context, page, tenantId, subdomain, name, planSlug) {
  await context.clearCookies();
  await context.addCookies([
    {
      name: 'saas_token',
      value: `resto_session_${tenantId}`,
      domain: 'localhost',
      path: '/',
    },
  ]);
  // Configurer le localStorage
  await page.goto('http://localhost:3000/login');
  await page.evaluate(({ id, sub, rName, plan }) => {
    localStorage.setItem('current_restaurant_id', id);
    localStorage.setItem('current_restaurant_subdomain', sub);
    localStorage.setItem('current_restaurant_name', rName);
    localStorage.setItem('current_restaurant_plan', plan);
  }, { id: tenantId, sub: subdomain, rName: name, plan: planSlug });
}

async function main() {
  console.log('🚀 Lancement de la campagne de preuves Playwright Paywall...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
  });

  const page = await context.newPage();

  // ==========================================
  // COMPTE 1 : MADIBA RESTAURANT (PACK TÀMBALI - 15 000 FCFA)
  // ==========================================
  console.log('\n--- 1. Capture Madiba Restaurant (TÀMBALI) ---');
  await setTenantSession(context, page, 'tenant_madiba_restau', 'madiba-restaurant', 'Madiba Restaurant', 'tambali');
  await page.goto('http://localhost:3000/dashboard?restaurantId=tenant_madiba_restau', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const shot1Path = path.join(OUTPUT_DIR, '28_paywall_madiba_tambali_dashboard.png');
  await page.screenshot({ path: shot1Path, fullPage: true });
  console.log(`✓ Capture Dashboard TÀMBALI sauvegardée : ${shot1Path}`);

  // Clic sur la carte verrouillée "Écran Cuisine KDS" pour afficher le modal valorisant
  const kdsCard = page.locator('div[role="button"]:has-text("Écran Cuisine KDS")').first();
  if (await kdsCard.isVisible()) {
    console.log('✓ Clic sur la carte verrouillée KDS...');
    await kdsCard.click();
    await page.waitForTimeout(800);
    const shotModalPath = path.join(OUTPUT_DIR, '29_paywall_upgrade_modal_kds.png');
    await page.screenshot({ path: shotModalPath });
    console.log(`✓ Capture Modal d'Upgrade KDS sauvegardée : ${shotModalPath}`);

    // Fermer le modal
    const closeBtn = page.locator('button:has-text("✕"), button:has-text("Fermer")').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  } else {
    console.log('⚠️ Carte KDS introuvable ou non cliquable');
  }

  // Tentative de forçage direct par URL vers /dashboard/zones (Pack Teranga requis)
  console.log('\n--- 1.b. Test forçage URL directe /dashboard/zones pour Madiba ---');
  await page.goto('http://localhost:3000/dashboard/zones?restaurantId=tenant_madiba_restau', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const shotBlockedZones = path.join(OUTPUT_DIR, '30_paywall_guard_zones_blocked_madiba.png');
  await page.screenshot({ path: shotBlockedZones });
  console.log(`✓ Capture Écran Guard Zones Bloqué sauvegardée : ${shotBlockedZones}`);

  // ==========================================
  // COMPTE 2 : BASCULE SOUS PACK NIO FAR (25 000 FCFA)
  // ==========================================
  console.log('\n--- 2. Capture sous PACK NIO FAR ---');
  const nioFarPlan = await prisma.plan.findFirst({ where: { slug: 'nio-far' } });
  const samsOriginalTenant = await prisma.tenant.findUnique({ where: { id: 'tenant_sams_restaurant' } });
  const originalPlanId = samsOriginalTenant?.currentPlanId;

  if (nioFarPlan) {
    await prisma.tenant.update({
      where: { id: 'tenant_sams_restaurant' },
      data: { currentPlanId: nioFarPlan.id },
    });
    console.log(`✓ Sam's Prestige basculé temporairement sous NIO FAR (${nioFarPlan.name})`);
  }

  await setTenantSession(context, page, 'tenant_sams_restaurant', 'sams-prestige', 'Sam\'s Prestige', 'nio-far');
  await page.goto('http://localhost:3000/dashboard?restaurantId=tenant_sams_restaurant', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const shotNioFarDashboard = path.join(OUTPUT_DIR, '31_paywall_niofar_dashboard.png');
  await page.screenshot({ path: shotNioFarDashboard, fullPage: true });
  console.log(`✓ Capture Dashboard NIO FAR sauvegardée : ${shotNioFarDashboard}`);

  // Clic sur Zones & Espaces sous NIO FAR pour voir le modal d'upgrade vers TERANGA
  const zonesCard = page.locator('div[role="button"]:has-text("Zones & Espaces")').first();
  if (await zonesCard.isVisible()) {
    console.log('✓ Clic sur la carte verrouillée Zones sous NIO FAR...');
    await zonesCard.click();
    await page.waitForTimeout(800);
    const shotModalZones = path.join(OUTPUT_DIR, '32_paywall_upgrade_modal_teranga.png');
    await page.screenshot({ path: shotModalZones });
    console.log(`✓ Capture Modal d'Upgrade TERANGA sauvegardée : ${shotModalZones}`);
    const closeBtn = page.locator('button:has-text("✕"), button:has-text("Fermer")').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // ==========================================
  // COMPTE 3 : HÔTEL LAT-DIOR (PACK TERANGA - 65 000 FCFA)
  // ==========================================
  console.log('\n--- 3. Capture Hôtel Lat-Dior (PACK TERANGA) ---');
  await setTenantSession(context, page, 'tenant_hotel_lat_dior', 'hotel-lat-dior', 'Hôtel Lat-Dior', 'teranga');
  await page.goto('http://localhost:3000/dashboard?restaurantId=tenant_hotel_lat_dior', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const shotLatDiorDashboard = path.join(OUTPUT_DIR, '33_paywall_latdior_teranga_dashboard.png');
  await page.screenshot({ path: shotLatDiorDashboard, fullPage: true });
  console.log(`✓ Capture Dashboard TERANGA sauvegardée : ${shotLatDiorDashboard}`);

  // Navigation légitime vers /dashboard/zones (totalement débloqué sous TERANGA)
  await page.goto('http://localhost:3000/dashboard/zones?restaurantId=tenant_hotel_lat_dior', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const shotLatDiorZonesOpen = path.join(OUTPUT_DIR, '34_paywall_latdior_zones_unlocked.png');
  await page.screenshot({ path: shotLatDiorZonesOpen, fullPage: true });
  console.log(`✓ Capture Page Zones débloquée TERANGA sauvegardée : ${shotLatDiorZonesOpen}`);

  // ==========================================
  // RESTAURATION DU PLAN D'ORIGINE
  // ==========================================
  if (originalPlanId) {
    await prisma.tenant.update({
      where: { id: 'tenant_sams_restaurant' },
      data: { currentPlanId: originalPlanId },
    });
    console.log(`✓ Plan d'origine de Sam's Prestige restauré (${originalPlanId})`);
  }

  await browser.close();
  await prisma.$disconnect();
  console.log('\n🎉 Campagne de captures de preuves terminée avec succès !');
}

main().catch((err) => {
  console.error('Erreur Playwright:', err);
  process.exit(1);
});
