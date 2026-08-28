import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SAMPLE_RESTAURANT } from '@/lib/sample-data';
import { orderStorage } from '@/lib/order-storage';
import { MenuItemType } from '@/types';

// PATCH /api/restaurant/menu-items/[id]
// Modification complète d'un plat (Nom, Description, Prix, Image, Temps, Catégorie, Allergènes, etc.)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;
    const body = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: 'ID du plat manquant' }, { status: 400 });
    }

    // 1. Update in SAMPLE_RESTAURANT categories in memory
    let updatedItem: MenuItemType | null = null;

    for (const cat of SAMPLE_RESTAURANT.categories) {
      if (!cat.items) cat.items = [];
      const itemIndex = cat.items.findIndex((i) => i.id === itemId);
      if (itemIndex !== -1) {
        const current = cat.items[itemIndex];
        
        // Merge updates
        const updated: MenuItemType = {
          ...current,
          name: body.name !== undefined ? body.name : current.name,
          wolofName: body.wolofName !== undefined ? body.wolofName : current.wolofName,
          nameWolof: body.wolofName !== undefined ? body.wolofName : current.nameWolof,
          description: body.description !== undefined ? body.description : current.description,
          price: body.price !== undefined ? Number(body.price) : current.price,
          imageUrl: body.imageUrl !== undefined ? body.imageUrl : current.imageUrl,
          preparationTime: body.preparationTime !== undefined ? Number(body.preparationTime) : current.preparationTime,
          categoryId: body.categoryId !== undefined ? body.categoryId : current.categoryId,
          allergens: body.allergens !== undefined ? body.allergens : current.allergens,
          spiceLevel: body.spiceLevel !== undefined ? body.spiceLevel : current.spiceLevel,
          isAvailable: body.isAvailable !== undefined ? body.isAvailable : current.isAvailable,
          isSpecialOfTheDay: body.isSpecialOfTheDay !== undefined ? body.isSpecialOfTheDay : current.isSpecialOfTheDay,
          isSpecial: body.isSpecialOfTheDay !== undefined ? body.isSpecialOfTheDay : current.isSpecial,
          translations: body.translations !== undefined ? body.translations : current.translations,
        };

        // If category changed, move item
        if (body.categoryId && body.categoryId !== cat.id) {
          cat.items.splice(itemIndex, 1);
          const targetCat = SAMPLE_RESTAURANT.categories.find((c) => c.id === body.categoryId);
          if (targetCat) {
            if (!targetCat.items) targetCat.items = [];
            targetCat.items.push(updated);
          }
        } else {
          cat.items[itemIndex] = updated;
        }

        if (typeof body.isAvailable === 'boolean') {
          orderStorage.toggleItemAvailability(itemId, body.isAvailable);
        }

        updatedItem = updated;
        break;
      }
    }

    // 2. Also attempt update in Prisma DB if available
    try {
      if (updatedItem) {
        await (prisma as any).menuItem?.update({
          where: { id: itemId },
          data: {
            name: updatedItem.name,
            description: updatedItem.description,
            price: updatedItem.price,
            imageUrl: updatedItem.imageUrl,
            isAvailable: updatedItem.isAvailable,
            preparationTime: updatedItem.preparationTime,
            categoryId: updatedItem.categoryId,
            allergens: updatedItem.allergens,
          },
        });
      }
    } catch (dbErr) {
      // Non-blocking
    }

    if (!updatedItem) {
      return NextResponse.json({ error: 'Plat introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Plat modifié avec succès',
      item: updatedItem,
    });
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification du plat' },
      { status: 500 }
    );
  }
}

// DELETE /api/restaurant/menu-items/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;
    for (const cat of SAMPLE_RESTAURANT.categories) {
      if (!cat.items) cat.items = [];
      const idx = cat.items.findIndex((i) => i.id === itemId);
      if (idx !== -1) {
        cat.items.splice(idx, 1);
        return NextResponse.json({ success: true, message: 'Plat supprimé' });
      }
    }
    return NextResponse.json({ error: 'Plat non trouvé' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
  }
}