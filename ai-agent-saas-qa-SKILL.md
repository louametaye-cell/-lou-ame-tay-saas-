---
name: ai-agent-saas-qa
description: Méthodologie de pilotage et de vérification pour développer une application ou un SaaS en délégant le code à un agent IA (Antigravity, Gemini, Claude Code, etc.). À utiliser IMPÉRATIVEMENT dès qu'un utilisateur pilote un développement logiciel via des agents IA plutôt que d'écrire le code lui-même — que ce soit pour une nouvelle fonctionnalité, un audit, une migration de données, un correctif de bug, ou une mise en production. S'applique en priorité absolue dès que de l'argent réel, des clients réels, ou des données de production sont en jeu. Déclenche cette compétence pour toute demande impliquant : rédiger un prompt technique pour un agent développeur, faire vérifier un rapport de certification/audit qu'un agent a produit, préparer une migration de base de données ou de tarifs, ou concevoir un système de sécurité/accès (rôles, paiement, permissions).
---

# Pilotage QA d'un développement SaaS mené par agent IA

Cette compétence formalise une méthode issue d'un cas réel : le développement de "Lou Ame Tay ?", un SaaS sénégalais de gestion de restaurants/hôtels, entièrement piloté par son fondateur (non-développeur) via des agents IA. Plusieurs bugs financiers graves (paiement auto-confirmé sans validation, écart de caisse de 10 000 FCFA) ont été "certifiés résolus" par l'agent à trois reprises avant d'être réellement corrigés — et à chaque fois, c'est le test manuel du fondateur, pas le rapport de l'agent, qui a révélé la vérité.

## Principe fondateur : un agent qui audite son propre travail a un angle mort structurel

Un agent qui vient de coder une fonctionnalité a une tendance naturelle à confirmer que son propre travail fonctionne — pas par malhonnêteté, mais parce que ses tests reproduisent souvent le chemin qu'il a lui-même implémenté, pas les usages réels et inattendus d'un vrai utilisateur. La conséquence pratique : **ne jamais traiter une déclaration "✅ Complet", "✅ Certifié", ou "100% conforme" comme un fait tant qu'elle n'est pas accompagnée d'une preuve vérifiable ET que cette preuve n'a pas été inspectée par un humain.**

## Règle n°1 — Hiérarchie des preuves acceptables

Du plus faible au plus fort niveau de confiance :
1. **Une déclaration textuelle sans preuve** ("c'est corrigé") → toujours insuffisant, à rejeter systématiquement.
2. **Un script de test qui interroge directement l'API ou la base de données** → utile, mais insuffisant seul : un script peut valider la logique backend sans jamais révéler qu'un bouton de l'interface fait autre chose que ce qu'il prétend (cas vécu : un script confirmait `paymentStatus: UNPAID`, alors que le vrai bouton de l'interface l'écrasait en `PAID`).
3. **Des captures d'écran citées mais non jointes** (chemins de fichiers locaux du type `C:\Users\...`) → toujours exiger qu'elles soient réellement transmises et ouvertes, jamais les considérer comme une preuve tant qu'elles ne sont pas vues.
4. **Des captures d'écran réellement fournies et inspectées** → bon niveau de preuve, à croiser avec le test manuel.
5. **Le test manuel personnel de l'utilisateur, en conditions réelles, sur le vrai environnement de production** → seul niveau de preuve qui a systématiquement révélé la vérité dans ce cas réel. Ne jamais le sauter avant un déploiement qui touche de l'argent ou des données réelles, même après une preuve de niveau 4.

Quand on aide l'utilisateur à formuler une exigence de preuve à un agent, toujours viser le niveau 4 minimum, et rappeler explicitement que le niveau 5 (son propre test) reste nécessaire avant tout déploiement à enjeu financier.

## Règle n°2 — Distinguer le réversible de l'irréversible

Calibrer le niveau d'exigence selon la nature du changement :
- **Réversible et à faible enjeu** (texte, couleurs, icônes, mise en page) : itération rapide acceptable, faire confiance à un rapport bien argumenté sans exiger un test manuel systématique.
- **Irréversible ou à enjeu financier/données** (paiement, statut de commande, migration de base de données, tarification, suppression de comptes) : toujours exiger preuve de niveau 4 minimum + test manuel personnel avant déploiement. Ne jamais accepter qu'un agent déploie ce type de changement de façon autonome sans validation humaine explicite à chaque étape.

## Règle n°3 — Exiger le diagnostic avant d'accepter le correctif

Quand un agent annonce qu'un bug est corrigé après un rapport précédent erroné, toujours lui demander explicitement d'expliquer **pourquoi** son test précédent n'a pas détecté le problème, avant d'accepter le nouveau rapport. Un agent qui explique clairement son propre angle mort (ex: "mon script précédent forçait artificiellement la donnée que j'étais censé vérifier") produit un diagnostic plus fiable qu'un agent qui esquive la question ou l'ignore silencieusement.

## Règle n°4 — Toute correction testée sur un seul cas doit être vérifiée partout

