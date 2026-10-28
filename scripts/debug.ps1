# Opens the app on the TV in debug mode and forwards its DevTools port to localhost.
# Afterwards, run JavaScript inside the app with:
#   .\scripts\cdp-eval.ps1 -Expr "localStorage.getItem('history')"
# Note: the app restarts when launched in debug mode.

param([int]$LocalPort = 9333)

. "$PSScriptRoot\_common.ps1"

Connect-Tv | Out-Null
& $Sdb -s $Serial forward --remove-all 2>$null | Out-Null

$out = & $Sdb -s $Serial shell 0 debug $AppId 2>&1 | Out-String
if ($out -notmatch 'port:\s*(\d+)') { throw "Debug launch failed: $out" }
$remotePort = $Matches[1]

& $Sdb -s $Serial forward "tcp:$LocalPort" "tcp:$remotePort" | Out-Null
Assert-ExitCode 'Port forward'
Write-Host "DevTools for $AppId on http://127.0.0.1:$LocalPort/json (TV port $remotePort)"
