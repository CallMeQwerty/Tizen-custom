# Changelog

## 0.5.0 — 2026-10-28

- Cyberpunk redesign for a dark room (the white background was too bright on the TV):
  - Near-black circuit-board background: cyan and magenta traces kept within 260 px of the side edges, 28 dark-grey hexagon outlines placed at random without overlapping each other or the clock, dock and shortcuts. Still drawn once on a canvas.
  - Neon clock: white with a pink glow, cyan seconds; date in soft pink.
  - Dark glass tiles with a border and glow in each brand's colour; logos glow too. Selected tile lifts with a white border.
  - Cyan glowing ring shortcuts in the top-right corner.
- Font: Rajdhani SemiBold (bundled, SIL OFL) for the clock, date and labels; fixed digit slots sized to its widest digit so the time never shifts.
- Clock lowered towards the centre and slightly smaller; tiles 15 % smaller; every label centred under its tile.
- "Prime Video" label shortened to "Prime".
- Replaced `scripts/screenshot.ps1` with `scripts/render-screenshot.ps1`: the TV's web engine doesn't answer DevTools screenshot requests, so the app is rendered at 1920×1080 in headless Edge instead.
- README shows a screenshot.

## 0.4.0 — 2026-10-28

- New "dock" design: large clock with seconds (fixed-width digits, nothing shifts), low-poly white-and-gold background drawn once on a canvas.
- Realistic platform buttons: brushed-gold rim, glass highlight, soft shadow; selected button lifts with a gold label.
- Platforms: YouTube, Twitch (new), Netflix, Disney+, Prime Video — keys 1–5.
- Internet, Settings and Samsung Home moved to small round shortcuts in the top-right corner — keys 6–8, ▲ ▼ to reach them.
- Official Disney+ and Prime Video wordmarks as SVG files (`app/img/`).
- `scripts/screenshot.ps1`: capture what the app renders on the TV.

## 0.3.0 — 2026-10-28

- Seven verified tiles: YouTube, Netflix, Prime Video, Disney+, Internet, Settings (`org.tizen.menu`), Samsung Home.
- Removed experimental tiles that launched but showed nothing (`coba.setting`, `coba.source`, `mycontents`).

## 0.2.0 — 2026-10-28

- Instant start-up: hard-coded, verified app IDs instead of scanning 368 installed apps (~4.3 s).
- Lifecycle history in `localStorage` that survives restarts, shown on the diagnostics page.
- Launch errors are shown on screen.

## 0.1.0 — 2026-10-28

- First prototype: clock, tile grid, remote navigation, number-key shortcuts, diagnostics page (Blue button).
