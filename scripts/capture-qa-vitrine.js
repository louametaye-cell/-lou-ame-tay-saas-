const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function captureVitrineQA() {
  console.log('🚀 Démarrage de la capture QA Playwright pour le site vitrine...');

  const outputDirDir = path.join(__dirname, '..', 'capture des teste');
  const artifactDir = path.join('C:', 'Users', 'DELL', '.gemini', 'antigravity-ide', 'brain', 'd898ffd6-ae4b-43e1-b35e-a2f1a266ce9b');

  if (!fs.existsSync(outputDirDir)) {
    fs.mkdirSync(outputDirDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  
  // 1. Desktop Viewport (1920x1080)
  const contextDesktop = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await contextDesktop.newPage();

  console.log('📡 Navigation vers http://localhost:3000...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Capture Pourquoi / Problems Section
  const pourquoiElement = await page.$('#pourquoi');
  if (pourquoiElement) {
    const mePath = path.join(outputDirDir, 'vitrine_problems_interactive.png');
    const meArtifactPath = path.join(artifactDir, 'vitrine_problems_interactive.png');
    await pourquoiElement.screenshot({ path: mePath });
    fs.copyFileSync(mePath, meArtifactPath);
    console.log('📸 Capture Problems Interactive Section sauvegardée :', mePath);
  }

  await contextDesktop.close();
  await browser.close();

  console.log('✅ Capture HD de la section Problèmes & Solutions générée avec succès !');
}

captureVitrineQA().catch((err) => {
  console.error('❌ Erreur lors de la capture :', err);
  process.exit(1);
});
