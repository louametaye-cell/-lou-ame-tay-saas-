# 🇸🇳 ACTE OFFICIEL & PROTOCOLE DE CESSION INTÉGRALE DE LA PLATEFORME SAAS « LOU AME TAY ? »
### Contrat de Cession de Propriété Intellectuelle, Droits Patrimoniaux, Code Source & Actifs Numériques
*Conforme au Code des Obligations Civiles et Commerciales du Sénégal (COCC), aux Lois n° 2008-08 et 2008-12, ainsi qu'aux normes de l'OHADA.*  
*Version Logicielle Cédée : Lou Ame Tay ? V2.2 Stable*  
*Date d'Émission : 01 Octobre 2026*  

---

## ENTRE LES SOUSSIGNÉS :

### 1. LE CÉDANT :
**L'Agence DAW Digital Arts Work — by MG**, startup technologique de droit sénégalais,  
Ayant son siège social à : **Thiès, Sénégal — Quartier Fayou, Face Foot Salé (Siège Social)**,  
NINEA : **007845612** • RCCM : **SN-THS-2026-B-1234**,  
Représentée par son Fondateur, Directeur Général et Architecte Logiciel (MG),  
Téléphones officiels : **+221 77 458 74 74** / **+221 77 130 36 78**,  
Email professionnel : **contact@mgartswork.site**,  
Titulaire exclusif de la totalité des droits de propriété intellectuelle, codes sources, marques, algorithmes et actifs corporels et incorporels afférents à la solution logicielle « Lou Ame Tay ? ».

*Ci-après dénommée « **Le Cédant** », d'une part,*

### ET

### 2. LE CESSIONNAIRE :
La personne physique ou morale se portant acquéreur des droits de la solution logicielle, dûment identifiée dans les conditions particulières de cession :  
Nom / Raison Sociale : ____________________________________________________________________  
Forme Juridique & Registre (NINEA / RCCM) : _______________________________________________  
Adresse / Siège : _________________________________________________________________________  
Représentée par : _____________________________________, en qualité de : __________________  
Téléphone : _________________________________ • Email : __________________________________  

*Ci-après dénommé « **Le Cessionnaire** », d'autre part.*

---

## IL A PRÉALABLEMENT ÉTÉ EXPOSÉ CE QUI SUIT :

1. Le Cédant a conçu, développé, architecturé et déployé en production une solution SaaS B2B complète dénommée **« Lou Ame Tay ? »** (accessible en production sur `https://www.louametay.com` et en PWA/CRM sur `https://louametay.online`).
2. Cette solution répond de manière éprouvée aux défis d'exploitation du secteur de l'hôtellerie-restauration (CHR) en Afrique de l'Ouest (Sénégal : Thiès, Dakar, Petite Côte/Saly, Saint-Louis) et intègre :
   - Un menu digital interactif multi-tenant par QR Code sans contact.
   - Un système de commande à table avec routage instantané cuisine/bar.
   - Un écran de gestion des préparations Brigade Cuisine (KDS) avec alertes sonores synthétisées Web Audio.
   - Un écran public de retrait guichet (`/pickup`) pour salle et drive.
   - Un terminal caisse point de vente (POS) avec impression thermique 80mm ESC/POS et clôture de caisse Z à l'aveugle certifiée.
   - Un système de gestion commerciale et CRM terrain géolocalisé avec génération de contrats en direct.
   - Une étanchéité multi-tenant absolue (zéro donnée fantôme) et un cache Redis Upstash à invalidation chirurgicale par catégorie.
   - Une intégration native des moyens de paiement mobiles locaux (Wave, Orange Money) et multi-devises (FCFA, EUR, USD).
3. Le Cédant a consigné une archive complète et certifiée de sauvegarde cryptographique sous le hash SHA-256 : `B5AE6FF8CE60A394D7C2F56D95EF62C3CD68766EBE17F4927365363CBA4B41CE`.
4. Le Cessionnaire a examiné la plateforme, le code source, la documentation technique, le rapport d'audit et les résultats des tests d'assurance qualité (0 erreur TypeScript, 8/8 tests Vitest au vert) et a manifesté sa volonté d'acquérir la pleine et entière propriété exclusive de la plateforme.

---

## CECI EXPOSÉ, IL EST CONVENU CE QUI SUIT :

### ARTICLE 1 — OBJET DE LA CESSION
Le Cédant cède, abandonne et transporte au Cessionnaire, qui accepte, sous les garanties ordinaires de fait et de droit applicables en République du Sénégal et dans l'espace OHADA, la **pleine et entière propriété exclusive, perpétuelle, irrévocable et transférable** de la solution logicielle intitulée **« Lou Ame Tay ? » (Version V2.2 Stable)**.

