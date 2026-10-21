# 🛡️ CHECKLIST OFFICIELLE AVANT DÉPLOIEMENT EN PRODUCTION
**Lou Ame Tay ? 🇸🇳🍽️ — DAW Digital Arts Work by MG**  
*Version : 2.5 — Police d'Assurance Qualité & Anti-Régression*

---

> ### ⚠️ RÈGLE D'OR ABSOLUE
> **Aucun commit ne peut être déployé sur la branche `main` sans avoir validé et coché les 10 vérifications manuelles ci-dessous.**  
> Une seule case non cochée = **DÉPLOIEMENT BLOQUÉ**.

---

## 📋 LES 10 VÉRIFICATIONS MANUELLES OBLIGATOIRES

### 1. □ Test Connexion Caisse sous PIN Individuel
- **Action :** Ouvrir `/cashier?restaurantId=[slug]` et entrer le code PIN du caissier.
- **Résultat attendu :** 
  - Connexion immédiate avec nom du caissier affiché dans l'en-tête.
  - Rejet formel des faux PIN ou des PIN appartenant à un autre restaurant (erreur 401/403).
  - Présence du fond de caisse initial de la session.

---

### 2. □ Test Création Vente Directe Comptoir (Takeaway)
- **Action :** Depuis la caisse, cliquer sur **« + Vente Directe »**, ajouter 1 plat et 1 boisson, choisir "À emporter".
- **Résultat attendu :**
  - La commande est enregistrée avec `orderType: 'TAKEAWAY'` et `tableNumber: 0`.
  - Elle apparaît **instantanément dans l'onglet "Ventes Comptoir"** avec son total en FCFA XXL et le bouton vert tactile **« Encaisser »**.
  - Elle n'apparaît **PAS** dans l'onglet "Ventes sur Table".

---

### 3. □ Test Prise de Commande sur Table & Occupation
- **Action :** Scanner le QR code d'une table (ex: Table 2) ou créer une commande table depuis la caisse.
- **Résultat attendu :**
  - La commande est enregistrée avec `orderType: 'TABLE'` et le vrai numéro de table.
  - La table physique passe immédiatement au statut **`OCCUPIED`** (carte ambrée/orange en caisse).

---

### 4. □ Test Réception KDS Cuisine & Sanctuaire de la Table
- **Action :** Ouvrir l'écran `/kitchen?restaurantId=[slug]`. Passer la commande de la Table 2 à "En Préparation" puis à "Prête".
- **Résultat attendu :**
  - Carillon sonore émis en cuisine à la réception du ticket.
  - **VERROU INVIOLABLE :** La Table 2 **RESTE OCCUPÉE** sur l'écran Caisse avec la pastille `🟢 Prêt à encaisser`.
  - **LE KDS NE DOIT JAMAIS LIBÉRER LA TABLE.**

---

### 5. □ Test Encaissement Caisse & Libération Unique de la Table
- **Action :** Dans l'espace Caisse, cliquer sur "Encaisser" pour la Table 2, choisir le moyen de paiement et valider.
- **Résultat attendu :**
  - La commande passe en `paymentStatus: 'PAID'`.
  - La table repasse en statut **`FREE`** (vert) **UNIQUEMENT APRÈS** cette validation caisse.
  - Impression du ticket de caisse ou modale WhatsApp 1-clic prête.

---

### 6. □ Test Calcul Automatique de Rendu de Monnaie (Espèces)
- **Action :** Sur une vente de 7 500 FCFA, saisir 10 000 FCFA reçus (ou cliquer sur le raccourci billet 10 000).
- **Résultat attendu :**
  - Affichage instantané en vert XXL de la monnaie à rendre : **2 500 FCFA**.
  - Le bouton "Valider l'encaissement" est **verrouillé** si le montant reçu est inférieur au total.

---

