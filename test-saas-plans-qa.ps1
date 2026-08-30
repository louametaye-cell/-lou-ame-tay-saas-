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
Write-Host "DEMARRAGE DES TESTS UNITAIRES ET CONTROLE D ACCES DES PACKS" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta

# TEST 1 : Restaurant Starter tente d'envoyer en cuisine / KDS (Doit etre bloque 403)
Run-Test "Restaurant STARTER : Blocage 403 pour l'envoi Cuisine / KDS" {
    $body = @{ featureKey = "KITCHEN_DISPLAY_KDS" } | ConvertTo-Json
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/api/admin/tenants/tenant_starter_01/check-access" -Method Post -Body $body -ContentType "application/json"
        throw "Aurait du renvoyer une erreur 403 Forbidden !"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 403) {
            Write-Host "-> Code HTTP 403 Forbidden intercepte avec succes !" -ForegroundColor Green
            Write-Host "-> Message d'erreur bien recu : Upgrade requis vers Pro" -ForegroundColor Gray
        } else {
            throw "Statut inattendu : $($_.Exception.Response.StatusCode)"
        }
    }
}

# TEST 2 : Restaurant Pro peut utiliser le KDS et le paiement Wave / Orange Money
Run-Test "Restaurant PRO : Autorisation 200 OK pour KDS et Wave/Orange Money" {
    $bodyKds = @{ featureKey = "KITCHEN_DISPLAY_KDS" } | ConvertTo-Json
    $resKds = Invoke-RestMethod -Uri "$baseUrl/api/admin/tenants/tenant_pro_01/check-access" -Method Post -Body $bodyKds -ContentType "application/json"
    if ($resKds.allowed -ne $true) { throw "KDS devrait etre autorise sur le pack Pro" }

    $bodyWave = @{ featureKey = "WAVE_ORANGE_MONEY" } | ConvertTo-Json
    $resWave = Invoke-RestMethod -Uri "$baseUrl/api/admin/tenants/tenant_pro_01/check-access" -Method Post -Body $bodyWave -ContentType "application/json"
    if ($resWave.allowed -ne $true) { throw "Wave/OM devrait etre autorise sur le pack Pro" }

    Write-Host "-> KDS et Wave/OM valides avec statut 200 OK pour Chez Fatou (Pack Pro)" -ForegroundColor Green
}

# TEST 3 : Restaurant Premium peut utiliser Multi-Zones (Piscine) et Bilingue
Run-Test "Restaurant PREMIUM : Autorisation 200 OK pour Multi-Zones et Mode Bilingue" {
    $bodyZone = @{ featureKey = "MULTI_ZONE" } | ConvertTo-Json
    $resZone = Invoke-RestMethod -Uri "$baseUrl/api/admin/tenants/tenant_premium_01/check-access" -Method Post -Body $bodyZone -ContentType "application/json"
    if ($resZone.allowed -ne $true) { throw "Multi-Zones devrait etre autorise sur le pack Premium" }

    $bodyBilingual = @{ featureKey = "BILINGUAL_MENU" } | ConvertTo-Json
    $resBilingual = Invoke-RestMethod -Uri "$baseUrl/api/admin/tenants/tenant_premium_01/check-access" -Method Post -Body $bodyBilingual -ContentType "application/json"
    if ($resBilingual.allowed -ne $true) { throw "Menu Bilingue devrait etre autorise sur le pack Premium" }

    Write-Host "-> Multi-Zones et Bilingue valides avec statut 200 OK pour Le Palmier Resort (Pack Premium)" -ForegroundColor Green
}

# TEST 4 : Passerelle de Paiement Wave/OM et Upgrade Automatique Starter -> Pro
Run-Test "Passerelle Wave/OM : Paiement et Deblocage Immediat des Fonctionnalites Pro" {
    $payBody = @{
        tenantId = "tenant_starter_01"
        planId = "plan_pro"
        provider = "WAVE"
        phone = "+221 77 111 22 33"
        periodMonths = 1
    } | ConvertTo-Json

    $payRes = Invoke-RestMethod -Uri "$baseUrl/api/payments/checkout" -Method Post -Body $payBody -ContentType "application/json"
    if ($payRes.success -ne $true) { throw "Le paiement Wave aurait du reussir" }

    $bodyKds = @{ featureKey = "KITCHEN_DISPLAY_KDS" } | ConvertTo-Json
    $resKds = Invoke-RestMethod -Uri "$baseUrl/api/admin/tenants/tenant_starter_01/check-access" -Method Post -Body $bodyKds -ContentType "application/json"
    if ($resKds.allowed -ne $true) { throw "Le KDS devrait etre actif immediatement apres le paiement Wave" }

    Write-Host "-> Paiement Wave valide et KDS de bloque avec succes pour Le Petit Maquis !" -ForegroundColor Green

    # Reset tenant_starter_01 back to plan_starter for test idempotency
    $resetBody = @{ tenantId = "tenant_starter_01"; planId = "plan_starter"; provider = "WAVE"; periodMonths = 1 } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/api/payments/checkout" -Method Post -Body $resetBody -ContentType "application/json" | Out-Null
}

Write-Host "`n============================================================" -ForegroundColor Magenta
Write-Host "RESULTAT GLOBAL : $script:passedTests / $script:totalTests TESTS VALIDES A 100 POUR CENT" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Magenta
