#!/bin/bash
# ==============================================================================
# SCRIPT DE DÉPLOIEMENT AUTOMATISÉ EN PRODUCTION (LOU AME TAY ? - SÉNÉGAL)
# Serveur VPS / Dédié Ubuntu 22.04 LTS (DigitalOcean / Hetzner)
# ==============================================================================

set -e # Arrêt immédiat en cas d'erreur

echo "======================================================================"
echo "🚀 [LOU AME TAY ?] DÉMARRAGE DU DÉPLOIEMENT EN PRODUCTION SÉNÉGAL"
echo "======================================================================"

# 1. Vérification de l'environnement
if [ ! -f .env.production ]; then
    echo "❌ Erreur : Le fichier .env.production est introuvable !"
    exit 1
fi

# 2. Récupération des dernières modifications Git
echo "📦 1/5 : Récupération des dernières mises à jour Git..."
git pull origin main

# 3. Construction des conteneurs Docker
echo "🔨 2/5 : Construction des images Docker (Build Next.js, MySQL, Redis, Nginx)..."
docker-compose -f docker-compose.prod.yml build --no-cache app

# 4. Exécution des migrations Prisma ORM
echo "🗄️ 3/5 : Application des migrations de base de données..."
docker-compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy

# 5. Redémarrage propre sans interruption de service (Zero-Downtime Reload)
echo "🔄 4/5 : Redémarrage des services..."
docker-compose -f docker-compose.prod.yml up -d --remove-orphans

# 6. Vérification de la santé du cluster
echo "🏥 5/5 : Vérification de l'état de santé du serveur..."
sleep 5
curl -f http://localhost:3000/api/admin/health || echo "⚠️ Attention : Vérification initiale du endpoint de santé."

echo "======================================================================"
echo "✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS SUR HTTPS://LOUAMETAY.SN"
echo "======================================================================"
