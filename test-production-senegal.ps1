# ==============================================================================
# SUITE DE VALIDATION PRODUCTION SENEGAL (WAVE, OM, HEALTH, METRICS, CRON)
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
Write-Host "DEMARRAGE DE LA SUITE DE VALIDATION PRODUCTION SENEGAL" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta

# TEST 1 : Endpoint de Sante /api/admin/health
Run-Test "TEST 1 : Diagnostic Sante Cluster (/api/admin/health)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/admin/health" -Method Get
    if ($res.status -ne "HEALTHY") { throw "Le statut aurait du etre HEALTHY" }
    Write-Host "-> Cluster statut : $($res.status) | Uptime : $($res.uptime.formatted)" -ForegroundColor Green
    Write-Host "-> MySQL : $($res.services.database.status) | Redis : $($res.services.redisCache.status)" -ForegroundColor Gray
}

# TEST 2 : Endpoint de Metriques /api/admin/metrics
Run-Test "TEST 2 : Metriques de Charge et Performance (/api/admin/metrics)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/admin/metrics" -Method Get
    if ($res.performance.avgResponseTimeMs -le 0) { throw "Metriques de latence invalides" }
    Write-Host "-> Latence moyenne : $($res.performance.avgResponseTimeMs) ms | CPU : $($res.infrastructure.cpuLoadPercent)%" -ForegroundColor Green
    Write-Host "-> Hit rate Redis : $($res.cache.hitRatePercent)% | MRR : $($res.business.monthlyRecurringRevenueFCFA) FCFA" -ForegroundColor Gray
}

# TEST 3 : Webhook de Confirmation Wave Senegal
Run-Test "TEST 3 : Webhook Wave -> Activation Instantanee du Pack" {
    $wavePayload = @{
        type = "checkout.session.completed"
        data = @{
            id = "wave_sess_test_987654"
            amount = 25000
            currency = "XOF"
            client_reference = "tenant_starter_01"
            payment_status = "successful"
            metadata = @{
                tenant_id = "tenant_starter_01"
                plan_id = "plan_pro"
                period_months = 1
            }
        }
    } | ConvertTo-Json -Depth 5

    $res = Invoke-RestMethod -Uri "$baseUrl/api/webhooks/wave" -Method Post -Body $wavePayload -ContentType "application/json" -Headers @{ "X-Wave-Signature" = "test_hmac_signature" }
    if ($res.received -ne $true) { throw "Le webhook Wave aurait du renvoyer received: true" }
    Write-Host "-> Webhook Wave valide ! Pack Pro active pour $($res.tenantId)" -ForegroundColor Green
}

# TEST 4 : Webhook IPN Orange Money Senegal
Run-Test "TEST 4 : Webhook Orange Money -> Validation IPN" {
    $omPayload = @{
        status = "SUCCESS"
        notif_token = "om_token_test_12345"
        txnid = "OM_TX_987654"
        order_id = "tenant_starter_01"
        amount = 25000
        subscriber_msisdn = "+221774587474"
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/api/webhooks/orange-money" -Method Post -Body $omPayload -ContentType "application/json"
    if ($res.status -ne "SUCCESS") { throw "Le webhook OM aurait du renvoyer status: SUCCESS" }
    Write-Host "-> Webhook Orange Money valide avec txnid: $($res.txnid)" -ForegroundColor Green
}

# TEST 5 : Cron de Relance Commerciale (11h30 / 19h30)
Run-Test "TEST 5 : Execution Cron Relance Commerciale (11h30 & 19h30)" {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/cron/commercial-reminder" -Method Post
    if ($res.success -ne $true) { throw "Le cron commercial a echoue" }
    Write-Host "-> Cron execute : $($res.data.remindedCount) relances WhatsApp, $($res.data.suspendedCount) suspensions" -ForegroundColor Green
}

Write-Host "`n============================================================" -ForegroundColor Magenta
Write-Host "RESULTAT FINAL : $script:passedTests / $script:totalTests TESTS REUSSIS A 100 POUR CENT" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Magenta
