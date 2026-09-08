import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CashierShift } from '@prisma/client';

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

    return NextResponse.json({ success: true, cashier: updated });
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

    // Check if cashier has open session
    const openSession = await prisma.cashSession.findFirst({
      where: { cashierId: id, status: 'OPEN' }
    });

    if (openSession) {
      return NextResponse.json({ error: 'Impossible de désactiver un caissier ayant une session de caisse en cours' }, { status: 400 });
    }

    const updated = await prisma.cashier.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true, message: 'Caissier désactivé avec succès', cashier: updated });
  } catch (error) {
    console.error('Erreur désactivation caissier:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la désactivation' }, { status: 500 });
  }
}
