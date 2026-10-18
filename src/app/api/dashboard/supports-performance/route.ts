import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId') || searchParams.get('tenantId');

    // Filter by tenant if provided
    const tenantFilter = restaurantId ? { tenantId: restaurantId } : {};

    const [tables, dotations, catalog] = await Promise.all([
      prisma.table.findMany({
        where: {
          ...tenantFilter,
          isActive: true,
        },
        include: {
          support: true,
          tenant: {
            select: {
              id: true,
              businessName: true,
              subdomain: true,
            },
          },
        },
      }),
      prisma.tenantHardwareDotation.findMany({
        where: tenantFilter,
        include: {
          support: true,
          tenant: {
            select: {
              id: true,
              businessName: true,
            },
          },
        },
      }),
      prisma.qRSupportCatalog.findMany({
        where: { isActive: true },
      }),
    ]);

    // Aggregate statistics
    let totalScans = 0;
    let scansToday = 0;
    const supportStatsMap: Record<string, any> = {};
    const materialStatsMap: Record<string, { scans: number; tablesCount: number }> = {
      BOIS: { scans: 0, tablesCount: 0 },
      ACRYLIQUE: { scans: 0, tablesCount: 0 },
      ALUMINIUM: { scans: 0, tablesCount: 0 },
    };
    const spaceStatsMap: Record<string, { scans: number; tablesCount: number }> = {
      TABLE: { scans: 0, tablesCount: 0 },
      ROOM: { scans: 0, tablesCount: 0 },
      POOL: { scans: 0, tablesCount: 0 },
      BEACH: { scans: 0, tablesCount: 0 },
      BAR: { scans: 0, tablesCount: 0 },
    };
    const finishStatsMap: Record<string, { scans: number; tablesCount: number }> = {
      STANDARD: { scans: 0, tablesCount: 0 },
      MARINE_VERNIS: { scans: 0, tablesCount: 0 },
    };

    let unassignedTablesCount = 0;

    for (const table of tables) {
      totalScans += table.totalScans || 0;
      scansToday += table.scansToday || 0;

      if (table.support) {
        const sup = table.support;
        if (!supportStatsMap[sup.id]) {
          supportStatsMap[sup.id] = {
            id: sup.id,
            name: sup.name,
            material: sup.material,
            finishType: sup.finishType,
            targetSpace: sup.targetSpace,
            sellingPrice: sup.sellingPrice,
            totalScans: 0,
            scansToday: 0,
            tablesCount: 0,
          };
        }
        supportStatsMap[sup.id].totalScans += table.totalScans || 0;
        supportStatsMap[sup.id].scansToday += table.scansToday || 0;
        supportStatsMap[sup.id].tablesCount += 1;

        // Material aggregation
        if (materialStatsMap[sup.material]) {
          materialStatsMap[sup.material].scans += table.totalScans || 0;
          materialStatsMap[sup.material].tablesCount += 1;
        }

        // Space aggregation
        if (spaceStatsMap[sup.targetSpace]) {
          spaceStatsMap[sup.targetSpace].scans += table.totalScans || 0;
          spaceStatsMap[sup.targetSpace].tablesCount += 1;
        }

        // Finish aggregation
        if (finishStatsMap[sup.finishType]) {
          finishStatsMap[sup.finishType].scans += table.totalScans || 0;
          finishStatsMap[sup.finishType].tablesCount += 1;
        }
      } else {
        unassignedTablesCount += 1;
      }
    }

    const supportsPerformance = Object.values(supportStatsMap).sort((a, b) => b.totalScans - a.totalScans);

    return NextResponse.json({
      success: true,
      summary: {
        totalScans,
        scansToday,
        totalTables: tables.length,
        equippedTables: tables.length - unassignedTablesCount,
        unassignedTablesCount,
      },
      supportsPerformance,
      byMaterial: materialStatsMap,
      bySpace: spaceStatsMap,
      byFinish: finishStatsMap,
      catalog,
      dotations,
      tables: tables.map((t) => ({
        id: t.id,
        tableNumber: t.tableNumber,
        identifier: t.identifier,
        spaceType: t.spaceType,
        totalScans: t.totalScans,
        scansToday: t.scansToday,
        support: t.support
          ? {
              id: t.support.id,
              name: t.support.name,
              material: t.support.material,
              finishType: t.support.finishType,
            }
          : null,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching supports performance:', error);
    return NextResponse.json({ error: 'Erreur analyse performance supports' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tableId, tableIds, supportId } = body;

    if (!supportId) {
      return NextResponse.json({ error: 'supportId requis' }, { status: 400 });
    }

    if (tableIds && Array.isArray(tableIds)) {
      await prisma.table.updateMany({
        where: { id: { in: tableIds } },
        data: { supportId },
      });
      return NextResponse.json({ success: true, count: tableIds.length });
    }

    if (tableId) {
      const updated = await prisma.table.update({
        where: { id: tableId },
        data: { supportId },
      });
      return NextResponse.json({ success: true, table: updated });
    }

    return NextResponse.json({ error: 'tableId ou tableIds requis' }, { status: 400 });
  } catch (error: any) {
    console.error('Error assigning support to table:', error);
    return NextResponse.json({ error: 'Erreur association support' }, { status: 500 });
  }
}
