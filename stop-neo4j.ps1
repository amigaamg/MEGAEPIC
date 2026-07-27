$procs = Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*neo4j*" }
if ($procs) {
    $procs | Stop-Process -Force
    Write-Output "Neo4j stopped"
} else {
    Write-Output "No Neo4j processes found"
}
