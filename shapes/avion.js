// Avion de ligne 3D - v2 amélioré
var segments = 5;
var segSizes = [6000, 7000, 2000, 2000, 3000]; // fuselage, ailes, empennage, dérive, réacteurs
var segStart = [0, 6000, 13000, 15000, 17000];
var seg, li;
if (i < segStart[1]) { seg = 0; li = i - segStart[0]; }
else if (i < segStart[2]) { seg = 1; li = i - segStart[1]; }
else if (i < segStart[3]) { seg = 2; li = i - segStart[2]; }
else if (i < segStart[4]) { seg = 3; li = i - segStart[3]; }
else { seg = 4; li = i - segStart[4]; }

var rnd = (Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1;
if (rnd < 0) rnd += 1;
var rnd2 = (Math.sin(i * 269.5 + 183.3) * 21345.6789) % 1;
if (rnd2 < 0) rnd2 += 1;
var rnd3 = (Math.sin(i * 419.2 + 571.9) * 65432.1234) % 1;
if (rnd3 < 0) rnd3 += 1;

var breath = Math.sin(time * 0.4) * 0.1;

if (seg === 0) {
    // Fuselage - cylindre bien rempli avec nez et queue
    var len = 38;
    var radius = 3.2;
    var t = li / segSizes[0];
    var z = (t - 0.5) * len;
    var angle = rnd2 * Math.PI * 2;
    var rFill = Math.sqrt(rnd3) * radius; // remplissage volumique

    // Nez arrondi
    var rMod = 1.0;
    if (z > 14) {
        var noseT = (z - 14) / 5;
        rMod = Math.cos(noseT * Math.PI * 0.48);
    } else if (z < -13) {
        var tailT = (-13 - z) / 6;
        rMod = 1 - tailT * 0.55;
    }

    // Mix surface + volume
    var isSurface = rnd > 0.4;
    var r = isSurface ? radius * rMod : rFill * rMod;
    var x = Math.cos(angle) * r;
    var y = Math.sin(angle) * r;
    target.set(x, y + breath, z);

    // Couleur: blanc avec bande bleue horizontale
    var inBand = y > -0.8 && y < 0.8 && z > -13 && z < 14 && isSurface;
    if (inBand) {
        color.setRGB(0.05, 0.15, 0.5);
    } else {
        color.setRGB(0.75, 0.77, 0.8);
    }

} else if (seg === 1) {
    // Ailes - bien remplies avec épaisseur
    var side = li < segSizes[1] / 2 ? 1 : -1;
    var localI = li % Math.floor(segSizes[1] / 2);
    var n = Math.floor(segSizes[1] / 2);
    var t = localI / n;

    var span = Math.sqrt(rnd) ; // distribution plus dense près du fuselage
    var wingX = side * (3.2 + span * 19);

    // Corde diminue vers le bout
    var chord = 7 * (1 - span * 0.5);
    var wingZ = (rnd2 - 0.5) * chord + 1 - span * 5; // flèche

    // Épaisseur
    var thick = 0.6 * (1 - span * 0.6);
    var wingY = (rnd3 - 0.5) * thick;

    target.set(wingX, wingY + breath, wingZ);

    if (span > 0.92) {
        color.setRGB(0.7, 0.1, 0.1);
    } else {
        color.setRGB(0.7, 0.72, 0.76);
    }

} else if (seg === 2) {
    // Empennage horizontal
    var side = li < segSizes[2] / 2 ? 1 : -1;
    var localI = li % Math.floor(segSizes[2] / 2);
    var n = Math.floor(segSizes[2] / 2);

    var span = rnd;
    var hX = side * (0.5 + span * 7);
    var hZ = -16 - span * 3.5;
    var hY = 1.2 + (rnd2 - 0.5) * 0.4 + (rnd3 - 0.5) * 0.2;

    target.set(hX, hY + breath, hZ);
    color.setRGB(0.7, 0.72, 0.76);

} else if (seg === 3) {
    // Dérive verticale - forme triangulaire bien remplie
    var t = rnd;
    var deriveH = 8;
    var y = 1.5 + t * deriveH;
    var z = -15 - t * 4.5;

    // Plus large en bas, fin en haut
    var width = (1 - t) * 2.5 + 0.3;
    var x = (rnd2 - 0.5) * width;
    var thick = (rnd3 - 0.5) * 0.4;

    target.set(x + thick * 0.3, y + breath, z);

    if (t > 0.25) {
        color.setRGB(0.05, 0.15, 0.5);
    } else {
        color.setRGB(0.7, 0.72, 0.76);
    }

} else {
    // Réacteurs - deux cylindres pleins sous les ailes
    var side = li < segSizes[4] / 2 ? 1 : -1;
    var localI = li % Math.floor(segSizes[4] / 2);
    var n = Math.floor(segSizes[4] / 2);
    var t = localI / n;

    var engineLen = 6;
    var engineR = 1.5;
    var angle = rnd2 * Math.PI * 2;

    var eZ = (rnd - 0.5) * engineLen + 0;
    var rFill = Math.sqrt(rnd3) * engineR;

    // Entrée plus large
    var rMod = 1.0;
    if (eZ > engineLen * 0.4) rMod = 1.15;
    if (eZ < -engineLen * 0.4) rMod = 1.1;

    // Surface + volume mix
    var isSurface = rnd3 > 0.5;
    var r = isSurface ? engineR * rMod : rFill * rMod;

    var eX = side * 8.5 + Math.cos(angle) * r;
    var eY = -2.8 + Math.sin(angle) * r;

    target.set(eX, eY + breath, eZ);

    // Flamme à l'arrière
    if (eZ < -engineLen * 0.3) {
        var flicker = Math.sin(time * 10 + i * 0.5) * 0.08;
        color.setHSL(0.07 + flicker, 0.85, 0.5);
    } else {
        color.setRGB(0.45, 0.47, 0.52);
    }
}
