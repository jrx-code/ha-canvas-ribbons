// Canvas Ribbons — HA background injection
// Lovelace resource: /local/canvas-ribbons/ha-ribbon-bg.js

(function () {
  "use strict";

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
      const radius = r.radius, cx = r.cx || r.centerX, cy = r.cy || r.centerY, options = r.options;
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

  const OPTS = { rotation: 45, waves: 3, width: 120, hue: [11, 14], amplitude: 0.5, speed: [0.004, 0.008] };

  function createRibbonCanvas() {
    // Prevent double injection
    if (document.getElementById("ribbon-bg-container")) {
      console.log("[ha-ribbon-bg] Already injected, skipping");
      return;
    }

    // Create fixed container on document.body — simplest, most reliable
    const container = document.createElement("div");
    container.id = "ribbon-bg-container";
    container.style.cssText =
      "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:0;pointer-events:none;";

    const canvas = document.createElement("canvas");
    container.appendChild(canvas);
    document.body.prepend(container);

    // Make HA background transparent
    const style = document.createElement("style");
    style.textContent = `
      html, body {
        background: #000 !important;
      }
      home-assistant {
        --primary-background-color: transparent !important;
        --secondary-background-color: rgba(0,0,0,0.3) !important;
        --card-background-color: rgba(32,33,36,0.85) !important;
        --ha-card-background: rgba(32,33,36,0.85) !important;
        --app-header-background-color: rgba(32,33,36,0.7) !important;
        --sidebar-background-color: rgba(32,33,36,0.8) !important;
        --divider-color: rgba(255,255,255,0.08) !important;
      }
    `;
    document.head.appendChild(style);

    const ctx = canvas.getContext("2d");

    const state = {
      hue: OPTS.hue[0], hueFw: true, color: "rgba(128,128,128,0.1)",
      w: 0, h: 0, cx: 0, cy: 0, radius: 0, gradient: null, lastColor: null,
      options: OPTS,
    };

    function resize() {
      const s = Math.min(window.devicePixelRatio || 1, 1.25);
      const w = window.innerWidth, h = window.innerHeight;
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

    const waves = [];
    for (let i = 0; i < OPTS.waves; i++) waves.push(new Wave(state));

    function updateColor() {
      state.hue += state.hueFw ? 0.01 : -0.01;
      if (state.hue > OPTS.hue[1]) { state.hue = OPTS.hue[1]; state.hueFw = false; }
      else if (state.hue < OPTS.hue[0]) { state.hue = OPTS.hue[0]; state.hueFw = true; }
      const r = Math.floor(127 * Math.sin(0.3 * state.hue) + 128);
      const g = Math.floor(127 * Math.sin(0.3 * state.hue + 2) + 128);
      const b = Math.floor(127 * Math.sin(0.3 * state.hue + 4) + 128);
      state.color = "rgba(" + r + "," + g + "," + b + ",0.1)";
    }

    // Preload
    for (let i = 0; i < OPTS.waves; i++) {
      updateColor();
      for (let j = 0; j < OPTS.width; j++) waves[i].update();
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
      for (const w of waves) { w.update(); w.draw(ctx); }
      requestAnimationFrame(render);
    }

    render();
    console.log("[ha-ribbon-bg] Canvas ribbons injected successfully");
  }

  // Wait for DOM ready, then inject
  function init() {
    if (document.body) {
      createRibbonCanvas();
    } else {
      document.addEventListener("DOMContentLoaded", createRibbonCanvas);
    }
  }

  // HA loads resources after frontend is ready, so body should exist
  init();
})();
