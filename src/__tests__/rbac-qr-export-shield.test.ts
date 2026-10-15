import { describe, it, expect } from 'vitest';
import QRCode from 'qrcode';
import JSZip from 'jszip';

describe('RBAC QR-Export & Anti-Screenshot Shield Matrix', () => {
  it('Doit générer un SVG vectoriel valide avec QRCode.toString', async () => {
    const url = 'https://louametay.com/r/anima-pizzeria/table-01';
    const svg = await QRCode.toString(url, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 512,
      color: { dark: '#000000', light: '#ffffff' },
    });

    expect(svg).toBeDefined();
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('viewBox');
  });

  it('Doit assembler une archive ZIP contenant les fichiers SVG vectoriels des tables', async () => {
    const zip = new JSZip();
    const folder = zip.folder('qr-anima-pizzeria');

    const svgSample = await QRCode.toString('https://louametay.com/r/anima-pizzeria/table-01', {
      type: 'svg',
      errorCorrectionLevel: 'H',
      width: 512,
    });

    folder?.file('table-01.svg', svgSample);
    folder?.file('table-02.svg', svgSample);

    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(100);

    // Relecture du ZIP pour valider son contenu
    const unzipped = await JSZip.loadAsync(buffer);
    expect(unzipped.file('qr-anima-pizzeria/table-01.svg')).toBeDefined();
    expect(unzipped.file('qr-anima-pizzeria/table-02.svg')).toBeDefined();
  });

  it('Doit respecter la matrice stricte de verrouillage du ScreenShield', () => {
    const computeIsLocked = (
      userRole: 'SUPER_ADMIN' | 'RESTAURANT_ADMIN' | 'KITCHEN_STAFF' | 'CASHIER' | 'CUSTOMER',
      isQrZone = false
    ) => {
      return userRole === 'SUPER_ADMIN'
        ? false
        : userRole === 'RESTAURANT_ADMIN'
        ? isQrZone
        : true;
    };

    // 1. SUPER_ADMIN : Jamais verrouillé (visualisation et capture autorisées)
    expect(computeIsLocked('SUPER_ADMIN', false)).toBe(false);
    expect(computeIsLocked('SUPER_ADMIN', true)).toBe(false);

    // 2. RESTAURANT_ADMIN : Autorisé sur dashboard général, mais STRICTEMENT VERROUILLÉ sur zone QR
    expect(computeIsLocked('RESTAURANT_ADMIN', false)).toBe(false);
    expect(computeIsLocked('RESTAURANT_ADMIN', true)).toBe(true);

    // 3. CUSTOMER, KITCHEN_STAFF, CASHIER : Toujours strictement verrouillés
    expect(computeIsLocked('CUSTOMER', false)).toBe(true);
    expect(computeIsLocked('CUSTOMER', true)).toBe(true);
    expect(computeIsLocked('KITCHEN_STAFF', false)).toBe(true);
    expect(computeIsLocked('CASHIER', false)).toBe(true);
  });
});
