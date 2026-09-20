# SKILL — Intégrité Financière & Détection Automatique des Failles Comptables
# Lou Ame Tay ? — Compétence Maîtresse Permanente

Cette compétence se déclenche AUTOMATIQUEMENT à chaque fois qu'une fonctionnalité nouvelle ou modifiée
touche à un statut de commande, un calcul financier, une action caisse, ou une route API liée à
l'argent. Elle ne doit jamais être désactivée, même si la demande semble simple ou sans lien direct
avec la comptabilité.

---

## PRINCIPE FONDATEUR — La Question Maîtresse

Avant d'implémenter TOUTE fonctionnalité touchant les commandes ou l'argent, poser obligatoirement
cette question :

> "Est-ce que cette nouvelle fonctionnalité introduit un nouvel état de commande, une nouvelle action,
> ou un nouveau chemin de code qui pourrait faire apparaître une commande dans un calcul financier
> (caisse du jour, clôture Z, total encaissé, rapport de ventes) alors qu'elle ne devrait pas y être ?"

Si la réponse est "oui" ou "peut-être" : **bloquer l'implémentation** et poser les verrous financiers
en premier, avant tout développement de la fonctionnalité elle-même.

---

## LES 5 CHEMINS FINANCIERS À AUDITER SYSTÉMATIQUEMENT

Chaque nouveau statut ou action doit être vérifié contre ces 5 points d'entrée financière :

### 1. Calcul du Chiffre d'Affaires en Direct (CashierPOS.tsx)
```
Chercher : filter((o) => o.paymentStatus === 'PAID')
Risque : si le filtre ne vérifie pas aussi status !== 'CANCELLED' (ou tout autre
nouveau statut non-commercial), une commande annulée/remboursée/erronée peut gonfler
le CA affiché en temps réel.
Verrou à poser : .filter((o) => o.paymentStatus === 'PAID' && o.status !== 'CANCELLED')
```

### 2. Clôture Z et Rapport de Session (api/cashier/session/route.ts)
```
Chercher : where { paymentStatus: 'PAID', OR: [...] }
Risque : la clause OR peut contenir une branche sans filtre sur status,
permettant à des commandes non-commerciales d'entrer dans le calcul.
Verrou à poser : status: { not: 'CANCELLED' } au niveau RACINE du where,
pas seulement dans une branche du OR.
```

### 3. Route d'Encaissement (api/cashier/orders/[id]/pay/route.ts)
```
Chercher : prisma.order.findUnique + update vers paymentStatus: 'PAID'
Risque : si la route ne vérifie pas le statut actuel de la commande,
un caissier peut encaisser une commande déjà annulée/remboursée, créant
un paiement fantôme sans plat réel.
Verrou à poser : vérification explicite que order.status n'est pas CANCELLED
(ou tout statut qui rend l'encaissement illégitime) avant toute mise à jour.
```

### 4. Historique et Export CSV Cuisine (api/kitchen/history/route.ts)
```
Chercher : findMany sur les commandes du jour
Risque : des commandes annulées peuvent apparaître dans les exports
et fausser les analyses de performance ou de stock.
Verrou à poser : where: { status: { not: 'CANCELLED' } } sur les requêtes
d'historique opérationnel (sauf si l'historique a une vue "toutes commandes
y compris annulées" explicitement séparée).
```

### 5. Statistiques et Tableaux de Bord (api/stats ou équivalent)
```
Chercher : agrégations SUM, COUNT, AVG sur les commandes
Risque : les statistiques de vente, ticket moyen, plats les plus commandés
peuvent être faussées si les commandes non-commerciales (annulées,
tests, doublons) sont incluses dans les calculs.
Verrou à poser : exclusion systématique des statuts non-commerciaux
(CANCELLED, TEST, DUPLICATE si ces statuts existent) de toutes les
agrégations financières.
```

---

## MATRICE D'AUDIT — À APPLIQUER À CHAQUE NOUVEAU STATUT OU ACTION

Quand une nouvelle fonctionnalité introduit un nouveau statut de commande (exemple : CANCELLED,
REFUNDED, ON_HOLD, PARTIAL, etc.) ou une nouvelle action (annulation, remboursement, modification
de commande en cours), remplir cette matrice AVANT de coder :

| Point de contrôle | Ce statut peut-il y apparaître ? | Verrou nécessaire ? |
|---|---|---|
| Caisse du jour (CashierPOS) | ? | ? |
| Clôture Z (session/route.ts) | ? | ? |
| Route d'encaissement (pay/route) | ? | ? |
| Historique cuisine (kitchen/history) | ? | ? |
| Statistiques (stats/route) | ? | ? |
| Écran TV retrait (/pickup) | ? | ? |
| Ticket numérique client | ? | ? |

Règle : si une seule case est "oui" sans verrou posé → bloquer l'implémentation.

---

