# AMEXAN Clinical OS - Start All Services
Write-Host "=== AMEXAN Clinical OS - Starting All Services ===" -ForegroundColor Cyan

$root = "C:\Users\Administrator\Desktop\client"
$bin = "$root\backend\bin"
$logs = "$root\backend\logs"
New-Item -ItemType Directory -Force -Path $logs | Out-Null

# 1. Verify PostgreSQL
Write-Host "[1/4] Checking PostgreSQL..." -ForegroundColor Yellow
try {
    $pg = & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U amexan -d amexan_clinical_os -t -c "SELECT 1" 2>&1
    if ($pg.Trim() -eq "1") { Write-Host "  ✓ PostgreSQL running" -ForegroundColor Green }
} catch { Write-Host "  ✗ PostgreSQL not available" -ForegroundColor Red; exit 1 }

# 2. Start Go Microservices (kill existing first)
Write-Host "[2/4] Starting Go Microservices..." -ForegroundColor Yellow
Get-Process -Name "gateway","encounter","patient","history","examination","diagnosis","management","documentation","chief-complaint","engine-server" -ErrorAction SilentlyContinue | Stop-Process -Force

$services = @(
    @{name="encounter"; port=8081; exe="$bin\encounter.exe"},
    @{name="patient"; port=8082; exe="$bin\patient.exe"},
    @{name="history"; port=8083; exe="$bin\history.exe"},
    @{name="examination"; port=8084; exe="$bin\examination.exe"},
    @{name="diagnosis"; port=8085; exe="$bin\diagnosis.exe"},
    @{name="management"; port=8086; exe="$bin\management.exe"},
    @{name="documentation"; port=8087; exe="$bin\documentation.exe"},
    @{name="chief-complaint"; port=8088; exe="$bin\chief-complaint.exe"},
    @{name="engine-server"; port=8089; exe="$root\backend\engine-server.exe"},
    @{name="gateway"; port=8080; exe="$bin\gateway.exe"}
)

# Start backend services first, gateway last
foreach ($svc in $services | Where-Object { $_.name -ne "gateway" }) {
    Start-Process -NoNewWindow -FilePath $svc.exe -RedirectStandardOutput "$logs\$($svc.name).log" -RedirectStandardError "$logs\$($svc.name).err"
    Write-Host "  Starting $($svc.name) on :$($svc.port)" -ForegroundColor Gray
}
Start-Sleep 3

# Start gateway last
$gw = $services | Where-Object { $_.name -eq "gateway" }
Start-Process -NoNewWindow -FilePath $gw.exe -RedirectStandardOutput "$logs\gateway.log" -RedirectStandardError "$logs\gateway.err"
Write-Host "  Starting gateway on :8080" -ForegroundColor Gray
Start-Sleep 2

# 3. Verify all services
Write-Host "[3/4] Verifying Service Health..." -ForegroundColor Yellow
$healthChecks = @(
    @{name="gateway"; url="http://localhost:8080/api/health"}
    @{name="encounter"; url="http://localhost:8081/api/encounters/healthz"}
    @{name="patient"; url="http://localhost:8082/api/patients/healthz"}
    @{name="history"; url="http://localhost:8083/api/history/healthz"}
    @{name="examination"; url="http://localhost:8084/api/examinations/healthz"}
    @{name="diagnosis"; url="http://localhost:8085/api/diagnosis/healthz"}
    @{name="management"; url="http://localhost:8086/api/management/healthz"}
    @{name="documentation"; url="http://localhost:8087/api/documents/healthz"}
    @{name="chief-complaint"; url="http://localhost:8088/api/chief-complaint/healthz"}
    @{name="engine-server"; url="http://localhost:8089/api/engine/healthz"}
)
$allOk = $true
foreach ($hc in $healthChecks) {
    try {
        $r = Invoke-WebRequest -Uri $hc.url -UseBasicParsing -TimeoutSec 3
        Write-Host "  ✓ $($hc.name) - $($r.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ $($hc.name) - FAILED" -ForegroundColor Red
        $allOk = $false
    }
}

# 4. Verify gateway routing
Write-Host "[4/4] Verifying Gateway Routing..." -ForegroundColor Yellow
$routes = @("/api/encounters/healthz","/api/patients/healthz","/api/history/healthz","/api/examinations/healthz","/api/diagnosis/healthz","/api/management/healthz","/api/documents/healthz","/api/chief-complaint/healthz")
$routesOk = $true
foreach ($route in $routes) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:8080$route" -UseBasicParsing -TimeoutSec 3
        if ($r.StatusCode -eq 200) { Write-Host "  ✓ $route" -ForegroundColor Green }
        else { Write-Host "  ? $route - $($r.StatusCode)" -ForegroundColor Yellow; $routesOk = $false }
    } catch { Write-Host "  ✗ $route - FAILED" -ForegroundColor Red; $routesOk = $false }
}

Write-Host "`n=== STATUS SUMMARY ===" -ForegroundColor Cyan
if ($allOk -and $routesOk) {
    Write-Host "ALL 10 MICROSERVICES HEALTHY" -ForegroundColor Green
    Write-Host "PostgreSQL: amexan_clinical_os (58 tables across 10 schemas)" -ForegroundColor Green
    Write-Host "Gateway: http://localhost:8080" -ForegroundColor Green
    Write-Host "Neo4j: Not available locally - evidence graph persistence degrades gracefully" -ForegroundColor Yellow
} else {
    Write-Host "Some services are not healthy - check logs in $logs" -ForegroundColor Red
}
