param(
  [switch]$OpenBrowser
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$runtimeLogs = Join-Path $repoRoot ".runtime-logs"
$runtimePids = Join-Path $repoRoot ".runtime-pids"

function Ensure-Directory([string]$Path) {
  if (-not (Test-Path $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

function Stop-PortProcesses([int[]]$Ports) {
  $processIds = Get-NetTCPConnection -ErrorAction SilentlyContinue |
    Where-Object { $_.LocalPort -in $Ports } |
    Select-Object -ExpandProperty OwningProcess -Unique

  foreach ($processId in $processIds) {
    try {
      Stop-Process -Id $processId -Force -ErrorAction Stop
    } catch {
    }
  }
}

function Wait-HttpOk([string]$Url, [int]$TimeoutSeconds = 40) {
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing $Url -TimeoutSec 5
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
        return $true
      }
    } catch {
    }

    Start-Sleep -Seconds 1
  }

  return $false
}

Ensure-Directory $runtimeLogs
Ensure-Directory $runtimePids

Stop-PortProcesses @(3000, 8080)

Set-Location $repoRoot

Remove-Item -Recurse -Force (Join-Path $repoRoot "packages\web\.next") -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force (Join-Path $repoRoot "packages\api\dist") -ErrorAction SilentlyContinue

Write-Host "Building API and Web for a clean local runtime..." -ForegroundColor Cyan
npm run build -w @amline/api
if ($LASTEXITCODE -ne 0) { throw "API build failed." }
npm run build -w @amline/web
if ($LASTEXITCODE -ne 0) { throw "Web build failed." }

$apiLog = Join-Path $runtimeLogs "api.log"
$apiErr = Join-Path $runtimeLogs "api.err.log"
$webLog = Join-Path $runtimeLogs "web.log"
$webErr = Join-Path $runtimeLogs "web.err.log"
$apiPidFile = Join-Path $runtimePids "api.pid"
$webPidFile = Join-Path $runtimePids "web.pid"

Remove-Item $apiLog, $apiErr, $webLog, $webErr, $apiPidFile, $webPidFile -Force -ErrorAction SilentlyContinue

$apiProcess = Start-Process -FilePath "cmd.exe" `
  -ArgumentList "/c node dist/src/server.js >> `"$apiLog`" 2>> `"$apiErr`"" `
  -WorkingDirectory (Join-Path $repoRoot "packages\api") `
  -PassThru

$webProcess = Start-Process -FilePath "cmd.exe" `
  -ArgumentList "/c npm run start -- --hostname 127.0.0.1 --port 3000 >> `"$webLog`" 2>> `"$webErr`"" `
  -WorkingDirectory (Join-Path $repoRoot "packages\web") `
  -PassThru

$apiProcess.Id | Set-Content -Path $apiPidFile
$webProcess.Id | Set-Content -Path $webPidFile

Write-Host "Waiting for API on http://127.0.0.1:8080/api/health ..." -ForegroundColor Yellow
if (-not (Wait-HttpOk "http://127.0.0.1:8080/api/health")) {
  throw "API did not become ready. Check $apiLog and $apiErr"
}

Write-Host "Waiting for Web on http://127.0.0.1:3000/ ..." -ForegroundColor Yellow
if (-not (Wait-HttpOk "http://127.0.0.1:3000/")) {
  throw "Web did not become ready. Check $webLog and $webErr"
}

Write-Host ""
Write-Host "Local stack is ready." -ForegroundColor Green
Write-Host "API: http://127.0.0.1:8080/api/health"
Write-Host "Web: http://127.0.0.1:3000/"
Write-Host "Logs:"
Write-Host "  $apiLog"
Write-Host "  $webLog"

if ($OpenBrowser) {
  Start-Process "http://127.0.0.1:3000/"
  Start-Process "http://127.0.0.1:3000/contracts"
  Start-Process "http://127.0.0.1:3000/admin"
}
