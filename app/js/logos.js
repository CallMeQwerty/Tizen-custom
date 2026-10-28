// Logos and icons as inline SVG (24x24 viewBox). Shapes only, no fonts,
// so they render identically on the TV and in a desktop browser.
var LOGOS = {
  youtube:
    '<svg viewBox="0 0 24 24"><rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="#ff2d55"/>' +
    '<path d="M10 9v6l5.2-3z" fill="#0e061e"/></svg>',

  twitch:
    '<svg viewBox="0 0 24 24"><path fill="#a970ff" d="M4.3 3 3 6.4v13.4h4.6V22h2.6l2.4-2.4h3.6l4.9-4.9V3H4.3z' +
    'm14.4 10.9-2.8 2.8h-4.6l-2.4 2.4v-2.4H5.1V4.8h13.6v9.1zM16 8.1h-1.8v5H16v-5zm-4.9 0H9.3v5h1.8v-5z"/></svg>',

  netflix:
    '<svg viewBox="0 0 24 24"><path d="M6.5 3h3l5 13.2V3h3v18h-2.9L9.5 7.6V21h-3z" fill="#ff1f2d"/>' +
    '<path d="M9.5 3 14.6 21h2.9L12.4 3z" fill="#b1060f" opacity=".85"/></svg>',

  // Official wordmarks as files (see app/img/): too detailed to draw by hand.
  disney: '<img class="logo-img disney" src="img/disneyplus.svg" alt="">',

  prime: '<img class="logo-img prime" src="img/primevideo.svg" alt="">',

  // Corner icons follow the CSS text colour.
  globe:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">' +
    '<circle cx="12" cy="12" r="8.5"/><ellipse cx="12" cy="12" rx="3.7" ry="8.5"/>' +
    '<path d="M3.5 12h17M5 8h14M5 16h14"/></svg>',

  gear:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">' +
    '<path d="M10.3 3.5h3.4l.5 2.4 1.6.9 2.3-.8 1.7 2.9-1.8 1.6v1.9l1.8 1.6-1.7 2.9-2.3-.8-1.6.9-.5 2.4h-3.4' +
    'l-.5-2.4-1.6-.9-2.3.8-1.7-2.9 1.8-1.6v-1.9L4.2 8.9l1.7-2.9 2.3.8 1.6-.9z"/>' +
    '<circle cx="12" cy="12" r="2.8"/></svg>',

  home:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M3.8 11.4 12 4.6l8.2 6.8"/><path d="M6.2 9.6v9.4h4.3v-5.4h3v5.4h4.3V9.6"/></svg>'
};
