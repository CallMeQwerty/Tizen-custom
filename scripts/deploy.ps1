# Builds the app, installs it on the TV over the network and opens it.
#   .\scripts\deploy.ps1            build + install + open
#   .\scripts\deploy.ps1 -NoBuild   install the existing dist\Start.wgt
#   .\scripts\deploy.ps1 -NoRun     install without opening it

param(
  [switch]$NoBuild,
  [switch]$NoRun
)

. "$PSScriptRoot\_common.ps1"

if (-not $NoBuild) { & "$PSScriptRoot\build.ps1" }

$wgt = Get-ChildItem $Dist -Filter '*.wgt' -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $wgt) { throw 'No .wgt in dist\ - run scripts\build.ps1 first.' }

$device = Connect-Tv
Write-Host "Installing $($wgt.Name) on $device ..."
& $Tizen install -n $wgt.Name -t $device -- $Dist | Out-Host
Assert-ExitCode 'Install'

if (-not $NoRun) {
  & $Tizen run -p $AppId -t $device | Out-Host
  Assert-ExitCode 'Launch'
}
