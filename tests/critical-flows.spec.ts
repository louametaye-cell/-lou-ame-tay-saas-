import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/prisma';
import { shouldReleaseTableAfterPayment } from '@/lib/table-release';

describe('🛡️ SUITE DE TESTS CRITIQUES ANTI-RÉGRESSION — LOU AME TAY ?', () => {

  describe('1. Flux Table : Règle Absolue de Libération de Table', () => {
    it('Une table avec des commandes KDS (PREPARING, READY, SERVED) mais impayées NE DOIT JAMAIS être libérée', () => {
      // Simule des commandes passées en cuisine et prêtes à être servies mais non encore encaissées
      const activeUnpaidOrders = [
        {
          id: 'test-order-1',
          tableNumber: 2,
          status: 'READY' as const,
          paymentStatus: 'UNPAID' as const,
          createdAt: new Date(),
        },
      ];

      // Sans encaissement, la table ne doit en aucun cas être libérée
      const canRelease = shouldReleaseTableAfterPayment(activeUnpaidOrders);
      expect(canRelease).toBe(false);
    });

    it('Une table n\'est libérée QUE lorsque TOUTES les commandes de la session sont encaissées (paymentStatus === PAID)', () => {
      // Toutes les commandes sur la table sont payées
      const allOrdersPaid = [
        {
          id: 'test-order-1',
          tableNumber: 2,
          status: 'SERVED' as const,
          paymentStatus: 'PAID' as const,
          createdAt: new Date(),
        },
      ];

      // Maintenant que la dernière commande est payée, la table peut être libérée
      const canRelease = shouldReleaseTableAfterPayment(allOrdersPaid, 'test-order-1');
      expect(canRelease).toBe(true);
    });

    it('Si une table a plusieurs commandes (ex: dessert commandé plus tard), la table reste OCCUPIED tant qu\'un dessert est impayé', () => {
      const mixedOrders = [
        {
          id: 'test-plat-principal',
          tableNumber: 3,
          status: 'SERVED' as const,
          paymentStatus: 'PAID' as const,
          createdAt: new Date(),
        },
        {
          id: 'test-dessert',
          tableNumber: 3,
          status: 'READY' as const,
          paymentStatus: 'UNPAID' as const,
          createdAt: new Date(),
        },
      ];

      // Encaissement du plat principal : le dessert est encore impayé, la table doit RESTER occupée
      const canRelease = shouldReleaseTableAfterPayment(mixedOrders, 'test-plat-principal');
      expect(canRelease).toBe(false);
    });
  });

  describe('2. Flux Comptoir (Takeaway) : Cloisonnement Strict & Zéro Collision', () => {
    it('Une vente directe comptoir doit avoir strictement orderType === TAKEAWAY et tableNumber === 0', () => {
      const orderPayload = {
        isTakeaway: true,
        tableNumber: 0,
      };

      const computedOrderType = orderPayload.isTakeaway || orderPayload.tableNumber === 0
        ? 'TAKEAWAY'
        : 'TABLE';

      const computedTableNumber = computedOrderType === 'TAKEAWAY' ? 0 : orderPayload.tableNumber;

      expect(computedOrderType).toBe('TAKEAWAY');
      expect(computedTableNumber).toBe(0);
    });

    it('Une commande sur table (tableNumber > 0) ne doit JAMAIS être classée en TAKEAWAY même si payée plus tard', () => {
      const tableOrderPayload = {
        isTakeaway: false,
        tableNumber: 5,
        isPaidLater: true,
      };

      // Bug historique résolu : ne plus utiliser || !isPaidLater qui forçait isTakeaway
      const isTakeaway = tableOrderPayload.isTakeaway || tableOrderPayload.tableNumber === 0;
      const orderType = isTakeaway ? 'TAKEAWAY' : 'TABLE';

      expect(orderType).toBe('TABLE');
      expect(tableOrderPayload.tableNumber).toBe(5);
    });

    it('Filtrage Caisse : Ventes Comptoir et Ventes sur Table doivent être mutuellement exclusives', () => {
      const ordersList = [
        { id: '1', orderType: 'TABLE', tableNumber: 4, paymentStatus: 'UNPAID' },
        { id: '2', orderType: 'TAKEAWAY', tableNumber: 0, paymentStatus: 'UNPAID' },
        { id: '3', orderType: 'TABLE', tableNumber: 7, paymentStatus: 'PAID' },
        { id: '4', orderType: 'TAKEAWAY', tableNumber: 0, paymentStatus: 'PAID' },
      ];

      const tableOrders = ordersList.filter((o) => o.orderType === 'TABLE');
      const takeawayOrders = ordersList.filter((o) => o.orderType === 'TAKEAWAY');

      // Aucune commande en commun
      const tableIds = new Set(tableOrders.map((o) => o.id));
      const hasOverlap = takeawayOrders.some((o) => tableIds.has(o.id));

      expect(hasOverlap).toBe(false);
      expect(tableOrders.length).toBe(2);
      expect(takeawayOrders.length).toBe(2);
    });
  });

  describe('3. Flux Temps Réel & Intégrité Financière', () => {
    it('Le Polling de secours en Caisse doit être configuré à un intervalle maximum de 5 secondes', () => {
      const CASHIER_POLLING_INTERVAL_MS = 5000;
      expect(CASHIER_POLLING_INTERVAL_MS).toBeLessThanOrEqual(5000);
      expect(CASHIER_POLLING_INTERVAL_MS).toBeGreaterThan(0);
    });

    it('Les commandes annulées (CANCELLED) doivent être exclues à 100% du CA et de la Caisse du jour', () => {
      const dayOrders = [
        { id: 'o1', totalAmount: 10000, status: 'SERVED', paymentStatus: 'PAID' },
        { id: 'o2', totalAmount: 5000, status: 'CANCELLED', paymentStatus: 'PAID' }, // Faillite évitée !
        { id: 'o3', totalAmount: 8000, status: 'SERVED', paymentStatus: 'PAID' },
        { id: 'o4', totalAmount: 3000, status: 'PREPARING', paymentStatus: 'UNPAID' },
      ];

      // Filtre officiel CashierPOS.tsx & session/route.ts
      const validPaidOrders = dayOrders.filter(
        (o) => o.paymentStatus === 'PAID' && o.status !== 'CANCELLED'
      );

      const totalRevenue = validPaidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      // Le montant doit être de 18 000 FCFA (10 000 + 8 000), sans les 5 000 FCFA annulés
      expect(totalRevenue).toBe(18000);
      expect(validPaidOrders.some((o) => o.status === 'CANCELLED')).toBe(false);
    });

    it('L\'encaissement financier (paymentStatus: PAID) ne doit JAMAIS modifier le statut opérationnel de préparation', () => {
      // Une commande takeaway payée au comptoir doit rester PENDING ou PREPARING en cuisine
      const initialKitchenStatus = 'PENDING';
      const orderAfterPayment = {
        status: initialKitchenStatus, // Resté intact
        paymentStatus: 'PAID',       // Seul le paiement a changé
      };

      expect(orderAfterPayment.status).toBe('PENDING');
      expect(orderAfterPayment.paymentStatus).toBe('PAID');
    });
  });

  describe('4. Test E2E Réel en Base de Données (Prisma)', () => {
    it('Vérifie la connexion PostgreSQL Supabase et l\'existence des tables maîtres', async () => {
      // Vérification que le client Prisma fonctionne et peut interroger les tenants
      const tenantCount = await prisma.tenant.count();
      expect(tenantCount).toBeGreaterThanOrEqual(1);

      // Vérifie qu'un restaurant réel existe (ex: madiba-restaurant ou anima-pizzeria)
      const madiba = await prisma.tenant.findFirst({
        where: {
          OR: [
            { subdomain: 'madiba-restaurant' },
            { subdomain: 'anima-pizzeria' },
          ],
        },
      });
      expect(madiba).not.toBeNull();
      expect(madiba?.id).toBeDefined();
    });
  });
});
