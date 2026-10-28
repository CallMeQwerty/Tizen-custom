# Tizen-custom

A minimal, fast **start screen for a Samsung Tizen TV** — big tiles for the few things I actually use, instead of Samsung's app wall. It's a small web app sideloaded through Developer Mode; Tizen, Smart Hub and all installed apps stay exactly as they are underneath.

Built for and tested on a **Samsung UE50AU7022KXXH** (2021 Crystal UHD, Tizen 6.0). Other 2017+ Samsung TVs should work, but app IDs differ between model years (see [Customising tiles](#customising-tiles)).

```
                                      (web) (set) (home)

                     21:47:32
                Tuesday, 28 October

     ╭────╮    ╭────╮    ╭────╮    ╭────╮    ╭────╮
     │ YT │    │ Tw │    │ N  │    │ D+ │    │ pv │
     ╰────╯    ╰────╯    ╰────╯    ╰────╯    ╰────╯
     YouTube   Twitch    Netflix   Disney+   Prime Video
```

## Features

- A dock of five platform buttons — YouTube, Twitch, Netflix, Disney+, Prime Video — under a large clock with seconds.
- Three small shortcuts in the top-right corner: Internet, Settings, Samsung Home.
- Remote-friendly: arrows + OK (▲ ▼ switch between dock and shortcuts), or number keys **1–5** (platforms) and **6–8** (shortcuts).
- Renders instantly — app IDs are pre-verified, no slow app scan at start-up; the background is drawn once.
- **Blue** button opens a diagnostics page (log + lifecycle history that survives restarts).
- No Samsung account, no network calls, no tracking. Nothing on the TV is modified.

## Limitations (Tizen 6, public privileges)

Self-installed apps only get *public* privileges, which sets hard limits. Details and evidence in [docs/findings.md](docs/findings.md).

- **It can't open by itself at power-on.** Samsung's *Autorun Last App* ignores sideloaded apps (verified). Open it from the Home row instead.
- **The Home button always opens Samsung's home** — it can't be intercepted.
- **No direct input switching** (HDMI / antenna / USB) — use Samsung's Source menu as usual.
- Leaving an app with Back returns to Samsung's home, not to this screen.

## Requirements

- Samsung Tizen TV in **Developer Mode**, with *Host PC IP* set to your PC.
- Windows PC on the same network with the official **Tizen CLI** (`C:\tizen-studio`) and a Tizen author certificate.

One-time setup, step by step: **[docs/setup.md](docs/setup.md)**.

## Usage

All scripts are PowerShell and read your TV address and signing profile from `scripts/tv.config.ps1` (git-ignored; copy it from `scripts/tv.config.example.ps1`).

| Command | What it does |
|---|---|
| `.\scripts\deploy.ps1` | Build, install on the TV and open the app |
| `.\scripts\deploy.ps1 -NoRun` | Build and install without opening it |
| `.\scripts\build.ps1` | Package `app/` into a signed `dist/Start.wgt` |
| `.\scripts\uninstall.ps1` | Remove the app from the TV |
| `.\scripts\list-apps.ps1 [-Filter netflix]` | List app IDs installed on the TV |
| `.\scripts\debug.ps1` | Open the app in debug mode and forward DevTools to `127.0.0.1:9333` |
| `.\scripts\cdp-eval.ps1 -Expr "<js>"` | Run JavaScript inside the app (after `debug.ps1`) |
| `.\scripts\screenshot.ps1` | Save what the app renders on the TV to `dist/screenshot.png` |

## Customising tiles

Buttons live in [`app/js/tiles.js`](app/js/tiles.js) — `PLATFORMS` for the dock, `SHORTCUTS` for the corner:

```js
{ label: 'YouTube', logo: 'youtube', id: '9Ur5IzDKqV.TizenYouTube', face: ['#ff4d64', '#e8102e', '#9e0019'] },
```

To add an app, find its ID with `.\scripts\list-apps.ps1 -Filter <name>`, add a line (with a logo in [`app/js/logos.js`](app/js/logos.js)), and run `.\scripts\deploy.ps1`.

## Project structure

```
app/                 the Tizen web app (packaged as Start.wgt)
  config.xml         app manifest: ID MskStartSc.Start, privileges
  index.html
  css/style.css      1920x1080 layout
  img/               Disney+ and Prime Video logos
  js/tiles.js        dock and shortcut lists, app IDs
  js/logos.js        logos and icons
  js/background.js   low-poly background, drawn once on a canvas
  js/main.js         clock, rendering, remote keys, launching, diagnostics
scripts/             build / deploy / debug tooling (PowerShell)
docs/setup.md        one-time setup: Developer Mode, Tizen CLI, certificate
docs/findings.md     what works on Tizen 6 and what doesn't, with evidence
```

## Removing everything

1. `.\scripts\uninstall.ps1` (or on the TV: Apps → Start → Delete).
2. TV: Apps → **123** pad → `12345` → Developer Mode **Off** → restart the TV.
3. PC: delete `C:\tizen-studio` and `C:\tizen-studio-data`.

## Credits

- Prime Video logo path: [Simple Icons](https://simpleicons.org) (CC0).
- Disney+ logo: [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Disney%2B_logo.svg), recoloured for dark buttons.
- All brand names and logos are trademarks of their respective owners and are used only to label the buttons.

## License

[MIT](LICENSE) — covers the code, not the third-party logos.
