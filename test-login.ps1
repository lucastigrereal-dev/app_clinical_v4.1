# Test login endpoint
$apiUrl = "https://appclinicalv41-production.up.railway.app"

Write-Host "Testing login endpoint..." -ForegroundColor Cyan

$body = @{
    email = "admin@clinic.com"
    password = "Admin@123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest `
        -Uri "$apiUrl/api/auth/login" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -UseBasicParsing

    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    Write-Host $response.Content
} catch {
    Write-Host "❌ Login failed!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red

    if ($_.ErrorDetails.Message) {
        Write-Host "Details:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message
    }
}
