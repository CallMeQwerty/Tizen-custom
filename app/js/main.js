(function () {
  'use strict';

  var VERSION = '0.5.1';
  var KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, BACK: 10009, BLUE: 406, ESC: 27 };
  var hasTizen = typeof tizen !== 'undefined';

  var dockEl = document.getElementById('dock');
  var shortcutsEl = document.getElementById('shortcuts');
  var timeEl = document.getElementById('time');
  var dateEl = document.getElementById('date');
  var toastEl = document.getElementById('toast');
  var diagEl = document.getElementById('diag');
  var diagText = document.getElementById('diag-text');

  // Two focus rows: the dock (platforms) and the shortcuts in the top-right corner.
  var rows = {
    dock: { items: PLATFORMS, els: [], index: 0 },
    top: { items: SHORTCUTS, els: [], index: 0 }
  };
  var row = 'dock';

  var logLines = [];
  var startedAt = new Date();
  var resumes = 0;
  var toastTimer = null;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function hhmmss(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }

  function log(msg) {
    logLines.push(hhmmss(new Date()) + '  ' + msg);
    if (logLines.length > 300) logLines.shift();
    if (window.console) console.log('[start] ' + msg);
  }

  // Lifecycle history kept across restarts, so a power-on test can be read back later.
  function remember(event) {
    try {
      var h = JSON.parse(localStorage.getItem('history') || '[]');
      h.push(new Date().toISOString() + ' ' + event);
      localStorage.setItem('history', JSON.stringify(h.slice(-50)));
    } catch (e) { /* storage unavailable */ }
  }

  function history() {
    try { return JSON.parse(localStorage.getItem('history') || '[]'); } catch (e) { return []; }
  }

  function toast(msg, ms) {
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.add('hidden'); }, ms || 2500);
  }

  // ---- clock -------------------------------------------------------------

  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                'September', 'October', 'November', 'December'];

  // The glowing digits are expensive to draw (two large blurred glows each), too slow
  // for the TV to redo every second. So each character is drawn once into a sprite at
  // start-up, and a tick only copies eight finished sprites onto the clock canvas.
  var CLOCK_FONT = '600 200px Rajdhani';
  var CELL = 110;  // digit slot, 0.55em: wider than the widest digit, so nothing shifts
  var COLON = 48;  // colon slot, 0.24em
  var LINE = 200;  // line height
  var GLOW = 70;   // room around each glyph for its glow
  var CLOCK_STYLES = {
    main: { fill: '#ffffff', glow: '#ff2975', blurs: [50, 17] },
    sec: { fill: '#2de2e6', glow: '#2de2e6', blurs: [45, 17] }
  };
  var sprites = {};
  var clockCtx = null;
  var shownDigits = '';

  function makeSprite(ch, style) {
    var canvas = document.createElement('canvas');
    canvas.width = (ch === ':' ? COLON : CELL) + GLOW * 2;
    canvas.height = LINE + GLOW * 2;
    var ctx = canvas.getContext('2d');
    var x = canvas.width / 2;
    var y = GLOW + LINE / 2 + 12 + (ch === ':' ? -10 : 0); // +12: matches where the DOM text sat
    ctx.font = CLOCK_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = style.fill;
    ctx.shadowColor = style.glow;
    style.blurs.forEach(function (blur) {
      ctx.shadowBlur = blur;
      ctx.fillText(ch, x, y);
    });
    ctx.shadowBlur = 0;
    ctx.fillText(ch, x, y);
    return canvas;
  }

  function buildClock() {
    var canvas = document.createElement('canvas');
    canvas.width = CELL * 6 + COLON * 2 + GLOW * 2;
    canvas.height = LINE + GLOW * 2;
    canvas.style.top = -GLOW + 'px';
    canvas.style.marginLeft = -canvas.width / 2 + 'px';
    timeEl.appendChild(canvas);

    document.fonts.load(CLOCK_FONT).then(function () {
      Object.keys(CLOCK_STYLES).forEach(function (name) {
        sprites[name] = {};
        '0123456789:'.split('').forEach(function (ch) { sprites[name][ch] = makeSprite(ch, CLOCK_STYLES[name]); });
      });
      clockCtx = canvas.getContext('2d');
      tick();
    });
  }

  // hh : mm : ss — the second colon and the seconds use the cyan style.
  function drawTime(digits) {
    var chars = [digits[0], digits[1], ':', digits[2], digits[3], ':', digits[4], digits[5]];
    var x = 0;
    clockCtx.clearRect(0, 0, clockCtx.canvas.width, clockCtx.canvas.height);
    chars.forEach(function (ch, i) {
      clockCtx.drawImage((i >= 5 ? sprites.sec : sprites.main)[ch], x, 0);
      x += ch === ':' ? COLON : CELL;
    });
  }

  function tick() {
    var d = new Date();
    var digits = pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
    if (clockCtx && digits !== shownDigits) {
      drawTime(digits);
      shownDigits = digits;
    }
    var date = DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
    if (dateEl.textContent !== date) dateEl.textContent = date;
  }

  // Re-aligns to the start of each second so the seconds never lag.
  function clockLoop() {
    tick();
    setTimeout(clockLoop, 1000 - (Date.now() % 1000) + 10);
  }

  // ---- rendering & focus -------------------------------------------------

  function buildDock() {
    PLATFORMS.forEach(function (p, i) {
      var el = document.createElement('div');
      el.className = 'btn';
      el.style.setProperty('--c', p.neon);
      el.innerHTML = '<div class="tile">' + LOGOS[p.logo] + '</div><div class="cap"></div>';
      el.querySelector('.cap').textContent = p.label;
      el.addEventListener('click', function () { focusOn('dock', i); open(p); });
      dockEl.appendChild(el);
      rows.dock.els.push(el);
    });
  }

  function buildShortcuts() {
    SHORTCUTS.forEach(function (s, i) {
      var el = document.createElement('div');
      el.className = 'sc';
      el.innerHTML = '<div class="ring">' + LOGOS[s.logo] + '</div><div class="cap"></div>';
      el.querySelector('.cap').textContent = s.label;
      el.addEventListener('click', function () { focusOn('top', i); open(s); });
      shortcutsEl.appendChild(el);
      rows.top.els.push(el);
    });
  }

  var focusedEl = null;
  var saveTimer = null;

  function saveFocus() {
    clearTimeout(saveTimer);
    saveTimer = null;
    try { localStorage.setItem('focus', row + ':' + rows[row].index); } catch (e) { /* storage unavailable */ }
  }

  function focusOn(name, index) {
    var r = rows[name];
    index = Math.max(0, Math.min(r.items.length - 1, index));
    if (focusedEl) focusedEl.classList.remove('focus');
    row = name;
    r.index = index;
    focusedEl = r.els[index];
    focusedEl.classList.add('focus');
    // Saving is a write to the TV's storage: do it once the user stops moving, not on every key press.
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveFocus, 1500);
  }

  function restoreFocus() {
    var saved = '';
    try { saved = localStorage.getItem('focus') || ''; } catch (e) { /* storage unavailable */ }
    var parts = saved.split(':');
    if (rows[parts[0]]) focusOn(parts[0], parseInt(parts[1], 10) || 0);
    else focusOn('dock', 0);
  }

  // ---- launching ---------------------------------------------------------

  function open(item) {
    saveFocus();
    if (!hasTizen) { toast('Preview: would open ' + item.label); return; }
    toast('Opening ' + item.label + '…');
    log('launch ' + item.id);
    try {
      tizen.application.launch(
        item.id,
        function () { log('launched ' + item.id); },
        function (err) {
          log('launch failed ' + item.id + ': ' + err.name + ' ' + err.message);
          toast('Could not open ' + item.label + ': ' + err.message, 5000);
        }
      );
    } catch (e) {
      log('launch threw ' + item.id + ': ' + e.message);
      toast('Could not open ' + item.label + ': ' + e.message, 5000);
    }
  }

  // ---- diagnostics -------------------------------------------------------

  function showDiag() {
    var lines = ['Start v' + VERSION + ' · started ' + startedAt.toString() + ' · resumed ' + resumes + '×', ''];
    lines.push('--- Log ---');
    lines = lines.concat(logLines);
    lines.push('', '--- Lifecycle history (survives restarts) ---');
    lines = lines.concat(history());
    diagText.textContent = lines.join('\n');
    diagText.style.transform = 'translateY(0px)';
    diagText.setAttribute('data-offset', '0');
    diagEl.classList.remove('hidden');
  }

  function scrollDiag(dir) {
    var off = parseInt(diagText.getAttribute('data-offset') || '0', 10) + dir * 300;
    off = Math.max(0, Math.min(off, Math.max(0, diagText.scrollHeight - 800)));
    diagText.setAttribute('data-offset', String(off));
    diagText.style.transform = 'translateY(' + -off + 'px)';
  }

  function diagOpen() { return !diagEl.classList.contains('hidden'); }

  // ---- input -------------------------------------------------------------

  function registerKeys() {
    if (!hasTizen || !tizen.tvinputdevice) return;
    ['ColorF3Blue', '1', '2', '3', '4', '5', '6', '7', '8'].forEach(function (k) {
      try { tizen.tvinputdevice.registerKey(k); } catch (e) { log('registerKey ' + k + ' failed: ' + e.message); }
    });
  }

  document.addEventListener('keydown', function (e) {
    var code = e.keyCode;
    var r = rows[row];

    if (diagOpen()) {
      if (code === KEY.BACK || code === KEY.BLUE || code === KEY.ESC) diagEl.classList.add('hidden');
      else if (code === KEY.UP) scrollDiag(-1);
      else if (code === KEY.DOWN) scrollDiag(1);
      e.preventDefault();
      return;
    }

    if (code === KEY.LEFT) focusOn(row, r.index - 1);
    else if (code === KEY.RIGHT) focusOn(row, r.index + 1);
    else if (code === KEY.UP && row === 'dock') focusOn('top', rows.top.index);
    else if (code === KEY.DOWN && row === 'top') focusOn('dock', rows.dock.index);
    else if (code === KEY.ENTER) open(r.items[r.index]);
    else if (code === KEY.BLUE || (!hasTizen && code === 68 /* D in browser preview */)) showDiag();
    else if (code >= 49 && code <= 56) {
      var n = code - 49;
      if (n < PLATFORMS.length) { focusOn('dock', n); open(PLATFORMS[n]); }
      else if (n - PLATFORMS.length < SHORTCUTS.length) {
        focusOn('top', n - PLATFORMS.length);
        open(SHORTCUTS[n - PLATFORMS.length]);
      }
    }
    else if (code === KEY.BACK) { /* stay on the start screen */ }
    else if (code !== KEY.UP && code !== KEY.DOWN) return;
    e.preventDefault();
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { saveFocus(); log('hidden'); remember('hidden'); return; }
    resumes++;
    log('resumed');
    remember('resumed');
    tick();
  });

  // ---- boot --------------------------------------------------------------

  log('start v' + VERSION + ' (' + (hasTizen ? 'TV' : 'browser') + ')');
  remember('start v' + VERSION);
  var bg = drawBackground(document.getElementById('bg'), 11);
  log('background: ' + bg.hexagons + ' hexagons');
  buildClock();
  buildDock();
  buildShortcuts();
  restoreFocus();
  registerKeys();
  clockLoop();
})();
