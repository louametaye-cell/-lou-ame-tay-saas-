import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Fallback de sécurité si la BDD est momentanément inaccessible
const FALLBACK_FEATURES = [
  { id: 'feat_menu', keyName: 'MENU_DIGITAL', label: 'Menu digital avec photos illimitées', description: 'Affichage de la carte complète en ligne', category: 'CORE', valueType: 'BOOLEAN' },
  { id: 'feat_stocks', keyName: 'STOCK_MANAGEMENT', label: 'Gestion des stocks en 1 clic', description: 'Activation / Désactivation instantanée des plats', category: 'CORE', valueType: 'BOOLEAN' },
  { id: 'feat_studio', keyName: 'STUDIO_CUSTOMIZATION', label: 'Personnalisation logo/couleurs (Studio)', description: 'Identité visuelle de marque personnalisée', category: 'CORE', valueType: 'BOOLEAN' },
  { id: 'feat_stats_view', keyName: 'CONSULTATION_STATS', label: 'Statistiques de consultation', description: 'Scans QR et popularité des plats', category: 'CORE', valueType: 'BOOLEAN' },
  { id: 'feat_table_order', keyName: 'TABLE_ORDERING', label: 'Commande via QR Code Table', description: 'Prise de commande autonome par le client', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_express_pos', keyName: 'EXPRESS_POS', label: 'Caisse Express (au comptoir/à emporter)', description: 'Encaissement rapide au comptoir et clôture Z', category: 'BILLING', valueType: 'BOOLEAN' },
  { id: 'feat_basic_stats', keyName: 'BASIC_SALES_STATS', label: 'Statistiques de ventes de base', description: 'Chiffre d\'affaires quotidien et panier moyen', category: 'CORE', valueType: 'BOOLEAN' },
  { id: 'feat_kds', keyName: 'KITCHEN_DISPLAY_KDS', label: 'Écran Cuisine (KDS) complet avec alertes', description: 'Gestion des commandes en direct pour la brigade', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_multilang', keyName: 'MULTI_LANGUAGE_MENU', label: 'Traduction multilingue automatique (5 langues)', description: 'Wolof, Français, Anglais, Espagnol, Italien', category: 'MARKETING', valueType: 'BOOLEAN' },
  { id: 'feat_bluetooth', keyName: 'BLUETOOTH_PRINTING', label: 'Impression tickets Bluetooth 80mm', description: 'Format ESC/POS thermique pour additions', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_tv_single', keyName: 'SINGLE_TV_SCREEN', label: 'Écran Menu (affichage TV) mode simple', description: 'Affichage dynamique sur 1 écran téléviseur', category: 'MARKETING', valueType: 'BOOLEAN' },
  { id: 'feat_adv_stats', keyName: 'ADVANCED_STATS', label: 'Statistiques de ventes complètes', description: 'Analyses par tranches horaires et par moyens de paiement', category: 'BILLING', valueType: 'BOOLEAN' },
  { id: 'feat_counters', keyName: 'MULTI_COUNTERS', label: 'Gestion multi-guichets/multi-points de commande', description: 'Plusieurs terminaux de caisse simultanés', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_tv_multi', keyName: 'MULTI_TV_SCREENS', label: 'Écran Menu multi-écrans', description: 'Jusqu\'à 5 écrans TV synchronisés', category: 'MARKETING', valueType: 'BOOLEAN' },
  { id: 'feat_export', keyName: 'ADVANCED_EXPORT', label: 'Export de données avancé', description: 'Grand livre des ventes Excel et CSV', category: 'BILLING', valueType: 'BOOLEAN' },
  { id: 'feat_waiter_qr', keyName: 'WAITER_QR', label: 'QR personnel par serveur avec traçabilité', description: 'Affectation et suivi des pourboires', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_multizone', keyName: 'MULTI_ZONE', label: 'Gestion multi-zones (piscine, plage, room-service)', description: 'Segmentation spatiale du restaurant', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_tv_zone', keyName: 'ZONE_TV_SCREENS', label: 'Écran Menu par zone', description: 'Carte spécifique diffusée par espace', category: 'MARKETING', valueType: 'BOOLEAN' },
  { id: 'feat_multisites', keyName: 'MULTI_SITES', label: 'Gestion multi-sites (plusieurs points de restauration)', description: 'Tableau de bord multi-établissements unifié', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_staff_analytics', keyName: 'STAFF_PERFORMANCE_ANALYTICS', label: 'Export des performances staff avancé', description: 'Audit d\'efficacité et rapidité de service', category: 'BILLING', valueType: 'BOOLEAN' },
  { id: 'feat_vip_support', keyName: 'VIP_SUPPORT', label: 'Support VIP dédié', description: 'Assistance prioritaire 24/7 par DAW Digital Arts Work', category: 'CORE', valueType: 'BOOLEAN' },
  { id: 'feat_event_expiration', keyName: 'EVENT_AUTO_EXPIRATION', label: 'Désactivation automatique après événement', description: 'Coupure automatique pour prestations temporaires', category: 'MARKETING', valueType: 'BOOLEAN' },
];

export async function GET() {
  try {
    // 1. Récupérer toutes les fonctionnalités associées aux plans depuis PostgreSQL
    const dbFeatures = await (prisma as any).feature.findMany({
      where: {
        planFeatures: {
          some: {}
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (dbFeatures && dbFeatures.length > 0) {
      const formatted = dbFeatures.map((f: any) => ({
        id: f.id,
        keyName: f.keyName,
        label: f.label,
        description: f.description || '',
        category: f.category || 'CORE',
        valueType: f.valueType || 'BOOLEAN'
      }));
      return NextResponse.json({ features: formatted });
    }

    return NextResponse.json({ features: FALLBACK_FEATURES });
  } catch (error) {
    console.error('Erreur GET /api/admin/features (fallback) :', error);
    return NextResponse.json({ features: FALLBACK_FEATURES });
  }
}
