# 📋 CHANGELOG V2.2 — LOU AME TAY ? 🇸🇳🍽️
*Date de déploiement : Octobre 2026*  
*Architecture : Next.js 14 App Router, Prisma ORM, Redis (Upstash / In-Memory), Supabase Realtime, Tailwind CSS*  
*Supervision : Agence Digitale MDA Arts Work / Médias Graphisme Sénégal*

---

## 📌 RÉSUMÉ EXÉCUTIF DU DÉPLOIEMENT

Cette version **V2.2** constitue le passage en revue pré-déploiement final pour l'embarquement des premiers restaurateurs payants au Sénégal (Dakar, Thiès, Saly, Almadies). Elle concrétise trois chantiers prioritaires :
1. **Mission 1** : Résolution des goulets d'étranglement de performance, résilience et expérience utilisateur (cache ciblé par catégorie, polling KDS dynamique 2,5 s en secours, observabilité API avec logger structuré, timeout automatique du modal de table, badges clairs de paiement partiel).
2. **Mission 2** : Autonomisation intégrale des restaurateurs en libre-service (*Self-Service*) via trois nouveaux espaces dédiés : Paramètres 7 onglets (`/dashboard/settings`), Équipe & Brigade (`/dashboard/team`), et Centre de Support & Documentation 24/7 (`/dashboard/help`).
3. **Mission 3** : Francisation et harmonisation de tout le vocabulaire applicatif vers les standards métier du secteur CHR (*Poste Caisse*, *Brigade Cuisine*, *Écran Cuisine*, *Établissement*, *Espace Gérant*, etc.) avec méta-titres, H1 et boutons unifiés.

---

## 🚀 MISSION 1 — CORRECTIONS & OPTIMISATIONS OPÉRATIONNELLES

### 1. Invalidation ciblée du cache Redis par Catégorie (`src/lib/redis.ts`, `src/lib/cache.ts`, `src/lib/redis-cache.ts`)
- **Problème résolu** : Auparavant, modifier un seul plat ou basculer un stock invalidait l'ensemble du menu d'un restaurant (`menu:[tenantId]:all`), provoquant des pics de requêtes SQL sur les menus volumineux (> 100 articles).
- **Solution appliquée** :
  - Nouvelle clé granulaire : `menu:[tenantId]:cat:[categoryId]`.
  - Ajout des fonctions utilitaires : `getCategoryCacheKey()`, `getAllMenuCacheKey()`, `getCachedCategoryMenu()`, `setCachedCategoryMenu()`, `invalidateCategoryMenuCache()`, et `invalidateTenantMenuCache()`.
  - Mise à jour des routes API `/api/restaurant/menu-items/[id]/availability`, `/api/restaurant/menu-items` et `/api/menu` pour cibler exclusivement la catégorie affectée lors d'une mise à jour de plat.
  - Préservation de la clé globale `menu:[tenantId]:all` pour les opérations globales (création/suppression de catégorie).

### 2. Polling KDS adaptatif à 2,5 secondes & Détection Déconnexion (`src/hooks/useKitchenOrders.ts`)
- **Problème résolu** : Le polling de secours fixe à 4 000 ms était insuffisant lors des coups de feu (*rush*) ou lors de micro-coupures de connexion 4G/Wifi.
- **Solution appliquée** :
  - Détection automatique d'instabilité WebSocket : si la connexion n'est pas établie ou si $\ge 3$ commandes consécutives sont manquées par WebSocket, basculement dynamique du cycle de rafraîchissement à **2 500 ms**.
  - Rétablissement immédiat et transparent du mode temps réel WebSocket dès que le canal Supabase est reconnecté avec succès.
  - Notification visuelle d'état dans le header KDS (`Realtime Connecté` ou `Mode Synchro (2.5s)`).

### 3. Logger Structuré API & Gestion d'Erreur 500 Uniforme (`src/lib/logger.ts`)
- **Problème résolu** : Les erreurs d'API 500 étaient silencieuses ou exposaient des messages techniques bruts peu compréhensibles pour les utilisateurs.
- **Solution appliquée** :
  - Création du module structuré `src/lib/logger.ts` fournissant `logApiCall()` et `createApiErrorResponse()`.
  - Capture systématique : méthode HTTP, endpoint, tenantId, userId, horodatage ISO, durée d'exécution en ms (`startTimer()`), statut HTTP et message d'erreur.
  - Insertion asynchrone non-bloquante dans Supabase (`table: api_logs`) pour audit de production sans latence pour l'utilisateur.
  - Message client officiel Lou Ame Tay en cas d'erreur 500 :  
    > *"Une erreur est survenue, l'équipe technique a été notifiée."*
  - Intégration sur les routes stratégiques : `/api/menu`, `/api/orders`, `/api/restaurant/menu-items`, `/api/cashier/orders/[id]/pay`, `/api/cashier/orders`.

