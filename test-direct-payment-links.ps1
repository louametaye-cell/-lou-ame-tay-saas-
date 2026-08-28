# ==============================================================================
# SUITE DE VALIDATION : LIENS DIRECTS DE PAIEMENT WAVE & ORANGE MONEY
# Lou Ame Tay ? - Deep Linking Mobile & Partage WhatsApp
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
Write-Host "DEMARRAGE DES TESTS LIENS DIRECTS DE PAIEMENT (DEEP LINKING)" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta

# TEST 1 : Génération de Lien Direct Wave & Orange Money pour Pack Pro (25 000 FCFA)
Run-Test "TEST 1 : Génération Deep Link Wave & OM (/api/payments/generate-link)" {
    $body = @{
        tenantId = "resto_thies_01"
        planId = "plan_pro"
        periodMonths = 1
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/api/payments/generate-link" -Method Post -Body $body -ContentType "application/json"
    if ($res.success -ne $true) { throw "Reponse invalide pour generate-link" }
    
    if (-not $res.links.waveDeepLink.Contains("pay.wave.com")) { throw "Lien Wave Deep Link manquant" }
    if ($res.links.amount -ne 25000) { throw "Montant incorrect : $($res.links.amount)" }
    
    Write-Host "-> Wave Deep Link : $($res.links.waveDeepLink)" -ForegroundColor Green
    Write-Host "-> OM Link : $($res.links.orangeMoneyLink)" -ForegroundColor Green
    Write-Host "-> Montant exact pre-rempli : $($res.links.amount) FCFA" -ForegroundColor Green
}

# TEST 2 : Génération de Lien Direct pour Pack Starter (15 000 FCFA) pour 3 mois
Run-Test "TEST 2 : Calcul trimestriel (3 mois x 15 000 = 45 000 FCFA)" {
    $body = @{
        tenantId = "resto_thies_01"
        planId = "plan_starter"
        periodMonths = 3
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/api/payments/generate-link" -Method Post -Body $body -ContentType "application/json"
    if ($res.links.amount -ne 45000) { throw "Montant trimestriel incorrect" }
    Write-Host "-> Montant 3 mois Starter valide : $($res.links.amount) FCFA" -ForegroundColor Green
}

# TEST 3 : Validation du Message WhatsApp pré-formaté
Run-Test "TEST 3 : Formatage du message WhatsApp avec lien direct" {
    $body = @{
        tenantId = "tenant_pro_01"
        planId = "plan_pro"
        periodMonths = 1
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/api/payments/generate-link" -Method Post -Body $body -ContentType "application/json"
    if (-not $res.links.whatsappMessage.Contains("FCFA")) { throw "Message WhatsApp non personnalise" }
    Write-Host "-> Message WhatsApp pret a l'envoi :" -ForegroundColor Green
    Write-Host "$($res.links.whatsappMessage)" -ForegroundColor Gray
}

# TEST 4 : Simulation de Validation de Paiement via Checkout (/api/payments/checkout)
Run-Test "TEST 4 : Activation automatique du pack après paiement Wave (/api/payments/checkout)" {
    $body = @{
        tenantId = "tenant_pro_01"
        planId = "plan_premium"
        provider = "WAVE"
        periodMonths = 1
        phone = "+221774587474"
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/api/payments/checkout" -Method Post -Body $body -ContentType "application/json"
    if ($res.success -ne $true) { throw "Echec de validation du paiement" }
    Write-Host "-> Transaction validee : $($res.transaction.id) ($($res.transaction.amount) FCFA)" -ForegroundColor Green
}

Write-Host "`n============================================================" -ForegroundColor Magenta
Write-Host "RESULTAT FINAL : $passedTests / $totalTests TESTS VALIDES A 100%" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta
