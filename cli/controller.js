#!/usr/bin/env node
/**
 * Particle Engine CLI Controller
 * Send commands to the engine via WebSocket.
 *
 * Usage:
 *   node cli/controller.js formation galaxy --arms 4 --transition 2
 *   node cli/controller.js color fire
 *   node cli/controller.js effect bloom --strength 1.5
 *   node cli/controller.js camera orbit --speed 0.5
 *   node cli/controller.js custom "target.set(Math.cos(i*0.1+time)*50, Math.sin(i*0.1+time)*50, i*0.05); color.setHSL(i/count, 1, 0.5);"
 *   node cli/controller.js state
 *   node cli/controller.js reset
 *   node cli/controller.js sequence scene1.json
 */

import { program } from 'commander';
import WebSocket from 'ws';
import { readFileSync } from 'fs';

const WS_URL = process.env.PARTICLE_WS || 'ws://localhost:3333/controller';

function send(msg) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Connection timeout'));
    }, 5000);

    ws.on('open', () => {
      ws.send(JSON.stringify(msg));
    });

    ws.on('message', (data) => {
      clearTimeout(timeout);
      const response = JSON.parse(data.toString());
      resolve(response);
      ws.close();
    });

    ws.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

function parseParams(options) {
  const params = {};
  for (const [key, val] of Object.entries(options)) {
    if (['transition', 'easing', 'mode'].includes(key)) continue;
    const num = Number(val);
    params[key] = isNaN(num) ? val : num;
  }
  return params;
}

program
  .name('particle-cli')
  .description('Control the Particle Engine')
  .version('1.0.0');

program
  .command('formation <name>')
  .description('Set particle formation (sphere, cube, helix, torus, wave, galaxy, tornado, grid, explosion, heart, random)')
  .option('--transition <seconds>', 'Transition duration', '2')
  .option('--easing <type>', 'Easing function (linear, easeInOut, easeOut, easeIn, elastic, bounce)', 'easeInOut')
  .option('--mode <type>', 'Transition mode (direct, chaos, wave)', 'direct')
  .option('--radius <n>', 'Radius parameter')
  .option('--size <n>', 'Size parameter')
  .option('--height <n>', 'Height parameter')
  .option('--turns <n>', 'Turns parameter')
  .option('--arms <n>', 'Arms parameter (galaxy)')
  .option('--spread <n>', 'Spread parameter')
  .option('--rotation <n>', 'Rotation parameter')
  .option('--spin <n>', 'Spin parameter')
  .option('--spacing <n>', 'Spacing parameter (grid)')
  .option('--force <n>', 'Force parameter (explosion)')
  .option('--scale <n>', 'Scale parameter (heart)')
  .option('--majorRadius <n>', 'Major radius (torus)')
  .option('--minorRadius <n>', 'Minor radius (torus)')
  .option('--amplitude <n>', 'Amplitude (wave)')
  .option('--frequency <n>', 'Frequency (wave)')
  .action(async (name, opts) => {
    const msg = {
      type: 'formation',
      name,
      params: parseParams(opts),
      transition: parseFloat(opts.transition),
      easing: opts.easing,
      transitionMode: opts.mode,
    };
    try {
      const res = await send(msg);
      console.log(`✓ Formation: ${name}`, res.message || '');
    } catch (e) {
      console.error(`✗ Error: ${e.message}`);
    }
  });

program
  .command('color <scheme>')
  .description('Set color scheme (rainbow, fire, ice, ocean, neon, monochrome, sunset, matrix, custom)')
  .option('--hue <n>', 'Hue for monochrome')
  .option('--hueStart <n>', 'Start hue for custom')
  .option('--hueEnd <n>', 'End hue for custom')
  .option('--speed <n>', 'Animation speed')
  .option('--saturation <n>', 'Saturation for custom')
  .option('--lightness <n>', 'Lightness for custom')
  .action(async (scheme, opts) => {
    const msg = { type: 'color', scheme, params: parseParams(opts) };
    try {
      const res = await send(msg);
      console.log(`✓ Color: ${scheme}`, res.message || '');
    } catch (e) {
      console.error(`✗ Error: ${e.message}`);
    }
  });

