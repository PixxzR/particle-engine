import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { validate } from './api/protocol.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, readdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3333;

const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));
app.use('/engine', express.static(join(__dirname, 'engine')));

// Shape indexing
function scanShapes() {
  try {
    return readdirSync(join(__dirname, 'shapes'))
      .filter(f => f.endsWith('.js'))
      .map(f => ({ name: f.replace('.js', ''), file: f }));
  } catch { return []; }
}

// REST API
app.get('/api/shapes', (req, res) => res.json(scanShapes()));

app.get('/api/shapes/:name', (req, res) => {
  try {
    const code = readFileSync(join(__dirname, 'shapes', req.params.name + '.js'), 'utf-8');
    res.type('text/plain').send(code);
  } catch { res.status(404).json({ error: 'Shape not found' }); }
});

app.post('/api/prompt', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });

    const systemPrompt = `You are a 3D particle engine programmer. You write JavaScript code that positions 20,000 particles to form 3D shapes.

The code runs per-particle per-frame with this signature:
(i, count, time, target, color, THREE, Primitives) => { ... }

Variables:
- i: particle index (0 to count-1)
- count: total particles (20000)
- time: elapsed seconds (use for animation)
- target: THREE.Vector3 — call target.set(x, y, z)
- color: THREE.Color — call color.setRGB(r,g,b) or color.setHSL(h,s,l)
- THREE: Three.js library
- Primitives: helper with rand(i,seed), rand2(i,seed), rand3(i,seed), segment(i,count,sizes), sphere(i,params), cylinder(i,params), box(i,params), plane(i,params), torus(i,params), cone(i,params), disc(i,params), line(i,params), ring(i,params)

Patterns:
- Segment particles: var seg = Math.floor(i / (count / numParts));
- Pseudo-random: var rnd = (Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1; if (rnd < 0) rnd += 1;
- Animate with time: Math.sin(time * speed)
- Keep bloom-friendly: avoid RGB values > 0.5 for small details (causes star artifacts)

Return ONLY raw JavaScript code. No markdown, no backticks, no explanation.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    const code = message.content[0].text;
    const msg = { type: 'custom', code };
    broadcast(msg, 'renderer');
    updateState(msg);
    res.json({ code, applied: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const server = createServer(app);
const wss = new WebSocketServer({ server });

// Track connected renderers and controllers
const renderers = new Set();
const controllers = new Set();

// Engine state
let engineState = {
  formation: { name: 'galaxy', params: { arms: 4, spread: 0.7 } },
  color: { scheme: 'rainbow', params: {} },
  effects: { bloom: { enabled: true, strength: 1.8, radius: 1.0, threshold: 0.05 } },
  camera: { distance: 80, orbitSpeed: 0.3 },
  config: { particleCount: 20000, particleSize: 0.18 },
  running: true,
};

// Command queue for sequences
let commandQueue = [];
let queueRunning = false;

async function processQueue() {
  if (queueRunning || commandQueue.length === 0) return;
  queueRunning = true;
  while (commandQueue.length > 0) {
    const { msg, delay } = commandQueue.shift();
    broadcast(msg, 'renderer');
    updateState(msg);
    if (delay > 0) await new Promise(r => setTimeout(r, delay));
  }
  queueRunning = false;
}

function updateState(msg) {
  switch (msg.type) {
    case 'formation':
      engineState.formation = { name: msg.name, params: msg.params || {} };
      delete engineState.customCode;
      break;
    case 'custom':
      engineState.customCode = msg.code;
      engineState.formation = { name: 'custom', params: {} };
      break;
    case 'color':
      engineState.color = { scheme: msg.scheme, params: msg.params || {} };
      break;
    case 'effect':
      if (!engineState.effects[msg.name]) engineState.effects[msg.name] = {};
      engineState.effects[msg.name] = { enabled: true, ...msg.params };
      break;
    case 'camera':
      Object.assign(engineState.camera, { action: msg.action, ...msg.params });
      break;
    case 'config':
      Object.assign(engineState.config, msg);
      delete engineState.config.type;
      break;
    case 'points':
      engineState.formation = { name: 'points', params: {} };
      break;
    case 'reset':
      engineState.formation = { name: 'galaxy', params: { arms: 4, spread: 0.7 } };
      engineState.color = { scheme: 'rainbow', params: {} };
      engineState.effects = { bloom: { enabled: true, strength: 1.8, radius: 1.0, threshold: 0.05 } };
      engineState.config = { particleCount: 20000, particleSize: 0.18 };
      engineState.camera = { distance: 80, orbitSpeed: 0.3 };
      delete engineState.customCode;
      break;
  }
}

function broadcast(msg, target = 'renderer') {
  const data = JSON.stringify(msg);
  const targets = target === 'renderer' ? renderers : controllers;
  for (const ws of targets) {
    if (ws.readyState === 1) ws.send(data);
  }
}

wss.on('connection', (ws, req) => {
  const isRenderer = req.url === '/renderer';
  const pool = isRenderer ? renderers : controllers;
  pool.add(ws);

  console.log(`[WS] ${isRenderer ? 'Renderer' : 'Controller'} connected (${pool.size} total)`);

  // Send current state to new renderer
  if (isRenderer) {
    ws.send(JSON.stringify({ type: 'init', state: engineState }));
  }

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      ws.send(JSON.stringify({ type: 'error', error: 'Invalid JSON' }));
      return;
    }

    // State request — respond directly
    if (msg.type === 'state') {
      ws.send(JSON.stringify({ type: 'state', state: engineState }));
      return;
    }

    // Validate
    const result = validate(msg);
    if (!result.valid) {
      ws.send(JSON.stringify({ type: 'error', error: result.error }));
      return;
    }

    // Handle sequences
    if (msg.type === 'sequence') {
      for (const step of msg.steps) {
        commandQueue.push({ msg: step.command, delay: (step.delay || 0) * 1000 });
      }
      processQueue();
      ws.send(JSON.stringify({ type: 'ack', message: `Queued ${msg.steps.length} steps` }));
      return;
    }

    // Forward to renderers and update state
    broadcast(msg, 'renderer');
    updateState(msg);

    // Acknowledge
    ws.send(JSON.stringify({ type: 'ack', message: `Applied: ${msg.type}` }));
    console.log(`[CMD] ${msg.type}${msg.name ? ': ' + msg.name : ''}${msg.scheme ? ': ' + msg.scheme : ''}`);
  });

  ws.on('close', () => {
    pool.delete(ws);
    console.log(`[WS] ${isRenderer ? 'Renderer' : 'Controller'} disconnected`);
  });
});

server.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║   PARTICLE ENGINE v1.0               ║`);
  console.log(`  ║   Renderer:   http://localhost:${PORT}   ║`);
  console.log(`  ║   WebSocket:  ws://localhost:${PORT}     ║`);
  console.log(`  ╚══════════════════════════════════════╝\n`);
});
