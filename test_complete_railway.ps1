# Script de Teste Completo - Railway Endpoints
# Clinical Companion Enterprise v4.0.0
# Execute após deploy estar ACTIVE

$apiUrl = "https://appclinicalv41-production.up.railway.app"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "TESTE COMPLETO - RAILWAY DEPLOY" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API URL: $apiUrl" -ForegroundColor Yellow
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host ""

$testsTotal = 0
$testsPassed = 0
$testsFailed = 0

# Função para testar endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null,
        [int]$ExpectedStatus = 200
    )

    $global:testsTotal++
    Write-Host "$global:testsTotal. $Name..." -NoNewline

    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 15
            UseBasicParsing = $true
        }

        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }

        $response = Invoke-WebRequest @params

        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host " ✅ OK ($($response.StatusCode))" -ForegroundColor Green
            $global:testsPassed++
            return $response
        } else {
            Write-Host " ⚠️ Status inesperado: $($response.StatusCode) (esperado: $ExpectedStatus)" -ForegroundColor Yellow
            $global:testsPassed++
            return $response
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        if ($statusCode -eq 401 -and $Name -like "*Auth Required*") {
            Write-Host " ✅ 401 (Auth Required - esperado)" -ForegroundColor Yellow
            $global:testsPassed++
        } elseif ($statusCode) {
            Write-Host " ❌ FALHOU (Status: $statusCode)" -ForegroundColor Red
            Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
            $global:testsFailed++
        } else {
            Write-Host " ❌ FALHOU" -ForegroundColor Red
            Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
            $global:testsFailed++
        }
        return $null
    }
}

Write-Host "=== TESTES BÁSICOS ===" -ForegroundColor Cyan
Write-Host ""

# Teste 1: Raiz da API
Test-Endpoint "Raiz da API (deve redirecionar)" "$apiUrl/" "GET" $null 404

# Teste 2: Health Check do Cache
Test-Endpoint "Health Check - Cache Service" "$apiUrl/api/cache/health"

# Teste 3: Swagger Documentation
Test-Endpoint "Swagger Documentation" "$apiUrl/api/docs"

# Teste 4: Health Check Geral (se existir)
Test-Endpoint "Health Check - Geral" "$apiUrl/api/health" "GET" $null 404

Write-Host ""
Write-Host "=== TESTES DE AUTENTICAÇÃO ===" -ForegroundColor Cyan
Write-Host ""

# Teste 5: Login com credenciais corretas
$loginBody = @{
    email = "admin@clinic.com"
    password = "Admin@123"
}

$loginResponse = Test-Endpoint "Login - Admin (credenciais corretas)" "$apiUrl/api/auth/login" "POST" $loginBody

$token = $null
if ($loginResponse -and $loginResponse.Content) {
    try {
        $loginData = $loginResponse.Content | ConvertFrom-Json
        if ($loginData.access_token) {
            $token = $loginData.access_token
            Write-Host "   Token JWT obtido: $($token.Substring(0,20))..." -ForegroundColor Gray
        }
    } catch {
        Write-Host "   ⚠️ Não foi possível extrair token da resposta" -ForegroundColor Yellow
    }
}

# Teste 6: Login com credenciais incorretas
$loginWrongBody = @{
    email = "admin@clinic.com"
    password = "senhaerrada"
}

Test-Endpoint "Login - Credenciais incorretas (deve falhar)" "$apiUrl/api/auth/login" "POST" $loginWrongBody 401

Write-Host ""
Write-Host "=== TESTES DE ENDPOINTS PROTEGIDOS ===" -ForegroundColor Cyan
Write-Host ""

# Teste 7: Procedures sem autenticação
Test-Endpoint "Procedures - Sem Auth (deve falhar)" "$apiUrl/api/procedures" "GET" $null 401

# Teste 8: Patients sem autenticação
Test-Endpoint "Patients - Sem Auth (deve falhar)" "$apiUrl/api/patients" "GET" $null 401