program
  .command('effect <name>')
  .description('Set effect (bloom, pulse, trails, explosion, implosion)')
  .option('--strength <n>', 'Bloom strength')
  .option('--radius <n>', 'Bloom radius')
  .option('--threshold <n>', 'Bloom threshold')
  .option('--speed <n>', 'Pulse speed')
  .option('--minSize <n>', 'Pulse min size')
  .option('--maxSize <n>', 'Pulse max size')
  .option('--length <n>', 'Trail length')
  .option('--force <n>', 'Explosion/implosion force')
  .option('--disable', 'Disable the effect')
  .action(async (name, opts) => {
    const params = parseParams(opts);
    if (opts.disable) params.enabled = false;
    const msg = { type: 'effect', name, params };
    try {
      const res = await send(msg);
      console.log(`✓ Effect: ${name}`, res.message || '');
    } catch (e) {
      console.error(`✗ Error: ${e.message}`);
    }
  });

program
  .command('camera <action>')
  .description('Camera control (orbit, zoom, position, lookAt, reset)')
  .option('--speed <n>', 'Orbit speed')
  .option('--distance <n>', 'Zoom distance')
  .option('--x <n>', 'X position')
  .option('--y <n>', 'Y position')
  .option('--z <n>', 'Z position')
  .action(async (action, opts) => {
    const msg = { type: 'camera', action, params: parseParams(opts) };
    try {
      const res = await send(msg);
      console.log(`✓ Camera: ${action}`, res.message || '');
    } catch (e) {
      console.error(`✗ Error: ${e.message}`);
    }
  });

program
  .command('config')
  .description('Update engine configuration')
  .option('--particleCount <n>', 'Number of particles')
  .option('--particleSize <n>', 'Particle size')
  .action(async (opts) => {
    const msg = { type: 'config' };
    if (opts.particleCount) msg.particleCount = parseInt(opts.particleCount);
    if (opts.particleSize) msg.particleSize = parseFloat(opts.particleSize);
    try {
      const res = await send(msg);
      console.log('✓ Config updated', res.message || '');
    } catch (e) {
      console.error(`✗ Error: ${e.message}`);
    }
  });

program
  .command('custom <code>')
  .description('Execute custom particle code (inline)')
  .action(async (code) => {
    const msg = { type: 'custom', code };
    try {
      const res = await send(msg);
      console.log('✓ Custom code applied', res.message || '');
    } catch (e) {
      console.error(`✗ Error: ${e.message}`);
    }
  });

program
  .command('custom-file <file>')
  .description('Execute custom particle code from a .js file')
  .action(async (file) => {
    try {
      const code = readFileSync(file, 'utf-8');
      const msg = { type: 'custom', code };
      const res = await send(msg);
      console.log(`✓ Custom code loaded from ${file}`, res.message || '');
    } catch (e) {
      console.error(`✗ Error: ${e.message}`);
    }
  });

program
  .command('points <file>')
  .description('Send pre-computed point positions from a JSON file')
  .option('--transition <seconds>', 'Transition duration', '2')
  .option('--easing <type>', 'Easing function', 'easeInOut')
  .option('--mode <type>', 'Transition mode', 'direct')
  .action(async (file, opts) => {
    try {
      const data = JSON.parse(readFileSync(file, 'utf-8'));
      const positions = data.positions || data;
      const msg = {
        type: 'points',
        positions,
        colors: data.colors || null,
        transition: parseFloat(opts.transition),
        easing: opts.easing,
        transitionMode: opts.mode,
      };
      const res = await send(msg);
      console.log(`✓ Points: ${positions.length} positions loaded`, res.message || '');
    } catch (e) {
      console.error(`✗ Error: ${e.message}`);
    }
  });

program
  .command('sequence <file>')
  .description('Run a sequence of commands from a JSON file')
  .action(async (file) => {
    try {
      const data = JSON.parse(readFileSync(file, 'utf-8'));
      const msg = { type: 'sequence', steps: data.steps || data };
      const res = await send(msg);
      console.log('✓ Sequence queued', res.message || '');
    } catch (e) {
      console.error(`✗ Error: ${e.message}`);
    }
  });

program
  .command('state')
  .description('Get current engine state')
  .action(async () => {
    try {
      const res = await send({ type: 'state' });
      console.log(JSON.stringify(res.state, null, 2));
    } catch (e) {
      console.error(`✗ Error: ${e.message}`);
    }
  });

program
  .command('reset')
  .description('Reset engine to defaults')
  .action(async () => {
    try {
      const res = await send({ type: 'reset' });
      console.log('✓ Engine reset', res.message || '');
    } catch (e) {
      console.error(`✗ Error: ${e.message}`);
    }
  });

program.parse();
