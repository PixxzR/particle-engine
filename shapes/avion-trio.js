// Avion trio - Gold / Silver / Bronze côte à côte
var perPlane = Math.floor(count / 3);                  // ~6666
var plane = Math.min(2, Math.floor(i / perPlane));
var pi = i - plane * perPlane;                         // index local au plane

// Segments (proportionnels à l'original 6000/7000/2000/2000/3000 sur 20000)
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

var breath = Math.sin(time * 0.4 + plane * 1.0) * 0.1;   // déphasage entre avions

// Offset latéral de chaque avion + léger décalage en profondeur pour casser la symétrie
var planeX = (plane - 1) * 52;       // -52, 0, +52
var planeZ = (plane === 1) ? 0 : -3;

// Palette selon le plane : 0=GOLD, 1=SILVER, 2=BRONZE
function paint(shade) {
    shade = Math.max(0, Math.min(1, shade));
    if (plane === 0) {
        // GOLD - plus lumineux, saturation ++
        var h = 0.125 + shade * 0.015;
        var s = 0.95 - Math.abs(shade - 0.5) * 0.15;
        var l = 0.40 + shade * 0.45;
        color.setHSL(h, s, Math.min(0.9, l));
    } else if (plane === 1) {
        // SILVER - range plus serré pour éviter cramage central
        color.setHSL(0.58, 0.05, 0.45 + shade * 0.4);
    } else {
        // BRONZE - cuivre rouge saturé, distinct du gold
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

var x, y, z;

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
    x = Math.cos(angle) * r; y = Math.sin(angle) * r; z = zl;
    var shimmer = Math.sin(angle * 2 + zl * 0.15 - time * 0.8 + plane * 1.7) * 0.5 + 0.5;
    var topLight = Math.max(0, Math.sin(angle)) * 0.4;
    var shade = 0.3 + shimmer * 0.35 + topLight;
    if (!isSurface) shade *= 0.5;
    paint(shade);
} else if (seg === 1) {
    var side = li < segSizes[1] / 2 ? 1 : -1;
    var span = Math.sqrt(rnd);
    x = side * (3.2 + span * 19);
    var chord = 7 * (1 - span * 0.5);
    z = (rnd2 - 0.5) * chord + 1 - span * 5;
    y = (rnd3 - 0.5) * 0.6 * (1 - span * 0.6);
    if (span > 0.92) paint(0.95);
    else { var shimmer = Math.sin(span * 6 - time * 1.2) * 0.5 + 0.5; paint(0.3 + shimmer * 0.4); }
} else if (seg === 2) {
    var side = li < segSizes[2] / 2 ? 1 : -1;
    var span = rnd;
    x = side * (0.5 + span * 7);
    z = -16 - span * 3.5;
    y = 1.2 + (rnd2 - 0.5) * 0.4 + (rnd3 - 0.5) * 0.2;
    paint(0.55);
} else if (seg === 3) {
    var t = rnd;
    y = 1.5 + t * 8;
    z = -15 - t * 4.5;
    var width = (1 - t) * 2.5 + 0.3;
    x = (rnd2 - 0.5) * width + (rnd3 - 0.5) * 0.4 * 0.3;
    paint(0.5 + t * 0.4);
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
    x = side * 8.5 + Math.cos(angle) * r;
    y = -2.8 + Math.sin(angle) * r;
    z = eZ;
    if (eZ < -engineLen * 0.3) {
        flame();
    } else {
        if (eZ > engineLen * 0.35) paint(0.8);
        else { var topLight = Math.max(0, Math.sin(angle)) * 0.3; paint(0.28 + topLight); }
    }
}

target.set(x + planeX, y + breath, z + planeZ);
