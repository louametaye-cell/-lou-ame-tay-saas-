import { NextResponse } from 'next/server';
import { orderStorage } from '@/lib/order-storage';

// GET /api/super-admin/restaurants/[id]/qrcodes
// Génère la liste des QR codes d'un restaurant en JSON ou CSV pour l'imprimeur
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');

    const qrList = orderStorage.getRestaurantQRCodes(params.id);
    const resto = orderStorage.getRestaurantById(params.id);

    if (!resto) {
      return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });
    }

    // CSV Format for Print Batch / Imprimeur
    if (format === 'csv') {
      const headers = [
        'Table',
        'Nom Restaurant',
        'Sous-domaine',
        'URL Menu Direct',
        'Lien Image QR Code HD (1000x1000)',
        'Format Recommandé Imprimerie',
      ];

      const rows = qrList.map((q) => [
        `"${q.tableName}"`,
        `"${q.restaurantName.replace(/"/g, '""')}"`,
        `"${q.subdomain}"`,
        `"${q.menuUrl}"`,
        `"${q.qrImageUrl}"`,
        `"${q.printFormat}"`,
      ]);

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="qr_codes_${resto.subdomain}_imprimeur.csv"`,
        },
      });
    }

    return NextResponse.json({ restaurant: resto.name, count: qrList.length, qrcodes: qrList });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur génération QR codes' }, { status: 500 });
  }
}
