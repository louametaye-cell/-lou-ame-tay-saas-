# 🇸🇳 CONTEXTE TECHNIQUE & RÉALITÉS DU TERRAIN (SÉNÉGAL)

Toutes les fonctionnalités développées pour Lou Ame Tay? doivent être pensées pour les contraintes suivantes :

## 1. LE RÉSEAU (Connectivité)
- Le Wi-Fi dans les restaurants est souvent faible ou instable.
- Les coupures de fibre Orange/Free sont fréquentes.
- Règle absolue : **ZÉRO PERTE DE DONNÉES**. Le KDS et la Caisse doivent utiliser un système de "retry" (réessai) automatique et un cache local (IndexedDB ou localStorage) en cas de coupure. Ne jamais bloquer l'interface si l'API met du temps à répondre.

## 2. LE MATÉRIEL (Matériel bas de gamme)
- Les caissiers utilisent souvent des téléphones Android d'entrée de gamme (Tecno, Itel, Infinix) avec 2 Go de RAM.
- Les écrans sont petits (5 à 6 pouces) et parfois fissurés.
- Règle absolue : Les boutons de caisse doivent faire **au moins 48x48 pixels**. Les textes doivent être lisibles sans zoomer. Les animations doivent être légères (pas de 3D complexe qui fait ramer le téléphone).

## 3. L'IMPRESSION THERMIQUE (ESC/POS)
- Les imprimantes sont souvent des modèles chinois génériques connectés en Bluetooth ou USB.
- Règle absolue : Toujours prévoir un fallback (plan B). Si l'imprimante Bluetooth échoue, le système doit proposer d'ouvrir le ticket au format PDF pour l'imprimer via le gestionnaire d'impression du téléphone/PC.

## 4. L'ENVIRONNEMENT (Chaleur, Poussière, Bruit)
- La cuisine est bruyante (bruit des ventilateurs, des mixeurs).
- Règle absolue : Les alertes du KDS doivent être visuelles (clignotement, gros encadré rouge) EN PLUS d'être sonores. Le son seul ne suffit pas.

## 5. LES HABITUDES UTILISATEURS
- L'argent liquide (espèces) représente 70% des transactions. Le caissier doit pouvoir calculer le rendu de monnaie très rapidement (interface simplifiée).
- Le personnel change souvent. L'interface doit être auto-explicative (icônes universelles, pas de jargon technique).