### ARTICLE 2 — PÉRIMÈTRE EXHAUSTIF DES ACTIFS CÉDÉS
La présente cession emporte transfert immédiat et sans réserve des éléments suivants :

1. **Le Code Source Intégral & l'Historique Git** :
   - L'ensemble du code source écrit en TypeScript / React 18 / Next.js 14 App Router, incluant les composants front-end, les API Routes RESTful, les Server Actions et les Webhooks.
   - Le schéma relationnel de base de données PostgreSQL modélisé sous Prisma ORM (`prisma/schema.prisma`), ainsi que l'ensemble des scripts de seed et de migration (`prisma/seed.ts`, `prisma/seed.sql`, `prisma/purge_and_seed.sql`).
   - La suite de tests automatisés Vitest (`src/__tests__/unit.test.ts`), les scripts de contrôle anti-régression multi-tenant (`scripts/audit-multi-tenancy.js`) et les scripts d'automatisation QA Puppeteer/Playwright.
   - La configuration complète du cache distribué Redis Upstash avec invalidation granulaire par catégorie (`src/lib/redis.ts`, `src/lib/cache.ts`).
   - Le module de journalisation structurée et d'audit de latence (`src/lib/logger.ts`).

2. **Les Droits de Propriété Intellectuelle & Droits Patrimoniaux d'Auteur** :
   - Le droit exclusif de reproduction, de représentation, de diffusion, de distribution, d'adaptation, de traduction, de modification, d'enrichissement, de modularisation et de commercialisation du logiciel, sous toute forme, sur tout support et par tout procédé technique connu ou inconnu à ce jour.
   - L'intégralité des chartes graphiques, logotypes vectoriels (`SVG`, `AI`, `PDF`), maquettes d'écrans, schémas d'architecture et de flux métier créés par DAW Digital Arts Work — by MG.
   - Le droit de concéder des sous-licences, de commercialiser des abonnements SaaS sous forme de packs (Tàmbali, Nio Far, Xéweul, Baobab, Teranga, Buur, Ndajé) ou de revendre des instances dédiées sous marque blanche.

3. **Les Noms de Domaine & Actifs d'Infrastructure** :
   - Le transfert de pleine propriété et de gestion technique des noms de domaine officiels : `www.louametay.com`, `louametay.com` et `louametay.online`.
   - La cession des configurations des espaces d'hébergement Vercel (Edge Network), Supabase Cloud, Neon Database, Upstash Redis et passerelles associées.

4. **La Documentation Technique, Manuels & Savoir-Faire** :
   - Le Dossier Maître Officiel (`DOSSIER_MAITRE_OFFICIEL_LOU_AME_TAY.md`).
   - Les guides d'utilisation complets pour Super-Admin (Console DAW), Espace Gérant, Poste Caisse, Brigade Cuisine KDS et Retrait Guichet.
   - Les arguments commerciaux, scripts en langue Wolof et fiches d'inscription imprimables.
   - L'archive de sauvegarde de référence certifiée SHA-256 (`BACKUP_V2.1_STABLE_2026-10-01_05-15.zip`).

### ARTICLE 3 — PRIX DE LA CESSION & MODALITÉS DE RÈGLEMENT
La présente cession est consentie et acceptée moyennant le prix forfaitaire, net et définitif convenu entre les parties de :  
**Montant en chiffres :** _______________________________________ **FCFA**  
**Montant en lettres :** ________________________________________________________________ FCFA.

Le paiement s'effectuera selon les modalités suivantes conformes à la législation sénégalaise :
- Virement bancaire certifié sur compte bancaire professionnel ouvert au Sénégal.
- Chèque de banque certifié ou séquestre notarié.
- Tout versement d'acompte ou solde donnera lieu à l'émission immédiate d'une quittance de paiement acquittée par DAW Digital Arts Work — by MG.

### ARTICLE 4 — GARANTIE D'ÉVICTION, D'AUTEUR ET DE PAISIBLE JOUISSANCE
Le Cédant garantit formellement au Cessionnaire :
1. Qu'il est le créateur, architecte et développeur exclusif de la solution logicielle cédée, et qu'il détient tous les droits patrimoniaux lui permettant de contracter valablement.
2. Que le code source, la marque, les visuels et les composants logiciels sont libres de tout droit, privilège, nantissement, litige, gage, revendication salariale ou réclamation de tiers.
3. Que la plateforme n'intègre aucune bibliothèque tierce sous licence prohibitive incompatible avec l'exploitation commerciale propriétaire (toutes les dépendances utilisées sont sous licences libres de type MIT, Apache 2.0 ou BSD).
4. Le Cédant s'engage à garantir et indemniser le Cessionnaire contre tout trouble, éviction ou action en contrefaçon émanant d'un tiers.

