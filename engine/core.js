/**
 * Core Particle System Logic
 * This file defines the engine loop structure for reference.
 * The actual rendering loop runs client-side in the browser.
 * This module provides shared logic used by both server and client.
 */

export const ENGINE_DEFAULTS = {
  particleCount: 20000,
  particleSize: 0.12,
  maxParticles: 50000,
  targetFPS: 60,
};

/**
 * Compile a custom formation code string into a callable function.
 * The function receives: i, count, time, target (vec3), color (color)
 * It should mutate target and color directly.
 *
 * @param {string} code - User-provided JS code
 * @returns {Function|null} compiled function or null on error
 */
export function compileCustomCode(code) {
  // Security: block dangerous patterns
  const forbidden = [
    'document', 'window', 'fetch', 'eval', 'Function',
    'prototype', 'localStorage', 'sessionStorage',
    'setTimeout', 'setInterval', 'importScripts',
    'XMLHttpRequest', 'WebSocket',
  ];
  for (const pattern of forbidden) {
    if (code.includes(pattern)) {
      return { error: `Forbidden pattern: ${pattern}` };
    }
  }

  try {
    // Wrap in a function that receives particle context
    const fn = new Function(
      'i', 'count', 'time', 'target', 'color', 'THREE', 'addControl',
      code
    );
    return { fn };
  } catch (e) {
    return { error: `Compilation error: ${e.message}` };
  }
}

/**
 * Validate particle count
 */
export function validateConfig(config) {
  const errors = [];
  if (config.particleCount !== undefined) {
    if (config.particleCount < 100) errors.push('Minimum 100 particles');
    if (config.particleCount > ENGINE_DEFAULTS.maxParticles) {
      errors.push(`Maximum ${ENGINE_DEFAULTS.maxParticles} particles`);
    }
  }
  if (config.particleSize !== undefined) {
    if (config.particleSize < 0.01 || config.particleSize > 2.0) {
      errors.push('Particle size must be between 0.01 and 2.0');
    }
  }
  return errors.length ? errors : null;
}
