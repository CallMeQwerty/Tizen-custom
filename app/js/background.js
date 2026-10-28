// Dark circuit-board background: neon traces along the left and right edges and
// scattered dark-grey hexagon outlines. Drawn once onto a canvas at start-up;
// seeded, so it looks the same every time.
(function () {
  'use strict';

  var W = 1920;
  var H = 1080;
  var CYAN = '#2de2e6';
  var MAGENTA = '#ff2975';
  var EDGE = 260; // traces never reach further than this from the side edges

  // Areas no hexagon may touch (measured on the TV, plus room for glow and the focus lift):
  // clock digits 353-1567 x 150-435, dock 337-1573 x 728-987, shortcuts 1496-1820 x 60-138.
  var KEEP_CLEAR = [
    { x: 300, y: 110, w: 1320, h: 360 },
    { x: 300, y: 690, w: 1320, h: 390 },
    { x: 1460, y: 20, w: 460, h: 190 }
  ];

  function rng(seed) {
    return function () {
      seed |= 0;
      seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // True if a circle of radius r at (x, y) touches the box.
  function touches(x, y, r, box) {
    var nx = Math.max(box.x, Math.min(x, box.x + box.w));
    var ny = Math.max(box.y, Math.min(y, box.y + box.h));
    return Math.hypot(x - nx, y - ny) < r;
  }

  function drawBase(ctx) {
    var glow = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, W * 0.7);
    glow.addColorStop(0, '#0a0d1d');
    glow.addColorStop(1, '#020308');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#1b2340';
    for (var x = 0; x <= W; x += 48) {
      for (var y = 0; y <= H; y += 48) {
        ctx.beginPath();
        ctx.arc(x, y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function hexPath(ctx, cx, cy, r) {
    ctx.beginPath();
    for (var k = 0; k < 6; k++) {
      var a = Math.PI / 180 * (60 * k - 30);
      var px = cx + r * Math.cos(a);
      var py = cy + r * Math.sin(a);
      if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.closePath();
  }

  // Random sizes and positions, never overlapping each other.
  function drawHexagons(ctx, rand) {
    var placed = [];
    for (var tries = 0; tries < 3000 && placed.length < 28; tries++) {
      var r = 26 + Math.pow(rand(), 1.6) * 100;
      var x = rand() * W;
      var y = rand() * H;
      var blocked = KEEP_CLEAR.some(function (box) { return touches(x, y, r, box); }) ||
        placed.some(function (p) { return Math.hypot(p.x - x, p.y - y) < p.r + r + 24; });
      if (!blocked) placed.push({ x: x, y: y, r: r });
    }

    placed.forEach(function (h) {
      hexPath(ctx, h.x, h.y, h.r);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.012)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#2a2f3e';
      ctx.stroke();
      if (h.r > 55 && rand() < 0.45) {
        hexPath(ctx, h.x, h.y, h.r * 0.68);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#1f2330';
        ctx.stroke();
      }
    });
    return placed.length;
  }

  // One trace: in from the edge, a 45-degree bend, a short run, an end pad.
  function drawTrace(ctx, rand, fromRight, y, color) {
    var dir = fromRight ? -1 : 1;
    var x0 = fromRight ? W : 0;
    var x1 = x0 + dir * (30 + rand() * 70);
    var dy = (rand() < 0.5 ? -1 : 1) * (24 + rand() * 60);
    var x2 = x1 + dir * Math.abs(dy);
    var y2 = y + dy;
    var x3 = x2 + dir * (20 + rand() * 60);
    if (Math.abs(x3 - x0) > EDGE) x3 = x0 + dir * EDGE;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x3, y2, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#05060f';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x3, y2, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function drawTraces(ctx, rand) {
    for (var i = 0; i < 12; i++) {
      drawTrace(ctx, rand, false, 60 + i * 84 + rand() * 30, rand() < 0.55 ? CYAN : MAGENTA);
      var yRight = 60 + i * 84 + rand() * 30;
      // Skip the top-right corner where the shortcuts sit.
      if (yRight > 240) drawTrace(ctx, rand, true, yRight, rand() < 0.55 ? MAGENTA : CYAN);
    }

    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = CYAN;
    ctx.fillRect(0, H - 20, W, 4);
    ctx.restore();
  }

  window.drawBackground = function (canvas, seed) {
    var ctx = canvas.getContext('2d');
    var rand = rng(seed || 11);
    drawBase(ctx);
    var hexagons = drawHexagons(ctx, rand);
    drawTraces(ctx, rand);
    return { hexagons: hexagons };
  };
})();
