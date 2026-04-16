$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function Invoke-Check([string]$Name, [scriptblock]$Action) {
  try {
    $result = & $Action
    [PSCustomObject]@{
      Name = $Name
      Status = "PASS"
      Detail = $result
    }
  } catch {
    [PSCustomObject]@{
      Name = $Name
      Status = "FAIL"
      Detail = $_.Exception.Message
    }
  }
}

function Invoke-JsonRequest([string]$Url, [string]$Method = "GET", [object]$Body = $null) {
  $params = @{
    Uri = $Url
    Method = $Method
    TimeoutSec = 8
    UseBasicParsing = $true
  }

  if ($null -ne $Body) {
    $params["ContentType"] = "application/json"
    $params["Body"] = ($Body | ConvertTo-Json -Compress)
  }

  Invoke-WebRequest @params
}

$checks = @()
$checks += Invoke-Check "API health" { (Invoke-JsonRequest "http://127.0.0.1:8080/api/health").StatusCode }
$checks += Invoke-Check "Web home" { (Invoke-JsonRequest "http://127.0.0.1:3000/").StatusCode }
$checks += Invoke-Check "People contracts list" { (Invoke-JsonRequest "http://127.0.0.1:8080/api/contracts?client=people&actorId=acct_1&teamId=team_north").StatusCode }
$checks += Invoke-Check "Advisor contracts list" { (Invoke-JsonRequest "http://127.0.0.1:8080/api/contracts?client=advisor&actorId=adv_21&teamId=team_north").StatusCode }
$checks += Invoke-Check "Ops contract detail" { (Invoke-JsonRequest "http://127.0.0.1:8080/api/contracts/ct-1005?client=ops&actorId=ops_1&teamId=ops_central").StatusCode }
$checks += Invoke-Check "Admin audit log" { (Invoke-JsonRequest "http://127.0.0.1:8080/api/admin/audit-log?entityId=ct-1005").StatusCode }
$checks += Invoke-Check "Chat send" {
  $response = Invoke-JsonRequest "http://127.0.0.1:8080/api/chat/conversations/support/messages" "POST" @{ text = "verify-stack ping" }
  if ($response.StatusCode -ne 201) { throw "Expected 201, got $($response.StatusCode)" }
  $response.StatusCode
}
$checks += Invoke-Check "Complaint submit" {
  $response = Invoke-JsonRequest "http://127.0.0.1:8080/api/support/complaints" "POST" @{
    subject = "verify-stack"
    description = "local stack verification"
    category = "support"
  }
  if ($response.StatusCode -ne 201) { throw "Expected 201, got $($response.StatusCode)" }
  $response.StatusCode
}
$checks += Invoke-Check "Profile update" {
  $response = Invoke-JsonRequest "http://127.0.0.1:8080/api/account/details" "PUT" @{
    agencyName = "Amline QA"
    supportPhone = "021000000"
    supportHours = "9-18"
    whatsapp = "09120000000"
  }
  $response.StatusCode
}
$checks += Invoke-Check "Preference update" {
  $response = Invoke-JsonRequest "http://127.0.0.1:8080/api/account/preferences" "POST" @{
    key = "sms"
    enabled = $true
  }
  $response.StatusCode
}
$checks += Invoke-Check "Contracts page" { (Invoke-JsonRequest "http://127.0.0.1:3000/contracts").StatusCode }
$checks += Invoke-Check "Contract detail page" { (Invoke-JsonRequest "http://127.0.0.1:3000/contracts/ct-1002").StatusCode }
$checks += Invoke-Check "Admin dashboard page" { (Invoke-JsonRequest "http://127.0.0.1:3000/admin").StatusCode }
$checks += Invoke-Check "Support complaints page" { (Invoke-JsonRequest "http://127.0.0.1:3000/support/complaints").StatusCode }

$failed = $checks | Where-Object { $_.Status -eq "FAIL" }
$checks | Format-Table -AutoSize

if ($failed.Count -gt 0) {
  Write-Host ""
  Write-Host "verify-stack detected failures." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "verify-stack passed. API and Web look operational." -ForegroundColor Green
