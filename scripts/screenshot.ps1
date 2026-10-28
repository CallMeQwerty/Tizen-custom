# Captures what the app currently renders on the TV (web layer only, 1920x1080) to dist\screenshot.png.
# Opens the app in debug mode first unless -NoLaunch (then debug.ps1 must already be running).
#   .\scripts\screenshot.ps1 [-Out path] [-NoLaunch] [-WaitSec 3]

param(
  [string]$Out = '',
  [switch]$NoLaunch,
  [int]$WaitSec = 3,
  [int]$Port = 9333
)

. "$PSScriptRoot\_common.ps1"

if (-not $Out) { $Out = Join-Path $Dist 'screenshot.png' }
if (-not $NoLaunch) {
  & "$PSScriptRoot\debug.ps1" -LocalPort $Port | Out-Null
  Start-Sleep -Seconds $WaitSec
}

$targets = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/json" -TimeoutSec 10
$wsUrl = ($targets | Where-Object { $_.type -eq 'page' } | Select-Object -First 1).webSocketDebuggerUrl
if (-not $wsUrl) { throw 'No debuggable page found.' }

$ws  = New-Object System.Net.WebSockets.ClientWebSocket
$cts = New-Object System.Threading.CancellationTokenSource ([TimeSpan]::FromSeconds(60))
$ws.ConnectAsync([Uri]$wsUrl, $cts.Token).Wait()

$request = '{"id":1,"method":"Page.captureScreenshot","params":{"format":"png"}}'
$bytes = [Text.Encoding]::UTF8.GetBytes($request)
$ws.SendAsync([ArraySegment[byte]]::new($bytes), 'Text', $true, $cts.Token).Wait()

$buffer  = New-Object byte[] 262144
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

if (-not $response.result.data) { throw "Screenshot failed: $($message.ToString())" }
New-Item -ItemType Directory -Force -Path (Split-Path $Out) | Out-Null
[IO.File]::WriteAllBytes($Out, [Convert]::FromBase64String($response.result.data))
Write-Host "Saved $Out"
