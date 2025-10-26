# Script de Teste - Railway Endpoints
# Execute após ativar networking

$apiUrl = "https://appclinicalv41-production.up.railway.app"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "TESTANDO ENDPOINTS RAILWAY" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Teste 1: Health Check
Write-Host "1. Testando Health Check..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/api/cache/health" -Method Get -TimeoutSec 10 -UseBasicParsing
    Write-Host " OK ($($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host " FALHOU" -ForegroundColor Red
    Write-Host "   Erro: $($_.Exception.Message)"
}

# Teste 2: Swagger Docs
Write-Host "2. Testando Swagger Docs..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/api/docs" -Method Get -TimeoutSec 10 -UseBasicParsing
    Write-Host " OK ($($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host " FALHOU" -ForegroundColor Red
}

# Teste 3: Lista Procedures
Write-Host "3. Testando Lista Procedures..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/api/procedures" -Method Get -TimeoutSec 10 -UseBasicParsing
    Write-Host " OK ($($response.StatusCode))" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    if ($statusCode -eq 401) {
        Write-Host " Auth Required (esperado)" -ForegroundColor Yellow
    } else {
        Write-Host " Status: $statusCode" -ForegroundColor Yellow
    }
}

# Teste 4: Login
Write-Host "4. Testando Login..." -NoNewline
$credentials = @{
    email = "admin@clinic.com"
    password = "Admin@123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/api/auth/login" -Method Post -ContentType "application/json" -Body $credentials -TimeoutSec 10
    if ($response.access_token) {
        Write-Host " OK (Token recebido)" -ForegroundColor Green
        Write-Host "   Token: $($response.access_token.Substring(0,20))..."
    }
} catch {
    Write-Host " FALHOU" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "URLs Disponíveis:" -ForegroundColor Green
Write-Host "  Swagger: $apiUrl/api/docs"
Write-Host "  Health:  $apiUrl/api/cache/health"
Write-Host "================================" -ForegroundColor Cyan
