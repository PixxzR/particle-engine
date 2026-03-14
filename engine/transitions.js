/**
 * Transition System
 * Smoothly morphs between formations with configurable easing and per-particle delay.
 */

// Easing functions
export const easings = {
  linear: t => t,
  easeInOut: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOut: t => 1 - Math.pow(1 - t, 3),
  easeIn: t => t * t * t,
  elastic: t => {
    if (t === 0 || t === 1) return t;
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * Math.PI / 3));
  },
  bounce: t => {
    t = 1 - t;
    if (t < 1 / 2.75) return 1 - 7.5625 * t * t;
    if (t < 2 / 2.75) return 1 - (7.5625 * (t -= 1.5 / 2.75) * t + 0.75);
    if (t < 2.5 / 2.75) return 1 - (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375);
    return 1 - (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
  },
};

export class TransitionManager {
  constructor() {
    this.active = false;
    this.startTime = 0;
    this.duration = 2.0; // seconds
    this.easing = 'easeInOut';
    this.mode = 'direct'; // 'direct' | 'chaos' | 'wave'
    this.waveSpeed = 3.0;

    // Pre-allocated storage for source positions (per particle)
    this.sourcePositions = null;
    this.particleCount = 0;
  }

  /**
   * Start a transition. Call before switching formation.
   * @param {Float32Array} currentPositions - current position buffer (x,y,z interleaved)
   * @param {number} count - particle count
   * @param {number} duration - transition time in seconds
   * @param {string} easing - easing function name
   * @param {string} mode - 'direct', 'chaos', or 'wave'
   */
  start(currentPositions, count, duration = 2.0, easing = 'easeInOut', mode = 'direct') {
    // Allocate or resize source buffer
    if (!this.sourcePositions || this.particleCount !== count) {
      this.sourcePositions = new Float32Array(count * 3);
      this.particleCount = count;
    }
    // Copy current positions as source
    this.sourcePositions.set(currentPositions);
    this.duration = duration;
    this.easing = easing;
    this.mode = mode;
    this.startTime = -1; // will be set on first frame
    this.active = true;
  }

  /**
   * Get interpolation progress for a particle.
   * @param {number} time - current engine time
   * @param {number} i - particle index
   * @param {number} count - total particles
   * @returns {number} 0-1 progress (0 = source, 1 = target)
   */
  getProgress(time, i, count) {
    if (!this.active) return 1;

    if (this.startTime < 0) this.startTime = time;
    let elapsed = time - this.startTime;
    let rawT = Math.min(elapsed / this.duration, 1);

    // Per-particle delay for wave mode
    if (this.mode === 'wave') {
      const delay = (i / count) * (this.duration * 0.4);
      rawT = Math.min(Math.max((elapsed - delay) / (this.duration * 0.6), 0), 1);
    }

    // Apply easing
    const easeFn = easings[this.easing] || easings.easeInOut;
    const t = easeFn(rawT);

    // Check if complete
    if (rawT >= 1 && i === count - 1) {
      this.active = false;
    }

    return t;
  }

  /**
   * Interpolate a particle position.
   * @param {number} i - particle index
   * @param {object} targetPos - {x, y, z} from new formation
   * @param {number} t - progress 0-1
   * @returns {object} {x, y, z}
   */
  interpolate(i, targetPos, t) {
    const si = i * 3;
    const sx = this.sourcePositions[si];
    const sy = this.sourcePositions[si + 1];
    const sz = this.sourcePositions[si + 2];

    if (this.mode === 'chaos' && t > 0 && t < 1) {
      // Go through random midpoint
      const chaosT = t < 0.5 ? t * 2 : (t - 0.5) * 2;
      const chaosScale = 60;
      // Deterministic chaos offset per particle
      const cx = Math.sin(i * 127.1 + 311.7) * chaosScale;
      const cy = Math.sin(i * 269.5 + 183.3) * chaosScale;
      const cz = Math.sin(i * 419.2 + 371.9) * chaosScale;

      if (t < 0.5) {
        return {
          x: sx + (cx - sx) * chaosT,
          y: sy + (cy - sy) * chaosT,
          z: sz + (cz - sz) * chaosT,
        };
      } else {
        return {
          x: cx + (targetPos.x - cx) * chaosT,
          y: cy + (targetPos.y - cy) * chaosT,
          z: cz + (targetPos.z - cz) * chaosT,
        };
      }
    }

    return {
      x: sx + (targetPos.x - sx) * t,
      y: sy + (targetPos.y - sy) * t,
      z: sz + (targetPos.z - sz) * t,
    };
  }

  isActive() {
    return this.active;
  }
}
