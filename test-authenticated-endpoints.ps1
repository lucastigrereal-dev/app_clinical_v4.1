# Test authenticated endpoints with JWT token
$apiUrl = "https://appclinicalv41-production.up.railway.app"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "TESTE ENDPOINTS AUTENTICADOS" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login
Write-Host "1. Fazendo login..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@clinic.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest `
        -Uri "$apiUrl/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -UseBasicParsing

    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.access_token

    Write-Host "   ✅ Login successful!" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0,30))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "   ❌ Login failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Test authenticated endpoints
$headers = @{
    "Authorization" = "Bearer $token"
}

$endpoints = @(
    @{ Name = "Health Check"; Url = "/api/health"; Method = "GET" }
    @{ Name = "Swagger Docs"; Url = "/api/docs"; Method = "GET" }
    @{ Name = "Procedures"; Url = "/api/procedures"; Method = "GET" }
    @{ Name = "Patients"; Url = "/api/patients"; Method = "GET" }
    @{ Name = "Protocols"; Url = "/api/protocols"; Method = "GET" }
    @{ Name = "Cache Stats"; Url = "/api/cache/stats"; Method = "GET" }
)

$testsPassed = 0
$testsFailed = 0

Write-Host "2. Testando endpoints..." -ForegroundColor Yellow
Write-Host ""

foreach ($endpoint in $endpoints) {
    Write-Host "   Testing: $($endpoint.Name)..." -NoNewline

    try {
        $response = Invoke-WebRequest `
            -Uri "$apiUrl$($endpoint.Url)" `
            -Method $endpoint.Method `
            -Headers $headers `
            -UseBasicParsing `
            -TimeoutSec 10

        Write-Host " ✅ OK ($($response.StatusCode))" -ForegroundColor Green
        $testsPassed++

        # Show response preview for key endpoints
        if ($endpoint.Name -eq "Procedures" -or $endpoint.Name -eq "Patients") {
            try {
                $data = $response.Content | ConvertFrom-Json
                if ($data.Count -ne $null) {
                    Write-Host "      → Found: $($data.Count) items" -ForegroundColor Gray
                }
            } catch {}
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        Write-Host " ❌ FAILED ($statusCode)" -ForegroundColor Red
        $testsFailed++
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "RESUMO" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Total: $($testsPassed + $testsFailed) testes" -ForegroundColor White
Write-Host "✅ Passou: $testsPassed" -ForegroundColor Green
Write-Host "❌ Falhou: $testsFailed" -ForegroundColor Red

$successRate = [math]::Round(($testsPassed / ($testsPassed + $testsFailed)) * 100, 2)
Write-Host "Taxa de sucesso: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } elseif ($successRate -ge 80) { "Yellow" } else { "Red" })

Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "🎉🎉🎉 SISTEMA 100% FUNCIONAL! 🎉🎉🎉" -ForegroundColor Green
} else {
    Write-Host "⚠️ Alguns endpoints precisam de atenção" -ForegroundColor Yellow
}

Write-Host ""
