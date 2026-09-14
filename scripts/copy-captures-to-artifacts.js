const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/DELL/Desktop/Lou ame Tay menu digital Mda arts work/captures_qa';
const destDir = 'C:/Users/DELL/.gemini/antigravity-cli/brain/75de7c6c-7d49-45e7-8d44-20e944055fef';

const files = [
  '22_tambali_selection_drawer_mobile.png',
  '23_tambali_cashier_blocked.png',
  '24_tambali_kitchen_blocked.png',
  '25_tambali_pickup_blocked.png',
  '26_tambali_dashboard_clean.png',
];

for (const f of files) {
  const src = path.join(srcDir, f);
  const dest = path.join(destDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copié : ${f} -> ${dest}`);
  } else {
    console.warn(`Introuvable : ${src}`);
  }
}

