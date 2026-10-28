# Lists every app installed on the TV (id | name) as the TV reports it to apps.
# Use it to find the app ID for a new tile in app\js\tiles.js.
# Note: opens the start screen in debug mode (it restarts).

param([string]$Filter = '')

. "$PSScriptRoot\_common.ps1"

& "$PSScriptRoot\debug.ps1" | Out-Null
Start-Sleep -Seconds 2

$js = @'
new Promise(function (resolve) {
  tizen.application.getAppsInfo(function (list) {
    resolve(list.map(function (a) { return a.id + ' | ' + a.name + (a.show ? '' : ' (hidden)'); }).sort().join('\n'));
  }, function (e) { resolve('ERROR ' + e.name + ': ' + e.message); });
})
'@

$result = & "$PSScriptRoot\cdp-eval.ps1" -Expr $js -TimeoutSec 60
$result -split "`n" | Where-Object { $_ -match [regex]::Escape($Filter) }
