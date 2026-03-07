// Canvas Ribbons — animated background for Home Assistant
// https://gitlab.iwanus.eu/jiwanus/ha-canvas-ribbons
// Based on Boris Šehovac's CodePen (https://codepen.io/bsehovac/pen/LQVzxJ)

const VERSION = "1.1.0";

(function () {
  "use strict";

  const STORAGE_KEY = "ha-canvas-ribbons-config";
  const TAU = 2 * Math.PI;
  function rnd(a, b) { return b === undefined ? Math.random() * a : a + Math.random() * (b - a); }
  function rndSign() { return Math.random() > 0.5 ? 1 : -1; }
  function degToRad(d) { return (d * Math.PI) / 180; }

  class Line {
    constructor(wave, color) {
      const { angle, speed } = wave;
      this.angle = [
        Math.sin((angle[0] += speed[0])),
        Math.sin((angle[1] += speed[1])),
        Math.sin((angle[2] += speed[2])),
        Math.sin((angle[3] += speed[3])),
      ];
      this.color = color;
    }
  }

  class Wave {
    constructor(r) {
      const [lo, hi] = r.options.speed;
      this.ribbons = r;
      this.lines = [];
      this.angle = [rnd(TAU), rnd(TAU), rnd(TAU), rnd(TAU)];
      this.speed = [rnd(lo, hi) * rndSign(), rnd(lo, hi) * rndSign(), rnd(lo, hi) * rndSign(), rnd(lo, hi) * rndSign()];
    }
    update() {
      this.lines.push(new Line(this, this.ribbons.color));
      if (this.lines.length > this.ribbons.options.width) this.lines.shift();
    }
    draw(ctx) {
      const r = this.ribbons;
      const radius = r.radius, cx = r.cx, cy = r.cy, options = r.options;
      const r3 = radius / 3, rot = degToRad(options.rotation), amp = options.amplitude;
      for (const l of this.lines) {
        const a = l.angle;
        ctx.strokeStyle = l.color;
        ctx.beginPath();
        ctx.moveTo(cx - radius * Math.cos(a[0] * amp + rot), cy - radius * Math.sin(a[0] * amp + rot));
        ctx.bezierCurveTo(
          cx - r3 * Math.cos(a[1] * amp * 2), cy - r3 * Math.sin(a[1] * amp * 2),
          cx + r3 * Math.cos(a[2] * amp * 2), cy + r3 * Math.sin(a[2] * amp * 2),
          cx + radius * Math.cos(a[3] * amp + rot), cy + radius * Math.sin(a[3] * amp + rot)
        );
        ctx.stroke();
      }
    }
  }

  const DEFAULTS = {
    rotation: 45,
    waves: 3,
    width: 120,
    hue: [11, 14],
    amplitude: 0.5,
    speed: [0.004, 0.008],
    cardAlpha: 0.85,
    headerAlpha: 0.7,
    sidebarAlpha: 0.8,
  };

  // Load saved config from localStorage
  function loadConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function saveConfig(cfg) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  }

  // --- GUI ---
  function buildGUI(opts, state, reinit) {
    var panel = document.getElementById("ha-canvas-ribbons-gui");
    if (panel) { panel.style.display = panel.style.display === "none" ? "flex" : "none"; return; }

    var sliders = [
      { key: "waves",        label: "Wstegi",              min: 1,     max: 8,     step: 1,     val: opts.waves,        restart: true },
      { key: "width",        label: "Dlug. sladu",         min: 20,    max: 300,   step: 10,    val: opts.width         },
      { key: "rotation",     label: "Rotacja",             min: 0,     max: 360,   step: 5,     val: opts.rotation      },
      { key: "amplitude",    label: "Amplituda",           min: 0.1,   max: 2.0,   step: 0.1,   val: opts.amplitude     },
      { key: "speedMin",     label: "Predk. min",          min: 0.001, max: 0.02,  step: 0.001, val: opts.speed[0]      },
      { key: "speedMax",     label: "Predk. max",          min: 0.002, max: 0.04,  step: 0.001, val: opts.speed[1]      },
      { key: "hueMin",       label: "Hue min",             min: 0,     max: 30,    step: 1,     val: opts.hue[0]        },
      { key: "hueMax",       label: "Hue max",             min: 0,     max: 30,    step: 1,     val: opts.hue[1]        },
      { key: "cardAlpha",    label: "Karty alfa",          min: 0,     max: 1,     step: 0.05,  val: opts.cardAlpha     },
      { key: "headerAlpha",  label: "Header alfa",         min: 0,     max: 1,     step: 0.05,  val: opts.headerAlpha   },
      { key: "sidebarAlpha", label: "Sidebar alfa",        min: 0,     max: 1,     step: 0.05,  val: opts.sidebarAlpha  },
    ];

    panel = document.createElement("div");
    panel.id = "ha-canvas-ribbons-gui";
    panel.style.cssText =
      "position:fixed;top:50%;right:16px;transform:translateY(-50%);z-index:1000;" +
      "background:rgba(20,20,24,0.95);border:1px solid rgba(255,255,255,0.15);border-radius:12px;" +
      "padding:16px 18px;display:flex;flex-direction:column;gap:6px;pointer-events:auto;" +
      "font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#eee;font-size:12px;" +
      "min-width:240px;box-shadow:0 8px 32px rgba(0,0,0,0.6);backdrop-filter:blur(12px);";

    // Title bar
    var titleBar = document.createElement("div");
    titleBar.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;";
    var title = document.createElement("span");
    title.textContent = "Canvas Ribbons";
    title.style.cssText = "font-size:14px;font-weight:600;letter-spacing:0.3px;";
    var closeBtn = document.createElement("button");
    closeBtn.textContent = "\u2715";
    closeBtn.style.cssText = "background:none;border:none;color:#888;font-size:16px;cursor:pointer;padding:0 2px;";
    closeBtn.onclick = function () { panel.style.display = "none"; };
    titleBar.appendChild(title);
    titleBar.appendChild(closeBtn);
    panel.appendChild(titleBar);

    var valueDisplays = {};

    function updateStyle() {
      var s = document.getElementById("ha-canvas-ribbons-style");
      if (!s) return;
      var cA = "rgba(32,33,36," + opts.cardAlpha + ")";
      var hA = "rgba(32,33,36," + opts.headerAlpha + ")";
      var sA = "rgba(32,33,36," + opts.sidebarAlpha + ")";
      s.textContent =
        "html, body { background: #000 !important; }\n" +
        "home-assistant {\n" +
        "  --primary-background-color: transparent !important;\n" +
        "  --secondary-background-color: rgba(0,0,0,0.3) !important;\n" +
        "  --card-background-color: " + cA + " !important;\n" +
        "  --ha-card-background: " + cA + " !important;\n" +
        "  --app-header-background-color: " + hA + " !important;\n" +
        "  --sidebar-background-color: " + sA + " !important;\n" +
        "  --divider-color: rgba(255,255,255,0.08) !important;\n" +
        "}";
    }

    sliders.forEach(function (s) {
      var row = document.createElement("div");
      row.style.cssText = "display:flex;align-items:center;gap:8px;";

      var lbl = document.createElement("label");
      lbl.textContent = s.label;
      lbl.style.cssText = "min-width:90px;color:#aaa;font-size:11px;";

      var input = document.createElement("input");
      input.type = "range";
      input.min = s.min;
      input.max = s.max;
      input.step = s.step;
      input.value = s.val;
      input.style.cssText = "flex:1;accent-color:#6d8fff;height:4px;cursor:pointer;";

      var valSpan = document.createElement("span");
      valSpan.textContent = Number(s.val).toFixed(s.step < 1 ? String(s.step).split(".")[1].length : 0);
      valSpan.style.cssText = "min-width:36px;text-align:right;font-size:11px;color:#ccc;font-variant-numeric:tabular-nums;";
      valueDisplays[s.key] = valSpan;

      input.oninput = function () {
        var v = parseFloat(this.value);
        var decimals = s.step < 1 ? String(s.step).split(".")[1].length : 0;
        valSpan.textContent = v.toFixed(decimals);

        if (s.key === "speedMin") { opts.speed[0] = v; }
        else if (s.key === "speedMax") { opts.speed[1] = v; }
        else if (s.key === "hueMin") { opts.hue[0] = v; }
        else if (s.key === "hueMax") { opts.hue[1] = v; }
        else { opts[s.key] = v; }

        if (s.key === "cardAlpha" || s.key === "headerAlpha" || s.key === "sidebarAlpha") {
          updateStyle();
        }

        // Save to localStorage
        saveConfig({
          waves: opts.waves, width: opts.width, rotation: opts.rotation,
          amplitude: opts.amplitude, speed: [opts.speed[0], opts.speed[1]],
          hue: [opts.hue[0], opts.hue[1]], cardAlpha: opts.cardAlpha,
          headerAlpha: opts.headerAlpha, sidebarAlpha: opts.sidebarAlpha,
        });

        if (s.restart) {
          // Show restart hint
          var hint = document.getElementById("ribbon-restart-hint");
          if (!hint) {
            hint = document.createElement("div");
            hint.id = "ribbon-restart-hint";
            hint.style.cssText = "color:#f90;font-size:11px;text-align:center;padding:2px 0;";
            hint.textContent = "Odswiez strone (F5) aby zastosowac";
            panel.appendChild(hint);
          }
        }
      };

      row.appendChild(lbl);
      row.appendChild(input);
      row.appendChild(valSpan);
      panel.appendChild(row);
    });

    // Reset button
    var btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex;gap:8px;margin-top:6px;";

    var resetBtn = document.createElement("button");
    resetBtn.textContent = "Reset";
    resetBtn.style.cssText =
      "flex:1;padding:6px 0;border:1px solid rgba(255,255,255,0.15);border-radius:6px;" +
      "background:rgba(255,255,255,0.06);color:#ccc;cursor:pointer;font-size:11px;";
    resetBtn.onclick = function () {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    };
    btnRow.appendChild(resetBtn);
    panel.appendChild(btnRow);

    // Version
    var ver = document.createElement("div");
    ver.textContent = "v" + VERSION;
    ver.style.cssText = "text-align:center;color:#555;font-size:10px;margin-top:2px;";
    panel.appendChild(ver);

    document.body.appendChild(panel);
  }

  // --- Floating toggle button ---
  function createToggleButton(opts, state) {
    var btn = document.createElement("button");
    btn.id = "ha-canvas-ribbons-toggle";
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12c0 0 4-8 8-8s8 8 8 8-4 8-8 8-8-8-8-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    btn.style.cssText =
      "position:fixed;bottom:16px;right:16px;z-index:999;width:40px;height:40px;" +
      "border-radius:50%;border:1px solid rgba(255,255,255,0.15);background:rgba(20,20,24,0.8);" +
      "color:#6d8fff;cursor:pointer;display:flex;align-items:center;justify-content:center;" +
      "pointer-events:auto;box-shadow:0 2px 12px rgba(0,0,0,0.4);backdrop-filter:blur(8px);" +
      "transition:transform 0.15s,background 0.15s;";
    btn.onmouseenter = function () { btn.style.transform = "scale(1.1)"; btn.style.background = "rgba(40,40,48,0.9)"; };
    btn.onmouseleave = function () { btn.style.transform = "scale(1)"; btn.style.background = "rgba(20,20,24,0.8)"; };
    btn.onclick = function () { buildGUI(opts, state); };
    document.body.appendChild(btn);
  }

  // --- Main ---
  function createRibbonCanvas() {
    if (document.getElementById("ha-canvas-ribbons")) {
      console.info("[ha-canvas-ribbons] v" + VERSION + " already injected");
      return;
    }

    // Merge: defaults < localStorage < window config
    var saved = loadConfig();
    var windowCfg = window.canvasRibbonsConfig || {};
    var opts = Object.assign({}, DEFAULTS, saved, windowCfg);

    // Ensure arrays are proper
    if (!Array.isArray(opts.speed)) opts.speed = [DEFAULTS.speed[0], DEFAULTS.speed[1]];
    if (!Array.isArray(opts.hue)) opts.hue = [DEFAULTS.hue[0], DEFAULTS.hue[1]];

    // Container
    var container = document.createElement("div");
    container.id = "ha-canvas-ribbons";
    container.style.cssText =
      "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:0;pointer-events:none;";

    var canvas = document.createElement("canvas");
    container.appendChild(canvas);
    document.body.prepend(container);

    // Transparent HA theme
    var style = document.createElement("style");
    style.id = "ha-canvas-ribbons-style";
    function applyStyle() {
      var cA = "rgba(32,33,36," + opts.cardAlpha + ")";
      var hA = "rgba(32,33,36," + opts.headerAlpha + ")";
      var sA = "rgba(32,33,36," + opts.sidebarAlpha + ")";
      style.textContent =
        "html, body { background: #000 !important; }\n" +
        "home-assistant {\n" +
        "  --primary-background-color: transparent !important;\n" +
        "  --secondary-background-color: rgba(0,0,0,0.3) !important;\n" +
        "  --card-background-color: " + cA + " !important;\n" +
        "  --ha-card-background: " + cA + " !important;\n" +
        "  --app-header-background-color: " + hA + " !important;\n" +
        "  --sidebar-background-color: " + sA + " !important;\n" +
        "  --divider-color: rgba(255,255,255,0.08) !important;\n" +
        "}";
    }
    applyStyle();
    document.head.appendChild(style);

    // Canvas state
    var ctx = canvas.getContext("2d");
    var state = {
      hue: opts.hue[0], hueFw: true, color: "rgba(128,128,128,0.1)",
      w: 0, h: 0, cx: 0, cy: 0, radius: 0, gradient: null, lastColor: null,
      options: opts,
    };

    function resize() {
      var s = Math.min(window.devicePixelRatio || 1, 1.25);
      var w = window.innerWidth, h = window.innerHeight;
      canvas.width = w * s;
      canvas.height = h * s;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      state.w = canvas.width;
      state.h = canvas.height;
      state.cx = state.w / 2;
      state.cy = state.h / 2;
      state.radius = Math.sqrt(state.w * state.w + state.h * state.h) / 2;
      state.gradient = null;
    }

    resize();
    window.addEventListener("resize", resize);

    // Waves
    var waves = [];
    for (var i = 0; i < opts.waves; i++) waves.push(new Wave(state));

    function updateColor() {
      state.hue += state.hueFw ? 0.01 : -0.01;
      if (state.hue > opts.hue[1]) { state.hue = opts.hue[1]; state.hueFw = false; }
      else if (state.hue < opts.hue[0]) { state.hue = opts.hue[0]; state.hueFw = true; }
      var r = Math.floor(127 * Math.sin(0.3 * state.hue) + 128);
      var g = Math.floor(127 * Math.sin(0.3 * state.hue + 2) + 128);
      var b = Math.floor(127 * Math.sin(0.3 * state.hue + 4) + 128);
      state.color = "rgba(" + r + "," + g + "," + b + ",0.1)";
    }

    // Preload
    for (var i = 0; i < opts.waves; i++) {
      updateColor();
      for (var j = 0; j < opts.width; j++) waves[i].update();
    }

    function render() {
      updateColor();
      ctx.clearRect(0, 0, state.w, state.h);

      if (!state.gradient || state.lastColor !== state.color) {
        state.gradient = ctx.createLinearGradient(0, 0, 0, state.h);
        state.gradient.addColorStop(0, "#000");
        state.gradient.addColorStop(1, state.color);
        state.lastColor = state.color;
      }
      ctx.fillStyle = state.gradient;
      ctx.fillRect(0, 0, state.w, state.h);

      ctx.lineWidth = 1;
      for (var k = 0; k < waves.length; k++) { waves[k].update(); waves[k].draw(ctx); }
      requestAnimationFrame(render);
    }

    render();

    // GUI toggle button
    createToggleButton(opts, state);

    console.info("[ha-canvas-ribbons] v" + VERSION + " loaded — " + opts.waves + " waves, width " + opts.width);
  }

  if (document.body) {
    createRibbonCanvas();
  } else {
    document.addEventListener("DOMContentLoaded", createRibbonCanvas);
  }
})();
