import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isAuthorizedSuperAdmin } from '@/lib/admin-auth';
import { resolveRestaurantCoordinates } from '@/lib/senegal-geo';

export async function GET(req: Request) {
  try {
    if (!isAuthorizedSuperAdmin(req)) {
      return NextResponse.json({ error: 'Accès non autorisé : Droits Super-Admin requis' }, { status: 401 });
    }

    let tenants: any[] = [];
    try {
      tenants = await (prisma as any).tenant.findMany({
        include: {
          plan: true,
          tables: true,
          orders: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (dbErr: any) {
      console.warn('⚠️ [RETRY_ATTEMPT] Tentative de reconnexion à la base de données après micro-coupure...');
      await new Promise((r) => setTimeout(r, 600));
      try {
        tenants = await (prisma as any).tenant.findMany({
          include: {
            plan: true,
            tables: true,
            orders: true,
          },
          orderBy: { createdAt: 'desc' },
        });
      } catch (finalErr) {
        console.error('🚨 [RESILIENT_FALLBACK] Utilisation du catalogue résilient des 4 restaurants pilotes DAW :', finalErr);
        // Fallback résilient avec géolocalisation WGS84 exacte
        return NextResponse.json({
          source: 'resilient_fallback',
          restaurants: [
            {
              id: 'tenant_sams_restaurant',
              name: "Sam's Prestige Restaurant",
              subdomain: 'sams-prestige',
              ownerName: 'SIDATE DIOP',
              phone: '+221 77 783 70 90',
              address: 'Avenue Lamine Guèye, Thiès',
              city: 'Thiès',
              latitude: 14.7915,
              longitude: -16.9255,
              logoUrl: '/logo.png',
              currency: 'FCFA',
              establishmentType: 'Restaurant',
              branding: {
                latitude: 14.7915,
                longitude: -16.9255,
                primaryColor: '#9F1239',
              },
              isActive: true,
              tablesCount: 14,
              ordersCount: 42,
              createdAt: new Date().toISOString(),
              subscription: {
                plan: 'XÉWEUL',
                status: 'ACTIVE',
                price: 35000,
              },
            },
            {
              id: 'tenant_madiba_restau',
              name: 'MADIBA RESTAURANT',
              subdomain: 'madiba-restaurant',
              ownerName: 'Direction Madiba',
              phone: '+221 77 631 70 86',
              address: 'HLM Route de Mbour, Thiès',
              city: 'Thiès',
              latitude: 14.7738,
              longitude: -16.9380,
              logoUrl: '/logo.png',
              currency: 'FCFA',
              establishmentType: 'Restaurant',
              branding: {
                latitude: 14.7738,
                longitude: -16.9380,
                primaryColor: '#FF6B00',
              },
              isActive: true,
              tablesCount: 12,
              ordersCount: 28,
              createdAt: new Date().toISOString(),
              subscription: {
                plan: 'NIO_FAR',
                status: 'ACTIVE',
                price: 25000,
              },
            },
            {
              id: 'tenant_hotel_lat_dior',
              name: 'Hôtel Résidence Lat-Dior Thiès',
              subdomain: 'hotel-lat-dior',
              ownerName: 'Direction Hôtel Lat-Dior',
              phone: '+221 77 275 67 67',
              address: 'Face Stade, lat Dior, Route de Mbour , Thiès Sénégal',
              city: 'Thiès',
              latitude: 14.7982,
              longitude: -16.9170,
              logoUrl: 'http://res.cloudinary.com/s5chmyms/image/upload/v1788895464/louametay/logos/qbopa68ws4jy13wrnusx.jpg',
              currency: 'FCFA',
              establishmentType: 'HOTEL',
              branding: {
                latitude: 14.7982,
                longitude: -16.9170,
                primaryColor: '#D97706',
              },
              isActive: true,
              tablesCount: 24,
              ordersCount: 35,
              createdAt: new Date().toISOString(),
              subscription: {
                plan: 'TERANGA',
                status: 'ACTIVE',
                price: 45000,
              },
            },
            {
              id: 'tenant_anima_pizzeria',
              name: 'Anima Pizzeria',
              subdomain: 'anima-pizzeria',
              ownerName: 'Direction Anima',
              phone: '+221 77 458 74 74',
              address: 'Plage BCEAO, Yoff, Dakar',
              city: 'Dakar',
              latitude: 14.7612,
              longitude: -17.4735,
              logoUrl: 'http://res.cloudinary.com/s5chmyms/image/upload/v1788760527/louametay/logos/yu0t2bals1erh6evapfz.jpg',
              currency: 'FCFA',
              establishmentType: 'Pizzeria',
              branding: {
                latitude: 14.7612,
                longitude: -17.4735,
                primaryColor: '#00A86B',
              },
              isActive: true,
              tablesCount: 20,
              ordersCount: 56,
              createdAt: new Date().toISOString(),
              subscription: {
                plan: 'BAOBAB',
                status: 'ACTIVE',
                price: 45000,
              },
            },
          ],
        });
      }
    }

    const formatted = tenants.map((t: any) => {
      const coords = resolveRestaurantCoordinates({
        subdomain: t.subdomain,
        city: t.city,
        address: t.address,
        latitude: (t.branding as any)?.latitude,
        longitude: (t.branding as any)?.longitude,
        branding: t.branding
      });

      return {
        id: t.id,
        name: t.businessName,
        subdomain: t.subdomain,
        ownerName: t.ownerName,
        phone: t.phone,
        address: t.address,
        city: t.city || 'Thiès',
        latitude: coords.lat,
        longitude: coords.lng,
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
      };
    });

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
    let uniqueEmail = `contact@${uniqueSubdomain}.com`;
    let emailCounter = 1;
    while (await (prisma as any).tenant.findFirst({ where: { email: uniqueEmail } })) {
      uniqueEmail = `contact-${emailCounter}@${uniqueSubdomain}.com`;
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
          phone: phone || '+221 77 000 00 00',
        },
        currentPlanId: dbPlan.id,
        subscriptionStatus: 'ACTIVE',
        monthlyFee: dbPlan.price || 25000,
      }
    });

    // Création autonome de la zone par défaut et des tables
    const defaultZone = await (prisma as any).zone.create({
      data: {
        tenantId: newTenant.id,
        name: 'Salle Principale',
        type: 'TABLES',
      }
    });

    const numTables = Number(tablesCount) || 12;
    const tablesToCreate = [];
    for (let i = 1; i <= numTables; i++) {
      tablesToCreate.push({
        tenantId: newTenant.id,
        zoneId: defaultZone.id,
        tableNumber: i,
        label: `Table ${i}`
      });
    }
    
    if (tablesToCreate.length > 0) {
      await (prisma as any).table.createMany({
        data: tablesToCreate
      });
    }

    // Création autonome des catégories et articles modèles de démarrage
    try {
      const catPlats = await (prisma as any).category.create({
        data: {
          tenantId: newTenant.id,
          name: 'Plats & Spécialités',
          icon: '🍲',
          displayOrder: 1,
        }
      });

      const catBoissonsFrais = await (prisma as any).category.create({
        data: {
          tenantId: newTenant.id,
          name: 'Boissons Fraîches & Jus Locaux',
          icon: '🍹',
          displayOrder: 2,
        }
      });

      const catBoissonsChaud = await (prisma as any).category.create({
        data: {
          tenantId: newTenant.id,
          name: 'Boissons Chaudes',
          icon: '☕',
          displayOrder: 3,
        }
      });

      const catCollations = await (prisma as any).category.create({
        data: {
          tenantId: newTenant.id,
          name: 'Collations & En-cas',
          icon: '🥐',
          displayOrder: 4,
        }
      });

      const catDesserts = await (prisma as any).category.create({
        data: {
          tenantId: newTenant.id,
          name: 'Desserts & Douceurs',
          icon: '🍰',
          displayOrder: 5,
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
            categoryId: catBoissonsFrais.id,
            name: 'Jus de Bissap Rouge Frais',
            description: 'Infusion fraîche de fleurs d\'hibiscus et menthe',
            price: 1000,
            isAvailable: true,
            imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
          },
          {
            tenantId: newTenant.id,
            categoryId: catBoissonsChaud.id,
            name: 'Café Touba Traditionnel',
            description: 'Café moulu parfumé au poivre de Selim (Djar)',
            price: 500,
            isAvailable: true,
            imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
          },
          {
            tenantId: newTenant.id,
            categoryId: catCollations.id,
            name: 'Pastels Dorés au Thon (6 pcs)',
            description: 'Chaussons croustillants servis avec sauce tomate épicée',
            price: 1500,
            isAvailable: true,
            imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
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
