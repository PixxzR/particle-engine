// Avion trio DANCE - 3 avions Gold/Silver/Bronze en ronde perpétuelle
// Chaque avion vole en cercle, nez orienté selon la tangente,
// avec un léger weaving vertical et un banking visuel
var perPlane = Math.floor(count / 3);
var plane = Math.min(2, Math.floor(i / perPlane));
var pi = i - plane * perPlane;

var segSizes = [
    Math.floor(perPlane * 0.30),
    Math.floor(perPlane * 0.35),
    Math.floor(perPlane * 0.10),
    Math.floor(perPlane * 0.10),
    0
];
segSizes[4] = perPlane - (segSizes[0] + segSizes[1] + segSizes[2] + segSizes[3]);
var segStart = [0, segSizes[0], segSizes[0]+segSizes[1], segSizes[0]+segSizes[1]+segSizes[2], segSizes[0]+segSizes[1]+segSizes[2]+segSizes[3]];

var seg, li;
if (pi < segStart[1]) { seg = 0; li = pi; }
else if (pi < segStart[2]) { seg = 1; li = pi - segStart[1]; }
else if (pi < segStart[3]) { seg = 2; li = pi - segStart[2]; }
else if (pi < segStart[4]) { seg = 3; li = pi - segStart[3]; }
else { seg = 4; li = pi - segStart[4]; }