Un bug détecté sur un client/tenant/compte doit systématiquement être considéré comme potentiellement présent sur TOUS les comptes similaires, pas seulement celui où il a été repéré. Exiger explicitement dans chaque prompt de correction : "reproduis ce test sur l'ensemble des comptes réels, pas seulement celui où le bug a été trouvé."

## Règle n°5 — Séparation stricte des statuts métier vs statuts financiers

Piège récurrent dans les systèmes de commande/vente : un statut opérationnel (préparé, servi, livré) ne doit JAMAIS déclencher automatiquement un statut financier (payé, encaissé). Ce sont deux machines à état indépendantes, qui ne se rejoignent que par une action humaine explicite et vérifiable (un caissier qui saisit un montant reçu). Quand on conçoit ou fait auditer un système avec de l'argent, toujours vérifier explicitement cette séparation à chaque point de jonction possible entre les deux (y compris des chemins de code non évidents, comme un bouton "prêt" en cuisine qui peut, par erreur d'implémentation, toucher au champ de paiement).

## Règle n°6 — Cloisonnement des rôles : jamais seulement visuel

Quand plusieurs types d'utilisateurs (admin, caissier, cuisine, client) partagent une plateforme, un lien retiré de l'interface n'est PAS une sécurité. Toujours exiger et faire tester :
- Un contrôle d'accès au niveau serveur/middleware, pas seulement une adaptation de l'affichage.
- Un test explicite de navigation directe par URL vers une zone non autorisée, avec le code de réponse HTTP exact (401/403 attendu).
- Un test d'appel direct à l'API sans passer par l'interface, pour vérifier qu'un accès non autorisé y est aussi bloqué.
- Des identifiants uniques par personne (jamais un code partagé par établissement ou par rôle), pour garantir une vraie traçabilité individuelle.

## Règle n°7 — Discipline sur les changements de prix et de périmètre commercial

Les agents IA ont tendance à faire dériver silencieusement des chiffres (prix, dates, seuils) d'une réponse à l'autre au fil d'une conversation longue, sans le signaler comme un changement. Toujours :
- Comparer explicitement tout nouveau chiffre proposé avec le dernier chiffre validé, et signaler l'écart avant de l'accepter.
- Exiger qu'un engagement commercial préférentiel ("tarif bloqué") soit toujours borné dans le temps et documenté avec une date de réexamen, jamais laissé "à vie" par défaut.
- Avant toute migration touchant des clients réels déjà payants : exiger un plan de correspondance basé sur leur usage réel (pas seulement leur nom de plan), une communication préalable au client, un test en environnement de simulation avant toute exécution réelle, et une procédure de rollback individuel par client.

## Règle n°8 — Charte d'accessibilité universelle (UX inclusive)

Quand l'application est destinée à des utilisateurs de niveaux d'alphabétisation variés (contexte fréquent dans les marchés émergents) :
- Le sens de toute action critique doit passer par la forme, la couleur et l'icône AVANT le texte — jamais du texte seul pour une action importante.
- Code couleur strict et cohérent sur toute l'application (une couleur = une seule signification, jamais réutilisée différemment ailleurs).
- Les nombres (prix, numéros de commande/table) toujours en grand format, en premier plan visuel.
- Confirmation d'action toujours visuelle et/ou sonore, jamais uniquement textuelle.
- Une action = un bouton = une couleur = une position cohérente sur tous les écrans similaires.

## Modèle de prompt à réutiliser pour toute demande de correction ou d'audit

Quand on aide l'utilisateur à écrire un prompt pour son agent développeur, structurer systématiquement ainsi :
1. Contexte précis du problème observé (avec captures/logs si disponibles).
2. Demande explicite de diagnostic de cause racine avant correction.
3. Demande de correction avec obligation de test sur TOUS les comptes/cas concernés, pas un seul.
4. Exigence de preuve de niveau 4 minimum (captures réelles jointes, pas de scripts seuls, pas de chemins de fichiers non transmis).
5. Rappel explicite : "N'utilise jamais '✅ Complet' sans preuve jointe dans la même réponse."
6. Rappel final : le déploiement réel n'a lieu qu'après validation humaine explicite, jamais de façon autonome pour un changement à enjeu financier ou touchant des données réelles.

## Ce que Claude doit faire concrètement en appliquant cette compétence

- Quand l'utilisateur colle un rapport d'agent, toujours l'examiner avec un œil critique structuré : chercher les déclarations sans preuve, les preuves de niveau insuffisant, les incohérences avec les échanges précédents (prix qui a changé, chemin de test qui ne correspond pas au bug initial).
- Toujours recommander explicitement à l'utilisateur de refaire lui-même un test manuel avant un déploiement à enjeu, même face à un rapport convaincant — en particulier après qu'un premier rapport se soit déjà révélé faux dans la conversation.
- Rédiger les prompts de correction en intégrant systématiquement les Règles 3 à 7 ci-dessus, sans attendre que l'utilisateur les redemande.
- Rester honnête et direct avec l'utilisateur sur les risques réels (financiers, sécurité, confiance client), sans minimiser un problème pour paraître rassurant.
