import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { validate } from './api/protocol.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3333;

const app = express();
app.use(express.static(join(__dirname, 'public')));
app.use('/engine', express.static(join(__dirname, 'engine')));

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
