# One-time setup

Everything here is reversible; see [Removing everything](../README.md#removing-everything). No Samsung account is needed on Tizen 6 (2021) TVs.

## 1. Developer Mode on the TV

1. Note your PC's IPv4 address (`ipconfig`).
2. On the TV: **Home → Apps**, and let the Apps screen open fully.
3. Enter **1 2 3 4 5**. If the remote has no number keys, press **123** for the on-screen pad and select the digits one after another, quickly.
4. In the *Developer Mode* window: **On**, *Host PC IP* = your PC's address → OK.
5. Restart the TV (hold the power button until it restarts). The Apps screen now shows *Developer Mode* at the top.

Developer Mode lets **only that PC** install apps over the network (sdb, TCP 26101). Switch it off when you don't need it — see [findings](findings.md#security-notes).

## 2. Tizen CLI on the PC

Official download (Samsung / Tizen project), ~295 MB:
`https://download.tizen.org/sdk/Installer/tizen-studio_6.1/web-cli_Tizen_Studio_6.1_windows-64.exe`

Check it before running — the signature should be *Valid* and signed by *Samsung Electronics Co., Ltd.*:

```powershell
Get-AuthenticodeSignature .\web-cli_Tizen_Studio_6.1_windows-64.exe | Format-List Status, SignerCertificate
```

Install into `C:\tizen-studio`:

```powershell
& .\web-cli_Tizen_Studio_6.1_windows-64.exe --accept-license 'C:\tizen-studio'
```

## 3. Author certificate and signing profile

A plain Tizen author certificate (with the default Tizen distributor) is accepted by Tizen 6 TVs. Tizen 7+ TVs need a Samsung certificate instead, which requires a Samsung account.

```powershell
$tizen = 'C:\tizen-studio\tools\ide\bin\tizen.bat'
$pw = Read-Host 'Certificate password'
& $tizen certificate -a my-tv -p $pw -c CZ -n 'My TV' -f my-tv-author
& $tizen security-profiles add -n my-tv -a 'C:\tizen-studio-data\keystore\author\my-tv-author.p12' -p $pw
```

The certificate stays in `C:\tizen-studio-data` and must never be committed. Keep it: updates to the app must be signed with the same author certificate.

## 4. Local config

```powershell
Copy-Item scripts\tv.config.example.ps1 scripts\tv.config.ps1
```

Edit `scripts\tv.config.ps1`: the TV's IP address and the profile name from step 3.

## 5. Deploy

```powershell
.\scripts\deploy.ps1
```

The start screen opens on the TV. To have it one press away, add it to the Home row: **Home → Apps → Start → Down → Add to Home**, then move it to the first position.
