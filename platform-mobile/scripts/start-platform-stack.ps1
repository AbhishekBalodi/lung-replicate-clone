param(
  [switch]$SkipBackend,
  [switch]$SkipFrontend,
  [switch]$SkipMetro
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$logDir = Join-Path $PSScriptRoot "..\logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Start-PlatformProcess {
  param(
    [string]$Name,
    [string]$FilePath,
    [string[]]$ArgumentList,
    [string]$WorkingDirectory,
    [string]$LogName
  )

  $stdout = Join-Path $logDir "$LogName.out.log"
  $stderr = Join-Path $logDir "$LogName.err.log"

  Start-Process `
    -FilePath $FilePath `
    -ArgumentList $ArgumentList `
    -WorkingDirectory $WorkingDirectory `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdout `
    -RedirectStandardError $stderr | Out-Null

  Write-Host "Started $Name"
  Write-Host "  stdout: $stdout"
  Write-Host "  stderr: $stderr"
}

if (-not $SkipBackend) {
  Start-PlatformProcess `
    -Name "backend" `
    -FilePath "node.exe" `
    -ArgumentList @("src/index.js") `
    -WorkingDirectory (Join-Path $root "lung-express-backend") `
    -LogName "backend"
}

if (-not $SkipFrontend) {
  Start-PlatformProcess `
    -Name "platform frontend" `
    -FilePath "npm.cmd" `
    -ArgumentList @("run", "dev", "--", "--host", "0.0.0.0") `
    -WorkingDirectory (Join-Path $root "platform-frontend") `
    -LogName "platform-frontend"
}

if (-not $SkipMetro) {
  Start-PlatformProcess `
    -Name "Expo Metro" `
    -FilePath "npx.cmd" `
    -ArgumentList @("expo", "start", "--clear", "--offline") `
    -WorkingDirectory (Join-Path $root "platform-mobile") `
    -LogName "expo-metro"
}
