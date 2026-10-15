import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import QRCode from 'qrcode';
import JSZip from 'jszip';

export async function GET(
  req: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const session = await getAuthSession(req);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Accès refusé. Réservé au Super Admin.' },
        { status: 403 }
      );
    }

    const { restaurantId } = params;

    const restaurant = await (prisma as any).tenant.findFirst({
      where: {
        OR: [
          { id: restaurantId },
          { subdomain: restaurantId },
        ],
      },
      include: {
        tables: {
          orderBy: { tableNumber: 'asc' },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant non trouvé' },
        { status: 404 }
      );
    }

    const zip = new JSZip();
    const folder = zip.folder(`qr-${restaurant.subdomain}`);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.louametay.com';

    // Génération des QR Codes SVG vectoriels pour chaque table
    for (const table of restaurant.tables) {
      const tableNum = (table as any).tableNumber ?? (table as any).number ?? 1;
      const url = `${baseUrl}/r/${restaurant.subdomain}/table-${tableNum}`;
      const svg = await QRCode.toString(url, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 512,
        color: { dark: '#000000', light: '#ffffff' },
      });
      folder?.file(`table-${String(tableNum).padStart(2, '0')}.svg`, svg);
    }

    // Ajout du QR Code SVG pour le Comptoir / Express
    const expressUrl = `${baseUrl}/r/${restaurant.subdomain}/express`;
    const expressSvg = await QRCode.toString(expressUrl, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 512,
      color: { dark: '#000000', light: '#ffffff' },
    });
    folder?.file(`comptoir-express.svg`, expressSvg);

    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="qr-lou-ame-tay-${restaurant.subdomain}.zip"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('[QR_EXPORT_ERROR]', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la génération du pack QR vectoriel.' },
      { status: 500 }
    );
  }
}