## SCÉNARIOS DE COLLISION À TESTER OBLIGATOIREMENT

Ces scénarios doivent être testés manuellement pour chaque nouvelle fonctionnalité financière :

### Scénario de Collision 1 — Action simultanée client + caissier
```
Client annule sa commande AU MÊME MOMENT où le caissier clique "Encaisser".
Résultat attendu : l'un des deux doit gagner de façon déterministe,
avec un message d'erreur clair pour l'autre. Jamais un état incohérent en base.
```

### Scénario de Collision 2 — Rechargement de page pendant une action financière
```
Le caissier recharge sa page au moment exact de la clôture Z.
Résultat attendu : la clôture n'est ni dupliquée ni perdue.
```

### Scénario de Collision 3 — Nouveau statut dans un calcul existant
```
Une commande passe dans un nouveau statut (ex: CANCELLED) pendant
qu'un calcul de clôture Z est en cours.
Résultat attendu : le calcul exclut proprement ce nouveau statut,
même s'il a changé pendant la requête.
```

### Scénario de Collision 4 — Paiement mobile initié avant annulation
```
Un client choisit "Payer par Wave" et initie le paiement,
puis annule la commande avant confirmation.
Résultat attendu : la commande reste CANCELLED en base,
le webhook de confirmation Wave/OM ne doit pas la réactiver.
```

---

## RÈGLES DE NOMMAGE DES STATUTS (Standards Lou Ame Tay)

Pour éviter toute ambiguïté dans les filtres financiers, respecter ces conventions :

| Statut | Signification | Inclus dans CA ? | Inclus en clôture Z ? |
|---|---|---|---|
| PENDING | Commande reçue, en attente cuisine | Non | Non |
| PREPARING | En cours de préparation | Non | Non |
| READY | Prête, en attente retrait/service | Non | Non |
| SERVED | Servie à table, en attente paiement | Non | Non |
| PAID | Payée et encaissée | Oui | Oui |
| CANCELLED | Annulée par le client (dans fenêtre) | Non | Non |
| REFUNDED | Remboursée après paiement | Non (à déduire) | Ligne séparée |

Tout nouveau statut doit être ajouté à ce tableau AVANT d'être implémenté,
avec une décision explicite sur son inclusion ou exclusion des calculs financiers.

---

## PROMPT STANDARD À UTILISER POUR TOUT AUDIT FINANCIER

Quand tu soumets une nouvelle fonctionnalité à Antigravity, inclure systématiquement ce bloc :

```
AUDIT FINANCIER OBLIGATOIRE AVANT IMPLÉMENTATION :

Avant de coder, réponds à cette matrice pour chaque nouveau statut ou action introduit :

1. Ce nouveau statut/action peut-il faire apparaître une commande dans le calcul
   du CA en direct (CashierPOS) alors qu'elle ne devrait pas y être ?
2. Peut-il faire apparaître une commande dans la clôture Z (session/route.ts)
   de façon illégitime, notamment via une branche OR sans filtre sur status ?
3. La route d'encaissement (pay/route.ts) vérifie-t-elle ce nouveau statut
   avant d'autoriser un paiement ?
4. Les statistiques et exports CSV seront-ils faussés par ce nouveau statut ?
5. Existe-t-il un scénario de collision où une action simultanée (client +
   caissier au même moment) pourrait créer un état financier incohérent ?

Si une seule réponse est "oui" ou "peut-être" : pose les verrous financiers
AVANT d'implémenter la fonctionnalité. Montre-moi les verrous proposés
et je valide avant que tu continues.
```

---

## HISTORIQUE DES FAILLES DÉTECTÉES ET CORRIGÉES

*(À mettre à jour à chaque nouvelle faille trouvée)*

| Date | Faille | Origine | Verrou appliqué |
|---|---|---|---|
| Sept 2026 | status SERVED → paymentStatus PAID automatique sans action caissier | cashier/page.tsx ligne handleUpdateStatus | Découplage strict des deux statuts |
| Sept 2026 | Pool de connexions saturé (port 5432, session mode, limit=3) | prisma.ts + .env | Migration port 6543, transaction mode, limit=10 |
| Sept 2026 | Fallback pack 'tambali' sur KDS quand API lente | KitchenKDSView.tsx | Server Component + initialPlanSlug injecté côté serveur |
| Sept 2026 | Commande CANCELLED potentiellement dans clôture Z via branche OR sans filtre status | session/route.ts | status: { not: 'CANCELLED' } au niveau racine du where |
| Sept 2026 | Commande CANCELLED encaissable par la caisse (collision client/caissier) | pay/route.ts | Vérification order.status !== 'CANCELLED' avant update |
| Sept 2026 | Commande CANCELLED dans CA en direct CashierPOS | CashierPOS.tsx totalRevenue | Filtre status !== 'CANCELLED' ajouté au useMemo |
