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
    const { name, subdomain, ownerName, phone, address, plan, months, tablesCount } = body;

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

    const hashedPassword = await bcrypt.hash('Pass1234!', 10);
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
