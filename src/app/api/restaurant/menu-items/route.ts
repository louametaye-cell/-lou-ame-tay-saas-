import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { invalidateMenuCache } from '@/lib/cache';
import { Language } from '@/types';

// Helper to resolve tenant ID
async function resolveTenantId(reqTenantInput?: string): Promise<{ id: string; subdomain: string } | null> {
  let input = reqTenantInput;
  if (!input) {
    try {
      const cookieStore = cookies();
      const token = cookieStore.get('saas_token')?.value;
      if (token && token.startsWith('resto_session_')) {
        input = token.replace('resto_session_', '');
      }
    } catch (e) {}
  }

  if (input) {
    try {
      const dbTenant = await (prisma as any).tenant.findFirst({
        where: {
          OR: [
            { id: input },
            { subdomain: input },
          ],
        },
        select: { id: true, subdomain: true },
      });
      if (dbTenant) return dbTenant;
    } catch (err) {
      console.error('Erreur resolution tenant:', err);
    }
  }

  // Fallback sur le premier tenant actif
  try {
    const fallbackTenant = await (prisma as any).tenant.findFirst({
      select: { id: true, subdomain: true },
    });
    return fallbackTenant || null;
  } catch (e) {
    return null;
  }
}

// GET /api/restaurant/menu-items
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantParam = searchParams.get('tenantId') || searchParams.get('restaurantId') || searchParams.get('subdomain');
    const tenant = await resolveTenantId(tenantParam || undefined);

    if (!tenant) {
      return NextResponse.json({ error: 'Restaurant non identifié' }, { status: 400 });
    }

    const items = await (prisma as any).menuItem.findMany({
      where: { tenantId: tenant.id },
      include: {
        category: true,
        translations: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error('Erreur GET menu-items:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des plats' }, { status: 500 });
  }
}

// POST /api/restaurant/menu-items
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      tenantId: rawTenantId,
      restaurantId,
      name,
      description,
      price,
      categoryId: rawCategoryId,
      imageUrl,
      isAvailable = true,
      isSpecialOfTheDay = false,
      isDailySpecial = false,
      translations,
    } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json(
        { error: 'Le nom et le prix du plat sont obligatoires' },
        { status: 400 }
      );
    }

    const tenant = await resolveTenantId(rawTenantId || restaurantId);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Restaurant non identifié. Veuillez vous reconnecter.' },
        { status: 400 }
      );
    }

    // Resolve or fallback Category
    let targetCategoryId = rawCategoryId;
    if (targetCategoryId) {
      const catExists = await (prisma as any).category.findFirst({
        where: { id: targetCategoryId, tenantId: tenant.id },
      });
      if (!catExists) {
        targetCategoryId = null;
      }
    }

    if (!targetCategoryId) {
      // Find first category of this tenant or create a default one
      let firstCat = await (prisma as any).category.findFirst({
        where: { tenantId: tenant.id },
        orderBy: { displayOrder: 'asc' },
      });

      if (!firstCat) {
        firstCat = await (prisma as any).category.create({
          data: {
            tenantId: tenant.id,
            name: 'Plats & Spécialités',
            icon: '🍽️',
            displayOrder: 1,
          },
        });
      }
      targetCategoryId = firstCat.id;
    }

    const specialFlag = Boolean(isSpecialOfTheDay || isDailySpecial);

    // Create MenuItem in Prisma
    const newItem = await (prisma as any).menuItem.create({
      data: {
        tenantId: tenant.id,
        categoryId: targetCategoryId,
        name: name.trim(),
        description: description?.trim() || '',
        price: Number(price),
        imageUrl: imageUrl?.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        isAvailable: Boolean(isAvailable),
        isDailySpecial: specialFlag,
      },
      include: {
        category: true,
      },
    });

    // Create Translations if provided (EN, ES, IT, WO)
    if (translations && typeof translations === 'object') {
      const translationEntries: any[] = [];
      const supportedLangs: Language[] = ['EN', 'ES', 'IT', 'WO'];

      for (const lang of supportedLangs) {
        const trans = translations[lang];
        if (trans && trans.name) {
          translationEntries.push({
            menuItemId: newItem.id,
            language: lang,
            name: trans.name.trim(),
            description: trans.description?.trim() || '',
          });
        }
      }

      if (translationEntries.length > 0) {
        await (prisma as any).menuItemTranslation.createMany({
          data: translationEntries,
          skipDuplicates: true,
        });
      }
    }

    // Invalidate Redis Menu & Display Cache
    await invalidateMenuCache(tenant.subdomain);
    await invalidateMenuCache(tenant.id);

    return NextResponse.json(
      {
        success: true,
        message: `Plat "${newItem.name}" créé avec succès !`,
        item: newItem,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erreur POST menu-items:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la création du plat' },
      { status: 500 }
    );
  }
}
