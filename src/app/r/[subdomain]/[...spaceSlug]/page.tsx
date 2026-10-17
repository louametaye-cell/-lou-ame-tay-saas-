import React from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { ClientMenuView } from '@/components/ClientMenuView';
import { prisma } from '@/lib/prisma';
import { ScreenShield } from '@/components/security/ScreenShield';
import { SpaceType, DestinationService } from '@/types';

// Correspondances d'anciens sous-domaines pour garantir zéro rupture sur les anciens QR codes / favoris
const LEGACY_SUBDOMAINS: Record<string, string> = {
  'chez-colle': 'sams-prestige',
  'mg-cafe-resto': 'madiba-restaurant',
  'hotel-cayor': 'hotel-lat-dior',
};

interface PageProps {
  params: Promise<{
    subdomain: string;
    spaceSlug: string[];
  }> | {
    subdomain: string;
    spaceSlug: string[];
  };
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

// Normalisation des types d'espaces depuis l'URL
function parseSpaceType(raw: string): { type: SpaceType; defaultDestination: DestinationService; prefix: string } {
  const s = (raw || '').toLowerCase().trim();
  if (s === 'room' || s === 'chambre' || s === 'chambres') {
    return { type: 'ROOM', defaultDestination: 'ROOM_SERVICE', prefix: 'CHAMBRE' };
  }
  if (s === 'pool' || s === 'piscine' || s === 'transat' || s === 'transats') {
    return { type: 'POOL', defaultDestination: 'BAR', prefix: 'PISCINE' };
  }
  if (s === 'vip' || s === 'vip_area' || s === 'vip-area' || s === 'salon-vip') {
    return { type: 'VIP_AREA', defaultDestination: 'KITCHEN', prefix: 'SALON VIP' };
  }
  if (s === 'counter' || s === 'comptoir') {
    return { type: 'COUNTER', defaultDestination: 'RECEPTION', prefix: 'COMPTOIR' };
  }
  return { type: 'TABLE', defaultDestination: 'KITCHEN', prefix: 'TABLE' };
}

export default async function FriendlySpaceMenuCatchAllPage({ params, searchParams }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = searchParams ? await Promise.resolve(searchParams) : {};

  // Redirection automatique permanente pour les anciens sous-domaines historiques
  const rawSubdomain = (resolvedParams.subdomain || '').toLowerCase().trim();
  if (LEGACY_SUBDOMAINS[rawSubdomain]) {
    const targetSubdomain = LEGACY_SUBDOMAINS[rawSubdomain];
    const restPath = Array.isArray(resolvedParams.spaceSlug) ? resolvedParams.spaceSlug.join('/') : '1';
    permanentRedirect(`/r/${targetSubdomain}/${restPath}`);
  }

  const slugSegments = Array.isArray(resolvedParams.spaceSlug) ? resolvedParams.spaceSlug : [];
  
  let normalizedSpaceType: SpaceType = 'TABLE';
  let destinationService: DestinationService = 'KITCHEN';
  let rawSpaceNumber = '1';
  let prefix = 'TABLE';

  if (slugSegments.length >= 2) {
    // Cas multi-espaces : /r/[subdomain]/room/101, /r/[subdomain]/pool/4
    const parsed = parseSpaceType(slugSegments[0]);
    normalizedSpaceType = parsed.type;
    destinationService = parsed.defaultDestination;
    prefix = parsed.prefix;
    rawSpaceNumber = slugSegments[1] || '1';
  } else if (slugSegments.length === 1) {
    // Cas historique simple : /r/[subdomain]/1, /r/[subdomain]/table-1
    const single = slugSegments[0];
    if (single.toLowerCase().startsWith('table-')) {
      rawSpaceNumber = single.replace(/^table-/i, '') || '1';
      prefix = 'TABLE';
      normalizedSpaceType = 'TABLE';
      destinationService = 'KITCHEN';
    } else {
      rawSpaceNumber = single || (resolvedSearchParams.table as string) || (resolvedSearchParams.tableNumber as string) || '1';
      prefix = 'TABLE';
      normalizedSpaceType = 'TABLE';
      destinationService = 'KITCHEN';
    }
  }

  const cleanDigits = rawSpaceNumber.replace(/[^0-9]/g, '');
  const tableNum = parseInt(cleanDigits, 10) || 1;
  let displayLabel = `${prefix} ${rawSpaceNumber.toUpperCase()}`;

  let restaurant: any = null;

  try {
    const dbTenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { subdomain: resolvedParams.subdomain },
          { id: resolvedParams.subdomain }
        ]
      },
      include: {
        categories: {
          orderBy: { displayOrder: 'asc' },
          include: {
            items: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        tables: true,
        plan: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
      },
    });

