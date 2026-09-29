// Control Panel — hidden glassmorphism UI
// Toggle with backtick (`) key

export function createPanel(getWs) {
  const style = document.createElement('style');
  style.textContent = `
    #ctrl-panel {
      position: fixed; right: 0; top: 0; height: 100vh; width: 380px;
      background: rgba(10,10,20,0.88); backdrop-filter: blur(24px);
      border-left: 1px solid rgba(255,255,255,0.08);
      transform: translateX(100%); transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
      z-index: 1000; overflow-y: auto; font-family: system-ui,-apple-system,sans-serif;
      scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
    }
    #ctrl-panel.open { transform: translateX(0); }
    #ctrl-panel::-webkit-scrollbar { width: 4px; }
    #ctrl-panel::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
    .cp-section { border-bottom: 1px solid rgba(255,255,255,0.05); padding: 12px 16px; }
    .cp-header { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.4);
      cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none; }
    .cp-header:hover { color: rgba(255,255,255,0.6); }
    .cp-body { margin-top: 10px; }
    .cp-body.collapsed { display: none; }
    .cp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .cp-btn {
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.8); padding: 6px 8px; border-radius: 6px; font-size: 11px;
      cursor: pointer; transition: all 0.15s; text-align: center;
    }
    .cp-btn:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.2); }
    .cp-btn.active { border-color: #6366f1; background: rgba(99,102,241,0.15); }
    .cp-slider-row { display: flex; align-items: center; gap: 8px; margin: 6px 0; }
    .cp-slider-row label { font-size: 12px; color: rgba(255,255,255,0.7); min-width: 70px; }
    .cp-slider-row input[type=range] { flex: 1; accent-color: #6366f1; height: 4px; }
    .cp-slider-row .cp-val { font-size: 11px; color: rgba(255,255,255,0.5); font-family: monospace; min-width: 40px; text-align: right; }
    .cp-prompt-area { display: flex; flex-direction: column; gap: 8px; }
    .cp-prompt-area textarea {
      width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
      color: #fff; padding: 10px; border-radius: 8px; font-size: 13px; resize: vertical;
      font-family: system-ui; outline: none; min-height: 60px;
    }
    .cp-prompt-area textarea:focus { border-color: rgba(99,102,241,0.5); }
    .cp-prompt-btn {
      background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; color: #fff;
      padding: 8px 16px; border-radius: 8px; font-size: 12px; cursor: pointer; font-weight: 600;
    }
    .cp-prompt-btn:hover { opacity: 0.9; }
    .cp-prompt-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .cp-status { font-size: 11px; color: rgba(255,255,255,0.4); min-height: 16px; }
    .cp-code textarea {
      width: 100%; min-height: 150px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08);
      color: #a5f3fc; padding: 10px; border-radius: 6px; font-family: 'Fira Code',monospace; font-size: 11px;
      resize: vertical; outline: none; tab-size: 2;
    }
    .cp-code textarea:focus { border-color: rgba(99,102,241,0.4); }
    .cp-hint {
      position: fixed; right: 0; top: 50%; transform: translateY(-50%);
      background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.25);
      padding: 8px 4px; border-radius: 4px 0 0 4px; font-size: 10px; writing-mode: vertical-rl;
      z-index: 999; transition: opacity 0.5s; cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  function send(msg) {
    const ws = getWs();
    if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg));
  }

  let debounceTimers = {};
  function sendDebounced(key, msg, delay = 100) {
    clearTimeout(debounceTimers[key]);
    debounceTimers[key] = setTimeout(() => send(msg), delay);
  }

  // Transition settings (local)
  let transitionDuration = 2, transitionEasing = 'easeInOut', transitionMode = 'direct';

  // Build panel
  const panel = document.createElement('div');
  panel.id = 'ctrl-panel';
  panel.innerHTML = buildHTML();
  document.body.appendChild(panel);

  // Stop events from reaching OrbitControls
  panel.addEventListener('pointerdown', e => e.stopPropagation());
  panel.addEventListener('wheel', e => e.stopPropagation());

  // Toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'cp-toggle-btn';
  toggleBtn.innerHTML = '&#9881;';
  toggleBtn.style.cssText = `
    position: fixed; right: 16px; top: 16px; z-index: 1001;
    width: 38px; height: 38px; border-radius: 50%;
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.6); font-size: 18px; cursor: pointer;
    backdrop-filter: blur(12px); transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
  `;
  toggleBtn.onmouseenter = () => { toggleBtn.style.background = 'rgba(255,255,255,0.15)'; toggleBtn.style.color = '#fff'; };
  toggleBtn.onmouseleave = () => { toggleBtn.style.background = 'rgba(255,255,255,0.08)'; toggleBtn.style.color = 'rgba(255,255,255,0.6)'; };
  document.body.appendChild(toggleBtn);

  // Toggle
  let isOpen = false;
  function togglePanel() {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    toggleBtn.style.right = isOpen ? '396px' : '16px';
    if (isOpen) loadShapes();
  }

  toggleBtn.addEventListener('click', togglePanel);

  // Wire up controls
  wirePrompt();
  wireFormations();
  wireColors();
  wireSliders();
  wireTransitions();
  wireCodeEditor();
  wireResetBtn();

  function buildHTML() {
    return `
      <div class="cp-section">
        <div class="cp-header">AI Prompt <span>▾</span></div>
        <div class="cp-body cp-prompt-area">
          <textarea id="cp-prompt" placeholder="Describe a 3D shape... (e.g. 'a butterfly with animated wings')"></textarea>
          <button class="cp-prompt-btn" id="cp-gen">Generate</button>
          <div class="cp-status" id="cp-status"></div>
        </div>
      </div>
      <div class="cp-section">
        <div class="cp-header">Formations <span>▾</span></div>
        <div class="cp-body"><div class="cp-grid" id="cp-formations"></div></div>
      </div>
      <div class="cp-section">
        <div class="cp-header">Custom Shapes <span>▾</span></div>
        <div class="cp-body"><div class="cp-grid" id="cp-shapes"></div></div>
      </div>
      <div class="cp-section">
        <div class="cp-header">Colors <span>▾</span></div>
        <div class="cp-body"><div class="cp-grid" id="cp-colors"></div></div>
      </div>
      <div class="cp-section">
        <div class="cp-header">Bloom <span>▾</span></div>
        <div class="cp-body" id="cp-bloom"></div>
      </div>
      <div class="cp-section">
        <div class="cp-header">Particles <span>▾</span></div>
        <div class="cp-body" id="cp-particles"></div>
      </div>
      <div class="cp-section">
        <div class="cp-header">Camera <span>▾</span></div>
        <div class="cp-body" id="cp-camera"></div>
      </div>
      <div class="cp-section">
        <div class="cp-header">Transition <span>▾</span></div>
        <div class="cp-body" id="cp-transition"></div>
      </div>
      <div class="cp-section">
        <div class="cp-header">Code Editor <span>▸</span></div>
        <div class="cp-body collapsed cp-code" id="cp-code-section">
          <textarea id="cp-code" spellcheck="false">// (i, count, time, target, color, THREE, Primitives)
