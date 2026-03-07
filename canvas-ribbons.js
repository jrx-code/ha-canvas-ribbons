"use strict";

/**
 * Canvas Ribbons - animated ribbon background
 * Based on Boris Šehovac's CodePen (https://codepen.io/bsehovac/pen/LQVzxJ)
 * Rewritten as clean, standalone ES module
 */

const TAU = 2 * Math.PI;

function rnd(a, b) {
  return b === undefined ? Math.random() * a : a + Math.random() * (b - a);
}

function rndSign() {
  return Math.random() > 0.5 ? 1 : -1;
}

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

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
  constructor(ribbons) {
    const [minSpeed, maxSpeed] = ribbons.options.speed;
    this.ribbons = ribbons;
    this.lines = [];
    this.angle = [rnd(TAU), rnd(TAU), rnd(TAU), rnd(TAU)];
    this.speed = [
      rnd(minSpeed, maxSpeed) * rndSign(),
      rnd(minSpeed, maxSpeed) * rndSign(),
      rnd(minSpeed, maxSpeed) * rndSign(),
      rnd(minSpeed, maxSpeed) * rndSign(),
    ];
  }

  update() {
    this.lines.push(new Line(this, this.ribbons.color));
    if (this.lines.length > this.ribbons.options.width) {
      this.lines.shift();
    }
  }

  draw(ctx) {
    const { radius, centerX, centerY, options } = this.ribbons;
    const r3 = radius / 3;
    const rotation = degToRad(options.rotation);
    const amp = options.amplitude;

    for (const line of this.lines) {
      const a = line.angle;
      const x1 = centerX - radius * Math.cos(a[0] * amp + rotation);
      const y1 = centerY - radius * Math.sin(a[0] * amp + rotation);
      const x2 = centerX + radius * Math.cos(a[3] * amp + rotation);
      const y2 = centerY + radius * Math.sin(a[3] * amp + rotation);
      const cx1 = centerX - r3 * Math.cos(a[1] * amp * 2);
      const cy1 = centerY - r3 * Math.sin(a[1] * amp * 2);
      const cx2 = centerX + r3 * Math.cos(a[2] * amp * 2);
      const cy2 = centerY + r3 * Math.sin(a[2] * amp * 2);

      ctx.strokeStyle = line.color;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
      ctx.stroke();
    }
  }
}

class CanvasRibbons {
  constructor(container, options = {}) {
    this.options = {
      rotation: 45,
      waves: 3,
      width: 120,
      hue: [11, 14],
      amplitude: 0.5,
      background: true,
      speed: [0.004, 0.008],
      ...options,
    };

    this.container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.container.appendChild(this.canvas);

    this.hue = this.options.hue[0];
    this.hueForward = true;
    this.waves = [];
    this.animFrameId = null;
    this.gradient = null;
    this.lastColor = null;

    this._resize();
    this._init();

    this._onResize = () => this._resize();
    window.addEventListener("resize", this._onResize);
  }

  _init() {
    for (let i = 0; i < this.options.waves; i++) {
      this.waves.push(new Wave(this));
    }
    // preload
    for (let i = 0; i < this.options.waves; i++) {
      this._updateColor();
      for (let j = 0; j < this.options.width; j++) {
        this.waves[i].update();
      }
    }
  }

  _resize() {
    const rect = this.container.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;
    const scale = Math.min(window.devicePixelRatio || 1, 1.25);

    this.width = w * scale;
    this.height = h * scale;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.radius =
      Math.sqrt(this.width * this.width + this.height * this.height) / 2;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.gradient = null;
  }

  _updateColor() {
    this.hue += this.hueForward ? 0.01 : -0.01;
    const [lo, hi] = this.options.hue;

    if (this.hue > hi && this.hueForward) {
      this.hue = hi;
      this.hueForward = false;
    } else if (this.hue < lo && !this.hueForward) {
      this.hue = lo;
      this.hueForward = true;
    }

    const r = Math.floor(127 * Math.sin(0.3 * this.hue) + 128);
    const g = Math.floor(127 * Math.sin(0.3 * this.hue + 2) + 128);
    const b = Math.floor(127 * Math.sin(0.3 * this.hue + 4) + 128);
    this.color = `rgba(${r},${g},${b},0.1)`;
  }

  _drawBackground() {
    if (!this.gradient || this.lastColor !== this.color) {
      this.gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
      this.gradient.addColorStop(0, "#000");
      this.gradient.addColorStop(1, this.color);
      this.lastColor = this.color;
    }
    this.ctx.fillStyle = this.gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  _render() {
    this._updateColor();
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.options.background) {
      this._drawBackground();
    }

    this.ctx.lineWidth = 1;
    for (const wave of this.waves) {
      wave.update();
      wave.draw(this.ctx);
    }
  }

  start() {
    const loop = () => {
      this._render();
      this.animFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener("resize", this._onResize);
    this.canvas.remove();
    this.waves = [];
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = CanvasRibbons;
}
