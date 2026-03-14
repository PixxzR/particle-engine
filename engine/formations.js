/**
 * Formation Library
 * Each formation is a pure function: (i, count, time, params) => {x, y, z}
 * ZERO allocations — return values are written into pre-allocated objects by the caller.
 */

const TAU = Math.PI * 2;
const PHI = (1 + Math.sqrt(5)) / 2; // golden ratio

export const formations = {

  sphere(i, count, time, p = {}) {
    const radius = p.radius || 40;
    // Fibonacci sphere for even distribution
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = i * TAU / PHI;
    const breathe = 1 + Math.sin(time * 0.5) * 0.03;
    return {
      x: Math.cos(theta) * radiusAtY * radius * breathe,
      y: y * radius * breathe,
      z: Math.sin(theta) * radiusAtY * radius * breathe,
    };
  },

  cube(i, count, time, p = {}) {
    const size = p.size || 40;
    const half = size / 2;
    const perFace = Math.floor(count / 6);
    const face = Math.min(Math.floor(i / perFace), 5);
    const fi = i % perFace;
    const side = Math.ceil(Math.sqrt(perFace));
    const row = Math.floor(fi / side);
    const col = fi % side;
    const u = (col / (side - 1)) * size - half;
    const v = (row / (side - 1)) * size - half;
    const wobble = Math.sin(time * 0.8 + i * 0.001) * 0.5;

    switch (face) {
      case 0: return { x: u + wobble, y: v, z: half };
      case 1: return { x: u + wobble, y: v, z: -half };
      case 2: return { x: half, y: u, z: v + wobble };
      case 3: return { x: -half, y: u, z: v + wobble };
      case 4: return { x: u, y: half, z: v + wobble };
      default: return { x: u, y: -half, z: v + wobble };
    }
  },

  helix(i, count, time, p = {}) {
    const radius = p.radius || 25;
    const height = p.height || 80;
    const turns = p.turns || 6;
    const strand = i < count / 2 ? 0 : 1;
    const si = strand === 0 ? i : i - Math.floor(count / 2);
    const strandCount = Math.floor(count / 2);
    const t = si / strandCount;
    const angle = t * turns * TAU + time * 0.5 + strand * Math.PI;
    return {
      x: Math.cos(angle) * radius,
      y: (t - 0.5) * height,
      z: Math.sin(angle) * radius,
    };
  },

  torus(i, count, time, p = {}) {
    const R = p.majorRadius || 35;
    const r = p.minorRadius || 12;
    const ringCount = Math.ceil(Math.sqrt(count));
    const ring = Math.floor(i / ringCount);
    const pos = i % ringCount;
    const u = (ring / ringCount) * TAU + time * 0.3;
    const v = (pos / ringCount) * TAU;
    return {
      x: (R + r * Math.cos(v)) * Math.cos(u),
      y: r * Math.sin(v),
      z: (R + r * Math.cos(v)) * Math.sin(u),
    };
  },

  wave(i, count, time, p = {}) {
    const amplitude = p.amplitude || 15;
    const frequency = p.frequency || 0.15;
    const side = Math.ceil(Math.sqrt(count));
    const row = Math.floor(i / side);
    const col = i % side;
    const x = (col - side / 2) * 1.2;
    const z = (row - side / 2) * 1.2;
    const dist = Math.sqrt(x * x + z * z);
    const y = Math.sin(dist * frequency - time * 2) * amplitude;
    return { x, y, z };
  },

  galaxy(i, count, time, p = {}) {
    const arms = p.arms || 4;
    const spread = p.spread || 0.6;
    const rotation = p.rotation || 1;
    const t = i / count;
    const arm = i % arms;
    const armAngle = (arm / arms) * TAU;
    const dist = Math.pow(t, 0.5) * 50;
    const angle = armAngle + dist * 0.08 * rotation + time * 0.2;
    const scatter = (1 - t * 0.7) * spread;
    // Pseudo-random per particle (deterministic)
    const px = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    const py = Math.sin(i * 269.5 + 183.3) * 43758.5453;
    const rx = (px - Math.floor(px) - 0.5) * scatter * dist * 0.3;
    const ry = (py - Math.floor(py) - 0.5) * scatter * 8;
    return {
      x: Math.cos(angle) * dist + rx,
      y: ry,
      z: Math.sin(angle) * dist + rx * 0.3,
    };
  },

  tornado(i, count, time, p = {}) {
    const height = p.height || 80;
    const radius = p.radius || 30;
    const spin = p.spin || 3;
    const t = i / count;
    const y = (t - 0.5) * height;
    const r = radius * (0.1 + t * 0.9) * (1 + Math.sin(t * 10 + time) * 0.05);
    const angle = t * spin * TAU + time * 2;
    return {
      x: Math.cos(angle) * r,
      y,
      z: Math.sin(angle) * r,
    };
  },

  grid(i, count, time, p = {}) {
    const spacing = p.spacing || 3;
    const side = Math.ceil(Math.cbrt(count));
    const layer = Math.floor(i / (side * side));
    const rem = i % (side * side);
    const row = Math.floor(rem / side);
    const col = rem % side;
    const offset = (side - 1) * spacing / 2;
    const breathe = Math.sin(time * 0.5 + (col + row + layer) * 0.2) * 0.5;
    return {
      x: col * spacing - offset + breathe,
      y: row * spacing - offset + breathe,
      z: layer * spacing - offset,
    };
  },

  explosion(i, count, time, p = {}) {
    const force = p.force || 1;
    // Fibonacci sphere directions
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = i * TAU / PHI;
    const dx = Math.cos(theta) * radiusAtY;
    const dy = y;
    const dz = Math.sin(theta) * radiusAtY;
    const speed = (0.5 + (Math.sin(i * 127.1) * 43758.5453 % 1) * 0.5) * force;
    const t = (time * 20) * speed;
    return {
      x: dx * t,
      y: dy * t,
      z: dz * t,
    };
  },

  heart(i, count, time, p = {}) {
    const scale = p.scale || 2.5;
    const t = (i / count) * TAU;
    const u = Math.floor(i / Math.ceil(Math.sqrt(count))) / Math.ceil(Math.sqrt(count)) * Math.PI;
    // 3D heart parametric
    const sinT = Math.sin(t);
    const cosT = Math.cos(t);
    const sinU = Math.sin(u);
    const cosU = Math.cos(u);
    const breathe = 1 + Math.sin(time * 1.5) * 0.05;
    return {
      x: scale * (16 * sinT * sinT * sinT) * sinU * breathe,
      y: scale * (13 * cosT - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * breathe,
      z: scale * (16 * sinT * sinT * sinT) * cosU * breathe * 0.5,
    };
  },

  random(i, count, time, p = {}) {
    const range = p.range || 60;
    // Deterministic pseudo-random based on particle index
    const px = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    const py = Math.sin(i * 269.5 + 183.3) * 43758.5453;
    const pz = Math.sin(i * 419.2 + 371.9) * 43758.5453;
    return {
      x: ((px - Math.floor(px)) - 0.5) * range,
      y: ((py - Math.floor(py)) - 0.5) * range,
      z: ((pz - Math.floor(pz)) - 0.5) * range,
    };
  },

  // Image formation is handled client-side (needs canvas pixel sampling)
  image(i, count, time, p = {}) {
    // Fallback: grid layout, actual image sampling done in renderer
    return formations.grid(i, count, time, p);
  },
};

export function getFormation(name) {
  return formations[name] || formations.random;
}
