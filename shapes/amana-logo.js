// Amana Logo: triangle "A" + asymmetric swoosh ribbon
// Brand: pink/magenta with subtle violet at top, on dark
// 75% triangle, 25% swoosh
// Subtle breathing + horizontal drift

var breath = 1 + Math.sin(time * 0.55) * 0.012;
var driftX = Math.sin(time * 0.3) * 0.06;
var driftY = Math.cos(time * 0.25) * 0.04;

var seg = Math.floor(i / (count / 20));
if (seg > 19) seg = 19;
var n = Math.floor(count / 20);
var li = i - seg * n;

var rnd1 = (Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1; if (rnd1 < 0) rnd1 += 1;
var rnd2 = (Math.sin(i * 269.5 + 183.3) * 21345.6789) % 1; if (rnd2 < 0) rnd2 += 1;
var rnd3 = (Math.sin(i * 419.2 + 571.9) * 65432.1234) % 1; if (rnd3 < 0) rnd3 += 1;
var rnd4 = (Math.sin(i * 73.6 + 947.1) * 38291.4321) % 1; if (rnd4 < 0) rnd4 += 1;

var h, sat, lum;

if (seg < 15) {
  // ---- Triangle "A" — 75% ----
  // 15 segments split: 7 left leg, 7 right leg, 1 thicker apex top
  var apexX = 0, apexY = 11;
  var lx, ly;

  if (seg < 7) {
    var tt = (li + (seg % 7) * n) / (7 * n);
    lx = apexX + (-7.5 - apexX) * tt;
    ly = apexY + (-8 - apexY) * tt;
  } else if (seg < 14) {
    var tt = (li + ((seg - 7) % 7) * n) / (7 * n);
    lx = apexX + (7.5 - apexX) * tt;
    ly = apexY + (-8 - apexY) * tt;
  } else {
    // Single segment "apex thickener" — tighter blob right at the tip
    var topTt = li / n;
    lx = apexX + (rnd1 - 0.5) * (1.5 - topTt);
    ly = apexY - 0.6 * topTt + (rnd2 - 0.5) * 0.4;
  }

  // Tube radius — gaussian-ish for chunky strokes
  var a = rnd1 * Math.PI * 2;
  var r = Math.sqrt(rnd2) * 0.85;
  var ox = Math.cos(a) * r;
  var oy = Math.sin(a) * r * 0.5;
  var oz = (rnd3 - 0.5) * 0.45;

  target.set(
    (lx + ox + driftX) * breath,
    (ly + oy + driftY) * breath,
    oz * breath
  );

  // Color: brighter+slightly violet at top, deeper magenta at bottom
  var tNorm = (ly + 8) / 19;  // 0 at bottom, 1 at top
  if (tNorm < 0) tNorm = 0; if (tNorm > 1) tNorm = 1;
  h = 0.88 + tNorm * 0.04;     // 0.88 (deeper pink) -> 0.92 (lighter pink)
  sat = 0.6 + (1 - tNorm) * 0.18;
  lum = 0.55 + tNorm * 0.18 + rnd4 * 0.05;

} else {
  // ---- Swoosh ribbon — 25%, single tight strand ----
  // Continuous Bezier curve. 5 segments cover tt = 0..1
  var tt = (li + (seg - 15) * n) / (5 * n);
  var u = tt;
  var v = 1 - u;

  // Asymmetric Bezier: left-low → dip below A → right-mid (slight rise)
  var p0x = -8.5, p0y = -3;
  var p1x = 0.5,  p1y = -10;
  var p2x = 9,    p2y = -1;

  var sx = v * v * p0x + 2 * v * u * p1x + u * u * p2x;
  var sy = v * v * p0y + 2 * v * u * p1y + u * u * p2y;

  // Tangent for perpendicular ribbon thickness
  var dx = 2 * v * (p1x - p0x) + 2 * u * (p2x - p1x);
  var dy = 2 * v * (p1y - p0y) + 2 * u * (p2y - p1y);
  var dl = Math.sqrt(dx * dx + dy * dy) || 1;
  var nx = -dy / dl;
  var ny = dx / dl;

  // Single tight ribbon — small perpendicular spread
  var ribbonOff = (rnd2 - 0.5) * 0.55;
  var depthOff = (rnd3 - 0.5) * 0.5;

  target.set(
    (sx + nx * ribbonOff + driftX) * breath,
    (sy + ny * ribbonOff + driftY) * breath,
    depthOff * breath
  );

  h = 0.92 + rnd4 * 0.03;
  sat = 0.7;
  lum = 0.52 + Math.sin(u * Math.PI) * 0.13 + rnd4 * 0.05;
}

color.setHSL(h, sat, lum);
