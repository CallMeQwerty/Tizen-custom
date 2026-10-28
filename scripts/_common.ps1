# Shared setup for all scripts: paths, local config and TV connection helpers.
# Dot-source it:  . "$PSScriptRoot\_common.ps1"

$ErrorActionPreference = 'Stop'

$Root  = Split-Path $PSScriptRoot -Parent
$AppId = 'MskStartSc.Start'
$Dist  = Join-Path $Root 'dist'

$configFile = Join-Path $PSScriptRoot 'tv.config.ps1'
if (-not (Test-Path $configFile)) {
  throw "Missing scripts\tv.config.ps1. Copy scripts\tv.config.example.ps1 to scripts\tv.config.ps1 and fill it in (see docs\setup.md)."
}
$Config = . $configFile

$TizenHome = if ($Config.TizenStudio) { $Config.TizenStudio } else { 'C:\tizen-studio' }
$Tizen = Join-Path $TizenHome 'tools\ide\bin\tizen.bat'
$Sdb   = Join-Path $TizenHome 'tools\sdb.exe'
foreach ($tool in $Tizen, $Sdb) {
  if (-not (Test-Path $tool)) { throw "Tizen CLI not found at $tool (see docs\setup.md)." }
}

$Serial = "$($Config.TvIp):26101"

function Assert-ExitCode([string]$what) {
  if ($LASTEXITCODE -ne 0) { throw "$what failed (exit code $LASTEXITCODE)." }
}

# Connects to the TV over sdb and returns its device name (what `tizen -t` expects).
function Connect-Tv {
  & $Sdb connect $Serial | Out-Null
  $line = & $Sdb devices | Where-Object { $_ -like "$Serial*" -and $_ -match '\sdevice\s' } | Select-Object -First 1
  if (-not $line) {
    throw "TV at $Serial is not reachable. Is it on, in Developer Mode, with Host PC IP set to this PC?"
  }
  return ($line -split '\s+' | Where-Object { $_ })[-1]
}
