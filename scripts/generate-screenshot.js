const { createCanvas } = require("canvas");
const fs = require("fs");

const TAU = 2 * Math.PI;
function rnd(a, b) { return b === undefined ? Math.random() * a : a + Math.random() * (b - a); }
function rndSign() { return Math.random() > 0.5 ? 1 : -1; }
function degToRad(d) { return (d * Math.PI) / 180; }

const W = 1280, H = 720;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

const opts = { rotation: 45, waves: 3, width: 120, hue: [11, 14], amplitude: 0.5, speed: [0.004, 0.008] };

const state = {
  hue: opts.hue[0], hueFw: true, color: "rgba(128,128,128,0.1)",
  cx: W / 2, cy: H / 2,
  radius: Math.sqrt(W * W + H * H) / 2,
  options: opts,
};

function updateColor() {
  state.hue += state.hueFw ? 0.01 : -0.01;
  if (state.hue > opts.hue[1]) { state.hue = opts.hue[1]; state.hueFw = false; }
  else if (state.hue < opts.hue[0]) { state.hue = opts.hue[0]; state.hueFw = true; }
  const r = Math.floor(127 * Math.sin(0.3 * state.hue) + 128);
  const g = Math.floor(127 * Math.sin(0.3 * state.hue + 2) + 128);
  const b = Math.floor(127 * Math.sin(0.3 * state.hue + 4) + 128);
  state.color = "rgba(" + r + "," + g + "," + b + ",0.1)";
}

class Wave {
  constructor() {
    const [lo, hi] = opts.speed;
    this.lines = [];
    this.angle = [rnd(TAU), rnd(TAU), rnd(TAU), rnd(TAU)];
    this.speed = [rnd(lo, hi) * rndSign(), rnd(lo, hi) * rndSign(), rnd(lo, hi) * rndSign(), rnd(lo, hi) * rndSign()];
  }
  update() {
    const a = this.angle, s = this.speed;
    this.lines.push({
      angle: [Math.sin(a[0] += s[0]), Math.sin(a[1] += s[1]), Math.sin(a[2] += s[2]), Math.sin(a[3] += s[3])],
      color: state.color,
    });
    if (this.lines.length > opts.width) this.lines.shift();
  }
  draw() {
    const { radius, cx, cy } = state;
    const r3 = radius / 3, rot = degToRad(opts.rotation), amp = opts.amplitude;
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

const waves = [];
for (let i = 0; i < opts.waves; i++) waves.push(new Wave());

// Preload
for (let i = 0; i < opts.waves; i++) {
  updateColor();
  for (let j = 0; j < opts.width; j++) waves[i].update();
}

// Render several frames
for (let frame = 0; frame < 200; frame++) {
  updateColor();
  ctx.clearRect(0, 0, W, H);

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#000");
  grad.addColorStop(1, state.color);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.lineWidth = 1;
  for (const w of waves) { w.update(); w.draw(); }
}

// Save
const out = fs.createWriteStream("screenshots/preview.png");
const stream = canvas.createPNGStream();
stream.pipe(out);
out.on("finish", () => console.log("Screenshot saved: screenshots/preview.png (" + fs.statSync("screenshots/preview.png").size + " bytes)"));
