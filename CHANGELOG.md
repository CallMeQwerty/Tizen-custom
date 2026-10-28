# Changelog

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
