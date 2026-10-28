# Renders the app at 1920x1080 in headless Microsoft Edge and saves a PNG.
# (The TV's own web engine doesn't answer DevTools screenshot requests, so this renders the
# same app files on the PC instead. Uses a throw-away Edge profile; your normal one isn't touched.)
#   .\scripts\render-screenshot.ps1 [-Out docs\images\screenshot.png]

param([string]$Out = '')

$ErrorActionPreference = 'Stop'
$Root = Split-Path $PSScriptRoot -Parent
if (-not $Out) { $Out = Join-Path $Root 'docs\images\screenshot.png' }
$Out = [IO.Path]::GetFullPath($Out)

$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
          "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") |
  Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw 'Microsoft Edge not found.' }

New-Item -ItemType Directory -Force -Path (Split-Path $Out) | Out-Null
$profileDir = Join-Path $env:TEMP 'tizen-custom-edge-profile'
$url = 'file:///' + ((Join-Path $Root 'app\index.html') -replace '\\', '/')

$arguments = @(
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
  '--force-device-scale-factor=1', "--user-data-dir=$profileDir", '--window-size=1920,1080',
  '--virtual-time-budget=4000', "--screenshot=$Out", $url
)
$process = Start-Process -FilePath $edge -ArgumentList $arguments -PassThru -Wait -WindowStyle Hidden
if ($process.ExitCode -ne 0 -or -not (Test-Path $Out)) { throw "Edge render failed (exit code $($process.ExitCode))." }
Write-Host "Saved $Out"
