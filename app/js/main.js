(function () {
  'use strict';

  var VERSION = '0.3.0';
  var COLS = 4;
  var KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, BACK: 10009, BLUE: 406, ESC: 27 };
  var hasTizen = typeof tizen !== 'undefined';

  var grid = document.getElementById('grid');
  var toastEl = document.getElementById('toast');
  var diagEl = document.getElementById('diag');
  var diagText = document.getElementById('diag-text');
  var statusEl = document.getElementById('status');

  var focus = 0;
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

  function tick() {
    var d = new Date();
    document.getElementById('clock').textContent = pad(d.getHours()) + ':' + pad(d.getMinutes());
    document.getElementById('date').textContent = DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
  }

  function updateStatus() {
    statusEl.textContent = 'v' + VERSION + ' · started ' + hhmmss(startedAt) + (resumes ? ' · resumed ' + resumes + '×' : '');
  }

  // ---- rendering & focus -------------------------------------------------

  function render() {
    grid.innerHTML = '';
    TILES.forEach(function (t, i) {
      var el = document.createElement('div');
      el.className = 'tile';
      el.style.setProperty('--c', t.color);
      el.innerHTML = '<span class="num"></span><span class="label"></span><span class="sub"></span>';
      el.querySelector('.num').textContent = String((i + 1) % 10);
      el.querySelector('.label').textContent = t.label;
      el.querySelector('.sub').textContent = t.sub || '';
      el.addEventListener('click', function () { setFocus(i); open(i); });
      grid.appendChild(el);
    });
    setFocus(focus);
  }

  function setFocus(i) {
    var tiles = grid.children;
    if (!tiles.length) return;
    focus = Math.max(0, Math.min(tiles.length - 1, i));
    for (var k = 0; k < tiles.length; k++) tiles[k].classList.toggle('focus', k === focus);
    try { localStorage.setItem('focus', String(focus)); } catch (e) { /* storage unavailable */ }
  }

  function move(dx, dy) {
    var next = focus + dx + dy * COLS;
    if (dx !== 0 && Math.floor(next / COLS) !== Math.floor(focus / COLS)) return;
    if (next < 0 || next >= TILES.length) return;
    setFocus(next);
  }

  // ---- launching ---------------------------------------------------------

  function open(i) {
    var t = TILES[i];
    if (!hasTizen) { toast('Preview: would open ' + t.label); return; }
    toast('Opening ' + t.label + '…');
    log('launch ' + t.id);
    try {
      tizen.application.launch(
        t.id,
        function () { log('launched ' + t.id); },
        function (err) {
          log('launch failed ' + t.id + ': ' + err.name + ' ' + err.message);
          toast('Could not open ' + t.label + ': ' + err.message, 5000);
        }
      );
    } catch (e) {
      log('launch threw ' + t.id + ': ' + e.message);
      toast('Could not open ' + t.label + ': ' + e.message, 5000);
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
    ['ColorF3Blue', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach(function (k) {
      try { tizen.tvinputdevice.registerKey(k); } catch (e) { log('registerKey ' + k + ' failed: ' + e.message); }
    });
  }

  document.addEventListener('keydown', function (e) {
    var code = e.keyCode;

    if (diagOpen()) {
      if (code === KEY.BACK || code === KEY.BLUE || code === KEY.ESC) diagEl.classList.add('hidden');
      else if (code === KEY.UP) scrollDiag(-1);
      else if (code === KEY.DOWN) scrollDiag(1);
      e.preventDefault();
      return;
    }

    if (code === KEY.LEFT) move(-1, 0);
    else if (code === KEY.RIGHT) move(1, 0);
    else if (code === KEY.UP) move(0, -1);
    else if (code === KEY.DOWN) move(0, 1);
    else if (code === KEY.ENTER) open(focus);
    else if (code === KEY.BLUE || (!hasTizen && code === 68 /* D in browser preview */)) showDiag();
    else if (code >= 48 && code <= 57) {
      var idx = code === 48 ? 9 : code - 49;
      if (idx < TILES.length) { setFocus(idx); open(idx); }
    }
    else if (code === KEY.BACK) { /* stay on the start screen */ }
    else return;
    e.preventDefault();
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { log('hidden'); remember('hidden'); return; }
    resumes++;
    log('resumed');
    remember('resumed');
    tick();
    updateStatus();
  });

  // ---- boot --------------------------------------------------------------

  try { focus = parseInt(localStorage.getItem('focus') || '0', 10) || 0; } catch (e) { focus = 0; }
  log('start v' + VERSION + ' (' + (hasTizen ? 'TV' : 'browser') + ')');
  remember('start v' + VERSION);
  registerKeys();
  tick();
  setInterval(tick, 10000);
  updateStatus();
  render();
})();
