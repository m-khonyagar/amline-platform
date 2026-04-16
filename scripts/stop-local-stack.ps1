$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$runtimePids = Join-Path $repoRoot ".runtime-pids"

function Stop-ProcessByFile([string]$PidFile) {
  if (-not (Test-Path $PidFile)) {
    return
  }

  $pidValue = Get-Content -Path $PidFile -ErrorAction SilentlyContinue
  if (-not $pidValue) {
    return
  }

  try {
    Stop-Process -Id ([int]$pidValue) -Force -ErrorAction Stop
  } catch {
  }

  Remove-Item -Path $PidFile -Force -ErrorAction SilentlyContinue
}

Stop-ProcessByFile (Join-Path $runtimePids "api.pid")
Stop-ProcessByFile (Join-Path $runtimePids "web.pid")

Get-NetTCPConnection -LocalPort 3000, 8080 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object {
    try {
      Stop-Process -Id $_ -Force -ErrorAction Stop
    } catch {
    }
  }

Write-Host "Local Amline stack stopped." -ForegroundColor Green
