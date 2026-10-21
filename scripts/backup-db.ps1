# ==============================================================================
# LOU AME TAY ? - SAUVEGARDE BASE DE DONNEES POSTGRESQL
# DAW Digital Arts Work - by MG
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "LOU AME TAY ? - SAUVEGARDE BASE DE DONNEES POSTGRESQL" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Detection et chargement du fichier d'environnement
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    if (Test-Path ".env.production") {
        $envFile = ".env.production"
    } elseif (Test-Path ".env.local") {
        $envFile = ".env.local"
    }
}

if (-not (Test-Path $envFile)) {
    Write-Error "Fichier d'environnement (.env) introuvable !"
    exit 1
}

Write-Host "Chargement des variables depuis $envFile..." -ForegroundColor Gray
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $idx = $line.IndexOf("=")
        $key = $line.Substring(0, $idx).Trim()
        $val = $line.Substring($idx + 1).Trim().Trim('"').Trim("'")
        [System.Environment]::SetEnvironmentVariable($key, $val, [System.EnvironmentVariableTarget]::Process)
    }
}

$dbUrl = [System.Environment]::GetEnvironmentVariable("DIRECT_URL")
if (-not $dbUrl) {
    $dbUrl = [System.Environment]::GetEnvironmentVariable("DATABASE_URL")
}

if (-not $dbUrl) {
    Write-Error "DATABASE_URL ou DIRECT_URL introuvable dans l'environnement !"
    exit 1
}

# 2. Repertoire de destination
$backupDir = Join-Path $PSScriptRoot "..\backups\db"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    Write-Host "Dossier cree : $backupDir" -ForegroundColor Gray
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path $backupDir "backup_louametay_$timestamp.sql"

# 3. Execution pg_dump ou fallback granulaire
$pgDumpCmd = Get-Command "pg_dump" -ErrorAction SilentlyContinue

if ($pgDumpCmd) {
    Write-Host "Execution de pg_dump vers $backupFile..." -ForegroundColor Yellow
    & pg_dump --dbname="$dbUrl" --clean --if-exists --no-owner --no-privileges -f "$backupFile"
    
    if ($LASTEXITCODE -eq 0 -and (Test-Path $backupFile)) {
        Write-Host "Sauvegarde PostgreSQL terminee avec succes !" -ForegroundColor Green
        Write-Host "Fichier : $backupFile" -ForegroundColor Green
    } else {
        Write-Error "Echec de l'execution de pg_dump."
    }
} else {
    Write-Host "pg_dump non present dans le PATH. Execution de la sauvegarde multi-tenant..." -ForegroundColor Yellow
    
    $tenants = @("madiba-restaurant", "anima-pizzeria", "sams-prestige", "hotel-lat-dior")
    foreach ($tenant in $tenants) {
        Write-Host "Sauvegarde du tenant : $tenant..." -ForegroundColor Gray
        npx tsx scripts/tenant-backup.ts --tenant=$tenant
    }
    
    Write-Host "Sauvegardes granulaires multi-tenant terminees dans backups/tenants/ !" -ForegroundColor Green
}

Write-Host "----------------------------------------------------------" -ForegroundColor Cyan
Write-Host "REGLE D'OR SECTION 15 GEMINI.MD :" -ForegroundColor Yellow
Write-Host "Ne JAMAIS restaurer un dump global sur un serveur multi-tenant actif." -ForegroundColor Yellow
Write-Host "Pour restaurer un seul restaurant : npm run tenant:restore -- --tenant=[slug]" -ForegroundColor Yellow
Write-Host "----------------------------------------------------------" -ForegroundColor Cyan
