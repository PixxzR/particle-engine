// Pot de sauce pour frites
// Segments: 0=corps (cône tronqué), 1=fond, 2=sauce, 3=rebord haut, 4=intérieur paroi

var segments = 5;
var perSeg = Math.floor(count / segments);
var seg = Math.floor(i / perSeg);
var li = i % perSeg;

// Dimensions du pot
var botR = 6;    // rayon bas
var topR = 9;    // rayon haut
var height = 14; // hauteur
var rimH = 1.2;  // hauteur du rebord
var yOff = -height / 2; // centrer verticalement

// Helper: pseudo-random
var rnd = (Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1;
if (rnd < 0) rnd += 1;
var rnd2 = (Math.sin(i * 269.5 + 183.3) * 21345.6789) % 1;
if (rnd2 < 0) rnd2 += 1;

if (seg === 0) {
    // Corps du pot - surface du cône tronqué
    var rows = 80;
    var cols = Math.floor(perSeg / rows);
    var row = Math.floor(li / cols);
    var col = li % cols;
    var t = row / rows; // 0=bas, 1=haut
    var angle = (col / cols) * Math.PI * 2;
    var r = botR + (topR - botR) * t;
    var y = yOff + t * height;
    target.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
    // Couleur pot: blanc/crème
    color.setRGB(0.95, 0.92, 0.88);

} else if (seg === 1) {
    // Fond du pot - disque plein
    var sqrtN = Math.floor(Math.sqrt(perSeg));
    var r = Math.sqrt(rnd) * botR;
    var angle = rnd2 * Math.PI * 2;
    target.set(Math.cos(angle) * r, yOff, Math.sin(angle) * r);
    // Fond blanc
    color.setRGB(0.9, 0.87, 0.83);

} else if (seg === 2) {
    // Sauce à l'intérieur - surface ondulée en haut
    var r = Math.sqrt(rnd) * (topR - 0.8);
    var angle = rnd2 * Math.PI * 2;
    var x = Math.cos(angle) * r;
    var z = Math.sin(angle) * r;
    // Surface de sauce légèrement ondulée
    var sauceY = yOff + height - 2.5 + Math.sin(x * 0.5 + time * 0.3) * 0.3 + Math.cos(z * 0.5 + time * 0.2) * 0.3;
    // Quelques particules en profondeur pour donner du volume
    var depth = rnd * 0.8;
    sauceY -= depth * 1.5;
    target.set(x, sauceY, z);
    // Couleur sauce: rouge ketchup / mayo / andalouse
    // On fait une sauce andalouse (orange-rouge)
    var h = 0.05 + depth * 0.02;
    var s = 0.85 - depth * 0.1;
    var l = 0.45 + depth * 0.05 + Math.sin(x + z) * 0.03;
    color.setHSL(h, s, l);

} else if (seg === 3) {
    // Rebord du haut - anneau épais
    var cols = perSeg;
    var angle = (li / cols) * Math.PI * 2;
    var rndR = rnd * 1.5;
    var r = topR - 0.3 + rndR * 0.6;
    var y = yOff + height + rnd2 * rimH;
    target.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
    // Rebord blanc
    color.setRGB(0.98, 0.95, 0.9);

} else {
    // Intérieur paroi visible au-dessus de la sauce
    var rows = 20;
    var cols = Math.floor(perSeg / rows);
    var row = Math.floor(li / cols);
    var col = li % cols;
    var t = 0.75 + (row / rows) * 0.25; // partie haute seulement
    var angle = (col / cols) * Math.PI * 2;
    var r = botR + (topR - botR) * t - 0.3; // légèrement à l'intérieur
    var y = yOff + t * height;
    target.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
    // Intérieur teinté par la sauce
    var blend = 1.0 - (t - 0.75) * 4; // plus teinté en bas
    color.setRGB(0.95 - blend * 0.3, 0.92 - blend * 0.4, 0.88 - blend * 0.5);
}
