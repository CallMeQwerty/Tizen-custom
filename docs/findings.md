# Findings — what a sideloaded app can do on Tizen 6

Tested on a **Samsung UE50AU7022KXXH** (2021, Tizen 6.0, platform `21_KANTSU2E_UHD_BASIC`), October 2026.
"Verified" means tested on this TV; everything else is marked with its source.

## Replacing Tizen

Not possible. There is no public custom firmware, root or alternative OS for 2021 (A-series) Samsung TVs, and firmware is model-locked. Tizen can be *customised* — settings, Home row, DNS, sideloaded apps — but not replaced, and the system home screen can't be swapped.

## App IDs on this TV (verified)

Launched with `tizen.application.launch(id)` from this app:

| Tile | App ID | Result |
|---|---|---|
| YouTube | `9Ur5IzDKqV.TizenYouTube` | ✅ opens |
| Twitch | `Jz7aUrV2Q4.Twitch` | ✅ |
| Netflix | `org.tizen.netflix-app` | ✅ |
| Prime Video | `org.tizen.primevideo` | ✅ |
| Disney+ | `MCmYXNxgcu.DisneyPlus` | ✅ |
| Internet | `org.tizen.browser` | ✅ |
| Settings | `org.tizen.menu` | ✅ opens the Settings menu |
| Samsung Home | `com.samsung.tv.csfs` | ✅ opens the Home bar |
| — | `com.samsung.tv.coba.setting` | ❌ launch accepted, nothing shown |
| — | `com.samsung.tv.coba.source` | ❌ launch accepted, nothing shown |
| — | `com.samsung.tv.mycontents` | ❌ launch accepted, nothing shown |
| — | `org.tizen.tv-viewer` | ⚠️ returns to the *last used* source and closes this app |

IDs differ between model years — run `scripts/list-apps.ps1` on another TV.

## Behaviour and limits

- **Power-on autostart: not possible (verified).** With *Autorun Smart Hub* off, *Autorun Last App* on, and this app as the last one used, the TV came up on its home screen after a normal power cycle and after a full restart. The app's own lifecycle log (`localStorage.history`, read over DevTools) shows it was never started at boot. Boot services (`on-boot` in `config.xml`) need partner-level certification.
- **Home key** can't be registered or intercepted by an app; it always opens Samsung's home.
- **Back from a launched app** (e.g. YouTube) returns to Samsung's home, not to this app.
- **Input switching:** `tizen.tvwindow` (public) can only show HDMI / tuner video *inside* an app; switching the TV's real input needs partner privileges. Not used here.
- **No DevTools screenshots:** the TV's web engine answers `Runtime` and `Page.enable`, but never answers `Page.captureScreenshot` (verified, with and without `fromSurface`). Screenshots are rendered on the PC instead (`scripts/render-screenshot.ps1`).
- **App list is slow:** `tizen.application.getAppsInfo()` returns 368 apps in ~4.3 s on this TV, so tiles use hard-coded IDs and the list is only fetched by `list-apps.ps1`.

## Performance on this TV

Measured in the app with `requestAnimationFrame` timing while simulating arrow presses (v0.5.0 → v0.5.1):

| | Before | After |
|---|---|---|
| Key press → screen updated | 200–290 ms | 25–36 ms |
| Frames while navigating | avg 72 ms (~14 fps) | avg 15.5 ms (60 fps) |
| Clock tick, idle | ~115 ms freeze every second | none (max frame 19 ms) |

Switching effects off one at a time showed:

- **Scaling the selected tile was the main cost.** On this engine a `scale()` makes the layer redraw everything in it, blurred glows included, even with `will-change: transform`. A pure 2D `translate()` is cheap.
- Blurred `text-shadow` glow on a 200 px clock costs ~100 ms per redraw, even for a single digit on its own layer. Pre-rendering the glyphs into canvas sprites removes the cost.
- Changing `box-shadow` glows on focus is expensive. Fading a pre-drawn overlay's `opacity` is not.
- `filter: drop-shadow` on the logos and the base tile glow cost little once nothing around them changes.

## Signing

- A plain **Tizen** author certificate (default Tizen distributor) installs fine on Tizen 6. Tizen 7+ TVs require a **Samsung** certificate (Samsung account) — per TizenBrew/Apps2Samsung source code.
- The Tizen developer CA expires **2027-01-01**. Installing or updating after that date may require a Samsung certificate *(unverified)*. Whether already-installed apps keep running is also unverified.
- Updates must be signed with the same author certificate as the installed version.

## Security notes

- **Developer Mode** opens the sdb debug bridge (TCP 26101), accepting connections only from the configured Host PC IP. A Low-rated command-injection issue in sdb affecting Tizen through 9.0 was published in Feb 2026 (SVE-2025-50109, Bishop Fox). Keep Developer Mode **off** when not deploying *(whether the app keeps working with Developer Mode off is still to be tested)*.
- Samsung's guaranteed security-update window for pre-2023 TVs is 5 years; the last bulletin naming 2021 models is SVP-JUL-2024 ([security.samsungtv.com](https://security.samsungtv.com/securityUpdates)).
- This app makes no network requests and stores only its focus position and a short lifecycle log in `localStorage`.
