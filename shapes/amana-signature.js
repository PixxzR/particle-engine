// Amana Signature — morphs between ambient orbital cloud and logo "A + swoosh"
// Cycle (auto for prototype): cloud → logo → cloud
// In real site integration, replace `phase` with scroll progress 0..1

// === DEMO PHASE (replace with scroll progress when integrated) ===
// Smooth ease-in-out between cloud (0) and logo (1) with a hold at each end
var rawCycle = (Math.sin(time * 0.3) * 0.5 + 0.5);  // 0..1, period ~21s
// Smoothstep for nicer easing
var phase = rawCycle * rawCycle * (3 - 2 * rawCycle);

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

// =============================================================
// LOGO TARGET
// =============================================================
var logoX, logoY, logoZ;
var logoH, logoSat, logoLum;

if (seg < 15) {
  // Triangle "A"
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
    var topTt = li / n;
    lx = apexX + (rnd1 - 0.5) * (1.5 - topTt);
    ly = apexY - 0.6 * topTt + (rnd2 - 0.5) * 0.4;
  }

  var a = rnd1 * Math.PI * 2;
  var r = Math.sqrt(rnd2) * 0.85;
  logoX = lx + Math.cos(a) * r;
  logoY = ly + Math.sin(a) * r * 0.5;
  logoZ = (rnd3 - 0.5) * 0.45;

  var tNorm = (ly + 8) / 19;
  if (tNorm < 0) tNorm = 0; if (tNorm > 1) tNorm = 1;
  logoH = 0.88 + tNorm * 0.04;
  logoSat = 0.6 + (1 - tNorm) * 0.18;
  logoLum = 0.55 + tNorm * 0.18 + rnd4 * 0.05;

} else {
  // Swoosh
  var tt = (li + (seg - 15) * n) / (5 * n);
  var u = tt;
  var v = 1 - u;

  var p0x = -8.5, p0y = -3;
  var p1x = 0.5,  p1y = -10;
  var p2x = 9,    p2y = -1;

  var sx = v * v * p0x + 2 * v * u * p1x + u * u * p2x;
  var sy = v * v * p0y + 2 * v * u * p1y + u * u * p2y;

  var dx = 2 * v * (p1x - p0x) + 2 * u * (p2x - p1x);
  var dy = 2 * v * (p1y - p0y) + 2 * u * (p2y - p1y);
  var dl = Math.sqrt(dx * dx + dy * dy) || 1;
  var nx = -dy / dl;
  var ny = dx / dl;

  var ribbonOff = (rnd2 - 0.5) * 0.55;

  logoX = sx + nx * ribbonOff;
  logoY = sy + ny * ribbonOff;
  logoZ = (rnd3 - 0.5) * 0.5;

  logoH = 0.92 + rnd4 * 0.03;
  logoSat = 0.7;
  logoLum = 0.52 + Math.sin(u * Math.PI) * 0.13 + rnd4 * 0.05;
}

// =============================================================
// AMBIENT CLOUD TARGET — slow orbital nebula
// =============================================================
var cloudAng = (i / count) * Math.PI * 6 + time * 0.06;
var cloudR = 7 + rnd1 * 9;
var tilt = 0.25;
var cx = Math.cos(cloudAng) * cloudR;
var cy = Math.sin(cloudAng) * cloudR * 0.55;

var cloudX = cx + (rnd2 - 0.5) * 2.5;
var cloudY = cy * Math.cos(tilt) + (rnd3 - 0.5) * 4 + Math.sin(time * 0.4 + i * 0.02) * 0.3;
var cloudZ = cy * Math.sin(tilt) + (rnd4 - 0.5) * 3;

// Cloud color: violet→pink, more uniform, dimmer (background-like)
var cloudH = 0.78 + rnd1 * 0.14;  // 0.78 (violet) -> 0.92 (pink)
var cloudSat = 0.5 + rnd2 * 0.2;
var cloudLum = 0.35 + rnd3 * 0.15;  // dimmer than logo

// =============================================================
// LERP between cloud (phase=0) and logo (phase=1)
// =============================================================
var inv = 1 - phase;
var fx = cloudX * inv + logoX * phase;
var fy = cloudY * inv + logoY * phase;
var fz = cloudZ * inv + logoZ * phase;

target.set(
  (fx + driftX) * breath,
  (fy + driftY) * breath,
  fz * breath
);

// Color lerp
var fh = cloudH * inv + logoH * phase;
var fs = cloudSat * inv + logoSat * phase;
var fl = cloudLum * inv + logoLum * phase;
color.setHSL(fh, fs, fl);
