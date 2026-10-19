# RÈGLES DE DÉVELOPPEMENT & STANDARDS LOU AME TAY ? 🇸🇳🍽️

## 1. Langue et Style de Communication
- Réponds **toujours en français**, quelle que soit la langue de la question.

## 2. Charte d'Accessibilité Universelle (Règle d'Or Non-Négociable)
La plateforme est utilisée par des personnes de tous niveaux d'alphabétisation (clients, serveurs, caissiers, cuisiniers).
**Aucune fonctionnalité ne doit dépendre du texte seul.** Le sens doit passer par la **forme, la couleur, l'icône, la taille et la position AVANT le texte**.

### Les 7 Règles Obligatoires :
1. **Code Couleur Strict & Immuable** :
   - 🟢 **Vert** : validé / terminé / action positive / caisse juste / encaissement réussi.
   - 🟡 **Orange / Ambre** : en attente / action requise / nouvelle commande non traitée.
   - 🔴 **Rouge** : urgent / erreur / retard cuisine (>20 min) / montant insuffisant / déficit caisse / suppression.
   - 🔵 **Bleu** : en cours / information neutre / Wave.
2. **Priorité aux Icônes (SVG Lucide)** :
   - Jamais de texte seul pour une action critique.
   - Pictogrammes universels : `Bell` (appel serveur), `Banknote` / `CreditCard` (addition/encaissement), `ChefHat` / `Flame` (cuisine/fait maison), `Printer` (impression ticket), `Trash2` (suppression/annulation).
   - 80% des interfaces doivent être compréhensibles sans savoir lire.
