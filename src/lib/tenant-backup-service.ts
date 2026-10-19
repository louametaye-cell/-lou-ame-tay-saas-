import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';

export type RestoreMode = 'MENU_CATALOG' | 'FULL_CONFIG';

export interface FinancialAnchor {
  totalOrdersCount: number;
  paidOrdersCount: number;
  cashSessionsCount: number;
  hashAnchor: string;
}

export interface TenantSnapshot {
  version: '2.0';
  exportedAt: string;
  reason?: string;
  tenantId: string;
  subdomain: string;
  businessName: string;
  checksum: string;
  financialAnchor: FinancialAnchor;
  profile: {
    businessName: string;
    subdomain: string;
    phone: string;
    address: string | null;
    city: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    currency: string;
    branding: any;
  };
  catalog: {
    categories: Array<{
      name: string;
      icon: string | null;
      displayOrder: number;
      station: 'KITCHEN' | 'BAR';
    }>;
    menuItems: Array<{
      name: string;
      categoryName: string;
      description: string | null;
      price: number;
      period: 'ALL_DAY' | 'LUNCH' | 'DINNER' | 'NIGHT_SNACK';
      imageUrl: string | null;
      isAvailable: boolean;
      trackStock: boolean;
      currentStock: number;
      lowStockAlert: number;
      station: 'KITCHEN' | 'BAR';
      isDailySpecial: boolean;
    }>;
  };
  spaces?: {
    zones: Array<{
      name: string;
      type: 'TABLES' | 'FREE_ZONE';
    }>;
    tables: Array<{
      tableNumber: number;
      zoneName: string | null;
      spaceType: 'TABLE' | 'ROOM' | 'POOL' | 'VIP_AREA' | 'COUNTER';
      destinationService: 'KITCHEN' | 'BAR' | 'ROOM_SERVICE' | 'RECEPTION';
      identifier: string | null;
      label: string | null;
      isActive: boolean;
    }>;
  };
  staff?: {
    waiters: Array<{
      name: string;
      phone: string | null;
      qrCodeSlug: string;
      isActive: boolean;
    }>;
    cashiers: Array<{
      name: string;
      phone: string | null;
      pinCode: string;
      shift: 'MORNING' | 'EVENING' | 'NIGHT' | 'FULL_DAY' | 'CUSTOM';
      isActive: boolean;
    }>;
  };
}

export interface RestoreResult {
  success: boolean;
  tenantId: string;
  subdomain: string;
  mode: RestoreMode;
  restoredAt: string;
  summary: {
    categoriesProcessed: number;
    menuItemsCreatedOrUpdated: number;
    zonesProcessed?: number;
    tablesProcessed?: number;
    waitersProcessed?: number;
    cashiersProcessed?: number;
    financialSanctuaryVerified: boolean;
    preservedOrdersCount: number;
    preservedPaidOrdersCount: number;
    preservedSessionsCount: number;
  };
}

/**
 * Résout un tenant par son ID ou son sous-domaine
 */
async function resolveTenant(identifier: string) {
  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [{ id: identifier }, { subdomain: identifier }],
    },
  });

  if (!tenant) {
    throw new Error(`Établissement introuvable avec l'identifiant: "${identifier}"`);
  }

  return tenant;
}

/**
 * Crée un snapshot complet d'un établissement avec ancrage financier inviolable
 */
