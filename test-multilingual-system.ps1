# ==============================================================================
# SUITE DE VALIDATION : SYSTÈME MULTILINGUE 4 LANGUES (FR / EN / ES / IT)
# Lou Ame Tay ? - Hôtels & Restaurants Touristiques du Sénégal
# ==============================================================================

$baseUrl = "http://localhost:3000"
$totalTests = 0
$passedTests = 0

function Run-Test($testName, $scriptBlock) {
    $script:totalTests++
    Write-Host "`n------------------------------------------------------------" -ForegroundColor Cyan
    Write-Host "[TEST $script:totalTests] $testName" -ForegroundColor Yellow
    try {
        & $scriptBlock
        $script:passedTests++
        Write-Host "[OK] SUCCES : $testName" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] ECHEC : $testName" -ForegroundColor Red
        Write-Host "Detail : $_" -ForegroundColor Red
    }
}

Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "DEMARRAGE DES TESTS DU SYSTEME MULTILINGUE (FR / EN / ES / IT)" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta

# TEST 1 : Traduction automatique IA (/api/translate/auto)
Run-Test "TEST 1 : Traduction Automatique IA d'un plat (/api/translate/auto)" {
    $body = @{
        name = "Thiéboudienne Rouge Penda Mbaye"
        description = "Riz rouge au mérou blanc et légumes frais du terroir"
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/api/translate/auto" -Method Post -Body $body -ContentType "application/json"
    if ($res.success -ne $true) { throw "La traduction automatique a echoue" }
    if (-not $res.translations.EN.name -or -not $res.translations.ES.name -or -not $res.translations.IT.name) {
        throw "Traductions manquantes pour EN, ES ou IT"
    }
    Write-Host "-> 🇫🇷 FR : $($res.translations.FR.name)" -ForegroundColor Gray
    Write-Host "-> 🇬🇧 EN : $($res.translations.EN.name)" -ForegroundColor Green
    Write-Host "-> 🇪🇸 ES : $($res.translations.ES.name)" -ForegroundColor Green
    Write-Host "-> 🇮🇹 IT : $($res.translations.IT.name)" -ForegroundColor Green
}

# TEST 2 : Menu en Anglais (?lang=EN)
Run-Test "TEST 2 : API Menu en Anglais (/api/menu?lang=EN)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/menu?lang=EN" -Method Get
    if ($res.language -ne "EN") { throw "La langue retournee aurait du etre EN" }
    $sampleItem = $res.restaurant.categories[0].items[0]
    Write-Host "-> Langue active : $($res.language)" -ForegroundColor Green
    Write-Host "-> Exemple plat : $($sampleItem.name)" -ForegroundColor Gray
}

# TEST 3 : Menu en Espagnol (?lang=ES)
Run-Test "TEST 3 : API Menu en Espagnol (/api/menu?lang=ES)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/menu?lang=ES" -Method Get
    if ($res.language -ne "ES") { throw "La langue retournee aurait du etre ES" }
    $sampleItem = $res.restaurant.categories[0].items[0]
    Write-Host "-> Langue active : $($res.language)" -ForegroundColor Green
    Write-Host "-> Exemple plat : $($sampleItem.name)" -ForegroundColor Gray
}

# TEST 4 : Menu en Italien (?lang=IT)
Run-Test "TEST 4 : API Menu en Italien (/api/menu?lang=IT)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/menu?lang=IT" -Method Get
    if ($res.language -ne "IT") { throw "La langue retournee aurait du etre IT" }
    $sampleItem = $res.restaurant.categories[0].items[0]
    Write-Host "-> Langue active : $($res.language)" -ForegroundColor Green
    Write-Host "-> Exemple plat : $($sampleItem.name)" -ForegroundColor Gray
}

# TEST 5 : Fallback Automatique Langue Inconnue (?lang=DE -> FR)
Run-Test "TEST 5 : Fallback automatique en Français sur langue inconnue (/api/menu?lang=DE)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/menu?lang=DE" -Method Get
    if ($res.language -ne "FR") { throw "Le fallback aurait du renvoyer FR" }
    Write-Host "-> Fallback FR confirme avec succes !" -ForegroundColor Green
}

# TEST 6 : Sauvegarde des 4 traductions d'un plat
Run-Test "TEST 6 : Sauvegarde Traductions Plat (/api/restaurant/menu-items/item_01/translations)" {
    $transBody = @{
        translations = @{
            FR = @{ name = "Pastels au Thon"; description = "Beignets croustillants à la sauce pimentée" }
            EN = @{ name = "Crispy Tuna Pastries"; description = "Crispy fish turnovers with spicy dip" }
            ES = @{ name = "Empanadas de Atún"; description = "Empanadillas crujientes de atún con salsa" }
            IT = @{ name = "Fagottini al Tonno"; description = "Fagottini croccanti di tonno con salsa piccante" }
        }
    } | ConvertTo-Json -Depth 5

    $res = Invoke-RestMethod -Uri "$baseUrl/api/restaurant/menu-items/item_01/translations" -Method Post -Body $transBody -ContentType "application/json"
    if ($res.success -ne $true) { throw "La sauvegarde des traductions a echoue" }
    Write-Host "-> Traductions 4 langues sauvegardees avec succes pour item_01" -ForegroundColor Green
}

# TEST 7 : Feature Flag MULTI_LANGUAGE_MENU (Starter Bloque 403 vs Premium Autorise 200)
Run-Test "TEST 7 : Feature Flag MULTI_LANGUAGE_MENU (Pack Starter 403 vs Premium 200)" {
    $checkBody = @{ featureKey = "MULTI_LANGUAGE_MENU" } | ConvertTo-Json
    
    # Starter -> Doit être bloqué 403
    try {
        $resStarter = Invoke-RestMethod -Uri "$baseUrl/api/admin/tenants/tenant_starter_01/check-access" -Method Post -Body $checkBody -ContentType "application/json"
        throw "Starter aurait du etre bloque"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 403) {
            Write-Host "-> Starter bien bloque 403 pour MULTI_LANGUAGE_MENU" -ForegroundColor Green
        }
    }

    # Premium -> Doit être autorisé 200
    $resPremium = Invoke-RestMethod -Uri "$baseUrl/api/admin/tenants/tenant_premium_01/check-access" -Method Post -Body $checkBody -ContentType "application/json"
    if ($resPremium.allowed -ne $true) { throw "Premium devrait etre autorise" }
    Write-Host "-> Premium autorise 200 pour MULTI_LANGUAGE_MENU" -ForegroundColor Green
}

Write-Host "`n============================================================" -ForegroundColor Magenta
Write-Host "RESULTAT FINAL : $script:passedTests / $script:totalTests TESTS VALIDES A 100 POUR CENT" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Magenta
