$env:JAVA_HOME = "$env:USERPROFILE\AppData\Local\Temp\neo4j\java\jdk-17.0.12+7"
$neo4jHome = "$env:USERPROFILE\AppData\Local\Temp\neo4j\neo4j\neo4j-community-5.26.0"

$existing = Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*neo4j*" }
if ($existing) {
    Write-Output "Neo4j is already running (PID: $($existing.Id))"
    exit 0
}

Write-Output "Starting Neo4j..."
$p = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", """$neo4jHome\bin\neo4j.bat"" console" -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 20

$client = New-Object System.Net.Sockets.TcpClient
try {
    $client.Connect('localhost', 7687)
    Write-Output "Neo4j is RUNNING (PID: $($p.Id)) - Bolt on 7687, HTTP on 7474"
} catch {
    Write-Output "Neo4j may still be starting. Check logs at: $neo4jHome\logs\"
}
$client.Dispose()
