// Tiles shown on the start screen, in order (number keys 1–9 open them directly).
// App IDs verified on this TV (UE50AU7022, Tizen 6.0) on 2026-10-28.
// Tried and dropped (launch accepted, nothing shown): com.samsung.tv.coba.setting,
// com.samsung.tv.coba.source, com.samsung.tv.mycontents; org.tizen.tv-viewer closes this app.
var TILES = [
  { label: 'YouTube',      color: '#e62117', id: '9Ur5IzDKqV.TizenYouTube' },
  { label: 'Netflix',      color: '#e50914', id: 'org.tizen.netflix-app' },
  { label: 'Prime Video',  color: '#1a98ff', id: 'org.tizen.primevideo' },
  { label: 'Disney+',      color: '#1f4fd1', id: 'MCmYXNxgcu.DisneyPlus' },
  { label: 'Internet',     color: '#7b61ff', id: 'org.tizen.browser' },
  { label: 'Settings',     color: '#8b93a3', id: 'org.tizen.menu' },
  { label: 'Samsung Home', color: '#3d4454', id: 'com.samsung.tv.csfs', sub: 'apps · sources · USB' }
];
