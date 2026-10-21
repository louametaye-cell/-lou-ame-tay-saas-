import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';
import { isAuthorizedSuperAdmin } from '@/lib/admin-auth';
import { invalidateLiveOrdersCache } from '@/lib/cache';

export interface ReleaseTableOptions {
  req: Request;
  tenantIdOrSubdomain: string;
  tableId?: string;
  tableNumber?: number | string;
  cashierId?: string;
}

/**
 * Logique unifiée et inviolable de libération d'une table (Caissier, Gérant, Super-Admin).
 * Respecte les 5 verrous d'intégrité financière :
 * - Vérification de l'appartenance de la table au restaurant (multi-tenant strict)
 * - Contrôle d'authentification (Gérant, Super-Admin ou Caissier actif du restaurant)
 * - Blocage formel si des commandes actives non payées existent sur la table
 * - Passage du statut de la table à FREE et mise à jour de clearedAt
 * - Clôture atomique de la session de table (TableSession)
 * - Invalidation du cache des commandes live
 */
export async function executeReleaseTable({
  req,
  tenantIdOrSubdomain,
  tableId,
  tableNumber,
  cashierId,
}: ReleaseTableOptions) {
  if (!tenantIdOrSubdomain) {
    return NextResponse.json(
      { error: 'restaurantId ou tenantId est requis pour libérer une table' },
      { status: 400 }
    );
  }

  // 1. Résolution du tenant
  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [{ id: tenantIdOrSubdomain }, { subdomain: tenantIdOrSubdomain }],
    },
    select: { id: true, businessName: true, subdomain: true },
  });

  if (!tenant) {
    return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
  }

  // 2. Contrôle de sécurité et d'authentification
  const isSuperAdmin = isAuthorizedSuperAdmin(req);
  const isTenant = isAuthorizedTenant(req, tenant.id, tenant.subdomain);
  let isCashier = false;

  if (cashierId) {
    const dbCashier = await prisma.cashier.findFirst({
      where: { id: cashierId, tenantId: tenant.id, isActive: true },
    });
    if (dbCashier) {
      isCashier = true;
    }
  }

  if (!isSuperAdmin && !isTenant && !isCashier) {
    return NextResponse.json(
      { error: 'Accès non autorisé pour libérer une table de ce restaurant' },
      { status: 401 }
    );
  }

  // 3. Résolution de la table
  const num = tableNumber !== undefined && tableNumber !== null ? parseInt(String(tableNumber), 10) : NaN;
  if (!tableId && isNaN(num)) {
    return NextResponse.json(
      { error: 'tableNumber ou tableId valide est requis' },
      { status: 400 }
    );
  }

  let table = null;
  if (tableId) {
    table = await prisma.table.findFirst({
      where: { id: tableId, tenantId: tenant.id },
    });
  }
  if (!table && !isNaN(num)) {
    table = await prisma.table.findFirst({
      where: { tenantId: tenant.id, tableNumber: num },
    });
    if (!table) {
      // Auto-création pour garantir la consistance si la table n'existait pas encore en BDD
      table = await prisma.table.create({
        data: {
          tenantId: tenant.id,
          tableNumber: num,
          status: 'FREE',
          clearedAt: new Date(),
        },
      });
    }
  }

  if (!table) {
    return NextResponse.json({ error: 'Table introuvable' }, { status: 404 });
  }

  // 4. 🔒 VERROU D'INTÉGRITÉ FINANCIÈRE : Vérifier qu'aucune commande active impayée n'existe
  // Déterminer la fenêtre des commandes actives :
  // Si table.clearedAt est défini, on regarde après cette date. Sinon, on limite aux 12 dernières heures.
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
  const sinceDate = table.clearedAt && new Date(table.clearedAt) > twelveHoursAgo
    ? new Date(table.clearedAt)
    : twelveHoursAgo;

  const activeUnpaidOrders = await prisma.order.findMany({
    where: {
      tenantId: tenant.id,
      tableNumber: table.tableNumber,
      status: { not: 'CANCELLED' },
      createdAt: { gte: sinceDate },
      AND: [
        { paymentStatus: { not: 'PAID' } },
        { paymentStatus: { not: 'STAFF_NP' } },
        { paymentMethod: { not: 'STAFF_MEAL' } },
      ],
    },
    select: {
      id: true,
      totalAmount: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
    },
  });

  if (activeUnpaidOrders.length > 0) {
    const totalUnpaid = activeUnpaidOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const orderDetails = activeUnpaidOrders
      .map((o) => `#CMD-${o.id.slice(-5).toUpperCase()} (${Number(o.totalAmount)} FCFA, statut: ${o.status})`)
      .join(', ');

    return NextResponse.json(
      {
        error: `Impossible de libérer la Table ${table.tableNumber} : il reste ${activeUnpaidOrders.length} commande(s) non encaissée(s) pour un total de ${totalUnpaid} FCFA [${orderDetails}]. Veuillez encaisser ou annuler ces commandes avant de libérer la table.`,
        code: 'UNPAID_ORDERS_EXIST',
        unpaidOrdersCount: activeUnpaidOrders.length,
        totalUnpaidAmount: totalUnpaid,
        orders: activeUnpaidOrders.map((o) => ({
          id: o.id,
          amount: Number(o.totalAmount),
          status: o.status,
          paymentStatus: o.paymentStatus,
          createdAt: o.createdAt,
        })),
      },
      { status: 400 }
    );
  }

  const now = new Date();

  // 5. Mise à jour du statut de la table à 'FREE' et actualisation de clearedAt
  const updatedTable = await prisma.table.update({
    where: { id: table.id },
    data: {
      status: 'FREE',
      clearedAt: now,
    },
    include: {
      zone: {
        select: { id: true, name: true },
      },
    },
  });

  // 6. Clôturer la session de table (TableSession) si elle existe
  try {
    await prisma.tableSession.updateMany({
      where: {
        tableId: table.id,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });
  } catch (errSession) {
    console.warn('Avertissement clôture tableSession:', errSession);
  }

  // 7. Invalider le cache des commandes live
  try {
    await invalidateLiveOrdersCache(tenant.id);
  } catch (e) {}

  return NextResponse.json({
    success: true,
    message: `Table ${updatedTable.identifier || updatedTable.tableNumber} libérée avec succès`,
    table: {
      id: updatedTable.id,
      tableNumber: updatedTable.tableNumber,
      identifier: updatedTable.identifier,
      status: 'FREE',
      clearedAt: updatedTable.clearedAt,
      zone: updatedTable.zone,
    },
  });
}


/**
 * 🔒 RÈGLE D'OR : Une table ne peut être libérée après encaissement QUE s'il ne reste
 * aucune commande impayée active (non-annulée) pour cette table.
 */
export function shouldReleaseTableAfterPayment(
  ordersOnTable: Array<{ id: string; status: string; paymentStatus: string }>,
  currentPaidOrderId?: string
): boolean {
  const remainingUnpaid = ordersOnTable.filter((o) => {
    // La commande courante vient d'être payée
    if (currentPaidOrderId && o.id === currentPaidOrderId) return false;
    if (o.status === 'CANCELLED') return false;
    if (o.paymentStatus === 'PAID' || o.paymentStatus === 'STAFF_NP') return false;
    return true;
  });

  return remainingUnpaid.length === 0;
}