export async function createTenantSnapshot(
  identifier: string,
  reason: string = 'Manuel Super-Admin'
): Promise<TenantSnapshot> {
  const tenant = await resolveTenant(identifier);
  const tenantId = tenant.id;

  // 1. Données du catalogue
  const categories = await prisma.category.findMany({
    where: { tenantId },
    orderBy: { displayOrder: 'asc' },
  });

  const menuItems = await prisma.menuItem.findMany({
    where: { tenantId },
    include: { category: true },
    orderBy: { createdAt: 'asc' },
  });

  // 2. Données des espaces
  const zones = await prisma.zone.findMany({
    where: { tenantId },
  });

  const tables = await prisma.table.findMany({
    where: { tenantId },
    include: { zone: true },
    orderBy: { tableNumber: 'asc' },
  });

  // 3. Données du personnel
  const waiters = await prisma.waiter.findMany({
    where: { tenantId },
  });

  const cashiers = await prisma.cashier.findMany({
    where: { tenantId },
  });

  // 4. Ancrage Financier Inviolable (Sanctuaire Financier - Règle 11)
  const totalOrdersCount = await prisma.order.count({ where: { tenantId } });
  const paidOrdersCount = await prisma.order.count({
    where: {
      tenantId,
      paymentStatus: { in: ['PAID', 'SUCCESS'] },
    },
  });
  const cashSessionsCount = await prisma.cashSession.count({ where: { tenantId } });

  const anchorPayload = `${tenantId}:${totalOrdersCount}:${paidOrdersCount}:${cashSessionsCount}`;
  const hashAnchor = crypto.createHash('sha256').update(anchorPayload).digest('hex');

  const snapshot: Omit<TenantSnapshot, 'checksum'> = {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    reason,
    tenantId: tenant.id,
    subdomain: tenant.subdomain,
    businessName: tenant.businessName,
    financialAnchor: {
      totalOrdersCount,
      paidOrdersCount,
      cashSessionsCount,
      hashAnchor,
    },
    profile: {
      businessName: tenant.businessName,
      subdomain: tenant.subdomain,
      phone: tenant.phone,
      address: tenant.address,
      city: tenant.city,
      logoUrl: tenant.logoUrl,
      bannerUrl: tenant.bannerUrl,
      currency: tenant.currency,
      branding: tenant.branding,
    },
    catalog: {
      categories: categories.map((c) => ({
        name: c.name,
        icon: c.icon,
        displayOrder: c.displayOrder,
        station: c.station as 'KITCHEN' | 'BAR',
      })),
      menuItems: menuItems.map((item) => ({
        name: item.name,
        categoryName: item.category?.name || 'Général',
        description: item.description,
        price: Number(item.price),
        period: item.period as any,
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable,
        trackStock: item.trackStock,
        currentStock: item.currentStock,
        lowStockAlert: item.lowStockAlert,
        station: item.station as 'KITCHEN' | 'BAR',
        isDailySpecial: item.isDailySpecial,
      })),
    },
    spaces: {
      zones: zones.map((z) => ({
        name: z.name,
        type: z.type as any,
      })),
      tables: tables.map((t) => ({
        tableNumber: t.tableNumber,
        zoneName: t.zone?.name || null,
        spaceType: t.spaceType as any,
        destinationService: t.destinationService as any,
        identifier: t.identifier,
        label: t.label,
        isActive: t.isActive,
      })),
    },
    staff: {
      waiters: waiters.map((w) => ({
        name: w.name,
        phone: w.phone,
        qrCodeSlug: w.qrCodeSlug,
        isActive: w.isActive,
      })),
      cashiers: cashiers.map((c) => ({
        name: c.name,
        phone: c.phone,
        pinCode: c.pinCode,
        shift: c.shift as any,
        isActive: c.isActive,
      })),
    },
  };

  const checksum = crypto
    .createHash('sha256')
    .update(JSON.stringify(snapshot))
    .digest('hex');

  const fullSnapshot: TenantSnapshot = {
    ...snapshot,
    checksum,
  };

  // Sauvegarde sur disque local si le dossier est accessible
  try {
    const backupDir = path.join(process.cwd(), 'backups', 'tenants', tenant.subdomain);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const filename = `snapshot_${tenant.subdomain}_${Date.now()}.json`;
    fs.writeFileSync(path.join(backupDir, filename), JSON.stringify(fullSnapshot, null, 2), 'utf-8');
  } catch {
    // Si environnement serverless sans écriture disque, le snapshot reste retourné en mémoire
  }

  return fullSnapshot;
}

/**
 * Restaure un établissement à partir d'un snapshot en respectant le Sanctuaire Financier Inviolable
 */
