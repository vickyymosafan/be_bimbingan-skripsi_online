# PowerShell script to test all SIBMO API endpoints
$BASE_URL = "http://localhost:3000/api/v1"

# Test results storage
$passCount = 0
$failCount = 0
$results = @()

# User credentials
$users = @{
    admin = @{
        email = "admin@sibmo.ac.id"
        password = "Password123!"
    }
    dosen = @{
        email = "budi.santoso@dosen.ac.id"
        password = "Password123!"
    }
    mahasiswa = @{
        email = "andi.pratama@mahasiswa.ac.id"
        password = "Password123!"
    }
}

# Store tokens
$tokens = @{}
$userInfo = @{}

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Path,
        [string]$Role,
        [hashtable]$Body = $null,
        [string]$Description = ""
    )
    
    $testName = "$Method $Path ($Role)"
    Write-Host "`n🧪 Testing: $testName" -ForegroundColor Cyan
    Write-Host "   $Description"
    
    try {
        $headers = @{}
        
        if ($tokens[$Role]) {
            $headers["Authorization"] = "Bearer $($tokens[$Role])"
        }
        
        $uri = "$BASE_URL$Path"
        $params = @{
            Uri = $uri
            Method = $Method
            Headers = $headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Host "   ✅ PASS" -ForegroundColor Green
        $script:passCount++
        
        $script:results += [PSCustomObject]@{
            Endpoint = "$Method $Path"
            Role = $Role
            Status = "PASS"
            Description = $Description
        }
        
        return $response
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $message = $_.ErrorDetails.Message | ConvertFrom-Json | Select-Object -ExpandProperty message -ErrorAction SilentlyContinue
        
        Write-Host "   ❌ FAIL - Status: $statusCode - $message" -ForegroundColor Red
        $script:failCount++
        
        $script:results += [PSCustomObject]@{
            Endpoint = "$Method $Path"
            Role = $Role
            Status = "FAIL"
            HttpStatus = $statusCode
            Error = $message
            Description = $Description
        }
        
        return $null
    }
}

# Test Authentication
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "🔐 TESTING AUTHENTICATION ENDPOINTS" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

