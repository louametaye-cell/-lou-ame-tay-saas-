import { NextResponse } from 'next/server';

export const DEFAULT_FEATURES = [
  { id: 'feat_menu', keyName: 'MENU_DIGITAL', label: 'Menu digital avec photos illimitées', category: 'CORE', valueType: 'BOOLEAN' },
  { id: 'feat_stocks', keyName: 'STOCK_MANAGEMENT', label: 'Gestion des stocks en 1 clic', category: 'CORE', valueType: 'BOOLEAN' },
  { id: 'feat_studio', keyName: 'STUDIO_CUSTOMIZATION', label: 'Personnalisation logo/couleurs (Studio)', category: 'CORE', valueType: 'BOOLEAN' },
  { id: 'feat_stats_view', keyName: 'CONSULTATION_STATS', label: 'Statistiques de consultation', category: 'CORE', valueType: 'BOOLEAN' },
  { id: 'feat_table_order', keyName: 'TABLE_ORDERING', label: 'Commande via QR Code Table', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_express_pos', keyName: 'EXPRESS_POS', label: 'Caisse Express (au comptoir/à emporter)', category: 'BILLING', valueType: 'BOOLEAN' },
  { id: 'feat_basic_stats', keyName: 'BASIC_SALES_STATS', label: 'Statistiques de ventes de base', category: 'CORE', valueType: 'BOOLEAN' },
  { id: 'feat_kds', keyName: 'KITCHEN_DISPLAY_KDS', label: 'Écran Cuisine (KDS) complet avec alertes', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_multilang', keyName: 'MULTI_LANGUAGE_MENU', label: 'Traduction multilingue automatique (5 langues)', category: 'MARKETING', valueType: 'BOOLEAN' },
  { id: 'feat_bluetooth', keyName: 'BLUETOOTH_PRINTING', label: 'Impression tickets Bluetooth 80mm', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_tv_single', keyName: 'SINGLE_TV_SCREEN', label: 'Écran Menu (affichage TV) mode simple', category: 'MARKETING', valueType: 'BOOLEAN' },
  { id: 'feat_adv_stats', keyName: 'ADVANCED_STATS', label: 'Statistiques de ventes complètes', category: 'BILLING', valueType: 'BOOLEAN' },
  { id: 'feat_counters', keyName: 'MULTI_COUNTERS', label: 'Gestion multi-guichets/multi-points de commande', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_tv_multi', keyName: 'MULTI_TV_SCREENS', label: 'Écran Menu multi-écrans', category: 'MARKETING', valueType: 'BOOLEAN' },
  { id: 'feat_export', keyName: 'ADVANCED_EXPORT', label: 'Export de données avancé', category: 'BILLING', valueType: 'BOOLEAN' },
  { id: 'feat_waiter_qr', keyName: 'WAITER_QR', label: 'QR personnel par serveur avec traçabilité', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_multizone', keyName: 'MULTI_ZONE', label: 'Gestion multi-zones (piscine, plage, room-service)', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_tv_zone', keyName: 'ZONE_TV_SCREENS', label: 'Écran Menu par zone', category: 'MARKETING', valueType: 'BOOLEAN' },
  { id: 'feat_multisites', keyName: 'MULTI_SITES', label: 'Gestion multi-sites (plusieurs points de restauration)', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_staff_analytics', keyName: 'STAFF_PERFORMANCE_ANALYTICS', label: 'Export des performances staff avancé', category: 'BILLING', valueType: 'BOOLEAN' },
  { id: 'feat_vip_support', keyName: 'VIP_SUPPORT', label: 'Support VIP dédié', category: 'CORE', valueType: 'BOOLEAN' },
];

export async function GET() {
  return NextResponse.json({ features: DEFAULT_FEATURES });
}
