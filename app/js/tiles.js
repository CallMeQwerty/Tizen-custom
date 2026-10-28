// What the start screen shows. App IDs verified on a UE50AU7022 (Tizen 6.0).
// Find IDs for other apps with scripts/list-apps.ps1.

// The dock: number keys 1-5, in this order. `face` = top / middle / bottom colour of the button.
var PLATFORMS = [
  { label: 'YouTube',     logo: 'youtube', id: '9Ur5IzDKqV.TizenYouTube', face: ['#ff4d64', '#e8102e', '#9e0019'] },
  { label: 'Twitch',      logo: 'twitch',  id: 'Jz7aUrV2Q4.Twitch',       face: ['#b48bff', '#9146ff', '#5a24b8'] },
  { label: 'Netflix',     logo: 'netflix', id: 'org.tizen.netflix-app',   face: ['#3a3a3a', '#161616', '#000000'] },
  { label: 'Disney+',     logo: 'disney',  id: 'MCmYXNxgcu.DisneyPlus',   face: ['#3a63e0', '#13308f', '#06174f'] },
  { label: 'Prime Video', logo: 'prime',   id: 'org.tizen.primevideo',    face: ['#2c4157', '#1a2a3a', '#0b141e'] }
];

// Small round buttons in the top-right corner: number keys 6-8.
var SHORTCUTS = [
  { label: 'Internet',     logo: 'globe', id: 'org.tizen.browser' },
  { label: 'Settings',     logo: 'gear',  id: 'org.tizen.menu' },
  { label: 'Samsung Home', logo: 'home',  id: 'com.samsung.tv.csfs' }
];
