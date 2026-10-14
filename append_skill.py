with open(r'C:\Users\DELL\.gemini\config\skills\louametay-saas-master-guide\SKILL.md', 'a', encoding='utf-8') as f:
    f.write("""

## 🍽️ 15. Super-POS Tactile, Ticket de Suite & Sécurité (Architecture Phase 2 & 3)

### A. L'Architecture Dual-POS & Le Moteur de Stock Atomique
- **Interface Dual-POS** : Le composant `CashierPOS` propose deux modes fluides :
  1. *Commandes (QR / Table)* : Affichage des tickets générés par les clients ou les serveurs.
  2. *Nouveau Ticket (Comptoir / Sur Place)* : Un Super-POS tactile (`TactileGrid`) permettant à la caissière de taper une commande en direct avec recherche visuelle.
- **Moteur de Stock Atomique (Temps Réel)** : 
  - La validation d'un encaissement au comptoir décrémente instantanément la quantité (`currentStock`) du `MenuItem` concerné via une transaction Prisma stricte (`$transaction`).
  - Chaque vente, réapprovisionnement ou perte génère une trace d'audit immuable (`StockMovement`), empêchant la fraude interne (zéro stock fantôme).

### B. Le "Ticket de Suite" & Manger sur Place
- **Le problème en restauration** : Ajouter un article à un ticket déjà imprimé en cuisine provoque des erreurs (oubli, redondance).
- **La solution Lou Ame Tay** : Le mode *Sur Place* permet à la caissière de créer un nouveau ticket pour la Table existante, et de cliquer sur *Envoyer Cuisine (À payer)*.
- **Détails Techniques** : La commande est créée avec `status: 'PENDING'` (la cuisine le voit instantanément comme une nouvelle préparation) et `paymentStatus: 'UNPAID'` (la caissière ne l'a pas encore encaissé). Le système fusionnera naturellement ces tickets au moment du paiement de la table.

### C. Sécurité Professionnelle de Connexion
- **Protection Caissier (Anti-Brute Force)** : Le système de Code PIN à 4 chiffres (très rapide en plein rush) est protégé par `failedPinAttempts` et `lockedUntil`. Après 5 échecs, la caisse se bloque.
- **Gérant (Préparation TOTP 2FA)** : Le modèle de base de données intègre `isTwoFactorEnabled` et `twoFactorSecret` pour permettre au gérant d'utiliser Google Authenticator (Double Facteur) et protéger l'accès à ses données financières, comme sur les standards mondiaux du SaaS B2B.
""")
