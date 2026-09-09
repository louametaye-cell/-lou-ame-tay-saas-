import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CashierShift } from '@prisma/client';
import { isAuthorizedTenant } from '@/lib/tenant-auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const body = await req.json();
    const { name, phone, pinCode, shift, schedule, isActive } = body;

    const current = await prisma.cashier.findUnique({
      where: { id }
    });

    if (!current) {
      return NextResponse.json({ error: 'Caissier introuvable' }, { status: 404 });
    }

    // 🔒 CONTRÔLE D'ACCÈS : Seul le gérant de cet établissement ou Super-Admin peut modifier un caissier
    if (!isAuthorizedTenant(req, current.tenantId)) {
      return NextResponse.json(
        { error: 'Accès non autorisé : Session gérant requise pour modifier ce caissier' },
        { status: 401 }
      );
    }

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (phone !== undefined) dataToUpdate.phone = phone ? phone.trim() : null;
    if (schedule !== undefined) dataToUpdate.schedule = schedule ? schedule.trim() : null;
    if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);

    if (shift !== undefined && Object.values(CashierShift).includes(shift)) {
      dataToUpdate.shift = shift;
    }

    if (pinCode !== undefined) {
      const cleanPin = pinCode.trim();
      if (!/^\d{4}$/.test(cleanPin)) {
        return NextResponse.json({ error: 'Le code PIN doit comporter 4 chiffres' }, { status: 400 });
      }

      // Check PIN conflict
      const conflict = await prisma.cashier.findFirst({
        where: {
          tenantId: current.tenantId,
          pinCode: cleanPin,
          NOT: { id: current.id }
        }
      });
      if (conflict) {
        return NextResponse.json({ error: `Le code PIN ${cleanPin} est déjà utilisé par ${conflict.name}` }, { status: 409 });
      }
      dataToUpdate.pinCode = cleanPin;
    }

    const updated = await prisma.cashier.update({
      where: { id },
      data: dataToUpdate
    });

    const { pinCode: _, ...safeUpdated } = updated as any;
    return NextResponse.json({ success: true, cashier: { ...safeUpdated, hasPin: true } });
  } catch (error) {
    console.error('Erreur mise à jour caissier:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la mise à jour' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    const current = await prisma.cashier.findUnique({
      where: { id },
      select: { id: true, tenantId: true }
    });

    if (!current) {
      return NextResponse.json({ error: 'Caissier introuvable' }, { status: 404 });
    }

    // 🔒 CONTRÔLE D'ACCÈS : Seul le gérant de cet établissement ou Super-Admin peut supprimer un caissier
    if (!isAuthorizedTenant(req, current.tenantId)) {
      return NextResponse.json(
        { error: 'Accès non autorisé : Session gérant requise pour supprimer ce caissier' },
        { status: 401 }
      );
    }

    // Check if cashier has open session
    const openSession = await prisma.cashSession.findFirst({
      where: { cashierId: id, status: 'OPEN' }
    });

    if (openSession) {
      return NextResponse.json({ error: 'Impossible d\'archiver ou supprimer un caissier ayant une session de caisse en cours d\'activité' }, { status: 400 });
    }

    // Check sessions and orders count
    const cashierWithCounts = await prisma.cashier.findUnique({
      where: { id },
      include: {
        _count: {
          select: { sessions: true, orders: true }
        }
      }
    });

    const hasHistory = (cashierWithCounts?._count?.sessions || 0) > 0 || (cashierWithCounts?._count?.orders || 0) > 0;
    const { searchParams } = new URL(req.url);
    const hardDelete = searchParams.get('hard') === 'true';

    if (hardDelete && !hasHistory) {
      // 0 session et 0 commande : suppression définitive sécurisée autorisée
      await prisma.cashier.delete({
        where: { id }
      });
      return NextResponse.json({ 
        success: true, 
        action: 'DELETED', 
        message: 'Profil caissier supprimé définitivement (aucune donnée historique liée).' 
      });
    }

    // Si le caissier a des sessions historiques ou si archivage demandé : SOFT ARCHIVE Garanti
    const updated = await prisma.cashier.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ 
      success: true, 
      action: 'ARCHIVED',
      message: hasHistory 
        ? 'Caissier archivé avec succès (historique comptable et rapports Z intégralement conservés).' 
        : 'Caissier désactivé avec succès.', 
      cashier: updated 
    });
  } catch (error) {
    console.error('Erreur archivage/suppression caissier:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de l\'opération' }, { status: 500 });
  }
}
