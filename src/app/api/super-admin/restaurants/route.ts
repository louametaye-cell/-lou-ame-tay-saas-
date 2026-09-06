import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
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
        price: t.monthlyFee,
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
    const body = await req.json();
    const { name, subdomain, ownerName, phone, address, plan, months, tablesCount } = body;

    if (!name || !subdomain) {
      return NextResponse.json(
        { error: 'Nom et sous-domaine obligatoires' },
        { status: 400 }
      );
    }

    const cleanSubdomain = subdomain.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');

    // Récupérer le plan par défaut (créer un plan si inexistant dans la BDD pour éviter les erreurs de clé étrangère)
    let dbPlan = await (prisma as any).plan.findFirst();
    if (!dbPlan) {
      dbPlan = await (prisma as any).plan.create({
        data: {
          name: 'Pro',
          slug: 'pro',
          price: 25000,
        }
      });
    }

    const defaultEmail = `contact@${cleanSubdomain}.sn`;
    const hashedPassword = await bcrypt.hash('Pass1234!', 10);

    const newTenant = await (prisma as any).tenant.create({
      data: {
        businessName: name,
        subdomain: cleanSubdomain,
        email: defaultEmail,
        passwordHash: hashedPassword,
        ownerName: ownerName || '',
        phone: phone || '',
        address: address || '',
        currentPlanId: dbPlan.id,
        subscriptionStatus: 'ACTIVE',
      }
    });

    // Create default tables
    const numTables = Number(tablesCount) || 10;
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

    return NextResponse.json({ success: true, restaurant: newTenant }, { status: 201 });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du restaurant' },
      { status: 500 }
    );
  }
}
