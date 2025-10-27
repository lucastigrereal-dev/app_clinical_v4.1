# Test seed admin endpoint
$apiUrl = "https://appclinicalv41-production.up.railway.app"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "CRIANDO USUÁRIO ADMIN" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest `
        -Uri "$apiUrl/api/seed/admin" `
        -Method POST `
        -UseBasicParsing `
        -TimeoutSec 15

    Write-Host "✅ SUCESSO!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Resposta:" -ForegroundColor Yellow
    $result = $response.Content | ConvertFrom-Json
    Write-Host "  Message: $($result.message)" -ForegroundColor White
    Write-Host "  Email: $($result.email)" -ForegroundColor White
    Write-Host "  Created: $($result.created)" -ForegroundColor White
    if ($result.password) {
        Write-Host "  Password: $($result.password)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ ERRO!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
