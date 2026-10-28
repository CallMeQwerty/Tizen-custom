# Tizen-custom

A minimal, fast **start screen for a Samsung Tizen TV** — big tiles for the few things I actually use, instead of Samsung's app wall. It's a small web app sideloaded through Developer Mode; Tizen, Smart Hub and all installed apps stay exactly as they are underneath.

Built for and tested on a **Samsung UE50AU7022KXXH** (2021 Crystal UHD, Tizen 6.0). Other 2017+ Samsung TVs should work, but app IDs differ between model years (see [Customising tiles](#customising-tiles)).

```
 22:41
 Tuesday, 28 October

 ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
 │ YouTube  │ │ Netflix  │ │ Prime    │ │ Disney+  │
 └──────────┘ └──────────┘ └──────────┘ └──────────┘
 ┌──────────┐ ┌──────────┐ ┌──────────┐
 │ Internet │ │ Settings │ │ Samsung  │
 └──────────┘ └──────────┘ │ Home     │
                           └──────────┘
```

## Features

- One screen, seven tiles: YouTube, Netflix, Prime Video, Disney+, Internet, Settings, Samsung Home.
- Remote-friendly: arrow keys + OK, or number keys **1–7** to open a tile directly.
- Renders instantly — app IDs are pre-verified, no slow app scan at start-up.
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

## Customising tiles

Tiles live in [`app/js/tiles.js`](app/js/tiles.js):

```js
{ label: 'YouTube', color: '#e62117', id: '9Ur5IzDKqV.TizenYouTube' },
```

To add an app, find its ID with `.\scripts\list-apps.ps1 -Filter <name>`, add a line, and run `.\scripts\deploy.ps1`. The grid has four columns; number keys 1–9 map to the first nine tiles.

## Project structure

```
app/                 the Tizen web app (packaged as Start.wgt)
  config.xml         app manifest: ID MskStartSc.Start, privileges
  index.html
  css/style.css      1920x1080 layout
  js/tiles.js        tile list and app IDs
  js/main.js         rendering, remote keys, launching, diagnostics
scripts/             build / deploy / debug tooling (PowerShell)
docs/setup.md        one-time setup: Developer Mode, Tizen CLI, certificate
docs/findings.md     what works on Tizen 6 and what doesn't, with evidence
```

## Removing everything

1. `.\scripts\uninstall.ps1` (or on the TV: Apps → Start → Delete).
2. TV: Apps → **123** pad → `12345` → Developer Mode **Off** → restart the TV.
3. PC: delete `C:\tizen-studio` and `C:\tizen-studio-data`.

## License

[MIT](LICENSE)
