(function () {
  'use strict';

  var VERSION = '0.4.0';
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

  var digitEls = [];
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

  function buildClock() {
    var html = '';
    for (var i = 0; i < 6; i++) {
      if (i === 2 || i === 4) html += '<span class="col' + (i === 4 ? ' sec' : '') + '">:</span>';
      html += '<span class="dg' + (i >= 4 ? ' sec' : '') + '">0</span>';
    }
    timeEl.innerHTML = html;
    digitEls = timeEl.querySelectorAll('.dg');
  }

  // Only touches the digits that changed.
  function tick() {
    var d = new Date();
    var digits = pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
    for (var i = 0; i < 6; i++) {
      if (digitEls[i].textContent !== digits.charAt(i)) digitEls[i].textContent = digits.charAt(i);
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
      el.innerHTML = '<div class="rim"><div class="face">' + LOGOS[p.logo] + '</div></div><div class="cap"></div>';
      var face = el.querySelector('.face');
      face.style.setProperty('--l', p.face[0]);
      face.style.setProperty('--c', p.face[1]);
      face.style.setProperty('--d', p.face[2]);
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
      el.innerHTML = '<div class="ring"><div class="disc">' + LOGOS[s.logo] + '</div></div><div class="cap"></div>';
      el.querySelector('.cap').textContent = s.label;
      el.addEventListener('click', function () { focusOn('top', i); open(s); });
      shortcutsEl.appendChild(el);
      rows.top.els.push(el);
    });
  }

  function focusOn(name, index) {
    var r = rows[name];
    index = Math.max(0, Math.min(r.items.length - 1, index));
    rows.dock.els.concat(rows.top.els).forEach(function (el) { el.classList.remove('focus'); });
    row = name;
    r.index = index;
    r.els[index].classList.add('focus');
    try { localStorage.setItem('focus', name + ':' + index); } catch (e) { /* storage unavailable */ }
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
    if (document.hidden) { log('hidden'); remember('hidden'); return; }
    resumes++;
    log('resumed');
    remember('resumed');
    tick();
  });

  // ---- boot --------------------------------------------------------------

  log('start v' + VERSION + ' (' + (hasTizen ? 'TV' : 'browser') + ')');
  remember('start v' + VERSION);
  drawBackground(document.getElementById('bg'), 7);
  buildClock();
  buildDock();
  buildShortcuts();
  restoreFocus();
  registerKeys();
  clockLoop();
})();
