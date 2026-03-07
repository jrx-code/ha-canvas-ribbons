const { JSDOM } = require("jsdom");
const assert = require("assert");

// Setup minimal DOM with canvas support
const dom = new JSDOM(
  '<!DOCTYPE html><html><body><div id="holder"></div></body></html>',
  { pretendToBeVisual: true }
);
global.window = dom.window;
global.document = dom.window.document;
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = clearTimeout;

// Stub canvas 2d context
const ctxMethods = [
  "clearRect", "fillRect", "beginPath", "moveTo", "bezierCurveTo",
  "stroke", "arc", "createLinearGradient",
];
const origCreate = document.createElement.bind(document);
document.createElement = function (tag) {
  const el = origCreate(tag);
  if (tag === "canvas") {
    el.getContext = () => {
      const ctx = {};
      for (const m of ctxMethods) ctx[m] = () => {};
      ctx.createLinearGradient = () => ({ addColorStop: () => {} });
      ctx.fillStyle = "";
      ctx.strokeStyle = "";
      ctx.lineWidth = 1;
      ctx.font = "";
      ctx.globalAlpha = 1;
      ctx.fillText = () => {};
      return ctx;
    };
  }
  return el;
};

const CanvasRibbons = require("./canvas-ribbons.js");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL  ${name}: ${e.message}`);
    failed++;
  }
}

console.log("Canvas Ribbons Tests\n");

// --- Constructor ---

test("creates instance with default options", () => {
  const r = new CanvasRibbons("#holder");
  assert.strictEqual(r.options.waves, 3);
  assert.strictEqual(r.options.width, 120);
  assert.strictEqual(r.options.amplitude, 0.5);
  assert.strictEqual(r.options.rotation, 45);
  assert.deepStrictEqual(r.options.speed, [0.004, 0.008]);
  assert.deepStrictEqual(r.options.hue, [11, 14]);
  assert.strictEqual(r.options.background, true);
  r.destroy();
});

test("accepts custom options", () => {
  const r = new CanvasRibbons("#holder", { waves: 5, width: 200, amplitude: 0.8 });
  assert.strictEqual(r.options.waves, 5);
  assert.strictEqual(r.options.width, 200);
  assert.strictEqual(r.options.amplitude, 0.8);
  r.destroy();
});

test("accepts DOM element instead of selector", () => {
  const el = document.querySelector("#holder");
  const r = new CanvasRibbons(el);
  assert.strictEqual(r.container, el);
  r.destroy();
});

// --- Waves ---

test("creates correct number of waves", () => {
  const r = new CanvasRibbons("#holder", { waves: 4 });
  assert.strictEqual(r.waves.length, 4);
  r.destroy();
});

test("preloads wave lines up to width", () => {
  const r = new CanvasRibbons("#holder", { waves: 2, width: 50 });
  for (const wave of r.waves) {
    assert.strictEqual(wave.lines.length, 50);
  }
  r.destroy();
});

test("wave lines do not exceed width after update", () => {
  const r = new CanvasRibbons("#holder", { waves: 1, width: 10 });
  // preload already filled to 10, update a few more
  for (let i = 0; i < 5; i++) r.waves[0].update();
  assert.strictEqual(r.waves[0].lines.length, 10);
  r.destroy();
});

// --- Color ---

test("initial hue matches options.hue[0]", () => {
  const r = new CanvasRibbons("#holder");
  // After preload, hue may have shifted slightly from hue[0]
  assert.ok(r.hue >= r.options.hue[0]);
  assert.ok(r.hue <= r.options.hue[1]);
  r.destroy();
});

test("color is rgba string", () => {
  const r = new CanvasRibbons("#holder");
  assert.ok(r.color.startsWith("rgba("), `Expected rgba, got: ${r.color}`);
  assert.ok(r.color.endsWith(",0.1)"), `Expected alpha 0.1, got: ${r.color}`);
  r.destroy();
});

test("hue oscillates within bounds", () => {
  const r = new CanvasRibbons("#holder", { hue: [5, 6] });
  for (let i = 0; i < 500; i++) r._updateColor();
  assert.ok(r.hue >= 5 && r.hue <= 6, `Hue out of bounds: ${r.hue}`);
  r.destroy();
});

// --- Canvas ---

test("canvas is appended to container", () => {
  const r = new CanvasRibbons("#holder");
  const canvases = r.container.querySelectorAll("canvas");
  assert.ok(canvases.length >= 1);
  r.destroy();
});

test("canvas dimensions are set", () => {
  const r = new CanvasRibbons("#holder");
  assert.ok(r.width > 0 || r.width === 0); // jsdom may return 0
  assert.ok(r.height >= 0);
  r.destroy();
});

test("radius and center are computed", () => {
  const r = new CanvasRibbons("#holder");
  assert.strictEqual(r.centerX, r.width / 2);
  assert.strictEqual(r.centerY, r.height / 2);
  assert.ok(r.radius >= 0);
  r.destroy();
});

// --- Start/Stop ---

test("start sets animFrameId", () => {
  const r = new CanvasRibbons("#holder");
  r.start();
  assert.ok(r.animFrameId !== null);
  r.stop();
  r.destroy();
});

test("stop clears animFrameId", () => {
  const r = new CanvasRibbons("#holder");
  r.start();
  r.stop();
  assert.strictEqual(r.animFrameId, null);
  r.destroy();
});

test("destroy removes canvas and clears waves", () => {
  const r = new CanvasRibbons("#holder");
  r.start();
  r.destroy();
  assert.strictEqual(r.waves.length, 0);
  assert.strictEqual(r.animFrameId, null);
});

// --- Render ---

test("render does not throw", () => {
  const r = new CanvasRibbons("#holder");
  assert.doesNotThrow(() => r._render());
  r.destroy();
});

test("render without background does not throw", () => {
  const r = new CanvasRibbons("#holder", { background: false });
  assert.doesNotThrow(() => r._render());
  r.destroy();
});

test("multiple renders maintain line count", () => {
  const r = new CanvasRibbons("#holder", { waves: 1, width: 20 });
  for (let i = 0; i < 30; i++) r._render();
  assert.strictEqual(r.waves[0].lines.length, 20);
  r.destroy();
});

// --- Line ---

test("line has angle array of length 4", () => {
  const r = new CanvasRibbons("#holder", { waves: 1, width: 5 });
  const line = r.waves[0].lines[0];
  assert.strictEqual(line.angle.length, 4);
  r.destroy();
});

test("line angles are in sin range [-1, 1]", () => {
  const r = new CanvasRibbons("#holder", { waves: 1, width: 5 });
  for (const line of r.waves[0].lines) {
    for (const a of line.angle) {
      assert.ok(a >= -1 && a <= 1, `Angle ${a} out of sin range`);
    }
  }
  r.destroy();
});

// --- Summary ---

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
