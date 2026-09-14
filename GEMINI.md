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
