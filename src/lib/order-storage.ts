import { 
  OrderType, 
  OrderStatus, 
  RestaurantType, 
  SubscriptionPlan, 
  SubscriptionStatus, 
  SupportTicketType, 
  TicketPriority, 
  TicketStatus,
  QRCodePhysicalOrder,
  QRCodeOrderStatus,
  MenuRequestType,
  MenuRequestStatus,
  TicketMessage
} from '@/types';
import { SAMPLE_RESTAURANT, SAMPLE_RESTAURANTS } from './sample-data';

// Persistent in-memory storage attached to globalThis
declare global {
  var globalOrders: OrderType[] | undefined;
  var globalRestaurants: RestaurantType[] | undefined;
  var globalScans: { restaurantId: string; tableNumber: number; scannedAt: string }[] | undefined;
  var globalTickets: SupportTicketType[] | undefined;
  var globalTicketMessages: TicketMessage[] | undefined;
  var globalQRCodeOrders: QRCodePhysicalOrder[] | undefined;
  var globalMenuRequests: MenuRequestType[] | undefined;
  var globalAvailabilityMap: Record<string, boolean> | undefined;
}

// Initial Seed for Restaurants (4 Restaurants Pilotes Réels + 3 Démo)
const INITIAL_RESTAURANTS: RestaurantType[] = SAMPLE_RESTAURANTS;