### 7. □ Test Synchronisation Temps Réel (< 3 secondes)
- **Action :** Créer une commande depuis un smartphone ou un onglet client sans toucher à l'écran caisse.
- **Résultat attendu :**
  - L'écran caisse détecte la nouvelle commande en **moins de 3 secondes** via Supabase Realtime (avec secours polling 5s).
  - Émission automatique du bip sonore caisse sans avoir à rafraîchir manuellement la page (F5).

---

### 8. □ Test Routage Multi-Stations (Kitchen vs Bar)
- **Action :** Commander simultanément un plat chaud (ex: Thiéboudienne) et une boisson fraîche (ex: Jus de Bissap).
- **Résultat attendu :**
  - Le plat chaud apparaît sur `/kitchen` (Cuisine).
  - La boisson apparaît sur `/bar` (ou dans la section Comptoir Boissons de la caisse).
  - Aucune collision entre les deux postes.

---

### 9. □ Test Écran Retrait TV Guichet (`/pickup`)
- **Action :** Observer l'écran TV `/pickup/[slug]` pendant la préparation et la finalisation de la commande.
- **Résultat attendu :**
  - La commande s'affiche en grand dans la colonne bleue **"EN PRÉPARATION"**.
  - Lors du passage à "Prêt", elle bascule dans la colonne verte **"PRÊT À RETIRER"** avec le carillon audio Ding-Dong à 2 tons.
  - Maintien temporaire de 45 secondes après remise client.

---

### 10. □ Test Clôture Z & Intégrité Financière
- **Action :** Ouvrir `/dashboard/cash-closures` ou cliquer sur "Clôturer la Caisse" en fin de service.
- **Résultat attendu :**
  - Saisie du montant réel en caisse à l'aveugle.
  - Calcul automatique des écarts (caisse juste = vert, déficit = rouge).
  - **Exclusion absolue à 100%** de toute commande annulée (`status: 'CANCELLED'`) des totaux de vente.

---

## 🚀 COMMANDES DE PRÉ-VOL AUTOMATISÉES (OBLIGATOIRES)

Avant de lancer le déploiement sur Vercel, exécuter dans le terminal :

```bash
# 1. Vérification TypeScript stricte (0 erreur tolérée)
npx tsc --noEmit

# 2. Exécution des 10 tests critiques anti-régression
npm run test:critical

# 3. Sauvegarde de sécurité de la base de données
npm run db:backup

# 4. Compilation de production
npm run build
```

---

## 🎯 MATRICE DE VÉRIFICATION SUR LES 4 COMPTES RÉELS

Effectuer un contrôle visuel rapide sur les 4 établissements actifs :

| Établissement | Caisse (`/cashier`) | KDS (`/kitchen`) | Dashboard (`/dashboard`) | Statut |
| :--- | :---: | :---: | :---: | :---: |
| **Madiba Restaurant** | [ ] 200 OK | [ ] 200 OK | [ ] 200 OK | Validé [ ] |
| **Anima Pizzeria** | [ ] 200 OK | [ ] 200 OK | [ ] 200 OK | Validé [ ] |
| **Sam's Prestige** | [ ] 200 OK | [ ] 200 OK | [ ] 200 OK | Validé [ ] |
| **Hôtel Lat-Dior Thiès** | [ ] 200 OK | [ ] 200 OK | [ ] 200 OK | Validé [ ] |

---

## 🆘 PROCÉDURE DE SECOURS RAPIDE (ROLLBACK)

En cas d'échec sur l'une des vérifications en production :
1. `git log -n 5 --oneline` (repérer le hash stable précédent).
2. `git reset --hard [HASH_STABLE] && git push origin main --force`.
3. `npx vercel --prod --yes`.
4. Si problème de données sur un établissement : `npm run tenant:restore -- --tenant=[slug] --mode=menu_catalog`.

---
*Document produit par DAW Digital Arts Work — by MG*  
*Signature de développeur Vibe Coder*  
*Contact : contact@mgartswork.site | +221 77 458 74 74*