### 4. Timeout Automatique 30s sur le Modal "Rejoindre / Séparé" (`src/components/client-menu/TableWelcomeModal.tsx`)
- **Problème résolu** : Lorsqu'un second client scannait une table active, l'hésitation devant le modal pouvait bloquer la consultation du menu.
- **Solution appliquée** :
  - Compte à rebours dynamique de 30 secondes avec décompte textuel : `"Choix automatique dans XX sec..."`.
  - Barre de progression visuelle animée aux couleurs ambre/or.
  - Fermeture automatique à expiration avec déclenchement de la session séparée par défaut (`onStartNewMeal`), permettant au client de consulter immédiatement la carte sans blocage.

### 5. Visibilité Accrue des Paiements Partiels sur l'Écran Cuisine (`src/components/kitchen/OrderTicketCard.tsx`, `src/types/index.ts`)
- **Problème résolu** : Les commandes ayant fait l'objet d'un acompte ou paiement partiel n'étaient pas discernables des commandes impayées sur le ticket KDS.
- **Solution appliquée** :
  - Extension du typage TypeScript `OrderType` avec `paidAmount` et `amountReceived`.
  - Affichage d'un badge jaune haute visibilité : `PAIEMENT PARTIEL - Reste XX FCFA` si un acompte est reçu.
  - Badge vert `PAYÉ ✅` si `paymentStatus === 'PAID'`.
  - Badge orange `NON PAYÉ` si `paymentStatus === 'UNPAID'` et aucun acompte versé.

---

## 🎛️ MISSION 2 — AUTONOMISATION DES OPTIONS (SELF-SERVICE)

### Option A : Page "Paramètres du Restaurant" (`/dashboard/settings`)
Nouvelle interface complète en 7 onglets opérationnels :
1. **Identité** :
   - Formulaire d'édition : Nom d'enseigne, sous-domaine, adresse physique, téléphone de contact, email gérant.
   - Modules d'upload avec validation stricte : Logo (limité à 2 Mo, formats JPG/PNG/SVG) et Bannière de couverture (limitée à 5 Mo).