// Initial mock support tickets
const INITIAL_TICKETS: SupportTicketType[] = [
  {
    id: 'tick_01',
    restaurantId: 'resto_thies_01',
    restaurantName: 'Chez Fatou & Frères',
    subject: 'Problème de paiement Wave',
    message: 'Bonjour, j\'ai effectué le paiement de mon abonnement par Wave mais il reste marqué en attente.',
    priority: 'URGENTE',
    status: 'OUVERT',
    aiSuggestedSolution: 'Vérifier la référence de transaction Wave et prolonger l\'abonnement dans les réglages en 1 clic.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tick_02',
    restaurantId: 'resto_saly_03',
    restaurantName: 'Le Jardin des Saveurs',
    subject: 'Demande d\'ajout de Thiof braisé',
    message: 'Pouvez-vous ajouter le Thiof braisé spécialité du chef à notre carte ? Photo transmise par WhatsApp.',
    priority: 'MOYENNE',
    status: 'OUVERT',
    aiSuggestedSolution: 'Intégrer le plat dans la catégorie Poissons avec photo et 14 allergènes déclarés.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial mock physical QR orders
const INITIAL_QRCODE_ORDERS: QRCodePhysicalOrder[] = [
  {
    id: 'qr_ord_01',
    restaurantId: 'resto_thies_01',
    restaurantName: 'Chez Fatou & Frères',
    packTitle: 'Jeu de 1 à 5 tables',
    tableCount: 4,
    format: 'A5 plastifié haute résistance',
    price: 5000,
    city: 'Thiès',
    phone: '+221 77 654 32 10',
    status: 'EN_COURS_IMPRESSION',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'qr_ord_02',
    restaurantId: 'resto_dakar_02',
    restaurantName: 'Le Relais des Almadies',
    packTitle: 'Jeu de 13 à 20 tables',
    tableCount: 20,
    format: 'A5 plastifié + chevalet + PVC étanche',
    price: 12000,
    city: 'Dakar',
    phone: '+221 78 123 45 67',
    status: 'EXPEDIE',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getRestaurantsList(): RestaurantType[] {
  if (!globalThis.globalRestaurants) {
    globalThis.globalRestaurants = INITIAL_RESTAURANTS;
  }
  return globalThis.globalRestaurants;
}

export const orderStorage = {
  getOrders: (): OrderType[] => {
    return globalThis.globalOrders || [];
  },

  getOrdersByRestaurantId: (restaurantId: string): OrderType[] => {
    const orders = globalThis.globalOrders || [];
    return orders.filter(
      (o) => o.restaurantId === restaurantId || o.restaurantName?.toLowerCase() === restaurantId.toLowerCase()
    );
  },

  addOrder: (order: OrderType) => {
    if (!globalThis.globalOrders) {
      globalThis.globalOrders = [];
    }
    globalThis.globalOrders.unshift(order);

    const restos = getRestaurantsList();
    const resto = restos.find(
      (r) => r.id === order.restaurantId || r.subdomain === order.restaurantId
    );

    if (resto) {
      resto.totalOrders = (resto.totalOrders || 0) + 1;
      resto.totalRevenue = (resto.totalRevenue || 0) + order.total;
      resto.lastOrderAt = order.createdAt;

      if (resto.stats) {
        resto.stats.totalOrders += 1;
        resto.stats.totalRevenue += order.total;
        resto.stats.averageBasket = Math.round(resto.stats.totalRevenue / resto.stats.totalOrders);
        resto.stats.conversionRate = Number(
          ((resto.stats.totalOrders / Math.max(1, resto.stats.totalScans)) * 100).toFixed(1)
        );
      }
    }

    return order;
  },

  getOrderById: (orderId: string): OrderType | null => {
    if (!globalThis.globalOrders) return null;
    return globalThis.globalOrders.find((o) => o.id === orderId) || null;
  },

  updateOrderStatus: (orderId: string, status: OrderStatus): OrderType | null => {
    if (!globalThis.globalOrders) return null;
    const index = globalThis.globalOrders.findIndex((o) => o.id === orderId);
    if (index !== -1) {
      globalThis.globalOrders[index].status = status;
      if (status === 'SERVED') {
        globalThis.globalOrders[index].servedAt = new Date().toISOString();
      }
      globalThis.globalOrders[index].updatedAt = new Date().toISOString();
      return globalThis.globalOrders[index];
    }
    return null;
  },

  getRestaurants: (): RestaurantType[] => {
    return getRestaurantsList();
  },

  getAllRestaurants: (): RestaurantType[] => {
    return getRestaurantsList();
  },

  getRestaurantById: (idOrSubdomain: string): RestaurantType | null => {
    const restos = getRestaurantsList();
    return restos.find((r) => r.id === idOrSubdomain || r.subdomain === idOrSubdomain) || null;
  },

  addRestaurant: (data: {
    name: string;
    subdomain: string;
    ownerName?: string;
    phone?: string;
    address?: string;
    plan?: SubscriptionPlan;
    months?: number;
    tablesCount?: number;
  }): RestaurantType => {
    return orderStorage.createRestaurant(data);
  },

  createRestaurant: (data: {
    name: string;
    subdomain: string;
    ownerName?: string;
    phone?: string;
    address?: string;
    plan?: SubscriptionPlan;
    months?: number;
    tablesCount?: number;
  }): RestaurantType => {
    const restos = getRestaurantsList();
    const tableCount = data.tablesCount || 12;
    const months = data.months || 3;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    const newResto: RestaurantType = {
      id: `resto_${Date.now()}`,
      name: data.name,
      subdomain: data.subdomain.toLowerCase().trim(),
      ownerName: data.ownerName || '',
      phone: data.phone || '',
      address: data.address || '',
      logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      currency: 'FCFA',
      isActive: true,
      tableCount,
      tablesCount: tableCount,
      totalScans: 0,
      totalOrders: 0,
      totalRevenue: 0,
      createdAt: new Date().toISOString(),
      stats: {
        totalScans: 0,
        todayScans: 0,
        totalOrders: 0,
        totalRevenue: 0,
        conversionRate: 0,
        averageBasket: 0,
        peakHour: 13,
        peakHoursDistribution: [],
        scansHistory30d: [],
        ordersHistory30d: [],
        dailyHistory: [
          { day: 'Lun', scans: 0, orders: 0, revenue: 0 },
          { day: 'Mar', scans: 0, orders: 0, revenue: 0 },
          { day: 'Mer', scans: 0, orders: 0, revenue: 0 },
          { day: 'Jeu', scans: 0, orders: 0, revenue: 0 },
          { day: 'Ven', scans: 0, orders: 0, revenue: 0 },
          { day: 'Sam', scans: 0, orders: 0, revenue: 0 },
          { day: 'Dim', scans: 0, orders: 0, revenue: 0 },
        ],
        scansByTable: Array.from({ length: tableCount }, (_, i) => ({
          tableNumber: i + 1,
          scans: 0,
        })),
      },
      subscription: {
        id: `sub_${Date.now()}`,
        plan: data.plan || 'PRO',
        status: 'ACTIVE',
        price: data.plan === 'STARTER' ? 15000 : data.plan === 'PRO' ? 25000 : 50000,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      categories: [
        {
          id: `cat_starter_${Date.now()}`,
          name: '🌟 Lou Ame Tay (Plats du Jour)',
          icon: '🌟',
          displayOrder: 0,
          items: [],
        },
      ],
    };

    restos.unshift(newResto);
    return newResto;
  },

  updateRestaurant: (
    id: string,
    data: {
      name?: string;
      ownerName?: string;
      phone?: string;
      address?: string;
      tableCount?: number;
      isActive?: boolean;
      plan?: SubscriptionPlan;
      price?: number;
      status?: SubscriptionStatus;
      endDate?: string;
    }
  ): RestaurantType | null => {
    const restos = getRestaurantsList();
    const index = restos.findIndex((r) => r.id === id || r.subdomain === id);
    if (index === -1) return null;

    const current = restos[index];

    if (data.name !== undefined) current.name = data.name;
    if (data.ownerName !== undefined) current.ownerName = data.ownerName;
    if (data.phone !== undefined) current.phone = data.phone;
    if (data.address !== undefined) current.address = data.address;
    if (data.isActive !== undefined) current.isActive = data.isActive;

    if (data.tableCount !== undefined) {
      const count = Number(data.tableCount) || 12;
      current.tableCount = count;
      current.tablesCount = count;
      if (current.stats) {
        current.stats.scansByTable = Array.from({ length: count }, (_, i) => ({
          tableNumber: i + 1,
          scans: current.stats?.scansByTable[i]?.scans || 0,
        }));
      }
    }

    if (current.subscription) {
      if (data.plan !== undefined) current.subscription.plan = data.plan;
      if (data.price !== undefined) current.subscription.price = Number(data.price);
      if (data.status !== undefined) {
        current.subscription.status = data.status;
        current.isActive = data.status === 'ACTIVE' || data.status === 'TRIAL';
      }
      if (data.endDate !== undefined) current.subscription.endDate = data.endDate;
    }

    return current;
  },

  deleteRestaurant: (id: string): boolean => {
    const restos = getRestaurantsList();
    const index = restos.findIndex((r) => r.id === id || r.subdomain === id);
    if (index !== -1) {
      restos.splice(index, 1);
      return true;
    }
    return false;
  },

  toggleRestaurantActive: (restaurantId: string, isActive: boolean): RestaurantType | null => {
    const restos = getRestaurantsList();
    const index = restos.findIndex((r) => r.id === restaurantId || r.subdomain === restaurantId);
    if (index === -1) return null;

    restos[index].isActive = isActive;
    return restos[index];
  },

  extendSubscription: (restaurantId: string, additionalMonths: number): RestaurantType | null => {
    const restos = getRestaurantsList();
    const index = restos.findIndex((r) => r.id === restaurantId || r.subdomain === restaurantId);
    if (index === -1) return null;

    const resto = restos[index];
    if (resto.subscription) {
      const currentEnd = new Date(resto.subscription.endDate);
      const baseDate = currentEnd > new Date() ? currentEnd : new Date();
      baseDate.setMonth(baseDate.getMonth() + additionalMonths);

      resto.subscription.endDate = baseDate.toISOString();
      resto.subscription.status = 'ACTIVE';
      resto.isActive = true;
    }

    return resto;
  },

  // QR CODES LIST GENERATOR FOR BATCH PRINTING
  getRestaurantQRCodes: (restaurantId: string) => {
    const resto = orderStorage.getRestaurantById(restaurantId);
    if (!resto) return [];

    const count = resto.tableCount || 12;
    return Array.from({ length: count }, (_, i) => {
      const tableNumber = i + 1;
      const menuUrl = `https://louametay.sn/r/${resto.subdomain}/table-${tableNumber}`;
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(menuUrl)}`;

      return {
        tableNumber,
        tableName: `Table ${tableNumber < 10 ? `0${tableNumber}` : tableNumber}`,
        restaurantName: resto.name,
        subdomain: resto.subdomain,
        menuUrl,
        qrImageUrl,
        printFormat: 'Chevalet A5 / Support PVC Étanchéifié',
      };
    });
  },

  // WHATSAPP SMART REMINDER GENERATOR
  generateWhatsAppReminder: (restaurantId: string, daysOffset?: number) => {
    const resto = orderStorage.getRestaurantById(restaurantId);
    if (!resto) return null;

    const endDate = resto.subscription ? new Date(resto.subscription.endDate) : new Date();
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const daysRemaining = daysOffset !== undefined ? daysOffset : Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const price = resto.subscription?.price || 25000;
    const owner = resto.ownerName || 'Cher Partenaire';
    const phoneClean = (resto.phone || '').replace(/[^0-9]/g, '');

    let timingText = `arrive à échéance dans ${daysRemaining} jours (le ${endDate.toLocaleDateString('fr-FR')})`;
    if (daysRemaining <= 0) {
      timingText = `est arrivé à échéance le ${endDate.toLocaleDateString('fr-FR')}`;
    }

    const message = `👋 Bonjour ${owner},\n\n` +
      `Votre abonnement "Lou Ame Tay ? 🍽️" pour votre restaurant *${resto.name}* ${timingText}.\n\n` +
      `💳 *Montant du renouvellement :* ${new Intl.NumberFormat('fr-FR').format(price)} FCFA / mois.\n\n` +
      `Pour éviter toute interruption de votre menu digital et des commandes par QR Code, vous pouvez effectuer le règlement par :\n` +
      `• *Wave :* +221 77 123 45 67\n` +
      `• *Orange Money :* +221 78 987 65 43\n\n` +
      `Dès validation, votre service sera automatiquement reconduit. Merci de votre fidélité !\n\n` +
      `_L'équipe Lou Ame Tay • Support Agence 24/7_`;

    const whatsappUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(message)}`;

    return {
      restaurantId: resto.id,
      restaurantName: resto.name,
      ownerName: owner,
      phone: resto.phone,
      daysRemaining,
      price,
      message,
      whatsappUrl,
    };
  },

  // SUPPORT 24/7 TICKETS
  getSupportTickets: (): SupportTicketType[] => {
    if (!globalThis.globalTickets) {
      globalThis.globalTickets = INITIAL_TICKETS;
    }
    return globalThis.globalTickets;
  },

  getSupportTicketsByRestaurantId: (restaurantId: string): SupportTicketType[] => {
    const tickets = orderStorage.getSupportTickets();
    return tickets.filter((t) => t.restaurantId === restaurantId);
  },

  getSupportTicketById: (ticketId: string): SupportTicketType | null => {
    const tickets = orderStorage.getSupportTickets();
    return tickets.find((t) => t.id === ticketId) || null;
  },

  createSupportTicket: (data: {
    restaurantId: string;
    restaurantName: string;
    subject: string;
    message: string;
    priority?: TicketPriority;
  }): SupportTicketType => {
    if (!globalThis.globalTickets) {
      globalThis.globalTickets = INITIAL_TICKETS;
    }

    const newTicket: SupportTicketType = {
      id: `tick_${Date.now()}`,
      restaurantId: data.restaurantId,
      restaurantName: data.restaurantName,
      subject: data.subject,
      message: data.message,
      priority: data.priority || 'MOYENNE',
      status: 'OUVERT',
      aiSuggestedSolution: 'Votre demande a été prise en compte par notre assistant IA 24/7. Une réponse et un technicien sont à votre disposition.',
      messages: [
        {
          id: `tmsg_${Date.now()}`,
          ticketId: `tick_${Date.now()}`,
          sender: 'CLIENT',
          content: data.message,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    globalThis.globalTickets.unshift(newTicket);
    return newTicket;
  },

  addTicketMessage: (ticketId: string, sender: 'CLIENT' | 'SUPPORT' | 'IA', content: string, senderName?: string): TicketMessage | null => {
    const tickets = orderStorage.getSupportTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return null;

    if (!ticket.messages) {
      ticket.messages = [];
    }

    const newMsg: TicketMessage = {
      id: `tmsg_${Date.now()}`,
      ticketId,
      sender,
      senderName,
      content,
      createdAt: new Date().toISOString(),
    };

    ticket.messages.push(newMsg);
    ticket.updatedAt = new Date().toISOString();
    return newMsg;
  },

  updateSupportTicketStatus: (ticketId: string, status: TicketStatus): SupportTicketType | null => {
    const tickets = orderStorage.getSupportTickets();
    const index = tickets.findIndex((t) => t.id === ticketId);
    if (index !== -1) {
      tickets[index].status = status;
      tickets[index].updatedAt = new Date().toISOString();
      return tickets[index];
    }
    return null;
  },

  // PHYSICAL QR CODE ORDERS
  getQRCodeOrders: (): QRCodePhysicalOrder[] => {
    if (!globalThis.globalQRCodeOrders) {
      globalThis.globalQRCodeOrders = INITIAL_QRCODE_ORDERS;
    }
    return globalThis.globalQRCodeOrders;
  },

  getQRCodeOrdersByRestaurantId: (restaurantId: string): QRCodePhysicalOrder[] => {
    const orders = orderStorage.getQRCodeOrders();
    return orders.filter((o) => o.restaurantId === restaurantId);
  },

  createQRCodeOrder: (data: {
    restaurantId: string;
    restaurantName: string;
    packTitle: string;
    tableCount: number;
    format: string;
    price: number;
    city?: string;
    phone?: string;
  }): QRCodePhysicalOrder => {
    if (!globalThis.globalQRCodeOrders) {
      globalThis.globalQRCodeOrders = INITIAL_QRCODE_ORDERS;
    }

    const newOrder: QRCodePhysicalOrder = {
      id: `qr_ord_${Date.now()}`,
      restaurantId: data.restaurantId,
      restaurantName: data.restaurantName,
      packTitle: data.packTitle,
      tableCount: data.tableCount,
      format: data.format,
      price: data.price,
      city: data.city || 'Thiès / Dakar',
      phone: data.phone || '',
      status: 'EN_COURS_IMPRESSION',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    globalThis.globalQRCodeOrders.unshift(newOrder);
    return newOrder;
  },

  updateQRCodeOrderStatus: (orderId: string, status: QRCodeOrderStatus): QRCodePhysicalOrder | null => {
    const orders = orderStorage.getQRCodeOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      orders[index].updatedAt = new Date().toISOString();
      return orders[index];
    }
    return null;
  },

  // MENU REQUESTS
  getMenuRequests: (): MenuRequestType[] => {
    return globalThis.globalMenuRequests || [];
  },

  createMenuRequest: (data: {
    restaurantId: string;
    restaurantName: string;
    name: string;
    wolofName?: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
    allergens: string[];
  }): MenuRequestType => {
    if (!globalThis.globalMenuRequests) {
      globalThis.globalMenuRequests = [];
    }

    const newReq: MenuRequestType = {
      id: `mreq_${Date.now()}`,
      restaurantId: data.restaurantId,
      restaurantName: data.restaurantName,
      name: data.name,
      wolofName: data.wolofName,
      description: data.description,
      price: data.price,
      category: data.category,
      imageUrl: data.imageUrl,
      allergens: data.allergens,
      status: 'EN_ATTENTE',
      createdAt: new Date().toISOString(),
    };

    globalThis.globalMenuRequests.unshift(newReq);
    return newReq;
  },

  toggleItemAvailability: (itemId: string, isAvailable: boolean) => {
    if (!globalThis.globalAvailabilityMap) {
      globalThis.globalAvailabilityMap = {};
    }
    globalThis.globalAvailabilityMap[itemId] = isAvailable;
  },

  getItemAvailability: (itemId: string, defaultAvailability: boolean = true): boolean => {
    if (!globalThis.globalAvailabilityMap) {
      globalThis.globalAvailabilityMap = {};
    }
    if (typeof globalThis.globalAvailabilityMap[itemId] === 'boolean') {
      return globalThis.globalAvailabilityMap[itemId];
    }
    return defaultAvailability;
  },

  recordScan: (subdomainOrId: string, tableNumber: number) => {
    if (!globalThis.globalScans) {
      globalThis.globalScans = [];
    }

    const timestamp = new Date().toISOString();
    globalThis.globalScans.unshift({
      restaurantId: subdomainOrId,
      tableNumber,
      scannedAt: timestamp,
    });

    const restos = getRestaurantsList();
    const resto = restos.find((r) => r.id === subdomainOrId || r.subdomain === subdomainOrId);
    if (resto) {
      resto.totalScans = (resto.totalScans || 0) + 1;
      resto.lastScanAt = timestamp;

      if (resto.stats) {
        resto.stats.totalScans += 1;
        resto.stats.todayScans += 1;
        resto.stats.conversionRate = Number(
          ((resto.stats.totalOrders / Math.max(1, resto.stats.totalScans)) * 100).toFixed(1)
        );

        const tableEntry = resto.stats.scansByTable.find((t) => t.tableNumber === Number(tableNumber));
        if (tableEntry) {
          tableEntry.scans += 1;
        }
      }
    }
  },

  // ---------------- WAITER CALL ALERTS ---------------- //
  getWaiterCalls: (restaurantId?: string) => {
    if (!(globalThis as any).globalWaiterCalls) {
      (globalThis as any).globalWaiterCalls = [];
    }
    const calls: any[] = (globalThis as any).globalWaiterCalls;
    if (restaurantId) {
      return calls.filter((c) => (c.restaurantId === restaurantId || c.restaurantId === 'resto_thies_01') && !c.resolved);
    }
    return calls.filter((c) => !c.resolved);
  },

  addWaiterCall: (data: { restaurantId: string; tableNumber: number; customerName?: string; reason?: string }) => {
    if (!(globalThis as any).globalWaiterCalls) {
      (globalThis as any).globalWaiterCalls = [];
    }
    const newCall = {
      id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      restaurantId: data.restaurantId || 'resto_thies_01',
      tableNumber: Number(data.tableNumber),
      customerName: data.customerName || null,
      reason: data.reason || "Demande d'assistance / Serveur",
      createdAt: new Date().toISOString(),
      resolved: false,
    };
    (globalThis as any).globalWaiterCalls.unshift(newCall);
    return newCall;
  },

  resolveWaiterCall: (callId: string) => {
    if (!(globalThis as any).globalWaiterCalls) return false;
    const call = (globalThis as any).globalWaiterCalls.find((c: any) => c.id === callId);
    if (call) {
      call.resolved = true;
      call.resolvedAt = new Date().toISOString();
      return true;
    }
    return false;
  },
};


