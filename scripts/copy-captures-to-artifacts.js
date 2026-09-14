const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/DELL/Desktop/Lou ame Tay menu digital Mda arts work/captures_qa';
const destDir = 'C:/Users/DELL/.gemini/antigravity-cli/brain/75de7c6c-7d49-45e7-8d44-20e944055fef';

const files = [
  '01_ouverture_caisse_pin_et_fond.png',
  '02_kds_cuisine_en_preparation_zero_fcfa.png',
  '03_ecran_tv_pickup_commande_prete_xxl.png',
  '04_caisse_servie_non_encaissee_0fcfa.png',
  '05_modal_cloture_z_ecart_0fcfa.png'
];

for (const f of files) {
  const src = path.join(srcDir, f);
  const dest = path.join(destDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copié : ${f} -> ${dest}`);
  }
}
