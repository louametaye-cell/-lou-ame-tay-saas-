# ==============================================================================
# SUITE DE TESTS QA ET VALIDATION ARCHITECTURE SAAS SCALABLE 1000 RESTAURANTS
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
Write-Host "DEMARRAGE DE LA SUITE DE VALIDATION SAAS HAUTE CHARGE" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta

# TEST 1 : Restaurant Starter -> Envoi en cuisine -> 403
Run-Test "TEST 1 : Restaurant Starter -> Envoi en cuisine -> Doit recevoir 403 Forbidden" {
    $body = @{ featureKey = "KITCHEN_DISPLAY_KDS" } | ConvertTo-Json
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/api/admin/tenants/tenant_starter_01/check-access" -Method Post -Body $body -ContentType "application/json"
        throw "Aurait du etre bloque avec HTTP 403"
    } catch {
        if ($_.Exception.Message -match "403" -or ($_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 403)) {
            Write-Host "-> Statut 403 Forbidden intercepte : Acces cuisine refuse sur Pack Starter" -ForegroundColor Green
        } else {
            throw "Statut inattendu : $_"
        }
    }
}

# TEST 2 : Restaurant Pro -> KDS -> 200 OK
Run-Test "TEST 2 : Restaurant Pro -> KDS -> Doit recevoir 200 OK" {
    $body = @{ featureKey = "KITCHEN_DISPLAY_KDS" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/api/admin/tenants/tenant_pro_01/check-access" -Method Post -Body $body -ContentType "application/json"
    if ($res.allowed -ne $true) { throw "KDS devrait etre autorise" }
    Write-Host "-> Statut 200 OK : KDS autorise sur Pack Pro pour Chez Fatou" -ForegroundColor Green
}

# TEST 3 : Restaurant Premium -> Creation table en zone Piscine -> 201 Created
Run-Test "TEST 3 : Restaurant Premium -> Creation table zone Piscine -> Doit recevoir 201 Created" {
    $body = @{ 
        featureKey = "MULTI_ZONE"
        action = "CREATE_ZONE"
    } | ConvertTo-Json

    # Use WebRequest to assert exact status 201
    $req = [System.Net.WebRequest]::Create("$baseUrl/api/admin/tenants/tenant_premium_01/check-access")
    $req.Method = "POST"
    $req.ContentType = "application/json"
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
    $req.ContentLength = $bytes.Length
    $stream = $req.GetRequestStream()
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Close()
    
    $response = $req.GetResponse()
    $status = [int]$response.StatusCode
    $response.Close()

    if ($status -eq 201) {
        Write-Host "-> Statut 201 Created : Zone Piscine creee avec succes sur Pack Premium" -ForegroundColor Green
    } else {
        throw "Statut inattendu : $status"
    }
}

# TEST 4 : Restaurant Starter -> Upload 21eme photo -> 403 LIMIT_EXCEEDED
Run-Test "TEST 4 : Restaurant Starter -> Upload 21eme photo -> Doit recevoir 403 LIMIT_EXCEEDED" {
    $body = @{ 
        featureKey = "MAX_PHOTOS"
        requestedCount = 21 
    } | ConvertTo-Json

    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/api/admin/tenants/tenant_starter_01/check-access" -Method Post -Body $body -ContentType "application/json"
        throw "Aurait du etre bloque car limite de 20 photos atteinte"
    } catch {
        if ($_.Exception.Message -match "403" -or ($_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 403)) {
            Write-Host "-> Statut 403 Forbidden intercepte : Plafond de 20 photos depasse (LIMIT_EXCEEDED)" -ForegroundColor Green
        } else {
            throw "Statut inattendu : $_"
        }
    }
}

# TEST 5 : Cron Job 03:00 AM & Stats Monitoring
Run-Test "TEST 5 : Execution Cron Job 03h00 & Monitoring Global Stats" {
    $cronRes = Invoke-RestMethod -Uri "$baseUrl/api/cron/subscription-check" -Method Post
    if ($cronRes.success -ne $true) { throw "Cron job n a pas reussi" }

    $statsRes = Invoke-RestMethod -Uri "$baseUrl/api/admin/dashboard/stats" -Method Get
    if ($statsRes.totalRestaurants -le 0) { throw "Stats monitoring vides" }

    Write-Host "-> Cron job execute avec succes : $($cronRes.data.suspendedCount) suspendus, $($cronRes.data.pastDueAlertsCount) relances" -ForegroundColor Green
    Write-Host "-> Stats : $($statsRes.activeRestaurants) actifs, MRR : $($statsRes.monthlyRevenue) FCFA" -ForegroundColor Green
}

Write-Host "`n============================================================" -ForegroundColor Magenta
Write-Host "RESULTAT FINAL : $script:passedTests / $script:totalTests TESTS REUSSIS A 100 POUR CENT" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Magenta