### ARTICLE 5 — PÉRIODE DE TRANSITION, ACCOMPAGNEMENT & TRANSFERT DE COMPÉTENCES
Afin de garantir une exploitation fluide et sans rupture de service pour les restaurants clients, le Cédant s'engage à fournir un accompagnement technique d'une durée de **trente (30) jours calendaires** à compter de la signature des présentes, comprenant :
- La remise en main propre des accès maîtres, clés API, tokens de production et variables d'environnement.
- Une formation approfondie de l'équipe technique du Cessionnaire (3 sessions de 2 heures) sur l'architecture App Router, les schémas Prisma, les mécanismes d'invalidation Redis et les procédures de déploiement continu Vercel.
- Une assistance technique d'astreinte réactive sous 4 heures en cas de besoin opérationnel.

### ARTICLE 6 — ENGAGEMENT DE CONFIDENTIALITÉ & CLAUSE DE NON-CONCURRENCE
1. **Confidentialité** : Les parties s'engagent à préserver la confidentialité la plus absolue sur les secrets d'affaires, termes financiers du présent contrat, codes d'accès et méthodologies propriétaires échangées.
2. **Non-concurrence loyale** : Le Cédant s'interdit, pour une durée de vingt-quatre (24) mois à compter de la cession, de développer, commercialiser ou distribuer directement une plateforme concurrente de menu digital et caisse CHR au Sénégal sous la même identité de marque ou en exploitant les mêmes codes sources cédés.

### ARTICLE 7 — PROTECTION DES DONNÉES PERSONNELLES (LOI SÉNÉGALAISE N° 2008-12)
Le Cessionnaire reconnaît qu'à compter du transfert effectif des bases de données et des contrats clients, il assumera la qualité de Responsable de Traitement au sens de la Loi sénégalaise n° 2008-12 du 25 janvier 2008 sur la protection des données à caractère personnel.  
Il s'engage à déclarer et mettre en conformité les traitements de données auprès de la **Commission des Données Personnelles du Sénégal (CDP)**.

### ARTICLE 8 — LOI APPLICABLE & JURIDICTION COMPÉTENTE
Le présent contrat est exclusivement régi et interprété conformément au **droit en vigueur en République du Sénégal** et aux Actes Uniformes de l'**OHADA** (Organisation pour l'Harmonisation du Droit des Affaires en Afrique).  
Tout différend né de la validité, de l'interprétation, de l'exécution ou de la résiliation du présent contrat fera l'objet d'une tentative de conciliation amiable dans un délai de quinze (15) jours.  
À défaut d'accord amiable, compétence expresse et exclusive est attribuée au **Tribunal de Commerce Hors Classe de Dakar** ou au **Tribunal de Grande Instance de Thiès**, nonobstant pluralité de défendeurs ou appel en garantie.

---

### ARTICLE 9 — CLÔTURE & SIGNATURES

Fait à **Thiès**, République du Sénégal, le 01 Octobre 2026, en trois (3) exemplaires originaux revêtus de la même valeur juridique.

| POUR LE CÉDANT | POUR LE CESSIONNAIRE |
|---|---|
| **DAW Digital Arts Work — by MG** | **Le Cessionnaire Acquérant** |
| *Direction Générale & Auteur de la Plateforme* | *Représentant Légal / Direction* |
| **Mbaye Babacar GUEYE** | Nom : __________________________________ |
| Qualité : *CEO & Architecte Logiciel* | Qualité : _______________________________ |
| Siège : *Thiès, Quartier Fayou, Face Foot Salé* | Date : ____ / ____ / 2026 |
| Date : 01 Octobre 2026 | Signature : *(précédée de la mention manuscrite « Bon pour accord et acceptation sans réserve »)* |
| Signature & Cachet Officiel : | |
| &nbsp; | &nbsp; |
| *(Signé numériquement et certifié DAW)* | ________________________________________ |

---
*Document produit par DAW Digital Arts Work — by MG*  
*Signature de développeur Vibe Coder*  
*Contact : contact@mgartswork.site | +221 77 458 74 74*
