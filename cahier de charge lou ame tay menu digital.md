# CAHIER DES CHARGES - "Lou Ame Tay? 🍽️"

**Version :** MVP (Produit Minimum Viable)  
**Date :** 2026  
**Auteur :** Agence Digitale (Expertise Thiès/Mbour - 15 ans de restauration)

---

## 1. IDENTITÉ DU PROJET

**Nom commercial :** Lou Ame Tay?  
**Tagline :** *"Le lien entre votre smartphone et votre assiette."*  
**Valeur ajoutée :** Je ne vends pas un QR Code, je vends la fin des erreurs de service et la gestion simplifiée pour les restaurateurs sénégalais.

---

## 2. PROBLÉMATIQUE MÉTIER (Pourquoi ce projet ?)

- **Constats terrain :** Les serveurs se trompent de tables, l'attente au comptoir est longue, et les menus papier sont déchirés ou obsolètes (prix périmés).
- **La solution :** Chaque table possède son propre QR Code. Le client commande lui-même, la commande arrive directement à la cuisine/au comptoir avec le **numéro de table**. 
- **Cible :** Restaurants, fast-foods, maquis et hôtels de Thiès, Mbour et Dakar.

---

## 3. ACTEURS & PERMISSIONS

| Acteur | Rôle | Interface |
| :--- | :--- | :--- |
| **Super Admin (Agence)** | Gérer tous les restaurants, voir les abonnements, aider les clients. | Back-office secret (ex: `/admin`). |
| **Restaurateur (Client)** | Gérer SON menu (plats, prix, disponibilité), générer SES QR codes. | Dashboard sécurisé (ex: `/dashboard`). |
| **Client (Mangeur)** | Scanner, voir le menu, passer commande. **Sans création de compte.** | Page publique (ex: `/menu/[restaurant]/[table]`). |

---

## 4. SPÉCIFICATIONS FONCTIONNELLES (LE MVP)

### 4.1. Gestion des QR Codes (La clé du succès)
- Le système génère des QR codes **UNIQUES PAR TABLE**.
- **Lien dynamique :** `louverte.com/r/[restaurant_id]/table-[numero]`.
- *Action Agence :* Le restaurateur imprime les QR codes (format A5/Plastifié) et les dépose sur ses tables.

### 4.2. Expérience Client (Celui qui scanne)
- **Étape 1 :** Le client scanne. Le menu s'ouvre en 2 secondes max (responsive mobile).
- **Étape 2 :** Affichage des plats par catégorie (Entrées, Plats, Desserts, Boissons). Chaque plat montre : Photo, Nom, Prix, Allergènes (icônes).
- **Étape 3 :** Panier. Le client clique sur `+` ou `-` pour ajouter/retirer des plats. Total mis à jour en temps réel.
- **Étape 4 :** Transmission. Un **gros bouton VERT** "Transmettre ma commande" valide l'envoi.

### 4.3. Vue Comptoir / Cuisine (Réception des commandes)
- **Écran dédié :** Un vieux smartphone ou tablette posé en cuisine.
- **Notification :** Arrivée d'une commande avec un *"BIP"* sonore et un encart orange.
- **Affichage impératif :** 
  - *"NOUVELLE COMMANDE - TABLE 5"* (en gros).
  - Liste des plats commandés.
  - Heure d'envoi.
- **Action Cuisinier :** Bouton **"Commande servie"** pour faire disparaître la commande de l'écran.

---

## 5. STACK TECHNIQUE (POUR ANTIGRAVITY)

Je suis un "Vibe Coder" sur **Antigravity**. Je veux du code moderne, propre et facile à maintenir.

| Composant | Technologie choisie | Justification |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) + TypeScript | Structure claire, rendu rapide, API intégrées. |
| **UI / Design** | Tailwind CSS + Shadcn/ui | Composants prêts à l'emploi, design épuré. |
| **Base de Données** | PostgreSQL (via Supabase) | Le temps réel (Realtime) de Supabase est PARFAIT pour le comptoir. |
| **ORM** | Prisma | Pour gérer la BDD simplement en TypeScript. |
| **État du Panier** | Zustand | Plus léger que Redux, idéal pour le panier du client. |

---

## 6. SCHÉMA DE BASE DE DONNÉES (Prisma)

Voici le fichier `schema.prisma` que je veux que vous génériez :

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Restaurant {
  id          String   @id @default(cuid())
  name        String   // Nom du resto (ex: Chez Fatou)
  subdomain   String   @unique // sous-domaine unique (ex: chezfatou)
  phone       String?
  address     String?
  tables      Table[]
  categories  Category[]
  orders      Order[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Table {
  id          String   @id @default(cuid())
  number      Int      // Numéro physique (1, 2, 3...)
  qrCodeUrl   String?  // On stockera le lien généré
  restaurantId String
  restaurant  Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  orders      Order[]
  createdAt   DateTime @default(now())
}

model Category {
  id          String   @id @default(cuid())
  name        String   // "Entrées", "Grillades", "Boissons"
  displayOrder Int     @default(0) // Pour trier l'affichage
  restaurantId String
  restaurant  Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  items       MenuItem[]
  createdAt   DateTime @default(now())
}

model MenuItem {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Float
  imageUrl    String?  // Lien vers l'image hébergée
  isAvailable Boolean  @default(true) // Le bouton "Rupture" !
  allergens   String[] // Liste des allergènes (Gluten, Lait, etc.)
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  orders      OrderItem[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Order {
  id          String   @id @default(cuid())
  tableNumber Int      // On stocke le numéro pour l'affichage rapide
  restaurantId String
  restaurant  Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  table       Table?   @relation(fields: [tableId], references: [id])
  tableId     String?
  items       OrderItem[] // Les plats commandés
  status      Status   @default(PENDING) // PENDING, SERVED
  total       Float
  createdAt   DateTime @default(now())
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItemId  String
  menuItem    MenuItem @relation(fields: [menuItemId], references: [id])
  quantity    Int      @default(1)
  price       Float    // Prix au moment de la commande
}

enum Status {
  PENDING
  SERVED
}