$ErrorActionPreference = "Continue"

$avdName = "Rephyl_Pixel"
$avdConfig = Join-Path $env:USERPROFILE ".android\avd\$avdName.avd\config.ini"

if (Test-Path $avdConfig) {
  $content = Get-Content $avdConfig
  if ($content -match "^hw\.keyboard=") {
    $content = $content -replace "^hw\.keyboard=.*", "hw.keyboard=yes"
  } else {
    $content += "hw.keyboard=yes"
  }
  $content | Set-Content $avdConfig
  Write-Host "Updated $avdConfig"
  Write-Host "Set hw.keyboard=yes"
} else {
  Write-Warning "Could not find AVD config: $avdConfig"
}

adb kill-server
adb start-server
adb shell settings put secure show_ime_with_hard_keyboard 1
adb shell settings put secure default_input_method com.google.android.inputmethod.latin/com.android.inputmethod.latin.LatinIME
adb devices

Write-Host ""
Write-Host "Close and reopen the emulator after this script if laptop keyboard still does not type."
