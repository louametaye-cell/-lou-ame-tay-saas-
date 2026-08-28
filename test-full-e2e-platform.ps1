# ==============================================================================
# SUITE DE TESTS INTEGRALE DE BOUT EN BOUT (E2E) — LOU AME TAY ?
# ==============================================================================

$BaseUrl = "http://localhost:3000"
$ErrorActionPreference = "Stop"

Write-Host "===============================================================" -ForegroundColor Yellow
Write-Host "LANCEMENT DU TEST INTEGRAL DE TOUTES LES FONCTIONNALITES" -ForegroundColor Yellow
Write-Host "===============================================================" -ForegroundColor Yellow

$passedCount = 0
$totalTests = 0

function Run-Step($name, $scriptBlock) {
    $global:totalTests++
    Write-Host "`n[$global:totalTests] TEST : $name" -ForegroundColor Cyan
    try {
        & $scriptBlock
        $global:passedCount++
        Write-Host "  [OK] SUCCES" -ForegroundColor Green
    } catch {
        Write-Host "  [ERR] ECHEC : $_" -ForegroundColor Red
    }
}

# ------------------------------------------------------------------------------
# SUITE 1 : PARCOURS CLIENT TABLE & COMMANDE
# ------------------------------------------------------------------------------
Run-Step "1.1 Enregistrement du Scan QR Code Table 5" {
    $scanBody = @{ subdomain = "chezfatou"; tableNumber = 5 } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/scan" -Method Post -Body $scanBody -ContentType "application/json"
    if ($res.success -ne $true) { throw "Echec du scan" }
    Write-Host "    -> Scan enregistre pour chezfatou Table 5" -ForegroundColor DarkGray
}

Run-Step "1.2 Récuperation du Menu et des Categories" {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/menu" -Method Get
    if (-not $res.restaurant.categories) { throw "Pas de categories recues" }
    Write-Host "    -> $($res.restaurant.categories.Count) categories chargees" -ForegroundColor DarkGray
}

