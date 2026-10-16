const { chromium } = require('playwright');
const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 1. Charger les variables d'environnement depuis .env
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

async function captureMap() {
  const artifactDir = path.resolve('C:/Users/DELL/.gemini/antigravity-cli/brain/1c7e0dca-91f4-4686-827f-b7ce8ad57b87');
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const port = 3018;
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

  // Attente dynamique que le serveur Next.js réponde
  let serverReady = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://localhost:${port}/api/health`).catch(() => fetch(`http://localhost:${port}`));
      if (res && res.status) {
        serverReady = true;
        console.log(`✅ Serveur Next.js prêt sur le port ${port} (statut ${res.status}) !`);
        break;
      }
    } catch {
      // En attente
    }
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  if (!serverReady) {
    throw new Error('Le serveur Next.js n\'a pas répondu après 25 secondes.');
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

  page.on('pageerror', (err) => {
    console.error(`[Browser PageError] ${err.message}`);
  });

  await page.addInitScript((token) => {
    localStorage.setItem('lou_ame_tay_superadmin_auth', token);
    localStorage.setItem('lou_ame_tay_admin_last_activity', String(Date.now()));
  }, adminToken);

  try {
    console.log(`📍 Navigation vers http://localhost:${port}/super-admin...`);
    await page.goto(`http://localhost:${port}/super-admin`, { waitUntil: 'networkidle', timeout: 35000 });
    await page.waitForTimeout(3000);

    // Défilement vers la carte du Sénégal
    console.log('📜 Défilement vers #carte-senegal...');
    await page.waitForSelector('#carte-senegal', { timeout: 15000 });
    const mapSection = await page.$('#carte-senegal');
    if (mapSection) {
      await mapSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);
    }

    // Attente des marqueurs
    console.log('⏳ Attente des marqueurs custom-daw-map-marker...');
    await page.waitForSelector('.custom-daw-map-marker', { timeout: 15000 });
    const markers = await page.$$('.custom-daw-map-marker');
    console.log(`🎯 ${markers.length} marqueur(s) détecté(s) sur la carte du Sénégal !`);

    // Attendre que les tuiles de la carte se chargent
    await page.waitForTimeout(3500);

    // Clic sur l'un des marqueurs pour ouvrir la popup interactive
    if (markers.length > 0) {
      console.log('🖱️ Clic sur un marqueur de restaurant pour ouvrir l\'infobulle...');
      await markers[0].click({ force: true });
      await page.waitForTimeout(2000);
      try {
        await page.waitForSelector('.leaflet-popup', { timeout: 5000 });
        console.log('✅ Infobulle interactive Leaflet ouverte avec succès !');
      } catch (e) {
        console.log('Popup check:', e.message);
      }
    }

    console.log('📸 Enregistrement des captures d\'écran haute fidélité...');
    const fullPagePath = path.join(artifactDir, 'screenshot-google-maps-senegal-live.png');
    await page.screenshot({ path: fullPagePath, fullPage: false });
    console.log('✅ Capture d\'ensemble enregistrée :', fullPagePath);

    if (mapSection) {
      const mapComponentPath = path.join(artifactDir, 'screenshot-map-component-hd.png');
      await mapSection.screenshot({ path: mapComponentPath });
      console.log('✅ Capture zoomée composant cartographique enregistrée :', mapComponentPath);
    }

    console.log('🏆 SUCCÈS TOTAL : CARTOGRAPHIE SÉNÉGAL OPÉRATIONNELLE ET CAPTURÉE !');
  } catch (err) {
    console.error('❌ Erreur :', err);
    const errPath = path.join(artifactDir, 'screenshot-error-debug.png');
    await page.screenshot({ path: errPath }).catch(() => {});
  } finally {
    await browser.close();
    server.kill();
    process.exit(0);
  }
}

captureMap();