# Login for each role
foreach ($role in $users.Keys) {
    $result = Test-Endpoint -Method "POST" -Path "/auth/login" -Role $role `
        -Body $users[$role] -Description "Login sebagai $role"
    
    if ($result) {
        $tokens[$role] = $result.data.accessToken
        $userInfo[$role] = $result.data.user
    }
}

# Test register new user
$registerData = @{
    nama = "Test User"
    email = "test@mahasiswa.ac.id"
    password = "Password123!"
    role = "MAHASISWA"
    nim = "2020001010"
}
Test-Endpoint -Method "POST" -Path "/auth/register" -Role "public" `
    -Body $registerData -Description "Register user baru"

# Test profile for each role
foreach ($role in $users.Keys) {
    Test-Endpoint -Method "GET" -Path "/auth/profile" -Role $role `
        -Description "Get profile untuk $role"
}

# Test User Endpoints
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "👥 TESTING USER ENDPOINTS" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

# GET /users
Test-Endpoint -Method "GET" -Path "/users" -Role "admin" -Description "Admin get all users"
Test-Endpoint -Method "GET" -Path "/users" -Role "dosen" -Description "Dosen get all users"
Test-Endpoint -Method "GET" -Path "/users" -Role "mahasiswa" -Description "Mahasiswa get all users"

# GET /users/:id
if ($userInfo["mahasiswa"].id) {
    $mahasiswaId = $userInfo["mahasiswa"].id
    Test-Endpoint -Method "GET" -Path "/users/$mahasiswaId" -Role "admin" `
        -Description "Admin get user by ID"
    Test-Endpoint -Method "GET" -Path "/users/$mahasiswaId" -Role "mahasiswa" `
        -Description "Mahasiswa get own profile"
}

# Test Proposal Endpoints
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "📄 TESTING PROPOSAL ENDPOINTS" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

# Create proposal
$proposalData = @{
    judul = "Sistem Informasi Akademik Berbasis Web"
    deskripsi = "Penelitian ini bertujuan untuk mengembangkan sistem informasi akademik yang terintegrasi"
    bidangKajian = "Sistem Informasi"
    metodePenelitian = "Waterfall"
}

if ($userInfo["dosen"].id) {
    $proposalData["dosenPembimbingId"] = $userInfo["dosen"].id
}

$createResult = Test-Endpoint -Method "POST" -Path "/proposals" -Role "mahasiswa" `
    -Body $proposalData -Description "Mahasiswa create proposal"

$proposalId = $null
if ($createResult) {
    $proposalId = $createResult.data.id
}

# Test other proposal endpoints
Test-Endpoint -Method "GET" -Path "/proposals" -Role "admin" -Description "Admin get all proposals"
Test-Endpoint -Method "GET" -Path "/proposals" -Role "dosen" -Description "Dosen get proposals"
Test-Endpoint -Method "GET" -Path "/proposals" -Role "mahasiswa" -Description "Mahasiswa get own proposals"

if ($proposalId) {
    Test-Endpoint -Method "GET" -Path "/proposals/$proposalId" -Role "mahasiswa" `
        -Description "Mahasiswa get own proposal"
    
    # Update proposal
    $updateData = @{ abstrak = "Abstrak penelitian..." }
    Test-Endpoint -Method "PATCH" -Path "/proposals/$proposalId" -Role "mahasiswa" `
        -Body $updateData -Description "Mahasiswa update proposal"
    
    # Submit proposal
    Test-Endpoint -Method "POST" -Path "/proposals/$proposalId/submit" -Role "mahasiswa" `
        -Description "Mahasiswa submit proposal"
}

# Test statistics
Test-Endpoint -Method "GET" -Path "/proposals/statistics" -Role "admin" -Description "Admin get statistics"
Test-Endpoint -Method "GET" -Path "/proposals/statistics" -Role "mahasiswa" -Description "Mahasiswa get statistics"

# Test Bimbingan Endpoints
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "💬 TESTING BIMBINGAN ENDPOINTS" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

if ($proposalId) {
    $bimbinganData = @{
        proposalId = $proposalId
        topik = "Pembahasan BAB I Pendahuluan"
        tanggal = "2024-12-01"
        waktuMulai = "10:00"
        tipeBimbingan = "OFFLINE"
        lokasi = "Ruang Dosen Lt. 3"
    }
    
    $bimbinganResult = Test-Endpoint -Method "POST" -Path "/bimbingan" -Role "dosen" `
        -Body $bimbinganData -Description "Dosen create bimbingan"
    
    $bimbinganId = $null
    if ($bimbinganResult) {
        $bimbinganId = $bimbinganResult.data.id
    }
}

# Get bimbingan
Test-Endpoint -Method "GET" -Path "/bimbingan" -Role "admin" -Description "Admin get all bimbingan"
Test-Endpoint -Method "GET" -Path "/bimbingan" -Role "dosen" -Description "Dosen get bimbingan"
Test-Endpoint -Method "GET" -Path "/bimbingan" -Role "mahasiswa" -Description "Mahasiswa get bimbingan"

# Get upcoming
Test-Endpoint -Method "GET" -Path "/bimbingan/upcoming" -Role "dosen" -Description "Dosen get upcoming"
Test-Endpoint -Method "GET" -Path "/bimbingan/upcoming" -Role "mahasiswa" -Description "Mahasiswa get upcoming"

# Summary
Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "📊 TEST RESULTS SUMMARY" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow

Write-Host "`n✅ Total PASS: $passCount" -ForegroundColor Green
Write-Host "❌ Total FAIL: $failCount" -ForegroundColor Red

$passRate = if (($passCount + $failCount) -gt 0) { 
    [math]::Round(($passCount / ($passCount + $failCount)) * 100, 2) 
} else { 0 }
Write-Host "📈 Pass Rate: $passRate%`n" -ForegroundColor Cyan

# Display results table
Write-Host "DETAILED RESULTS:" -ForegroundColor Yellow
Write-Host "-" * 80

$results | Format-Table -Property Endpoint, Role, Status, Description -AutoSize

# Save results to file
$reportData = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    summary = @{
        totalTests = $passCount + $failCount
        passed = $passCount
        failed = $failCount
        passRate = "$passRate%"
    }
    results = $results
}

$reportData | ConvertTo-Json -Depth 10 | Out-File "test-results.json"
Write-Host "`n📁 Results saved to test-results.json" -ForegroundColor Green
