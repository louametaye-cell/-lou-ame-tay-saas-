# Conversion et validation du fichier Excel / CSV avec BOM UTF-8
$csvPath = Join-Path $PSScriptRoot "checklist_taches_production_louametay.csv"
$text = [System.IO.File]::ReadAllText($csvPath, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText($csvPath, $text, [System.Text.Encoding]::UTF8)
Write-Host "Fichier Excel/CSV pret a etre ouvert directement dans Microsoft Excel : $csvPath" -ForegroundColor Green
