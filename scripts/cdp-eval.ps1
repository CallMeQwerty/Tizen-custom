# Evaluates a JavaScript expression inside the app through the DevTools port opened by debug.ps1.
# Promises are awaited; the result is returned by value.
#   .\scripts\cdp-eval.ps1 -Expr "document.title"

param(
  [Parameter(Mandatory = $true)][string]$Expr,
  [int]$Port = 9333,
  [int]$TimeoutSec = 30
)

$ErrorActionPreference = 'Stop'

$targets = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/json" -TimeoutSec 10
$wsUrl = ($targets | Where-Object { $_.type -eq 'page' } | Select-Object -First 1).webSocketDebuggerUrl
if (-not $wsUrl) { throw 'No debuggable page found - run scripts\debug.ps1 first.' }

$ws  = New-Object System.Net.WebSockets.ClientWebSocket
$cts = New-Object System.Threading.CancellationTokenSource ([TimeSpan]::FromSeconds($TimeoutSec))
$ws.ConnectAsync([Uri]$wsUrl, $cts.Token).Wait()

$request = @{
  id     = 1
  method = 'Runtime.evaluate'
  params = @{ expression = $Expr; awaitPromise = $true; returnByValue = $true }
} | ConvertTo-Json -Depth 5 -Compress
$bytes = [Text.Encoding]::UTF8.GetBytes($request)
$ws.SendAsync([ArraySegment[byte]]::new($bytes), 'Text', $true, $cts.Token).Wait()

$buffer  = New-Object byte[] 65536
$message = New-Object System.Text.StringBuilder
while ($true) {
  $chunk = $ws.ReceiveAsync([ArraySegment[byte]]::new($buffer), $cts.Token).Result
  [void]$message.Append([Text.Encoding]::UTF8.GetString($buffer, 0, $chunk.Count))
  if ($chunk.EndOfMessage) {
    $response = $message.ToString() | ConvertFrom-Json
    if ($response.id -eq 1) { break }
    [void]$message.Clear()
  }
}
$ws.Dispose()

if ($response.result.exceptionDetails) {
  throw ('JavaScript exception: ' + ($response.result.exceptionDetails | ConvertTo-Json -Depth 6 -Compress))
}
$response.result.result.value
