// What the start screen shows. App IDs verified on a UE50AU7022 (Tizen 6.0).
// Find IDs for other apps with scripts/list-apps.ps1.

// The dock: number keys 1-5, in this order. `neon` = the tile's glow colour.
var PLATFORMS = [
  { label: 'YouTube', logo: 'youtube', id: '9Ur5IzDKqV.TizenYouTube', neon: '#ff2d55' },
  { label: 'Twitch',  logo: 'twitch',  id: 'Jz7aUrV2Q4.Twitch',       neon: '#a970ff' },
  { label: 'Netflix', logo: 'netflix', id: 'org.tizen.netflix-app',   neon: '#ff1f2d' },
  { label: 'Disney+', logo: 'disney',  id: 'MCmYXNxgcu.DisneyPlus',   neon: '#3d7bff' },
  { label: 'Prime',   logo: 'prime',   id: 'org.tizen.primevideo',    neon: '#00b7ff' }
];

// Small round buttons in the top-right corner: number keys 6-8.
var SHORTCUTS = [
  { label: 'Internet',     logo: 'globe', id: 'org.tizen.browser' },
  { label: 'Settings',     logo: 'gear',  id: 'org.tizen.menu' },
  { label: 'Samsung Home', logo: 'home',  id: 'com.samsung.tv.csfs' }
];
