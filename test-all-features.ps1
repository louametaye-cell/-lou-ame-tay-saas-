# Test automatisé de toutes les fonctionnalités Dashboard SAV & Super Admin

Write-Host "=== TEST 1: GET /api/dashboard/qrcodes/order ===" -ForegroundColor Cyan
$resQROrders = Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/qrcodes/order" -Method Get
Write-Host "Nombre de commandes QR trouvées : $($resQROrders.orders.Count)" -ForegroundColor Green

Write-Host "`n=== TEST 2: POST /api/dashboard/qrcodes/order ===" -ForegroundColor Cyan
$newQRBody = @{
    restaurantId = "resto_thies_01"
    restaurantName = "Chez Fatou & Frères"
    packTitle = "Jeu de 6 à 12 tables"
    tableCount = 12
    format = "A5 plastifié + chevalet"
    price = 8000
    city = "Thiès"
    phone = "+221 77 654 32 10"
} | ConvertTo-Json
$resCreateQR = Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/qrcodes/order" -Method Post -Body $newQRBody -ContentType "application/json"
Write-Host "Commande créée : $($resCreateQR.order.id) - $($resCreateQR.order.packTitle)" -ForegroundColor Green

Write-Host "`n=== TEST 3: POST /api/dashboard/tickets ===" -ForegroundColor Cyan
$ticketBody = @{
    restaurantId = "resto_thies_01"
    restaurantName = "Chez Fatou & Frères"
    subject = "Vérification sonnerie nouvelle commande"
    message = "Le bip sonore ne retentit pas toujours en cuisine lors d'un pic d'affluence."
    priority = "HAUTE"
} | ConvertTo-Json
$resTicket = Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/tickets" -Method Post -Body $ticketBody -ContentType "application/json"
Write-Host "Ticket SAV créé : $($resTicket.ticket.id) - $($resTicket.ticket.subject)" -ForegroundColor Green
$ticketId = $resTicket.ticket.id

Write-Host "`n=== TEST 4: POST /api/dashboard/tickets/$ticketId/message ===" -ForegroundColor Cyan
$msgBody = @{
    content = "Nous avons vérifié les autorisations du navigateur sur la tablette cuisine."
    sender = "CLIENT"
    senderName = "Gérant Chez Fatou"
} | ConvertTo-Json
$resMsg = Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/tickets/$ticketId/message" -Method Post -Body $msgBody -ContentType "application/json"
Write-Host "Message ajouté au ticket : $($resMsg.message.content)" -ForegroundColor Green

Write-Host "`n=== TEST 5: POST /api/dashboard/menu-request ===" -ForegroundColor Cyan
$dishReqBody = @{
    restaurantId = "resto_thies_01"
    restaurantName = "Chez Fatou & Frères"
    name = "Pastels au Thon Maison"
    wolofName = "Pastels Jën"
    description = "Beignets croustillants farcis au thon avec sauce tomate pimentée à part."
    price = 2500
    category = "🥗 Entrées & Tapas"
    allergens = @("Gluten", "Poisson", "Œufs")
} | ConvertTo-Json
$resDish = Invoke-RestMethod -Uri "http://localhost:3000/api/dashboard/menu-request" -Method Post -Body $dishReqBody -ContentType "application/json"
Write-Host "Demande d'ajout de plat créée : $($resDish.menuRequest.id) - $($resDish.menuRequest.name)" -ForegroundColor Green

Write-Host "`n=== TEST 6: PATCH /api/super-admin/tickets/$ticketId ===" -ForegroundColor Cyan
$treatTicketBody = @{
    status = "RESOLU"
    replyMessage = "Problème réglé : autorisation audio débloquée et test validé avec succès."
} | ConvertTo-Json
$resTreat = Invoke-RestMethod -Uri "http://localhost:3000/api/super-admin/tickets/$ticketId" -Method Patch -Body $treatTicketBody -ContentType "application/json"
Write-Host "Statut du ticket Super Admin : $($resTreat.ticket.status)" -ForegroundColor Green

Write-Host "`n=== TEST 7: PATCH /api/super-admin/qrcode-orders ===" -ForegroundColor Cyan
$qrOrderId = $resCreateQR.order.id
$updateQRBody = @{
    orderId = $qrOrderId
    status = "EXPEDIE"
} | ConvertTo-Json
$resUpdateQR = Invoke-RestMethod -Uri "http://localhost:3000/api/super-admin/qrcode-orders" -Method Patch -Body $updateQRBody -ContentType "application/json"
Write-Host "Statut commande chevalets Super Admin : $($resUpdateQR.order.status)" -ForegroundColor Green

Write-Host "`n=== TOUS LES TESTS SONT VALIDES AVEC SUCCES 🚀 ===" -ForegroundColor Green