export async function restoreTenantFromSnapshot(
  identifier: string,
  snapshot: TenantSnapshot,
  mode: RestoreMode
): Promise<RestoreResult> {
  const tenant = await resolveTenant(identifier);
  const tenantId = tenant.id;

  // Validation de cohérence de l'établissement cible
  if (snapshot.subdomain !== tenant.subdomain && snapshot.tenantId !== tenant.id) {
    throw new Error(
      `Conflit d'établissement : Le snapshot appartient à "${snapshot.subdomain}" (${snapshot.businessName}) et ne peut pas être restauré sur "${tenant.subdomain}".`
    );
  }

  // Exécution de la restauration dans une transaction atomique PostgreSQL inviolable
  const result = await prisma.$transaction(
    async (tx) => {
      // -------------------------------------------------------------
      // 1. RESTAURATION DU CATALOGUE (Catégories + Plats + Stations)
      // -------------------------------------------------------------
      const categoryMap = new Map<string, string>(); // categoryName -> id

      for (const cat of snapshot.catalog.categories) {
        let existingCategory = await tx.category.findFirst({
          where: { tenantId, name: cat.name },
        });

        if (existingCategory) {
          existingCategory = await tx.category.update({
            where: { id: existingCategory.id },
            data: {
              icon: cat.icon,
              displayOrder: cat.displayOrder,
              station: cat.station,
            },
          });
        } else {
          existingCategory = await tx.category.create({
            data: {
              tenantId,
              name: cat.name,
              icon: cat.icon,
              displayOrder: cat.displayOrder,
              station: cat.station,
            },
          });
        }
        categoryMap.set(cat.name, existingCategory.id);
      }

      // Restauration des articles du menu
      let menuItemsCount = 0;
      for (const item of snapshot.catalog.menuItems) {
        const targetCategoryId = categoryMap.get(item.categoryName) || null;

        const existingItem = await tx.menuItem.findFirst({
          where: {
            tenantId,
            name: item.name,
            ...(targetCategoryId ? { categoryId: targetCategoryId } : {}),
          },
        });

        if (existingItem) {
          await tx.menuItem.update({
            where: { id: existingItem.id },
            data: {
              categoryId: targetCategoryId,
              description: item.description,
              price: item.price,
              period: item.period,
              imageUrl: item.imageUrl,
              isAvailable: item.isAvailable,
              trackStock: item.trackStock,
              currentStock: item.currentStock,
              lowStockAlert: item.lowStockAlert,
              station: item.station,
              isDailySpecial: item.isDailySpecial,
            },
          });
        } else {
          // Si le plat a été supprimé par erreur, on le recrée
          await tx.menuItem.create({
            data: {
              tenantId,
              categoryId: targetCategoryId,
              name: item.name,
              description: item.description,
              price: item.price,
              period: item.period,
              imageUrl: item.imageUrl,
              isAvailable: item.isAvailable,
              trackStock: item.trackStock,
              currentStock: item.currentStock,
              lowStockAlert: item.lowStockAlert,
              station: item.station,
              isDailySpecial: item.isDailySpecial,
            },
          });
        }
        menuItemsCount++;
      }

      // -------------------------------------------------------------
      // 2. RESTAURATION FULL_CONFIG (Profil, Zones, Tables, Staff)
      // -------------------------------------------------------------
      let zonesCount = 0;
      let tablesCount = 0;
      let waitersCount = 0;
      let cashiersCount = 0;

      if (mode === 'FULL_CONFIG') {
        // A. Mise à jour du profil et branding
        await tx.tenant.update({
          where: { id: tenantId },
          data: {
            businessName: snapshot.profile.businessName,
            phone: snapshot.profile.phone,
            address: snapshot.profile.address,
            city: snapshot.profile.city,
            logoUrl: snapshot.profile.logoUrl,
            bannerUrl: snapshot.profile.bannerUrl,
            currency: snapshot.profile.currency,
            branding: snapshot.profile.branding,
          },
        });

        // B. Restauration des Zones et Tables
        if (snapshot.spaces) {
          const zoneMap = new Map<string, string>(); // zoneName -> zoneId

          for (const z of snapshot.spaces.zones) {
            let existingZone = await tx.zone.findFirst({
              where: { tenantId, name: z.name },
            });

            if (!existingZone) {
              existingZone = await tx.zone.create({
                data: {
                  tenantId,
                  name: z.name,
                  type: z.type,
                },
              });
            }
            zoneMap.set(z.name, existingZone.id);
            zonesCount++;
          }

          for (const tbl of snapshot.spaces.tables) {
            const zoneId = tbl.zoneName ? zoneMap.get(tbl.zoneName) || null : null;

            const existingTable = await tx.table.findFirst({
              where: {
                tenantId,
                tableNumber: tbl.tableNumber,
                ...(zoneId ? { zoneId } : {}),
              },
            });

            if (existingTable) {
              await tx.table.update({
                where: { id: existingTable.id },
                data: {
                  spaceType: tbl.spaceType,
                  destinationService: tbl.destinationService,
                  identifier: tbl.identifier,
                  label: tbl.label,
                  isActive: tbl.isActive,
                },
              });
            } else {
              await tx.table.create({
                data: {
                  tenantId,
                  zoneId,
                  tableNumber: tbl.tableNumber,
                  spaceType: tbl.spaceType,
                  destinationService: tbl.destinationService,
                  identifier: tbl.identifier,
                  label: tbl.label,
                  isActive: tbl.isActive,
                },
              });
            }
            tablesCount++;
          }
        }

        // C. Restauration du Staff (Serveurs et Caissiers)
        if (snapshot.staff) {
          for (const w of snapshot.staff.waiters) {
            const existingWaiter = await tx.waiter.findFirst({
              where: { qrCodeSlug: w.qrCodeSlug },
            });

            if (existingWaiter) {
              await tx.waiter.update({
                where: { id: existingWaiter.id },
                data: {
                  name: w.name,
                  phone: w.phone,
                  isActive: w.isActive,
                },
              });
            } else {
              await tx.waiter.create({
                data: {
                  tenantId,
                  name: w.name,
                  phone: w.phone,
                  qrCodeSlug: w.qrCodeSlug,
                  isActive: w.isActive,
                },
              });
            }
            waitersCount++;
          }

          for (const c of snapshot.staff.cashiers) {
            const existingCashier = await tx.cashier.findFirst({
              where: { tenantId, pinCode: c.pinCode },
            });

            if (existingCashier) {
              await tx.cashier.update({
                where: { id: existingCashier.id },
                data: {
                  name: c.name,
                  phone: c.phone,
                  shift: c.shift,
                  isActive: c.isActive,
                },
              });
            } else {
              await tx.cashier.create({
                data: {
                  tenantId,
                  name: c.name,
                  phone: c.phone,
                  pinCode: c.pinCode,
                  shift: c.shift,
                  isActive: c.isActive,
                },
              });
            }
            cashiersCount++;
          }
        }
      }

      // -------------------------------------------------------------
      // 3. VÉRIFICATION DU SANCTUAIRE FINANCIER INVIOLABLE (Règle 11)
      // -------------------------------------------------------------
      const currentOrdersCount = await tx.order.count({ where: { tenantId } });
      const currentPaidOrdersCount = await tx.order.count({
        where: { tenantId, paymentStatus: { in: ['PAID', 'SUCCESS'] } },
      });
      const currentSessionsCount = await tx.cashSession.count({ where: { tenantId } });

      if (currentOrdersCount < snapshot.financialAnchor.totalOrdersCount) {
        throw new Error(
          `🚨 [SANCTUAIRE FINANCIER VIOLÉ] Le nombre total de commandes après restauration (${currentOrdersCount}) est inférieur à l'ancrage (${snapshot.financialAnchor.totalOrdersCount}). Transaction annulée !`
        );
      }

      if (currentPaidOrdersCount < snapshot.financialAnchor.paidOrdersCount) {
        throw new Error(
          `🚨 [SANCTUAIRE FINANCIER VIOLÉ] Le nombre de commandes payées après restauration (${currentPaidOrdersCount}) est inférieur à l'ancrage (${snapshot.financialAnchor.paidOrdersCount}). Transaction annulée !`
        );
      }

      if (currentSessionsCount < snapshot.financialAnchor.cashSessionsCount) {
        throw new Error(
          `🚨 [SANCTUAIRE FINANCIER VIOLÉ] Le nombre de sessions de caisse après restauration (${currentSessionsCount}) est inférieur à l'ancrage (${snapshot.financialAnchor.cashSessionsCount}). Transaction annulée !`
        );
      }

      return {
        success: true,
        tenantId,
        subdomain: tenant.subdomain,
        mode,
        restoredAt: new Date().toISOString(),
        summary: {
          categoriesProcessed: snapshot.catalog.categories.length,
          menuItemsCreatedOrUpdated: menuItemsCount,
          zonesProcessed: zonesCount,
          tablesProcessed: tablesCount,
          waitersProcessed: waitersCount,
          cashiersProcessed: cashiersCount,
          financialSanctuaryVerified: true,
          preservedOrdersCount: currentOrdersCount,
          preservedPaidOrdersCount: currentPaidOrdersCount,
          preservedSessionsCount: currentSessionsCount,
        },
      };
    },
    {
      timeout: 30000, // 30 secondes max pour la transaction ACID
    }
  );

  return result;
}

/**
 * Liste les snapshots enregistrés localement pour un établissement
 */
export function listLocalSnapshots(subdomain: string): Array<{
  filename: string;
  path: string;
  sizeBytes: number;
  createdAt: string;
}> {
  const dir = path.join(process.cwd(), 'backups', 'tenants', subdomain);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));

  return files
    .map((filename) => {
      const fullPath = path.join(dir, filename);
      const stat = fs.statSync(fullPath);
      return {
        filename,
        path: fullPath,
        sizeBytes: stat.size,
        createdAt: stat.mtime.toISOString(),
      };
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
