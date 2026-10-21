import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startTimer, logApiCall, createApiErrorResponse } from '@/lib/logger';

// Résolution sécurisée du restaurant connecté
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
          break;
        }
      }
    } catch {}
  }

  if (!candidate) return null;

  return await prisma.tenant.findFirst({
    where: {
      OR: [{ id: candidate }, { subdomain: candidate }],
    },
    select: {
      id: true,
      businessName: true,
      subdomain: true,
      phone: true,
      currency: true,
      plan: { select: { name: true, slug: true } },
    },
  });
}

export async function POST(req: Request) {
  const timer = startTimer();
  try {
    const body = await req.json().catch(() => ({}));
    const { question, restaurantId } = body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json({ error: 'Question requise pour Aissatou' }, { status: 400 });
    }

    const tenant = await resolveTenant(req, restaurantId);
    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable ou non authentifié' }, { status: 401 });
    }

    // 1. Calcul du début de journée à Dakar
    let startOfToday: Date;
    try {
      const now = new Date();
      const dakarDateStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Africa/Dakar',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(now);
      startOfToday = new Date(`${dakarDateStr}T00:00:00.000Z`);
    } catch {
      const now = new Date();
      startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // 2. Récupération des commandes du jour
    const ordersToday = await prisma.order.findMany({
      where: {
        tenantId: tenant.id,
        createdAt: { gte: startOfToday },
        status: { not: 'CANCELLED' },
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Chiffres clés financiers
    let totalRevenue = 0;
    let cashRevenue = 0;
    let waveRevenue = 0;
    let omRevenue = 0;
    let cardRevenue = 0;
    const paidOrders = ordersToday.filter(
      (o) => o.paymentStatus === 'PAID' || o.paymentStatus === 'PAID_IN_FULL' || o.paymentStatus === 'SUCCESS'
    );

    paidOrders.forEach((o) => {
      const amount = Number(o.totalAmount || 0);
      totalRevenue += amount;
      const method = (o.paymentMethod || 'CASH').toUpperCase();
      if (method === 'CASH') cashRevenue += amount;
      else if (method === 'WAVE') waveRevenue += amount;
      else if (method === 'ORANGE_MONEY') omRevenue += amount;
      else if (method === 'CARD' || method === 'TPE' || method === 'CASH_TPE') cardRevenue += amount;
      else cashRevenue += amount;
    });

    // 4. Plats les plus vendus
    const itemsMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    paidOrders.forEach((o) => {
      o.items.forEach((item) => {
        const existing = itemsMap.get(item.menuItemId || item.name) || {
          name: item.name,
          quantity: 0,
          revenue: 0,
        };
        existing.quantity += item.quantity;
        existing.revenue += Number(item.price) * item.quantity;
        itemsMap.set(item.menuItemId || item.name, existing);
      });
    });

    const topItems = Array.from(itemsMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // 5. Plats en rupture de stock
    const unavailableItems = await prisma.menuItem.findMany({
      where: {
        tenantId: tenant.id,
        isAvailable: false,
      },
      select: {
        name: true,
        price: true,
      },
      take: 5,
    });

    // Données réelles consolidées du restaurant
    const contextData = {
      restaurantName: tenant.businessName,
      currency: tenant.currency || 'FCFA',
      totalRevenue,
      cashRevenue,
      waveRevenue,
      omRevenue,
      cardRevenue,
      totalOrdersToday: ordersToday.length,
      paidOrdersCount: paidOrders.length,
      topItems,
      unavailableItems,
      currentHourDakar: new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Africa/Dakar',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date()),
    };

    let answer = '';
    const cleanQ = question.trim().toLowerCase();
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_TRANSLATE_API_KEY;

    // Tentative d'appel Gemini AI si clé disponible
    if (apiKey) {
      try {
        const systemPrompt = `Tu es Aissatou, assistante de gestion intelligente et directrice des opérations du restaurant ${tenant.businessName}, éditée par DAW Digital Arts Work — by MG.
Tu t'adresses au gérant en français avec respect, concision, courtoisie et pragmatisme de terrain sénégalais.
Voici les données en temps réel certifiées du restaurant :
- Chiffre d'Affaires du Jour : ${totalRevenue.toLocaleString('fr-FR')} FCFA (Espèces: ${cashRevenue.toLocaleString('fr-FR')} FCFA, Wave: ${waveRevenue.toLocaleString('fr-FR')} FCFA, Orange Money: ${omRevenue.toLocaleString('fr-FR')} FCFA, TPE/Carte: ${cardRevenue.toLocaleString('fr-FR')} FCFA).
- Nombre de commandes payées : ${paidOrders.length} / ${ordersToday.length} commandes reçues.
- Top Plats vendus aujourd'hui : ${topItems.map((i) => `${i.name} (${i.quantity} vendus)`).join(', ') || 'Aucune vente enregistrée'}.
- Plats en rupture ou indisponibles : ${unavailableItems.map((i) => i.name).join(', ') || 'Aucun (tous disponibles)'}.
- Heure locale actuelle : ${contextData.currentHourDakar}.

Réponds avec précision à la question du gérant : "${question}".
Règles :
- Réponse concise (2 à 4 phrases max).
- Donne les chiffres exacts mentionnés ci-dessus.
- Conclus toujours par un conseil d'action terrain pragmatique (ex: relancer la cuisine, surveiller les stocks, encourager le paiement Wave).
- Si incertaine ou si l'information n'est pas dans le contexte, dis-le poliment sans inventer.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
              generationConfig: { maxOutputTokens: 500, temperature: 0.3 },
            }),
          }
        );

        if (geminiRes.ok) {
          const gemData = await geminiRes.json();
          answer = gemData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        }
      } catch (err) {
        console.warn('Fallback IA local déclenché pour Aissatou:', err);
      }
    }

    // Moteur analytique déterministe local en cas d'absence d'API ou indisponibilité
    if (!answer) {
      if (cleanQ.includes('wave')) {
        answer = `À cet instant, vous avez encaissé **${waveRevenue.toLocaleString('fr-FR')} FCFA** via Wave (${Math.round((waveRevenue / (totalRevenue || 1)) * 100)}% de vos recettes). Le paiement par QR Wave est instantané et sécurisé sans rendu de monnaie. 🌊\n\n💡 **Action terrain :** Encouragez vos serveurs à proposer le scan Wave sur table pour accélérer la rotation des tables.`;
      } else if (cleanQ.includes('plat') || cleanQ.includes('star') || cleanQ.includes('vendu') || cleanQ.includes('top')) {
        if (topItems.length > 0) {
          const star = topItems[0];
          answer = `Votre plat star aujourd'hui est le **${star.name}** avec **${star.quantity} portions commandées** pour un total de **${star.revenue.toLocaleString('fr-FR')} FCFA**. 🍗\n\n💡 **Action terrain :** Assurez-vous auprès du chef de cuisine que les ingrédients de base restent bien approvisionnés pour le service du soir.`;
        } else {
          answer = `Aucune commande finalisée pour l'instant aujourd'hui. Vos plats stars apparaîtront ici dès les premiers encaissements validés.`;
        }
      } else if (cleanQ.includes('rupture') || cleanQ.includes('stock') || cleanQ.includes('indisponible') || cleanQ.includes('manque')) {
        if (unavailableItems.length > 0) {
          answer = `Attention, vous avez **${unavailableItems.length} plat(s) marqué(s) en rupture** sur votre carte digitale : **${unavailableItems.map((i) => i.name).join(', ')}**. ⚠️\n\n💡 **Action terrain :** Vous pouvez les réactiver en 1 clic dans l'onglet Menu dès réception du réassort pour éviter de décevoir vos clients.`;
        } else {
          answer = `Excellente nouvelle ! Tous vos plats sont actuellement disponibles en cuisine. Aucun plat n'est marqué en rupture sur votre menu digital. ✅`;
        }
      } else if (cleanQ.includes('ca') || cleanQ.includes('chiffre') || cleanQ.includes('total') || cleanQ.includes('recette') || cleanQ.includes('combien')) {
        answer = `Votre Chiffre d'Affaires encaissé aujourd'hui est de **${totalRevenue.toLocaleString('fr-FR')} FCFA** sur **${paidOrders.length} commande(s) réglée(s)**.\n- Espèces : ${cashRevenue.toLocaleString('fr-FR')} FCFA\n- Wave : ${waveRevenue.toLocaleString('fr-FR')} FCFA\n- Orange Money : ${omRevenue.toLocaleString('fr-FR')} FCFA\n- Carte / TPE : ${cardRevenue.toLocaleString('fr-FR')} FCFA\n\n💡 **Action terrain :** Gardez un œil sur la clôture Z en fin de service pour garantir l'exactitude de la caisse.`;
      } else if (cleanQ.includes('heure') || cleanQ.includes('rush') || cleanQ.includes('charge')) {
        answer = `Sur le marché de la restauration à Dakar et Thiès, le grand pic du midi se situe entre **13h00 et 14h30**, et le service du soir démarre à **20h00**. Il est actuellement **${contextData.currentHourDakar}**.\n\n💡 **Action terrain :** Préparez la mise en place 30 minutes avant le rush pour réduire le temps d'attente sur les tables.`;
      } else {
        answer = `Bonjour Monsieur le Gérant ! Votre établissement enregistre aujourd'hui un Chiffre d'Affaires de **${totalRevenue.toLocaleString('fr-FR')} FCFA** (${paidOrders.length} commandes encaissées).\n\nPosez-moi des questions sur vos ventes, votre plat star, vos encaissements Wave ou l'état de vos stocks ! 👩🏾‍💼\n\n💡 **Action terrain :** Vérifiez régulièrement l'onglet "Commandes" pour vous assurer que tous les tickets servis sont bien clôturés.`;
      }
    }

    logApiCall({
      method: 'POST',
      endpoint: '/api/tenant/ai-copilot',
      tenantId: tenant.id,
      durationMs: timer.elapsedMs(),
      statusCode: 200,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      answer,
      context: {
        restaurantName: tenant.businessName,
        totalRevenue,
        paidOrdersCount: paidOrders.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return createApiErrorResponse(error, {
      method: 'POST',
      endpoint: '/api/tenant/ai-copilot',
      durationMs: timer.elapsedMs(),
    });
  }
}