var rnd = (Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1; if (rnd < 0) rnd += 1;
var rnd2 = (Math.sin(i * 269.5 + 183.3) * 21345.6789) % 1; if (rnd2 < 0) rnd2 += 1;
var rnd3 = (Math.sin(i * 419.2 + 571.9) * 65432.1234) % 1; if (rnd3 < 0) rnd3 += 1;

// Palette (identique au trio statique)
function paint(shade) {
    shade = Math.max(0, Math.min(1, shade));
    if (plane === 0) {
        var h = 0.125 + shade * 0.015;
        var s = 0.95 - Math.abs(shade - 0.5) * 0.15;
        var l = 0.40 + shade * 0.45;
        color.setHSL(h, s, Math.min(0.9, l));
    } else if (plane === 1) {
        color.setHSL(0.58, 0.05, 0.45 + shade * 0.4);
    } else {
        var h = 0.035 + shade * 0.02;
        var s = 0.95 - Math.abs(shade - 0.5) * 0.1;
        var l = 0.28 + shade * 0.32;
        color.setHSL(h, s, Math.min(0.65, l));
    }
}
function flame() {
    var flicker = Math.sin(time * 10 + i * 0.5) * 0.07;
    if (plane === 0) color.setHSL(0.1 + flicker, 0.95, 0.6);
    else if (plane === 1) color.setHSL(0.55 + flicker * 0.7, 0.6, 0.75);
    else color.setHSL(0.04 + flicker * 0.8, 0.9, 0.48);
}

// --- Géométrie locale de l'avion (repère local, nez vers +Z) ---
var lx, ly, lz;
var shadeOut = 0.5, useFlame = false;

if (seg === 0) {
    var len = 38, radius = 3.2;
    var t = li / segSizes[0];
    var zl = (t - 0.5) * len;
    var angle = rnd2 * Math.PI * 2;
    var rFill = Math.sqrt(rnd3) * radius;
    var rMod = 1.0;
    if (zl > 14) { var noseT = (zl - 14) / 5; rMod = Math.cos(noseT * Math.PI * 0.48); }
    else if (zl < -13) { var tailT = (-13 - zl) / 6; rMod = 1 - tailT * 0.55; }
    var isSurface = rnd > 0.4;
    var r = isSurface ? radius * rMod : rFill * rMod;
    lx = Math.cos(angle) * r; ly = Math.sin(angle) * r; lz = zl;
    var shimmer = Math.sin(angle * 2 + zl * 0.15 - time * 0.8 + plane * 1.7) * 0.5 + 0.5;
    var topLight = Math.max(0, Math.sin(angle)) * 0.4;
    shadeOut = 0.3 + shimmer * 0.35 + topLight;
    if (!isSurface) shadeOut *= 0.5;
} else if (seg === 1) {
    var side = li < segSizes[1] / 2 ? 1 : -1;
    var span = Math.sqrt(rnd);
    lx = side * (3.2 + span * 19);
    var chord = 7 * (1 - span * 0.5);
    lz = (rnd2 - 0.5) * chord + 1 - span * 5;
    ly = (rnd3 - 0.5) * 0.6 * (1 - span * 0.6);
    if (span > 0.92) shadeOut = 0.95;
    else { var shimmer = Math.sin(span * 6 - time * 1.2) * 0.5 + 0.5; shadeOut = 0.3 + shimmer * 0.4; }
} else if (seg === 2) {
    var side = li < segSizes[2] / 2 ? 1 : -1;
    var span = rnd;
    lx = side * (0.5 + span * 7);
    lz = -16 - span * 3.5;
    ly = 1.2 + (rnd2 - 0.5) * 0.4 + (rnd3 - 0.5) * 0.2;
    shadeOut = 0.55;
} else if (seg === 3) {
    var t = rnd;
    ly = 1.5 + t * 8;
    lz = -15 - t * 4.5;
    var width = (1 - t) * 2.5 + 0.3;
    lx = (rnd2 - 0.5) * width + (rnd3 - 0.5) * 0.12;
    shadeOut = 0.5 + t * 0.4;
} else {
    var side = li < segSizes[4] / 2 ? 1 : -1;
    var engineLen = 6, engineR = 1.5;
    var angle = rnd2 * Math.PI * 2;
    var eZ = (rnd - 0.5) * engineLen;
    var rFill = Math.sqrt(rnd3) * engineR;
    var rMod = 1.0;
    if (eZ > engineLen * 0.4) rMod = 1.15;
    if (eZ < -engineLen * 0.4) rMod = 1.1;
    var isSurface = rnd3 > 0.5;
    var r = isSurface ? engineR * rMod : rFill * rMod;
    lx = side * 8.5 + Math.cos(angle) * r;
    ly = -2.8 + Math.sin(angle) * r;
    lz = eZ;
    if (eZ < -engineLen * 0.3) { useFlame = true; }
    else if (eZ > engineLen * 0.35) { shadeOut = 0.8; }
    else { var topLight = Math.max(0, Math.sin(angle)) * 0.3; shadeOut = 0.28 + topLight; }
}

if (useFlame) flame(); else paint(shadeOut);

// --- Choregraphie : orbite circulaire autour de (0,0,0) ---
// 3 avions espacés de 120°, rayon 42, vitesse angulaire modérée
var orbitR = 42;
var orbitSpeed = 0.35;                  // rad/sec
var phase = plane * (Math.PI * 2 / 3);  // 0, 120°, 240°
var theta = time * orbitSpeed + phase;

// Weaving vertical : chaque avion monte/descend en déphasage
var yBob = Math.sin(theta * 2 + plane * 1.3) * 4.5;

// Banking (roll) : l'avion s'incline vers l'intérieur du virage
var bank = 0.35; // radians, constant pour une orbite stable
var cb = Math.cos(bank), sb = Math.sin(bank);
// Roll local autour de l'axe Z (avant) : (x,y) → rotation
var rx = lx * cb - ly * sb;
var ry = lx * sb + ly * cb;
var rz = lz;

// Yaw : nez de l'avion aligné avec la tangente au cercle
// tangente = (-sin(theta), 0, cos(theta)) ; on tourne le repère local de -theta autour de Y
var ct = Math.cos(theta), st = Math.sin(theta);
var wx = rx * ct - rz * st;
var wz = rx * st + rz * ct;
var wy = ry;

// Translation sur le cercle
var px = orbitR * ct;
var pz = orbitR * st;

target.set(wx + px, wy + yBob, wz + pz);
