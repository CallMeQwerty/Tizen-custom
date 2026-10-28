# Removes the start screen app from the TV. Nothing else on the TV is touched.

. "$PSScriptRoot\_common.ps1"

$device = Connect-Tv
& $Tizen uninstall -p $AppId -t $device | Out-Host
Assert-ExitCode 'Uninstall'
