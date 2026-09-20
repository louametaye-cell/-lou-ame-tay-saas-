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

