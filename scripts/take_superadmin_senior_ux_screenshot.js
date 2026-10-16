const { chromium } = require('playwright');
const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 1. Charger .env
if (fs.existsSync('.env')) {
  const content = fs.readFileSync('.env', 'utf8');
  content.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = match[2] || '';
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      process.env[match[1]] = val;
    }
  });
}

function generateSuperAdminToken() {
  const secret = process.env.JWT_SECRET || 'lou_ame_tay_super_secret_jwt_key_2026_senegal';
  const timestamp = Date.now();
  const payload = `admin:${timestamp}`;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}:${hmac}`;
}

async function captureSeniorSuperAdmin() {
  const artifactDir = path.resolve('C:/Users/DELL/.gemini/antigravity-cli/brain/1c7e0dca-91f4-4686-827f-b7ce8ad57b87');
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const port = 3025;
  console.log(`🚀 Démarrage du serveur Next.js de production sur le port ${port}...`);
  const nextBin = path.resolve('node_modules/next/dist/bin/next');
  const server = spawn(process.execPath, [nextBin, 'start', '-p', String(port)], {
    env: { ...process.env, PORT: String(port) },
  });

  server.stdout.on('data', (d) => {
    const text = d.toString().trim();
    if (text) console.log(`[Next.js stdout] ${text}`);
  });
  server.stderr.on('data', (d) => {
    const text = d.toString().trim();
    if (text) console.error(`[Next.js stderr] ${text}`);
  });

  let serverReady = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://localhost:${port}/api/health`).catch(() => fetch(`http://localhost:${port}`));
      if (res && res.status) {
        serverReady = true;
        console.log(`✅ Serveur Next.js opérationnel sur le port ${port} !`);
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  if (!serverReady) {
    server.kill();
    throw new Error('Le serveur Next.js n\'a pas répondu à temps.');
  }

  console.log('🌐 Lancement du navigateur Playwright Chromium...');
  const browser = await chromium.launch({ headless: true });
  const adminToken = generateSuperAdminToken();

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 2,
  });

  await context.addCookies([
    {
      name: 'superadmin_token',
      value: adminToken,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      sameSite: 'Lax',
    },
  ]);

  const page = await context.newPage();

  page.on('console', (msg) => {
    const text = msg.text();
    if (!text.includes('React DevTools') && !text.includes('hydration')) {
      console.log(`[Browser Console] ${text}`);
    }
  });

  await page.addInitScript((token) => {
    localStorage.setItem('lou_ame_tay_superadmin_auth', token);
    localStorage.setItem('lou_ame_tay_admin_last_activity', String(Date.now()));
  }, adminToken);

  try {
    console.log(`📍 Navigation vers http://localhost:${port}/super-admin...`);
    await page.goto(`http://localhost:${port}/super-admin`, { waitUntil: 'networkidle', timeout: 35000 });
    await page.waitForTimeout(3000);

    // 1. Capture Header, KPI & Conversion Funnel
    const funnelPath = path.join(artifactDir, 'screenshot-superadmin-funnel-hd.png');
    await page.screenshot({ path: funnelPath, fullPage: false });
    console.log(`📸 Capture Funnel & KPI HD enregistrée : ${funnelPath}`);

    // 2. Défilement vers Classement & Plats Stars
    console.log('📜 Défilement vers #classement-section...');
    await page.waitForSelector('#classement-section', { timeout: 10000 });
    const rankEl = await page.$('#classement-section');
    if (rankEl) {
      await rankEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1500);
      const rankPath = path.join(artifactDir, 'screenshot-superadmin-ranking-hd.png');
      await page.screenshot({ path: rankPath, fullPage: false });
      console.log(`📸 Capture Classement & Plats Stars enregistrée : ${rankPath}`);
    }

    // 3. Défilement vers Grille des Restaurants Clients
    console.log('📜 Défilement vers la grille des restaurants clients...');
    await page.evaluate(() => window.scrollBy(0, 700));
    await page.waitForTimeout(1500);
    const cardsPath = path.join(artifactDir, 'screenshot-superadmin-cards-hd.png');
    await page.screenshot({ path: cardsPath, fullPage: false });
    console.log(`📸 Capture Grille Restaurants enregistrée : ${cardsPath}`);

    // 4. Capture Full Page HD Complète
    const fullPath = path.join(artifactDir, 'screenshot-superadmin-senior-ux-full.png');
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log(`📸 Capture Full Page HD enregistrée : ${fullPath}`);

    console.log('\n🎉 TOUTES LES CAPTURES QA DE LA CONSOLE DAW ONT ÉTÉ ENREGISTRÉES AVEC SUCCÈS !');
  } catch (err) {
    console.error('❌ Erreur lors de la capture :', err);
    throw err;
  } finally {
    await browser.close();
    server.kill();
    console.log('🛑 Serveur Next.js et navigateur arrêtés.');
  }
}

captureSeniorSuperAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
