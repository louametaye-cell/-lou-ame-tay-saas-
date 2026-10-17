import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedSuperAdmin } from '@/lib/admin-auth';
import { isAuthorizedTenant } from '@/lib/tenant-auth';
import { SpaceType, DestinationService } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      restaurantId, 
      tenantId, 
      spaceType = 'TABLE', 
      destinationService = 'KITCHEN',
      startNumber, 
      endNumber, 
      prefix = '',
      zoneId 
    } = body;

    const rawTenantId = tenantId || restaurantId;
    if (!rawTenantId) {
      return NextResponse.json({ error: 'restaurantId ou tenantId est requis' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: rawTenantId }, { subdomain: rawTenantId }]
      },
      select: { id: true, subdomain: true, businessName: true }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    const isSuperAdmin = isAuthorizedSuperAdmin(req);
    const isTenantAdmin = isAuthorizedTenant(req, tenant.id, tenant.subdomain);

    if (!isSuperAdmin && !isTenantAdmin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    const start = parseInt(String(startNumber), 10);
    const end = parseInt(String(endNumber), 10);

    if (isNaN(start) || isNaN(end) || start <= 0 || end < start) {
      return NextResponse.json({ 
        error: 'Plage de numéros invalide. Veuillez fournir un début et une fin valides (ex: de 101 à 120).' 
      }, { status: 400 });
    }

    // Limiter la génération de masse à 150 espaces par requête pour la sécurité
    if (end - start > 150) {
      return NextResponse.json({ 
        error: 'Pour des raisons de performance, la création en masse est limitée à 150 espaces par opération.' 
      }, { status: 400 });
    }

    // Valider les enums
    const validSpaceTypes: SpaceType[] = ['TABLE', 'ROOM', 'POOL', 'VIP_AREA', 'COUNTER'];
    const validDestinations: DestinationService[] = ['KITCHEN', 'BAR', 'ROOM_SERVICE', 'RECEPTION'];

    const chosenSpaceType = validSpaceTypes.includes(spaceType) ? spaceType : 'TABLE';
    const chosenDestination = validDestinations.includes(destinationService) ? destinationService : 'KITCHEN';

    const createdSpaces: any[] = [];

    for (let num = start; num <= end; num++) {
      const identifier = prefix ? `${prefix.trim()}${num}` : `${num}`;
      
      let defaultLabel = `Table ${num}`;
      if (chosenSpaceType === 'ROOM') defaultLabel = `Chambre ${num}`;
      else if (chosenSpaceType === 'POOL') defaultLabel = `Transat Piscine ${num}`;
      else if (chosenSpaceType === 'VIP_AREA') defaultLabel = `Espace VIP ${num}`;
      else if (chosenSpaceType === 'COUNTER') defaultLabel = `Comptoir ${num}`;

      // Recherche d'un espace existant pour ce tenant
      const existing = await prisma.table.findFirst({
        where: {
          tenantId: tenant.id,
          tableNumber: num,
          zoneId: zoneId || null,
        }
      });

      if (existing) {
        const updated = await prisma.table.update({
          where: { id: existing.id },
          data: {
            isActive: true,
            spaceType: chosenSpaceType,
            destinationService: chosenDestination,
            identifier,
            label: defaultLabel,
          }
        });
        createdSpaces.push(updated);
      } else {
        const created = await prisma.table.create({
          data: {
            tenantId: tenant.id,
            tableNumber: num,
            spaceType: chosenSpaceType,
            destinationService: chosenDestination,
            identifier,
            label: defaultLabel,
            zoneId: zoneId || undefined,
            isActive: true,
          }
        });
        createdSpaces.push(created);
      }
    }

    return NextResponse.json({
      success: true,
      count: createdSpaces.length,
      spaces: createdSpaces,
      message: `${createdSpaces.length} espaces (${chosenSpaceType}) créés ou mis à jour avec succès.`
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur création en masse d\'espaces:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur lors de la création en masse des espaces' 
    }, { status: 500 });
  }
}
