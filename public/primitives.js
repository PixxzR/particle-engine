// Primitives library for particle engine
// Reusable 3D building blocks for custom shape code

const Primitives = {
  rand(i, seed = 0) {
    let v = (Math.sin((i + seed) * 127.1 + 311.7) * 43758.5453) % 1;
    return v < 0 ? v + 1 : v;
  },
  rand2(i, seed = 0) {
    let v = (Math.sin((i + seed) * 269.5 + 183.3) * 21345.6789) % 1;
    return v < 0 ? v + 1 : v;
  },
  rand3(i, seed = 0) {
    let v = (Math.sin((i + seed) * 419.2 + 571.9) * 65432.1234) % 1;
    return v < 0 ? v + 1 : v;
  },

  // Segment allocator: returns { seg, t (0-1), li (local index) }
  segment(i, count, sizes) {
    let offset = 0;
    for (let s = 0; s < sizes.length; s++) {
      if (i < offset + sizes[s]) {
        const li = i - offset;
        return { seg: s, t: li / sizes[s], li };
      }
      offset += sizes[s];
    }
    return { seg: sizes.length - 1, t: 1, li: i - offset + sizes[sizes.length - 1] };
  },

  sphere(i, params = {}) {
    const cx = params.center?.[0] || 0, cy = params.center?.[1] || 0, cz = params.center?.[2] || 0;
    const R = params.radius || 5, filled = params.filled || false;
    const rnd = this.rand(i), rnd2 = this.rand2(i);
    const phi = Math.acos(1 - 2 * rnd), theta = rnd2 * Math.PI * 2;
    const r = filled ? Math.cbrt(this.rand3(i)) * R : R;
    return { x: cx + r * Math.sin(phi) * Math.cos(theta), y: cy + r * Math.cos(phi), z: cz + r * Math.sin(phi) * Math.sin(theta) };
  },

  cylinder(i, params = {}) {
    const cx = params.center?.[0] || 0, cy = params.center?.[1] || 0, cz = params.center?.[2] || 0;
    const R = params.radius || 3, H = params.height || 10;
    const filled = params.filled || false, capped = params.capped || false;
    const rnd = this.rand(i), rnd2 = this.rand2(i), rnd3 = this.rand3(i);
    const angle = rnd2 * Math.PI * 2;
    if (capped && rnd3 < 0.2) {
      const r = Math.sqrt(rnd) * R;
      return { x: cx + Math.cos(angle) * r, y: cy + (rnd3 < 0.1 ? H / 2 : -H / 2), z: cz + Math.sin(angle) * r };
    }
    const r = filled ? Math.sqrt(rnd3) * R : R;
    return { x: cx + Math.cos(angle) * r, y: cy + (rnd - 0.5) * H, z: cz + Math.sin(angle) * r };
  },

  box(i, params = {}) {
    const cx = params.center?.[0] || 0, cy = params.center?.[1] || 0, cz = params.center?.[2] || 0;
    const w = params.w || 5, h = params.h || 5, d = params.d || 5, filled = params.filled || false;
    const rnd = this.rand(i), rnd2 = this.rand2(i), rnd3 = this.rand3(i);
    if (filled) return { x: cx + (rnd - 0.5) * w, y: cy + (rnd2 - 0.5) * h, z: cz + (rnd3 - 0.5) * d };
    const areas = [w*h, w*h, w*d, w*d, h*d, h*d];
    const total = areas.reduce((a, b) => a + b, 0);
    let pick = rnd * total, face = 0;
    for (let f = 0; f < 6; f++) { pick -= areas[f]; if (pick <= 0) { face = f; break; } }
    const u = rnd2 - 0.5, v = rnd3 - 0.5;
    if (face === 0) return { x: cx + u * w, y: cy + h / 2, z: cz + v * d };
    if (face === 1) return { x: cx + u * w, y: cy - h / 2, z: cz + v * d };
    if (face === 2) return { x: cx + u * w, y: cy + v * h, z: cz + d / 2 };
    if (face === 3) return { x: cx + u * w, y: cy + v * h, z: cz - d / 2 };
    if (face === 4) return { x: cx - w / 2, y: cy + u * h, z: cz + v * d };
    return { x: cx + w / 2, y: cy + u * h, z: cz + v * d };
  },

  plane(i, params = {}) {
    const cx = params.center?.[0] || 0, cy = params.center?.[1] || 0, cz = params.center?.[2] || 0;
    const w = params.width || 10, h = params.height || 10;
    return { x: cx + (this.rand(i) - 0.5) * w, y: cy, z: cz + (this.rand2(i) - 0.5) * h };
  },

  torus(i, params = {}) {
    const cx = params.center?.[0] || 0, cy = params.center?.[1] || 0, cz = params.center?.[2] || 0;
    const R = params.majorRadius || 6, r = params.minorRadius || 2;
    const theta = this.rand(i) * Math.PI * 2, phi = this.rand2(i) * Math.PI * 2;
    return { x: cx + (R + r * Math.cos(phi)) * Math.cos(theta), y: cy + r * Math.sin(phi), z: cz + (R + r * Math.cos(phi)) * Math.sin(theta) };
  },

  cone(i, params = {}) {
    const cx = params.center?.[0] || 0, cy = params.center?.[1] || 0, cz = params.center?.[2] || 0;
    const R = params.radius || 4, H = params.height || 8, filled = params.filled || false;
    const t = this.rand(i), angle = this.rand2(i) * Math.PI * 2;
    const rAtH = R * (1 - t), r = filled ? Math.sqrt(this.rand3(i)) * rAtH : rAtH;
    return { x: cx + Math.cos(angle) * r, y: cy + t * H, z: cz + Math.sin(angle) * r };
  },

  disc(i, params = {}) {
    const cx = params.center?.[0] || 0, cy = params.center?.[1] || 0, cz = params.center?.[2] || 0;
    const R = params.radius || 5;
    const r = Math.sqrt(this.rand(i)) * R, angle = this.rand2(i) * Math.PI * 2;
    return { x: cx + Math.cos(angle) * r, y: cy, z: cz + Math.sin(angle) * r };
  },

  line(i, params = {}) {
    const from = params.from || [0, 0, 0], to = params.to || [10, 0, 0], thick = params.thickness || 0;
    const t = this.rand(i);
    const x = from[0] + (to[0] - from[0]) * t, y = from[1] + (to[1] - from[1]) * t, z = from[2] + (to[2] - from[2]) * t;
    if (thick > 0) return { x: x + (this.rand2(i) - 0.5) * thick, y: y + (this.rand3(i) - 0.5) * thick, z };
    return { x, y, z };
  },

  ring(i, params = {}) {
    const cx = params.center?.[0] || 0, cy = params.center?.[1] || 0, cz = params.center?.[2] || 0;
    const R = params.radius || 5, thick = params.thickness || 0.3;
    const angle = this.rand(i) * Math.PI * 2, r = R + (this.rand2(i) - 0.5) * thick;
    return { x: cx + Math.cos(angle) * r, y: cy, z: cz + Math.sin(angle) * r };
  }
};

export default Primitives;
