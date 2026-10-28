# Tizen-custom

A minimal, fast **start screen for a Samsung Tizen TV** — a neon dock for the few things I actually use, instead of Samsung's app wall. It's a small web app sideloaded through Developer Mode; Tizen, Smart Hub and all installed apps stay exactly as they are underneath.

Built for and tested on a **Samsung UE50AU7022KXXH** (2021 Crystal UHD, Tizen 6.0). Other 2017+ Samsung TVs should work, but app IDs differ between model years (see [Customising tiles](#customising-tiles)).

![The start screen: neon clock with seconds, five glowing platform tiles, three corner shortcuts on a dark circuit-board background](docs/images/screenshot.png)

<sub>Rendered at the TV's 1920×1080.</sub>

## Features

- A dock of five platform tiles — YouTube, Twitch, Netflix, Disney+, Prime — under a large clock with seconds and the date.
- Three small shortcuts in the top-right corner: Internet, Settings, Samsung Home.
- Cyberpunk look made for a dark room: neon pink/cyan clock (Rajdhani), glowing outline tiles in each brand's colour, and a near-black circuit-board background with traces along the side edges and scattered dark hexagons.
- Remote-friendly: arrows + OK (▲ ▼ switch between dock and shortcuts), or number keys **1–5** (platforms) and **6–8** (shortcuts).
- Light on the TV's slow processor: app IDs are pre-verified (no slow app scan), the background is drawn once onto a canvas, and the clock only repaints the digits that change.
- **Blue** button opens a diagnostics page (log + lifecycle history that survives restarts).
- No Samsung account, no network calls, no tracking — fonts and logos are bundled. Nothing on the TV is modified.

## Requirements

- Samsung Tizen TV in **Developer Mode**, with *Host PC IP* set to your PC.
- Windows PC on the same network with the official **Tizen CLI** (part of Tizen Studio) and a Tizen author certificate.

## Install

1. Do the one-time setup in **[docs/setup.md](docs/setup.md)**: Developer Mode on the TV, the Tizen CLI, a certificate, and your TV's address in `scripts/tv.config.ps1`.
2. Build the app, install it on the TV and open it:

   ```powershell
   .\scripts\deploy.ps1
   ```

   Run it again after any change to update the app on the TV.

## Uninstall

```powershell
.\scripts\uninstall.ps1
```

Or on the TV: **Apps → Start → Delete**.

To also undo the setup, switch Developer Mode off on the TV (Apps → **123** pad → `12345` → **Off** → restart the TV) and uninstall Tizen Studio from the PC.

## Customising tiles

Buttons live in [`app/js/tiles.js`](app/js/tiles.js) — `PLATFORMS` for the dock, `SHORTCUTS` for the corner:

```js
{ label: 'YouTube', logo: 'youtube', id: '9Ur5IzDKqV.TizenYouTube', neon: '#ff2d55' },
```

To add an app, add a line with its app ID (app IDs differ between TV models; the `scripts` folder has a helper that lists the ones on your TV) and a logo in [`app/js/logos.js`](app/js/logos.js), then run `.\scripts\deploy.ps1`. `neon` is the tile's border and glow colour.

## Project structure

```
app/                 the Tizen web app (packaged as Start.wgt)
  config.xml         app manifest: ID MskStartSc.Start, privileges
  index.html
  css/style.css      1920x1080 layout and neon styling
  fonts/             Rajdhani (SIL Open Font License)
  img/               Disney+ and Prime Video logos
  js/tiles.js        dock and shortcut lists, app IDs, neon colours
  js/logos.js        logos and icons
  js/background.js   circuit-board background, drawn once on a canvas
  js/main.js         clock, rendering, remote keys, launching, diagnostics
scripts/             build / deploy / debug tooling (PowerShell)
docs/setup.md        one-time setup: Developer Mode, Tizen CLI, certificate
docs/findings.md     what works on Tizen 6 and what doesn't, with evidence
```

## Credits

- Font: [Rajdhani](https://fonts.google.com/specimen/Rajdhani) by Indian Type Foundry — SIL Open Font License 1.1 ([`app/fonts/OFL-rajdhani.txt`](app/fonts/OFL-rajdhani.txt)).
- Prime Video logo path: [Simple Icons](https://simpleicons.org) (CC0).
- Disney+ logo: [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Disney%2B_logo.svg), recoloured for dark buttons.
- All brand names and logos are trademarks of their respective owners and are used only to label the buttons.

## License

[MIT](LICENSE) — covers the code, not the bundled font or the third-party logos.
