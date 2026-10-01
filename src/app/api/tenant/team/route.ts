import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { isAuthorizedTenant } from '@/lib/tenant-auth';
import { startTimer, logApiCall, createApiErrorResponse } from '@/lib/logger';

// Helper pour résoudre le tenant
async function resolveTenant(req: Request, restaurantId?: string | null) {
  let candidate = restaurantId;
  if (!candidate) {
    try {
      const cookieHeader = req.headers.get('cookie') || '';
      const cookiesList = cookieHeader.split(';').map((c) => c.trim());
      for (const c of cookiesList) {
        if (c.startsWith('saas_token=')) {
          const val = decodeURIComponent(c.replace('saas_token=', ''));
          if (val.startsWith('resto_session_')) candidate = val.replace('resto_session_', '');
          else candidate = val;
        }
      }
    } catch {}
  }

  if (!candidate) return null;

  return await (prisma as any).tenant.findFirst({
    where: {
      OR: [{ id: candidate }, { subdomain: candidate }],
    },
    include: {
      waiters: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

// GET /api/tenant/team?restaurantId=...
export async function GET(req: Request) {
  const timer = startTimer();
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId') || searchParams.get('tenantId');

    const tenant = await resolveTenant(req, restaurantId);
    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    const branding = (tenant.branding as any) || {};
    const cooks = Array.isArray(branding.cooks) ? branding.cooks : [];

    logApiCall({
      method: 'GET',
      endpoint: '/api/tenant/team',
      tenantId: tenant.id,
      durationMs: timer.elapsedMs(),
      statusCode: 200,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      waiters: tenant.waiters || [],
      cooks,
    });
  } catch (error) {
    return createApiErrorResponse(error, {
      method: 'GET',
      endpoint: '/api/tenant/team',
      durationMs: timer.elapsedMs(),
    });
  }
}

// POST /api/tenant/team
// Ajout d'un membre : rôle 'WAITER' ou 'COOK'
export async function POST(req: Request) {
  const timer = startTimer();
  try {
    const body = await req.json();
    const { restaurantId, role, name, phone, shift = 'FULL_DAY', specialty } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Le nom du membre est obligatoire' }, { status: 400 });
    }

    const tenant = await resolveTenant(req, restaurantId);
    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    if (!isAuthorizedTenant(req, tenant.id)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    if (role === 'WAITER') {
      // Créer un serveur dans la table Waiter
      const qrCodeSlug = `waiter_${crypto.randomBytes(4).toString('hex')}`;
      const newWaiter = await (prisma as any).waiter.create({
        data: {
          tenantId: tenant.id,
          name: name.trim(),
          phone: phone ? phone.trim() : null,
          qrCodeSlug,
          isActive: true,
        },
      });

      return NextResponse.json({
        success: true,
        member: { ...newWaiter, role: 'WAITER' },
        message: `Serveur ${newWaiter.name} ajouté avec succès !`,
      }, { status: 201 });
    }

    if (role === 'COOK') {
      // Ajouter un cuisinier dans branding.cooks
      const branding = (tenant.branding as any) || {};
      const existingCooks = Array.isArray(branding.cooks) ? branding.cooks : [];

      const newCook = {
        id: `cook_${crypto.randomBytes(4).toString('hex')}`,
        name: name.trim(),
        phone: phone ? phone.trim() : '',
        shift: shift || 'FULL_DAY',
        specialty: specialty?.trim() || 'Cuisine Générale & Grillades',
        createdAt: new Date().toISOString(),
      };

      const updatedCooks = [newCook, ...existingCooks];

      await (prisma as any).tenant.update({
        where: { id: tenant.id },
        data: {
          branding: {
            ...branding,
            cooks: updatedCooks,
          },
        },
      });

      return NextResponse.json({
        success: true,
        member: { ...newCook, role: 'COOK' },
        message: `Cuisinier ${newCook.name} ajouté avec succès !`,
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Rôle non valide (WAITER ou COOK requis)' }, { status: 400 });
  } catch (error) {
    return createApiErrorResponse(error, {
      method: 'POST',
      endpoint: '/api/tenant/team',
      durationMs: timer.elapsedMs(),
    });
  }
}

// DELETE /api/tenant/team?restaurantId=...&memberId=...&role=...
export async function DELETE(req: Request) {
  const timer = startTimer();
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');
    const memberId = searchParams.get('memberId');
    const role = searchParams.get('role');

    if (!memberId || !restaurantId) {
      return NextResponse.json({ error: 'memberId et restaurantId obligatoires' }, { status: 400 });
    }

    const tenant = await resolveTenant(req, restaurantId);
    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    if (!isAuthorizedTenant(req, tenant.id)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    if (role === 'WAITER') {
      await (prisma as any).waiter.update({
        where: { id: memberId },
        data: { isActive: false },
      });
      return NextResponse.json({ success: true, message: 'Serveur désactivé' });
    }

    if (role === 'COOK') {
      const branding = (tenant.branding as any) || {};
      const cooks = Array.isArray(branding.cooks) ? branding.cooks : [];
      const filteredCooks = cooks.filter((c: any) => c.id !== memberId);

      await (prisma as any).tenant.update({
        where: { id: tenant.id },
        data: {
          branding: {
            ...branding,
            cooks: filteredCooks,
          },
        },
      });
      return NextResponse.json({ success: true, message: 'Cuisinier retiré de l\'équipe' });
    }

    return NextResponse.json({ error: 'Rôle non spécifié' }, { status: 400 });
  } catch (error) {
    return createApiErrorResponse(error, {
      method: 'DELETE',
      endpoint: '/api/tenant/team',
      durationMs: timer.elapsedMs(),
    });
  }
}