3. **Typographie Géante pour Chiffres & Montants** :
   - Prix FCFA en très gros caractères gras (`font-mono font-black text-xl+`).
   - Numéro de commande géant sur tous les écrans staff et TV (jusqu'à 72px XXL).
   - Sélecteurs de quantité `+` et `-` de minimum 48px de zone tactile.
4. **Une Action = Un Bouton = Une Couleur = Une Position Cohérente** :
   - Bouton de validation principal TOUJOURS vert et situé en bas / bas-droite.
   - Hauteur minimale tactile de 48px sur tous les boutons critiques.
5. **Confirmation Multi-Sensorielle (Visuelle & Sonore)** :
   - Animation franche d'état ou confettis lors d'une réussite.
   - Carillon Web Audio synthétisé lors d'une commande en caisse/cuisine, Ding-Dong sur écran TV.
6. **Minimiser le Texte, Maximiser le Visuel** :
   - Photos dominantes sur mobile (>= 200px de haut, au moins 50% de la carte).
   - Cartes staff épurées sans phrases verbeuses.
7. **Feedback d'Erreur Explicite Sans Lecture** :
   - Conteneur rouge vif (`bg-rose-50 border-2 border-rose-500 text-rose-950`).
   - Icône ⚠️ ou ❌ visible au cœur de l'élément en échec.

### Question Test Obligatoire :
> *« Une personne non francophone et non alphabétisée peut-elle réaliser l'action sans demander d'aide ? »*

---

## 3. Système de Verrouillage par Pack (Paywall 7 Formules)
- **7 Formules** : `TÀMBALI` (vitrine pure) ➡️ `NIO FAR` (commande + caisse) ➡️ `XÉWEUL` (KDS + TV + multilingue) ➡️ `BAOBAB` (multi-guichets) ➡️ `TERANGA` (zones + serveurs) ➡️ `BUUR` (multi-sites) ➡️ `NDAJÉ` (illimité & ERP).
- **Philosophie Valorisante (Jamais Punitif)** : Ne jamais masquer une fonctionnalité. Afficher un badge cadenas (`LockedHeaderButton`, `LockedFeatureCard`). Au clic, ouvrir `FeatureUpgradeModal` avec explication du gain métier et lien direct WhatsApp.
- **Protection Serveur 403** : Toute route API protégée doit appeler `assertPlanAccess(restaurantId, feature)` depuis `src/lib/server-plan-guard.ts`.
- **Garde de Page** : Protéger les pages complètes avec `<LockedFeatureGuard>`.

---

## 4. Cloisonnement Strict des 3 Espaces Opérationnels
1. **Espace Gérant / Admin** (`/dashboard`) : réservé au propriétaire avec identifiants admin.
2. **Espace Caisse** (`/cashier?restaurantId=...`) : accès sécurisé sous code PIN caissier individuel. Contrôle serveur d'appartenance : rejet immédiat si un caissier d'un établissement tente de se connecter sur un autre.
3. **Espace Cuisine KDS** (`/kitchen?restaurantId=...`) : affichage dédié brigade, 0 accès aux chiffres d'affaires et aux paramètres.

---

## 5. Spécificités Pack TÀMBALI
- Menu vitrine digital pur : 0% prise de commande en ligne.
- La commande reste 100% orale au personnel.
- Pas de panier de checkout, pas de bouton de paiement, pas de tracker de commande.
- Intégration du **Tiroir de Sélection Personnelle** servant d'aide-mémoire au client.
- Carte tarifs : exclusion formelle de toute mention de prise de commande pour ce pack.

---

## 6. Standards de Preuve & Assurance Qualité E2E
- Aucune déclaration "terminé" sans vérification réelle :
  1. `npx tsc --noEmit` ➡️ 0 erreur.
  2. Scripts Playwright / Puppeteer réels avec captures d'écran HD.
  3. Tests sur les 4 comptes réels (Anima Pizzeria, Madiba, Sam's Prestige, Lat-Dior).
## Section 10 — Discipline QA et Sécurité Renforcée (Standards Obligatoires)

Ces règles s'appliquent à CHAQUE session de travail sur Lou Ame Tay, sans exception, et doivent être suivies même si l'utilisateur ne les rappelle pas explicitement dans son prompt.

### 10.1 — Interdiction de déclarer un correctif "terminé" sans preuve
Ne jamais utiliser "✅ Complet", "✅ Certifié", "100% conforme" ou équivalent sans preuve concrète jointe dans la même réponse : capture d'écran réelle de l'interface (pas un script qui interroge directement la base de données), log de terminal complet, ou résultat de requête brut.

### 10.2 — Diagnostic avant correction
Face à un bug signalé, toujours identifier et expliquer la cause racine exacte AVANT de proposer ou d'appliquer une correction. Si un correctif précédent s'est révélé incomplet, expliquer explicitement pourquoi le test précédent n'a pas détecté le problème.

### 10.3 — Vérification systématique sur les 4 comptes réels
Un bug détecté sur un compte doit être vérifié et corrigé sur TOUS les comptes réels actifs (actuellement : anima-pizzeria, madiba-restaurant, sams-prestige, hotel-lat-dior), pas seulement celui où il a été signalé. Le préciser explicitement dans chaque rapport.

### 10.4 — Séparation stricte statuts métier / statuts financiers
Un statut opérationnel (préparé, prêt, servi) ne doit JAMAIS modifier, directement ou indirectement, un statut de paiement (paymentStatus). Le passage à "payé/encaissé" ne peut résulter que d'une action explicite et manuelle d'un caissier, avec saisie du montant reçu. Vérifier ce principe à chaque nouvelle fonctionnalité touchant les commandes.

### 10.5 — Hiérarchie des packs, jamais une égalité stricte
Le système de packs (Tàmbali < Nio Far < Xéweul < Baobab < Teranga < Buur, Ndajé à part) doit toujours être vérifié par NIVEAU HIÉRARCHIQUE ("le pack actuel est-il au moins celui requis ?"), jamais par égalité stricte ("le pack est-il exactement celui-ci ?"). Un compte sur un pack supérieur a TOUJOURS accès à tout ce qu'un pack inférieur contient. Vérifier cette logique sur TOUTE nouvelle vérification d'accès ajoutée au système.

### 10.6 — Cloisonnement des rôles au niveau serveur, jamais seulement visuel
Toute séparation entre espace Admin, Caisse et Cuisine doit être appliquée au niveau du contrôle d'accès serveur/middleware, jamais seulement par le masquage d'un lien dans l'interface. Tester explicitement l'accès direct par URL et par appel API pour confirmer le refus (401/403).

### 10.7 — Discipline sur les prix et les changements tarifaires
Ne jamais faire évoluer un prix, un pourcentage, ou une date d'échéance sans le signaler explicitement comme un changement par rapport à la dernière valeur validée. Tout tarif préférentiel accordé à un client doit être borné dans le temps avec une date de réexamen documentée, jamais laissé "à vie" par défaut.

### 10.8 — Charte d'accessibilité universelle
Toute nouvelle interface utilisateur doit respecter : code couleur cohérent et unique (vert=validé, orange=attente, rouge=urgence, bleu=en cours), icônes avant texte pour toute action critique, nombres/prix en grand format, confirmation d'action visuelle et/ou sonore, position cohérente des boutons d'action similaires sur tous les écrans.

### 10.9 — Autorisation de déploiement
Ne jamais déployer en production un changement touchant les paiements, la caisse, les tarifs, la sécurité des accès, ou les données de clients réels sans validation humaine explicite obtenue au préalable dans la conversation. Pour tout autre changement (texte, design, contenu), le déploiement peut suivre un rythme plus rapide.

---

## Section 11 — Intégrité Financière & Détection Automatique des Failles Comptables (Compétence Maîtresse Permanente)

Cette compétence se déclenche AUTOMATIQUEMENT à chaque fois qu'une fonctionnalité nouvelle ou modifiée touche à un statut de commande, un calcul financier, une action caisse, ou une route API liée à l'argent. Elle ne doit jamais être désactivée.

### 11.1 — La Question Maîtresse (Bloquante Avant Tout Code)
> *"Est-ce que cette nouvelle fonctionnalité introduit un nouvel état de commande, une nouvelle action, ou un nouveau chemin de code qui pourrait faire apparaître une commande dans un calcul financier (caisse du jour, clôture Z, total encaissé, rapport de ventes) alors qu'elle ne devrait pas y être ?"*
Si la réponse est "oui" ou "peut-être" : **bloquer l'implémentation** et poser les verrous financiers en premier, avant tout développement.

### 11.2 — Les 5 Chemins Financiers à Auditer Systématiquement
1. **CA en Direct (`CashierPOS.tsx`)** : filtre `.filter((o) => o.paymentStatus === 'PAID' && o.status !== 'CANCELLED')`.
2. **Clôture Z & Rapport de Session (`api/cashier/session/route.ts`)** : `status: { not: 'CANCELLED' }` au niveau RACINE du `where`, jamais seulement dans une branche d'un `OR`.
3. **Route d'Encaissement (`api/cashier/orders/[id]/pay/route.ts`)** : vérification explicite que `order.status !== 'CANCELLED'` avant tout encaissement.
4. **Historique Cuisine (`api/kitchen/history/route.ts`)** : `where: { status: { not: 'CANCELLED' } }` pour ne pas fausser les analyses.
5. **Statistiques & Dashboards (`api/stats`)** : exclusion systématique des statuts non-commerciaux de toute somme ou agrégation financière.

### 11.3 — Matrice d'Audit Obligatoire
Avant chaque implémentation touchant aux statuts ou aux flux d'argent, remplir la matrice des 5 points + Écran TV (/pickup) + Ticket client, et tester les 4 scénarios de collision (action simultanée client/caissier, rechargement pendant clôture Z, mutation d'état pendant requête, paiement Wave/OM orphelin).

---

## Section 12 — Signature Officielle & Coordonnées Immuables DAW Digital Arts Work
- **Entité & Signature Développeur** : `DAW Digital Arts Work — by MG`
- **Rôle & Statut** : Direction Générale / CEO & Développeur (Dev) de Lou Ame Tay? (Startup Sénégalaise)
- **Siège Social** : `Thiès, Sénégal — Quartier Fayou, Face Foot Salé (Siège Social)`
- **Téléphones Officiels** : `+221 77 458 74 74` (principal) / `+221 77 130 36 78` (secondaire)
- **Email Professionnel** : `contact@mgartswork.site`
- **Réseaux Sociaux** : `@mgartswork` (YouTube, Facebook, Instagram, TikTok)
- **Console d'Administration** : Toujours nommer la console d'administration **Console DAW** (`/super-admin`).
- **Interdiction Formelle** : Ne jamais réintroduire les anciennes dénominations "MDA", "MDA Arts Work" ou "Médias Graphisme". Tout document généré doit intégrer le bloc de signature officiel :
```markdown
---
*Document produit par DAW Digital Arts Work — by MG*
*Signature de développeur Vibe Coder*
*Contact : contact@mgartswork.site | +221 77 458 74 74*
```

---

## Section 13 — Console DAW, Architecture Analytique Réseau & UX Senior B2B
Cette section consacre les règles de design et de télémétrie de la console de supervision Super-Admin (`/super-admin`) :

### 13.1 — Design System "Executive Clean & Quiet Luxury"
- **Zéro bruit visuel** : Bannir les bordures multicolores fluorescentes, les gradients criards et les pictogrammes gadgets (`Sparkles`, `Flame`, `Trophy`).
- **Icônes universelles sobres** : `Award` (Plat star), `TrendingUp` (Conversion), `Activity` / `BarChart3` (Métriques), `Clock` (Heures de rush), `Eye` (Consultations plats), `Star` (Avis et e-réputation).
- **Header unifié à 2 niveaux** :
  1. Bandeau supérieur : Statut réactif vert pulsé (`X / Y actifs`), synchro dynamique, support DAW 24/7, bouton rafraîchir et un seul bouton primaire CTA sombre contrasté (`+ Nouveau Restaurant Client`).
  2. Barre d'onglets de navigation intégrée : Vue d'ensemble, Classement & Plats Stars, Carte Réseau Sénégal, Gestion des Formules, Diagnostic QA.

### 13.2 — Télémétrie Consolidée Temps Réel & Entonnoir Universel
- **4 Paliers de Conversion** :
  1. Trafic en salle (Scans QR réels).
  2. Découverte menu (Somme des consultations `viewsCount` des `menuItems`).
  3. Prise de commande (Commandes totales non-annulées).
  4. Encaissement caisse (Chiffre d'affaires réel encaissé `PAID` / `SUCCESS`).
- **Matrice des Plats Stars** : Calcul automatique pour chaque établissement du plat le plus commandé avec volume de ventes (`salesCount`) et tarif unitaire FCFA.
- **Heatmap 24h & Heures de Rush** : Distribution horaire de 00h à 23h mettant en lumière les 4 pics réels du marché sénégalais (13h déjeuner, 15h plage/détente, 19h dîner, 22h-23h soirée lounge).
- **Module E-Réputation** : Suivi de la note de satisfaction certifiée Lou Ame Tay (4.8/5 ⭐) et lien direct sortant vers les fiches Google Maps des restaurants partenaires.

---

## Section 14 — Architecture POS Caisse Focus, Routage Multi-Stations (Kitchen/Bar), Écran Retrait TV et ERP Matériel

### 14.1 — Dissociation Hermétique Statuts Financiers vs Statuts Opérationnels (Règle d'Or Inviolable)
- **Le Paiement ne Cuit Pas les Plats** : Une action financière (marquer `paymentStatus: 'PAID'`) ne doit JAMAIS modifier le statut opérationnel de préparation (`status: 'PENDING' | 'PREPARING'`), ni affecter `servedAt`.
- **Ventes Comptoir (Takeaway)** : Payées d'avance au comptoir mais préparées ensuite par la cuisine. Elles DOIVENT impérativement conserver `status: 'PENDING'` lors de l'encaissement pour apparaître sur le KDS Cuisine et dans la colonne "En Préparation" du Retrait TV.
- **Historique de Station** : Une commande n'entre dans l'historique d'une station (`/api/kitchen/history` ou `/api/bar/history`) QUE si tous ses articles rattachés à cette station sont `READY` ou `SERVED`. Jamais si des articles sont encore `PENDING` !

### 14.2 — Routage Chirurgical Multi-Stations (`StationType`)
- **Partitionnement Automatique** : Tout article ou catégorie est typé `KITCHEN` (cuisine) ou `BAR` (boissons).
- **Écrans Dédiés** : `/kitchen` filtre strictement les items cuisine, `/bar` filtre les boissons. Une commande mixte est traitée en parallèle sans collision.

### 14.3 — Écran Retrait Guichet TV (`/pickup/[restaurantId]`)
- **Grille 2 Colonnes Géantes** : Colonne Gauche Bleue "EN PRÉPARATION" (`PENDING`/`PREPARING`) vs Colonne Droite Verte Émeraude "PRÊT À RETIRER" (`READY`).
- **Confirmation Multi-Sensorielle** : Déclenchement automatique du Carillon Web Audio synthétisé à 2 tons (`playDingDongChime()`) et annonce vocale (`speakReadyOrder()`) lors du passage à `READY`.
- **Rétention 45s** : Maintien temporaire des commandes récemment remises (`SERVED`) pour éviter la disparition brutale sous les yeux du client.

### 14.4 — Caisse Focus 2.0 & Vente Directe Terrain
- **Bouton « + Vente Directe »** : Mis en avant en émeraude plein contrasté (`bg-emerald-600 text-white shadow-sm font-semibold hover:bg-emerald-500`) avec pastille dynamique du nombre d'articles.
- **Calcul Automatique de Monnaie (Espèces)** : Champ tactile obligatoire, raccourcis billets FCFA (1 000, 2 000, 5 000, 10 000 FCFA), affichage XXL de la monnaie à rendre en vert, et verrouillage strict du bouton d'encaissement tant que le montant reçu est inférieur au total.
- **Modale de Confirmation de Succès** : Déclenchée après validation avec badge `CheckCircle2` géant, total FCFA, rendu monnaie, et les 3 actions rapides : Imprimer Ticket, WhatsApp, Nouvelle Vente.
- **WhatsApp 1-Clic** : Détection du téléphone client (+221...) et génération automatique du ticket numérique prêt à l'envoi.

### 14.5 — ERP Matériel & Facturation Découplée
- **Double Flux de Facturation** : Facture unique `SETUP` pour le matériel physique (supports bois/acrylique, marine vernis, gravure anti-vol, kits SAV) et Facture mensuelle `RECURRING` pour l'abonnement SaaS (7 packs).
- **Parrainage B2B** : Crédit de 5 supports offerts déduits du stock physique mais facturés 0 FCFA au parrain.

---

## Section 15 — Architecture PRA Multi-Tenant & Le Sanctuaire Financier Inviolable (RTO < 5 min)

Cette section consacre les règles opérationnelles et techniques de sauvegarde et de reprise d'activité d'urgence pour tout établissement hébergé sur Lou Ame Tay ? :

### 15.1 — Interdiction Absolue de Restauration Globale en Multi-Tenant
- En cas de sinistre sur un seul restaurant, il est **formellement interdit** de restaurer la base de données PostgreSQL globale (backup Supabase ou dump cluster). Une telle action effacerait instantanément toutes les ventes et encaissements des autres établissements abonnés.
- Toute opération de sauvegarde ou de restauration doit être **granulaire au niveau du tenant** (`TenantSnapshot`).

### 15.2 — Le Principe Inviolable du Sanctuaire Financier
- Une restauration technique (modes `MENU_CATALOG` ou `FULL_CONFIG`) ne supprime, ne modifie et n'écrase **JAMAIS** les flux financiers enregistrés (`cash_sessions`, `orders`, `order_items`, `payment_transactions`, et clôtures Z).
- Si l'Hôtel Lat-Dior subit une perte de menu à 14h30 et restaure l'état de 03h00 du matin alors qu'il a encaissé 17 000 FCFA dans la matinée :
  - La carte des plats, les prix et les tables sont rétablis à l'identique.
  - **Les 17 000 FCFA encaissés restent 100% gravés en base**, la session de caisse en cours reste active avec son fond exact, et la clôture Z du soir est juste au centime près.
- **Découplage de `OrderItem`** : Chaque ligne de commande conserve gravé son nom et son prix unitaire en FCFA au moment de la vente.
- **Verrou Transactionnel PostgreSQL ACID Obligatoire** : Si le nombre de commandes (total ou payées) après restauration est inférieur à l'ancrage du snapshot (`financialAnchor`), la transaction `$transaction` déclenche un rollback immédiat et annule toute l'opération.

### 15.3 — Outils d'Intervention d'Urgence Développeur DAW
- **En Ligne de Commande (CLI)** :
  - `npm run tenant:backup -- --tenant=[subdomain]`
  - `npm run tenant:restore -- --tenant=[subdomain] --mode=menu_catalog`
- **Dans la Console DAW (`/super-admin#sauvegardes-pra`)** :
  - Onglet **`🛡️ Sauvegardes & PRA`** permettant de générer un snapshot, de télécharger le JSON d'archive, ou de restaurer l'établissement en moins de 30 secondes sous validation du mot de passe Super-Admin.

---

## Section 16 — Résilience Serverless Vercel ↔ Supabase (Transaction Pooler 6543) & Sécurité Isomorphique

### 16.1 — Redirection Obligatoire vers le Transaction Pooler 6543
- Les lambdas serverless Vercel ne doivent jamais se connecter directement à l'hôte IPv6 `db.[ref].supabase.co:5432` sous peine d'erreurs `Can't reach database server`.
- Dans `src/lib/prisma.ts`, forcer systématiquement la redirection vers le Supabase Transaction Pooler port **6543** (`aws-0-eu-central-1.pooler.supabase.com:6543`) avec `pgbouncer=true`, `sslmode=require`, `connection_limit=10` et `pool_timeout=20`.

### 16.2 — Sécurité Isomorphique des Mots de Passe & PIN
- Ne jamais importer le module Node.js `crypto` (`crypto.randomInt`) dans un composant React Client. Utiliser la bibliothèque isomorphique [`src/lib/password-policy.ts`](file:///C:/Users/DELL/Desktop/Lou%20ame%20Tay%20menu%20digital%20Mda%20arts%20work/src/lib/password-policy.ts) s'appuyant sur `window.crypto.getRandomValues()` dans le navigateur et sur `crypto.randomBytes()` côté serveur.
- Rejet strict des mots de passe et PIN triviaux (`Pass1234!`, `admin`, `password`, `1234`, `0000`, etc.) et des suites consécutives pour tous les rôles.
- Remise sécurisée de PIN caissier : affichage unique en clair pour transmission au caissier, puis hashage bcrypt immédiat en base.


