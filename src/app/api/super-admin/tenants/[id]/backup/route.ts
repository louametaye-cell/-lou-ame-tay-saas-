import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { isAuthorizedSuperAdmin } from '@/lib/admin-auth';
import {
  createTenantSnapshot,
  restoreTenantFromSnapshot,
  listLocalSnapshots,
  RestoreMode,
  TenantSnapshot,
} from '@/lib/tenant-backup-service';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/super-admin/tenants/[id]/backup
 * Crée ou télécharge un snapshot granulaire d'un établissement
 */
export async function GET(req: Request, { params }: RouteContext) {
  try {
    // 1. Vérification stricte Super-Admin
    if (!isAuthorizedSuperAdmin(req)) {
      return NextResponse.json(
        { error: 'Accès réservé au Super-Administrateur DAW' },
        { status: 401 }
      );
    }

    const tenantIdOrSlug = params.id;
    const { searchParams } = new URL(req.url);
    const shouldDownload = searchParams.get('download') === 'true';

    // Résolution de l'établissement
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: tenantIdOrSlug }, { subdomain: tenantIdOrSlug }],
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: `Établissement introuvable: "${tenantIdOrSlug}"` },
        { status: 404 }
      );
    }

    // Création du snapshot
    const snapshot = await createTenantSnapshot(tenant.id, 'API Super-Admin Backup');
    const localSnapshots = listLocalSnapshots(tenant.subdomain);

    if (shouldDownload) {
      const filename = `backup_${tenant.subdomain}_${Date.now()}.json`;
      return new NextResponse(JSON.stringify(snapshot, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      snapshot,
      localSnapshots,
    });
  } catch (error: any) {
    console.error('Erreur GET /api/super-admin/tenants/[id]/backup:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du backup' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/super-admin/tenants/[id]/backup
 * Déclenche une restauration d'urgence protégée par le Sanctuaire Financier
 */
export async function POST(req: Request, { params }: RouteContext) {
  try {
    // 1. Vérification stricte Super-Admin
    if (!isAuthorizedSuperAdmin(req)) {
      return NextResponse.json(
        { error: 'Accès réservé au Super-Administrateur DAW' },
        { status: 401 }
      );
    }

    const tenantIdOrSlug = params.id;
    const body = await req.json();
    const { mode = 'MENU_CATALOG', snapshot: directSnapshot, snapshotFilename, superAdminPassword } = body;

    // 2. Vérification obligatoire du mot de passe Super-Admin pour valider cette action critique
    const activeSecret =
      process.env.SUPER_ADMIN_PASSWORD?.trim() || 'Daw_LouAmeTay_SuperAdmin_2026_Secure!';

    if (!superAdminPassword || superAdminPassword.trim() !== activeSecret) {
      return NextResponse.json(
        { error: 'Validation de sécurité échouée : Mot de passe Super-Admin incorrect' },
        { status: 403 }
      );
    }

    // Résolution du tenant
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: tenantIdOrSlug }, { subdomain: tenantIdOrSlug }],
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: `Établissement introuvable: "${tenantIdOrSlug}"` },
        { status: 404 }
      );
    }

    // Résolution du snapshot à restaurer
    let targetSnapshot: TenantSnapshot | null = directSnapshot || null;

    if (!targetSnapshot && snapshotFilename) {
      const filePath = path.join(process.cwd(), 'backups', 'tenants', tenant.subdomain, snapshotFilename);
      if (fs.existsSync(filePath)) {
        targetSnapshot = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
    }

    if (!targetSnapshot) {
      const defaultLatest = path.join(process.cwd(), 'backups', 'tenants', tenant.subdomain, 'latest.json');
      if (fs.existsSync(defaultLatest)) {
        targetSnapshot = JSON.parse(fs.readFileSync(defaultLatest, 'utf-8'));
      }
    }

    if (!targetSnapshot) {
      return NextResponse.json(
        { error: 'Aucun snapshot valide fourni ou trouvé sur le serveur pour cet établissement' },
        { status: 400 }
      );
    }

    // 3. Exécution de la restauration atomique avec Sanctuaire Financier
    const restoreMode: RestoreMode = mode === 'FULL_CONFIG' ? 'FULL_CONFIG' : 'MENU_CATALOG';
    const result = await restoreTenantFromSnapshot(tenant.id, targetSnapshot, restoreMode);

    return NextResponse.json({
      success: true,
      message: `Restauration effectuée avec succès en mode ${restoreMode}`,
      result,
    });
  } catch (error: any) {
    console.error('Erreur POST /api/super-admin/tenants/[id]/backup:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la restauration du tenant' },
      { status: 500 }
    );
  }
}
