# Start all AMEXAN Go backend microservices
$BackendRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$env:DATABASE_URL = "postgres://postgres:postgres@localhost:5432/amexan?sslmode=disable"

$services = @(
    @{ Name="encounter";     Port=8081; Path="bin\encounter.exe" },
    @{ Name="patient";       Port=8082; Path="bin\patient.exe" },
    @{ Name="history";       Port=8083; Path="bin\history.exe" },
    @{ Name="examination";   Port=8084; Path="bin\examination.exe" },
    @{ Name="diagnosis";     Port=8085; Path="bin\diagnosis.exe" },
    @{ Name="management";    Port=8086; Path="bin\management.exe" },
    @{ Name="documentation"; Port=8087; Path="bin\documentation.exe" },
    @{ Name="engine-server"; Port=8089; Path="bin\engine-server.exe" }
)

Write-Host "Starting AMEXAN Backend Microservices..." -ForegroundColor Cyan

foreach ($svc in $services) {
    $exePath = Join-Path $BackendRoot $svc.Path
    if (Test-Path $exePath) {
        $logFile = Join-Path $BackendRoot "logs\$($svc.Name).log"
        New-Item -ItemType Directory -Force -Path (Join-Path $BackendRoot "logs") | Out-Null
        $jobName = "amexan_$($svc.Name)"
        Start-Job -Name $jobName -ScriptBlock {
            param($exe, $port, $log)
            $env:PORT = $port
            & $exe *>&1 | Out-File -FilePath $log -Append
        } -ArgumentList $exePath, $svc.Port, $logFile
        Write-Host "  ✅ $($svc.Name) starting on port $($svc.Port)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($svc.Name) binary not found at $exePath" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 2

# Start gateway last
$gatewayExe = Join-Path $BackendRoot "bin\gateway.exe"
if (Test-Path $gatewayExe) {
    $gwLog = Join-Path $BackendRoot "logs\gateway.log"
    Start-Job -Name "amexan_gateway" -ScriptBlock {
        param($exe, $log)
        & $exe *>&1 | Out-File -FilePath $log -Append
    } -ArgumentList $gatewayExe, $gwLog
    Write-Host "  ✅ gateway starting on port 8090" -ForegroundColor Green
}

Write-Host ""
Write-Host "All services started. Check logs in $BackendRoot\logs\" -ForegroundColor Cyan
Write-Host "Gateway: http://localhost:8090" -ForegroundColor Yellow
