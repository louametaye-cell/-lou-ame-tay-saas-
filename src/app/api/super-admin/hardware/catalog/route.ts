import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.qRSupportCatalog.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: {
            dotations: true,
            tables: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error('Error fetching hardware catalog:', error);
    return NextResponse.json({ error: 'Erreur récupération catalogue supports' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      material,
      targetSpace,
      finishType,
      costPrice,
      sellingPrice,
      stockQuantity,
      packagingIncluded = true,
      antiTheftEngraving = true,
      imageUrl,
      isSavPack = false,
    } = body;

    if (!name || costPrice === undefined || sellingPrice === undefined) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    const newItem = await prisma.qRSupportCatalog.create({
      data: {
        name,
        description: description || null,
        material: material || 'BOIS',
        targetSpace: targetSpace || 'TABLE',
        finishType: finishType || 'STANDARD',
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        stockQuantity: Number(stockQuantity) || 0,
        packagingIncluded: Boolean(packagingIncluded),
        antiTheftEngraving: Boolean(antiTheftEngraving),
        imageUrl: imageUrl || null,
        isSavPack: Boolean(isSavPack),
      },
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating hardware item:', error);
    return NextResponse.json({ error: 'Erreur création support physique' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, stockAdjustment, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID du support requis' }, { status: 400 });
    }

    const dataToUpdate: any = { ...updates };
    if (stockAdjustment !== undefined) {
      dataToUpdate.stockQuantity = { increment: Number(stockAdjustment) };
    }

    const updated = await prisma.qRSupportCatalog.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    console.error('Error updating hardware item:', error);
    return NextResponse.json({ error: 'Erreur mise à jour support' }, { status: 500 });
  }
}
