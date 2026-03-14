/**
 * Color Scheme Library
 * Each scheme: (i, count, time, params) => {h, s, l}
 * All values 0-1 range for THREE.Color.setHSL()
 */

export const colorSchemes = {

  rainbow(i, count, time) {
    return {
      h: (i / count + time * 0.05) % 1,
      s: 0.9,
      l: 0.55,
    };
  },

  fire(i, count, time) {
    const t = i / count;
    const flicker = Math.sin(i * 13.7 + time * 3) * 0.05;
    return {
      h: 0.02 + t * 0.08 + flicker, // red to orange
      s: 1.0,
      l: 0.4 + t * 0.2,
    };
  },

  ice(i, count, time) {
    const t = i / count;
    const shimmer = Math.sin(i * 7.3 + time * 2) * 0.03;
    return {
      h: 0.55 + t * 0.08 + shimmer, // cyan to blue
      s: 0.7 + t * 0.3,
      l: 0.5 + t * 0.2,
    };
  },

  ocean(i, count, time) {
    const t = i / count;
    const wave = Math.sin(i * 0.05 + time * 1.5) * 0.04;
    return {
      h: 0.5 + t * 0.12 + wave, // teal to deep blue
      s: 0.8,
      l: 0.35 + t * 0.25,
    };
  },

  neon(i, count, time) {
    const cycle = (i / count * 3 + time * 0.3) % 1;
    // Jump between neon colors
    let h;
    if (cycle < 0.33) h = 0.83; // magenta
    else if (cycle < 0.66) h = 0.33; // green
    else h = 0.55; // cyan
    return {
      h,
      s: 1.0,
      l: 0.55,
    };
  },

  monochrome(i, count, time, p = {}) {
    const hue = p.hue || 0.75; // default purple
    return {
      h: hue,
      s: 0.6 + Math.sin(i * 0.01 + time) * 0.2,
      l: 0.3 + (i / count) * 0.4,
    };
  },

  sunset(i, count, time) {
    const t = i / count;
    const shift = Math.sin(time * 0.3) * 0.02;
    // orange -> pink -> purple
    return {
      h: 0.05 + t * 0.75 * 0.15 + shift,
      s: 0.9,
      l: 0.5 + Math.sin(i * 0.02 + time) * 0.1,
    };
  },

  matrix(i, count, time) {
    const flicker = Math.sin(i * 73.1 + time * 5) > 0.8 ? 0.7 : 0.5;
    return {
      h: 0.33, // green
      s: 1.0,
      l: flicker,
    };
  },

  custom(i, count, time, p = {}) {
    const h1 = p.hueStart || 0;
    const h2 = p.hueEnd || 1;
    const t = i / count;
    return {
      h: h1 + (h2 - h1) * t + (time * (p.speed || 0.05)) % 1,
      s: p.saturation || 0.9,
      l: p.lightness || 0.55,
    };
  },
};

export function getColorScheme(name) {
  return colorSchemes[name] || colorSchemes.rainbow;
}
