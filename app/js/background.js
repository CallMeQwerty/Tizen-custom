// Low-poly "pearl" background: white facets with gold facets gathering in the corners.
// Drawn once onto a canvas at start-up; seeded, so it looks the same every time.
(function () {
  'use strict';

  var W = 1920;
  var H = 1080;
  var GOLD_LIGHT = [250, 232, 176];
  var GOLD_DARK = [176, 128, 40];
  var WHITE_LIGHT = [255, 255, 255];
  var WHITE_DARK = [233, 234, 236];

  function rng(seed) {
    return function () {
      seed |= 0;
      seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function mix(a, b, t) {
    return 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * t); }).join(',') + ')';
  }

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  window.drawBackground = function (canvas, seed) {
    var ctx = canvas.getContext('2d');
    var rand = rng(seed || 7);
    var cols = 13;
    var rows = 8;
    var cw = W / cols;
    var ch = H / rows;
    var points = [];

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    for (var r = 0; r <= rows; r++) {
      points[r] = [];
      for (var c = 0; c <= cols; c++) {
        points[r][c] = [
          c * cw + (c > 0 && c < cols ? (rand() - 0.5) * cw * 0.75 : 0),
          r * ch + (r > 0 && r < rows ? (rand() - 0.5) * ch * 0.75 : 0)
        ];
      }
    }

    function triangle(a, b, d) {
      var x = (a[0] + b[0] + d[0]) / 3;
      var y = (a[1] + b[1] + d[1]) / 3;
      var nx = (x / W - 0.5) * 2;
      var ny = (y / H - 0.5) * 2;
      var dist = Math.sqrt(nx * nx * 0.7 + ny * ny);
      var light = clamp01(1 - (x / W * 0.3 + y / H * 0.35) + (rand() - 0.5) * 0.25);
      var gold = rand() < clamp01((dist - 0.72) / 0.5) * 0.8;
      var fill = gold ? mix(GOLD_DARK, GOLD_LIGHT, light) : mix(WHITE_DARK, WHITE_LIGHT, light * 0.9 + 0.1);

      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.lineTo(d[0], d[1]);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = gold ? 1.5 : 1;
      ctx.strokeStyle = gold ? '#f6dd93' : fill;
      ctx.stroke();
    }

    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < cols; col++) {
        var p00 = points[row][col];
        var p01 = points[row][col + 1];
        var p10 = points[row + 1][col];
        var p11 = points[row + 1][col + 1];
        if ((row + col) % 2) {
          triangle(p00, p01, p10);
          triangle(p01, p11, p10);
        } else {
          triangle(p00, p01, p11);
          triangle(p00, p11, p10);
        }
      }
    }
  };
})();