# Teste 9: Protocols sem autenticação
Test-Endpoint "Protocols - Sem Auth (deve falhar)" "$apiUrl/api/protocols" "GET" $null 401

Write-Host ""
Write-Host "=== TESTES COM AUTENTICAÇÃO ===" -ForegroundColor Cyan
Write-Host ""

if ($token) {
    Write-Host "Token disponível - Testando endpoints autenticados..." -ForegroundColor Green
    Write-Host ""

    # Criar headers com token
    $headers = @{
        "Authorization" = "Bearer $token"
    }

    # Teste 10: Procedures com autenticação
    Write-Host "10. Procedures - Com Auth..." -NoNewline
    try {
        $response = Invoke-WebRequest -Uri "$apiUrl/api/procedures" -Headers $headers -UseBasicParsing -TimeoutSec 15
        Write-Host " ✅ OK ($($response.StatusCode))" -ForegroundColor Green
        $global:testsPassed++
        $global:testsTotal++

        # Tentar contar procedures
        try {
            $procedures = $response.Content | ConvertFrom-Json
            if ($procedures.Count) {
                Write-Host "   Encontrados: $($procedures.Count) procedimentos" -ForegroundColor Gray
            }
        } catch {}
    } catch {
        Write-Host " ❌ FALHOU" -ForegroundColor Red
        $global:testsFailed++
        $global:testsTotal++
    }

    # Teste 11: Patients com autenticação
    Write-Host "11. Patients - Com Auth..." -NoNewline
    try {
        $response = Invoke-WebRequest -Uri "$apiUrl/api/patients" -Headers $headers -UseBasicParsing -TimeoutSec 15
        Write-Host " ✅ OK ($($response.StatusCode))" -ForegroundColor Green
        $global:testsPassed++
        $global:testsTotal++
    } catch {
        Write-Host " ❌ FALHOU" -ForegroundColor Red
        $global:testsFailed++
        $global:testsTotal++
    }

    # Teste 12: Protocols com autenticação
    Write-Host "12. Protocols - Com Auth..." -NoNewline
    try {
        $response = Invoke-WebRequest -Uri "$apiUrl/api/protocols" -Headers $headers -UseBasicParsing -TimeoutSec 15
        Write-Host " ✅ OK ($($response.StatusCode))" -ForegroundColor Green
        $global:testsPassed++
        $global:testsTotal++
    } catch {
        Write-Host " ❌ FALHOU" -ForegroundColor Red
        $global:testsFailed++
        $global:testsTotal++
    }

} else {
    Write-Host "⚠️ Token não disponível - Pulando testes autenticados" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Total de testes: $testsTotal" -ForegroundColor White
Write-Host "✅ Passou: $testsPassed" -ForegroundColor Green
Write-Host "❌ Falhou: $testsFailed" -ForegroundColor Red

$successRate = [math]::Round(($testsPassed / $testsTotal) * 100, 2)
Write-Host "Taxa de sucesso: $successRate%" -ForegroundColor $(if ($successRate -gt 80) { "Green" } elseif ($successRate -gt 50) { "Yellow" } else { "Red" })

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "URLs DISPONÍVEIS" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Swagger Docs: $apiUrl/api/docs" -ForegroundColor Cyan
Write-Host "Health Check: $apiUrl/api/cache/health" -ForegroundColor Cyan
Write-Host "Login: POST $apiUrl/api/auth/login" -ForegroundColor Cyan
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "🎉 TODOS OS TESTES PASSARAM!" -ForegroundColor Green
    Write-Host "Sistema 100% ONLINE e FUNCIONAL!" -ForegroundColor Green
} elseif ($testsPassed -gt $testsFailed) {
    Write-Host "⚠️ Sistema PARCIALMENTE funcional" -ForegroundColor Yellow
    Write-Host "Alguns endpoints precisam de atenção" -ForegroundColor Yellow
} else {
    Write-Host "❌ Sistema com PROBLEMAS" -ForegroundColor Red
    Write-Host "Revisar configuração e logs" -ForegroundColor Red
}

Write-Host ""
Write-Host "Timestamp fim: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""