    if (!dbTenant) {
      notFound();
    }

    // Recherche de l'espace spécifique dans les tables de l'établissement
    const matchedTable = dbTenant.tables?.find((t) => {
      const matchNum = t.tableNumber === tableNum;
      const matchId = t.identifier && t.identifier.toLowerCase() === rawSpaceNumber.toLowerCase();
      const matchType = t.spaceType === normalizedSpaceType;
      return (matchType && (matchNum || matchId)) || matchId || matchNum;
    });

    if (matchedTable) {
      destinationService = (matchedTable.destinationService as DestinationService) || destinationService;
      if (matchedTable.label) {
        displayLabel = matchedTable.label.toUpperCase();
      } else {
        displayLabel = `${prefix} ${matchedTable.identifier || tableNum}`;
      }
    }

    const brandingObj = (typeof dbTenant.branding === 'object' && dbTenant.branding !== null && !Array.isArray(dbTenant.branding)
      ? dbTenant.branding
      : {}) as Record<string, any>;
    const planSlug = (dbTenant.plan?.slug || '').toLowerCase();
    const isTambali = planSlug === 'tambali';
    const isOrderingEnabled = !isTambali;

    restaurant = {
      id: dbTenant.id,
      name: dbTenant.businessName,
      tagline: brandingObj.tagline || (isTambali ? 'Consultez • Choisissez • Dégustez !' : 'Scannez • Commandez • Savourez !'),
      subdomain: dbTenant.subdomain,
      phone: dbTenant.phone,
      address: dbTenant.address,
      logoUrl: dbTenant.logoUrl,
      bannerUrl: dbTenant.bannerUrl,
      currency: dbTenant.currency || 'FCFA',
      isActive: dbTenant.subscriptionStatus === 'ACTIVE' || dbTenant.subscriptionStatus === 'TRIAL',
      tableCount: dbTenant.tables?.length || 12,
      tablesCount: dbTenant.tables?.length || 12,
      branding: brandingObj,
      planSlug: planSlug || undefined,
      planName: dbTenant.plan?.name || undefined,
      isTambali,
      isOrderingEnabled,
      categories: (dbTenant.categories || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        displayOrder: c.displayOrder,
        items: (c.items || []).map((i: any) => ({
          id: i.id,
          name: i.name,
          wolofName: undefined,
          description: i.description || '',
          price: Number(i.price),
          imageUrl: i.imageUrl || '',
          isAvailable: i.isAvailable ?? true,
          isSpecialOfTheDay: i.isDailySpecial ?? false,
          preparationTime: 15,
          allergens: [],
          categoryId: c.id,
        })),
      })),
    };
  } catch (error) {
    console.error('Erreur chargement menu espace :', error);
  }

  return (
    <ScreenShield userRole="CUSTOMER">
      <ClientMenuView
        initialRestaurant={restaurant}
        tableNumber={tableNum}
        orderContext={{
          locationDetail: displayLabel,
          spaceType: normalizedSpaceType,
          destinationService: destinationService,
        }}
      />
    </ScreenShield>
  );
}
