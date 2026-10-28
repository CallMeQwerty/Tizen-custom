# Packages app\ into a signed dist\Start.wgt using the Tizen security profile from tv.config.ps1.
# The source folder stays clean: packaging happens in a copy under dist\build.

. "$PSScriptRoot\_common.ps1"

$build = Join-Path $Dist 'build'
if (Test-Path $build) { Remove-Item $build -Recurse -Force }
New-Item -ItemType Directory -Force -Path $build | Out-Null
Copy-Item (Join-Path $Root 'app\*') $build -Recurse

& $Tizen package -t wgt -s $Config.Profile -- $build | Out-Host
Assert-ExitCode 'Packaging'

$wgt = Get-ChildItem $build -Filter '*.wgt' | Select-Object -First 1
if (-not $wgt) { throw 'Packaging produced no .wgt file.' }
Move-Item $wgt.FullName (Join-Path $Dist $wgt.Name) -Force
Write-Host "Built $(Join-Path $Dist $wgt.Name)"
