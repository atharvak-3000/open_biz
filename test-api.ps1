# Test the backend API

Write-Host "Testing Udyam Registration API..." -ForegroundColor Green

# Test 1: Check if server is running
Write-Host "`nTest 1: Checking server status..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/" -Method GET
    Write-Host "✓ Server is running: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "✗ Server is not running or not accessible" -ForegroundColor Red
    Write-Host "Please start the backend server first: cd backend && node index.js" -ForegroundColor Yellow
    exit 1
}

# Test 2: Aadhaar verification
Write-Host "`nTest 2: Testing Aadhaar verification..." -ForegroundColor Yellow
$aadhaarData = @{
    aadhaar = "123456789012"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/verify-aadhaar" -Method POST -Body $aadhaarData -ContentType "application/json"
    Write-Host "✓ Aadhaar verification successful: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "✗ Aadhaar verification failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: OTP verification
Write-Host "`nTest 3: Testing OTP verification..." -ForegroundColor Yellow
$otpData = @{
    otp = "123456"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/verify-otp" -Method POST -Body $otpData -ContentType "application/json"
    Write-Host "✓ OTP verification successful: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "✗ OTP verification failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Final submission
Write-Host "`nTest 4: Testing final submission..." -ForegroundColor Yellow
$validData = @{
    aadhaar = "123456789012"
    otp = "123456"
    pan = "ABCDE1234F"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/submit" -Method POST -Body $validData -ContentType "application/json"
    Write-Host "✓ Final submission successful: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "✗ Final submission failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Invalid Aadhaar
Write-Host "`nTest 5: Testing invalid Aadhaar..." -ForegroundColor Yellow
$invalidData = @{
    aadhaar = "123"
    otp = "123456"
    pan = "ABCDE1234F"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/submit" -Method POST -Body $invalidData -ContentType "application/json"
    Write-Host "✗ Should have failed but didn't" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorResponse.errors -contains "Aadhaar number must be exactly 12 digits") {
        Write-Host "✓ Invalid Aadhaar correctly rejected" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $($errorResponse.errors)" -ForegroundColor Red
    }
}

# Test 6: Invalid PAN
Write-Host "`nTest 6: Testing invalid PAN..." -ForegroundColor Yellow
$invalidPanData = @{
    aadhaar = "123456789012"
    otp = "123456"
    pan = "INVALID"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/submit" -Method POST -Body $invalidPanData -ContentType "application/json"
    Write-Host "✗ Should have failed but didn't" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorResponse.errors -contains "PAN must be in format: 5 letters, 4 digits, 1 letter") {
        Write-Host "✓ Invalid PAN correctly rejected" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $($errorResponse.errors)" -ForegroundColor Red
    }
}

Write-Host "`nAPI testing completed!" -ForegroundColor Green
