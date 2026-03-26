// McLaren P1 v3 - affinée + animations
var segSizes = [7000, 3000, 1200, 3000, 2800, 3000];
var segStart = [0, 7000, 10000, 11200, 14200, 17000];
var seg, li;
if (i < segStart[1]) { seg = 0; li = i; }
else if (i < segStart[2]) { seg = 1; li = i - segStart[1]; }
else if (i < segStart[3]) { seg = 2; li = i - segStart[2]; }
else if (i < segStart[4]) { seg = 3; li = i - segStart[3]; }
else if (i < segStart[5]) { seg = 4; li = i - segStart[4]; }
else { seg = 5; li = i - segStart[5]; }

var rnd = (Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1;
if (rnd < 0) rnd += 1;
var rnd2 = (Math.sin(i * 269.5 + 183.3) * 21345.6789) % 1;
if (rnd2 < 0) rnd2 += 1;
var rnd3 = (Math.sin(i * 419.2 + 571.9) * 65432.1234) % 1;
if (rnd3 < 0) rnd3 += 1;

var carL = 34;
var carW = 13;

// Profil P1 - fonction réutilisable
function getProfile(t) {
    if (t < 0.08) return 0.8 + t * 18;
    if (t < 0.22) return 2.24 + (t - 0.08) * 18;
    if (t < 0.38) return 4.76 + (t - 0.22) * 5.5;
    if (t < 0.58) return 5.64;
    if (t < 0.78) return 5.64 - (t - 0.58) * 10.5;
    return 3.54 - (t - 0.78) * 7;
}
function getWidth(t) {
    if (t < 0.06) return 0.3 + t * 11.7;
    if (t > 0.92) return 0.5 + (1 - t) * 6.25;
    if (t > 0.8) return 0.9 + (0.92 - t) * 0.83;
    return 1.0;
}

if (seg === 0) {
    // Carrosserie - surfaces denses
    var t = rnd;
    var z = (t - 0.5) * carL;
    var profileH = getProfile(t);
    var halfW = (carW / 2) * getWidth(t);
    var side = rnd2 > 0.5 ? 1 : -1;

    var face = rnd3;
    var x, y;
    if (face < 0.3) {
        x = -halfW + (rnd2 - 0.5) * 0.3;
        y = rnd2 * profileH;
    } else if (face < 0.6) {
        x = halfW + (rnd2 - 0.5) * 0.3;
        y = (1 - rnd2) * profileH;
    } else if (face < 0.72) {
        x = (rnd2 - 0.5) * halfW * 2;
        y = 0;
    } else if (face < 0.82) {
        // Avant face
        x = (rnd2 - 0.5) * halfW * 1.8;
        y = rnd * profileH * 0.8;
        z = carL * 0.5;
    } else if (face < 0.92) {
        // Arrière face
        x = (rnd2 - 0.5) * halfW * 1.6;
        y = rnd * profileH * 0.7;
        z = -carL * 0.5;
    } else {
        // Dessus capot
        x = (rnd2 - 0.5) * halfW * 1.8;
        y = profileH;
    }

    target.set(x, y, z);
    // Orange avec subtil reflet animé sur le flanc
    var reflectAnim = Math.sin(time * 0.8 + z * 0.2) * 0.03;
    // Variation de teinte selon la hauteur (plus sombre en bas, carénage)
    var heightShade = 0.7 + (y / 6) * 0.18;
    var shade = heightShade + reflectAnim;
    color.setRGB(shade, shade * 0.4, shade * 0.04);

} else if (seg === 1) {
    // Toit + dessus
    var t = rnd;
    var z = (t - 0.5) * carL;
    var topH = getProfile(t);
    var halfW = (carW / 2) * getWidth(t);

    var x, y;
    if (t >= 0.36 && t <= 0.6) {
        x = (rnd2 - 0.5) * 7.5;
        y = topH + (rnd3 - 0.5) * 0.1;
    } else {
        x = (rnd2 - 0.5) * halfW * 1.8;
        y = topH + (rnd3 - 0.5) * 0.1;
    }
    target.set(x, y, z);

    if (t >= 0.36 && t <= 0.6) {
        color.setRGB(0.05, 0.05, 0.07);
    } else {
        var reflectAnim = Math.sin(time * 0.8 + z * 0.2) * 0.04;
        var shade = 0.82 + reflectAnim;
        color.setRGB(shade, shade * 0.4, shade * 0.05);
    }

} else if (seg === 2) {
    // Pare-brise + vitres
    var t = 0.28 + rnd * 0.36;
    var z = (t - 0.5) * carL;
    var windH = rnd2;
    var side = rnd3 > 0.5 ? 1 : -1;

    var x, y;
    if (t < 0.4) {
        x = (rnd2 - 0.5) * 7.5;
        y = 3.2 + windH * 2.5;
    } else if (t > 0.57) {
        x = (rnd2 - 0.5) * 6;
        y = 3.2 + windH * 2;
    } else {
        x = side * (3.8 + windH * 0.6);
        y = 3.2 + rnd2 * 2.3;
    }
    target.set(x, y, z);
    color.setRGB(0.06, 0.08, 0.13);

} else if (seg === 3) {
    // 4 roues - ROTATION ANIMÉE
    var wheelIdx = Math.floor(li / (segSizes[3] / 4));
    var localI = li % Math.floor(segSizes[3] / 4);
    var n = Math.floor(segSizes[3] / 4);

    var wx, wz, wheelR;
    if (wheelIdx === 0) { wx = -6.2; wz = 10; wheelR = 2.0; }
    else if (wheelIdx === 1) { wx = 6.2; wz = 10; wheelR = 2.0; }
    else if (wheelIdx === 2) { wx = -6.5; wz = -10; wheelR = 2.3; }
    else { wx = 6.5; wz = -10; wheelR = 2.3; }

    var wheelW = 1.8;
    var baseAngle = rnd * Math.PI * 2;
    // Rotation animée
    var spin = time * 3.0;
    var angle = baseAngle + spin;

    var isRim = rnd2 < 0.3;
    var r;
    if (isRim) {
        // Jante - disque plein avec rayons subtils
        r = rnd3 * wheelR * 0.65;
        var spokeAngle = rnd * Math.PI * 2 + spin;
        var px = wx + (rnd2 - 0.15) * wheelW * 0.5;
        var py = wheelR + r * Math.sin(spokeAngle);
        var pz = wz + r * Math.cos(spokeAngle);
        target.set(px, py - 0.3, pz);
        color.setRGB(0.2, 0.2, 0.24);
    } else {
        // Pneu - anneau épais
        r = wheelR * (0.8 + rnd3 * 0.2);
        var px = wx + (rnd2 - 0.5) * wheelW;
        var py = wheelR + r * Math.sin(angle);
        var pz = wz + r * Math.cos(angle);
        target.set(px, py - 0.3, pz);
        color.setRGB(0.06, 0.06, 0.08);
    }

} else if (seg === 4) {
    // Aileron arrière - léger mouvement DRS
    var drs = Math.sin(time * 0.3) * 0.4; // oscillation subtile
    var part = Math.floor(li / (segSizes[4] / 3));

    if (part === 0) {
        // Lame - large et profilée
        var x = (rnd - 0.5) * 12.5;
        var z = -14 + (rnd2 - 0.5) * 3.2;
        var y = 6.8 + drs + (rnd3 - 0.5) * 0.2;
        // Bord de fuite courbé
        y += Math.abs(x) * 0.03;
        // Bord d'attaque plus épais au centre
        var thick = (1 - Math.abs(x) / 6.25) * 0.3;
        y += (rnd3 - 0.5) * thick;
        target.set(x, y, z);
        color.setRGB(0.1, 0.1, 0.12);
    } else if (part === 1) {
        // Montant gauche
        var t = rnd;
        var x = -4.3 + (rnd2 - 0.5) * 0.7;
        var y = 3 + t * (3.8 + drs);
        var z = -14.5 + (rnd3 - 0.5) * 0.7;
        target.set(x, y, z);
        color.setRGB(0.1, 0.1, 0.12);
    } else {
        // Montant droit
        var t = rnd;
        var x = 4.3 + (rnd2 - 0.5) * 0.7;
        var y = 3 + t * (3.8 + drs);
        var z = -14.5 + (rnd3 - 0.5) * 0.7;
        target.set(x, y, z);
        color.setRGB(0.1, 0.1, 0.12);
    }

} else {
    // Détails: phares, feux, prises d'air, diffuseur, échappement
    var detail = Math.floor(li / (segSizes[5] / 6));

    if (detail === 0) {
        // Phares avant LED - forme agressive
        var side = rnd > 0.5 ? 1 : -1;
        var x = side * (2 + rnd2 * 3);
        var y = 1.3 + rnd3 * 0.7;
        var z = 16.5 + rnd2 * 0.4;
        target.set(x, y, z);
        // LED discret
        var pulse = 0.35 + Math.sin(time * 2) * 0.03;
        color.setRGB(pulse, pulse * 0.97, pulse * 1.05);
    } else if (detail === 1) {
        // Feux arrière bande LED - pulsation frein
        var x = (rnd - 0.5) * 11;
        var y = 2.8 + rnd3 * 0.7;
        var z = -16.5 - rnd2 * 0.3;
        target.set(x, y, z);
        // Pulse de freinage
        var brake = 0.5 + Math.sin(time * 1.5) * 0.15;
        color.setRGB(brake, 0.02, 0.01);
    } else if (detail === 2) {
        // Prises d'air latérales
        var side = rnd > 0.5 ? 1 : -1;
        var x = side * (6.6 + rnd3 * 0.3);
        var y = 1.5 + rnd2 * 2.8;
        var z = -1 + (rnd3 - 0.5) * 7;
        target.set(x, y, z);
        color.setRGB(0.12, 0.12, 0.14);
    } else if (detail === 3) {
        // Diffuseur arrière avec flux animé
        var x = (rnd - 0.5) * 11;
        var y = rnd2 * 2;
        var z = -15.5 - rnd3 * 2.5;
        // Particules de flux qui bougent
        z -= Math.sin(time * 4 + rnd * 6) * 0.3;
        target.set(x, y, z);
        // Gris avec reflet chaud de l'échappement
        var heat = Math.max(0, Math.sin(time * 3 + rnd * 4) * 0.15);
        color.setRGB(0.12 + heat, 0.12 + heat * 0.3, 0.14);
    } else if (detail === 4) {
        // Échappement central - flamme animée
        var x = (rnd - 0.5) * 3;
        var y = 1.2 + (rnd2 - 0.5) * 1;
        var z = -17 - rnd3 * 2.5;
        // Flamme qui bouge
        x += Math.sin(time * 8 + rnd * 10) * 0.4;
        y += Math.cos(time * 6 + rnd * 8) * 0.3;
        z -= Math.abs(Math.sin(time * 5 + rnd * 7)) * 1.5;
        target.set(x, y, z);
        var flicker = Math.sin(time * 12 + i) * 0.1;
        color.setHSL(0.06 + flicker, 0.85, 0.35 + rnd3 * 0.15);
    } else {
        // Splitter avant
        var x = (rnd - 0.5) * 13;
        var y = 0.15 + rnd3 * 0.2;
        var z = 14 + rnd2 * 3.5;
        target.set(x, y, z);
        color.setRGB(0.1, 0.1, 0.12);
    }
}

// Reflet au sol (utiliser les dernières particules si disponibles)
if (i >= 19500) {
    var ri = i - 19500;
    var t = (ri / 500);
    var z2 = (t - 0.5) * carL * 0.8;
    var x2 = (rnd - 0.5) * carW * 1.2;
    var y2 = -0.5;
    target.set(x2, y2, z2);
    // Reflet orange très sombre
    color.setRGB(0.15, 0.06, 0.01);
}
