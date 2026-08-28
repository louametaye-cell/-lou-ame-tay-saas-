import { NextResponse } from 'next/server';

// GET /api/dashboard/weekly-trends
// Récupère les données d'analyse hebdomadaire (Scans & Commandes)
export async function GET() {
  try {
    const trends = [
      { day: 'Lun', scans: 45, orders: 12, revenue: 48000 },
      { day: 'Mar', scans: 52, orders: 15, revenue: 56000 },
      { day: 'Mer', scans: 48, orders: 13, revenue: 51000 },
      { day: 'Jeu', scans: 61, orders: 18, revenue: 72000 },
      { day: 'Ven', scans: 75, orders: 24, revenue: 98000 },
      { day: 'Sam', scans: 88, orders: 32, revenue: 135000 },
      { day: 'Dim', scans: 68, orders: 22, revenue: 89000 },
    ];

    return NextResponse.json({
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      scans: [45, 52, 48, 61, 75, 88, 68],
      orders: [12, 15, 13, 18, 24, 32, 22],
      trends,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération tendances' }, { status: 500 });
  }
}
