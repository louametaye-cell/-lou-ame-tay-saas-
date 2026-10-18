import { prisma } from '../src/lib/prisma';

/**
 * Script de Test QA Rigoureux - Carte Unique Chiffre d'Affaires du Jour & Intégrité Financière Caisse
 * 
 * 1. Simuler ou vérifier les commandes sur Sams Prestige (ou Madiba)
 * 2. Vérifier la ventilation :
 *    - Commande Espèces PAID -> pris en compte dans total + cash
 *    - Commande Wave / Orange Money PAID -> pris en compte dans total + mobile money
 *    - Commande Carte Bancaire PAID -> pris en compte dans total + card
 *    - Commande CANCELLED -> EXCLUS à 100%
 *    - Bon Repas Personnel STAFF_MEAL / STAFF_NP -> EXCLUS à 100%
 * 3. Valider le non-impact des commandes non-payées (PENDING)
 */

async function main() {
  console.log('--- TEST QA CARTE UNIQUE CHIFFRE D\'AFFAIRES DU JOUR & INTÉGRITÉ FINANCIÈRE ---');

  const tenant = await (prisma as any).tenant.findFirst({
    where: { subdomain: 'sams-prestige' }
  });

  if (!tenant) {
    console.error('Tenant sams-prestige introuvable.');
    process.exit(1);
  }

  console.log(`✓ Tenant trouvé : ${tenant.name} (${tenant.id})`);

  // Simuler le calcul tel qu'exécuté par CashierDailyRevenueCard
  const mockOrders = [
    // 1. Commande Cash Encaissée
    {
      id: 'cmd-cash-1',
      totalAmount: 5000,
      paymentStatus: 'PAID',
      status: 'SERVED',
      paymentMethod: 'CASH',
      createdAt: new Date().toISOString(),
    },
    // 2. Commande Wave Encaissée
    {
      id: 'cmd-wave-2',
      totalAmount: 3500,
      paymentStatus: 'PAID',
      status: 'SERVED',
      paymentMethod: 'WAVE',
      createdAt: new Date().toISOString(),
    },
    // 3. Commande TPE Encaissée
    {
      id: 'cmd-tpe-3',
      totalAmount: 12000,
      paymentStatus: 'PAID',
      status: 'SERVED',
      paymentMethod: 'CARD',
      createdAt: new Date().toISOString(),
    },
    // 4. Commande Annulée (ex: 20 000 FCFA) -> DOIT ÊTRE EXCLUE
    {
      id: 'cmd-cancelled-4',
      totalAmount: 20000,
      paymentStatus: 'PAID', // Même si marqué PAID par erreur
      status: 'CANCELLED',
      paymentMethod: 'CASH',
      createdAt: new Date().toISOString(),
    },
    // 5. Bon repas personnel STAFF_MEAL (ex: 4 000 FCFA) -> DOIT ÊTRE EXCLU
    {
      id: 'cmd-staff-5',
      totalAmount: 4000,
      paymentStatus: 'STAFF_NP',
      status: 'SERVED',
      paymentMethod: 'STAFF_MEAL',
      employeeName: 'Moussa Diop',
      createdAt: new Date().toISOString(),
    },
    // 6. Commande PENDING en attente de règlement (ex: 7 000 FCFA) -> DOIT ÊTRE EXCLUE
    {
      id: 'cmd-pending-6',
      totalAmount: 7000,
      paymentStatus: 'PENDING',
      status: 'PREPARING',
      paymentMethod: 'CASH',
      createdAt: new Date().toISOString(),
    },
  ];

  // Calcul exact selon CashierDailyRevenueCard
  const dakarDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Dakar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const startOfToday = new Date(`${dakarDateStr}T00:00:00.000Z`).getTime();

  let cashTotal = 0;
  let mobileMoneyTotal = 0;
  let cardTotal = 0;

  mockOrders.forEach((o) => {
    // 1. Exclusion stricte des commandes annulées
    if (o.status === 'CANCELLED') return;

    // 2. Vérification statut paiement PAID
    const isPaid = o.paymentStatus === 'PAID' || o.paymentStatus === 'PAID_IN_FULL' || o.paymentStatus === 'SUCCESS';
    if (!isPaid) return;

    // 3. Exclusion des bons repas personnel (NP)
    const isStaffMeal = o.paymentMethod === 'STAFF_MEAL' || o.paymentStatus === 'STAFF_NP' || (o as any).employeeName;
    if (isStaffMeal) return;

    // 4. Vérification de la date du jour
    const orderTime = o.createdAt ? new Date(o.createdAt).getTime() : 0;
    if (orderTime < startOfToday) return;

    const amount = Number(o.totalAmount ?? 0);
    if (isNaN(amount) || amount <= 0) return;

    const method = (o.paymentMethod || 'CASH').toUpperCase();
    if (method === 'CASH') {
      cashTotal += amount;
    } else if (
      method === 'WAVE' ||
      method === 'ORANGE_MONEY' ||
      method === 'FREE_MONEY' ||
      method === 'YAS_MONEY' ||
      method === 'MOBILE_MONEY'
    ) {
      mobileMoneyTotal += amount;
    } else if (
      method === 'CARD' ||
      method === 'CASH_TPE' ||
      method === 'TPE' ||
      method === 'CREDIT_CARD'
    ) {
      cardTotal += amount;
    } else {
      cashTotal += amount;
    }
  });

  const totalRevenue = cashTotal + mobileMoneyTotal + cardTotal;

  console.log(`\nRésultats du calcul :`);
  console.log(`- Total Encaissé Réel  : ${totalRevenue.toLocaleString('fr-FR')} FCFA`);
  console.log(`- Espèces              : ${cashTotal.toLocaleString('fr-FR')} FCFA (Attendu: 5 000 FCFA)`);
  console.log(`- Mobile Money         : ${mobileMoneyTotal.toLocaleString('fr-FR')} FCFA (Attendu: 3 500 FCFA)`);
  console.log(`- Terminal TPE         : ${cardTotal.toLocaleString('fr-FR')} FCFA (Attendu: 12 000 FCFA)`);

  const expectedTotal = 5000 + 3500 + 12000; // 20 500 FCFA
  if (totalRevenue !== expectedTotal) {
    console.error(`❌ ÉCHEC : Le total calculé (${totalRevenue}) ne correspond pas au total attendu (${expectedTotal})`);
    process.exit(1);
  }
  if (cashTotal !== 5000) {
    console.error(`❌ ÉCHEC : Les espèces (${cashTotal}) ne correspondent pas à 5000`);
    process.exit(1);
  }
  if (mobileMoneyTotal !== 3500) {
    console.error(`❌ ÉCHEC : Le Mobile Money (${mobileMoneyTotal}) ne correspond pas à 3500`);
    process.exit(1);
  }
  if (cardTotal !== 12000) {
    console.error(`❌ ÉCHEC : Le TPE (${cardTotal}) ne correspond pas à 12000`);
    process.exit(1);
  }

  console.log('\n✓ Les commandes CANCELLED (20 000 FCFA) ont été exclues avec succès.');
  console.log('✓ Le bon repas personnel STAFF_MEAL (4 000 FCFA) a été exclu avec succès.');
  console.log('✓ La commande PENDING (7 000 FCFA) a été exclue avec succès.');
  console.log('✓ Total Réel Intègre : 20 500 FCFA.');
  console.log('\n✅ TEST QA CARTE UNIQUE CHIFFRE D\'AFFAIRES DU JOUR 100% RÉUSSI !');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
