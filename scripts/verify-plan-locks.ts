import { prisma } from '../src/lib/prisma';
import { checkTenantFeatureAccess } from '../src/lib/server-plan-guard';

async function verifyPlanLocks() {
  console.log('================================================================');
  console.log('🔍 AUDIT QA & TEST AUTOMATISÉ : VÉRIFICATION DES VERROUS DE PACKS');
  console.log('Plateforme SaaS Lou Ame Tay ? — DAW Digital Arts Work by MG');
  console.log('================================================================\n');

  let errorsCount = 0;

  // 1. Récupération du Pack TÀMBALI depuis PostgreSQL Supabase
  console.log('📌 ÉTAPE 1 : Inspection du Pack TÀMBALI en Base de Données...');
  const tambaliPlan = await (prisma as any).plan.findFirst({
    where: {
      OR: [{ slug: 'tambali' }, { name: { contains: 'TÀMBALI' } }]
    },
    include: {
      planFeatures: {
        include: {
          feature: true
        }
      }
    }
  });

  if (!tambaliPlan) {
    console.error('❌ ERREUR CRITIQUE : Pack TÀMBALI introuvable dans la base !');
    process.exit(1);
  }

  console.log(`✅ Pack trouvé : "${tambaliPlan.name}" (ID: ${tambaliPlan.id}, Slug: ${tambaliPlan.slug})`);
  console.log(`📊 Nombre de fonctionnalités associées : ${tambaliPlan.planFeatures.length}\n`);

  // 2. Définition des règles métier attendues pour TÀMBALI
  const EXPECTED_TRUE_KEYS = [
    'MENU_DIGITAL',
    'STOCK_MANAGEMENT',
    'STUDIO_CUSTOMIZATION',
    'CONSULTATION_STATS'
  ];

  const EXPECTED_FALSE_KEYS = [
    'TABLE_ORDERING',
    'EXPRESS_POS',
    'BASIC_SALES_STATS',
    'KITCHEN_DISPLAY_KDS',
    'MULTI_LANGUAGE_MENU',
    'BLUETOOTH_PRINTING',
    'SINGLE_TV_SCREEN',
    'ADVANCED_STATS',
    'MULTI_COUNTERS',
    'MULTI_TV_SCREENS',
    'ADVANCED_EXPORT',
    'WAITER_QR',
    'MULTI_ZONE',
    'ZONE_TV_SCREENS',
    'MULTI_SITES',
    'STAFF_PERFORMANCE_ANALYTICS',
    'VIP_SUPPORT'
  ];

  console.log('📌 ÉTAPE 2 : Contrôle des Fonctionnalités Incluses (isActive: true)...');
  for (const expectedKey of EXPECTED_TRUE_KEYS) {
    const pf = tambaliPlan.planFeatures.find((item: any) => item.feature.keyName === expectedKey);
    if (!pf) {
      console.error(`  ❌ Manquante : Feature ${expectedKey} non configurée pour TÀMBALI`);
      errorsCount++;
    } else if (!pf.isActive) {
      console.error(`  ❌ Fausse alerte : Feature ${expectedKey} est à 'false' (devrait être true)`);
      errorsCount++;
    } else {
      console.log(`  🟢 OK : ${expectedKey.padEnd(25)} -> ACTIVE (true) [${pf.feature.label}]`);
    }
  }

  console.log('\n📌 ÉTAPE 3 : Contrôle des Fonctionnalités Verrouillées / Bloquées (isActive: false)...');
  for (const blockedKey of EXPECTED_FALSE_KEYS) {
    const pf = tambaliPlan.planFeatures.find((item: any) => item.feature.keyName === blockedKey);
    if (!pf) {
      console.log(`  🔒 OK (Non configurée = bloquée) : ${blockedKey.padEnd(25)}`);
    } else if (pf.isActive) {
      console.error(`  ❌ FAILLE DE SÉCURITÉ : Feature ${blockedKey} est à 'true' pour TÀMBALI !`);
      errorsCount++;
    } else {
      console.log(`  🔒 OK : ${blockedKey.padEnd(25)} -> BLOQUÉE (false) [${pf.feature.label}]`);
    }
  }

  // 3. Test du Garde Serveur (checkTenantFeatureAccess)
  console.log('\n📌 ÉTAPE 4 : Simulation des Appels API Serveur (Garde 403)...');
  
  // Chercher ou assigner temporairement un restaurant de test sous TÀMBALI
  let testTenant = await (prisma as any).tenant.findFirst({
    where: {
      currentPlanId: tambaliPlan.id
    }
  });

  let originalPlanId: string | null = null;
  if (!testTenant) {
    testTenant = await (prisma as any).tenant.findFirst();
    if (testTenant) {
      originalPlanId = testTenant.currentPlanId;
      await (prisma as any).tenant.update({
        where: { id: testTenant.id },
        data: { currentPlanId: tambaliPlan.id }
      });
    }
  }

  if (testTenant) {
    console.log(`  Établissement testé : "${testTenant.businessName}" (${testTenant.subdomain}) sous pack TÀMBALI temporaire`);

    try {
      // Test A : Fonctionnalité autorisée (MENU_MANAGEMENT)
      const accessAllowed = await checkTenantFeatureAccess(testTenant.id, 'MENU_MANAGEMENT');
      if (accessAllowed.allowed) {
        console.log('  🟢 Test Vitrine MENU_MANAGEMENT : AUTORISÉ (200 OK attendu)');
      } else {
        console.error('  ❌ Échec : MENU_MANAGEMENT a été refusé pour un compte vitrine !');
        errorsCount++;
      }

      // Test B : Fonctionnalité bloquée (TABLE_ORDERING)
      const accessBlockedOrder = await checkTenantFeatureAccess(testTenant.id, 'TABLE_ORDERING');
      if (!accessBlockedOrder.allowed) {
        console.log(`  🔒 Test Commande Table TABLE_ORDERING : BLOQUÉ (403 Paywall attendu : ${accessBlockedOrder.requiredPlanName})`);
      } else {
        console.error('  ❌ FAILLE CRITIQUE : TABLE_ORDERING débloqué sur pack vitrine !');
        errorsCount++;
      }

      // Test C : Fonctionnalité bloquée (KITCHEN_KDS)
      const accessBlockedKDS = await checkTenantFeatureAccess(testTenant.id, 'KITCHEN_KDS');
      if (!accessBlockedKDS.allowed) {
        console.log(`  🔒 Test Cuisine KDS KITCHEN_KDS : BLOQUÉ (403 Paywall attendu : ${accessBlockedKDS.requiredPlanName})`);
      } else {
        console.error('  ❌ FAILLE CRITIQUE : KITCHEN_KDS débloqué sur pack vitrine !');
        errorsCount++;
      }
    } finally {
      // Restauration immédiate du plan d'origine de l'établissement
      if (originalPlanId) {
        await (prisma as any).tenant.update({
          where: { id: testTenant.id },
          data: { currentPlanId: originalPlanId }
        });
      }
    }
  }

  // 4. Test de Persistance Réelle en Base de Données (Mise à jour et Relecture)
  console.log('\n📌 ÉTAPE 5 : Test de Sauvegarde & Persistance ACID dans PostgreSQL...');
  const testFeature = tambaliPlan.planFeatures.find((item: any) => item.feature.keyName === 'CONSULTATION_STATS');
  if (testFeature) {
    const originalState = testFeature.isActive;
    
    // Toggle
    await (prisma as any).planFeature.update({
      where: { id: testFeature.id },
      data: { isActive: !originalState }
    });

    const verifyToggled = await (prisma as any).planFeature.findUnique({
      where: { id: testFeature.id }
    });

    if (verifyToggled?.isActive === !originalState) {
      console.log(`  ✅ Mutation test validée : CONSULTATION_STATS basculé à ${!originalState}`);
    } else {
      console.error('  ❌ Échec de mutation : la BDD n\'a pas enregistré le nouvel état');
      errorsCount++;
    }

    // Restauration immédiate de l'état initial
    await (prisma as any).planFeature.update({
      where: { id: testFeature.id },
      data: { isActive: originalState }
    });

    const verifyRestored = await (prisma as any).planFeature.findUnique({
      where: { id: testFeature.id }
    });

    if (verifyRestored?.isActive === originalState) {
      console.log(`  ✅ Restauration validée : CONSULTATION_STATS restauré à ${originalState}`);
    } else {
      console.error('  ❌ Échec de restauration de l\'état d\'origine !');
      errorsCount++;
    }
  }

  console.log('\n================================================================');
  if (errorsCount === 0) {
    console.log('🎉 RÉSULTAT : 100% CONFORME — TOUS LES VERROUS SONT OPÉRATIONNELS !');
    console.log('Zéro régression détectée. Le pack TÀMBALI est prêt pour la production.');
    console.log('================================================================\n');
    process.exit(0);
  } else {
    console.error(`💥 RÉSULTAT : ${errorsCount} ERREUR(S) DÉTECTÉE(S) !`);
    console.log('================================================================\n');
    process.exit(1);
  }
}

verifyPlanLocks().catch((err) => {
  console.error('Erreur non gérée :', err);
  process.exit(1);
});
