import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed pour Lou Ame Tay?...');

  // Nettoyer les anciennes données
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.scan.deleteMany();
  await prisma.orderAnalytics.deleteMany();
  await prisma.dailyStats.deleteMany();
  await prisma.table.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.subscription.deleteMany();

  // 1. Créer l'abonnement
  const sub = await prisma.subscription.create({
    data: {
      plan: 'PRO',
      status: 'ACTIVE',
      price: 25000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // +90 jours
    },
  });

  // 2. Créer le restaurant Chez Fatou
  const restaurant = await prisma.restaurant.create({
    data: {
      id: 'resto_thies_01',
      name: 'Chez Fatou & Frères',
      subdomain: 'chezfatou',
      ownerName: 'Fatou Diop',
      phone: '+221 77 654 32 10',
      address: 'Avenue Léopold Sédar Senghor, Thiès, Sénégal',
      logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      currency: 'FCFA',
      isActive: true,
      tableCount: 12,
      totalScans: 348,
      totalOrders: 174,
      totalRevenue: 642000,
      subscriptionId: sub.id,
    },
  });

  console.log(`✅ Restaurant créé : ${restaurant.name} (${restaurant.subdomain})`);

  // 3. Créer 12 tables
  for (let i = 1; i <= 12; i++) {
    await prisma.table.create({
      data: {
        number: i,
        restaurantId: restaurant.id,
        qrCodeUrl: `https://louametay.sn/r/${restaurant.subdomain}/table-${i}`,
      },
    });
  }

  // 4. Créer les 7 catégories avec leurs plats complets
  const categoriesData = [
    {
      name: '🌟 Lou Ame Tay (Plats du Jour)',
      icon: '🌟',
      displayOrder: 0,
      items: [
        {
          name: 'Ceebu Jën Pëndaa Mbaye',
          nameWolof: 'Lou Ame Tay',
          description: 'Riz rouge cuit au bouillon de mérou blanc frais, légumes du terroir (chou, manioc, carotte, aubergine, gingembre)',
          price: 3500,
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
          preparationTime: 10,
          rating: 4.5,
          allergens: ['GLUTEN', 'CRUSTACES', 'POISSON'],
          isAvailable: true,
          isSpecialOfTheDay: true,
        },
        {
          name: 'Dibi d\'Agneau façon Thiès',
          nameWolof: 'Dibi Xar',
          description: 'Morceaux tendres d\'agneau marinés aux épices secrètes, grillés au feu de bois',
          price: 5500,
          imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
          preparationTime: 15,
          rating: 4.5,
          allergens: ['GLUTEN', 'MOUTARDE'],
          isAvailable: true,
          isSpecialOfTheDay: true,
        },
        {
          name: 'Yassa Poulet Fermier',
          nameWolof: 'Yassa Ginaar',
          description: 'Cuisses de poulet marinées au citron vert de Casamance, oignons caramélisés',
          price: 4000,
          imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
          preparationTime: 12,
          rating: 5.0,
          allergens: ['GLUTEN', 'MOUTARDE'],
          isAvailable: true,
          isSpecialOfTheDay: false,
        },
      ],
    },
    {
      name: '🥗 Entrées & Tapas',
      icon: '🥗',
      displayOrder: 1,
      items: [
        {
          name: 'Pastels au Thon & Sauce Piquante (x10)',
          nameWolof: 'Pastels Jën',
          description: 'Beignets croustillants fourrés au thon épicé et herbes fraîches, sauce tomate frite',
          price: 2000,
          imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
          preparationTime: 8,
          rating: 4.8,
          allergens: ['GLUTEN', 'POISSON', 'OEUFS'],
          isAvailable: true,
          isSpecialOfTheDay: false,
        },
        {
          name: 'Fataya Viande Hachée Épicée (x8)',
          nameWolof: 'Fataya Yàpp',
          description: 'Chaussons dorés à la viande de bœuf assaisonnée au poivre noir et piment vert doux',
          price: 2500,
          imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
          preparationTime: 8,
          rating: 4.7,
          allergens: ['GLUTEN', 'OEUFS'],
          isAvailable: true,
          isSpecialOfTheDay: false,
        },
      ],
    },
    {
      name: '🥩 Grillades',
      icon: '🥩',
      displayOrder: 2,
      items: [
        {
          name: 'Brochettes de Bœuf Suya (x4)',
          nameWolof: 'Brochettes Yàpp',
          description: 'Filet de bœuf tendre mariné au kankankan, servi avec frites maison ou aloco doré',
          price: 4500,
          imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80',
          preparationTime: 12,
          rating: 4.8,
          allergens: ['ARACHIDES'],
          isAvailable: true,
          isSpecialOfTheDay: false,
        },
        {
          name: 'Demi-Poulet Braisé & Sauce Verte',
          nameWolof: 'Ginaar bu Ñor',
          description: 'Poulet fermier grillé à la braise, assaisonnement aillé et sauce pimentée',
          price: 4500,
          imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
          preparationTime: 15,
          rating: 4.9,
          allergens: ['MOUTARDE'],
          isAvailable: true,
          isSpecialOfTheDay: false,
        },
      ],
    },
    {
      name: '🐟 Poissons & Fruits de Mer',
      icon: '🐟',
      displayOrder: 3,
      items: [
        {
          name: 'Capitaine Entier Braisé & Alloco',
          nameWolof: 'Capitaine bu Ñor',
          description: 'Capitaine frais pêché le matin, mariné aux aromates, servi avec bananes plantains frites',
          price: 6500,
          imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
          preparationTime: 18,
          rating: 4.9,
          allergens: ['POISSON'],
          isAvailable: true,
          isSpecialOfTheDay: false,
        },
        {
          name: 'Poêlée de Crevettes Tigrées à l\'Ail',
          nameWolof: 'Sipax bu Ñor',
          description: 'Grosses crevettes fraîches sautées à l\'huile d\'olive, persillade et jus de citron vert',
          price: 6000,
          imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
          preparationTime: 12,
          rating: 4.8,
          allergens: ['CRUSTACES'],
          isAvailable: true,
          isSpecialOfTheDay: false,
        },
      ],
    },
    {
      name: '🍲 Plats Traditionnels',
      icon: '🍲',
      displayOrder: 4,
      items: [
        {
          name: 'Mafé Kandja au Bœuf Fondant',
          nameWolof: 'Maffe Kandja',
          description: 'Sauce onctueuse à la pâte d\'arachide torréfiée, morceaux de bœuf braisé mijotés et gombos',
          price: 3500,
          imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
          preparationTime: 10,
          rating: 4.8,
          allergens: ['ARACHIDES'],
          isAvailable: true,
          isSpecialOfTheDay: false,
        },
        {
          name: 'Soupou Kandja Royal Fruits de Mer',
          nameWolof: 'Soupou Kandia',
          description: 'Ragoût traditionnel au gombo frais et huile de palme rouge, crabe, crevettes et poisson fumé',
          price: 4500,
          imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
          preparationTime: 15,
          rating: 4.7,
          allergens: ['CRUSTACES', 'POISSON', 'MOLLUSQUES'],
          isAvailable: true,
          isSpecialOfTheDay: false,
        },
      ],
    },
    {
      name: '🍰 Desserts',
      icon: '🍰',
      displayOrder: 5,
      items: [
        {
          name: 'Thiakry / Dégué Gourmand',
          nameWolof: 'Caakiri',
          description: 'Couscous de mil cuit à la vapeur avec yaourt onctueux, muscade, vanille et raisins secs',
          price: 1500,
          imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
          preparationTime: 5,
          rating: 4.9,
          allergens: ['LAIT', 'GLUTEN'],
          isAvailable: true,
          isSpecialOfTheDay: false,
        },
        {
          name: 'Salade de Fruits Tropicaux',
          nameWolof: 'Salade de Fruits',
          description: 'Mangues Kent de Casamance, papaye fraîche et ananas au sirop de menthe',
          price: 1500,
          imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
          preparationTime: 5,
          rating: 4.7,
          allergens: [],
          isAvailable: true,
          isSpecialOfTheDay: false,
        },
      ],
    },
    {
      name: '🥤 Boissons',
      icon: '🥤',
      displayOrder: 6,
      items: [
        {
          name: 'Jus de Bissap Rouge Frais (50cl)',
          nameWolof: 'Jus Bissap',
          description: 'Infusion d\'hibiscus bio du Sénégal, feuilles de menthe fraîche et touche de fleur d\'oranger',
          price: 1000,
          imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
          preparationTime: 3,
          rating: 4.9,
          allergens: [],
          isAvailable: true,
          isSpecialOfTheDay: false,
        },
        {
          name: 'Jus de Bouye Onctueux (Pain de Singe)',
          nameWolof: 'Jus Bouye',
          description: 'Nectar crémeux extrait du fruit du baobab avec une pointe de lait concentré et vanille',
          price: 1200,
          imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
          preparationTime: 3,
          rating: 4.8,
          allergens: ['LAIT'],
          isAvailable: true,
          isSpecialOfTheDay: false,
        },
      ],
    },
  ];

  for (const catData of categoriesData) {
    const category = await prisma.category.create({
      data: {
        name: catData.name,
        icon: catData.icon,
        displayOrder: catData.displayOrder,
        restaurantId: restaurant.id,
      },
    });

    for (const item of catData.items) {
      await prisma.menuItem.create({
        data: {
          name: item.name,
          nameWolof: item.nameWolof,
          description: item.description,
          price: item.price,
          imageUrl: item.imageUrl,
          preparationTime: item.preparationTime,
          rating: item.rating,
          allergens: item.allergens,
          isAvailable: item.isAvailable,
          isSpecialOfTheDay: item.isSpecialOfTheDay,
          categoryId: category.id,
        },
      });
    }
  }

  console.log('✅ Base de données seedée avec les 7 catégories et l\'ensemble des plats sénégalais !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
