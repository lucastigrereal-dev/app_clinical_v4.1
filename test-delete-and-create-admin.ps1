# Delete existing admin and create new one via seed endpoint
$apiUrl = "https://appclinicalv41-production.up.railway.app"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "TESTE: Criar admin via endpoint" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Test if we can call the seed endpoint to override/create admin
Write-Host "Chamando POST /api/seed/admin..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest `
        -Uri "$apiUrl/api/seed/admin" `
        -Method POST `
        -UseBasicParsing `
        -TimeoutSec 15

    Write-Host "✅ Resposta recebida!" -ForegroundColor Green
    $result = $response.Content | ConvertFrom-Json
    Write-Host "  Message: $($result.message)" -ForegroundColor White
    Write-Host "  Email: $($result.email)" -ForegroundColor White
    Write-Host "  Created: $($result.created)" -ForegroundColor White

    if ($result.created -eq $false) {
        Write-Host ""
        Write-Host "⚠️ Usuário JÁ EXISTE (criado pela migration)" -ForegroundColor Yellow
        Write-Host "Vou testar login com diferentes variações de senha..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erro ao chamar seed endpoint" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "TESTANDO LOGIN" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Try different password variations
$passwords = @("Admin@123", "admin123", "Admin123", "password123")

foreach ($pwd in $passwords) {
    Write-Host "Tentando senha: $pwd..." -NoNewline

    $body = @{
        email = "admin@clinic.com"
        password = $pwd
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest `
            -Uri "$apiUrl/api/auth/login" `
            -Method POST `
            -Body $body `
            -ContentType "application/json" `
            -UseBasicParsing `
            -ErrorAction Stop

        Write-Host " ✅ SUCESSO!" -ForegroundColor Green
        $loginData = $response.Content | ConvertFrom-Json
        Write-Host "  Token: $($loginData.access_token.Substring(0,20))..." -ForegroundColor Green
        Write-Host ""
        Write-Host "SENHA CORRETA: $pwd" -ForegroundColor Green
        break
    } catch {
        Write-Host " ❌ Falhou" -ForegroundColor Red
    }
}

Write-Host ""
