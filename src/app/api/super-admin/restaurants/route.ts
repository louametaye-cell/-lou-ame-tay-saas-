import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isAuthorizedSuperAdmin } from '@/lib/admin-auth';

export async function GET(req: Request) {
  try {
    if (!isAuthorizedSuperAdmin(req)) {
      return NextResponse.json({ error: 'Accès non autorisé : Droits Super-Admin requis' }, { status: 401 });
    }

    const tenants = await (prisma as any).tenant.findMany({
      include: {
        plan: true,
        tables: true,
        orders: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = tenants.map((t: any) => ({
      id: t.id,
      name: t.businessName,
      subdomain: t.subdomain,
      ownerName: t.ownerName,
      phone: t.phone,
      address: t.address,
      logoUrl: t.logoUrl,
      bannerUrl: t.bannerUrl,
      currency: t.currency,
      establishmentType: (t.branding as any)?.establishmentType || 'Restaurant',
      branding: t.branding || {},
      isActive: t.subscriptionStatus !== 'CANCELED' && t.subscriptionStatus !== 'SUSPENDED',
      tablesCount: t.tables?.length || 0,
      ordersCount: t.orders?.length || 0,
      createdAt: t.createdAt.toISOString(),
      subscription: {
        plan: t.plan?.name || 'Inconnu',
        status: t.subscriptionStatus,
        price: Number(t.monthlyFee || t.plan?.price || 25000),
        endDate: t.subscriptionExpiresAt ? t.subscriptionExpiresAt.toISOString() : undefined,
      }
    }));

    return NextResponse.json({ restaurants: formatted, source: 'database' });
  } catch (error) {
    console.error('Erreur GET tenants:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!isAuthorizedSuperAdmin(req)) {
      return NextResponse.json({ error: 'Accès non autorisé : Droits Super-Admin requis' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      name, 
      subdomain, 
      ownerName, 
      phone, 
      address, 
      plan, 
      months, 
      tablesCount,
      logoUrl,
      establishmentType,
      password,
    } = body;

    if (!name || !subdomain) {
      return NextResponse.json(
        { error: 'Nom et sous-domaine obligatoires' },
        { status: 400 }
      );
    }

    let targetSubdomain = subdomain.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (!targetSubdomain) {
      targetSubdomain = `resto-${Date.now().toString().slice(-6)}`;
    }

    // Résolution automatique de l'unicité du sous-domaine
    let uniqueSubdomain = targetSubdomain;
    let counter = 1;
    while (await (prisma as any).tenant.findFirst({ where: { subdomain: uniqueSubdomain } })) {
      uniqueSubdomain = `${targetSubdomain}-${counter}`;
      counter++;
    }

    // Résolution automatique de l'unicité de l'email
    let uniqueEmail = `contact@${uniqueSubdomain}.sn`;
    let emailCounter = 1;
    while (await (prisma as any).tenant.findFirst({ where: { email: uniqueEmail } })) {
      uniqueEmail = `contact-${emailCounter}@${uniqueSubdomain}.sn`;
      emailCounter++;
    }

    // Recherche du plan adapté (Starter, Pro, Premium/Enterprise)
    const planSearchSlug = (plan || 'pro').toLowerCase().replace('enterprise', 'premium');
    let dbPlan = await (prisma as any).plan.findFirst({
      where: {
        OR: [
          { slug: { contains: planSearchSlug } },
          { name: { contains: planSearchSlug } }
        ]
      }
    });

    if (!dbPlan) {
      dbPlan = await (prisma as any).plan.findFirst();
    }

    if (!dbPlan) {
      dbPlan = await (prisma as any).plan.create({
        data: {
          name: 'Pro',
          slug: 'pro',
          price: 25000,
        }
      });
    }

    const initialPassword = password && String(password).trim() ? String(password).trim() : 'Pass1234!';
    const hashedPassword = await bcrypt.hash(initialPassword, 10);
    const durationMonths = Number(months) || 3;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);

    const newTenant = await (prisma as any).tenant.create({
      data: {
        businessName: name,
        subdomain: uniqueSubdomain,
        email: uniqueEmail,
        passwordHash: hashedPassword,
        ownerName: ownerName || 'Gérant non renseigné',
        phone: phone || '+221 77 000 00 00',
        address: address || 'Dakar / Sénégal',
        logoUrl: logoUrl || null,
        branding: {
          establishmentType: establishmentType || 'Restaurant',
        },
        currentPlanId: dbPlan.id,
        subscriptionStatus: 'ACTIVE',
        monthlyFee: dbPlan.price || 25000,
      }
    });

    // Création autonome des tables
    const numTables = Number(tablesCount) || 12;
    const tablesToCreate = [];
    for (let i = 1; i <= numTables; i++) {
      tablesToCreate.push({
        tenantId: newTenant.id,
        tableNumber: i,
        label: `Table ${i}`
      });
    }
    
    if (tablesToCreate.length > 0) {
      await (prisma as any).table.createMany({
        data: tablesToCreate
      });
    }

    // Création autonome des catégories et plats de démarrage
    try {
      const catPlats = await (prisma as any).category.create({
        data: {
          tenantId: newTenant.id,
          name: 'Plats & Spécialités',
          icon: '🍲',
          displayOrder: 1,
        }
      });

      const catBoissons = await (prisma as any).category.create({
        data: {
          tenantId: newTenant.id,
          name: 'Boissons Fraîches',
          icon: '🥤',
          displayOrder: 2,
        }
      });

      const catDesserts = await (prisma as any).category.create({
        data: {
          tenantId: newTenant.id,
          name: 'Desserts & Douceurs',
          icon: '🍰',
          displayOrder: 3,
        }
      });

      await (prisma as any).menuItem.createMany({
        data: [
          {
            tenantId: newTenant.id,
            categoryId: catPlats.id,
            name: 'Thiéboudienne du Terroir',
            description: 'Riz rouge au poisson noble et légumes frais du marché',
            price: 3500,
            isAvailable: true,
            isDailySpecial: true,
            imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
          },
          {
            tenantId: newTenant.id,
            categoryId: catPlats.id,
            name: 'Yassa Poulet Braisé',
            description: 'Poulet mariné au citron vert et oignons confits',
            price: 3000,
            isAvailable: true,
            isDailySpecial: false,
            imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
          },
          {
            tenantId: newTenant.id,
            categoryId: catBoissons.id,
            name: 'Jus de Bissap Maison',
            description: 'Infusion fraîche de fleurs d\'hibiscus et menthe',
            price: 1000,
            isAvailable: true,
            imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
          },
          {
            tenantId: newTenant.id,
            categoryId: catDesserts.id,
            name: 'Thiakry au Lait Doux',
            description: 'Couscous de mil au yaourt crémeux et touche de muscade',
            price: 1500,
            isAvailable: true,
            imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80',
          }
        ]
      });
    } catch (seedErr) {
      console.warn('Warning: Erreur initialisation menu modèle pour nouveau tenant:', seedErr);
    }

    return NextResponse.json({ 
      success: true, 
      restaurant: {
        id: newTenant.id,
        name: newTenant.businessName,
        subdomain: newTenant.subdomain,
        ownerName: newTenant.ownerName,
        phone: newTenant.phone,
        address: newTenant.address,
        isActive: true,
        tablesCount: numTables,
        ordersCount: 0,
        createdAt: newTenant.createdAt.toISOString(),
        subscription: {
          plan: dbPlan.name,
          status: 'ACTIVE',
          price: dbPlan.price,
        }
      } 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating restaurant:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la création du restaurant' },
      { status: 500 }
    );
  }
}