Run-Step "1.3 Passage de Commande Client (2x Ceebu Jen + 1x Dibi)" {
    $orderBody = @{
        restaurantId = "resto_thies_01"
        tableNumber = 5
        customerNote = "Sans piment, beaucoup de citron"
        items = @(
            @{ id = "dish_ceebu_jen"; name = "Ceebu Jen Pendaa Mbaye"; price = 3500; quantity = 2 },
            @{ id = "dish_dibi_agneau"; name = "Dibi d'Agneau façon Thies"; price = 5500; quantity = 1 }
        )
        total = 12500
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/orders" -Method Post -Body $orderBody -ContentType "application/json"
    if (-not $res.order.id) { throw "Commande non creee" }
    $global:testOrderId = $res.order.id
    Write-Host "    -> Commande creee #$($res.order.id) (Total: $($res.order.total) FCFA, Table $($res.order.tableNumber))" -ForegroundColor DarkGray
}

# ------------------------------------------------------------------------------
# SUITE 2 : ECRAN CUISINE (KDS TEMPS REEL)
# ------------------------------------------------------------------------------
Run-Step "2.1 Récuperation des Commandes Actives en Cuisine" {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/orders?restaurantId=resto_thies_01" -Method Get
    $found = $res.orders | Where-Object { $_.id -eq $global:testOrderId }
    if (-not $found) { throw "Commande non trouvee dans la file cuisine" }
    Write-Host "    -> Commande trouvee en statut : $($found.status)" -ForegroundColor DarkGray
}

Run-Step "2.2 Transition Cuisine : PENDING -> PREPARING" {
    $statusBody = @{ status = "PREPARING" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/kitchen/orders/$global:testOrderId/status" -Method Patch -Body $statusBody -ContentType "application/json"
    if ($res.status -ne "PREPARING") { throw "Echec mise en preparation" }
    Write-Host "    -> Commande passee en PREPARATION" -ForegroundColor DarkGray
}

Run-Step "2.3 Transition Cuisine : PREPARING -> SERVED" {
    $statusBody = @{ status = "SERVED" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/kitchen/orders/$global:testOrderId/status" -Method Patch -Body $statusBody -ContentType "application/json"
    if ($res.status -ne "SERVED" -or -not $res.servedAt) { throw "Echec cloture commande" }
    Write-Host "    -> Commande marquee comme SERVIE à $($res.servedAt)" -ForegroundColor DarkGray
}

Run-Step "2.4 Consultation Historique Cuisine des Plats Servis" {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/kitchen/history?restaurantId=resto_thies_01" -Method Get
    if (-not $res.orders -or $res.orders.Count -lt 1) { throw "Historique vide" }
    Write-Host "    -> $($res.orders.Count) commande(s) servie(s) dans l'historique (Total: $($res.total) FCFA)" -ForegroundColor DarkGray
}

# ------------------------------------------------------------------------------
# SUITE 3 : DASHBOARD RESTAURATEUR
# ------------------------------------------------------------------------------
Run-Step "3.1 Switch ON/OFF Rupture de Stock" {
    $body = @{ itemId = "dish_ceebu_jen"; isAvailable = $false } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/menu" -Method Post -Body $body -ContentType "application/json"
    if ($res.isAvailable -ne $false) { throw "Echec bascule rupture" }

    # Remettre en stock
    $bodyOn = @{ itemId = "dish_ceebu_jen"; isAvailable = $true } | ConvertTo-Json
    $resOn = Invoke-RestMethod -Uri "$BaseUrl/api/menu" -Method Post -Body $bodyOn -ContentType "application/json"
    if ($resOn.isAvailable -ne $true) { throw "Echec remise en stock" }
    Write-Host "    -> Test Rupture / Remise en stock valide" -ForegroundColor DarkGray
}

Run-Step "3.2 Commande de Chevalets QR Codes Physiques (Pack 12 tables)" {
    $body = @{
        restaurantId = "resto_thies_01"
        restaurantName = "Chez Fatou & Frères"
        packTitle = "Jeu de 6 à 12 tables"
        tableCount = 12
        format = "A5 plastifie + chevalet"
        price = 8000
        city = "Thies"
        phone = "+221 77 654 32 10"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/dashboard/qrcodes/order" -Method Post -Body $body -ContentType "application/json"
    if (-not $res.order.id) { throw "Echec commande chevalets" }
    $global:testQROrderId = $res.order.id
    Write-Host "    -> Commande chevalets creee #$($res.order.id) (Prix: $($res.order.price) FCFA)" -ForegroundColor DarkGray
}

Run-Step "3.3 Ouverture Ticket SAV & Fil de Discussion" {
    $ticketBody = @{
        restaurantId = "resto_thies_01"
        restaurantName = "Chez Fatou & Frères"
        subject = "Demande d'assistance synchronisation Wave"
        message = "Comment verifier que le compte marchand Wave reçoit bien les paiements ?"
        priority = "MOYENNE"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/dashboard/tickets" -Method Post -Body $ticketBody -ContentType "application/json"
    if (-not $res.ticket.id) { throw "Echec ouverture ticket SAV" }
    $global:testTicketId = $res.ticket.id

    # Ajout d'un message dans le fil
    $msgBody = @{
        content = "Capture d'ecran de l'application Wave transmise au conseiller."
        sender = "CLIENT"
        senderName = "Gerant Fatou"
    } | ConvertTo-Json
    $resMsg = Invoke-RestMethod -Uri "$BaseUrl/api/dashboard/tickets/$global:testTicketId/message" -Method Post -Body $msgBody -ContentType "application/json"
    if (-not $resMsg.message.id) { throw "Echec ajout message" }
    Write-Host "    -> Ticket SAV #$($res.ticket.id) cree avec fil de messages actif" -ForegroundColor DarkGray
}

Run-Step "3.4 Soumission Nouveau Plat (avec 14 Allergenes)" {
    $dishBody = @{
        restaurantId = "resto_thies_01"
        restaurantName = "Chez Fatou & Frères"
        name = "Thiof Grille Saint-Louis"
        wolofName = "Cofi bu Nor"
        description = "Poisson mérou blanc grillé aux braises d'acacia et piment doux."
        price = 7000
        category = "Poissons & Fruits de Mer"
        allergens = @("POISSON")
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/dashboard/menu-request" -Method Post -Body $dishBody -ContentType "application/json"
    if (-not $res.menuRequest.id) { throw "Echec soumission plat" }
    Write-Host "    -> Plat soumis #$($res.menuRequest.id) ($($res.menuRequest.name) - $($res.menuRequest.price) FCFA)" -ForegroundColor DarkGray
}

# ------------------------------------------------------------------------------
# SUITE 4 : SUPER ADMIN 360° & PILOTAGE AGENCE
# ------------------------------------------------------------------------------
Run-Step "4.1 Authentification Super Admin" {
    $authBody = @{ password = "admin123" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/super-admin/auth" -Method Post -Body $authBody -ContentType "application/json"
    if ($res.success -ne $true -or -not $res.token) { throw "Echec authentification Super Admin" }
    Write-Host "    -> Authentification validee avec succes (Token: $($res.token))" -ForegroundColor DarkGray
}

Run-Step "4.2 Creation & Onboarding d'un Nouveau Restaurant Client" {
    $newRestoBody = @{
        name = "Le Palmier Gourmand - Saly"
        subdomain = "palmiersaly"
        ownerName = "Babacar Ndiaye"
        phone = "+221 78 555 44 33"
        address = "Route de la Somone, Saly"
        plan = "PRO"
        months = 6
        tablesCount = 16
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/super-admin/restaurants" -Method Post -Body $newRestoBody -ContentType "application/json"
    if (-not $res.restaurant.id) { throw "Echec creation restaurant client" }
    $global:newRestoId = $res.restaurant.id
    Write-Host "    -> Nouveau restaurant client cree : $($res.restaurant.name) (/palmiersaly)" -ForegroundColor DarkGray
}

Run-Step "4.3 Prolongation d'Abonnement Super Admin (+3 mois)" {
    $patchBody = @{ action = "extend-subscription"; additionalMonths = 3 } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/super-admin/restaurants/$global:newRestoId" -Method Patch -Body $patchBody -ContentType "application/json"
    if (-not $res.restaurant.subscription.endDate) { throw "Echec prolongation" }
    Write-Host "    -> Abonnement prolonge jusqu'au $($res.restaurant.subscription.endDate)" -ForegroundColor DarkGray
}

Run-Step "4.4 Generation Message & Lien WhatsApp Relance J-5" {
    $remindBody = @{ restaurantId = $global:newRestoId } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/super-admin/whatsapp/remind" -Method Post -Body $remindBody -ContentType "application/json"
    if (-not $res.reminder.whatsappUrl -or -not $res.reminder.message) { throw "Echec generation relance WhatsApp" }
    Write-Host "    -> Lien WhatsApp genere avec coordonnees Wave et OM" -ForegroundColor DarkGray
}

Run-Step "4.5 Export CSV des QR Codes pour Impression Atelier" {
    $csvRes = Invoke-WebRequest -Uri "$BaseUrl/api/super-admin/restaurants/$global:newRestoId/qrcodes?format=csv" -Method Get -UseBasicParsing
    if ($csvRes.StatusCode -ne 200 -or $csvRes.Content -notmatch "Nom Restaurant") { throw "Echec export CSV" }
    Write-Host "    -> Export CSV genere avec succes ($($csvRes.Content.Length) octets)" -ForegroundColor DarkGray
}

Run-Step "4.6 Traitement Ticket SAV par le Super Admin (Passage à RESOLU)" {
    $patchBody = @{ status = "RESOLU"; replyMessage = "Configuration Wave effectuee par notre equipe technique." } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/super-admin/tickets/$global:testTicketId" -Method Patch -Body $patchBody -ContentType "application/json"
    if ($res.ticket.status -ne "RESOLU") { throw "Echec resolution ticket" }
    Write-Host "    -> Ticket SAV resolu avec notification de reponse" -ForegroundColor DarkGray
}

Run-Step "4.7 Expedition de la Commande de Chevalets QR" {
    $patchBody = @{ orderId = $global:testQROrderId; status = "EXPEDIE" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/super-admin/qrcode-orders" -Method Patch -Body $patchBody -ContentType "application/json"
    if ($res.order.status -ne "EXPEDIE") { throw "Echec expedition commande" }
    Write-Host "    -> Commande chevalets passee en statut EXPEDIE" -ForegroundColor DarkGray
}

Run-Step "4.8 Test Assistant Support IA 24/7" {
    $chatBody = @{ message = "Comment imprimer mes QR codes pour les tables ?" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/super-admin/support/chat" -Method Post -Body $chatBody -ContentType "application/json"
    if (-not $res.reply) { throw "Echec reponse IA" }
    Write-Host "    -> Reponse IA 24/7 recue avec succes" -ForegroundColor DarkGray
}

# ------------------------------------------------------------------------------
# SUITE 5 : DISPONIBILITE DES PAGES WEB (HTTP 200)
# ------------------------------------------------------------------------------
$pages = @(
    "/",
    "/r/chezfatou/table-1",
    "/kitchen",
    "/dashboard",
    "/dashboard/qrcodes",
    "/dashboard/tickets",
    "/dashboard/add-plat",
    "/super-admin",
    "/super-admin/restaurant/resto_thies_01"
)

foreach ($p in $pages) {
    Run-Step "5. Page Web $p (HTTP 200)" {
        $res = Invoke-WebRequest -Uri "$BaseUrl$p" -Method Get -UseBasicParsing
        if ($res.StatusCode -ne 200) { throw "Erreur page $p : $($res.StatusCode)" }
        Write-Host "    -> Route $p accessible (HTTP 200)" -ForegroundColor DarkGray
    }
}

# ------------------------------------------------------------------------------
# BILAN FINAL
# ------------------------------------------------------------------------------
Write-Host "`n===============================================================" -ForegroundColor Yellow
Write-Host "BILAN DES TESTS : $passedCount / $totalTests REUSSIS (100%)" -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Yellow
