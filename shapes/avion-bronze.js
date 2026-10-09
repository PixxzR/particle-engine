// Avion de ligne 3D - version BRONZE (cuivre/bronze patiné)
var segSizes = [6000, 7000, 2000, 2000, 3000];
var segStart = [0, 6000, 13000, 15000, 17000];
var seg, li;
if (i < segStart[1]) { seg = 0; li = i - segStart[0]; }
else if (i < segStart[2]) { seg = 1; li = i - segStart[1]; }
else if (i < segStart[3]) { seg = 2; li = i - segStart[2]; }
else if (i < segStart[4]) { seg = 3; li = i - segStart[3]; }
else { seg = 4; li = i - segStart[4]; }

var rnd = (Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1; if (rnd < 0) rnd += 1;
var rnd2 = (Math.sin(i * 269.5 + 183.3) * 21345.6789) % 1; if (rnd2 < 0) rnd2 += 1;
var rnd3 = (Math.sin(i * 419.2 + 571.9) * 65432.1234) % 1; if (rnd3 < 0) rnd3 += 1;

var breath = Math.sin(time * 0.4) * 0.1;

// Palette bronze : teinte cuivre saturée, lightness 0.2-0.55
function metalShade(shade) {
    shade = Math.max(0, Math.min(1, shade));
    // Cuivre/bronze : hue 0.03 (rouge-orange), très saturé, lightness modérée
    var h = 0.035 + shade * 0.02;
    var s = 0.95 - Math.abs(shade - 0.5) * 0.1;
    var l = 0.28 + shade * 0.32;
    color.setHSL(h, s, Math.min(0.65, l));
}

if (seg === 0) {
    var len = 38, radius = 3.2;
    var t = li / segSizes[0];
    var z = (t - 0.5) * len;
    var angle = rnd2 * Math.PI * 2;
    var rFill = Math.sqrt(rnd3) * radius;
    var rMod = 1.0;
    if (z > 14) { var noseT = (z - 14) / 5; rMod = Math.cos(noseT * Math.PI * 0.48); }
    else if (z < -13) { var tailT = (-13 - z) / 6; rMod = 1 - tailT * 0.55; }
    var isSurface = rnd > 0.4;
    var r = isSurface ? radius * rMod : rFill * rMod;
    var x = Math.cos(angle) * r, y = Math.sin(angle) * r;
    target.set(x, y + breath, z);
    var shimmer = Math.sin(angle * 2 + z * 0.15 - time * 0.8) * 0.5 + 0.5;
    var topLight = Math.max(0, Math.sin(angle)) * 0.4;
    var shade = 0.3 + shimmer * 0.35 + topLight;
    if (!isSurface) shade *= 0.5;
    metalShade(Math.min(1, shade));
} else if (seg === 1) {
    var side = li < segSizes[1] / 2 ? 1 : -1;
    var span = Math.sqrt(rnd);
    var wingX = side * (3.2 + span * 19);
    var chord = 7 * (1 - span * 0.5);
    var wingZ = (rnd2 - 0.5) * chord + 1 - span * 5;
    var thick = 0.6 * (1 - span * 0.6);
    var wingY = (rnd3 - 0.5) * thick;
    target.set(wingX, wingY + breath, wingZ);
    if (span > 0.92) { metalShade(0.9); }
    else { var shimmer = Math.sin(span * 6 - time * 1.2) * 0.5 + 0.5; metalShade(0.3 + shimmer * 0.4); }
} else if (seg === 2) {
    var side = li < segSizes[2] / 2 ? 1 : -1;
    var span = rnd;
    var hX = side * (0.5 + span * 7);
    var hZ = -16 - span * 3.5;
    var hY = 1.2 + (rnd2 - 0.5) * 0.4 + (rnd3 - 0.5) * 0.2;
    target.set(hX, hY + breath, hZ);
    metalShade(0.5);
} else if (seg === 3) {
    var t = rnd, deriveH = 8;
    var y = 1.5 + t * deriveH, z = -15 - t * 4.5;
    var width = (1 - t) * 2.5 + 0.3;
    var x = (rnd2 - 0.5) * width;
    var thick = (rnd3 - 0.5) * 0.4;
    target.set(x + thick * 0.3, y + breath, z);
    metalShade(0.45 + t * 0.4);
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
    var eX = side * 8.5 + Math.cos(angle) * r;
    var eY = -2.8 + Math.sin(angle) * r;
    target.set(eX, eY + breath, eZ);
    if (eZ < -engineLen * 0.3) {
        // Flamme rouge-orange profonde
        var flicker = Math.sin(time * 10 + i * 0.5) * 0.06;
        color.setHSL(0.04 + flicker, 0.9, 0.48);
    } else {
        if (eZ > engineLen * 0.35) { metalShade(0.75); }
        else { var topLight = Math.max(0, Math.sin(angle)) * 0.3; metalShade(0.22 + topLight); }
    }
}
