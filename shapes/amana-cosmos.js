// Amana Cosmos — ambient particle field, complementary to the existing "A" section
// Structure: 60% drifting nebula dust (dim) + 35% flowing currents (mid) + 5% bright stars
// Two purple/pink nebula "centers" anchor the field for spatial interest
// In real integration: replace `scrollProg` with actual page scroll 0..1

var scrollProg = (Math.sin(time * 0.13) + 1) * 0.5;

var rnd1 = (Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1; if (rnd1 < 0) rnd1 += 1;
var rnd2 = (Math.sin(i * 269.5 + 183.3) * 21345.6789) % 1; if (rnd2 < 0) rnd2 += 1;
var rnd3 = (Math.sin(i * 419.2 + 571.9) * 65432.1234) % 1; if (rnd3 < 0) rnd3 += 1;
var rnd4 = (Math.sin(i * 73.6 + 947.1) * 38291.4321) % 1; if (rnd4 < 0) rnd4 += 1;

// Particle role: stars (5%), currents (35%), dust (60%)
var role;
if (rnd4 > 0.95) role = 2;        // bright star
else if (rnd4 > 0.6) role = 1;    // current
else role = 0;                    // dust

var t = time * 0.07;
var px, py, pz;
var h, sat, lum;

if (role === 2) {
  // ---- Bright stars: scattered constellation points ----
  px = (rnd1 - 0.5) * 30;
  py = (rnd2 - 0.5) * 38;
  pz = (rnd3 - 0.5) * 16;

  px += Math.sin(time * 0.4 + i * 0.3) * 0.3;
  py += Math.cos(time * 0.35 + i * 0.4) * 0.3;

  var twinkle = 0.5 + 0.5 * Math.sin(time * 1.4 + i * 0.7);

  // Star color follows nearby nebula center
  var distTopLeft = (px + 7) * (px + 7) + (py - 8) * (py - 8);
  var distBotRight = (px - 6) * (px - 6) + (py + 10) * (py + 10);
  if (distTopLeft < distBotRight) {
    h = 0.78 + rnd3 * 0.06;   // violet star
  } else {
    h = 0.9 + rnd3 * 0.05;    // pink star
  }
  sat = 0.45 + rnd2 * 0.25;
  lum = 0.6 + twinkle * 0.3;

} else if (role === 1) {
  // ---- Currents: particles arranged along flowing streams ----
  // Group particles into ~30 streams, each tracing an S-curve
  var streamId = Math.floor(rnd1 * 30);
  var streamSeed = streamId * 0.137;
  var sInLine = rnd2;  // 0..1 along stream

  // Stream control points (random per stream)
  var sx0 = Math.sin(streamSeed * 7.3) * 14;
  var sy0 = Math.cos(streamSeed * 4.1) * 18;
  var sx1 = Math.sin(streamSeed * 9.7 + 2) * 12;
  var sy1 = Math.cos(streamSeed * 5.3 + 1) * 16;

  // Animate stream by shifting parameter with time
  var sParam = (sInLine + time * 0.04) % 1;
  var sV = 1 - sParam;

  px = sV * sx0 + sParam * sx1 + Math.sin(sParam * Math.PI * 2 + streamSeed * 6) * 3;
  py = sV * sy0 + sParam * sy1 + Math.cos(sParam * Math.PI * 2 + streamSeed * 4) * 2.5;
  pz = (rnd3 - 0.5) * 8 + Math.sin(sParam * Math.PI + streamSeed * 3) * 2;

  // Tiny perpendicular jitter for thickness
  px += (rnd4 - 0.5) * 0.4;
  py += (rnd1 - 0.5) * 0.3;

  // Currents: violet → pink gradient along stream (suggests flow between nebulae)
  h = 0.78 + sParam * 0.14;
  sat = 0.6 + rnd3 * 0.15;
  lum = 0.4 + Math.sin(sParam * Math.PI) * 0.18 + rnd1 * 0.06;

} else {
  // ---- Dust: pulled toward two soft "nebula centers" ----
  // Center 1: upper-left (violet), Center 2: lower-right (pink)
  var center = rnd1 < 0.5 ? 0 : 1;
  var cx = center === 0 ? -7 : 6;
  var cy = center === 0 ? 8 : -10;
  var cz = center === 0 ? -2 : 3;

  // Local random offset around center, with gaussian-ish falloff
  var localR = Math.pow(rnd2, 1.4) * 16;  // most particles closer to center
  var localA = rnd3 * Math.PI * 2;
  var localPhi = (rnd4 - 0.5) * Math.PI;

  px = cx + Math.cos(localA) * Math.cos(localPhi) * localR;
  py = cy + Math.sin(localPhi) * localR * 0.85;
  pz = cz + Math.sin(localA) * Math.cos(localPhi) * localR * 0.6;

  // Slow drift
  px += Math.sin(time * 0.25 + i * 0.02) * 0.6;
  py += Math.cos(time * 0.22 + i * 0.03) * 0.4;
  pz += Math.sin(time * 0.18 + i * 0.04) * 0.5;

  // Color: violet center, transitions to pink at the other
  h = center === 0 ? (0.78 + rnd2 * 0.06) : (0.9 + rnd2 * 0.05);
  sat = 0.55 + rnd3 * 0.2;
  // Dust dimmer the further from its center
  lum = (0.35 - localR / 50) + rnd1 * 0.12;
  if (lum < 0.12) lum = 0.12;
}

// Subtle parallax with scroll (vertical shift)
py += -(scrollProg - 0.5) * 4;

target.set(px, py, pz);
color.setHSL(h, sat, lum);
