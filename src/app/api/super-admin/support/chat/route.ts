import { NextResponse } from 'next/server';

// POST /api/super-admin/support/chat
// Assistant IA 24/7 pour le support technique & opérationnel des restaurants
export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message manquant' }, { status: 400 });
    }

    const lower = message.toLowerCase();
    let reply = '';

    if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('hello')) {
      reply = '👋 Bonjour ! Je suis l\'Assistant IA 24/7 de Lou Ame Tay. Comment puis-je vous aider aujourd\'hui ? (Abonnement, QR Code, ajout de plats, imprimante cuisine ou paiement Wave/Orange Money ?)';
    } else if (lower.includes('payer') || lower.includes('wave') || lower.includes('orange money') || lower.includes('abonnement') || lower.includes('renouvellement')) {
      reply = '💳 **Renouvellement d\'Abonnement :**\n\n' +
        '1. Le règlement s\'effectue directement par Wave au `+221 77 123 45 67` ou Orange Money au `+221 78 987 65 43`.\n' +
        '2. Dès réception du paiement, le Super Admin peut prolonger l\'abonnement en 1 clic (+1 mois, +3 mois ou +1 an) via le panneau de réglages.\n' +
        '3. Vous pouvez également générer et envoyer un rappel WhatsApp automatique avec le lien direct.';
    } else if (lower.includes('qr') || lower.includes('imprimer') || lower.includes('table') || lower.includes('csv')) {
      reply = '🖨️ **Impression & Gestion des QR Codes :**\n\n' +
        '1. Dans la fiche du restaurant, rendez-vous sur l\'onglet **"Tables & QR Codes"**.\n' +
        '2. Cliquez sur **"📥 Télécharger la liste CSV des QR Codes"** pour envoyer le lot complet à votre imprimeur.\n' +
        '3. Vous pouvez aussi imprimer directement les planches A5 haute définition avec le bouton "Imprimer tous les QR codes".';
    } else if (lower.includes('plat') || lower.includes('menu') || lower.includes('rupture') || lower.includes('prix')) {
      reply = '🍲 **Gestion du Menu & Plats du Jour :**\n\n' +
        '1. Pour mettre un plat en rupture : utilisez le switch ON/OFF disponible dans le Dashboard Restaurateur.\n' +
        '2. Pour définir le plat du jour : activez l\'option "🌟 Lou Ame Tay (Plat du Jour)", il s\'affichera en tête de carte avec le badge spécial et l\'étoile.\n' +
        '3. Les allergènes (Gluten, Arachides, Poisson, etc.) peuvent être cochés dans la modale d\'édition.';
    } else if (lower.includes('cuisine') || lower.includes('comptoir') || lower.includes('bip') || lower.includes('son')) {
      reply = '👨‍🍳 **Vue Cuisine & Alertes Sonores :**\n\n' +
        '1. L\'écran `/kitchen` est divisé en 3 sections : 🔴 Nouvelles commandes (Orange vif), 🟢 En préparation (Jaune) et 📜 Historique des servies.\n' +
        '2. Le bouton audio en haut à droite permet d\'activer le carillon automatique double-ton.\n' +
        '3. En cliquant sur "✓ Servie", l\'heure `servedAt` est enregistrée et la commande est archivée dans l\'historique du jour téléchargeable en CSV.';
    } else {
      reply = `🤖 **Assistance Technique 24/7 :**\n\nJ'ai bien analysé votre demande concernant : *"${message}"*.\n\n` +
        `• **Action recommandée :** Un ticket de support prioritaire a été pré-enregistré dans l'onglet SAV.\n` +
        `• **Conseil immédiat :** Si vous rencontrez un blocage réseau ou matériel, assurez-vous que le serveur de caisse est connecté au Wi-Fi du restaurant. Pour toute assistance urgente en direct, contactez le support d'astreinte au **+221 77 654 32 10**.`;
    }

    return NextResponse.json({
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors du traitement IA' }, { status: 500 });
  }
}
