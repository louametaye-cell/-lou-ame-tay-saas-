# 🍽️ Lou Ame Tay ? - Menu Digital & Prise de Commande par QR Code

> **"Le lien entre votre smartphone et votre assiette."**  
> *Fin des erreurs de service et gestion simplifiée pour les restaurants, fast-foods et maquis sénégalais.*

---

## 🌟 Présentation du Projet

**Lou Ame Tay ?** est une solution complète de menu digital par QR code conçue pour le marché de la restauration en Afrique de l'Ouest (Sénégal : Thiès, Mbour, Dakar, Saly, etc.).

### Problématiques résolues :
- **Zéro erreur de service :** Chaque commande est rattachée physiquement à son **numéro de table** via son QR code unique.
- **Zéro friction pour le client :** Accès instantané au menu en `< 2 secondes`, **sans création de compte** ni téléchargement d'application.
- **Gestion des ruptures en temps réel :** Le restaurateur peut marquer un plat en "Rupture" en 1 clic.
- **Écran cuisine / comptoir dédié :** Signal sonore ("BIP"), affichage grand format `NOUVELLE COMMANDE - TABLE X`, et bouton `Commande servie`.

---

## 🛠️ Stack Technique

- **Framework :** Next.js 14 (App Router) + TypeScript
- **UI / Styling :** Tailwind CSS + Lucide Icons + animations dynamiques
- **Gestion de la Base de Données :** PostgreSQL via **Prisma ORM** + Supabase Realtime
- **Panier Client :** Zustand avec persistance `localStorage`
- **Génération QR Code :** `qrcode.react` (formats chevalets A5 prêts à imprimer)
- **Notifications & Effets :** Sonner Toaster, Audio Web API Chimes, Canvas Confetti

---

## 📁 Architecture des Fichiers

```
lou-ame-tay/
├── prisma/
│   ├── schema.prisma         # Schéma PostgreSQL (Restaurant, Table, Category, MenuItem, Order, OrderItem)
│   └── seed.mjs              # Script d'initialisation avec spécialités sénégalaises
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── orders/       # API Création et récupération des commandes
│   │   │   │   └── [orderId]/ # Mise à jour de statut (Servie / En préparation)
│   │   │   └── menu/         # API Menu et gestion de la rupture de stock
│   │   ├── r/
│   │   │   └── [subdomain]/
│   │   │       └── table-[tableNumber]/ # Page client dynamique par QR code
│   │   ├── menu/[subdomain]/[tableNumber]/ # Route alternative de consultation
│   │   ├── kitchen/          # Écran Cuisine & Comptoir (BIP Sonore + Direct)
│   │   ├── dashboard/        # Espace Restaurateur (Gestion du menu & QR codes A5)
│   │   ├── page.tsx          # Page d'accueil & Simulateur de table
│   │   ├── layout.tsx        # Layout racine et configurations PWA
│   │   └── globals.css       # Thème et animations Tailwind
│   ├── components/
│   │   ├── Header.tsx        # Bandeau Lou Ame Tay, numéro de table, recherche et filtres
│   │   ├── CategoryNav.tsx   # Barre de défilement des catégories
│   │   ├── MenuCard.tsx      # Carte de plat avec prix FCFA, allergènes et bouton +/-
│   │   ├── DishModal.tsx     # Modale détails du plat et instructions pour le chef
│   │   ├── FloatingCartBar.tsx # Barre flottante mobile avec total en direct
│   │   ├── CartDrawer.tsx    # Tiroir panier avec le Gros Bouton Vert de transmission
│   │   ├── OrderSuccessModal.tsx # Confirmation, sonnerie, confettis et suivi de commande
│   │   ├── CallWaiterModal.tsx   # Appel serveur, addition, eau
│   │   └── ClientMenuView.tsx    # Vue intégrée pour le client
│   ├── lib/
│   │   ├── prisma.ts         # Singleton client Prisma
│   │   ├── store.ts          # Store panier Zustand
│   │   ├── sample-data.ts    # Données des spécialités sénégalaises
│   │   ├── order-storage.ts  # Gestionnaire de commandes en mémoire & persistance
│   │   └── utils.ts          # Formatage FCFA et synthèse sonore du BIP
│   └── types/
│       └── index.ts          # Interfaces TypeScript
├── .env.example              # Exemple de configuration Supabase & DB
├── package.json
└── tailwind.config.ts
```

---

## 🚀 Démarrage Rapide

### 1. Installation des dépendances
```bash
npm install
```

### 2. Générer le client Prisma
```bash
npx prisma generate
```

### 3. Lancer le serveur de développement
```bash
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📱 Parcours et Fonctionnalités Clés

1. **Page d'accueil & Simulateur :** `http://localhost:3000/`
2. **Menu Client (Table 04) :** `http://localhost:3000/r/chezfatou/table-4`
3. **Écran Cuisine / Comptoir :** `http://localhost:3000/kitchen`
4. **Tableau de Bord Restaurateur :** `http://localhost:3000/dashboard`

---

## 🥘 Spécialités Incluses au Menu

- **⭐ Lou Ame Tay ? (Plats du Jour) :**
  - *Ceebu Jën Pëndaa Mbaye* (Thiéboudienne Rouge au mérou blanc)
  - *Yassa Poulet Fermier Braisé* au citron vert de Casamance
  - *Dibi d'Agneau façon Thiès* grillé au feu de bois
  - *Mafé Kandja au Bœuf fondant*
- **🥟 Entrées & Tapas :** Pastels au thon, Nems croustillants, Fataya épicée
- **🥤 Boissons & Jus Locaux :** Jus de Bissap rouge à la menthe, Jus de Bouye (Pain de singe), Gnamankoudji au gingembre
- **🍰 Desserts :** Thiakry / Dégué gourmand au yaourt, Salade de fruits de Casamance.