2. **Horaires & Jours d'ouverture** :
   - Configuration des 7 jours de la semaine (plages d'ouverture/fermeture).
   - Sélecteur de fermeture exceptionnelle avec date picker et message personnalisé.
   - Badge dynamique en direct indiquant l'état réel de l'établissement (*"Ouvert actuellement"* / *"Fermé actuellement"*).
3. **Zones & Tables** :
   - Gestionnaire multi-zones : Salle, Terrasse, Rooftop, Bar, VIP.
   - Ajout, renommage et suppression de tables.
   - Génération et aperçu instantané du QR Code par table avec bouton d'impression dédié.
4. **Caissiers & Codes PIN** :
   - Création et gestion des caissiers autorisés.
   - Générateur automatique de code PIN sécurisé à 4 chiffres.
   - Bouton de transmission directe du code PIN par lien WhatsApp pré-rempli au caissier.
   - Historique des connexions avec dates et statuts.
5. **Paiement & Devises** :
   - Sélecteur de devise principale (FCFA par défaut BCEAO, EUR, USD).
   - Interrupteurs d'activation des modes de règlement : Espèces, Wave Sénégal, Orange Money, Carte Bancaire.
   - Saisie indicative des numéros marchands pour affichage client (Wave Merchant ID, OM Merchant Number).
6. **Notifications & Sons** :
   - Réglages des alertes sonores de l'écran cuisine (Carillon, Ding-Dong, Alerte Rush).
   - Test sonore instantané via Web Audio API synthétisée.
   - Configuration des notifications WhatsApp V3 et numéro d'astreinte.
7. **Zone de Danger** :
   - Réinitialisation sécurisée du menu avec saisie obligatoire de confirmation textuelle `"REINITIALISER"`.
   - Export conforme RGPD de l'intégralité des données de l'établissement au format JSON.
   - Procédure encadrée de résiliation/suppression de compte.

### Option B : Page "Équipe & Brigade" (`/dashboard/team`)
- Organisation du personnel opérationnel de l'établissement :
  - **Serveurs de salle** : Nom, téléphone, état d'activité, et QR code personnel pour attribution d'appel serveur à table.
  - **Brigade Cuisine** : Nom, téléphone, shift (Matin, Soir, Continu), spécialité (Grillades, Pizza, Chaud, Desserts).
- Modal d'ajout de collaborateur unifié avec feedback instantané.
- Impression des badges serveurs individuels.

### Option C : Page "Support & Documentation" (`/dashboard/help`)
- **FAQ Métier CHR** : 10 questions/réponses exhaustives adaptées aux réalités sénégalaises (réseau 3G/4G, impression thermique 80mm ESC/POS, encaissements Wave/OM, gestion des tables).
- **Tutoriels Vidéo** : Cartes vidéo pas-à-pas avec durées estimées et thématiques claires.
- **Moniteur de Santé en Temps Réel** : Diagnostic en direct des services cloud via `/api/health` (Base de données PostgreSQL/Supabase, Realtime WebSocket, Redis Upstash, CDN Vercel) avec temps de latence en ms.
- **Assistance Express WhatsApp** : Bouton d'ouverture de ticket support direct pré-rempli avec l'identifiant de l'établissement (`tenantId`) vers le standard MDA Arts Work (+221 77 458 74 74).

---

## 📝 MISSION 3 — RENOMMAGE PROFESSIONNEL & VOCABULAIRE CHR

### 1. Terminologie Métier Unifiée

| Ancien terme technique | Nouveau libellé professionnel | Emplacement / Justification |
|---|---|---|
| `dashboard` | **Espace Gérant** / **Tableau de Bord** | Plus humain, valorisant pour le propriétaire. |
| `cashier` | **Poste Caisse** | Vocabulaire standard CHR / caisses enregistreuses. |
| `kitchen` | **Brigade Cuisine** | Terminologie culinaire professionnelle. |
| `client-menu` | **Menu Client** | Lisible et immédiatement compréhensible. |
| `super-admin` | **Console MDA** | Affirmation de la marque de l'agence MDA Arts Work. |
| `KDS` (dans l'UI) | **Écran Cuisine** | Terme français, accessible à l'ensemble du personnel. |
| `POS` (dans l'UI) | **Caisse Enregistreuse** | Terminologie commerciale reconnue. |
| `Tenant` (dans l'UI) | **Établissement** | Moins abstrait et plus représentatif. |
| `Settings` | **Paramètres** | Standard français. |
| `Logout` | **Déconnexion** | Standard français. |

### 2. Titres de Pages (Meta Title & H1)

| Route | Méta-titre & H1 Harmonisé | Fichier source |
|---|---|---|
| `/dashboard` | `Tableau de Bord — Espace Gérant Lou Ame Tay?` | `src/app/dashboard/page.tsx` & `layout.tsx` |
| `/cashier` | `Poste Caisse — Lou Ame Tay?` | `src/app/cashier/page.tsx` & `CashierPOS.tsx` |
| `/kitchen` | `Brigade Cuisine — Lou Ame Tay?` | `src/app/kitchen/page.tsx` & `KitchenHeader.tsx` |
| `/pickup` | `Écran Retrait Client — Lou Ame Tay?` | `src/app/pickup/[restaurantId]/page.tsx` |
| `/display` | `Affichage Salle — Lou Ame Tay?` | `src/app/display/[restaurantId]/page.tsx` & `dashboard/display/page.tsx` |
| `/express` | `Borne Express — Lou Ame Tay?` | `src/app/express/page.tsx` & `r/[subdomain]/express/page.tsx` |
| `/login` | `Connexion Gérant — Lou Ame Tay?` | `src/app/login/page.tsx` |
| `/super-admin` | `Console MDA — Lou Ame Tay?` | `src/app/super-admin/page.tsx` |
| `/r/[subdomain]` | `[Nom Restaurant] — Menu Digital` | `src/app/r/[subdomain]/page.tsx` (`generateMetadata`) |

### 3. Boutons d'Action & Messages d'Erreur
- **Boutons standardisés** : *Valider*, *Annuler*, *Enregistrer*, *Supprimer*, *Modifier*, *Imprimer*, *Fermer*, *Confirmer*, *Retour*.
- **Messages clairs** :
  - 500 : *"Une erreur est survenue. L'équipe a été notifiée."*
  - 401 : *"Votre session a expiré. Veuillez vous reconnecter."*
  - 404 : *"Cette page n'existe pas ou a été déplacée."*
  - Réseau : *"Problème de connexion. Vérifiez votre réseau."*

---

## 🧪 VALIDATION & TESTS QUALITÉ ASSURANCE

1. **Compilation TypeScript** :  
   `npx tsc --noEmit` ➡️ **0 erreur** détectée sur l'ensemble de la base de code.
2. **Suite de Tests Vitest** :  
   `npm test` ➡️ **8/8 tests passés avec succès** (100% au vert) :
   - Fonctions utilitaires métier : `cn()`, `formatFCFA()`, `convertFCFATo()`, `formatConvertedPrice()`, `formatDualPrice()`.
   - Clés de cache ciblées par catégorie : `getCategoryCacheKey()`, `getAllMenuCacheKey()`.
   - Format de réponse d'erreur 500 et logger structuré : `createApiErrorResponse()`.
3. **Respect des Règles d'Accessibilité et d'Intégrité Financière** :
   - Code couleur strict respecté (Vert, Orange/Ambre, Rouge, Bleu).
   - Séparation absolue statuts métier / statuts financiers préservée.