// target.set(x, y, z);  color.setHSL(h, s, l);
var rnd = Primitives.rand(i);
var p = Primitives.sphere(i, {radius: 20});
target.set(p.x, p.y, p.z);
color.setHSL(rnd, 0.8, 0.5);</textarea>
          <button class="cp-btn" id="cp-run-code" style="margin-top:8px;background:rgba(99,102,241,0.2);border-color:#6366f1;">Run Code</button>
        </div>
      </div>
      <div class="cp-section" style="text-align:center;">
        <button class="cp-btn" id="cp-reset" style="width:100%;padding:10px;color:#ef4444;border-color:rgba(239,68,68,0.3);">Reset Engine</button>
      </div>
    `;
  }

  // Collapsible sections
  panel.querySelectorAll('.cp-header').forEach(h => {
    h.addEventListener('click', () => {
      const body = h.nextElementSibling;
      const span = h.querySelector('span');
      body.classList.toggle('collapsed');
      span.textContent = body.classList.contains('collapsed') ? '▸' : '▾';
    });
  });

  function wirePrompt() {
    const btn = panel.querySelector('#cp-gen');
    const input = panel.querySelector('#cp-prompt');
    const status = panel.querySelector('#cp-status');

    async function generate() {
      const prompt = input.value.trim();
      if (!prompt) return;
      btn.disabled = true;
      status.textContent = 'Generating...';
      status.style.color = '#a78bfa';
      try {
        const res = await fetch('/api/prompt', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const data = await res.json();
        if (data.error) {
          status.textContent = data.error;
          status.style.color = '#ef4444';
        } else {
          status.textContent = 'Applied!';
          status.style.color = '#22c55e';
        }
      } catch (err) {
        status.textContent = err.message;
        status.style.color = '#ef4444';
      }
      btn.disabled = false;
    }

    btn.addEventListener('click', generate);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); generate(); }
    });
  }

  function wireFormations() {
    const grid = panel.querySelector('#cp-formations');
    const names = ['sphere','cube','helix','torus','wave','galaxy','tornado','grid','explosion','heart','random'];
    names.forEach(name => {
      const btn = document.createElement('button');
      btn.className = 'cp-btn';
      btn.textContent = name;
      btn.addEventListener('click', () => {
        send({ type: 'formation', name, params: {}, transition: transitionDuration, easing: transitionEasing, transitionMode });
        grid.querySelectorAll('.cp-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      grid.appendChild(btn);
    });
  }

  async function loadShapes() {
    const grid = panel.querySelector('#cp-shapes');
    try {
      const res = await fetch('/api/shapes');
      const shapes = await res.json();
      grid.innerHTML = '';
      shapes.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'cp-btn';
        btn.textContent = s.name;
        btn.addEventListener('click', async () => {
          const codeRes = await fetch(`/api/shapes/${s.name}`);
          const code = await codeRes.text();
          send({ type: 'custom', code });
          grid.querySelectorAll('.cp-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
        grid.appendChild(btn);
      });
    } catch { grid.innerHTML = '<span style="color:rgba(255,255,255,0.3);font-size:11px;">No shapes found</span>'; }
  }

  function wireColors() {
    const grid = panel.querySelector('#cp-colors');
    const schemes = [
      { name: 'rainbow', dot: 'linear-gradient(90deg,red,yellow,green,cyan,blue,magenta)' },
      { name: 'fire', dot: 'linear-gradient(90deg,#ff4500,#ff8c00,#ffd700)' },
      { name: 'ice', dot: 'linear-gradient(90deg,#00bfff,#87ceeb,#e0ffff)' },
      { name: 'ocean', dot: 'linear-gradient(90deg,#006994,#40e0d0)' },
      { name: 'neon', dot: 'linear-gradient(90deg,#ff00ff,#00ff00,#00bfff)' },
      { name: 'monochrome', dot: '#8888ff' },
      { name: 'sunset', dot: 'linear-gradient(90deg,#ff4500,#ff6347,#ffa07a)' },
      { name: 'matrix', dot: '#00ff00' },
    ];
    schemes.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'cp-btn';
      btn.innerHTML = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${s.dot};margin-right:4px;vertical-align:middle;"></span>${s.name}`;
      btn.addEventListener('click', () => {
        send({ type: 'color', scheme: s.name });
        grid.querySelectorAll('.cp-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      grid.appendChild(btn);
    });
  }

  function makeSlider(container, label, min, max, step, value, onChange) {
    const row = document.createElement('div');
    row.className = 'cp-slider-row';
    const valSpan = document.createElement('span');
    valSpan.className = 'cp-val';
    valSpan.textContent = value;
    const input = document.createElement('input');
    input.type = 'range'; input.min = min; input.max = max; input.step = step; input.value = value;
    input.addEventListener('input', () => {
      valSpan.textContent = parseFloat(input.value).toFixed(step < 1 ? 2 : 0);
      onChange(parseFloat(input.value));
    });
    const lbl = document.createElement('label');
    lbl.textContent = label;
    row.append(lbl, input, valSpan);
    container.appendChild(row);
    return input;
  }

  function wireSliders() {
    const bloom = panel.querySelector('#cp-bloom');
    let bs = 1.8, br = 1.0, bt = 0.05;
    makeSlider(bloom, 'Strength', 0, 3, 0.05, bs, v => { bs = v; sendDebounced('bloom', { type: 'effect', name: 'bloom', params: { strength: bs, radius: br, threshold: bt } }); });
    makeSlider(bloom, 'Radius', 0, 2, 0.05, br, v => { br = v; sendDebounced('bloom', { type: 'effect', name: 'bloom', params: { strength: bs, radius: br, threshold: bt } }); });
    makeSlider(bloom, 'Threshold', 0, 1, 0.01, bt, v => { bt = v; sendDebounced('bloom', { type: 'effect', name: 'bloom', params: { strength: bs, radius: br, threshold: bt } }); });

    const particles = panel.querySelector('#cp-particles');
    makeSlider(particles, 'Count', 1000, 50000, 1000, 20000, v => sendDebounced('pcount', { type: 'config', particleCount: v }));
    makeSlider(particles, 'Size', 0.01, 1, 0.01, 0.18, v => sendDebounced('psize', { type: 'config', particleSize: v }));

    const cam = panel.querySelector('#cp-camera');
    makeSlider(cam, 'Orbit', 0, 5, 0.1, 0.6, v => sendDebounced('orbit', { type: 'camera', action: 'orbit', params: { speed: v } }));
    makeSlider(cam, 'Zoom', 10, 200, 5, 80, v => sendDebounced('zoom', { type: 'camera', action: 'zoom', params: { distance: v } }));
    const resetCam = document.createElement('button');
    resetCam.className = 'cp-btn'; resetCam.textContent = 'Reset Camera'; resetCam.style.marginTop = '6px';
    resetCam.addEventListener('click', () => send({ type: 'camera', action: 'reset' }));
    cam.appendChild(resetCam);
  }

  function wireTransitions() {
    const container = panel.querySelector('#cp-transition');
    makeSlider(container, 'Duration', 0.5, 10, 0.5, 2, v => transitionDuration = v);

    const easingRow = document.createElement('div');
    easingRow.className = 'cp-slider-row';
    easingRow.innerHTML = '<label>Easing</label>';
    const easingSel = document.createElement('select');
    easingSel.style.cssText = 'flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#fff;padding:4px;border-radius:4px;font-size:11px;';
    ['linear','easeInOut','easeOut','easeIn','elastic','bounce'].forEach(e => {
      const opt = document.createElement('option'); opt.value = e; opt.textContent = e;
      if (e === 'easeInOut') opt.selected = true;
      easingSel.appendChild(opt);
    });
    easingSel.addEventListener('change', () => transitionEasing = easingSel.value);
    easingRow.appendChild(easingSel);
    container.appendChild(easingRow);

    const modeRow = document.createElement('div');
    modeRow.className = 'cp-slider-row';
    modeRow.innerHTML = '<label>Mode</label>';
    const modeSel = document.createElement('select');
    modeSel.style.cssText = easingSel.style.cssText;
    ['direct','chaos','wave'].forEach(m => {
      const opt = document.createElement('option'); opt.value = m; opt.textContent = m;
      modeSel.appendChild(opt);
    });
    modeSel.addEventListener('change', () => transitionMode = modeSel.value);
    modeRow.appendChild(modeSel);
    container.appendChild(modeRow);
  }

  function wireCodeEditor() {
    const runBtn = panel.querySelector('#cp-run-code');
    const codeArea = panel.querySelector('#cp-code');
    runBtn.addEventListener('click', () => {
      const code = codeArea.value.trim();
      if (code) send({ type: 'custom', code });
    });
    codeArea.addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const code = codeArea.value.trim();
        if (code) send({ type: 'custom', code });
      }
      // Tab support
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = codeArea.selectionStart, end = codeArea.selectionEnd;
        codeArea.value = codeArea.value.substring(0, start) + '  ' + codeArea.value.substring(end);
        codeArea.selectionStart = codeArea.selectionEnd = start + 2;
      }
    });
  }

  function wireResetBtn() {
    panel.querySelector('#cp-reset').addEventListener('click', () => send({ type: 'reset' }));
  }
}
