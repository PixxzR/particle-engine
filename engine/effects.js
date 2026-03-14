/**
 * Effects Configuration
 * Defines post-processing and particle effects with their default parameters.
 * Actual rendering is done client-side — this provides the config layer.
 */

export const effectDefaults = {
  bloom: {
    enabled: true,
    strength: 1.2,
    radius: 0.8,
    threshold: 0.1,
  },
  pulse: {
    enabled: false,
    speed: 2.0,
    minSize: 0.08,
    maxSize: 0.25,
  },
  trails: {
    enabled: false,
    length: 0.3,   // 0-1, opacity decay
    fade: 0.95,
  },
  explosion: {
    enabled: false,
    force: 1.0,
    duration: 3.0,
  },
  implosion: {
    enabled: false,
    force: 1.0,
    duration: 2.0,
  },
};

export function getEffectConfig(name, params = {}) {
  const defaults = effectDefaults[name];
  if (!defaults) return null;
  return { ...defaults, ...params, enabled: true };
}

export function mergeEffects(current, name, params) {
  const config = getEffectConfig(name, params);
  if (!config) return current;
  return { ...current, [name]: config };
}
